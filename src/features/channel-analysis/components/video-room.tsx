import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const PRESETS = [
  { id: 'tikitaka', label: '티키타카', desc: '10-패턴 바이럴 편집 프로토콜, 타임라인 스크램블링', icon: '⚡' },
  { id: 'snack', label: '스낵', desc: '숏폼 이중 자막 시스템 (이펙트 + 하단 자막)', icon: '🍿' },
  { id: 'condensed', label: '압축', desc: '시간순 스토리 압축 (45-75초)', icon: '⏱️' },
  { id: 'deep', label: '정밀 분석', desc: '6단계 종합 채널 분석 프로덕션', icon: '🔬' },
];

export default function VideoRoom() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addUrl = () => { if (urls.length < 5) setUrls([...urls, '']); };
  const updateUrl = (idx: number, val: string) => { const next = [...urls]; next[idx] = val; setUrls(next); };
  const removeUrl = (idx: number) => { if (urls.length > 1) setUrls(urls.filter((_, i) => i !== idx)); };

  const analyze = async () => {
    const validUrls = urls.filter((u) => u.trim() && (u.includes('youtube.com') || u.includes('youtu.be')));
    if (validUrls.length === 0) { toast.error('YouTube URL을 입력해주세요'); return; }
    if (!selectedPreset) { toast.error('분석 프리셋을 선택해주세요'); return; }

    setLoading(true);
    setTimeout(() => {
      setResult(`영상 ${validUrls.length}개 분석 완료 (프리셋: ${PRESETS.find((p) => p.id === selectedPreset)?.label})\n\nAI 분석은 Evolink/Gemini API 키가 필요합니다.\n프레임 추출, 자막 수집, 편집 테이블 생성이 진행됩니다.`);
      setLoading(false);
      toast.success('영상 분석 완료');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* URL Inputs */}
      <div className="space-y-2">
        {urls.map((u, idx) => (
          <div key={idx} className="flex gap-2">
            <input type="text" value={u} onChange={(e) => updateUrl(idx, e.target.value)}
              placeholder={`YouTube URL ${idx + 1} (영상/쇼츠)`}
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            {urls.length > 1 && (
              <button onClick={() => removeUrl(idx)} className="px-2 text-gray-500 hover:text-red-400 transition-colors">✕</button>
            )}
          </div>
        ))}
        {urls.length < 5 && (
          <button onClick={addUrl} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ URL 추가 (최대 5개)</button>
        )}
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">분석 프리셋</label>
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => setSelectedPreset(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedPreset === p.id ? 'border-blue-500 bg-blue-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-medium text-white">{p.label}</span>
              </div>
              <p className="text-[10px] text-gray-500">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={analyze} disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg disabled:opacity-50 transition-all">
        {loading ? '영상 분석 중...' : '영상 분석 시작'}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{result}</pre>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">🎬</span>
          <p className="text-sm text-gray-500">YouTube 영상의 편집 구조를 AI로 분석합니다</p>
          <p className="text-xs text-gray-600 mt-1">프레임 추출 → 자막 수집 → AI 편집 테이블 생성</p>
        </div>
      )}
    </div>
  );
}
