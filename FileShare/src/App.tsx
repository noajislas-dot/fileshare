import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, History as HistoryIcon, Settings as SettingsIcon, Search, Plus, 
  Menu, Grid, List, Box, ShieldAlert, Scale, ArrowUpDown, PlusCircle, 
  Trash2, Download, ShieldCheck, ChevronRight, LayoutDashboard, FileText, CheckCircle2, RefreshCw,
  Bell, Heart, AlertTriangle, Eye, Star, Share2, ShieldX, X
} from 'lucide-react';
import { FileMetadata, AppSettings, NotificationItem, ActivityItem } from './types';
import WelcomeModal from './components/WelcomeModal';
import SettingsPanel from './components/SettingsPanel';
import HistoryPanel from './components/HistoryPanel';
import UploadForm from './components/UploadForm';
import FileCard, { getFileTypeIcon, formatBytes } from './components/FileCard';
import FileDetailModal from './components/FileDetailModal';
import AdminPanel from './components/AdminPanel';
import TermsAndPrivacy from './components/TermsAndPrivacy';
import TrashPanel from './components/TrashPanel';
import LikesPanel from './components/LikesPanel';
import { TRANSLATIONS, LANGUAGES } from './lib/translations';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 163, 255';
}

const trashTranslations: Record<string, any> = {
  es: {
    trashTitle: "Papelera",
    trashDesc: "Archivos borrados. Se eliminarán de forma automática y permanente después de 30 días.",
    emptyTrash: "Vaciar Papelera",
    recoverBtn: "Recuperar",
    deletePermanent: "Eliminar permanentemente",
    deletePermanentlyCheck: "Eliminar permanentemente (no irá a la papelera)",
    deleteModalTitle: "¿Deseas borrar este archivo?",
    deleteModalWarning: "Si se elige eliminar permanentemente, el archivo no estará en la papelera y se perderá de forma irreversible. De lo contrario, se guardará en la papelera durante 30 días.",
    editModalTitle: "Editar Proyecto",
    saveChanges: "Guardar Cambios",
    cancel: "Cancelar",
    fileName: "Nombre del archivo",
    fileDesc: "Descripción",
    otrosLabel: "OTROS",
    noTrashFiles: "La papelera está vacía."
  },
  en: {
    trashTitle: "Trash Bin",
    trashDesc: "Deleted files. They will be automatically and permanently deleted after 30 days.",
    emptyTrash: "Empty Trash",
    recoverBtn: "Recover",
    deletePermanent: "Delete permanently",
    deletePermanentlyCheck: "Delete permanently (will not go to Trash)",
    deleteModalTitle: "Do you want to delete this file?",
    deleteModalWarning: "If you choose to delete permanently, the file won't go to the Trash and will be irreversibly lost. Otherwise, it stays in the Trash for 30 days.",
    editModalTitle: "Edit Project",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    fileName: "File Name",
    fileDesc: "Description",
    otrosLabel: "OTHERS",
    noTrashFiles: "The Trash bin is empty."
  },
  pt: {
    trashTitle: "Lixeira",
    trashDesc: "Arquivos excluídos. Eles serão apagados automática e permanentemente após 30 dias.",
    emptyTrash: "Esvaziar Lixeira",
    recoverBtn: "Recuperar",
    deletePermanent: "Excluir permanentemente",
    deletePermanentlyCheck: "Excluir permanentemente (não vai para a lixeira)",
    deleteModalTitle: "Deseja excluir este arquivo?",
    deleteModalWarning: "Se você optar por excluir permanentemente, o arquivo não irá para a lixeira e será perdido irreversivelmente. Caso contrário, permanecerá na lixeira por 30 dias.",
    editModalTitle: "Editar Projeto",
    saveChanges: "Salvar Alterações",
    cancel: "Cancelar",
    fileName: "Nome do arquivo",
    fileDesc: "Descrição",
    otrosLabel: "OUTROS",
    noTrashFiles: "A lixeira está vazia."
  },
  fr: {
    trashTitle: "Corbeille",
    trashDesc: "Fichiers supprimés. Ils seront automatiquement et définitivement supprimés après 30 jours.",
    emptyTrash: "Vider la corbeille",
    recoverBtn: "Restaurer",
    deletePermanent: "Supprimer définitivement",
    deletePermanentlyCheck: "Supprimer définitivement (ne pas mettre à la corbeille)",
    deleteModalTitle: "Voulez-vous supprimer ce fichier ?",
    deleteModalWarning: "Si vous choisissez de le supprimer définitivement, le fichier ne sera pas mis à la corbeille et sera perdu de manière irréversible. Sinon, il restera dans la corbeille pendant 30 jours.",
    editModalTitle: "Modifier le projet",
    saveChanges: "Enregistrer les modifications",
    cancel: "Annuler",
    fileName: "Nom du fichier",
    fileDesc: "Description",
    otrosLabel: "AUTRES",
    noTrashFiles: "La corbeille est vide."
  },
  de: {
    trashTitle: "Papierkorb",
    trashDesc: "Gelöschte Dateien. Sie werden nach 30 Tagen automatisch und dauerhaft gelöscht.",
    emptyTrash: "Papierkorb leeren",
    recoverBtn: "Wiederherstellen",
    deletePermanent: "Dauerhaft löschen",
    deletePermanentlyCheck: "Dauerhaft löschen (nicht in den Papierkorb verschieben)",
    deleteModalTitle: "Möchten Sie diese Datei löschen?",
    deleteModalWarning: "Wenn Sie sich für das dauerhafte Löschen entscheiden, wird die Datei nicht in den Papierkorb verschoben und geht unwiderruflich verloren. Andernfalls verbleibt sie 30 Tage im Papierkorb.",
    editModalTitle: "Projekt bearbeiten",
    saveChanges: "Änderungen speichern",
    cancel: "Abbrechen",
    fileName: "Dateiname",
    fileDesc: "Beschreibung",
    otrosLabel: "ANDERE",
    noTrashFiles: "Der Papierkorb ist leer."
  },
  it: {
    trashTitle: "Cestino",
    trashDesc: "File eliminati. Verranno eliminati automaticamente e in modo permanente dopo 30 giorni.",
    emptyTrash: "Svuota Cestino",
    recoverBtn: "Ripristina",
    deletePermanent: "Elimina permanentemente",
    deletePermanentlyCheck: "Elimina permanentemente (non andrà nel cestino)",
    deleteModalTitle: "Vuoi eliminare questo file?",
    deleteModalWarning: "Se scegli di eliminare permanentemente, il file non andrà nel cestino e andrà perso irreversibilmente. Altrimenti, rimarrà nel cestino per 30 giorni.",
    editModalTitle: "Modifica Progetto",
    saveChanges: "Salva Modifiche",
    cancel: "Annulla",
    fileName: "Nome del file",
    fileDesc: "Descrizione",
    otrosLabel: "ALTRI",
    noTrashFiles: "Il cestino è vuoto."
  },
  ja: {
    trashTitle: "ゴミ箱",
    trashDesc: "削除されたファイル。30日後に自動的かつ永久に削除されます。",
    emptyTrash: "ゴミ箱を空にする",
    recoverBtn: "復元",
    deletePermanent: "永久に削除",
    deletePermanentlyCheck: "永久に削除（ゴミ箱に移動しない）",
    deleteModalTitle: "このファイルを削除しますか？",
    deleteModalWarning: "永久削除を選択した場合、ファイルはゴミ箱に入らず、取り戻すことはできません。それ以外の場合は、30日間ゴミ箱に保存されます。",
    editModalTitle: "プロジェクトの編集",
    saveChanges: "変更を保存",
    cancel: "キャンセル",
    fileName: "ファイル名",
    fileDesc: "説明",
    otrosLabel: "その他",
    noTrashFiles: "ゴミ箱は空です。"
  },
  ko: {
    trashTitle: "휴지통",
    trashDesc: "삭제된 파일입니다. 30일 후에 자동으로 영구 삭제됩니다.",
    emptyTrash: "휴지통 비우기",
    recoverBtn: "복원",
    deletePermanent: "영구 삭제",
    deletePermanentlyCheck: "영구 삭제 (휴지통으로 이동하지 않음)",
    deleteModalTitle: "이 파일을 삭제하시겠습니까?",
    deleteModalWarning: "영구 삭제를 선택하면 파일이 휴지통으로 이동하지 않고 영구적으로 유실됩니다. 그렇지 않으면 휴지통에 30일 동안 보관됩니다.",
    editModalTitle: "프로젝트 편집",
    saveChanges: "변경 사항 저장",
    cancel: "취소",
    fileName: "파일 이름",
    fileDesc: "설명",
    otrosLabel: "기타",
    noTrashFiles: "휴지통이 비어 있습니다."
  },
  zh: {
    trashTitle: "回收站",
    trashDesc: "已删除的文件。它们将在 30 天后被自动永久删除。",
    emptyTrash: "清空回收站",
    recoverBtn: "还原",
    deletePermanent: "永久删除",
    deletePermanentlyCheck: "永久删除（不移至回收站）",
    deleteModalTitle: "您确定要删除此文件吗？",
    deleteModalWarning: "如果选择永久删除，该文件将不会进入回收站并永久丢失。否则，它将在回收站中保留 30 天。",
    editModalTitle: "编辑项目",
    saveChanges: "保存更改",
    cancel: "取消",
    fileName: "文件名",
    fileDesc: "描述",
    otrosLabel: "其他",
    noTrashFiles: "回收站已空。"
  },
  ru: {
    trashTitle: "Корзина",
    trashDesc: "Удаленные файлы. Они будут автоматически и навсегда удалены через 30 дней.",
    emptyTrash: "Очистить Корзину",
    recoverBtn: "Восстановить",
    deletePermanent: "Удалить навсегда",
    deletePermanentlyCheck: "Удалить навсегда (мимо корзины)",
    deleteModalTitle: "Вы хотите удалить этот файл?",
    deleteModalWarning: "Если вы выберете удаление навсегда, файл не попадет в корзину и будет безвозвратно утерян. В противном случае он останется в корзине на 30 дней.",
    editModalTitle: "Редактировать проект",
    saveChanges: "Сохранить изменения",
    cancel: "Отмена",
    fileName: "Имя файла",
    fileDesc: "Описание",
    otrosLabel: "ДРУГИЕ",
    noTrashFiles: "Корзина пуста."
  }
};

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'projects' | 'history' | 'settings' | 'admin' | 'legales' | 'activity' | 'notifications' | 'trash'>('home');

  // Preferences / Settings State (saved in localStorage)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('fileshare_settings');
    let loaded: any = {};
    if (saved) {
      try { loaded = JSON.parse(saved); } catch (e) { /* fallback */ }
    }

    // Detect browser/system language
    let defaultLang = 'es';
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const supportedLangs = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru'];
      if (supportedLangs.includes(browserLang)) {
        defaultLang = browserLang;
      }
    }

    return {
      theme: loaded.theme || 'dark',
      customColor: loaded.customColor || '#00a3ff',
      style: loaded.style || 'liquid-glass',
      animations: loaded.animations || 'activated',
      language: loaded.language || defaultLang
    };
  });

  // Active translation
  const t = TRANSLATIONS[settings.language as keyof typeof TRANSLATIONS] || TRANSLATIONS.es;

  const lang = settings.language;
  const isEn = lang === 'en';
  const isPt = lang === 'pt';
  const isFr = lang === 'fr';
  const isDe = lang === 'de';
  const isIt = lang === 'it';
  const isJa = lang === 'ja';
  const isKo = lang === 'ko';
  const isZh = lang === 'zh';
  const isRu = lang === 'ru';

  const getFileTypeFilters = () => {
    return [
      { label: isEn ? 'All' : isPt ? 'Todos' : isFr ? 'Tout' : isDe ? 'Alle' : isIt ? 'Tutti' : isJa ? 'すべて' : isKo ? '전체' : isZh ? '全部' : isRu ? 'Все' : 'Todos', value: 'all' },
      { label: isEn ? 'Apps (APK)' : isPt ? 'Aplicativos (APK)' : isFr ? 'Applications (APK)' : isDe ? 'Apps (APK)' : isIt ? 'Applicazioni (APK)' : isJa ? 'アプリ (APK)' : isKo ? '앱 (APK)' : isZh ? '应用 (APK)' : isRu ? 'Приложения (APK)' : 'Aplicaciones (APK)', value: 'apk' },
      { label: isEn ? 'Archives (ZIP/RAR)' : isPt ? 'Arquivos (ZIP/RAR)' : isFr ? 'Archives (ZIP/RAR)' : isDe ? 'Archive (ZIP/RAR)' : isIt ? 'Archivi (ZIP/RAR)' : isJa ? 'アーカイブ (ZIP/RAR)' : isKo ? '압축 파일 (ZIP/RAR)' : isZh ? '压缩包 (ZIP/RAR)' : isRu ? 'Архивы (ZIP/RAR)' : 'Archivos (ZIP/RAR)', value: 'Archivo Comprimido' },
      { label: isEn ? 'Documents' : isPt ? 'Documentos' : isFr ? 'Documents' : isDe ? 'Dokumente' : isIt ? 'Documenti' : isJa ? 'ドキュメント' : isKo ? '문서' : isZh ? '文档' : isRu ? 'Документы' : 'Documentos', value: 'Documento' },
      { label: isEn ? 'Images' : isPt ? 'Imagens' : isFr ? 'Images' : isDe ? 'Bilder' : isIt ? 'Immagini' : isJa ? '画像' : isKo ? '이미지' : isZh ? '图片' : isRu ? 'Изображения' : 'Imágenes', value: 'Imagen' },
      { label: isEn ? 'Videos' : isPt ? 'Vídeos' : isFr ? 'Vidéos' : isDe ? 'Videos' : isIt ? 'Video' : isJa ? '動画' : isKo ? '동영상' : isZh ? '视频' : isRu ? 'Видео' : 'Videos', value: 'Video' },
      { label: isEn ? 'Music & Audio' : isPt ? 'Música e Áudio' : isFr ? 'Musique & Audio' : isDe ? 'Musik & Audio' : isIt ? 'Musica & Audio' : isJa ? '音楽・オーディオ' : isKo ? '음악 및 오디오' : isZh ? '音乐与音频' : isRu ? 'Musзыка и аудио' : 'Música y Audio', value: 'Audio' },
      { label: isEn ? 'Programs (EXE)' : isPt ? 'Programas (EXE)' : isFr ? 'Programmes (EXE)' : isDe ? 'Programme (EXE)' : isIt ? 'Programmi (EXE)' : isJa ? 'プログラム (EXE)' : isKo ? '프로그램 (EXE)' : isZh ? '程序 (EXE)' : isRu ? 'Программы (EXE)' : 'Programas (EXE)', value: 'Ejecutable' },
      { label: isEn ? 'Others' : isPt ? 'Outros' : isFr ? 'Autres' : isDe ? 'Andere' : isIt ? 'Altri' : isJa ? 'その他' : isKo ? '기타' : isZh ? '其他' : isRu ? 'Другие' : 'OTROS', value: 'OTROS' }
    ];
  };

  // Uploader ID (saved in localStorage)
  const [uploaderId, setUploaderId] = useState<string>(() => {
    const saved = localStorage.getItem('fileshare_uploader_id');
    if (saved) return saved;
    const hex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const newId = `Uploader #${hex}`;
    localStorage.setItem('fileshare_uploader_id', newId);
    return newId;
  });

  // Notifications State (saved in localStorage)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fileshare_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('fileshare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Request notification permissions
  useEffect(() => {
    if (window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  const addNotification = (
    title: string,
    message: string,
    type: 'upload_start' | 'upload_progress' | 'upload_success' | 'upload_error' | 'download_start' | 'reported' | 'scanned' | 'deleted' | 'info'
  ) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (window.Notification && window.Notification.permission === 'granted') {
      try {
        new window.Notification('FileShare 🔔', { body: `${title}\n${message}` });
      } catch (e) {
        console.error('Browser Notification error:', e);
      }
    }
  };

  // Activity Logs State (saved in localStorage)
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('fileshare_activities');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync activities to localStorage
  useEffect(() => {
    localStorage.setItem('fileshare_activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (action: string, details: string) => {
    const newAct: ActivityItem = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Favorites List (file IDs saved in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('fileshare_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('fileshare_favorites', JSON.stringify(next));
      
      const isNowFav = next.includes(id);
      addActivity(
        isNowFav ? 'add_favorite' : 'remove_favorite',
        isNowFav 
          ? (settings.language === 'en' ? `Added to favorites file ID: ${id}` : settings.language === 'pt' ? `Adicionou aos favoritos o arquivo ID: ${id}` : settings.language === 'fr' ? `Ajouté aux favoris le fichier ID: ${id}` : settings.language === 'de' ? `Datei mit der ID: ${id} zu Favoriten hinzugefügt` : settings.language === 'it' ? `Aggiunto ai preferiti il file ID: ${id}` : settings.language === 'ja' ? `ファイルIDをブックマークに追加しました: ${id}` : settings.language === 'ko' ? `즐겨찾기에 파일 ID 추가됨: ${id}` : settings.language === 'zh' ? `已将文件ID：${id}添加到收藏夹` : settings.language === 'ru' ? `Добавлен в избранное файл ID: ${id}` : `Añadiste a favoritos el archivo ID: ${id}`)
          : (settings.language === 'en' ? `Removed from favorites file ID: ${id}` : settings.language === 'pt' ? `Removeu dos favoritos o arquivo ID: ${id}` : settings.language === 'fr' ? `Retiré des favoris le fichier ID: ${id}` : settings.language === 'de' ? `Datei mit der ID: ${id} aus Favoriten entfernt` : settings.language === 'it' ? `Rimosso dai preferiti il file ID: ${id}` : settings.language === 'ja' ? `ファイルID` + `をブックマークから削除しました: ${id}` : settings.language === 'ko' ? `즐겨찾기에서 파일 ID 제거됨: ${id}` : settings.language === 'zh' ? `已从收藏夹中移除文件ID：${id}` : settings.language === 'ru' ? `Удален из избранного файл ID: ${id}` : `Quitaste de favoritos el archivo ID: ${id}`)
      );
      return next;
    });
  };

  // Liked Files List (file IDs saved in localStorage)
  const [likedFiles, setLikedFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('fileshare_liked_files');
    return saved ? JSON.parse(saved) : [];
  });

  const handleToggleLike = async (id: string) => {
    const isLikedAlready = likedFiles.includes(id);
    let newLikedFiles: string[];
    if (isLikedAlready) {
      newLikedFiles = likedFiles.filter(x => x !== id);
    } else {
      newLikedFiles = [...likedFiles, id];
    }
    setLikedFiles(newLikedFiles);
    localStorage.setItem('fileshare_liked_files', JSON.stringify(newLikedFiles));

    // Optimistically update file state on screen to prevent flicker
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const currentLikes = typeof f.likes === 'number' ? f.likes : 0;
        return {
          ...f,
          likes: Math.max(0, isLikedAlready ? currentLikes - 1 : currentLikes + 1)
        };
      }
      return f;
    }));
    setAllFiles(prev => prev.map(f => {
      if (f.id === id) {
        const currentLikes = typeof f.likes === 'number' ? f.likes : 0;
        return {
          ...f,
          likes: Math.max(0, isLikedAlready ? currentLikes - 1 : currentLikes + 1)
        };
      }
      return f;
    }));

    try {
      // API call to persist
      const res = await fetch(`/api/files/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: !isLikedAlready })
      });
      if (res.ok) {
        const data = await res.json();
        // Sync actual server count
        setFiles(prev => prev.map(f => f.id === id ? { ...f, likes: data.likes } : f));
        setAllFiles(prev => prev.map(f => f.id === id ? { ...f, likes: data.likes } : f));
        
        addActivity(
          !isLikedAlready ? 'like_file' : 'unlike_file',
          !isLikedAlready 
            ? (settings.language === 'en' ? `Liked file ID: ${id}` : settings.language === 'pt' ? `Curtiu o arquivo ID: ${id}` : `Le diste me gusta al archivo ID: ${id}`)
            : (settings.language === 'en' ? `Unliked file ID: ${id}` : settings.language === 'pt' ? `Descurtiu o arquivo ID: ${id}` : `Quitaste el me gusta al archivo ID: ${id}`)
        );
      }
    } catch (err) {
      console.error('Error liking file:', err);
    }
  };

  // Search and Suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<FileMetadata[]>([]);
  const [allFilesCount, setAllFilesCount] = useState(0);
  const [allFiles, setAllFiles] = useState<FileMetadata[]>([]);

  // Files Catalog States
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [sortOrder, setSortOrder] = useState('recent');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [loadingFiles, setLoadingFiles] = useState(true);

  // View Preference
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Bulk Selection State
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Detailed Modal Selection
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);

  // Custom Modals State for Edit and Delete
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null);
  const [deletePermanently, setDeletePermanently] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<FileMetadata | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');

  // Refresh trigger counter
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  // Ref for click outside suggestions
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('fileshare_settings', JSON.stringify(settings));
  }, [settings]);

  // Fetch Suggestions engine & Total Files check
  const fetchAllForSuggestions = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllFilesCount(data.length);
        setAllFiles(data);
        
        // Compute autocomplete suggestions dynamically as user types
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const filtered = data.filter(f => 
            f.name.toLowerCase().includes(query) ||
            f.description.toLowerCase().includes(query) ||
            f.type.toLowerCase().includes(query) ||
            f.extension.toLowerCase().includes(query)
          ).slice(0, 5); // Limit suggestions to 5
          setSuggestions(filtered);
        } else {
          setSuggestions([]);
        }
      }
    } catch (err) {
      console.error('Error fetching suggestions metadata:', err);
    }
  };

  useEffect(() => {
    fetchAllForSuggestions();
  }, [searchQuery, refreshCounter]);

  // Fetch Files Catalog with full server-side search, sort & filters
  const fetchFilesCatalog = async () => {
    try {
      setLoadingFiles(true);
      const searchParam = encodeURIComponent(searchQuery);
      const url = `/api/files?search=${searchParam}&sort=${sortOrder}&type=${activeTypeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setFiles(data);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFilesCatalog();
  }, [searchQuery, sortOrder, activeTypeFilter, refreshCounter, currentView]);

  // Click outside suggestions list
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Submit search event to register query in history DB
  const triggerSearchSubmit = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed })
      });
      setHistoryTrigger(prev => prev + 1); // reload history panel
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      triggerSearchSubmit(searchQuery);
      setShowSuggestions(false);
      setCurrentView('projects'); // jump to search explorer
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    triggerSearchSubmit(query);
    setShowSuggestions(false);
    setCurrentView('projects');
  };

  // Bulk Operations
  const handleToggleSelectFile = (id: string) => {
    setSelectedFileIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiles = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(f => f.id));
    }
  };

  const handleBulkDownload = () => {
    if (selectedFileIds.length === 0) return;
    const lang = settings.language;
    const isEn = lang === 'en';
    const isPt = lang === 'pt';
    const isFr = lang === 'fr';
    const isDe = lang === 'de';
    const isIt = lang === 'it';
    const isJa = lang === 'ja';
    const isKo = lang === 'ko';
    const isZh = lang === 'zh';
    const isRu = lang === 'ru';

    const bulkDownloadStart = isEn ? `Starting bulk download for ${selectedFileIds.length} files...` : isPt ? `Iniciando download em lote para ${selectedFileIds.length} arquivos...` : isFr ? `Démarrage du téléchargement groupé de ${selectedFileIds.length} fichiers...` : isDe ? `Sammeldownload für ${selectedFileIds.length} Dateien wird gestartet...` : isIt ? `Avvio del download multiplo per ${selectedFileIds.length} file...` : isJa ? `${selectedFileIds.length} 個のファイルの一括ダウンロードを開始しています...` : isKo ? `${selectedFileIds.length}개 파일의 일괄 다운로드를 시작하는 중...` : isZh ? `正在启动 ${selectedFileIds.length} 个文件的批量下载...` : isRu ? `Запуск пакетной загрузки ${selectedFileIds.length} файлов...` : `Iniciando descarga en lote para ${selectedFileIds.length} archivos...`;

    alert(bulkDownloadStart);
    selectedFileIds.forEach((id) => {
      // Trigger multiple sequential downloads safely
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `/api/download/${id}`;
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 2000);
    });
    setSelectedFileIds([]);
    setTimeout(() => setRefreshCounter(prev => prev + 1), 1000);
  };

  const handleBulkDelete = async () => {
    if (selectedFileIds.length === 0) return;
    const lang = settings.language;
    const isEn = lang === 'en';
    const isPt = lang === 'pt';
    const isFr = lang === 'fr';
    const isDe = lang === 'de';
    const isIt = lang === 'it';
    const isJa = lang === 'ja';
    const isKo = lang === 'ko';
    const isZh = lang === 'zh';
    const isRu = lang === 'ru';

    const confirmBulkDelete = isEn ? `Are you sure you want to permanently delete the ${selectedFileIds.length} selected files?` : isPt ? `Tem certeza de que deseja excluir permanentemente os ${selectedFileIds.length} arquivos selecionados?` : isFr ? `Êtes-vous sûr de vouloir supprimer définitivement les ${selectedFileIds.length} fichiers sélectionnés ?` : isDe ? `Sind Sie sicher, dass Sie die ${selectedFileIds.length} ausgewählten Dateien dauerhaft löschen möchten?` : isIt ? `Sei sicuro di voler eliminare permanentemente i ${selectedFileIds.length} file selezionati?` : isJa ? `選択された ${selectedFileIds.length} 個のファイルを永久に削除してもよろしいですか？` : isKo ? `선택한 ${selectedFileIds.length}개 파일을 영구적으로 삭제하시겠습니까?` : isZh ? `您确定要永久删除选中的 ${selectedFileIds.length} 个文件吗？` : isRu ? `Вы уверены, что хотите навсегда удалить ${selectedFileIds.length} выбранных файлов?` : `¿Estás seguro de que deseas eliminar permanentemente los ${selectedFileIds.length} archivos seleccionados?`;

    if (!window.confirm(confirmBulkDelete)) {
      return;
    }

    try {
      for (const id of selectedFileIds) {
        await fetch(`/api/files/${id}`, { method: 'DELETE' });
      }
      setSelectedFileIds([]);
      setRefreshCounter(prev => prev + 1);

      const bulkDeleteSuccess = isEn ? 'Files successfully deleted.' : isPt ? 'Arquivos excluídos com sucesso.' : isFr ? 'Fichiers supprimés avec succès.' : isDe ? 'Dateien erfolgreich gelöscht.' : isIt ? 'File eliminati con successo.' : isJa ? 'ファイルを正常に削除しました。' : isKo ? '파일이 성공적으로 삭제되었습니다.' : isZh ? '文件删除成功。' : isRu ? 'Файлы успешно удалены.' : 'Archivos eliminados con éxito.';
      alert(bulkDeleteSuccess);
    } catch (err) {
      console.error('Error during bulk deletion:', err);
    }
  };

  // Individual Actions
  const handleDownloadFile = async (file: FileMetadata) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `/api/download/${file.id}`;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      setRefreshCounter(prev => prev + 1);
    }, 2000);
  };

  const handleShareFile = (file: FileMetadata) => {
    const shareUrl = `${window.location.origin}/?file=${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    const lang = settings.language;
    const isEn = lang === 'en';
    const isPt = lang === 'pt';
    const isFr = lang === 'fr';
    const isDe = lang === 'de';
    const isIt = lang === 'it';
    const isJa = lang === 'ja';
    const isKo = lang === 'ko';
    const isZh = lang === 'zh';
    const isRu = lang === 'ru';

    const linkCopiedMsg = isEn ? 'Link copied! You can send it via WhatsApp, Telegram, email, or social media.' : isPt ? 'Link copiado! Você pode enviá-lo por WhatsApp, Telegram, e-mail ou redes sociais.' : isFr ? 'Lien copié ! Vous pouvez l\'envoyer via WhatsApp, Telegram, e-mail ou réseaux sociaux.' : isDe ? 'Link kopiert! Sie können ihn über WhatsApp, Telegram, E-Mail oder soziale Medien senden.' : isIt ? 'Link copiato! Puoi inviarlo tramite WhatsApp, Telegram, e-mail o social network.' : isJa ? 'リンクをコピーしました！WhatsApp、Telegram、メール、またはSNSで送信できます。' : isKo ? '링크가 복사되었습니다! WhatsApp, Telegram, 이메일 또는 소셜 미디어를 통해 전송할 수 있습니다.' : isZh ? '链接已复制！您可以通过 WhatsApp、Telegram、电子邮件或社交媒体发送。' : isRu ? 'Ссылка скопирована! Вы можете отправить ее через WhatsApp, Telegram, электронную почту или социальные сети.' : '¡Enlace copiado! Puedes enviarlo por WhatsApp, Telegram, correo o redes sociales';

    alert(linkCopiedMsg);
  };

  const handleEditFile = async (file: FileMetadata) => {
    setFileToEdit(file);
    setEditNameValue(file.name);
    setEditDescValue(file.description || '');
  };

  const handleDeleteFile = (file: FileMetadata) => {
    setFileToDelete(file);
    setDeletePermanently(file.isDeleted === true);
  };

  const handleConfirmEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToEdit) return;
    if (!editNameValue.trim()) {
      alert(settings.language === 'en' ? 'File name cannot be empty.' : settings.language === 'pt' ? 'O nome do arquivo não pode estar vazio.' : 'El nombre del archivo no puede estar vacío.');
      return;
    }

    try {
      const res = await fetch(`/api/files/${fileToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editNameValue.trim(),
          description: editDescValue.trim()
        })
      });

      if (res.ok) {
        addNotification(
          settings.language === 'en' ? 'Project updated' : settings.language === 'pt' ? 'Projeto atualizado' : 'Proyecto actualizado',
          settings.language === 'en' ? `The project "${editNameValue}" was successfully updated.` : settings.language === 'pt' ? `O projeto "${editNameValue}" foi atualizado com sucesso.` : `El proyecto "${editNameValue}" se actualizó con éxito.`,
          'info'
        );
        addActivity(
          'edit_file',
          settings.language === 'en' ? `Edited file/project: ${editNameValue}` : settings.language === 'pt' ? `Editou o arquivo/projeto: ${editNameValue}` : `Editó el archivo/projeto: ${editNameValue}`
        );
        setRefreshCounter(prev => prev + 1);
        setFileToEdit(null);
      } else {
        alert(settings.language === 'en' ? 'Error updating the project details.' : settings.language === 'pt' ? 'Erro ao atualizar os detalhes do projeto.' : 'Error al actualizar los detalles del proyecto.');
      }
    } catch (err) {
      console.error(err);
      alert(settings.language === 'en' ? 'Server error occurred.' : settings.language === 'pt' ? 'Ocorreu um erro no servidor.' : 'Ocurrió un error del servidor.');
    }
  };

  const handleConfirmDeleteSubmit = async () => {
    if (!fileToDelete) return;
    try {
      if (deletePermanently) {
        const res = await fetch(`/api/files/${fileToDelete.id}`, { method: 'DELETE' });
        if (res.ok) {
          addNotification(
            settings.language === 'en' ? 'File permanently deleted' : settings.language === 'pt' ? 'Arquivo excluído permanentemente' : 'Archivo eliminado permanentemente',
            settings.language === 'en' ? `"${fileToDelete.name}" was completely removed.` : settings.language === 'pt' ? `"${fileToDelete.name}" foi completamente removido.` : `"${fileToDelete.name}" se eliminó de forma permanente.`,
            'deleted'
          );
          addActivity(
            'delete_permanent',
            settings.language === 'en' ? `Permanently deleted file: ${fileToDelete.name}` : settings.language === 'pt' ? `Excluiu permanentemente o arquivo: ${fileToDelete.name}` : `Eliminó permanentemente el archivo: ${fileToDelete.name}`
          );
        } else {
          throw new Error('Failed to delete permanently');
        }
      } else {
        const res = await fetch(`/api/files/${fileToDelete.id}/trash`, { method: 'POST' });
        if (res.ok) {
          addNotification(
            settings.language === 'en' ? 'File moved to Trash' : settings.language === 'pt' ? 'Arquivo movido para a Lixeira' : 'Archivo movido a la papelera',
            settings.language === 'en' ? `"${fileToDelete.name}" is now in the Trash.` : settings.language === 'pt' ? `"${fileToDelete.name}" está na lixeira.` : `"${fileToDelete.name}" se movió a la papelera.`,
            'deleted'
          );
          addActivity(
            'move_to_trash',
            settings.language === 'en' ? `Moved file to trash: ${fileToDelete.name}` : settings.language === 'pt' ? `Moveu o arquivo para a lixeira: ${fileToDelete.name}` : `Movió el archivo a la papelera: ${fileToDelete.name}`
          );
        } else {
          throw new Error('Failed to move to trash');
        }
      }
      setRefreshCounter(prev => prev + 1);
      setFileToDelete(null);
    } catch (err) {
      console.error(err);
      alert(settings.language === 'en' ? 'Error performing deletion.' : settings.language === 'pt' ? 'Erro ao realizar a exclusão.' : 'Error al realizar la eliminación.');
    }
  };

  // Theme variable bindings
  const isDark = settings.theme === 'dark' || settings.theme === 'custom';
  const isLiquid = settings.style === 'liquid-glass';

  const containerClass = isDark
    ? 'bg-neutral-950 text-white min-h-screen flex flex-col selection:bg-sky-500 selection:text-white'
    : 'bg-neutral-100 text-neutral-800 min-h-screen flex flex-col selection:bg-sky-500 selection:text-white';

  const headerClass = isLiquid
    ? isDark
      ? 'bg-neutral-950/75 backdrop-blur-md border-b border-white/10 sticky top-0 z-40'
      : 'bg-white/75 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40'
    : isDark
    ? 'bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40'
    : 'bg-white border-b border-neutral-200 sticky top-0 z-40';

  const themeAccentColor = settings.theme === 'custom' ? settings.customColor : '#00a3ff';

  // Animation CSS modifiers
  const animClass = settings.animations === 'activated'
    ? 'transition-all duration-300 transform translate-y-0 opacity-100'
    : settings.animations === 'reduced'
    ? 'transition-opacity duration-150 opacity-100'
    : '';

  return (
    <div 
      className={containerClass}
      style={{
        '--color-primary': themeAccentColor,
      } as React.CSSProperties}
    >
      <style>{`
        :root {
          --color-primary: ${themeAccentColor};
        }
        .bg-sky-500, .bg-sky-600, .bg-sky-400 {
          background-color: ${themeAccentColor} !important;
        }
        .hover\\:bg-sky-500:hover, .hover\\:bg-sky-600:hover, .hover\\:bg-sky-400:hover {
          background-color: ${themeAccentColor} !important;
          filter: brightness(0.92);
        }
        .text-sky-400, .text-sky-500, .text-sky-600 {
          color: ${themeAccentColor} !important;
        }
        .hover\\:text-sky-500:hover, .hover\\:text-sky-600:hover, .hover\\:text-sky-400:hover {
          color: ${themeAccentColor} !important;
        }
        .border-sky-400, .border-sky-500, .border-sky-600, .focus-within\\:border-sky-500:focus-within {
          border-color: ${themeAccentColor} !important;
        }
        .bg-sky-500\\/10, .bg-sky-500\\/15, .bg-sky-500\\/20 {
          background-color: rgba(${hexToRgb(themeAccentColor)}, 0.12) !important;
        }
        .text-sky-500 {
          color: ${themeAccentColor} !important;
        }
        .selection\\:bg-sky-500::selection {
          background-color: ${themeAccentColor} !important;
        }
      `}</style>
      
      {/* 1. INITIAL WARNING WELCOME MODAL */}
      <WelcomeModal settings={settings} onClose={() => setRefreshCounter(prev => prev + 1)} />

      {/* 2. DYNAMIC APP HEADER (Google Play Styled Layout) */}
      <header className={headerClass}>
        <div className="w-full max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Box className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">
                FileShare
              </span>
              <p className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase">Play & Material 3</p>
            </div>
          </div>

          {/* Autocomplete Search Bar Container */}
          <div ref={searchContainerRef} className="relative w-full max-w-md">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
              isDark 
                ? 'bg-neutral-800/60 border-neutral-700/80 focus-within:border-sky-500 focus-within:bg-neutral-800' 
                : 'bg-neutral-100 border-neutral-200 focus-within:border-sky-500 focus-within:bg-white'
            }`}>
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                id="global-search-bar"
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyPress={handleSearchKeyPress}
                className="w-full bg-transparent text-xs font-semibold outline-none text-neutral-800 dark:text-neutral-100"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                >
                  {t.clearBtn || (isEn ? 'Clear' : isPt ? 'Limpar' : isFr ? 'Effacer' : isDe ? 'Löschen' : isIt ? 'Cancella' : isJa ? 'クリア' : isKo ? '지우기' : isZh ? '清除' : isRu ? 'Очистить' : 'Limpiar')}
                </button>
              )}
            </div>

            {/* suggestions dropdown */}
            {showSuggestions && (
              <div className={`absolute left-0 right-0 mt-2 rounded-2xl border overflow-hidden shadow-2xl z-50 ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                {suggestions.length > 0 ? (
                  <div className="py-2.5">
                    <div className="px-4 py-1.5 text-[9px] font-bold text-neutral-400 font-mono uppercase tracking-wider">
                      {isEn ? 'Suggestions:' : isPt ? 'Sugestões:' : isFr ? 'Suggestions :' : isDe ? 'Vorschläge:' : isIt ? 'Suggerimenti:' : isJa ? '提案：' : isKo ? '제안:' : isZh ? '建议：' : isRu ? 'Предложения:' : 'Sugerencias:'}
                    </div>
                    {suggestions.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleSuggestionClick(file.name)}
                        className={`px-4 py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-between ${
                          isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <span className="truncate pr-4">{file.name}</span>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">{file.extension}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-400 font-semibold italic">
                    {isEn ? 'No suggestions available.' : isPt ? 'Nenhuma sugestão disponível.' : isFr ? 'Aucune suggestion disponible.' : isDe ? 'Keine Vorschläge verfügbar.' : isIt ? 'Nessun suggerimento disponibile.' : isJa ? '提案はありません。' : isKo ? '사용 가능한 제안이 없습니다.' : isZh ? '暂无可用建议。' : isRu ? 'Нет доступных предложений.' : 'No hay sugerencias disponibles.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Quick Actions Navigation */}
          <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
            <button
              id="top-nav-upload"
              onClick={() => setCurrentView('upload')}
              style={{ backgroundColor: themeAccentColor }}
              className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.uploadBtn}
            </button>
            <button
              id="top-nav-settings"
              onClick={() => setCurrentView('settings')}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isDark ? 'border-neutral-800 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-100'
              }`}
              title={t.settingsBtn}
            >
              <SettingsIcon className="w-4 h-4 text-neutral-400 hover:text-sky-500" />
            </button>
          </div>
        </div>

        {/* Top Pills Navigation Menu (Material Design 3 style) */}
        <div className="w-full border-t border-neutral-200/40 dark:border-neutral-800/40 py-2 bg-neutral-50 dark:bg-neutral-900/40 shrink-0">
          <div className="w-full max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold font-sans">
            <button
              id="pill-nav-home"
              onClick={() => setCurrentView('home')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                currentView === 'home'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              {t.home}
            </button>
            <button
              id="pill-nav-projects"
              onClick={() => setCurrentView('projects')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                currentView === 'projects'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              {t.myProjects}
            </button>
            <button
              id="pill-nav-history"
              onClick={() => setCurrentView('history')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                currentView === 'history'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              {t.history}
            </button>
            <button
              id="pill-nav-notifications"
              onClick={() => {
                setCurrentView('notifications');
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentView === 'notifications'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t.notifications || (isEn ? 'Notifications' : isPt ? 'Notificações' : isFr ? 'Notifications' : isDe ? 'Benachrichtigungen' : isIt ? 'Notifiche' : isJa ? '通知' : isKo ? '알림' : isZh ? '通知' : isRu ? 'Уведомления' : 'Notificaciones')}</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              )}
            </button>
            <button
              id="pill-nav-activity"
              onClick={() => setCurrentView('activity')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentView === 'activity'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>{t.activity || (isEn ? 'Activity' : isPt ? 'Atividade' : isFr ? 'Activité' : isDe ? 'Aktivität' : isIt ? 'Attività' : isJa ? 'アクティビティ' : isKo ? '활동' : isZh ? '活动' : isRu ? 'Активность' : 'Actividad')}</span>
            </button>
            <button
              id="pill-nav-admin"
              onClick={() => setCurrentView('admin')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                currentView === 'admin'
                  ? 'bg-red-500/10 text-red-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t.adminPanel}
            </button>
             <button
              id="pill-nav-legales"
              onClick={() => setCurrentView('legales')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                currentView === 'legales'
                  ? 'bg-sky-500/10 text-sky-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              {t.legales}
            </button>
            <button
              id="pill-nav-likes"
              onClick={() => setCurrentView('likes')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentView === 'likes'
                  ? 'bg-rose-500/10 text-rose-500 font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${currentView === 'likes' ? 'text-red-500 fill-red-500 animate-pulse' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-red-500'}`} />
              <span>{isEn ? 'Liked' : isPt ? 'Curtidos' : 'Me Gusta'}</span>
            </button>
            <button
              id="pill-nav-trash"
              onClick={() => setCurrentView('trash')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                currentView === 'trash'
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Trash' : isPt ? 'Lixeira' : isFr ? 'Corbeille' : isDe ? 'Papierkorb' : isIt ? 'Cestino' : isJa ? 'ゴミ箱' : isKo ? '휴지통' : isZh ? '回收站' : isRu ? 'Корзина' : 'Papelera'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. DYNAMIC VIEWS CONTROLLER */}
      <main className={`flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6 ${animClass}`}>
        
        {/* VIEW A: HOME / INICIO */}
        {currentView === 'home' && (
          <div className="space-y-8 py-4">
            {/* Hero promo banner */}
            <div className={`p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
              isDark ? 'bg-gradient-to-r from-sky-950 to-neutral-900 border border-white/5' : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white'
            }`}>
              <div className="space-y-3 text-center md:text-left max-w-lg">
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 tracking-wider uppercase">
                  {isEn ? 'Integrated ClamAV Antivirus' : isPt ? 'Antivírus ClamAV Integrado' : isFr ? 'Antivirus ClamAV Intégré' : isDe ? 'Integrierter ClamAV-Antivirenscanner' : isIt ? 'Antivirus ClamAV Integrato' : isJa ? '統合ClamAVアンチウイルス' : isKo ? '통합 ClamAV 백신' : isZh ? '集成 ClamAV 杀毒引擎' : isRu ? 'Встроенный антивирус ClamAV' : 'Antivirus Integrado ClamAV'}
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {t.heroTitle}
                </h1>
                <p className="text-xs md:text-sm text-neutral-300">
                  {t.heroSubtitle}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-2">
                  <button
                    id="hero-upload-btn"
                    onClick={() => setCurrentView('upload')}
                    className="px-5 py-2.5 rounded-xl font-bold bg-white text-sky-600 text-xs hover:bg-neutral-50 shadow transition-colors cursor-pointer"
                  >
                    {t.heroUploadStart}
                  </button>
                  <button
                    id="hero-projects-btn"
                    onClick={() => setCurrentView('projects')}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-white/10 text-white text-xs hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
                  >
                    {t.heroViewProjects}
                  </button>
                </div>
              </div>

              {/* Cover asset mock */}
              <div className="w-40 h-40 shrink-0 relative hidden md:block">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse blur-xl" />
                <Box className="w-full h-full text-white/15 absolute animate-spin" style={{ animationDuration: '40s' }} />
                <ShieldCheck className="w-16 h-16 text-sky-300 absolute inset-0 m-auto animate-bounce" />
              </div>
            </div>

            {/* Quick access categories dashboard */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-neutral-400 font-mono uppercase tracking-wider">{t.quickCategories}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getFileTypeFilters().slice(1).map((cat) => (
                  <button
                    key={cat.value}
                    id={`home-cat-${cat.value}`}
                    onClick={() => {
                      setActiveTypeFilter(cat.value);
                      setCurrentView('projects');
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                      isDark 
                        ? 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800' 
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 shadow-sm'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                      {getFileTypeIcon(cat.value, 'w-5 h-5')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-neutral-800 dark:text-neutral-100 truncate">{cat.label}</div>
                      <span className="text-[10px] text-neutral-500">{isEn ? 'Explore files' : isPt ? 'Explorar arquivos' : isFr ? 'Explorer les fichiers' : isDe ? 'Dateien durchsuchen' : isIt ? 'Esplora i file' : isJa ? 'ファイルを探索' : isKo ? '파일 탐색' : isZh ? '浏览文件' : isRu ? 'Обзор файлов' : 'Explorar archivos'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Curated sections (Trending, Most Downloaded, Recent) */}
            {(() => {
              const trendingFiles = [...allFiles]
                .sort((a, b) => (b.views + b.downloads * 3 + (b.rating || 0) * 5) - (a.views + a.downloads * 3 + (a.rating || 0) * 5))
                .slice(0, 3);

              const mostDownloadedFiles = [...allFiles]
                .sort((a, b) => b.downloads - a.downloads)
                .slice(0, 3);

              const recentFiles = [...allFiles]
                .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                .slice(0, 3);

              return allFiles.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Tendencias */}
                  <div className={`p-5 rounded-3xl ${isDark ? 'bg-neutral-900/30 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-4`}>
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                      <span className="text-base">🔥</span>
                      <span className="uppercase tracking-wider text-[11px] font-extrabold font-mono text-neutral-400">{t.trending}</span>
                    </div>
                    <div className="space-y-3">
                      {trendingFiles.map(file => (
                        <div 
                          key={file.id} 
                          onClick={() => setSelectedFile(file)}
                          className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                            isDark ? 'hover:bg-neutral-800/50 bg-neutral-900/50' : 'hover:bg-neutral-50 bg-neutral-100/30 border border-neutral-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                              {getFileTypeIcon(file.type, 'w-4 h-4')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-neutral-800 dark:text-neutral-100 truncate">{file.name}</div>
                              <span className="text-[10px] text-neutral-500 font-mono uppercase">{file.extension} • {formatBytes(file.size)}</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 shrink-0 flex items-center gap-0.5 font-mono">
                            <Eye className="w-3 h-3 text-sky-500" /> {file.views}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Más descargados */}
                  <div className={`p-5 rounded-3xl ${isDark ? 'bg-neutral-900/30 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-4`}>
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <span className="text-base">⭐</span>
                      <span className="uppercase tracking-wider text-[11px] font-extrabold font-mono text-neutral-400">{t.mostDownloaded}</span>
                    </div>
                    <div className="space-y-3">
                      {mostDownloadedFiles.map(file => (
                        <div 
                          key={file.id} 
                          onClick={() => setSelectedFile(file)}
                          className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                            isDark ? 'hover:bg-neutral-800/50 bg-neutral-900/50' : 'hover:bg-neutral-50 bg-neutral-100/30 border border-neutral-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                              {getFileTypeIcon(file.type, 'w-4 h-4')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-neutral-800 dark:text-neutral-100 truncate">{file.name}</div>
                              <span className="text-[10px] text-neutral-500 font-mono uppercase">{file.extension} • {formatBytes(file.size)}</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 shrink-0 flex items-center gap-0.5 font-mono">
                            <Download className="w-3 h-3 text-amber-500" /> {file.downloads}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Recientes */}
                  <div className={`p-5 rounded-3xl ${isDark ? 'bg-neutral-900/30 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-4`}>
                    <div className="flex items-center gap-2 text-sky-500 font-bold text-sm">
                      <span className="text-base">🆕</span>
                      <span className="uppercase tracking-wider text-[11px] font-extrabold font-mono text-neutral-400">{t.recent}</span>
                    </div>
                    <div className="space-y-3">
                      {recentFiles.map(file => (
                        <div 
                          key={file.id} 
                          onClick={() => setSelectedFile(file)}
                          className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                            isDark ? 'hover:bg-neutral-800/50 bg-neutral-900/50' : 'hover:bg-neutral-50 bg-neutral-100/30 border border-neutral-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                              {getFileTypeIcon(file.type, 'w-4 h-4')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-neutral-800 dark:text-neutral-100 truncate">{file.name}</div>
                              <span className="text-[10px] text-neutral-500 font-mono uppercase">{file.extension} • {formatBytes(file.size)}</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 shrink-0 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-bold text-[8px]">NEW</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* General App Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl ${isDark ? 'bg-neutral-900/40 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-2`}>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {isEn ? 'Automatic ClamAV Analysis' : isPt ? 'Análise Automática ClamAV' : isFr ? 'Analyse Automatique ClamAV' : isDe ? 'Automatische ClamAV-Analyse' : isIt ? 'Analisi Automatica ClamAV' : isJa ? '自動ClamAVスキャン' : isKo ? '자동 ClamAV 분석' : isZh ? '自动 ClamAV 扫描' : isRu ? 'Автоматический анализ ClamAV' : 'Análisis Automático ClamAV'}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {isEn ? 'All files are audited immediately after upload to flag malware, trojans, or fraudulent extensions.' : isPt ? 'Todos os arquivos são auditados imediatamente após o envio para sinalizar malware, trojans ou extensões fraudulentas.' : isFr ? 'Tous les fichiers sont audités immédiatement après le téléchargement pour signaler les logiciels malveillants, les chevaux de Troie ou les extensions frauduleuses.' : isDe ? 'Alle Dateien werden sofort nach dem Hochladen überprüft, um Malware, Trojaner oder betrügerische Erweiterungen zu kennzeichnen.' : isIt ? 'Tutti i file vengono controllati immediatamente dopo il caricamento per segnalare malware, trojan o estensioni fraudolente.' : isJa ? 'アップロード後すぐにすべてのファイルが監査され、マルウェアやトロイの木馬などの脅威が検出されます。' : isKo ? '모든 파일은 업로드 직후 즉시 분석되어 악성코드, 트로이 목마 또는 사기성 확장 프로그램을 감지합니다.' : isZh ? '所有文件在上传后立即进行检测，以标记恶意软件、木马或欺诈性扩展。' : isRu ? 'Все файлы проверяются сразу после загрузки на наличие вредоносных программ, троянов или мошеннических расширений.' : 'Todos los archivos son auditados inmediatamente tras la subida para marcar malware, troyanos o extensiones fraudulentas.'}
                </p>
              </div>

              <div className={`p-6 rounded-3xl ${isDark ? 'bg-neutral-900/40 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-2`}>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {isEn ? 'No registration or limits' : isPt ? 'Sem registros ou limites' : isFr ? 'Sans inscription ni limite' : isDe ? 'Keine Registrierung oder Limits' : isIt ? 'Nessuna registrazione o limite' : isJa ? '登録も制限も不要' : isKo ? '가입 및 제한 없음' : isZh ? '无需注册，无限制' : isRu ? 'Без регистрации и лимитов' : 'Sin registros ni límites'}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {isEn ? 'Share immediately without creating an account. We store your local preferences securely in your browser.' : isPt ? 'Compartilhe imediatamente sem criar uma conta. Armazenamos suas preferências locais com segurança no seu navegador.' : isFr ? 'Partagez immédiatement sans créer de compte. Nous stockons vos préférences locales en toute sécurité dans votre navigateur.' : isDe ? 'Teilen Sie sofort, ohne ein Konto zu erstellen. Wir speichern Ihre lokalen Einstellungen sicher in Ihrem Browser.' : isIt ? 'Condividi immediatamente senza creare un account. Salviamo le tue preferenze locali in modo sicuro nel browser.' : isJa ? 'アカウントを作成せずにすぐに共有できます。ローカル設定はブラウザに安全に保存されます。' : isKo ? '계정을 생성하지 않고 즉시 공유하세요. 브라우저에 로컬 기본 설정이 안전하게 저장됩니다.' : isZh ? '无需创建账户即可立即分享。我们在您的浏览器中安全地存储本地偏好设置。' : isRu ? 'Делитесь мгновенно без создания учетной записи. Мы надежно сохраняем ваши локальные настройки в браузере.' : 'Comparte de inmediato sin crear una cuenta. Almacenamos tus preferencias locales de manera segura en tu navegador.'}
                </p>
              </div>

              <div className={`p-6 rounded-3xl ${isDark ? 'bg-neutral-900/40 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-2`}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {isEn ? 'Unlimited Projects' : isPt ? 'Projetos Ilimitados' : isFr ? 'Projets Illimités' : isDe ? 'Unbegrenzte Projekte' : isIt ? 'Progetti Illimitati' : isJa ? '無制限のプロジェクト' : isKo ? '무제한 프로젝트' : isZh ? '无限项目' : isRu ? 'Неограниченные проекты' : 'Proyectos Ilimitados'}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {isEn ? 'Keep your uploads organized as editable projects. Modify the title and description as many times as you want.' : isPt ? 'Mantenha seus envios organizados como projetos editáveis. Modifique o título e a descrição quantas vezes desejar.' : isFr ? 'Gardez vos téléchargements organisés sous forme de projets modifiables. Modifiez le titre et la description autant de fois que vous le souhaitez.' : isDe ? 'Halten Sie Ihre Uploads als bearbeitbare Projekte organisiert. Ändern Sie Titel und Beschreibung so oft Sie möchten.' : isIt ? 'Mantieni i tuoi caricamenti organizzati come progetti modificabili. Modifica il titolo e la descrizione tutte le volte que vuoi.' : isJa ? '編集可能なプロジェクトとしてアップロードを整理。タイトルや説明は何度でも変更可能です。' : isKo ? '업로드된 파일을 편집 가능한 프로젝트로 깔끔하게 정리하세요. 제목과 설명을 원하는 만큼 수정할 수 있습니다.' : isZh ? '将您的上传组织为可编辑的项目。随意修改标题和描述。' : isRu ? 'Организуйте свои загрузки в виде редактируемых проектов. Изменяйте название и описание сколько угодно раз.' : 'Guarda tus subidas organizadas como proyectos editables. Modifica el título y descripción cuantas veces desees.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: UPLOAD FILE SCREEN */}
        {currentView === 'upload' && (
          <UploadForm
            settings={settings}
            onUploadSuccess={() => setRefreshCounter(prev => prev + 1)}
            onViewProjects={() => setCurrentView('projects')}
            uploaderId={uploaderId}
            addNotification={addNotification}
            addActivity={addActivity}
            t={t}
          />
        )}

        {/* VIEW C: MIS PROYECTOS / FILE CATALOG */}
        {currentView === 'projects' && (
          <div className="space-y-6">
            
            {/* Header controls toolbar */}
            <div className={`p-5 rounded-3xl ${
              isDark ? 'bg-neutral-900/40 border border-neutral-800' : 'bg-white border border-neutral-200'
            } flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4`}>
              
              {/* Type Category selection pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 md:pb-0">
                {getFileTypeFilters().map((pill) => (
                  <button
                    key={pill.value}
                    id={`catalog-filter-${pill.value}`}
                    onClick={() => setActiveTypeFilter(pill.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      activeTypeFilter === pill.value
                        ? 'bg-sky-500 text-white'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Sorting, View Switching, and New Project actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Sort selection drop */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-500 cursor-pointer">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <select
                    id="catalog-sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-100 text-xs cursor-pointer"
                  >
                    <option value="recent">{isEn ? 'Most recent first' : isPt ? 'Mais recentes primeiro' : isFr ? 'Plus récents en premier' : isDe ? 'Neueste zuerst' : isIt ? 'Più recenti prima' : isJa ? '最新順' : isKo ? '최신순' : isZh ? '最新优先' : isRu ? 'Сначала новые' : 'Más recientes primero'}</option>
                    <option value="oldest">{isEn ? 'Oldest first' : isPt ? 'Mais antigos primeiro' : isFr ? 'Plus anciens en premier' : isDe ? 'Älteste zuerst' : isIt ? 'Più vecchi prima' : isJa ? '古い順' : isKo ? '오래된순' : isZh ? '最早优先' : isRu ? 'Сначала старые' : 'Más antiguos primero'}</option>
                    <option value="name-a-z">{isEn ? 'Name A-Z' : isPt ? 'Nome A-Z' : isFr ? 'Nom A-Z' : isDe ? 'Name A-Z' : isIt ? 'Nome A-Z' : isJa ? '名前 A-Z' : isKo ? '이름 오름차순' : isZh ? '名称 A-Z' : isRu ? 'Имя А-Я' : 'Nombre A-Z'}</option>
                    <option value="name-z-a">{isEn ? 'Name Z-A' : isPt ? 'Nome Z-A' : isFr ? 'Nom Z-A' : isDe ? 'Name Z-A' : isIt ? 'Nome Z-A' : isJa ? '名前 Z-A' : isKo ? '이름 내림차순' : isZh ? '名称 Z-A' : isRu ? 'Имя Я-А' : 'Nombre Z-A'}</option>
                    <option value="heavy">{isEn ? 'Largest' : isPt ? 'Mais pesados' : isFr ? 'Plus volumineux' : isDe ? 'Größte' : isIt ? 'Più pesanti' : isJa ? 'サイズ大' : isKo ? '크기 큰순' : isZh ? '最大文件' : isRu ? 'Сначала тяжелые' : 'Más pesados'}</option>
                    <option value="light">{isEn ? 'Smallest' : isPt ? 'Mais leves' : isFr ? 'Plus légers' : isDe ? 'Kleinste' : isIt ? 'Più leggeri' : isJa ? 'サイズ小' : isKo ? '크기 작은순' : isZh ? '最小文件' : isRu ? 'Сначала легкие' : 'Más ligeros'}</option>
                    <option value="downloads">{isEn ? 'Most downloaded' : isPt ? 'Mais baixados' : isFr ? 'Plus téléchargés' : isDe ? 'Am häufigsten heruntergeladen' : isIt ? 'Più scaricati' : isJa ? 'ダウンロード数順' : isKo ? '다운로드순' : isZh ? '最多下载' : isRu ? 'По скачиваниям' : 'Más descargados'}</option>
                    <option value="views">{isEn ? 'Most viewed' : isPt ? 'Mais vistos' : isFr ? 'Plus vus' : isDe ? 'Am häufigsten angesehen' : isIt ? 'Più visti' : isJa ? '閲覧数順' : isKo ? '조회순' : isZh ? '最多浏览' : isRu ? 'По просмотрам' : 'Más vistos'}</option>
                    <option value="type">{isEn ? 'File Type' : isPt ? 'Tipo de arquivo' : isFr ? 'Type de fichier' : isDe ? 'Dateityp' : isIt ? 'Tipo di file' : isJa ? 'ファイルタイプ' : isKo ? '파일 유형' : isZh ? '文件类型' : isRu ? 'По типу' : 'Tipo de archivo'}</option>
                  </select>
                </div>

                {/* View switcher (Grid vs List) */}
                <div className="flex items-center gap-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
                  <button
                    id="switch-grid-view"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-900 text-sky-500' : 'text-neutral-400'}`}
                    title={isEn ? 'Grid View' : isPt ? 'Vista de Grade' : isFr ? 'Vue en grille' : isDe ? 'Rasteransicht' : isIt ? 'Vista griglia' : isJa ? 'グリッド表示' : isKo ? '바둑판형 보기' : isZh ? '网格视图' : isRu ? 'Плитка' : 'Vista Cuadrícula'}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    id="switch-list-view"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 text-sky-500' : 'text-neutral-400'}`}
                    title={isEn ? 'List View' : isPt ? 'Vista de Lista' : isFr ? 'Vue en liste' : isDe ? 'Listenansicht' : isIt ? 'Vista elenco' : isJa ? 'リスト表示' : isKo ? '목록형 보기' : isZh ? '列表视图' : isRu ? 'Список' : 'Vista Lista'}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Nuevo Proyecto trigger */}
                <button
                  id="new-project-btn"
                  onClick={() => setCurrentView('upload')}
                  style={{ backgroundColor: themeAccentColor }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow hover:opacity-95 transition-opacity flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isEn ? 'New project' : isPt ? 'Novo projeto' : isFr ? 'Nouveau projet' : isDe ? 'Neues Projekt' : isIt ? 'Nuovo progetto' : isJa ? '新規プロジェクト' : isKo ? '새 프로젝트' : isZh ? '新项目' : isRu ? 'Новый проект' : 'Nuevo proyecto'}
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar (Sticky on selection) */}
            {selectedFileIds.length > 0 && (
              <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 border bg-sky-500/10 border-sky-500/20 text-sky-500 animate-slideUp`}>
                <span className="text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedFileIds.length} {selectedFileIds.length === 1 
                    ? (isEn ? 'file selected' : isPt ? 'arquivo selecionado' : isFr ? 'fichier sélectionné' : isDe ? 'Datei ausgewählt' : isIt ? 'file selezionato' : isJa ? '個のファイルを選択中' : isKo ? '개의 파일 선택됨' : isZh ? '个选中的文件' : isRu ? 'файл выбран' : 'archivo seleccionado') 
                    : (isEn ? 'files selected' : isPt ? 'arquivos selecionados' : isFr ? 'fichiers sélectionnés' : isDe ? 'Dateien ausgewählt' : isIt ? 'file selezionati' : isJa ? '個のファイルを選択中' : isKo ? '개의 파일 선택됨' : isZh ? '个选中的文件' : isRu ? 'файлов выбрано' : 'archivos seleccionados')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    id="bulk-download-btn"
                    onClick={handleBulkDownload}
                    className="px-3.5 py-1.5 text-xs font-bold bg-sky-500 text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isEn ? 'Download selected' : isPt ? 'Baixar selecionados' : isFr ? 'Télécharger la sélection' : isDe ? 'Auswahl herunterladen' : isIt ? 'Scarica selezionati' : isJa ? '選択項目をダウンロード' : isKo ? '선택 항목 다운로드' : isZh ? '下载选中项目' : isRu ? 'Скачать выбранное' : 'Descargar seleccionados'}
                  </button>
                  <button
                    id="bulk-delete-btn"
                    onClick={handleBulkDelete}
                    className="px-3.5 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isEn ? 'Delete selected' : isPt ? 'Excluir selecionados' : isFr ? 'Supprimer la sélection' : isDe ? 'Auswahl löschen' : isIt ? 'Elimina selezionati' : isJa ? '選択項目を削除' : isKo ? '선택 항목 삭제' : isZh ? '删除选中项目' : isRu ? 'Удалить выбранное' : 'Eliminar seleccionados'}
                  </button>
                  <button
                    id="bulk-clear-selection"
                    onClick={() => setSelectedFileIds([])}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    {isEn ? 'Cancel' : isPt ? 'Cancelar' : isFr ? 'Annuler' : isDe ? 'Abbrechen' : isIt ? 'Annulla' : isJa ? 'キャンセル' : isKo ? '취소' : isZh ? '取消' : isRu ? 'Отмена' : 'Cancelar'}
                  </button>
                </div>
              </div>
            )}

            {/* Grid & List Files render */}
            {loadingFiles ? (
              <div className="py-24 text-center text-sm text-neutral-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
                {isEn ? 'Loading projects in FileShare...' : isPt ? 'Carregando projetos no FileShare...' : isFr ? 'Chargement des projets dans FileShare...' : isDe ? 'Projekte in FileShare werden geladen...' : isIt ? 'Caricamento dei progetti su FileShare...' : isJa ? 'FileShareのプロジェクトを読み込み中...' : isKo ? 'FileShare 프로젝트 로딩 중...' : isZh ? '正在加载 FileShare 项目...' : isRu ? 'Загрузка проектов в FileShare...' : 'Cargando proyectos en FileShare...'}
              </div>
            ) : files.length === 0 ? (
              <div className="py-24 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                  <FolderOpen className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-700 dark:text-neutral-300">
                    {isEn ? 'No files found' : isPt ? 'Nenhum arquivo encontrado' : isFr ? 'Aucun fichier trouvé' : isDe ? 'Keine Dateien gefunden' : isIt ? 'Nessun file trovato' : isJa ? 'ファイルが見つかりません' : isKo ? '파일을 찾을 수 없습니다' : isZh ? '未找到文件' : isRu ? 'Файлы не найдены' : 'No se encontraron archivos'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {isEn ? 'Upload your first file using the Upload button or search for other terms in the explorer.' : isPt ? 'Envie seu primeiro arquivo usando o botão Enviar ou busque por outros termos no explorador.' : isFr ? 'Téléchargez votre premier fichier à l’aide du bouton Télécharger ou recherchez d’autres termes dans l’explorateur.' : isDe ? 'Laden Sie Ihre erste Datei mit der Schaltfläche "Hochladen" hoch oder suchen Sie im Explorer nach anderen Begriffen.' : isIt ? 'Carica il tuo primo file usando il pulsante Carica o cerca altri termini nell’esploratore.' : isJa ? '「アップロード」ボタンから最初のファイルをアップロードするか、他の用語で検索してください。' : isKo ? '업로드 버튼을 사용해 첫 번째 파일을 업로드하거나 검색창에서 다른 단어로 검색해 보세요.' : isZh ? '使用“上传”按钮上传您的第一个文件，或在搜索栏中尝试其他词语。' : isRu ? 'Загрузите свой первый файл с помощью кнопки «Загрузить» или введите другой поисковый запрос.' : 'Sube tu primer archivo utilizando el botón Subir o busca por otros términos en el explorador.'}
                  </p>
                </div>
                <button
                  id="catalog-upload-redirect"
                  onClick={() => setCurrentView('upload')}
                  style={{ backgroundColor: themeAccentColor }}
                  className="px-5 py-2.5 rounded-xl font-bold text-white text-xs hover:opacity-90 shadow cursor-pointer"
                >
                  {isEn ? 'Upload a file now' : isPt ? 'Enviar um arquivo agora' : isFr ? 'Télécharger un fichier maintenant' : isDe ? 'Jetzt eine Datei hochladen' : isIt ? 'Carica un file adesso' : isJa ? '今すぐファイルをアップロード' : isKo ? '지금 파일 업로드하기' : isZh ? '现在上传文件' : isRu ? 'Загрузить файл сейчас' : 'Subir un archivo ahora'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Toggle Bar */}
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 font-mono">
                  <button
                    id="select-all-catalog-btn"
                    onClick={handleSelectAllFiles}
                    className="flex items-center gap-2 hover:text-sky-500 cursor-pointer text-left py-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFileIds.length === files.length && files.length > 0}
                      onChange={handleSelectAllFiles}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-sky-500 cursor-pointer pointer-events-none"
                    />
                    <span>{isEn ? 'Select all shown' : isPt ? 'Selecionar todos os mostrados' : isFr ? 'Sélectionner tout' : isDe ? 'Alle angezeigten auswählen' : isIt ? 'Seleziona tutti i mostrati' : isJa ? '表示されているすべての項目を選択' : isKo ? '표시된 모든 항목 선택' : isZh ? '选择全部显示项' : isRu ? 'Выбрать все показанные' : 'Seleccionar todos los mostrados'} ({files.length})</span>
                  </button>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        settings={settings}
                        viewMode="grid"
                        isSelected={selectedFileIds.includes(file.id)}
                        isFavorite={favorites.includes(file.id)}
                        isLiked={likedFiles.includes(file.id)}
                        onToggleSelect={handleToggleSelectFile}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleLike={handleToggleLike}
                        onDownload={handleDownloadFile}
                        onShare={handleShareFile}
                        onEdit={handleEditFile}
                        onDelete={handleDeleteFile}
                        onOpenDetails={setSelectedFile}
                        t={t}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        settings={settings}
                        viewMode="list"
                        isSelected={selectedFileIds.includes(file.id)}
                        isFavorite={favorites.includes(file.id)}
                        isLiked={likedFiles.includes(file.id)}
                        onToggleSelect={handleToggleSelectFile}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleLike={handleToggleLike}
                        onDownload={handleDownloadFile}
                        onShare={handleShareFile}
                        onEdit={handleEditFile}
                        onDelete={handleDeleteFile}
                        onOpenDetails={setSelectedFile}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW D: SEARCH HISTORY */}
        {currentView === 'history' && (
          <HistoryPanel
            settings={settings}
            onSelectQuery={(query) => {
              setSearchQuery(query);
              setCurrentView('projects');
            }}
            onRefreshHistoryTrigger={historyTrigger}
          />
        )}

        {/* VIEW E: SETTINGS / AJUSTES */}
        {currentView === 'settings' && (
          <SettingsPanel
            settings={settings}
            onChangeSettings={setSettings}
            t={t}
          />
        )}

        {/* VIEW F: ADMIN MODERATION */}
        {currentView === 'admin' && (
          <AdminPanel
            settings={settings}
            onRefreshTrigger={() => setRefreshCounter(prev => prev + 1)}
          />
        )}

        {/* VIEW H: NOTIFICATIONS CENTER */}
        {currentView === 'notifications' && (
          <div className={`p-6 rounded-3xl ${isDark ? 'bg-neutral-900/40 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-6`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-500" />
                  <span>{isEn ? 'Notification Center' : isPt ? 'Centro de Notificações' : isFr ? 'Centre de notifications' : isDe ? 'Benachrichtigungszentrum' : isIt ? 'Centro notifiche' : isJa ? '通知センター' : isKo ? '알림 센터' : isZh ? '通知中心' : isRu ? 'Центр уведомлений' : 'Centro de Notificaciones'}</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {isEn ? 'Track the status and reports of your files in real time.' : isPt ? 'Acompanhe o status e denúncias dos seus arquivos em tempo real.' : isFr ? 'Suivez l’état et les rapports de vos fichiers en temps réel.' : isDe ? 'Verfolgen Sie den Status und Berichte Ihrer Dateien in Echtzeit.' : isIt ? 'Monitora lo stato e le segnalazioni dei tuoi file in tempo reale.' : isJa ? 'ファイルのステータスとレポートをリアルタイムで追跡。' : isKo ? '파일 상태 및 신고 내역을 실시간으로 확인하세요.' : isZh ? '实时跟踪文件的状态与举报信息。' : isRu ? 'Отслеживайте статус и жалобы на ваши файлы в реальном времени.' : 'Sigue el estado y reportes de tus archivos en tiempo real.'}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    setNotifications([]);
                    addActivity('clear_notifications', isEn ? 'Cleared notification history.' : isPt ? 'Histórico de notificações limpo.' : isFr ? 'Historique des notifications effacé.' : isDe ? 'Benachrichtigungsverlauf gelöscht.' : isIt ? 'Cronologia notifiche cancellata.' : isJa ? '通知履歴をクリアしました。' : isKo ? '알림 기록을 삭제했습니다.' : isZh ? '已清除通知历史。' : isRu ? 'История уведомлений очищена.' : 'Limpiaste el historial de notificaciones.');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  {isEn ? 'Clear all' : isPt ? 'Limpar tudo' : isFr ? 'Tout effacer' : isDe ? 'Alle löschen' : isIt ? 'Cancella tutto' : isJa ? 'すべて削除' : isKo ? '모두 지우기' : isZh ? '清除全部' : isRu ? 'Очистить все' : 'Limpiar todo'}
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-semibold italic flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-neutral-500/40 animate-bounce" />
                <span>{isEn ? 'No pending notifications.' : isPt ? 'Nenhuma notificação pendente.' : isFr ? 'Aucune notification en attente.' : isDe ? 'Keine ausstehenden Benachrichtigungen.' : isIt ? 'Nessuna notifica in sospeso.' : isJa ? '保留中の通知はありません。' : isKo ? '대기 중인 알림이 없습니다.' : isZh ? '暂无未读通知。' : isRu ? 'Нет новых уведомлений.' : 'No tienes notificaciones pendientes.'}</span>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {notifications.map((notif) => {
                  let IconComponent = Bell;
                  let colorClass = 'text-sky-500 bg-sky-500/10';
                  
                  if (notif.type.includes('success')) {
                    IconComponent = CheckCircle2;
                    colorClass = 'text-green-500 bg-green-500/10';
                  } else if (notif.type.includes('error')) {
                    IconComponent = ShieldX;
                    colorClass = 'text-red-500 bg-red-500/10';
                  } else if (notif.type.includes('start')) {
                    IconComponent = RefreshCw;
                    colorClass = 'text-sky-500 bg-sky-500/10';
                  } else if (notif.type === 'reported') {
                    IconComponent = AlertTriangle;
                    colorClass = 'text-amber-500 bg-amber-500/10';
                  } else if (notif.type === 'scanned') {
                    IconComponent = ShieldCheck;
                    colorClass = 'text-violet-500 bg-violet-500/10';
                  }

                  const timeLabel = new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateLabel = new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <div key={notif.id} className="py-4 flex items-start gap-4 transition-colors">
                      <div className={`p-2.5 rounded-xl ${colorClass} shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-100">{notif.title}</h4>
                          <span className="text-[10px] font-mono text-neutral-400 shrink-0">{dateLabel}, {timeLabel}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW I: ACTIVITY LOG */}
        {currentView === 'activity' && (
          <div className={`p-6 rounded-3xl ${isDark ? 'bg-neutral-900/40 border border-neutral-800' : 'bg-white border border-neutral-200'} space-y-6`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-sky-500" />
                  <span>{isEn ? 'Activity History' : isPt ? 'Histórico de Atividade' : isFr ? 'Historique d’activité' : isDe ? 'Aktivitätsverlauf' : isIt ? 'Cronologia attività' : isJa ? 'アクティビティ履歴' : isKo ? '활동 기록' : isZh ? '活动历史' : isRu ? 'История активности' : 'Historial de Actividad'}</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {isEn ? 'Local log of actions and downloads performed in this browser.' : isPt ? 'Registro local de ações e downloads realizados neste navegador.' : isFr ? 'Journal local des actions et téléchargements effectués dans ce navigateur.' : isDe ? 'Lokales Protokoll der in diesem Browser durchgeführten Aktionen und Downloads.' : isIt ? 'Registro locale delle azioni e dei download eseguiti in questo browser.' : isJa ? 'このブラウザで実行されたアクションとダウンロードのローカル履歴。' : isKo ? '이 브라우저에서 수행한 작업 및 다운로드의 로컬 기록입니다.' : isZh ? '此浏览器中执行的操作和下载的本地记录。' : isRu ? 'Локальный лог действий и скачиваний в этом браузере.' : 'Registro local de acciones y descargas realizadas en este navegador.'}
                </p>
              </div>
              {activities.length > 0 && (
                <button
                  onClick={() => setActivities([])}
                  className="px-3 py-1.5 rounded-xl border border-neutral-500/30 text-neutral-500 text-xs font-bold hover:bg-neutral-500/10 transition-colors cursor-pointer"
                >
                  {isEn ? 'Clear log' : isPt ? 'Limpar histórico' : isFr ? 'Effacer le journal' : isDe ? 'Protokoll löschen' : isIt ? 'Cancella registro' : isJa ? '履歴をクリア' : isKo ? '기록 삭제' : isZh ? '清除记录' : isRu ? 'Очистить лог' : 'Limpiar registro'}
                </button>
              )}
            </div>

            {activities.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-semibold italic flex flex-col items-center gap-2">
                <HistoryIcon className="w-8 h-8 text-neutral-500/40" />
                <span>{isEn ? 'No activities recorded in this session.' : isPt ? 'Nenhuma atividade registrada nesta sessão.' : isFr ? 'Aucune activité enregistrée pour cette session.' : isDe ? 'Keine Aktivitäten in dieser Sitzung aufgezeichnet.' : isIt ? 'Nessuna attività registrata in questa sessione.' : isJa ? 'このセッションに記録されたアクティビティはありません。' : isKo ? '이번 세션에 기록된 활동이 없습니다.' : isZh ? '此会话中未记录任何活动。' : isRu ? 'В этой сессии нет записанных действий.' : 'No hay actividades registradas en esta sesión.'}</span>
              </div>
            ) : (
              <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-3.5 pl-6 space-y-6 py-2">
                {activities.map((act) => {
                  const timeLabel = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateLabel = new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <div key={act.id} className="relative">
                      {/* Timeline dot decoration */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white dark:border-neutral-950" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-300 font-bold text-[9px] font-mono uppercase">
                            {act.action}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">{dateLabel}, {timeLabel}</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 font-medium">{act.details}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW G: LEGALES / PRIVACY POLICY */}
        {currentView === 'legales' && (
          <TermsAndPrivacy settings={settings} />
        )}

        {/* VIEW J: TRASH BIN */}
        {currentView === 'trash' && (
          <TrashPanel
            settings={settings}
            t={t}
            refreshCounter={refreshCounter}
            onRefresh={() => setRefreshCounter(prev => prev + 1)}
            addNotification={addNotification}
            addActivity={addActivity}
            onDelete={handleDeleteFile}
          />
        )}

        {/* VIEW K: LIKED FILES */}
        {currentView === 'likes' && (
          <LikesPanel
            settings={settings}
            t={t}
            allFiles={allFiles}
            likedFiles={likedFiles}
            favorites={favorites}
            selectedFileIds={selectedFileIds}
            onToggleSelect={handleToggleSelectFile}
            onToggleFavorite={handleToggleFavorite}
            onToggleLike={handleToggleLike}
            onDownload={handleDownloadFile}
            onShare={handleShareFile}
            onEdit={handleEditFile}
            onDelete={handleDeleteFile}
            onOpenDetails={setSelectedFile}
            onGoToExplore={() => setCurrentView('projects')}
          />
        )}

      </main>

      {/* 4. DETAIL METADATA IN-DEPTH POPUP MODAL */}
      {selectedFile && (
        <FileDetailModal
          file={selectedFile}
          settings={settings}
          onClose={() => setSelectedFile(null)}
          onRefreshTrigger={() => setRefreshCounter(prev => prev + 1)}
          t={t}
          addNotification={addNotification}
          addActivity={addActivity}
        />
      )}

      {/* EDIT MODAL OVERLAY */}
      {fileToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleConfirmEditSubmit}
            className={`w-full max-w-md p-6 rounded-3xl shadow-xl border animate-in fade-in zoom-in duration-200 ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Box className="w-5 h-5 shrink-0 text-sky-500" />
                <span>{trashTranslations[settings.language]?.editModalTitle || trashTranslations.es.editModalTitle}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setFileToEdit(null)}
                className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">
                  {trashTranslations[settings.language]?.fileName || trashTranslations.es.fileName}
                </label>
                <input
                  id="edit-project-name"
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border bg-transparent outline-none transition-all ${
                    isDark 
                      ? 'border-neutral-800 focus:border-sky-500 text-white' 
                      : 'border-neutral-200 focus:border-sky-500 text-neutral-800'
                  }`}
                  placeholder={trashTranslations[settings.language]?.fileName || trashTranslations.es.fileName}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">
                  {trashTranslations[settings.language]?.fileDesc || trashTranslations.es.fileDesc}
                </label>
                <textarea
                  id="edit-project-description"
                  value={editDescValue}
                  onChange={(e) => setEditDescValue(e.target.value)}
                  rows={3}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border bg-transparent outline-none transition-all ${
                    isDark 
                      ? 'border-neutral-800 focus:border-sky-500 text-white' 
                      : 'border-neutral-200 focus:border-sky-500 text-neutral-800'
                  }`}
                  placeholder={trashTranslations[settings.language]?.fileDesc || trashTranslations.es.fileDesc}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="edit-project-cancel-btn"
                type="button"
                onClick={() => setFileToEdit(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                {trashTranslations[settings.language]?.cancel || trashTranslations.es.cancel}
              </button>
              <button
                id="edit-project-submit-btn"
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                {trashTranslations[settings.language]?.saveChanges || trashTranslations.es.saveChanges}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL OVERLAY */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl border animate-in fade-in zoom-in duration-200 ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{trashTranslations[settings.language]?.deleteModalTitle || trashTranslations.es.deleteModalTitle}</span>
              </h3>
              <button 
                onClick={() => setFileToDelete(null)}
                className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
            
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              {settings.language === 'en' 
                ? `Are you sure you want to delete "${fileToDelete.name}"?`
                : settings.language === 'pt'
                ? `Tem certeza que deseja excluir "${fileToDelete.name}"?`
                : `¿Estás seguro de que deseas borrar "${fileToDelete.name}"?`}
            </p>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500 mb-5 leading-relaxed flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{trashTranslations[settings.language]?.deleteModalWarning || trashTranslations.es.deleteModalWarning}</span>
            </div>

            <label className="flex items-start gap-2.5 mb-6 cursor-pointer group">
              <input
                id="delete-permanently-checkbox"
                type="checkbox"
                checked={deletePermanently}
                onChange={(e) => setDeletePermanently(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-red-500 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 group-hover:text-red-500 transition-colors select-none">
                {trashTranslations[settings.language]?.deletePermanentlyCheck || trashTranslations.es.deletePermanentlyCheck}
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                id="confirm-delete-cancel-btn"
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                {trashTranslations[settings.language]?.cancel || trashTranslations.es.cancel}
              </button>
              <button
                id="confirm-delete-submit-btn"
                onClick={handleConfirmDeleteSubmit}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                {deletePermanently 
                  ? (trashTranslations[settings.language]?.deletePermanent || trashTranslations.es.deletePermanent)
                  : (settings.language === 'en' ? 'Move to Trash' : settings.language === 'pt' ? 'Mover para Lixeira' : 'Mover a Papelera')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. APP FOOTER */}
      <footer className="mt-auto border-t border-neutral-200/45 dark:border-neutral-800/45 py-6 px-4 bg-neutral-50 dark:bg-neutral-900/10 text-xs shrink-0 text-center text-neutral-500 font-medium">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span>
              {isEn 
                ? '© 2026 FileShare Inc.' 
                : isPt 
                ? '© 2026 FileShare Inc.' 
                : isFr 
                ? '© 2026 FileShare Inc.' 
                : isDe 
                ? '© 2026 FileShare Inc.' 
                : isIt 
                ? '© 2026 FileShare Inc.' 
                : isJa 
                ? '© 2026 FileShare Inc.' 
                : isKo 
                ? '© 2026 FileShare Inc.' 
                : isZh 
                ? '© 2026 FileShare Inc.' 
                : isRu 
                ? '© 2026 FileShare Inc.' 
                : '© 2026 FileShare Inc.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => { setCurrentView('legales'); window.scrollTo(0, 0); }} 
              className="hover:text-sky-500 cursor-pointer"
            >
              {isEn ? 'Terms of Use' : isPt ? 'Termos de Uso' : isFr ? 'Conditions d’utilisation' : isDe ? 'Nutzungsbedingungen' : isIt ? 'Termini di utilizzo' : isJa ? '利用規約' : isKo ? '이용 약관' : isZh ? '使用条款' : isRu ? 'Условия использования' : 'Términos de Uso'}
            </button>
            <button 
              onClick={() => { setCurrentView('legales'); window.scrollTo(0, 0); }} 
              className="hover:text-sky-500 cursor-pointer"
            >
              {isEn ? 'Privacy Policy' : isPt ? 'Política de Privacidade' : isFr ? 'Politique de confidentialité' : isDe ? 'Datenschutzerklärung' : isIt ? 'Informativa sulla privacy' : isJa ? 'プライバシーポリシー' : isKo ? '개인정보 처리방침' : isZh ? '隐私政策' : isRu ? 'Политика конфиденциальности' : 'Política de Privacidad'}
            </button>
            <button 
              onClick={() => setCurrentView('settings')} 
              className="hover:text-sky-500 cursor-pointer"
            >
              {t.settingsBtn}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
