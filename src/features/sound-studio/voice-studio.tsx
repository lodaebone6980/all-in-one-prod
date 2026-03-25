import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { SUPERTONIC_VOICES, TYPECAST_V30_EMOTIONS, typecastTTS, type Voice, type TypecastEmotion } from '../../services/tts-api';
import { useAppStore } from '../../stores/use-app-store';

export default function VoiceStudio() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const [searchFilter, setSearchFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<TypecastEmotion>('normal');
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [audioResults, setAudioResults] = useState<{ url: string; text: string; voice: string }[]>([]);

  const allVoices: Voice[] = useMemo(() => [...SUPERTONIC_VOICES], []);
  const filteredVoices = useMemo(() => allVoices.filter((v) => {
    if (genderFilter && v.gender !== genderFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q);
    }
    return true;
  }), [allVoices, genderFilter, searchFilter]);

  const toggleFavorite = (id: string) => setFavorites((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSynthesize = async () => {
    if (!selectedVoice) { toast.error('음성을 선택해주세요'); return; }
    if (!text.trim()) { toast.error('텍스트를 입력해주세요'); return; }
    setGenerating(true);
    try {
      if (selectedVoice.engine === 'typecast' && apiKeys.typecast) {
        const result = await typecastTTS(text, selectedVoice.id, apiKeys.typecast, { emotion, tempo: speed });
        setAudioResults((prev) => [{ url: result.audioUrl, text: text.slice(0, 50), voice: selectedVoice.name }, ...prev]);
        toast.success('음성 생성 완료!');
      } else {
        toast.info('Typecast API 키를 설정하면 488개 이상의 프리미엄 음성을 사용할 수 있습니다.');
      }
    } catch (err: any) { toast.error(err.message || '음성 생성 실패'); }
    finally { setGenerating(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Voice list */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="음성 검색..." className="flex-1 min-w-[150px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500" />
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white">
            <option value="">전체</option><option value="male">남성</option><option value="female">여성</option>
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredVoices.map((v) => (
            <button key={v.id} onClick={() => setSelectedVoice(v)}
              className={`p-3 rounded-lg border text-left transition-all group relative ${selectedVoice?.id === v.id ? 'border-fuchsia-500 bg-fuchsia-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{v.name}</span>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(v.id); }}
                  className={`text-xs ${favorites.has(v.id) ? 'text-yellow-400' : 'text-gray-600 opacity-0 group-hover:opacity-100'} transition-all`}>
                  {favorites.has(v.id) ? '★' : '☆'}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-gray-500 bg-gray-700 px-1 py-0.5 rounded">{v.engine}</span>
                <span className="text-[10px] text-gray-500">{v.gender === 'male' ? '남' : '여'}</span>
              </div>
              {v.description && <p className="text-[10px] text-gray-600 mt-1">{v.description}</p>}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600">{filteredVoices.length}개 음성 | Typecast API 키 설정 시 488+ 음성</p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {selectedVoice && (
          <div className="bg-gray-800 border border-fuchsia-500/30 rounded-xl p-3">
            <p className="text-xs text-gray-400">선택된 음성</p>
            <p className="text-sm font-semibold text-white mt-0.5">{selectedVoice.name}</p>
            <p className="text-[10px] text-gray-500">{selectedVoice.engine} | {selectedVoice.gender === 'male' ? '남성' : '여성'}</p>
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-400 mb-1">텍스트</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
            placeholder="음성으로 변환할 텍스트를 입력하세요" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 resize-none" />
          <p className="text-[10px] text-gray-600 mt-1 text-right">{text.length}자</p>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">감정</label>
          <div className="grid grid-cols-4 gap-1.5">
            {TYPECAST_V30_EMOTIONS.slice(0, 7).map((e) => {
              const icons: Record<string, string> = { normal: '😐', happy: '😊', sad: '😢', angry: '😠', whisper: '🤫', toneup: '⬆️', tonedown: '⬇️' };
              return (
                <button key={e} onClick={() => setEmotion(e)}
                  className={`p-2 rounded-lg border text-center transition-all ${emotion === e ? 'border-fuchsia-500 bg-fuchsia-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                  <span className="text-base block">{icons[e] || '😐'}</span>
                  <span className="text-[10px] text-gray-400">{e}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">속도: {speed.toFixed(1)}x</label>
          <input type="range" min={0.5} max={2.0} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-fuchsia-500" />
        </div>
        <button onClick={handleSynthesize} disabled={generating || !selectedVoice || !text.trim()}
          className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg font-bold transition-all">
          {generating ? '생성 중...' : '🎙️ 음성 생성'}
        </button>
        {audioResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">생성된 음성</p>
            {audioResults.map((r, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-2.5 flex items-center gap-2">
                <button className="w-7 h-7 rounded-full bg-fuchsia-600/20 text-fuchsia-300 flex items-center justify-center text-xs shrink-0">▶</button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{r.text}...</p>
                  <p className="text-[10px] text-gray-500">{r.voice}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
