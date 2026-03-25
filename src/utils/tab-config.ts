import type { TabConfig } from '../types';

export const TAB_LIST: TabConfig[] = [
  { id: 'project', label: '프로젝트', icon: '📁', description: '프로젝트 관리' },
  { id: 'channel-analysis', label: '채널/영상 분석', icon: '🔍', description: 'YouTube 채널 및 영상 분석' },
  { id: 'script-writer', label: '대본작성', icon: '✍️', description: 'AI 대본 생성' },
  { id: 'sound-studio', label: '사운드 스튜디오', icon: '🎵', description: 'AI 음성 합성 & 사운드' },
  { id: 'image-video', label: '이미지/영상', icon: '🎬', description: 'AI 이미지 & 영상 생성' },
  { id: 'edit-room', label: '편집실', icon: '✂️', description: '영상 편집 워크스페이스' },
  { id: 'thumbnail-studio', label: '썸네일 스튜디오', icon: '🖼️', description: 'AI 썸네일 생성' },
  { id: 'upload', label: '업로드', icon: '📤', description: '멀티플랫폼 업로드' },
  { id: 'character-twist', label: '캐릭터 비틀기', icon: '🌀', description: '캐릭터 변환 랩' },
  { id: 'source-import', label: '소스 임포트', icon: '📸', description: '외부 소스 가져오기' },
  { id: 'ppt-master', label: 'PPT 마스터', icon: '📊', description: '프레젠테이션 생성' },
  { id: 'detail-page', label: '쇼핑콘텐츠', icon: '🛒', description: '쇼핑 상세페이지 제작' },
  { id: 'subtitle-remover', label: '자막/워터마크 제거', icon: '🧹', description: 'AI 자막/워터마크 제거' },
  { id: 'companion-banner', label: '컴패니언 배너', icon: '🏷️', description: '프로모션 배너' },
  { id: 'view-alert', label: '조회수 알림', icon: '📈', description: 'YouTube 조회수 추적' },
];
