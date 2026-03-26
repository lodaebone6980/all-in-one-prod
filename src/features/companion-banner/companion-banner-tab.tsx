import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const BANNER_TEMPLATES = [
  { id: 'youtube-end', label: 'YouTube 엔드스크린', size: '1920x1080', icon: '▶️' },
  { id: 'youtube-banner', label: 'YouTube 채널 배너', size: '2560x1440', icon: '📺' },
  { id: 'instagram-story', label: 'Instagram 스토리', size: '1080x1920', icon: '📷' },
  { id: 'tiktok-cover', label: 'TikTok 커버', size: '1080x1920', icon: '🎵' },
  { id: 'twitter-header', label: 'Twitter 헤더', size: '1500x500', icon: '🐦' },
  { id: 'naver-blog', label: 'Naver 블로그 썸네일', size: '800x800', icon: '🟢' },
];

export default function CompanionBannerTab() {
  const [template, setTemplate] = useState('youtube-end');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bgColor, setBgColor] = useState('#4f46e5');
  const [generating, setGenerating] = useState(false);
  const [banners, setBanners] = useState<{ id: string; template: string }[]>([]);

  const handleGenerate = () => {
    if (!title.trim()) { toast.error('제목을 입력해주세요'); return; }
    setGenerating(true);
    setTimeout(() => {
      setBanners((prev) => [{ id: crypto.randomUUID(), template }, ...prev]);
      setGenerating(false);
      toast.success('배너가 생성되었습니다');
    }, 1500);
  };

  const selectedTemplate = BANNER_TEMPLATES.find((t) => t.id === template) ?? BANNER_TEMPLATES[0];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🏷️</span> 컴패니언 배너</h2>
          <p className="text-sm text-gray-400 mt-1">다양한 플랫폼용 프로모션 배너를 제작하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="aspect-video flex flex-col items-center justify-center p-8"
                style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor}88)` }}>
                <p className="text-2xl font-bold text-white text-center mb-2">{title || '배너 제목'}</p>
                <p className="text-sm text-white/70 text-center">{subtitle || '서브타이틀'}</p>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">{selectedTemplate.label} ({selectedTemplate.size})</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="배너 제목"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">서브타이틀</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="서브타이틀 (선택)"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">배경 색상</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="w-16 h-8 bg-gray-900 border border-gray-800 rounded cursor-pointer" />
            </div>

            <button onClick={handleGenerate} disabled={generating || !title.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium">
              {generating ? '생성 중...' : '🏷️ 배너 생성'}
            </button>
          </div>

          {/* Templates */}
          <div className="space-y-3">
            <label className="block text-xs text-gray-400">템플릿</label>
            {BANNER_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  template === t.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}>
                <div className="flex items-center gap-2">
                  <span>{t.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-white">{t.label}</p>
                    <p className="text-[10px] text-gray-500">{t.size}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
