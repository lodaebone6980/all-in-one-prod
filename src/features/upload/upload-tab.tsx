import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PlatformAuth {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  username?: string;
}

export default function UploadTab() {
  const [platforms, setPlatforms] = useState<PlatformAuth[]>([
    { id: 'youtube', name: 'YouTube', icon: '▶️', connected: false },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', connected: false },
    { id: 'instagram', name: 'Instagram', icon: '📷', connected: false },
    { id: 'threads', name: 'Threads', icon: '🧵', connected: false },
    { id: 'naver-clip', name: 'Naver Clip', icon: '🟢', connected: false },
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConnect = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => p.id === id ? { ...p, connected: true, username: `@user_${id}` } : p)
    );
    toast.success(`${platforms.find((p) => p.id === id)?.name} 연결 완료`);
  };

  const handleUpload = () => {
    if (selectedPlatforms.size === 0) { toast.error('업로드할 플랫폼을 선택해주세요'); return; }
    if (!title.trim()) { toast.error('제목을 입력해주세요'); return; }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success(`${selectedPlatforms.size}개 플랫폼에 업로드 요청을 보냈습니다`);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>📤</span> 업로드</h2>
          <p className="text-sm text-gray-400 mt-1">여러 플랫폼에 한번에 업로드하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            {/* Upload form */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="영상 제목"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">설명</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="영상 설명" rows={4}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">태그</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="쉼표로 구분 (예: 리뷰, AI, 추천)"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>

            {/* File upload zone */}
            <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-gray-600 transition-colors cursor-pointer">
              <span className="text-3xl block mb-2">📁</span>
              <p className="text-sm text-gray-400">영상 파일을 드래그하거나 클릭하여 선택</p>
              <p className="text-[10px] text-gray-600 mt-1">MP4, MOV, WebM 지원</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || selectedPlatforms.size === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium"
            >
              {uploading ? '업로드 중...' : `📤 ${selectedPlatforms.size}개 플랫폼에 업로드`}
            </button>
          </div>

          {/* Platform connections */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">플랫폼</h3>
            {platforms.map((platform) => (
              <div key={platform.id} className={`bg-gray-900 border rounded-xl p-3 transition-all ${
                selectedPlatforms.has(platform.id) ? 'border-indigo-500 bg-indigo-600/5' : 'border-gray-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm font-medium text-white flex-1">{platform.name}</span>
                  {platform.connected ? (
                    <span className="text-[10px] text-emerald-400">연결됨</span>
                  ) : (
                    <button onClick={() => handleConnect(platform.id)} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                      연결
                    </button>
                  )}
                </div>
                {platform.connected && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{platform.username}</span>
                    <button
                      onClick={() => togglePlatform(platform.id)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                        selectedPlatforms.has(platform.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {selectedPlatforms.has(platform.id) ? '선택됨' : '선택'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
