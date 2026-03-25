export type TabId =
  | 'project'
  | 'channel-analysis'
  | 'script-writer'
  | 'sound-studio'
  | 'image-video'
  | 'edit-room'
  | 'thumbnail-studio'
  | 'upload'
  | 'character-twist'
  | 'image-script-upload'
  | 'ppt-master'
  | 'detail-page'
  | 'subtitle-remover';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

export interface ApiKeys {
  evolink: string;
  gemini: string;
  kieAi: string;
  xAi: string;
  typecast: string;
  youtubeDataApi: string;
  cloudinary: string;
  removeBg: string;
  apimart: string;
  coupangAccessKey: string;
  coupangSecretKey: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  data: Record<string, unknown>;
}

export interface CostTracker {
  totalUsd: number;
  breakdown: { model: string; cost: number; timestamp: number }[];
}
