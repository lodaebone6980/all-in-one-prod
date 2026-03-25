import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/use-app-store';
import { useScriptStore } from '../../stores/use-script-store';
import { AI_MODELS, generateScript, type AiModel, type ScriptFormat, type ScriptStructure, type ScriptResult } from '../../services/ai-api';

const FORMATS: { id: ScriptFormat; label: string; icon: string; desc: string }[] = [
  { id: 'long', label: '장편', icon: '📖', desc: '10-20분 영상' },
  { id: 'short', label: '숏폼', icon: '📱', desc: '1-3분 영상' },
  { id: 'nano', label: '나노/도파민', icon: '⚡', desc: '15-60초' },
];

const STRUCTURES: { id: ScriptStructure; label: string; icon: string }[] = [
  { id: 'narrative', label: '기승전결 서사', icon: '📚' },
  { id: 'listicle', label: '리스트/랭킹', icon: '📋' },
  { id: 'tutorial', label: '튜토리얼', icon: '🎓' },
  { id: 'review', label: '리뷰/비교', icon: '⚖️' },
  { id: 'vlog', label: '브이로그', icon: '🎥' },
  { id: 'debate', label: '찬반 토론', icon: '💬' },
];

export default function ScriptWriterTab() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const store = useScriptStore();

  const handleGenerate = async () => {
    if (!store.topic.trim()) {
      toast.error('주제를 입력해주세요');
      return;
    }
    store.setGenerating(true);
    store.setResult(null);
    store.setStreamText('');

    try {
      const result = await generateScript(
        {
          topic: store.topic,
          model: store.model,
          format: store.format,
          structure: store.structure,
          targetLength: store.targetLength,
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
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✍️</span> 대본작성
            </h2>
            <p className="text-sm text-gray-400 mt-1">AI가 영상 대본을 생성합니다</p>
          </div>
          {store.result && (
            <button
              onClick={store.resetForm}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              새 대본 작성
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {store.result ? (
            <ScriptResultView key="result" result={store.result} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => store.setStep(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      store.step === s
                        ? 'bg-indigo-600/30 text-indigo-300'
                        : store.step > s
                        ? 'text-emerald-400'
                        : 'text-gray-500'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      store.step === s ? 'bg-indigo-600 text-white' : store.step > s ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {store.step > s ? '✓' : s}
                    </span>
                    {s === 1 ? '주제' : s === 2 ? '설정' : '생성'}
                  </button>
                ))}
              </div>

              {/* Step 1: Topic */}
              {store.step === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">영상 주제</label>
                    <textarea
                      value={store.topic}
                      onChange={(e) => store.setTopic(e.target.value)}
                      placeholder="예: 2024년 가장 핫한 AI 도구 TOP 10 비교 리뷰"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">포맷</label>
                    <div className="grid grid-cols-3 gap-3">
                      {FORMATS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            store.setFormat(f.id);
                            store.setTargetLength(f.id === 'long' ? 10 : f.id === 'short' ? 2 : 0.5);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            store.format === f.id
                              ? 'border-indigo-500 bg-indigo-600/10'
                              : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                          }`}
                        >
                          <span className="text-xl">{f.icon}</span>
                          <p className="text-sm font-medium text-white mt-1">{f.label}</p>
                          <p className="text-[10px] text-gray-500">{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">구조</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STRUCTURES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => store.setStructure(s.id)}
                          className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                            store.structure === s.id
                              ? 'border-indigo-500 bg-indigo-600/10'
                              : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                          }`}
                        >
                          <span>{s.icon}</span>
                          <span className="text-xs font-medium text-gray-300">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => store.setStep(2)}
                      disabled={!store.topic.trim()}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      다음 →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Settings */}
              {store.step === 2 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">AI 모델</label>
                    <div className="grid grid-cols-2 gap-3">
                      {AI_MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => store.setModel(m.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            store.model === m.id
                              ? 'border-indigo-500 bg-indigo-600/10'
                              : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{m.label}</p>
                            <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{m.provider}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">{m.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">목표 길이 (분)</label>
                      <input
                        type="number"
                        value={store.targetLength}
                        onChange={(e) => store.setTargetLength(Number(e.target.value))}
                        min={0.25}
                        max={60}
                        step={0.5}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">톤 (선택)</label>
                      <input
                        type="text"
                        value={store.tone}
                        onChange={(e) => store.setTone(e.target.value)}
                        placeholder="예: 유쾌하고 에너지 넘치는"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">추가 요청사항 (선택)</label>
                    <textarea
                      value={store.additionalNotes}
                      onChange={(e) => store.setAdditionalNotes(e.target.value)}
                      placeholder="추가로 원하는 내용이 있으면 입력하세요"
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button onClick={() => store.setStep(1)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                      ← 이전
                    </button>
                    <button
                      onClick={() => store.setStep(3)}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      다음 →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Generate */}
              {store.step === 3 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {/* Summary */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                    <h4 className="text-sm font-medium text-white">생성 요약</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">주제:</span> <span className="text-gray-300">{store.topic}</span></div>
                      <div><span className="text-gray-500">모델:</span> <span className="text-gray-300">{AI_MODELS.find((m) => m.id === store.model)?.label}</span></div>
                      <div><span className="text-gray-500">포맷:</span> <span className="text-gray-300">{FORMATS.find((f) => f.id === store.format)?.label}</span></div>
                      <div><span className="text-gray-500">구조:</span> <span className="text-gray-300">{STRUCTURES.find((s) => s.id === store.structure)?.label}</span></div>
                      <div><span className="text-gray-500">길이:</span> <span className="text-gray-300">{store.targetLength}분</span></div>
                      {store.tone && <div><span className="text-gray-500">톤:</span> <span className="text-gray-300">{store.tone}</span></div>}
                    </div>
                  </div>

                  {/* Generating indicator */}
                  {store.generating && (
                    <div className="bg-gray-900 border border-indigo-500/30 rounded-xl p-6 text-center">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-indigo-300 font-medium">대본 생성 중...</p>
                      <p className="text-xs text-gray-500 mt-1">AI가 대본을 작성하고 있습니다</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button onClick={() => store.setStep(2)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                      ← 이전
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={store.generating}
                      className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all font-medium shadow-lg shadow-indigo-500/20"
                    >
                      {store.generating ? '생성 중...' : '✨ 대본 생성'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ScriptResultView({ result }: { result: ScriptResult }) {
  const handleCopy = () => {
    const text = result.scenes.map((s) =>
      `[씬 ${s.sceneNumber}] (${s.duration}초) ${s.mood ? `[${s.mood}]` : ''}\n나레이션: ${s.narration}\n화면: ${s.visualDescription}`
    ).join('\n\n');
    navigator.clipboard.writeText(`# ${result.title}\n\n${text}`);
    toast.success('대본을 클립보드에 복사했습니다');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalMinutes = Math.floor(result.totalDuration / 60);
  const totalSeconds = result.totalDuration % 60;

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Result header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">{result.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{result.scenes.length}씬</span>
              <span>{totalMinutes}분 {totalSeconds}초</span>
              <span>{AI_MODELS.find((m) => m.id === result.model)?.label}</span>
              <span className="text-emerald-400">${result.cost.totalUsd.toFixed(4)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              복사
            </button>
            <button onClick={handleExportJson} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              JSON 내보내기
            </button>
          </div>
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-3">
        {result.scenes.map((scene, idx) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                {scene.sceneNumber}
              </span>
              <span className="text-xs text-gray-500">{scene.duration}초</span>
              {scene.mood && (
                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px]">
                  {scene.mood}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">나레이션</p>
                <p className="text-sm text-gray-200 leading-relaxed">{scene.narration}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">화면 설명</p>
                <p className="text-xs text-gray-400 leading-relaxed">{scene.visualDescription}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
