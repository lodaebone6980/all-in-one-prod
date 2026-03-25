import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../../stores/use-app-store';
import { useChannelStore } from '../../../stores/use-channel-store';
import {
  searchChannels, getChannelVideos, formatNumber, calcChannelScore,
  type YouTubeChannel,
} from '../../../services/youtube-api';

export function ChannelSearch() {
  const apiKey = useAppStore((s) => s.apiKeys.youtubeDataApi);
  const {
    channelQuery, setChannelQuery, channels, setChannels,
    selectedChannel, setSelectedChannel, channelVideos, setChannelVideos,
    loading, setLoading, presets, addPreset, removePreset,
  } = useChannelStore();
  const [showDetail, setShowDetail] = useState(false);

  const handleSearch = async () => {
    if (!channelQuery.trim()) return;
    if (!apiKey) {
      toast.error('설정에서 YouTube Data API 키를 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const results = await searchChannels(apiKey, channelQuery);
      setChannels(results);
    } catch (err: any) {
      toast.error(err.message || '채널 검색 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChannel = async (channel: YouTubeChannel) => {
    setSelectedChannel(channel);
    setShowDetail(true);
    if (!apiKey) return;
    setLoading(true);
    try {
      const videos = await getChannelVideos(apiKey, channel.id);
      setChannelVideos(videos);
    } catch (err: any) {
      toast.error(err.message || '영상 목록 가져오기 실패');
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (channelId: string) => presets.some((p) => p.channelId === channelId);

  const toggleBookmark = (channel: YouTubeChannel) => {
    const existing = presets.find((p) => p.channelId === channel.id);
    if (existing) {
      removePreset(existing.id);
      toast.success('프리셋에서 제거했습니다');
    } else {
      addPreset({
        name: channel.title,
        channelId: channel.id,
        channelTitle: channel.title,
        thumbnailUrl: channel.thumbnailUrl,
      });
      toast.success('프리셋에 추가했습니다');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={channelQuery}
          onChange={(e) => setChannelQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="채널명 또는 키워드로 검색..."
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium shrink-0"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-gray-500 shrink-0">프리셋:</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                handleSelectChannel({
                  id: preset.channelId,
                  title: preset.channelTitle,
                  thumbnailUrl: preset.thumbnailUrl,
                  description: '',
                  subscriberCount: 0,
                  videoCount: 0,
                  viewCount: 0,
                  publishedAt: '',
                })
              }
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors shrink-0"
            >
              <img src={preset.thumbnailUrl} alt="" className="w-4 h-4 rounded-full" />
              {preset.channelTitle}
            </button>
          ))}
        </div>
      )}

      {/* Channel Results */}
      <AnimatePresence mode="wait">
        {showDetail && selectedChannel ? (
          <ChannelDetail
            channel={selectedChannel}
            videos={channelVideos}
            loading={loading}
            isBookmarked={isBookmarked(selectedChannel.id)}
            onToggleBookmark={() => toggleBookmark(selectedChannel)}
            onBack={() => { setShowDetail(false); setSelectedChannel(null); }}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {channels.map((ch) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all cursor-pointer group"
                onClick={() => handleSelectChannel(ch)}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={ch.thumbnailUrl}
                    alt={ch.title}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{ch.title}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(ch); }}
                        className={`text-sm shrink-0 ${isBookmarked(ch.id) ? 'text-yellow-400' : 'text-gray-600 opacity-0 group-hover:opacity-100'} transition-all`}
                      >
                        {isBookmarked(ch.id) ? '★' : '☆'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{ch.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>구독자 {formatNumber(ch.subscriberCount)}</span>
                      <span>영상 {formatNumber(ch.videoCount)}</span>
                      <span>조회수 {formatNumber(ch.viewCount)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && channels.length === 0 && !showDetail && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-sm text-gray-500">채널명이나 키워드를 입력하여 검색하세요</p>
        </div>
      )}
    </div>
  );
}

function ChannelDetail({
  channel,
  videos,
  loading,
  isBookmarked,
  onToggleBookmark,
  onBack,
}: {
  channel: YouTubeChannel;
  videos: import('../../../services/youtube-api').YouTubeVideo[];
  loading: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBack: () => void;
}) {
  const score = calcChannelScore(channel);
  const avgViews = videos.length > 0 ? Math.floor(videos.reduce((a, v) => a + v.viewCount, 0) / videos.length) : 0;
  const avgEngagement = videos.length > 0
    ? (videos.reduce((a, v) => a + (v.viewCount > 0 ? ((v.likeCount + v.commentCount) / v.viewCount) * 100 : 0), 0) / videos.length).toFixed(2)
    : '0';

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Back button & header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <img src={channel.thumbnailUrl} alt="" className="w-10 h-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{channel.title}</h3>
          <p className="text-xs text-gray-500">구독자 {formatNumber(channel.subscriberCount)} | 영상 {formatNumber(channel.videoCount)}</p>
        </div>
        <button
          onClick={onToggleBookmark}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isBookmarked ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {isBookmarked ? '★ 프리셋 등록됨' : '☆ 프리셋 등록'}
        </button>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreCard label="종합 점수" value={score.overall} color="indigo" />
        <ScoreCard label="성장 잠재력" value={score.growthPotential} color="green" />
        <ScoreCard label="일관성" value={score.consistency} color="blue" />
        <ScoreCard label="참여도" value={score.engagement} color="purple" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500">평균 조회수</p>
          <p className="text-lg font-bold text-white mt-1">{formatNumber(avgViews)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500">평균 참여율</p>
          <p className="text-lg font-bold text-white mt-1">{avgEngagement}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500">총 조회수</p>
          <p className="text-lg font-bold text-white mt-1">{formatNumber(channel.viewCount)}</p>
        </div>
      </div>

      {/* Recent Videos */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">최근 영상 ({videos.length}개)</h4>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex gap-3 hover:border-gray-700 transition-colors">
                <img src={video.thumbnailUrl} alt="" className="w-28 h-16 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-medium text-white line-clamp-2">{video.title}</h5>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                    <span>조회수 {formatNumber(video.viewCount)}</span>
                    <span>좋아요 {formatNumber(video.likeCount)}</span>
                    <span>댓글 {formatNumber(video.commentCount)}</span>
                    <span>{new Date(video.publishedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {video.tags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500">#{tag}</span>
                      ))}
                      {video.tags.length > 5 && (
                        <span className="text-[10px] text-gray-600">+{video.tags.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-current"
        />
      </div>
    </div>
  );
}
