import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/use-app-store';

const THUMBNAIL_CONCEPTS = [
  { id: 'shock', label: '충격/놀람', icon: '😱', desc: '강렬한 표정과 텍스트' },
  { id: 'comparison', label: '비교/VS', icon: '⚔️', desc: '좌우 분할 비교' },
  { id: 'list', label: '리스트/랭킹', icon: '🏆', desc: '숫자와 아이템 나열' },
  { id: 'tutorial', label: '튜토리얼', icon: '📚', desc: '단계별 안내' },
  { id: 'before-after', label: '비포/애프터', icon: '🔄', desc: '변화 전후 비교' },
  { id: 'minimal', label: '미니멀', icon: '◽', desc: '깔끔하고 심플' },
  { id: 'dramatic', label: '드라마틱', icon: '🎭', desc: '극적인 분위기' },
  { id: 'cute', label: '귀여운', icon: '🧸', desc: '파스텔 톤, 귀여운 일러스트' },
];

export default function ThumbnailStudioTab() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState('shock');
  const [generating, setGenerating] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ id: string; url: string; concept: string }[]>([]);
  const [variations, setVariations] = useState(3);

  const handleGenerate = async () => {
    if (!title.trim()) { toast.error('썸네일 제목을 입력해주세요'); return; }
    if (!apiKeys.evolink && !apiKeys.gemini) { toast.error('AI API 키를 설정해주세요'); return; }
    setGenerating(true);
    // Simulated generation - actual API would create images
    setTimeout(() => {
      const results = Array.from({ length: variations }, (_, i) => ({
        id: crypto.randomUUID(),
        url: '',
        concept,
      }));
      setThumbnails((prev) => [...results, ...prev]);
      setGenerating(false);
      toast.success(`${variations}개 썸네일 컨셉이 생성되었습니다`);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🖼️</span> 썸네일 스튜디오</h2>
          <p className="text-sm text-gray-400 mt-1">AI로 유튜브 썸네일을 생성하고 편집하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">썸네일 제목/텍스트</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='예: "이것만 알면 조회수 10배!" 처럼 썸네일에 들어갈 텍스트'
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">컨셉</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THUMBNAIL_CONCEPTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConcept(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      concept === c.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <p className="text-xs font-medium text-white mt-1">{c.label}</p>
                    <p className="text-[10px] text-gray-500">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated thumbnails */}
            {thumbnails.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">생성된 썸네일 ({thumbnails.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {thumbnails.map((thumb) => (
                    <div key={thumb.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group">
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                        <span className="text-3xl">{THUMBNAIL_CONCEPTS.find((c) => c.id === thumb.concept)?.icon || '🖼️'}</span>
                      </div>
                      <div className="p-2 flex justify-between">
                        <span className="text-[10px] text-gray-500">{THUMBNAIL_CONCEPTS.find((c) => c.id === thumb.concept)?.label}</span>
                        <button className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">다운로드</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">변형 수: {variations}</label>
              <input type="range" min={1} max={6} value={variations} onChange={(e) => setVariations(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !title.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium"
            >
              {generating ? '생성 중...' : '🖼️ 썸네일 생성'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
