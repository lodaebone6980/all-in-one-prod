export type TtsEngine = 'typecast' | 'elevenlabs';

export interface Voice {
  id: string;
  name: string;
  engine: TtsEngine;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'senior';
  language: string;
  accent?: string;
  purpose?: string;
  previewUrl?: string;
  favorite?: boolean;
}

export type Emotion = 'normal' | 'happy' | 'sad' | 'angry';
export type ToneShift = 'none' | 'up' | 'down';

export interface TtsRequest {
  text: string;
  voiceId: string;
  engine: TtsEngine;
  emotion: Emotion;
  toneShift: ToneShift;
  intensity: number; // 0-100
  speed: number; // 0.5-2.0
}

// Typecast Korean voices (sample set)
const TYPECAST_VOICES: Voice[] = [
  { id: 'tc-jiyeon', name: '지연', engine: 'typecast', gender: 'female', age: 'young', language: 'ko', purpose: '내레이션' },
  { id: 'tc-minjun', name: '민준', engine: 'typecast', gender: 'male', age: 'adult', language: 'ko', purpose: '내레이션' },
  { id: 'tc-soyeon', name: '소연', engine: 'typecast', gender: 'female', age: 'adult', language: 'ko', purpose: '뉴스' },
  { id: 'tc-jihoon', name: '지훈', engine: 'typecast', gender: 'male', age: 'young', language: 'ko', purpose: '유튜브' },
  { id: 'tc-hana', name: '하나', engine: 'typecast', gender: 'female', age: 'child', language: 'ko', purpose: '키즈' },
  { id: 'tc-dongwook', name: '동욱', engine: 'typecast', gender: 'male', age: 'adult', language: 'ko', purpose: '다큐' },
  { id: 'tc-yuna', name: '유나', engine: 'typecast', gender: 'female', age: 'young', language: 'ko', purpose: '광고' },
  { id: 'tc-seojun', name: '서준', engine: 'typecast', gender: 'male', age: 'senior', language: 'ko', purpose: '교육' },
  { id: 'tc-minji', name: '민지', engine: 'typecast', gender: 'female', age: 'young', language: 'ko', purpose: 'ASMR' },
  { id: 'tc-hyunwoo', name: '현우', engine: 'typecast', gender: 'male', age: 'young', language: 'ko', purpose: '게임' },
  { id: 'tc-eunji', name: '은지', engine: 'typecast', gender: 'female', age: 'adult', language: 'ko', purpose: '안내' },
  { id: 'tc-taehyung', name: '태형', engine: 'typecast', gender: 'male', age: 'adult', language: 'ko', purpose: '라디오' },
];

// ElevenLabs multilingual voices (sample set)
const ELEVENLABS_VOICES: Voice[] = [
  { id: 'el-rachel', name: 'Rachel', engine: 'elevenlabs', gender: 'female', age: 'adult', language: 'en', accent: 'American' },
  { id: 'el-adam', name: 'Adam', engine: 'elevenlabs', gender: 'male', age: 'adult', language: 'en', accent: 'American' },
  { id: 'el-emma', name: 'Emma', engine: 'elevenlabs', gender: 'female', age: 'young', language: 'en', accent: 'British' },
  { id: 'el-james', name: 'James', engine: 'elevenlabs', gender: 'male', age: 'adult', language: 'en', accent: 'British' },
  { id: 'el-sakura', name: 'Sakura', engine: 'elevenlabs', gender: 'female', age: 'young', language: 'ja', accent: 'Japanese' },
  { id: 'el-takeshi', name: 'Takeshi', engine: 'elevenlabs', gender: 'male', age: 'adult', language: 'ja', accent: 'Japanese' },
  { id: 'el-mei', name: 'Mei', engine: 'elevenlabs', gender: 'female', age: 'young', language: 'zh', accent: 'Mandarin' },
  { id: 'el-carlos', name: 'Carlos', engine: 'elevenlabs', gender: 'male', age: 'adult', language: 'es', accent: 'Spanish' },
  { id: 'el-sophie', name: 'Sophie', engine: 'elevenlabs', gender: 'female', age: 'young', language: 'fr', accent: 'French' },
  { id: 'el-hans', name: 'Hans', engine: 'elevenlabs', gender: 'male', age: 'adult', language: 'de', accent: 'German' },
  { id: 'el-liam', name: 'Liam', engine: 'elevenlabs', gender: 'male', age: 'young', language: 'en', accent: 'Irish' },
  { id: 'el-aria', name: 'Aria', engine: 'elevenlabs', gender: 'female', age: 'adult', language: 'en', accent: 'American', purpose: 'narration' },
];

export function getAllVoices(): Voice[] {
  return [...TYPECAST_VOICES, ...ELEVENLABS_VOICES];
}

export function filterVoices(
  voices: Voice[],
  filters: {
    engine?: TtsEngine;
    gender?: string;
    language?: string;
    search?: string;
  }
): Voice[] {
  return voices.filter((v) => {
    if (filters.engine && v.engine !== filters.engine) return false;
    if (filters.gender && v.gender !== filters.gender) return false;
    if (filters.language && v.language !== filters.language) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.purpose?.toLowerCase().includes(q) ||
        v.accent?.toLowerCase().includes(q) ||
        v.language.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export async function synthesizeSpeech(
  req: TtsRequest,
  apiKeys: { typecast: string; evolink: string }
): Promise<{ audioUrl: string; duration: number }> {
  if (req.engine === 'typecast') {
    return synthesizeTypecast(req, apiKeys.typecast);
  }
  return synthesizeElevenLabs(req, apiKeys.evolink);
}

async function synthesizeTypecast(req: TtsRequest, apiKey: string): Promise<{ audioUrl: string; duration: number }> {
  if (!apiKey) throw new Error('Typecast API 키를 설정해주세요');

  // Typecast API integration placeholder
  // In production, this would call the actual Typecast API
  throw new Error('Typecast TTS API 연동이 필요합니다. 설정에서 API 키를 확인해주세요.');
}

async function synthesizeElevenLabs(req: TtsRequest, apiKey: string): Promise<{ audioUrl: string; duration: number }> {
  if (!apiKey) throw new Error('Evolink API 키를 설정해주세요 (ElevenLabs 프록시)');

  // ElevenLabs v3 via Evolink proxy placeholder
  throw new Error('ElevenLabs TTS API 연동이 필요합니다. 설정에서 API 키를 확인해주세요.');
}
