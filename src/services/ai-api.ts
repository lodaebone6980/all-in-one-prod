export type AiModel =
  | 'claude-opus'
  | 'claude-sonnet'
  | 'gemini-pro'
  | 'gemini-flash';

export interface AiModelConfig {
  id: AiModel;
  label: string;
  provider: string;
  description: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export const AI_MODELS: AiModelConfig[] = [
  {
    id: 'claude-opus',
    label: 'Claude Opus 4.6',
    provider: 'Evolink',
    description: '최고 품질, 장편 대본에 적합',
    maxTokens: 8192,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
  },
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet 4.6',
    provider: 'Evolink',
    description: '속도와 품질의 균형',
    maxTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  {
    id: 'gemini-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: '웹 검색 지원, 최신 정보 반영',
    maxTokens: 8192,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
  },
  {
    id: 'gemini-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: '빠르고 경제적',
    maxTokens: 8192,
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
  },
];

export type ScriptFormat = 'long' | 'short' | 'nano';
export type ScriptStructure = 'narrative' | 'listicle' | 'tutorial' | 'review' | 'vlog' | 'debate';

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
  narration: string;
  visualDescription: string;
  duration: number;
  mood?: string;
}

export interface ScriptResult {
  title: string;
  scenes: ScriptScene[];
  totalDuration: number;
  model: AiModel;
  cost: { inputTokens: number; outputTokens: number; totalUsd: number };
}

function buildPrompt(req: ScriptRequest): string {
  const formatMap = {
    long: '10-20분 장편 영상',
    short: '1-3분 숏폼 영상',
    nano: '15-60초 나노/도파민 숏폼',
  };

  const structureMap = {
    narrative: '기승전결 서사 구조',
    listicle: '리스트/랭킹 구조',
    tutorial: '튜토리얼/하우투 구조',
    review: '리뷰/비교 분석 구조',
    vlog: '브이로그/일상 구조',
    debate: '찬반 토론 구조',
  };

  return `당신은 전문 영상 대본 작가입니다. 다음 조건에 맞는 영상 대본을 작성해주세요.

## 조건
- 주제: ${req.topic}
- 포맷: ${formatMap[req.format]}
- 구조: ${structureMap[req.structure]}
- 목표 길이: 약 ${req.targetLength}분
- 톤: ${req.tone || '자연스럽고 친근한'}
- 언어: ${req.language || '한국어'}
${req.additionalNotes ? `- 추가 요청: ${req.additionalNotes}` : ''}

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "title": "영상 제목",
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": "나레이션 텍스트",
      "visualDescription": "화면에 보여줄 장면 설명",
      "duration": 15,
      "mood": "분위기 (예: 긴장감, 유쾌, 감동)"
    }
  ]
}

씬 개수는 포맷에 맞게 조절하세요:
- 장편: 15-30개 씬
- 숏폼: 5-10개 씬
- 나노: 3-5개 씬`;
}

export async function generateScript(
  req: ScriptRequest,
  apiKeys: { evolink: string; gemini: string },
  onStream?: (chunk: string) => void
): Promise<ScriptResult> {
  const prompt = buildPrompt(req);
  let responseText = '';

  if (req.model === 'claude-opus' || req.model === 'claude-sonnet') {
    responseText = await callEvolink(prompt, req.model, apiKeys.evolink, onStream);
  } else {
    responseText = await callGemini(prompt, req.model, apiKeys.gemini, onStream);
  }

  // Parse the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 파싱할 수 없습니다');

  const parsed = JSON.parse(jsonMatch[0]);
  const modelConfig = AI_MODELS.find((m) => m.id === req.model)!;
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(responseText.length / 4);

  const scenes: ScriptScene[] = parsed.scenes.map((s: any, i: number) => ({
    id: crypto.randomUUID(),
    sceneNumber: s.sceneNumber || i + 1,
    narration: s.narration,
    visualDescription: s.visualDescription,
    duration: s.duration || 10,
    mood: s.mood,
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
        (inputTokens / 1000) * modelConfig.costPer1kInput +
        (outputTokens / 1000) * modelConfig.costPer1kOutput,
    },
  };
}

async function callEvolink(
  prompt: string,
  model: 'claude-opus' | 'claude-sonnet',
  apiKey: string,
  onStream?: (chunk: string) => void
): Promise<string> {
  if (!apiKey) throw new Error('Evolink API 키를 설정해주세요');

  const modelId = model === 'claude-opus' ? 'claude-opus-4-6' : 'claude-sonnet-4-6';

  const res = await fetch('https://api.evolink.ai/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Evolink API 오류: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  onStream?.(text);
  return text;
}

async function callGemini(
  prompt: string,
  model: 'gemini-pro' | 'gemini-flash',
  apiKey: string,
  onStream?: (chunk: string) => void
): Promise<string> {
  if (!apiKey) throw new Error('Gemini API 키를 설정해주세요');

  const modelId = model === 'gemini-pro' ? 'gemini-2.5-pro-preview-06-05' : 'gemini-2.5-flash-preview-05-20';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.8 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 오류: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  onStream?.(text);
  return text;
}
