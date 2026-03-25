import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../stores/use-app-store';
import { useScriptStore } from '../../stores/use-script-store';
import { AI_MODELS, type AiModel } from '../../services/ai-api';

// Style presets matching original zt array
const STYLE_PRESETS = [
  { id: 'standard-longform', name: '스탠다드 롱폼', icon: '📝', description: '똑똑한 옆집 형 · 6000자 줄글' },
  { id: 'community', name: '커뮤니티', icon: '🔥', description: '짤감자 음슴체 · 쇼츠 250~350자' },
  { id: 'shopping', name: '쇼핑', icon: '🛒', description: '동적 타겟팅 · 구매 합리화 숏폼' },
  { id: 'knowledge', name: '지식', icon: '🧪', description: '정보 각인 프로토콜 · 지식 쇼츠' },
  { id: 'humanism', name: '휴머니즘 사이다', icon: '⚖️', description: '빌런 참교육 · 감동 사이다 쇼츠' },
];

// Model cards matching original qH array with colors
const MODEL_CARDS: { id: AiModel; label: string; description: string; detail: string; color: string; hasWebSearch: boolean }[] = [
  { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro', description: '웹 검색으로 최신 정보를 반영하는 빠른 대본 생성', detail: '실시간 뉴스·트렌드 검색 기반 | 속도 빠름 | 가성비 최고', color: 'emerald', hasWebSearch: true },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', description: '자연스러운 한국어와 높은 대본 퀄리티', detail: '문체·구어체 탁월 | 지시사항 100% 준수 | 밸런스형', color: 'violet', hasWebSearch: false },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', description: '최고 수준의 스토리텔링과 바이럴 구조', detail: '감정곡선·떡밥회수 탁월 | 깊이 있는 서사 | 프리미엄', color: 'amber', hasWebSearch: false },
];

const SHORTS_SECONDS = [15, 30, 45, 60];
const LONG_MINUTES = [5, 8, 10, 13, 15, 20, 23, 25, 30];
const CHARS_PER_MINUTE = 650;

const SPLIT_FORMATS = [
  { id: 'long-form', label: '롱폼', color: 'bg-blue-600' },
  { id: 'short-form', label: '숏폼', color: 'bg-emerald-600' },
  { id: 'nano-form', label: '나노', color: 'bg-pink-600' },
  { id: 'manual', label: '수동', color: 'bg-gray-600' },
];

const LONG_SPLIT_TYPES = [
  { id: 'ECONOMY', label: '절약 중심', desc: '4~6문장 → 1장면 (최소 컷, 비용 절약)' },
  { id: 'DEFAULT', label: '호흡 중심', desc: '2~3문장 → 1장면 (적은 컷, 강의/설명)' },
  { id: 'DETAILED', label: '디테일 중심', desc: '1문장 → 1장면 (많은 컷, 다큐/사연)' },
];

export default function ScriptWriterTab() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const store = useScriptStore();

  // Step 1 state
  const [inputMode, setInputMode] = useState<'recommend' | 'direct'>('direct');
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [aiTopics, setAiTopics] = useState<any[]>([]);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState<number | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // Step 2 state
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Step 3 state
  const [contentFormat, setContentFormat] = useState<'long' | 'shorts'>('long');
  const [shortsSeconds, setShortsSeconds] = useState(30);
  const [longMinutes, setLongMinutes] = useState(10);
  const [targetCharCount, setTargetCharCount] = useState(6500);
  const [referenceComments, setReferenceComments] = useState('');

  // Generation state
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [styledScript, setStyledScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [isFinalSelected, setIsFinalSelected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Split state
  const [videoFormat, setVideoFormat] = useState('short-form');
  const [longSplitType, setLongSplitType] = useState('DEFAULT');
  const [splitResult, setSplitResult] = useState<string[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  const estimateDuration = (chars: number) => {
    const totalSec = Math.round((chars / CHARS_PER_MINUTE) * 60);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `약 ${m}분 ${s}초` : `약 ${s}초`;
  };

  // AI topic recommendation
  const recommendTopics = async () => {
    if (!apiKeys.evolink && !apiKeys.gemini) { toast.error('API 키를 설정해주세요'); return; }
    setIsRecommending(true);
    try {
      const key = apiKeys.evolink || apiKeys.gemini;
      const systemPrompt = `당신은 유튜브 바이럴 콘텐츠 기획 전문가입니다.\nGoogle 검색을 활용하여 지금 가장 뜨거운 바이럴 트렌드, 인기 유튜브 영상, 화제 이슈를 조사한 뒤,\n폭발적 조회수가 예상되는 새로운 콘텐츠 소재 5개를 추천합니다.\n다양한 장르(지식/정보, 엔터테인먼트, 브이로그, 리뷰, 스토리텔링 등)를 포함하세요.\n반드시 JSON 배열로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만.`;
      const userMsg = `지금 유튜브에서 가장 핫한 바이럴 소재 5개를 추천해주세요.\n\n각 소재는 다음 형식으로:\n{"title":"영상 제목 (30자 이내)", "hook":"첫 3초 훅 문장", "synopsis":"1-2줄 줄거리", "whyViral":"바이럴 예상 이유", "estimatedViralScore":85}`;

      const res = await fetch('https://api.evolink.ai/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 4000, messages: [{ role: 'user', content: `${systemPrompt}\n\n${userMsg}` }] }),
      });
      if (!res.ok) throw new Error(`API 오류: ${res.status}`);
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setAiTopics(JSON.parse(jsonMatch[0]));
        toast.success('바이럴 소재 5개를 추천받았습니다');
      } else throw new Error('JSON 파싱 실패');
    } catch (err: any) {
      toast.error(err.message || '소재 추천 실패');
    } finally {
      setIsRecommending(false);
    }
  };

  // Script generation
  const generateScript = async () => {
    const topicTitle = inputMode === 'recommend' && selectedTopicIdx !== null ? aiTopics[selectedTopicIdx]?.title : title;
    const topicSynopsis = inputMode === 'recommend' && selectedTopicIdx !== null ? aiTopics[selectedTopicIdx]?.synopsis : synopsis;
    if (!topicTitle && !topicSynopsis) { toast.error('제목이나 줄거리를 입력해주세요'); return; }

    const key = apiKeys.evolink || apiKeys.gemini;
    if (!key) { toast.error('Evolink API 키가 설정되지 않았습니다. 설정에서 키를 입력해주세요.'); return; }

    setIsGenerating(true);
    setStreamingText('');
    setGeneratedScript('');
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

    const isShorts = contentFormat === 'shorts';
    const charTarget = isShorts ? Math.round((shortsSeconds / 60) * CHARS_PER_MINUTE) : longMinutes * CHARS_PER_MINUTE;

    const systemPrompt = `당신은 전문 영상 대본 작가입니다. 사용자의 요청에 따라 완성도 높은 ${isShorts ? '유튜브 쇼츠' : '영상'} 대본을 생성합니다.\n\n핵심 원칙:\n1. 대본에 포함되는 정보, 사례, 통계, 사건은 반드시 실제로 존재하는 것이어야 합니다.\n2. 허구의 연구, 가짜 통계, 존재하지 않는 사건을 지어내지 마세요.\n3. 확실하지 않은 정보는 "~로 알려져 있다", "~라는 주장이 있다"로 표현하세요.\n4. 구체적 수치나 출처를 언급할 때는 실제 데이터만 사용하세요.${isShorts ? `\n\n중요 — 이 대본은 유튜브 쇼츠(${shortsSeconds}초 이내 세로 영상)용입니다:\n- 첫 문장에서 즉시 주제를 던지세요 (서론/도입부 없이 바로 핵심)\n- 짧고 강렬한 문장 위주 (한 문장 20자 이내)\n- "본 영상에서 다루겠습니다" 같은 롱폼 유도 표현 절대 금지\n- 대본 자체가 완결된 콘텐츠여야 합니다\n- 마지막은 반전/충격/핵심 결론으로 임팩트 있게 마무리` : ''}`;

    const hookSection = inputMode === 'recommend' && selectedTopicIdx !== null ? `\n- 훅: ${aiTopics[selectedTopicIdx]?.hook}` : '';
    const commentsSection = referenceComments.trim() ? `\n\n[시청자 댓글 참고]\n${referenceComments.slice(0, 2000)}\n→ 위 댓글에서 시청자들이 관심 있어하는 포인트를 대본에 자연스럽게 반영하세요.` : '';

    const userPrompt = `다음 조건에 맞는 ${isShorts ? `유튜브 쇼츠(세로 ${shortsSeconds}초)` : '영상'} 대본을 생성하세요:\n\n- 제목: ${topicTitle}\n- 줄거리: ${topicSynopsis}${hookSection}\n- 포맷: ${isShorts ? `쇼츠 (${shortsSeconds}초 이내, 세로형)` : '롱폼'}\n- 분량: ${charTarget}자 (반드시 이 분량을 채우세요. 목표 글자수에 도달할 때까지 내용을 충분히 전개하세요)${commentsSection}\n\n대본만 출력하세요. 제목이나 부가 설명 없이 본문만.`;

    try {
      const model = store.model;
      const maxTokens = Math.min(65536, Math.max(8000, Math.ceil(charTarget * 4)));

      let result = '';
      if (model.startsWith('claude')) {
        const res = await fetch('https://api.evolink.ai/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.7, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }),
        });
        if (!res.ok) throw new Error(`Evolink API 오류: ${res.status}`);
        const data = await res.json();
        result = data.content?.[0]?.text || '';
      } else {
        // Gemini via Evolink native
        const geminiKey = apiKeys.gemini || key;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
          }),
        });
        if (!res.ok) throw new Error(`Gemini API 오류: ${res.status}`);
        const data = await res.json();
        result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      if (!result) throw new Error('AI 응답이 비어있습니다. 다시 시도해주세요.');

      setGeneratedScript(result);
      setStreamingText(result);

      // Check if truncated
      const trimmed = result.trimEnd();
      if (result.length > 100 && result.length < charTarget * 0.85) {
        toast.info('대본이 중간에 끊겼을 수 있어요. "대본 이어쓰기"를 사용해보세요.', { duration: 8000 });
      }

      toast.success(`대본 생성 완료! (${result.length.toLocaleString()}자, ${estimateDuration(result.length)})`);
    } catch (err: any) {
      toast.error(err.message || '대본 생성 실패');
    } finally {
      setIsGenerating(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  // Continue truncated script
  const continueScript = async () => {
    if (!generatedScript) return;
    const remaining = targetCharCount - generatedScript.length;
    const key = apiKeys.evolink || apiKeys.gemini;
    if (!key) { toast.error('API 키를 설정해주세요'); return; }

    setIsGenerating(true);
    try {
      const prompt = remaining > 0
        ? `다음은 이전에 작성하던 대본의 마지막 부분입니다:\n\n"...${generatedScript.slice(-800)}"\n\n이 대본을 끊긴 부분부터 자연스럽게 이어서 계속 작성하세요.\n남은 분량: 약 ${remaining}자\n\n중요: 이미 쓴 내용을 반복하지 마세요. 끊긴 지점부터 바로 이어서 쓰세요. 대본 본문만 출력하세요.`
        : `다음 대본의 마지막 문장이 중간에서 끊겼습니다:\n\n"...${generatedScript.slice(-400)}"\n\n끊긴 마지막 문장만 자연스럽게 완성하세요. 새로운 내용을 추가하지 마세요. 대본 본문만 출력하세요.`;

      const res = await fetch('https://api.evolink.ai/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: store.model.startsWith('claude') ? store.model : 'claude-sonnet-4-6', max_tokens: Math.min(32000, Math.max(2000, Math.ceil(Math.max(remaining, 200) * 4))), temperature: 0.7, messages: [{ role: 'user', content: prompt }] }),
      });
      if (!res.ok) throw new Error(`API 오류: ${res.status}`);
      const data = await res.json();
      const continuation = data.content?.[0]?.text || '';
      if (continuation) {
        setGeneratedScript((prev) => prev + continuation);
        toast.success(`대본 이어쓰기 완료 (+${continuation.length}자)`);
      }
    } catch (err: any) {
      toast.error(err.message || '이어쓰기 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  // Scene splitting
  const splitScript = () => {
    if (!generatedScript) { toast.error('대본을 먼저 생성해주세요'); return; }
    setIsSplitting(true);
    setTimeout(() => {
      const text = generatedScript;
      let scenes: string[];
      if (videoFormat === 'manual') {
        scenes = text.split('\n\n').filter((s) => s.trim());
      } else if (videoFormat === 'nano-form') {
        scenes = text.split(/[,，、]\s*/).filter((s) => s.trim());
      } else if (videoFormat === 'short-form') {
        scenes = text.split(/[.!?。]\s+/).filter((s) => s.trim()).map((s) => s + '.');
      } else {
        // long-form with split type
        const sentences = text.split(/(?<=[.!?。])\s+/).filter((s) => s.trim());
        const perScene = longSplitType === 'ECONOMY' ? 5 : longSplitType === 'DETAILED' ? 1 : 2;
        scenes = [];
        for (let i = 0; i < sentences.length; i += perScene) {
          scenes.push(sentences.slice(i, i + perScene).join(' '));
        }
      }
      setSplitResult(scenes);
      setIsSplitting(false);
      toast.success(`${scenes.length}개 장면으로 분할 완료`);
    }, 500);
  };

  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500 bg-emerald-600/10',
    violet: 'border-violet-500 bg-violet-600/10',
    amber: 'border-amber-500 bg-amber-600/10',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center text-white text-sm">✍️</div>
        <div>
          <h1 className="text-2xl font-bold text-white">대본 작성</h1>
        </div>
      </div>

      {/* ======= STEP 1: 소재 정하기 ======= */}
      <section className="pb-5 mb-5 border-b border-gray-700/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">1</span>
          <h2 className="text-sm font-bold text-white">소재 정하기</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setInputMode('recommend')}
            className={`p-4 rounded-xl border text-left transition-all ${inputMode === 'recommend' ? 'bg-violet-600/15 border-violet-500/60 text-violet-300 shadow-lg shadow-violet-900/20' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
            <span className="text-lg">🔍</span>
            <p className="text-sm font-medium mt-1">AI가 추천해줘</p>
            <p className="text-[10px] text-gray-500">주제가 없어도 OK</p>
          </button>
          <button onClick={() => setInputMode('direct')}
            className={`p-4 rounded-xl border text-left transition-all ${inputMode === 'direct' ? 'bg-violet-600/15 border-violet-500/60 text-violet-300 shadow-lg shadow-violet-900/20' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`}>
            <span className="text-lg">✏️</span>
            <p className="text-sm font-medium mt-1">직접 입력할게</p>
            <p className="text-[10px] text-gray-500">제목 + 줄거리</p>
          </button>
        </div>

        {inputMode === 'recommend' ? (
          <div className="space-y-3">
            <button onClick={recommendTopics} disabled={isRecommending}
              className="w-full py-3 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {isRecommending ? '🔍 바이럴 소재 분석 중...' : '🔍 지금 뜨는 바이럴 소재 5개 추천받기'}
            </button>
            {aiTopics.length > 0 && (
              <div className="space-y-2">
                {aiTopics.map((topic, idx) => (
                  <button key={idx} onClick={() => setSelectedTopicIdx(idx)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${selectedTopicIdx === idx ? 'border-violet-500 bg-violet-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {topic.estimatedViralScore >= 80 && <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded text-[10px]">🔥 {topic.estimatedViralScore}</span>}
                      <span className="text-sm font-medium text-white">{topic.title}</span>
                    </div>
                    <p className="text-xs text-gray-400">{topic.synopsis}</p>
                    {topic.hook && <p className="text-[10px] text-violet-400 mt-1">훅: "{topic.hook}"</p>}
                  </button>
                ))}
              </div>
            )}
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-300">고급: 본능 기제 / 벤치마크로 정교한 추천</summary>
              <div className="mt-2 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-gray-400">벤치마크 채널의 대본과 본능 기제를 조합하여 더 정교한 소재를 추천합니다.</p>
                <p className="text-gray-500 mt-1">채널 분석실에서 벤치마크 데이터를 먼저 수집해주세요.</p>
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">📌 제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="영상 제목을 입력하세요"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">📋 줄거리 · 핵심 내용</label>
              <textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={3}
                placeholder="어떤 내용의 영상인지 간단히 설명해주세요"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none" />
            </div>
          </div>
        )}
      </section>

      {/* ======= STEP 2: 스타일 선택 ======= */}
      <section className="pb-5 mb-5 border-b border-gray-700/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold">2</span>
          <h2 className="text-sm font-bold text-white">스타일 선택</h2>
          <span className="text-[10px] text-gray-500">(선택사항)</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {STYLE_PRESETS.map((s) => (
            <button key={s.id} onClick={() => setSelectedStyle(selectedStyle === s.id ? null : s.id)}
              className={`p-3 rounded-xl border text-center transition-all ${selectedStyle === s.id ? 'border-violet-500 bg-violet-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
              <span className="text-xl block">{s.icon}</span>
              <p className="text-xs font-medium text-white mt-1">{s.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ======= STEP 3: 대본 생성 ======= */}
      <section className="pb-5 mb-5 border-b border-gray-700/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">3</span>
          <h2 className="text-sm font-bold text-white">대본 생성</h2>
        </div>

        {/* AI Model */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">AI 모델</label>
          <div className="grid grid-cols-3 gap-2">
            {MODEL_CARDS.map((m) => (
              <button key={m.id} onClick={() => store.setModel(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${store.model === m.id ? colorMap[m.color] : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                <p className="text-xs font-medium text-white">{m.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{m.description}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{m.detail}</p>
                {m.hasWebSearch && <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-600/20 text-emerald-400 rounded text-[9px]">웹 검색</span>}
              </button>
            ))}
          </div>
          {!MODEL_CARDS.find((m) => m.id === store.model)?.hasWebSearch && (
            <p className="text-[10px] text-amber-500 mt-1">(웹 검색 미지원 — 최신 트렌드 반영이 필요하면 Gemini 추천)</p>
          )}
        </div>

        {/* Content format + duration */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => { setContentFormat('long'); setTargetCharCount(longMinutes * CHARS_PER_MINUTE); }}
              className={`px-4 py-2 text-xs font-medium ${contentFormat === 'long' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>롱폼</button>
            <button onClick={() => { setContentFormat('shorts'); setTargetCharCount(Math.round((shortsSeconds / 60) * CHARS_PER_MINUTE)); }}
              className={`px-4 py-2 text-xs font-medium ${contentFormat === 'shorts' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>쇼츠</button>
          </div>

          {contentFormat === 'shorts' ? (
            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              {SHORTS_SECONDS.map((s) => (
                <button key={s} onClick={() => { setShortsSeconds(s); setTargetCharCount(Math.round((s / 60) * CHARS_PER_MINUTE)); }}
                  className={`px-3 py-2 text-xs ${shortsSeconds === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{s}초</button>
              ))}
            </div>
          ) : (
            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              {LONG_MINUTES.map((m) => (
                <button key={m} onClick={() => { setLongMinutes(m); setTargetCharCount(m * CHARS_PER_MINUTE); }}
                  className={`px-2.5 py-2 text-xs ${longMinutes === m ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{m}분</button>
              ))}
            </div>
          )}
        </div>

        {/* Target char count */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">목표 글자수: {targetCharCount.toLocaleString()}자 ({estimateDuration(targetCharCount)})</label>
          <input type="range" min={contentFormat === 'shorts' ? 100 : 350} max={contentFormat === 'shorts' ? 1000 : 30000}
            step={contentFormat === 'shorts' ? 25 : 50} value={targetCharCount}
            onChange={(e) => setTargetCharCount(Number(e.target.value))}
            className="w-full accent-violet-500" />
        </div>

        {/* Reference comments */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">댓글 붙여넣기 (선택)</label>
          <textarea value={referenceComments} onChange={(e) => setReferenceComments(e.target.value.slice(0, 3000))} rows={3}
            placeholder="YouTube 댓글을 복사·붙여넣기하세요. 시청자 반응과 관심사가 대본에 반영됩니다."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none" />
          <p className="text-[10px] text-gray-600 text-right">{referenceComments.length}/3000</p>
        </div>

        {/* Generate */}
        <button onClick={generateScript} disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-bold transition-all shadow-lg shadow-violet-500/10">
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 대본 생성 중... ({elapsed}초)
            </span>
          ) : (
            `🚀 ${store.model === 'claude-opus-4-6' ? 'Opus' : store.model === 'claude-sonnet-4-6' ? 'Sonnet' : 'AI'} 대본 생성`
          )}
        </button>
      </section>

      {/* ======= Generated Script ======= */}
      {generatedScript && (
        <section className="pb-5 mb-5 border-b border-gray-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{generatedScript.length.toLocaleString()}자 · {estimateDuration(generatedScript.length)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(generatedScript); toast.success('복사됨'); }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-xs text-gray-300 rounded-lg transition-colors">복사</button>
              <button onClick={() => { setIsFinalSelected(true); toast.success('최종 대본으로 선택됨'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isFinalSelected ? 'bg-violet-600/20 border border-violet-500/50 text-violet-300' : 'bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300'}`}>
                {isFinalSelected ? '✓ 최종 대본으로 선택됨' : '✓ 최종 대본으로 선택'}
              </button>
            </div>
          </div>

          <textarea value={generatedScript} onChange={(e) => setGeneratedScript(e.target.value)} rows={14}
            placeholder="대본을 직접 입력하거나, 위에서 AI 생성을 사용하세요."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-normal leading-relaxed focus:outline-none focus:border-violet-500 resize-y" />

          {/* Continue / Expand */}
          <div className="flex gap-2 mt-3">
            <button onClick={continueScript} disabled={isGenerating}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-xs text-gray-300 rounded-lg transition-colors disabled:opacity-50">
              ✏️ 대본 이어쓰기
            </button>
            <button disabled className="px-4 py-2 bg-gray-800 border border-gray-600 text-xs text-gray-500 rounded-lg">
              📐 대본 확장 (준비 중)
            </button>
          </div>
        </section>
      )}

      {/* ======= 단락 나누기 ======= */}
      {generatedScript && (
        <section className="pb-5 mb-5 border-b border-gray-700/30">
          <h3 className="text-sm font-bold text-white mb-3">📝 단락 나누기</h3>
          <p className="text-xs text-gray-500 mb-3">단락 나누기는 대본의 구조를 정리합니다. 이미지/영상 탭에서 이 단락을 확인한 후 AI가 비주얼 프롬프트를 생성합니다.</p>

          <div className="flex gap-2 mb-3 flex-wrap">
            {SPLIT_FORMATS.map((f) => (
              <button key={f.id} onClick={() => setVideoFormat(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${videoFormat === f.id ? `${f.color} text-white border-transparent` : 'border-gray-700 text-gray-400'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {videoFormat === 'long-form' && (
            <div className="flex gap-2 mb-3">
              {LONG_SPLIT_TYPES.map((t) => (
                <button key={t.id} onClick={() => setLongSplitType(t.id)}
                  className={`flex-1 p-2 rounded-lg border text-left transition-all ${longSplitType === t.id ? 'border-blue-500 bg-blue-600/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                  <p className="text-xs font-medium text-white">{t.label}</p>
                  <p className="text-[10px] text-gray-500">{t.desc}</p>
                </button>
              ))}
            </div>
          )}

          {splitResult.length > 0 && (
            <div className="space-y-1.5 mb-4 max-h-[300px] overflow-y-auto pr-1">
              {splitResult.map((scene, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-gray-800 border border-gray-700 rounded-lg p-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                  <p className="text-xs text-gray-300 leading-relaxed">{scene}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ======= Bottom Action Buttons ======= */}
      <div className="grid grid-cols-3 gap-3 pb-8">
        <button onClick={splitScript} disabled={!generatedScript || isSplitting}
          className="py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-30 text-white text-sm rounded-lg font-bold transition-all">
          📝 단락 나누기
        </button>
        <button onClick={() => setActiveTab('sound-studio')}
          className="py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white text-sm rounded-lg font-bold transition-all">
          🎙 사운드 →
        </button>
        <button onClick={() => setActiveTab('image-video')}
          className="py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm rounded-lg font-bold transition-all">
          🎬 이미지/영상 →
        </button>
      </div>
    </div>
  );
}
