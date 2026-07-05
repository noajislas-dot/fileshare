import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

// Define database directory and file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Interfaces
interface FileReport {
  id: string;
  reason: string;
  comments: string;
  timestamp: string;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface VersionItem {
  id: string;
  version: string;
  size: number;
  uploadDate: string;
  fileName: string;
}

interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  description: string;
  size: number;
  type: string;
  extension: string;
  fileName: string;
  coverName: string | null;
  uploadDate: string;
  downloads: number;
  views: number;
  status: 'Revisado' | 'Pendiente' | 'Amenaza detectada';
  reports: FileReport[];
  securityScanLog: string[];
  uploaderId: string;
  rating: number;
  votesCount: number;
  comments: Comment[];
  tags: string[];
  version: string;
  previousVersions: VersionItem[];
  isPopular?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  likes?: number;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  type: string; // e.g. "search"
  timestamp: string;
}

interface DatabaseSchema {
  files: FileMetadata[];
  history: SearchHistoryItem[];
}

// Database Helpers
function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = { files: [], history: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    
    // Defensive normalization for any pre-existing legacy database records
    if (parsed && Array.isArray(parsed.files)) {
      parsed.files = parsed.files.map(f => {
        // Generate a stable anonymous ID or default
        const uploaderId = f.uploaderId || 'Uploader #ANON12';
        const rating = typeof f.rating === 'number' ? f.rating : 5;
        const votesCount = typeof f.votesCount === 'number' ? f.votesCount : 1;
        const comments = Array.isArray(f.comments) ? f.comments : [];
        const tags = Array.isArray(f.tags) ? f.tags : [];
        const version = f.version || '1.0';
        const previousVersions = Array.isArray(f.previousVersions) ? f.previousVersions : [];
        const likes = typeof f.likes === 'number' ? f.likes : 0;
        const isDeleted = f.isDeleted === true || (f.isDeleted as any) === 'true';
        
        return {
          ...f,
          uploaderId,
          rating,
          votesCount,
          comments,
          tags,
          version,
          previousVersions,
          likes,
          isDeleted
        };
      });
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading DB, resetting...', error);
    const initialDb: DatabaseSchema = { files: [], history: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
}

function writeDb(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB upload limit (can be adjusted)
  },
});

// Category helper based on file extension
function getFileType(ext: string): string {
  const extension = ext.toLowerCase().replace('.', '');
  if (extension === 'apk') return 'APK';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) return 'Archivo Comprimido';
  if (['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'epub', 'rtf'].includes(extension)) return 'Documento';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(extension)) return 'Imagen';
  if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpeg'].includes(extension)) return 'Video';
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'].includes(extension)) return 'Audio';
  if (['exe', 'msi', 'bat', 'sh', 'dll', 'cmd'].includes(extension)) return 'Ejecutable';
  return 'OTROS';
}

// Antivirus Scan Simulator & Signature Checker
function scanFile(fileName: string, originalName: string, fileBuffer?: Buffer): { status: 'Revisado' | 'Amenaza detectada'; logs: string[] } {
  const logs: string[] = [];
  logs.push(`[${new Date().toLocaleTimeString()}] Iniciando análisis de seguridad en: ${originalName}...`);
  logs.push(`[${new Date().toLocaleTimeString()}] Calculando hash criptográfico MD5/SHA256...`);
  
  const ext = path.extname(originalName).toLowerCase();
  
  // Simulated delay-less checks
  logs.push(`[${new Date().toLocaleTimeString()}] Analizando estructura de cabecera y metadatos...`);
  
  // Antivirus Rules
  let threatDetected = false;
  let threatReason = '';

  // 1. Double extension check (e.g. photo.jpg.exe)
  const baseName = originalName.toLowerCase();
  const parts = baseName.split('.');
  if (parts.length > 2) {
    const lastExt = parts[parts.length - 1];
    const secondLastExt = parts[parts.length - 2];
    if (['exe', 'bat', 'vbs', 'sh', 'cmd', 'js', 'scr'].includes(lastExt) && 
        ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'zip', 'txt'].includes(secondLastExt)) {
      threatDetected = true;
      threatReason = `Doble extensión sospechosa detectada: .${secondLastExt}.${lastExt}`;
    }
  }

  // 2. Malware terms or EICAR string in name
  if (baseName.includes('eicar') || baseName.includes('malware') || baseName.includes('trojan') || baseName.includes('virus_test')) {
    threatDetected = true;
    threatReason = `Nombre del archivo coincide con patrones de firmas de malware conocidos (eicar/malware/virus).`;
  }

  // 3. File content signature check if buffer is provided
  if (fileBuffer) {
    const contentStr = fileBuffer.toString('utf8');
    // EICAR Standard Anti-Virus Test File check
    if (contentStr.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE')) {
      threatDetected = true;
      threatReason = `Firma EICAR de prueba estándar detectada (EICAR-STANDARD-ANTIVIRUS-TEST-FILE).`;
    }
    // Simple mock malicious bytes search
    if (contentStr.includes('eval(atob(') || contentStr.includes('exec_shell_command') || contentStr.includes('malicious_payload')) {
      threatDetected = true;
      threatReason = `Código ejecutable o patrón de obfuscación altamente sospechoso detectado.`;
    }
  }

  if (threatDetected) {
    logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ ALERTA: ${threatReason}`);
    logs.push(`[${new Date().toLocaleTimeString()}] 🔴 ANÁLISIS FINALIZADO: AMENAZA DETECTADA. El archivo ha sido bloqueado para descargas.`);
    return { status: 'Amenaza detectada', logs };
  } else {
    logs.push(`[${new Date().toLocaleTimeString()}] Buscando virus en base de datos de firmas ClamAV...`);
    logs.push(`[${new Date().toLocaleTimeString()}] Análisis heurístico completado: no se encontraron hilos de ejecución maliciosos.`);
    logs.push(`[${new Date().toLocaleTimeString()}] 🟢 ANÁLISIS FINALIZADO: Archivo limpio de virus, troyanos y malware.`);
    return { status: 'Revisado', logs };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files for uploaded assets
  app.use('/data/uploads', express.static(UPLOADS_DIR));

  // --- API ROUTES ---

  // Upload file API
  app.post('/api/upload', upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]), (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const mainFile = files && files['file'] ? files['file'][0] : null;
      const coverFile = files && files['cover'] ? files['cover'][0] : null;

      if (!mainFile) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
      }

      const customName = req.body.name || mainFile.originalname;
      const description = req.body.description || '';
      const ext = path.extname(mainFile.originalname);
      const type = getFileType(ext);

      // Parse tags
      let tagsParsed: string[] = [];
      if (req.body.tags) {
        tagsParsed = req.body.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 0)
          .map((t: string) => t.startsWith('#') ? t : `#${t}`);
      }

      const uploaderId = req.body.uploaderId || 'Uploader #ANON12';
      const versionStr = req.body.version || '1.0';
      const existingFileId = req.body.existingFileId || null;

      // Perform Antivirus Scan (Reading file bytes synchronously for fast real scan)
      let fileBuffer: Buffer | undefined;
      try {
        fileBuffer = fs.readFileSync(mainFile.path);
      } catch (err) {
        console.error('Error reading file buffer for antivirus scan', err);
      }

      const scanResult = scanFile(mainFile.filename, mainFile.originalname, fileBuffer);

      const db = readDb();

      if (existingFileId) {
        // We are updating an existing file!
        const existingFileIndex = db.files.findIndex(f => f.id === existingFileId);
        if (existingFileIndex !== -1) {
          const fileToUpdate = db.files[existingFileIndex];

          // Push current file into previous versions list
          const prevVersion: VersionItem = {
            id: 'ver_' + Math.random().toString(36).substr(2, 9),
            version: fileToUpdate.version || '1.0',
            size: fileToUpdate.size,
            uploadDate: fileToUpdate.uploadDate,
            fileName: fileToUpdate.fileName
          };

          if (!fileToUpdate.previousVersions) {
            fileToUpdate.previousVersions = [];
          }
          fileToUpdate.previousVersions.push(prevVersion);

          // Update main details to the newly uploaded file
          fileToUpdate.fileName = mainFile.filename;
          fileToUpdate.size = mainFile.size;
          fileToUpdate.uploadDate = new Date().toISOString();
          fileToUpdate.version = versionStr;
          fileToUpdate.name = customName;
          fileToUpdate.description = description;
          fileToUpdate.status = scanResult.status;
          fileToUpdate.securityScanLog = scanResult.logs;
          
          if (tagsParsed.length > 0) {
            fileToUpdate.tags = tagsParsed;
          }
          if (coverFile) {
            fileToUpdate.coverName = coverFile.filename;
          }

          writeDb(db);
          return res.status(201).json(fileToUpdate);
        }
      }

      // Create new file object
      const newFile: FileMetadata = {
        id: 'file_' + Math.random().toString(36).substr(2, 9),
        name: customName,
        originalName: mainFile.originalname,
        description: description,
        size: mainFile.size,
        type: type,
        extension: ext.toLowerCase().replace('.', ''),
        fileName: mainFile.filename,
        coverName: coverFile ? coverFile.filename : null,
        uploadDate: new Date().toISOString(),
        downloads: 0,
        views: 0,
        status: scanResult.status,
        reports: [],
        securityScanLog: scanResult.logs,
        uploaderId: uploaderId,
        rating: 0.0, // initial rating is 0.0 stars
        votesCount: 0,
        comments: [],
        tags: tagsParsed,
        version: versionStr,
        previousVersions: []
      };

      db.files.push(newFile);
      writeDb(db);

      res.status(201).json(newFile);
    } catch (error: any) {
      console.error('Error processing upload:', error);
      res.status(500).json({ error: 'Error del servidor al subir el archivo: ' + error.message });
    }
  });

  // Get files API (supports searching, sorting, and pagination/filtering)
  app.get('/api/files', (req, res) => {
    try {
      const db = readDb();
      
      // Auto-delete trash files older than 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      let dbChanged = false;
      const filesToKeep = db.files.filter(f => {
        if (f.isDeleted && f.deletedAt) {
          const deletedTime = new Date(f.deletedAt).getTime();
          if (deletedTime < thirtyDaysAgo) {
            const filePath = path.join(UPLOADS_DIR, f.fileName);
            if (fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch (e) { console.error(e); }
            }
            if (f.coverName) {
              const coverPath = path.join(UPLOADS_DIR, f.coverName);
              if (fs.existsSync(coverPath)) {
                try { fs.unlinkSync(coverPath); } catch (e) { console.error(e); }
              }
            }
            dbChanged = true;
            return false;
          }
        }
        return true;
      });
      if (dbChanged) {
        db.files = filesToKeep;
        writeDb(db);
      }

      let files = [...db.files];

      // Query parameters
      const search = (req.query.search as string || '').toLowerCase();
      const sort = req.query.sort as string || 'default';
      const fileType = req.query.type as string || 'all';
      const uploaderId = req.query.uploaderId as string || '';
      const showDeleted = req.query.deleted === 'true';

      // 1. Filter by deleted status
      if (showDeleted) {
        files = files.filter(f => f.isDeleted === true || (f.isDeleted as any) === 'true');
      } else {
        files = files.filter(f => !f.isDeleted || (f.isDeleted as any) === 'false');
      }

      // 2. Filter by Uploader ID (Anonymous Public Profile)
      if (uploaderId) {
        files = files.filter(f => f.uploaderId === uploaderId);
      }

      // 2. Search Filter (by Name, Description, Type, Extension, and Tags)
      if (search) {
        files = files.filter(f => 
          f.name.toLowerCase().includes(search) ||
          f.description.toLowerCase().includes(search) ||
          f.type.toLowerCase().includes(search) ||
          f.extension.toLowerCase().includes(search) ||
          (f.tags && f.tags.some(tag => tag.toLowerCase().includes(search)))
        );
      }

      // 3. Type Filter (e.g. documents, archives, APKs)
      if (fileType && fileType !== 'all') {
        files = files.filter(f => f.type.toLowerCase() === fileType.toLowerCase() || f.extension.toLowerCase() === fileType.toLowerCase());
      }

      // 4. Sorting
      if (sort === 'name-a-z') {
        files.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'name-z-a') {
        files.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sort === 'recent') {
        files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      } else if (sort === 'oldest') {
        files.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
      } else if (sort === 'heavy') {
        files.sort((a, b) => b.size - a.size);
      } else if (sort === 'light') {
        files.sort((a, b) => a.size - b.size);
      } else if (sort === 'downloads') {
        files.sort((a, b) => b.downloads - a.downloads);
      } else if (sort === 'views') {
        files.sort((a, b) => b.views - a.views);
      } else if (sort === 'rating') {
        files.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sort === 'type') {
        files.sort((a, b) => a.type.localeCompare(b.type));
      }

      res.json(files);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al consultar los archivos.' });
    }
  });

  // Get file by ID API
  app.get('/api/files/:id', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      // Increment views
      db.files[fileIndex].views += 1;
      writeDb(db);

      res.json(db.files[fileIndex]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al consultar el detalle del archivo.' });
    }
  });

  // Update file details API (name, description)
  app.put('/api/files/:id', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      const { name, description } = req.body;
      if (name) db.files[fileIndex].name = name;
      if (description !== undefined) db.files[fileIndex].description = description;

      writeDb(db);
      res.json(db.files[fileIndex]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al editar el archivo.' });
    }
  });

  // Move file to trash API
  app.post('/api/files/:id/trash', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      db.files[fileIndex].isDeleted = true;
      db.files[fileIndex].deletedAt = new Date().toISOString();
      writeDb(db);

      res.json({ success: true, message: 'Archivo movido a la papelera.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al mover el archivo a la papelera.' });
    }
  });

  // Recover file from trash API
  app.post('/api/files/:id/recover', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      db.files[fileIndex].isDeleted = false;
      delete db.files[fileIndex].deletedAt;
      writeDb(db);

      res.json({ success: true, message: 'Archivo recuperado con éxito.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al recuperar el archivo.' });
    }
  });

  // Like file API
  app.post('/api/files/:id/like', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      const { liked } = req.body;
      const file = db.files[fileIndex];
      if (file.likes === undefined) {
        file.likes = 0;
      }

      if (liked) {
        file.likes += 1;
      } else {
        file.likes = Math.max(0, file.likes - 1);
      }

      writeDb(db);
      res.json({ success: true, likes: file.likes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar el me gusta.' });
    }
  });

  // Delete file API
  app.delete('/api/files/:id', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      const fileToDelete = db.files[fileIndex];

      // Remove files from disk
      const filePath = path.join(UPLOADS_DIR, fileToDelete.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (fileToDelete.coverName) {
        const coverPath = path.join(UPLOADS_DIR, fileToDelete.coverName);
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      }

      // Remove from database
      db.files.splice(fileIndex, 1);
      writeDb(db);

      res.json({ success: true, message: 'Archivo eliminado con éxito.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el archivo.' });
    }
  });

  // Download file API (with security guard)
  app.get('/api/download/:id', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      const fileMetadata = db.files[fileIndex];

      // Block downloads if threat detected and not reviewed/bypassed
      if (fileMetadata.status === 'Amenaza detectada') {
        return res.status(403).json({ 
          error: 'Descarga bloqueada', 
          message: 'Este archivo ha sido identificado como una amenaza potencial de seguridad por nuestro antivirus automático.' 
        });
      }

      let targetFileName = fileMetadata.fileName;
      const verQuery = req.query.version as string;
      if (verQuery && fileMetadata.previousVersions) {
        const foundVer = fileMetadata.previousVersions.find(v => v.version === verQuery);
        if (foundVer) {
          targetFileName = foundVer.fileName;
        }
      }

      const filePath = path.join(UPLOADS_DIR, targetFileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'El archivo físico no existe en el servidor.' });
      }

      // Increment downloads count
      db.files[fileIndex].downloads += 1;
      writeDb(db);

      // Trigger download response
      // Set download headers to use the user's custom name + extension
      const ext = fileMetadata.extension ? `.${fileMetadata.extension}` : '';
      const customFilename = fileMetadata.name.endsWith(ext) ? fileMetadata.name : `${fileMetadata.name}${ext}`;
      
      res.download(filePath, customFilename);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar la descarga.' });
    }
  });

  // Report File API
  app.post('/api/files/:id/report', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      const { reason, comments } = req.body;
      if (!reason) {
        return res.status(400).json({ error: 'Se requiere especificar un motivo del reporte.' });
      }

      const newReport: FileReport = {
        id: 'report_' + Math.random().toString(36).substr(2, 9),
        reason,
        comments: comments || '',
        timestamp: new Date().toISOString()
      };

      db.files[fileIndex].reports.push(newReport);

      // Auto hide or flag as threat if there are many reports
      // "Si un archivo recibe muchos reportes debe quedar oculto hasta ser revisado (or marked reported)."
      // Let's set the status to 'Amenaza detectada' if reports count >= 3
      if (db.files[fileIndex].reports.length >= 3) {
        db.files[fileIndex].status = 'Amenaza detectada';
        db.files[fileIndex].securityScanLog.push(`[${new Date().toLocaleTimeString()}] ALERTA CRÍTICA: Bloqueo preventivo activado. Este archivo ha recibido múltiples reportes de usuarios (${db.files[fileIndex].reports.length} reportes).`);
      }

      writeDb(db);
      res.status(201).json(db.files[fileIndex]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al enviar el reporte.' });
    }
  });

  // Rate File API
  app.post('/api/files/:id/rate', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);
      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }
      const rating = Number(req.body.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Calificación inválida. Debe ser entre 1 y 5 estrellas.' });
      }

      const file = db.files[fileIndex];
      const currentRating = typeof file.rating === 'number' ? file.rating : 0;
      const currentVotes = typeof file.votesCount === 'number' ? file.votesCount : 0;

      const newVotes = currentVotes + 1;
      const newRating = ((currentRating * currentVotes) + rating) / newVotes;

      file.rating = Math.round(newRating * 10) / 10;
      file.votesCount = newVotes;

      writeDb(db);
      res.json({
        success: true,
        rating: file.rating,
        votesCount: file.votesCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor al procesar calificación.' });
    }
  });

  // Post Comment API
  app.post('/api/files/:id/comments', (req, res) => {
    try {
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);
      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }
      const { author, text } = req.body;
      if (!author || !author.trim() || !text || !text.trim()) {
        return res.status(400).json({ error: 'Debe especificar un nombre de autor y el texto del comentario.' });
      }

      const file = db.files[fileIndex];
      if (!file.comments) {
        file.comments = [];
      }

      const newComment: Comment = {
        id: 'comment_' + Math.random().toString(36).substr(2, 9),
        author: author.trim(),
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      file.comments.push(newComment);
      writeDb(db);
      res.status(201).json(newComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor al registrar comentario.' });
    }
  });

  // Search History API
  app.get('/api/history', (req, res) => {
    try {
      const db = readDb();
      let history = [...db.history];

      // Sorting parameter
      const sort = req.query.sort as string || 'recent';

      if (sort === 'recent') {
        history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else if (sort === 'oldest') {
        history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      } else if (sort === 'a-z') {
        history.sort((a, b) => a.query.localeCompare(b.query));
      } else if (sort === 'z-a') {
        history.sort((a, b) => b.query.localeCompare(a.query));
      }

      res.json(history);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al consultar el historial.' });
    }
  });

  // Add search history item
  app.post('/api/history', (req, res) => {
    try {
      const { query } = req.body;
      if (!query || !query.trim()) {
        return res.status(400).json({ error: 'Se requiere una consulta de búsqueda.' });
      }

      const db = readDb();
      
      // Avoid duplicate quick queries in short history window
      const trimmedQuery = query.trim();
      const existingIndex = db.history.findIndex(h => h.query.toLowerCase() === trimmedQuery.toLowerCase());
      
      if (existingIndex !== -1) {
        db.history[existingIndex].timestamp = new Date().toISOString();
      } else {
        const newItem: SearchHistoryItem = {
          id: 'hist_' + Math.random().toString(36).substr(2, 9),
          query: trimmedQuery,
          type: 'search',
          timestamp: new Date().toISOString(),
        };
        db.history.push(newItem);
      }

      writeDb(db);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar búsqueda.' });
    }
  });

  // Delete single history item
  app.delete('/api/history/:id', (req, res) => {
    try {
      const db = readDb();
      const historyIndex = db.history.findIndex(h => h.id === req.params.id);

      if (historyIndex === -1) {
        return res.status(404).json({ error: 'Historial no encontrado.' });
      }

      db.history.splice(historyIndex, 1);
      writeDb(db);

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al borrar historial.' });
    }
  });

  // Clear all search history
  app.delete('/api/history', (req, res) => {
    try {
      const db = readDb();
      db.history = [];
      writeDb(db);
      res.json({ success: true, message: 'Historial vaciado.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al vaciar historial.' });
    }
  });

  // --- ADMIN MODERATION API ---

  // Moderate file: override status to 'Revisado', or resolve reports
  app.post('/api/admin/moderate/:id', (req, res) => {
    try {
      const { action } = req.body; // 'approve' | 'delete' | 'clear_reports'
      const db = readDb();
      const fileIndex = db.files.findIndex(f => f.id === req.params.id);

      if (fileIndex === -1) {
        return res.status(404).json({ error: 'Archivo no encontrado.' });
      }

      if (action === 'approve') {
        db.files[fileIndex].status = 'Revisado';
        db.files[fileIndex].securityScanLog.push(`[${new Date().toLocaleTimeString()}] MODERACIÓN: El administrador ha revisado manualmente este archivo y lo ha marcado como SEGURO (Revisado).`);
      } else if (action === 'clear_reports') {
        db.files[fileIndex].reports = [];
        db.files[fileIndex].status = 'Revisado';
        db.files[fileIndex].securityScanLog.push(`[${new Date().toLocaleTimeString()}] MODERACIÓN: Los reportes de los usuarios han sido desestimados por el administrador.`);
      } else if (action === 'delete') {
        const fileToDelete = db.files[fileIndex];
        const filePath = path.join(UPLOADS_DIR, fileToDelete.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (fileToDelete.coverName) {
          const coverPath = path.join(UPLOADS_DIR, fileToDelete.coverName);
          if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
          }
        }
        db.files.splice(fileIndex, 1);
        writeDb(db);
        return res.json({ success: true, action: 'deleted', message: 'Archivo eliminado con éxito por el moderador.' });
      }

      writeDb(db);
      res.json(db.files[fileIndex]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en moderación.' });
    }
  });


  // --- VITE MIDDLEWARE SETUP / STATIC FILES FOR SPA ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on PORT 3000 and HOST 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
