export type TtsEngine = 'typecast' | 'elevenlabs' | 'supertonic';

export interface Voice {
  id: string;
  name: string;
  engine: TtsEngine;
  gender: 'male' | 'female';
  language: string;
  description?: string;
}

export type TypecastModel = 'ssfm-v30' | 'ssfm-v21';
export type TypecastEmotion = 'normal' | 'happy' | 'sad' | 'angry' | 'whisper' | 'toneup' | 'tonedown';

// Supertonic 2 built-in voices (free, browser-based) matching original
export const SUPERTONIC_VOICES: Voice[] = [
  { id: 'F1', name: '수아', engine: 'supertonic', gender: 'female', language: 'ko', description: '차분하고 안정적인 낮은 톤' },
  { id: 'F2', name: '하늘', engine: 'supertonic', gender: 'female', language: 'ko', description: '밝고 쾌활한 발랄한 목소리' },
  { id: 'F3', name: '서연', engine: 'supertonic', gender: 'female', language: 'ko', description: '프로 아나운서, 또렷한 발음' },
  { id: 'F4', name: '지현', engine: 'supertonic', gender: 'female', language: 'ko', description: '또렷하고 자신감 있는 표현력' },
  { id: 'F5', name: '은서', engine: 'supertonic', gender: 'female', language: 'ko', description: '다정하고 부드러운 치유 목소리' },
  { id: 'M1', name: '준서', engine: 'supertonic', gender: 'male', language: 'ko', description: '활기차고 자신감 넘치는 에너지' },
  { id: 'M2', name: '민호', engine: 'supertonic', gender: 'male', language: 'ko', description: '깊고 묵직한 진지하고 차분한' },
  { id: 'M3', name: '현우', engine: 'supertonic', gender: 'male', language: 'ko', description: '세련된 권위감, 신뢰를 주는' },
  { id: 'M4', name: '지훈', engine: 'supertonic', gender: 'male', language: 'ko', description: '부드럽고 중립적, 친근한 톤' },
  { id: 'M5', name: '도윤', engine: 'supertonic', gender: 'male', language: 'ko', description: '따뜻하고 차분한 내레이션' },
];

// Typecast API integration matching original
export const TYPECAST_V30_EMOTIONS: TypecastEmotion[] = ['normal', 'happy', 'sad', 'angry', 'whisper', 'toneup', 'tonedown'];
export const TYPECAST_V21_EMOTIONS: TypecastEmotion[] = ['normal', 'happy', 'sad', 'angry', 'toneup'];

export const TYPECAST_LANGUAGES = [
  'kor', 'eng', 'jpn', 'zho', 'yue', 'spa', 'fra', 'deu', 'ita', 'por', 'vie', 'tha', 'ind', 'hin', 'ara', 'rus', 'tur', 'pol', 'nld'
];

export async function typecastTTS(
  text: string,
  voiceId: string,
  apiKey: string,
  options: {
    model?: TypecastModel;
    emotion?: TypecastEmotion;
    volume?: number;
    pitch?: number;
    tempo?: number;
    previousText?: string;
    nextText?: string;
  } = {}
): Promise<{ audioUrl: string }> {
  if (!apiKey) throw new Error('Typecast API 키를 설정해주세요');

  const res = await fetch('https://api.typecast.ai/v1/text-to-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({
      voice_id: voiceId,
      text,
      model: options.model || 'ssfm-v30',
      language: 'KOR',
      prompt: {
        emotion_type: 'smart',
        previous_text: options.previousText || '',
        next_text: options.nextText || '',
      },
      output: {
        volume: options.volume ?? 100,
        audio_pitch: options.pitch ?? 0,
        audio_tempo: options.tempo ?? 1.0,
        audio_format: 'wav',
      },
    }),
  });

  if (!res.ok) throw new Error(`Typecast API 오류: ${res.status}`);
  return res.json();
}

export async function fetchTypecastVoices(apiKey: string): Promise<Voice[]> {
  if (!apiKey) return [];
  const res = await fetch('https://api.typecast.ai/dashboard/v1/voices', {
    headers: { 'X-API-KEY': apiKey },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.result || []).map((v: any) => ({
    id: v.voice_id,
    name: v.name,
    engine: 'typecast' as TtsEngine,
    gender: v.gender === 'male' ? 'male' : 'female',
    language: v.language || 'ko',
    description: v.description || '',
  }));
}

// ElevenLabs STT (via Kie)
export async function elevenLabsSTT(audioUrl: string, kieKey: string) {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kieKey}` },
    body: JSON.stringify({
      model: 'elevenlabs/speech-to-text',
      input: { audio_url: audioUrl, diarize: true, tag_audio_events: false },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs STT 오류: ${res.status}`);
  return res.json();
}
