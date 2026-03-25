import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SUPERTONIC_VOICES, TYPECAST_V30_EMOTIONS, typecastTTS, type Voice, type TtsEngine, type TypecastEmotion } from '../../services/tts-api';
import { useAppStore } from '../../stores/use-app-store';

type SubTab = 'tts' | 'bgm' | 'mixer';

export default function SoundStudioTab() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const [subTab, setSubTab] = useState<SubTab>('tts');

  const [engineFilter, setEngineFilter] = useState<TtsEngine | ''>('');
  const [genderFilter, setGenderFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<TypecastEmotion>('normal');
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [audioResults, setAudioResults] = useState<{ url: string; text: string; voice: string }[]>([]);

  // Use Supertonic as default voices (free, no API key needed)
  const allVoices: Voice[] = useMemo(() => [...SUPERTONIC_VOICES], []);

  const filteredVoices = useMemo(() => {
    return allVoices.filter((v) => {
      if (engineFilter && v.engine !== engineFilter) return false;
      if (genderFilter && v.gender !== genderFilter) return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q) || v.language.includes(q);
      }
      return true;
    });
  }, [allVoices, engineFilter, genderFilter, searchFilter]);

  const toggleFavorite = (voiceId: string) => {
    setFavorites((prev) => { const next = new Set(prev); next.has(voiceId) ? next.delete(voiceId) : next.add(voiceId); return next; });
  };

  const handleSynthesize = async () => {
    if (!selectedVoice) { toast.error('음성을 선택해주세요'); return; }
    if (!text.trim()) { toast.error('텍스트를 입력해주세요'); return; }

    setGenerating(true);
    try {
      if (selectedVoice.engine === 'typecast') {
        const result = await typecastTTS(text, selectedVoice.id, apiKeys.typecast, { emotion, tempo: speed });
        setAudioResults((prev) => [{ url: result.audioUrl, text: text.slice(0, 50), voice: selectedVoice.name }, ...prev]);
        toast.success('음성 생성 완료!');
      } else {
        toast.info('Supertonic 2는 브라우저 기반 TTS입니다. Typecast API 키를 설정하면 488개 이상의 음성을 사용할 수 있습니다.');
      }
    } catch (err: any) {
      toast.error(err.message || '음성 생성 실패');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🎵</span> 사운드스튜디오</h2>
          <p className="text-sm text-gray-400 mt-1">AI 음성 합성 & 사운드 관리</p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
          {[
            { id: 'tts' as SubTab, label: '음성 합성', icon: '🎙️' },
            { id: 'bgm' as SubTab, label: 'BGM 라이브러리', icon: '🎶' },
            { id: 'mixer' as SubTab, label: '오디오 믹서', icon: '🎚️' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setSubTab(tab.id)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${subTab === tab.id ? 'text-white bg-fuchsia-600/30' : 'text-gray-400 hover:text-gray-200'}`}>
              <span className="flex items-center gap-1.5"><span>{tab.icon}</span>{tab.label}</span>
            </button>
          ))}
        </div>

        {subTab === 'tts' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="음성 검색..." className="flex-1 min-w-[150px] px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-fuchsia-500" />
                <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200">
                  <option value="">전체 성별</option><option value="male">남성</option><option value="female">여성</option>
                </select>
              </div>

              {/* Voice Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredVoices.map((voice) => (
                  <button key={voice.id} onClick={() => setSelectedVoice(voice)}
                    className={`p-3 rounded-lg border text-left transition-all relative group ${
                      selectedVoice?.id === voice.id ? 'border-fuchsia-500 bg-fuchsia-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{voice.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(voice.id); }}
                        className={`text-xs ${favorites.has(voice.id) ? 'text-yellow-400' : 'text-gray-600 opacity-0 group-hover:opacity-100'} transition-all`}>
                        {favorites.has(voice.id) ? '★' : '☆'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-gray-500 bg-gray-800 px-1 py-0.5 rounded">{voice.engine}</span>
                      <span className="text-[10px] text-gray-500">{voice.gender === 'male' ? '남' : '여'}</span>
                    </div>
                    {voice.description && <p className="text-[10px] text-gray-600 mt-1">{voice.description}</p>}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-600">{filteredVoices.length}개 음성 | Typecast API 키 설정 시 488+ 음성 사용 가능</p>
            </div>

            {/* Right: TTS Controls */}
            <div className="space-y-4">
              {selectedVoice && (
                <div className="bg-gray-900 border border-fuchsia-500/30 rounded-xl p-3">
                  <p className="text-xs text-gray-400">선택된 음성</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{selectedVoice.name}</p>
                  <p className="text-[10px] text-gray-500">{selectedVoice.engine} | {selectedVoice.gender}</p>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">텍스트</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="음성으로 변환할 텍스트를 입력하세요"
                  rows={5} className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500 resize-none" />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{text.length}자</p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">감정</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TYPECAST_V30_EMOTIONS.slice(0, 4).map((e) => {
                    const icons: Record<string, string> = { normal: '😐', happy: '😊', sad: '😢', angry: '😠' };
                    return (
                      <button key={e} onClick={() => setEmotion(e)}
                        className={`p-2 rounded-lg border text-center transition-all ${emotion === e ? 'border-fuchsia-500 bg-fuchsia-600/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
                        <span className="text-lg block">{icons[e] || '😐'}</span>
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
                className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium">
                {generating ? '생성 중...' : '🎙️ 음성 생성'}
              </button>

              {audioResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">생성된 음성</p>
                  {audioResults.map((result, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 flex items-center gap-2">
                      <button className="w-7 h-7 rounded-full bg-fuchsia-600/20 text-fuchsia-300 flex items-center justify-center text-xs shrink-0">▶</button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{result.text}...</p>
                        <p className="text-[10px] text-gray-500">{result.voice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {subTab === 'bgm' && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🎶</span>
            <p className="text-sm text-gray-500">BGM 라이브러리 (Suno AI 연동)</p>
            <p className="text-xs text-gray-600 mt-1">AI 작곡, SFX 생성, 음악 레퍼런스 분석</p>
          </div>
        )}

        {subTab === 'mixer' && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🎚️</span>
            <p className="text-sm text-gray-500">오디오 믹서</p>
            <p className="text-xs text-gray-600 mt-1">나레이션 + BGM + SFX 볼륨/타이밍 조절</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
