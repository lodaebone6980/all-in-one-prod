import { useState, Suspense, lazy } from 'react';
import { toast } from 'sonner';

const SUB_TABS = [
  { id: 'setup', label: '스타일 선택', icon: '🎨' },
  { id: 'storyboard', label: '스토리보드', icon: '🎬' },
  { id: 'remake', label: '영상 리메이크', icon: '🔄' },
] as const;

type SubTab = typeof SUB_TABS[number]['id'];

const SetupPanel = lazy(() => import('./setup-panel'));
const StoryboardPanel = lazy(() => import('./storyboard-panel'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-orange-400 rounded-full animate-spin" />
        <span className="text-gray-500 text-base">로딩 중...</span>
      </div>
    </div>
  );
}

export default function ImageVideoTab() {
  const [subTab, setSubTab] = useState<SubTab>('setup');

  const handleTabChange = (tab: SubTab) => {
    if (tab === 'storyboard') {
      // Guard: check if scenes exist (would check project store)
      toast.info('장면이 없습니다. 프로젝트 설정에서 장면 분석을 먼저 실행하세요.');
    }
    setSubTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center text-xl shadow-lg">🎬</div>
          <div>
            <h1 className="text-2xl font-bold text-white">이미지/영상</h1>
            <p className="text-gray-400 text-base">대본 기반 장면 분석, 이미지 및 영상 생성을 관리합니다</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          {SUB_TABS.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                subTab === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSpinner />}>
          {subTab === 'setup' && <SetupPanel />}
          {subTab === 'storyboard' && <StoryboardPanel />}
          {subTab === 'remake' && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
              <span className="text-4xl block mb-3">🔄</span>
              <h3 className="text-base font-semibold text-white mb-2">영상 리메이크</h3>
              <p className="text-sm text-gray-500">기존 영상의 스타일을 분석하고 새로운 스타일로 리메이크합니다.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
