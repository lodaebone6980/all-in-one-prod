import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SLIDE_STYLES = [
  { id: 'bento-grid', label: 'Bento Grid', desc: '모던 그리드 레이아웃' },
  { id: 'bento-bold', label: 'Bento Bold', desc: '대담한 그리드' },
  { id: 'toss-style', label: 'Toss Style', desc: '토스 스타일 미니멀' },
  { id: 'clean-minimal', label: 'Clean Minimalism', desc: '깔끔한 미니멀리즘' },
  { id: 'dark-tech', label: 'Dark Tech', desc: '다크 테크 모던' },
  { id: 'glassmorphism', label: 'Glassmorphism', desc: '유리 효과' },
  { id: 'neo-brutalism', label: 'Neo Brutalism', desc: '네오 브루탈리즘' },
  { id: 'steve-jobs', label: 'Steve Jobs', desc: '애플 키노트 스타일' },
  { id: 'consultant', label: 'Consultant Logic', desc: '컨설턴트 로직트리' },
  { id: 'kinfolk', label: 'Kinfolk Serif', desc: '킨포크 세리프' },
  { id: 'retro-modern', label: 'Retro Modern', desc: '레트로 모던' },
  { id: 'magazine', label: 'Classic Magazine', desc: '클래식 매거진' },
  { id: 'gradient', label: 'Gradient Flow', desc: '그라디언트 플로우' },
  { id: 'neon', label: 'Neon Glow', desc: '네온 글로우' },
  { id: 'pastel', label: 'Pastel Soft', desc: '파스텔 소프트' },
  { id: 'corporate', label: 'Corporate Pro', desc: '비즈니스 프로' },
  { id: 'startup', label: 'Startup Pitch', desc: '스타트업 피치덱' },
  { id: 'education', label: 'Education', desc: '교육/강의' },
  { id: 'portfolio', label: 'Portfolio', desc: '포트폴리오' },
  { id: 'infographic', label: 'Infographic', desc: '인포그래픽' },
];

export default function PptMasterTab() {
  const [topic, setTopic] = useState('');
  const [slideStyle, setSlideStyle] = useState('toss-style');
  const [slideCount, setSlideCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState<{ id: string; title: string; content: string; notes: string }[]>([]);

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error('주제를 입력해주세요'); return; }
    setGenerating(true);
    setTimeout(() => {
      const generated = Array.from({ length: slideCount }, (_, i) => ({
        id: crypto.randomUUID(),
        title: i === 0 ? topic : `슬라이드 ${i + 1}`,
        content: i === 0 ? '프레젠테이션 제목 슬라이드' : `슬라이드 ${i + 1}의 내용이 여기에 표시됩니다`,
        notes: `발표자 노트 ${i + 1}`,
      }));
      setSlides(generated);
      setGenerating(false);
      toast.success(`${slideCount}장 슬라이드가 생성되었습니다`);
    }, 2000);
  };

  const handleExport = () => {
    toast.success('PPTX 내보내기는 곧 지원됩니다');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">PPT 마스터</h2>
            <p className="text-sm text-gray-400 mt-1">AI가 텍스트를 분석하여 프레젠테이션 슬라이드를 자동 생성합니다. {SLIDE_STYLES.length}+ 디자인 스타일</p>
          </div>
          {slides.length > 0 && (
            <button onClick={handleExport} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              📥 PPTX 내보내기
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">프레젠테이션 주제</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 2024년 AI 트렌드 분석 보고서" rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
            </div>

            {/* Slide preview */}
            {slides.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">슬라이드 ({slides.length}장)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
                      <div className="aspect-[16/9] bg-gradient-to-br from-gray-800 to-gray-900 p-3 flex flex-col justify-center">
                        <p className="text-xs font-semibold text-white line-clamp-2">{slide.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{slide.content}</p>
                      </div>
                      <div className="px-2 py-1.5 text-[10px] text-gray-600 flex justify-between">
                        <span>#{idx + 1}</span>
                        <span>{SLIDE_STYLES.find((s) => s.id === slideStyle)?.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">📊</span>
                <p className="text-sm text-gray-500">주제를 입력하고 생성 버튼을 누르세요</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">슬라이드 디자인</label>
              <div className="max-h-[350px] overflow-y-auto space-y-1.5 pr-1">
                {SLIDE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSlideStyle(style.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-all ${
                      slideStyle === style.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                    }`}
                  >
                    <p className="text-xs font-medium text-white">{style.label}</p>
                    <p className="text-[10px] text-gray-500">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">슬라이드 수: {slideCount}장</label>
              <input type="range" min={5} max={30} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium"
            >
              {generating ? '생성 중...' : '📊 슬라이드 생성'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
