import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/use-app-store';

// Sub-tab definitions matching original exactly
const SUB_TABS = [
  { id: 'keyword-lab', label: '키워드 랩', icon: '🔍' },
  { id: 'channel-room', label: '채널 분석실', icon: '📊' },
  { id: 'video-room', label: '영상 분석실', icon: '🎬' },
  { id: 'social-room', label: '소셜 분석실', icon: '📱' },
  { id: 'view-alert', label: '조회수 알림', icon: '🔔' },
] as const;

type SubTabId = typeof SUB_TABS[number]['id'];

// Lazy-loaded sub-components
const KeywordLab = lazy(() => import('./components/keyword-lab'));
const ChannelRoom = lazy(() => import('./components/channel-room'));
const VideoRoom = lazy(() => import('./components/video-room'));
const SocialRoom = lazy(() => import('./components/social-room'));
const ViewAlertPanel = lazy(() => import('./components/view-alert-panel'));

// YouTube API quota tracking
const QUOTA_LIMIT = 10000;
const QUOTA_COSTS = [
  { label: '키워드 검색', cost: 100 },
  { label: '영상 상세 조회', cost: 1 },
  { label: '채널 정보 조회', cost: 1 },
  { label: '댓글 조회', cost: 1 },
  { label: '자막 조회', cost: 50 },
];

export default function ChannelAnalysisTab() {
  const [subTab, setSubTab] = useState<SubTabId>('channel-room');
  const [showQuota, setShowQuota] = useState(false);
  const apiKeys = useAppStore((s) => s.apiKeys);

  const quotaUsed = Number(localStorage.getItem('YOUTUBE_QUOTA_USED') || '0');
  const remaining = QUOTA_LIMIT - quotaUsed;
  const quotaPercent = (quotaUsed / QUOTA_LIMIT) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            📡 채널/영상 분석
          </h1>
          <p className="text-base text-gray-400 mt-1">
            키워드 리서치와 채널 벤치마킹으로 콘텐츠 전략을 수립하세요.
          </p>
        </div>

        {/* API Quota dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuota(!showQuota)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
          >
            API 사용량
          </button>
          {showQuota && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl z-50">
              <h4 className="text-xs font-medium text-white mb-2">YouTube Data API v3 쿼터</h4>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>오늘 사용량: {quotaUsed}</span>
                <span>/ {QUOTA_LIMIT} units</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full mb-2 overflow-hidden">
                <div className={`h-full rounded-full ${quotaPercent >= 90 ? 'bg-amber-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, quotaPercent)}%` }} />
              </div>
              <p className="text-xs text-gray-500 mb-3">잔여: {remaining} units</p>
              {quotaPercent >= 90 && (
                <p className="text-xs text-amber-400 mb-2">⚠ 쿼터 한도 임박</p>
              )}
              <div className="border-t border-gray-800 pt-2 space-y-1">
                {QUOTA_COSTS.map((c) => (
                  <div key={c.label} className="flex justify-between text-[10px] text-gray-500">
                    <span>{c.label}</span><span>{c.cost} units</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-2">매일 자정(UTC) 자동 리셋</p>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-gray-700">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`relative px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
              subTab === tab.id ? 'text-blue-400 border-blue-500' : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{tab.icon}</span>{tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
