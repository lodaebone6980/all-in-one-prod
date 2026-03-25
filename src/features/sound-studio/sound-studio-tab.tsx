import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

const MAIN_TABS = [
  { id: 'tts', label: '나레이션', icon: '🎤' },
  { id: 'music', label: '음악 생성', icon: '🎵' },
  { id: 'sfx', label: '효과음', icon: '🔊' },
  { id: 'reference', label: '뮤직 레퍼런스', icon: '🔍' },
] as const;

const TTS_SUB_TABS = [
  { id: 'narration', label: '나레이션', icon: '🎙️' },
  { id: 'waveform', label: '오디오 편집', icon: '✂️' },
] as const;

const TTS_ENGINES: Record<string, string> = { typecast: 'Typecast', microsoft: 'Microsoft Edge', supertonic: 'Supertonic 2' };

// Lazy sub-panels (placeholder for now)
const VoiceStudio = lazy(() => import('./voice-studio'));

type MainTab = typeof MAIN_TABS[number]['id'];
type TtsSubTab = typeof TTS_SUB_TABS[number]['id'];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-fuchsia-400 rounded-full animate-spin" />
        <span className="text-gray-500 text-base">로딩 중...</span>
      </div>
    </div>
  );
}

export default function SoundStudioTab() {
  const [mainTab, setMainTab] = useState<MainTab>('tts');
  const [ttsSubTab, setTtsSubTab] = useState<TtsSubTab>('narration');
  const [ttsEngine] = useState('typecast');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 rounded-lg flex items-center justify-center text-xl shadow-lg">🎵</div>
            <div>
              <h1 className="text-2xl font-bold text-white">사운드 스튜디오</h1>
              <p className="text-gray-400 text-base">나레이션 음성 생성과 AI 음악 제작을 관리합니다</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:text-red-300 transition-all text-sm font-semibold">
              ◼ 전체 정지
            </button>
            <span className="text-sm text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              TTS 엔진: <span className="text-fuchsia-400 font-semibold">{TTS_ENGINES[ttsEngine]}</span>
            </span>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex gap-2 mb-4">
          {MAIN_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setMainTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                mainTab === tab.id
                  ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/50 shadow-md'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-500'
              }`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* TTS sub-tabs */}
        {mainTab === 'tts' && (
          <div className="flex border-b border-gray-700 mb-4">
            {TTS_SUB_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setTtsSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  ttsSubTab === tab.id
                    ? 'border-fuchsia-500 text-fuchsia-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <Suspense fallback={<LoadingSpinner />}>
          {mainTab === 'tts' && ttsSubTab === 'narration' && <VoiceStudio />}
          {mainTab === 'tts' && ttsSubTab === 'waveform' && (
            <EmptyPanel icon="✂️" title="오디오 편집" desc="나레이션 오디오를 편집하세요. 파형 기반 편집, 구간 자르기, 볼륨 조절을 지원합니다." />
          )}
          {mainTab === 'music' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmptyPanel icon="🎵" title="음악 생성" desc="AI가 영상에 맞는 BGM을 작곡합니다. Suno AI 기반 텍스트-투-뮤직." />
              <EmptyPanel icon="📚" title="음악 라이브러리" desc="생성한 음악과 가져온 BGM을 관리합니다." />
            </div>
          )}
          {mainTab === 'sfx' && (
            <EmptyPanel icon="🔊" title="효과음" desc="AI 효과음 생성 및 효과음 라이브러리. 장면별 자동 매칭을 지원합니다." />
          )}
          {mainTab === 'reference' && (
            <EmptyPanel icon="🔍" title="뮤직 레퍼런스" desc="YouTube나 파일에서 음악을 분석하고 비슷한 스타일의 BGM을 생성합니다." />
          )}
        </Suspense>
      </div>
    </div>
  );
}

function EmptyPanel({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
      <span className="text-4xl block mb-3">{icon}</span>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto">{desc}</p>
    </div>
  );
}
