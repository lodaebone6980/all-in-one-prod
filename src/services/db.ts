import Dexie, { type EntityTable } from 'dexie';
import type { Project } from '../types';

// Matching original IndexedDB schema: ai-storyboard-v2, version 8
interface Character { id: string; [key: string]: unknown; }
interface MusicTrack { id: string; [key: string]: unknown; }
interface Benchmark { id: string; [key: string]: unknown; }
interface AudioBlob { id: string; blob: Blob; [key: string]: unknown; }
interface VideoAnalysis { id: string; [key: string]: unknown; }
interface ProjectSummary {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
  mode?: string;
  aspectRatio?: string;
  atmosphere?: string;
  sceneCount: number;
  completedImages: number;
  completedVideos: number;
  thumbnailUrl?: string;
  estimatedSizeMB?: number;
  lastActiveTab?: string;
  pipelineSteps?: Record<string, boolean>;
  isManuallyNamed?: boolean;
  sceneImageUrls?: string[];
}

const db = new Dexie('ai-storyboard-v2') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  project_summaries: EntityTable<ProjectSummary, 'id'>;
  characters: EntityTable<Character, 'id'>;
  music: EntityTable<MusicTrack, 'id'>;
  benchmarks: EntityTable<Benchmark, 'id'>;
  'audio-blobs': EntityTable<AudioBlob, 'id'>;
  'video-analysis': EntityTable<VideoAnalysis, 'id'>;
};

db.version(8).stores({
  projects: 'id, name, createdAt, updatedAt',
  project_summaries: 'id, title, createdAt, lastModified',
  characters: 'id',
  music: 'id',
  benchmarks: 'id',
  'audio-blobs': 'id',
  'video-analysis': 'id',
});

export { db };
export type { ProjectSummary };
