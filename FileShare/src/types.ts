export interface FileReport {
  id: string;
  reason: string;
  comments: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface VersionItem {
  id: string;
  version: string;
  size: number;
  uploadDate: string;
  fileName: string;
}

export interface FileMetadata {
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
  rating: number; // average (0 to 5)
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

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'upload_start' | 'upload_progress' | 'upload_success' | 'upload_error' | 'download_start' | 'reported' | 'scanned' | 'deleted' | 'info';
  timestamp: string;
  read: boolean;
}

export interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export type ThemeType = 'light' | 'dark' | 'custom';
export type StyleType = 'normal' | 'liquid-glass';
export type AnimationType = 'activated' | 'reduced' | 'disabled';

export interface AppSettings {
  theme: ThemeType;
  customColor: string; // hex color for primary
  style: StyleType;
  animations: AnimationType;
  language: string; // language code, e.g. "es", "en", etc.
}
