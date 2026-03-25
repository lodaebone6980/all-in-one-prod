import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../../stores/use-app-store';
import { useChannelStore } from '../../../stores/use-channel-store';
import { searchVideos, formatNumber, parseDuration, calcEngagementRate } from '../../../services/youtube-api';

export function VideoAnalysis() {
  const apiKey = useAppStore((s) => s.apiKeys.youtubeDataApi);
  const { videoQuery, setVideoQuery, videos, setVideos, loading, setLoading } = useChannelStore();

  const handleSearch = async () => {
    if (!videoQuery.trim()) return;
    if (!apiKey) {
      toast.error('설정에서 YouTube Data API 키를 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const results = await searchVideos(apiKey, videoQuery);
      setVideos(results);
    } catch (err: any) {
      toast.error(err.message || '영상 검색 실패');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 5) return 'text-emerald-400';
    if (rate >= 2) return 'text-blue-400';
    if (rate >= 1) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={videoQuery}
          onChange={(e) => setVideoQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="키워드로 영상을 검색하세요..."
          className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium shrink-0"
        >
          {loading ? '분석 중...' : '분석'}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length > 0 ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="평균 조회수" value={formatNumber(Math.floor(videos.reduce((a, v) => a + v.viewCount, 0) / videos.length))} />
            <StatBox label="평균 좋아요" value={formatNumber(Math.floor(videos.reduce((a, v) => a + v.likeCount, 0) / videos.length))} />
            <StatBox label="평균 댓글" value={formatNumber(Math.floor(videos.reduce((a, v) => a + v.commentCount, 0) / videos.length))} />
            <StatBox
              label="평균 참여율"
              value={`${(videos.reduce((a, v) => a + calcEngagementRate(v), 0) / videos.length).toFixed(2)}%`}
            />
          </div>

          {/* Video list */}
          <div className="space-y-2">
            {videos.map((video, idx) => {
              const er = calcEngagementRate(video);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex gap-3 hover:border-gray-700 transition-colors"
                >
                  <div className="relative shrink-0">
                    <img src={video.thumbnailUrl} alt="" className="w-36 h-20 rounded object-cover" />
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 rounded text-[10px] text-white font-mono">
                      {parseDuration(video.duration)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-medium text-white line-clamp-2">{video.title}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">{video.channelTitle}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="text-gray-400">조회수 {formatNumber(video.viewCount)}</span>
                      <span className="text-gray-400">좋아요 {formatNumber(video.likeCount)}</span>
                      <span className="text-gray-400">댓글 {formatNumber(video.commentCount)}</span>
                      <span className={`font-medium ${getEngagementColor(er)}`}>
                        참여율 {er.toFixed(2)}%
                      </span>
                    </div>
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {video.tags.slice(0, 8).map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-gray-600">
                      {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🎬</span>
          <p className="text-sm text-gray-500">키워드를 입력하여 영상을 분석하세요</p>
          <p className="text-xs text-gray-600 mt-1">조회수, 참여율 등을 비교 분석합니다</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-base font-bold text-white mt-0.5">{value}</p>
    </div>
  );
}
