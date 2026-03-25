import { Suspense, lazy, useState } from 'react';
import { useAppStore } from '../../stores/use-app-store';

const SUB_TABS = [
  { id: 'keyword-lab', label: '키워드 랩', icon: '🔍' },
  { id: 'channel-room', label: '채널 분석실', icon: '📊' },
  { id: 'video-room', label: '영상 분석실', icon: '🎬' },
  { id: 'social-room', label: '소셜 분석실', icon: '📱' },
  { id: 'view-alert', label: '조회수 알림', icon: '🔔' },
] as const;

type SubTabId = typeof SUB_TABS[number]['id'];

const KeywordLab = lazy(() => import('./components/keyword-lab'));
const ChannelRoom = lazy(() => import('./components/channel-room'));
const VideoRoom = lazy(() => import('./components/video-room'));
const SocialRoom = lazy(() => import('./components/social-room'));
const ViewAlertPanel = lazy(() => import('./components/view-alert-panel'));

const QUOTA_LIMIT = 10000;

export default function ChannelAnalysisTab() {
  const [subTab, setSubTab] = useState<SubTabId>('channel-room');
  const [showCompanionBanner, setShowCompanionBanner] = useState(true);

  const quotaUsed = Number(localStorage.getItem('YOUTUBE_QUOTA_USED') || '0');

  return (
    <div className="w-full">
      {/* Companion App Banner */}
      {showCompanionBanner && (
        <div className="mb-6 bg-gradient-to-r from-indigo-900/80 to-violet-900/60 border border-indigo-500/30 rounded-xl p-5 relative">
          <button onClick={() => setShowCompanionBanner(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg">✕</button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0">🚀</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">NEW</span>
                <h3 className="text-base font-bold text-white">All In One Helper 출시</h3>
              </div>
              <p className="text-sm text-gray-300">
                다운로드 3~7배 빠름 · 음성 인식/합성 무료 · 배경 제거 무제한 · 영상 렌더링 초고속
              </p>
              <p className="text-xs text-gray-400 mt-0.5">헬퍼 앱 하나만 설치하면 모든 기능이 자동으로 활성화됩니다.</p>
              <div className="flex items-center gap-3 mt-3">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors">
                  🍎 macOS 다운로드
                </button>
                <span className="text-xs text-gray-500">🪟 Windows 버전 곧 공개 예정</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Header with API Usage */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl">📡</div>
          <div>
            <h1 className="text-xl font-bold text-white">채널/영상 분석</h1>
            <p className="text-sm text-gray-400">키워드 리서치와 채널 벤치마킹으로 콘텐츠 전략을 수립하세요.</p>
          </div>
        </div>

        {/* API Usage inline */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>API 사용량</span>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (quotaUsed / QUOTA_LIMIT) * 100)}%` }} />
          </div>
          <span className="text-xs">{quotaUsed} / {QUOTA_LIMIT.toLocaleString()} ∨</span>
        </div>
      </div>

      {/* Sub-tabs - border-bottom style */}
      <div className="flex border-b border-gray-700 mb-6">
        {SUB_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              subTab === tab.id ? 'text-blue-400 border-blue-500' : 'text-gray-500 hover:text-gray-300 border-transparent'
            }`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin" />
        </div>
      }>
        {subTab === 'keyword-lab' && <KeywordLab />}
        {subTab === 'channel-room' && <ChannelRoom />}
        {subTab === 'video-room' && <VideoRoom />}
        {subTab === 'social-room' && <SocialRoom />}
        {subTab === 'view-alert' && <ViewAlertPanel />}
      </Suspense>
    </div>
  );
}
