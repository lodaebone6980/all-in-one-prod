import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface TrackedVideo {
  id: string;
  videoId: string;
  title: string;
  currentViews: number;
  targetViews: number;
  addedAt: number;
  notified: boolean;
}

export default function ViewAlertTab() {
  const [videos, setVideos] = useState<TrackedVideo[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [targetViews, setTargetViews] = useState(1000);

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleAdd = () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) { toast.error('올바른 YouTube URL을 입력해주세요'); return; }

    setVideos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        videoId,
        title: `영상 ${videoId}`,
        currentViews: Math.floor(Math.random() * targetViews * 0.8),
        targetViews,
        addedAt: Date.now(),
        notified: false,
      },
    ]);
    setVideoUrl('');
    toast.success('영상 추적이 시작되었습니다');

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleRemove = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success('추적을 중지했습니다');
  };

  const handleRefresh = () => {
    setVideos((prev) =>
      prev.map((v) => {
        const newViews = v.currentViews + Math.floor(Math.random() * 100);
        if (newViews >= v.targetViews && !v.notified) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎉 조회수 달성!', { body: `${v.title}이 ${v.targetViews.toLocaleString()}회를 달성했습니다!` });
          }
          toast.success(`🎉 ${v.title} - 목표 달성!`);
          return { ...v, currentViews: newViews, notified: true };
        }
        return { ...v, currentViews: newViews };
      })
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>📈</span> 조회수 알림</h2>
            <p className="text-sm text-gray-400 mt-1">YouTube 영상의 조회수를 추적하고 알림을 받으세요</p>
          </div>
          {videos.length > 0 && (
            <button onClick={handleRefresh} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              🔄 새로고침
            </button>
          )}
        </div>

        {/* Add video */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex gap-2">
            <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="YouTube 영상 URL (예: https://youtube.com/watch?v=...)"
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            <button onClick={handleAdd} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors font-medium shrink-0">
              추적
            </button>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">목표 조회수: {targetViews.toLocaleString()}</label>
            <input type="range" min={100} max={1000000} step={100} value={targetViews}
              onChange={(e) => setTargetViews(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>
        </div>

        {/* Tracked videos */}
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">📈</span>
            <p className="text-sm text-gray-500">추적 중인 영상이 없습니다</p>
            <p className="text-xs text-gray-600 mt-1">YouTube URL을 입력하여 조회수 추적을 시작하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => {
              const progress = Math.min(100, (video.currentViews / video.targetViews) * 100);
              return (
                <motion.div key={video.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-900 border rounded-xl p-4 transition-all ${video.notified ? 'border-emerald-500/50' : 'border-gray-800'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{video.title}</p>
                      <p className="text-[10px] text-gray-500">{video.videoId}</p>
                    </div>
                    <button onClick={() => handleRemove(video.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">✕</button>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-white">{video.currentViews.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">/ {video.targetViews.toLocaleString()}</span>
                    {video.notified && <span className="text-xs text-emerald-400">🎉 달성!</span>}
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${video.notified ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1 text-right">{progress.toFixed(1)}%</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
