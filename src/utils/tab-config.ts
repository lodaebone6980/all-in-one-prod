import type { TabId } from '../types';

export interface NavTab {
  id: TabId;
  label: string;
  icon: string;
  badge?: string;
  activeColor: string; // tailwind color prefix e.g. 'blue','violet'
}

// Main pipeline tabs (always visible in sidebar)
export const PIPELINE_TABS: NavTab[] = [
  { id: 'project', label: '프로젝트', icon: '📁', activeColor: 'gray' },
  { id: 'channel-analysis', label: '채널/영상 분석', icon: '🔍', badge: '🔥', activeColor: 'blue' },
  { id: 'script-writer', label: '대본작성', icon: '✍️', badge: '🔥', activeColor: 'violet' },
];

// Post-production tabs (accordion "후반작업")
export const POST_PROD_TABS: NavTab[] = [
  { id: 'sound-studio', label: '사운드스튜디오', icon: '🎵', activeColor: 'fuchsia' },
  { id: 'image-video', label: '이미지/영상', icon: '🎬', activeColor: 'orange' },
  { id: 'edit-room', label: '편집실', icon: '✂️', activeColor: 'amber' },
  { id: 'upload', label: '업로드', icon: '📤', activeColor: 'green' },
];

// Toolbox tabs (accordion "도구모음")
export const TOOLBOX_TABS: NavTab[] = [
  { id: 'thumbnail-studio', label: '썸네일 스튜디오', icon: '🖼️', activeColor: 'pink' },
  { id: 'character-twist', label: '캐릭터 비틀기', icon: '🌀', activeColor: 'orange' },
  { id: 'image-script-upload', label: '소스 임포트', icon: '📸', activeColor: 'emerald' },
  { id: 'ppt-master', label: 'PPT 마스터', icon: '📊', activeColor: 'sky' },
  { id: 'detail-page', label: '쇼핑콘텐츠', icon: '🛒', activeColor: 'teal' },
  { id: 'subtitle-remover', label: '자막/워터마크 제거', icon: '🧹', activeColor: 'cyan' },
];

// Pipeline breadcrumb steps
export const PIPELINE_STEPS = [
  { id: 'project' as TabId, label: '프로젝트', num: 0 },
  { id: 'channel-analysis' as TabId, label: '채널/영상 분석', num: 1 },
  { id: 'script-writer' as TabId, label: '대본', num: 2 },
  { id: 'sound-studio' as TabId, label: '사운드', num: 3 },
  { id: 'image-video' as TabId, label: '이미지/영상', num: 4 },
  { id: 'edit-room' as TabId, label: '편집실', num: 5 },
  { id: 'upload' as TabId, label: '업로드', num: 6 },
];

export const ALL_TABS = [...PIPELINE_TABS, ...POST_PROD_TABS, ...TOOLBOX_TABS];

export function isPipelineTab(id: TabId): boolean {
  return PIPELINE_STEPS.some((s) => s.id === id);
}

export function getActiveColorClasses(color: string, active: boolean) {
  if (!active) return 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60';
  const map: Record<string, string> = {
    gray: 'bg-gray-700/30 text-gray-200 border border-gray-500/30',
    blue: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
    violet: 'bg-violet-600/20 text-violet-400 border border-violet-500/30',
    fuchsia: 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30',
    orange: 'bg-orange-600/20 text-orange-400 border border-orange-500/30',
    amber: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    green: 'bg-green-600/20 text-green-400 border border-green-500/30',
    pink: 'bg-pink-600/20 text-pink-400 border border-pink-500/30',
    emerald: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    sky: 'bg-sky-600/20 text-sky-400 border border-sky-500/30',
    teal: 'bg-teal-600/20 text-teal-400 border border-teal-500/30',
    cyan: 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30',
  };
  return map[color] || map.gray;
}
