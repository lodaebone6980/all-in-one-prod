import { motion } from 'framer-motion';
import { useChannelStore } from '../../stores/use-channel-store';
import { ChannelSearch } from './components/channel-search';
import { VideoAnalysis } from './components/video-analysis';
import { KeywordResearch } from './components/keyword-research';

const SUB_TABS = [
  { id: 'channel-search' as const, label: '채널 검색', icon: '📺' },
  { id: 'video-analysis' as const, label: '영상 분석', icon: '🎬' },
  { id: 'keyword-research' as const, label: '키워드 리서치', icon: '🔑' },
  { id: 'channel-room' as const, label: '채널룸', icon: '🏠' },
];

export default function ChannelAnalysisTab() {
  const { subTab, setSubTab, presets } = useChannelStore();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔍</span> 채널/영상 분석
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            YouTube 채널 및 영상을 분석하세요. SEO 키워드, 경쟁도, 기회점수를 확인합니다.
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                subTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {subTab === tab.id && (
                <motion.div
                  layoutId="channelSubTab"
                  className="absolute inset-0 bg-indigo-600/30 rounded-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <span>{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {subTab === 'channel-search' && <ChannelSearch />}
        {subTab === 'video-analysis' && <VideoAnalysis />}
        {subTab === 'keyword-research' && <KeywordResearch />}
        {subTab === 'channel-room' && <ChannelRoom presets={presets} />}
      </motion.div>
    </div>
  );
}

function ChannelRoom({ presets }: { presets: import('../../stores/use-channel-store').ChannelPreset[] }) {
  const { removePreset, setSubTab, setSelectedChannel } = useChannelStore();

  if (presets.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-3">🏠</span>
        <p className="text-sm text-gray-500 mb-2">채널룸이 비어있습니다</p>
        <p className="text-xs text-gray-600 mb-4">채널 검색에서 ★ 버튼으로 프리셋을 등록하세요</p>
        <button
          onClick={() => setSubTab('channel-search')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          채널 검색하기
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {presets.map((preset) => (
        <motion.div
          key={preset.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all group"
        >
          <div className="flex items-center gap-3">
            <img src={preset.thumbnailUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{preset.channelTitle}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {new Date(preset.addedAt).toLocaleDateString('ko-KR')} 등록
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setSelectedChannel({
                  id: preset.channelId,
                  title: preset.channelTitle,
                  thumbnailUrl: preset.thumbnailUrl,
                  description: '',
                  subscriberCount: 0,
                  videoCount: 0,
                  viewCount: 0,
                  publishedAt: '',
                });
                setSubTab('channel-search');
              }}
              className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
            >
              분석하기
            </button>
            <button
              onClick={() => removePreset(preset.id)}
              className="px-3 py-1.5 text-gray-500 hover:text-red-400 text-xs transition-colors"
            >
              제거
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
