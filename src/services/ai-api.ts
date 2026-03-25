// LLM Models matching original v4.5
export type AiModel = 'gemini-3.1-pro' | 'claude-sonnet-4-6' | 'claude-opus-4-6';

export interface AiModelConfig {
  id: AiModel;
  label: string;
  inputPer1M: number;
  outputPer1M: number;
  hasWebSearch: boolean;
}

export const AI_MODELS: AiModelConfig[] = [
  { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro', inputPer1M: 1.6, outputPer1M: 9.6, hasWebSearch: true },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', inputPer1M: 2.55, outputPer1M: 12.75, hasWebSearch: false },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', inputPer1M: 4.13, outputPer1M: 21.25, hasWebSearch: false },
];

// Script format types matching original
export type ScriptFormat = 'long-form' | 'short-form' | 'nano-form' | 'manual';
export type ScriptStructure = 'narrative' | 'listicle' | 'tutorial' | 'review' | 'vlog' | 'debate';

export const SCRIPT_FORMATS = [
  { id: 'long-form' as ScriptFormat, label: '롱폼 (기본)', desc: '의미 단위 흐름, 최대 2문장의 유동적 호흡' },
  { id: 'short-form' as ScriptFormat, label: '숏폼 (빠름)', desc: '빠른 템포, 구/절 단위의 리듬감 있는 편집' },
  { id: 'nano-form' as ScriptFormat, label: '나노 (도파민)', desc: '초고속 도파민, 단어/비트 단위의 플래시 컷' },
];

export interface ScriptRequest {
  topic: string;
  model: AiModel;
  format: ScriptFormat;
  structure: ScriptStructure;
  targetLength: number;
  tone: string;
  additionalNotes: string;
  language: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  scriptText: string;
  visualPrompt: string;
  visualDescriptionKO: string;
  duration: number;
  mood?: string;
  characterPresent?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  startTime?: number;
  endTime?: number;
  audioDuration?: number;
  referenceImage?: string;
}

export interface ScriptResult {
  title: string;
  scenes: ScriptScene[];
  totalDuration: number;
  model: AiModel;
  cost: { inputTokens: number; outputTokens: number; totalUsd: number };
}

// System prompts matching original
const SYSTEM_PROMPTS = {
  scriptWriter: `You are a VISUAL DIRECTOR planning a storyboard production. Analyze the ENTIRE script and create a compact Visual Direction Sheet. You MUST respond with ONLY a valid JSON object. No markdown, no explanation.`,
  jsonOnly: `You MUST respond with ONLY a valid JSON object. No markdown, no explanation.`,
  thumbnail: `You are a Viral YouTube Thumbnail Expert. Analyze script context deeply. Generate 4 high-CTR concepts.`,
  characterAnalyst: `You are an expert character art analyst. You MUST respond with ONLY a valid JSON object -- no preamble, no markdown, no explanation. The JSON must have exactly two keys: "style" and "character".`,
  seoAnalyst: `유튜브 SEO 전문가이자 콘텐츠 전략 분석가. 제목 공식과 메타데이터 전략을 실전에서 바로 적용 가능할 정도로 매우 상세하게 분석. 한국어로 응답.`,
  commentAnalyst: `YouTube 시청자 심리 및 댓글 분석 전문가. 정량적 데이터와 정성적 인사이트를 모두 포함하여 한국어로 매우 상세하게 응답.`,
};

function buildScriptPrompt(req: ScriptRequest): string {
  const formatDesc: Record<ScriptFormat, string> = {
    'long-form': '10-20분 롱폼 영상. 의미 단위 흐름, 최대 2문장의 유동적 호흐. 기승전결 구조.',
    'short-form': '1-3분 숏폼 영상. 빠른 템포, 구/절 단위의 리듬감 있는 편집.',
    'nano-form': '15-60초 나노/도파민 숏폼. 초고속 도파민, 단어/비트 단위의 플래시 컷. Kill Shot을 0-3초에 배치.',
    'manual': '사용자 지정 포맷',
  };

  return `당신은 전문 영상 대본 작가이자 비주얼 디렉터입니다.

## 조건
- 주제: ${req.topic}
- 포맷: ${formatDesc[req.format]}
- 구조: ${req.structure}
- 목표 길이: 약 ${req.targetLength}분
- 톤: ${req.tone || '자연스럽고 친근한'}
- 언어: ${req.language || '한국어'}
${req.additionalNotes ? `- 추가 요청: ${req.additionalNotes}` : ''}

## 기승전결 원칙 (도파민 우선)
- 제0원칙: Kill Shot 선배치 -- 기승전결의 '기'가 아닌, '결(하이라이트)' 혹은 '전(위기/갈등)'을 맨 앞에 배치
- Kill shot 유형: 불가능한 행위, 압도적 결과물, 초정밀 디테일, 시각적 쾌감(ASMR)
- 배치 의무: 00:00~00:03에 무조건 배치

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "title": "영상 제목",
  "scenes": [
    {
      "sceneNumber": 1,
      "scriptText": "나레이션 텍스트",
      "visualPrompt": "English prompt for AI image generation",
      "visualDescriptionKO": "화면에 보여줄 장면 설명 (한국어)",
      "duration": 15,
      "mood": "분위기",
      "characterPresent": true
    }
  ]
}

씬 개수:
- 롱폼: 15-30개 씬
- 숏폼: 5-10개 씬
- 나노: 3-5개 씬`;
}

export async function generateScript(
  req: ScriptRequest,
  apiKeys: { evolink: string; gemini: string },
  onStream?: (chunk: string) => void
): Promise<ScriptResult> {
  const prompt = buildScriptPrompt(req);
  let responseText = '';

  if (req.model === 'claude-opus-4-6' || req.model === 'claude-sonnet-4-6') {
    responseText = await callEvolink(prompt, req.model, apiKeys.evolink, onStream);
  } else {
    responseText = await callGemini(prompt, apiKeys.gemini, onStream);
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 파싱할 수 없습니다');

  const parsed = JSON.parse(jsonMatch[0]);
  const modelConfig = AI_MODELS.find((m) => m.id === req.model)!;
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(responseText.length / 4);

  const scenes: ScriptScene[] = parsed.scenes.map((s: any, i: number) => ({
    id: crypto.randomUUID(),
    sceneNumber: s.sceneNumber || i + 1,
    scriptText: s.scriptText || s.narration || '',
    visualPrompt: s.visualPrompt || '',
    visualDescriptionKO: s.visualDescriptionKO || s.visualDescription || '',
    duration: s.duration || 10,
    mood: s.mood,
    characterPresent: s.characterPresent ?? false,
  }));

  return {
    title: parsed.title,
    scenes,
    totalDuration: scenes.reduce((a, s) => a + s.duration, 0),
    model: req.model,
    cost: {
      inputTokens,
      outputTokens,
      totalUsd:
        (inputTokens / 1_000_000) * modelConfig.inputPer1M +
        (outputTokens / 1_000_000) * modelConfig.outputPer1M,
    },
  };
}

async function callEvolink(prompt: string, model: AiModel, apiKey: string, onStream?: (chunk: string) => void): Promise<string> {
  if (!apiKey) throw new Error('Evolink API 키를 설정해주세요');
  const res = await fetch('https://api.evolink.ai/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 8192, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Evolink API 오류: ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  onStream?.(text);
  return text;
}

async function callGemini(prompt: string, apiKey: string, onStream?: (chunk: string) => void): Promise<string> {
  if (!apiKey) throw new Error('Gemini API 키를 설정해주세요');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.8 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API 오류: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  onStream?.(text);
  return text;
}

export { SYSTEM_PROMPTS };
