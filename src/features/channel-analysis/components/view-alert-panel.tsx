import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface TrackedVideo {
  id: string; videoId: string; title: string; targetViews: number;
  currentViews: number; lastChecked: number; notified: boolean; addedAt: number;
}

export default function ViewAlertPanel() {
  const [videos, setVideos] = useState<TrackedVideo[]>(() => {
    try { return JSON.parse(localStorage.getItem('VIEW_ALERT_VIDEOS') || '[]'); } catch { return []; }
  });
  const [urlInput, setUrlInput] = useState('');
  const [targetViews, setTargetViews] = useState(10000);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    localStorage.setItem('VIEW_ALERT_VIDEOS', JSON.stringify(videos));
  }, [videos]);

  const extractVideoId = (url: string): string | null => {
    const m = url.match(/(?:v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  };

  const addVideo = () => {
    const videoId = extractVideoId(urlInput);
    if (!videoId) { toast.error('올바른 YouTube URL을 입력해주세요'); return; }
    if (videos.some((v) => v.videoId === videoId)) { toast.error('이미 추적 중인 영상입니다'); return; }

    setVideos((prev) => [...prev, {
      id: crypto.randomUUID(), videoId, title: `영상 ${videoId}`,
      targetViews, currentViews: 0, lastChecked: 0, notified: false, addedAt: Date.now(),
    }]);
    setUrlInput('');
    toast.success('영상 추적을 시작합니다');

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success('추적을 중지했습니다');
  };

  const checkViews = async () => {
    setPolling(true);
    // Simulate view check (would use YouTube Data API in production)
    setVideos((prev) => prev.map((v) => {
      const newViews = v.currentViews + Math.floor(Math.random() * 500) + 50;
      if (newViews >= v.targetViews && !v.notified) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 조회수 목표 달성!', { body: `${v.title}이 ${v.targetViews.toLocaleString()}회를 달성했습니다!` });
        }
        toast.success(`🎉 ${v.title} - 목표 달성!`);
        return { ...v, currentViews: newViews, lastChecked: Date.now(), notified: true };
      }
      return { ...v, currentViews: newViews, lastChecked: Date.now() };
    }));
    setPolling(false);
  };

  return (
    <div className="space-y-6">
      {/* Add video */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addVideo()}
            placeholder="YouTube 영상 URL을 입력하세요"
            className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button onClick={addVideo}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors">추적</button>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">목표 조회수:</label>
          <input type="number" value={targetViews} onChange={(e) => setTargetViews(Number(e.target.value))} min={100}
            className="w-32 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white" />
          <span className="text-xs text-gray-500">({targetViews.toLocaleString()}회)</span>
        </div>
      </div>

      {/* Actions */}
      {videos.length > 0 && (
        <div className="flex justify-end">
          <button onClick={checkViews} disabled={polling}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-xs text-gray-300 rounded-lg transition-colors">
            {polling ? '확인 중...' : '🔄 조회수 확인'}
          </button>
        </div>
      )}

      {/* Tracked videos */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🔔</span>
          <p className="text-sm text-gray-500">추적 중인 영상이 없습니다</p>
          <p className="text-xs text-gray-600 mt-1">YouTube URL을 입력하면 조회수 목표 달성 시 브라우저 알림을 받습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            const progress = Math.min(100, (video.currentViews / video.targetViews) * 100);
            return (
              <motion.div key={video.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800 border rounded-xl p-4 transition-all ${video.notified ? 'border-green-500/50' : 'border-gray-700'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{video.title}</p>
                    <p className="text-[10px] text-gray-500">ID: {video.videoId}</p>
                  </div>
                  <button onClick={() => removeVideo(video.id)} className="text-xs text-gray-500 hover:text-red-400">✕</button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-white">{video.currentViews.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">/ {video.targetViews.toLocaleString()}</span>
                  {video.notified && <span className="text-xs text-green-400">🎉 달성!</span>}
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${video.notified ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                  <span>{progress.toFixed(1)}%</span>
                  {video.lastChecked > 0 && <span>마지막 확인: {new Date(video.lastChecked).toLocaleTimeString('ko-KR')}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
