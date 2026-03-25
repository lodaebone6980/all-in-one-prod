import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/use-app-store';
import { useScriptStore } from '../../stores/use-script-store';
import { AI_MODELS, SCRIPT_FORMATS, generateScript, type AiModel, type ScriptFormat, type ScriptResult } from '../../services/ai-api';

const CONTENT_FORMATS = [
  { id: 'shorts' as const, label: '숏폼', desc: '1-3분, 빠른 템포' },
  { id: 'long' as const, label: '롱폼', desc: '10-20분, 의미 단위 호흡' },
  { id: 'nano' as const, label: '나노', desc: '15-60초, 도파민 플래시' },
];

export default function ScriptWriterTab() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const store = useScriptStore();

  // Step 1: 소재
  const [inputMode, setInputMode] = useState<'ai' | 'manual'>('manual');
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptSynopsis, setScriptSynopsis] = useState('');

  // Step 3: 대본 생성
  const [contentFormat, setContentFormat] = useState<'shorts' | 'long' | 'nano'>('long');
  const [targetCharCount, setTargetCharCount] = useState(1500);
  const [referenceComments, setReferenceComments] = useState('');

  const handleGenerate = async () => {
    if (!scriptTitle.trim() && !scriptSynopsis.trim()) {
      toast.error('제목이나 줄거리를 입력해주세요');
      return;
    }
    store.setGenerating(true);
    store.setResult(null);

    const formatMap: Record<string, ScriptFormat> = { shorts: 'short-form', long: 'long-form', nano: 'nano-form' };
    const lengthMap: Record<string, number> = { shorts: 2, long: 12, nano: 0.5 };

    try {
      const topic = scriptTitle + (scriptSynopsis ? `\n\n줄거리: ${scriptSynopsis}` : '') +
        (referenceComments ? `\n\n시청자 댓글 참고:\n${referenceComments}` : '');

      const result = await generateScript(
        {
          topic,
          model: store.model,
          format: formatMap[contentFormat] || 'long-form',
          structure: store.structure,
          targetLength: lengthMap[contentFormat] || 12,
          tone: store.tone,
          additionalNotes: store.additionalNotes,
          language: '한국어',
        },
        { evolink: apiKeys.evolink, gemini: apiKeys.gemini },
        (chunk) => store.setStreamText(chunk)
      );
      store.setResult(result);
      store.addToHistory(result);
      toast.success(`대본 생성 완료! (${result.scenes.length}씬, $${result.cost.totalUsd.toFixed(4)})`);
    } catch (err: any) {
      toast.error(err.message || '대본 생성 실패');
    } finally {
      store.setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">✍️ 대본작성</h1>
        <p className="text-sm text-gray-400 mt-1">AI가 영상 대본을 자동 생성합니다</p>
      </div>

      {/* === STEP 1: 소재 정하기 === */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">1</span>
          <h2 className="text-lg font-bold text-white">소재 정하기</h2>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setInputMode('ai')}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${inputMode === 'ai' ? 'border-violet-500 bg-violet-600/20 text-violet-400' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
            AI가 추천해줘
          </button>
          <button onClick={() => setInputMode('manual')}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${inputMode === 'manual' ? 'border-violet-500 bg-violet-600/20 text-violet-400' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
            직접 입력할게
          </button>
        </div>

        {inputMode === 'ai' ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-3">채널 분석 데이터를 기반으로 AI가 소재를 추천합니다</p>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
              🤖 AI 소재 추천받기
            </button>
            <p className="text-[10px] text-gray-600 mt-2">채널/영상 분석 탭에서 벤치마크 데이터를 먼저 수집하면 더 정확합니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">📌 제목</label>
              <input type="text" value={scriptTitle} onChange={(e) => setScriptTitle(e.target.value)}
                placeholder="영상 제목을 입력하세요"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">📋 줄거리 · 핵심 내용</label>
              <textarea value={scriptSynopsis} onChange={(e) => setScriptSynopsis(e.target.value)}
                placeholder="어떤 내용을 다룰지 간단히 설명해주세요"
                rows={4} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none" />
            </div>
          </div>
        )}
      </section>

      {/* === STEP 2: 스타일 선택 (간소화) === */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-bold">2</span>
          <h2 className="text-lg font-bold text-white">스타일 선택</h2>
          <span className="text-xs text-gray-500">(선택사항)</span>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400">이미지/영상 탭의 스타일 선택에서 비주얼 스타일을 지정할 수 있습니다.</p>
          <p className="text-xs text-gray-500 mt-1">채널 분석 데이터가 있으면 자동으로 스타일이 적용됩니다.</p>
        </div>
      </section>

      {/* === STEP 3: 대본 생성 === */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">3</span>
          <h2 className="text-lg font-bold text-white">대본 생성</h2>
        </div>

        <div className="space-y-4">
          {/* AI Model */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">AI 모델</label>
            <div className="grid grid-cols-3 gap-2">
              {AI_MODELS.map((m) => (
                <button key={m.id} onClick={() => store.setModel(m.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${store.model === m.id ? 'border-violet-500 bg-violet-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                  <p className="text-xs font-medium text-white">{m.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {m.hasWebSearch ? '웹 검색 지원' : '웹 검색 미지원'}
                  </p>
                </button>
              ))}
            </div>
            {!AI_MODELS.find((m) => m.id === store.model)?.hasWebSearch && (
              <p className="text-[10px] text-amber-500 mt-1">(웹 검색 미지원 — 최신 트렌드 반영이 필요하면 Gemini 추천)</p>
            )}
          </div>

          {/* Content Format */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">콘텐츠 포맷</label>
            <div className="flex gap-2">
              {CONTENT_FORMATS.map((f) => (
                <button key={f.id} onClick={() => {
                  setContentFormat(f.id);
                  setTargetCharCount(f.id === 'long' ? 1500 : f.id === 'shorts' ? 500 : 200);
                }}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${contentFormat === f.id ? 'border-violet-500 bg-violet-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                  <p className="text-sm font-medium text-white">{f.label}</p>
                  <p className="text-[10px] text-gray-500">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target char count */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">목표 글자수: {targetCharCount}자</label>
            <input type="range" min={contentFormat === 'nano' ? 100 : 350} max={contentFormat === 'long' ? 5000 : 1500}
              step={contentFormat === 'long' ? 50 : 25} value={targetCharCount}
              onChange={(e) => setTargetCharCount(Number(e.target.value))}
              className="w-full accent-violet-500" />
          </div>

          {/* Reference comments */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">참고 댓글 (선택)</label>
            <textarea value={referenceComments} onChange={(e) => setReferenceComments(e.target.value)}
              placeholder="YouTube 댓글을 복사·붙여넣기하세요. 시청자 반응과 관심사가 대본에 반영됩니다."
              rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          {/* Generate */}
          <button onClick={handleGenerate} disabled={store.generating || (!scriptTitle.trim() && !scriptSynopsis.trim())}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-bold transition-all shadow-lg shadow-violet-500/10">
            {store.generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI 대본 생성 중...
              </span>
            ) : (
              `AI 대본 생성 (${AI_MODELS.find((m) => m.id === store.model)?.label})`
            )}
          </button>
        </div>
      </section>

      {/* === Result === */}
      {store.result && <ScriptResultView result={store.result} />}
    </div>
  );
}

function ScriptResultView({ result }: { result: ScriptResult }) {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [selectedAsScript, setSelectedAsScript] = useState(false);

  const handleCopy = () => {
    const text = result.scenes.map((s) =>
      `[씬 ${s.sceneNumber}] (${s.duration}초) ${s.mood ? `[${s.mood}]` : ''}\n${s.scriptText}\n화면: ${s.visualDescriptionKO}`
    ).join('\n\n');
    navigator.clipboard.writeText(`# ${result.title}\n\n${text}`);
    toast.success('대본을 클립보드에 복사했습니다');
  };

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-white">{result.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{result.scenes.length}씬</span>
              <span>{Math.floor(result.totalDuration / 60)}분 {result.totalDuration % 60}초</span>
              <span>{AI_MODELS.find((m) => m.id === result.model)?.label}</span>
              <span className="text-emerald-400">${result.cost.totalUsd.toFixed(4)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">복사</button>
            <button onClick={() => { setSelectedAsScript(true); toast.success('최종 대본으로 선택됨'); }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${selectedAsScript ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
              {selectedAsScript ? '✓ 최종 대본으로 선택됨' : '✓ 최종 대본으로 선택'}
            </button>
          </div>
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-3">
        {result.scenes.map((scene, idx) => (
          <motion.div key={scene.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center text-[10px] font-bold">{scene.sceneNumber}</span>
              <span className="text-xs text-gray-500">{scene.duration}초</span>
              {scene.mood && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px]">{scene.mood}</span>}
            </div>
            <p className="text-sm text-gray-200 leading-relaxed mb-2">{scene.scriptText}</p>
            {scene.visualPrompt && (
              <div className="bg-gray-900/50 rounded-lg p-2 mt-2">
                <p className="text-[10px] text-gray-500 mb-0.5">Visual Prompt</p>
                <p className="text-xs text-gray-400">{scene.visualPrompt}</p>
              </div>
            )}
            {scene.visualDescriptionKO && (
              <div className="mt-1">
                <p className="text-[10px] text-gray-500 mb-0.5">화면 설명</p>
                <p className="text-xs text-gray-400">{scene.visualDescriptionKO}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Next step */}
      {selectedAsScript && (
        <div className="mt-6 bg-violet-600/10 border border-violet-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-violet-300">대본이 준비되었습니다!</p>
            <p className="text-xs text-gray-400 mt-0.5">다음 단계로 이동하여 사운드를 생성하세요</p>
          </div>
          <button onClick={() => setActiveTab('sound-studio')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            사운드스튜디오로 이동 →
          </button>
        </div>
      )}
    </motion.section>
  );
}
