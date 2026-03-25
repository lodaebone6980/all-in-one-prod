export type ImageEngine = 'nanobanana' | 'imagen' | 'whisk' | 'grok';
export type VideoEngine = 'veo3' | 'veo31' | 'veo31-fast' | 'grok-video' | 'seedance';
export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface ImageEngineConfig {
  id: ImageEngine;
  label: string;
  description: string;
  costPerImage: number;
  requiresKey: string;
}

export interface VideoEngineConfig {
  id: VideoEngine;
  label: string;
  description: string;
  costPerVideo: number;
  maxDuration: number;
  maxResolution: string;
  requiresKey: string;
}

export const IMAGE_ENGINES: ImageEngineConfig[] = [
  { id: 'nanobanana', label: 'NanoBanana 2', description: '최고 품질 (Evolink)', costPerImage: 0.065, requiresKey: 'evolink' },
  { id: 'imagen', label: 'Imagen 3.5', description: 'Google 무료 (쿠키 필요)', costPerImage: 0, requiresKey: 'gemini' },
  { id: 'whisk', label: 'Google Whisk', description: '레퍼런스 기반 리믹스', costPerImage: 0, requiresKey: 'gemini' },
  { id: 'grok', label: 'Grok Imagine', description: 'X AI 이미지 생성', costPerImage: 0.02, requiresKey: 'xAi' },
];

export const VIDEO_ENGINES: VideoEngineConfig[] = [
  { id: 'veo3', label: 'Veo 3.0', description: 'Google 최고 품질', costPerVideo: 0.5, maxDuration: 8, maxResolution: '1080p', requiresKey: 'evolink' },
  { id: 'veo31', label: 'Veo 3.1', description: '최신 버전', costPerVideo: 0.6, maxDuration: 8, maxResolution: '1080p', requiresKey: 'evolink' },
  { id: 'veo31-fast', label: 'Veo 3.1 Fast', description: '빠른 생성', costPerVideo: 0.3, maxDuration: 4, maxResolution: '720p', requiresKey: 'evolink' },
  { id: 'grok-video', label: 'Grok Video', description: 'X AI 영상', costPerVideo: 0.15, maxDuration: 4, maxResolution: '720p', requiresKey: 'xAi' },
  { id: 'seedance', label: 'Seedance 1.5', description: 'ByteDance', costPerVideo: 0.2, maxDuration: 6, maxResolution: '1080p', requiresKey: 'apimart' },
];

export interface StyleCategory {
  name: string;
  styles: VisualStyle[];
}

export interface VisualStyle {
  id: string;
  name: string;
  nameKo: string;
  prompt: string;
  negativePrompt?: string;
  category: string;
}

export const STYLE_CATEGORIES: StyleCategory[] = [
  {
    name: '애니메이션/만화',
    styles: [
      { id: 'k-webtoon', name: 'K-Webtoon', nameKo: 'K-웹툰', prompt: 'Korean webtoon style, manhwa, clean lineart, digital coloring, vibrant colors', category: '애니메이션/만화' },
      { id: 'ghibli', name: 'Ghibli', nameKo: '지브리', prompt: 'Studio Ghibli style, soft watercolor, pastoral, warm lighting, anime', category: '애니메이션/만화' },
      { id: 'disney-pixar', name: 'Disney/Pixar 3D', nameKo: '디즈니/픽사 3D', prompt: 'Disney Pixar 3D animation style, CGI, vibrant, expressive characters', category: '애니메이션/만화' },
      { id: 'retro-anime', name: '90s Retro Anime', nameKo: '90년대 레트로', prompt: '90s retro anime style, cel animation, VHS aesthetic, nostalgic', category: '애니메이션/만화' },
      { id: 'chibi', name: 'Chibi/SD', nameKo: '치비/SD', prompt: 'chibi super deformed style, cute, big head, small body, kawaii', category: '애니메이션/만화' },
      { id: 'arcane', name: 'Arcane', nameKo: '아케인', prompt: 'Arcane animation style, painterly, dramatic lighting, stylized', category: '애니메이션/만화' },
      { id: 'spiderverse', name: 'Spider-Verse', nameKo: '스파이더버스', prompt: 'Into the Spider-Verse style, comic book halftone, dynamic, bold', category: '애니메이션/만화' },
    ],
  },
  {
    name: '아트 스타일',
    styles: [
      { id: 'watercolor', name: 'Watercolor', nameKo: '수채화', prompt: 'watercolor painting, soft washes, delicate, fluid colors', category: '아트 스타일' },
      { id: 'oil-impasto', name: 'Oil/Impasto', nameKo: '유화/임파스토', prompt: 'oil painting, thick impasto brushstrokes, rich texture, classical', category: '아트 스타일' },
      { id: 'ukiyoe', name: 'Ukiyo-e', nameKo: '우키요에', prompt: 'ukiyo-e Japanese woodblock print style, flat colors, bold outlines', category: '아트 스타일' },
      { id: 'botanical', name: 'Botanical', nameKo: '보타니컬', prompt: 'botanical illustration, detailed, scientific accuracy, elegant', category: '아트 스타일' },
      { id: 'ink-pen', name: 'Ink Pen', nameKo: '잉크 펜', prompt: 'ink pen drawing, crosshatching, detailed linework, monochrome', category: '아트 스타일' },
      { id: 'pop-art', name: 'Pop Art', nameKo: '팝 아트', prompt: 'pop art style, bold colors, Ben-Day dots, Andy Warhol inspired', category: '아트 스타일' },
      { id: 'art-nouveau', name: 'Art Nouveau', nameKo: '아르누보', prompt: 'Art Nouveau style, organic flowing lines, floral motifs, ornamental', category: '아트 스타일' },
      { id: 'surrealism', name: 'Surrealism', nameKo: '초현실주의', prompt: 'surrealist art, dreamlike, impossible scenes, Dali inspired', category: '아트 스타일' },
    ],
  },
  {
    name: '사진/시네마틱',
    styles: [
      { id: 'cinematic', name: 'Cinematic', nameKo: '시네마틱', prompt: 'cinematic photography, dramatic lighting, shallow depth of field, film grain', category: '사진/시네마틱' },
      { id: 'film-camera', name: 'Film Camera', nameKo: '필름 카메라', prompt: 'analog film photography, Kodak Portra 400, natural grain, warm tones', category: '사진/시네마틱' },
      { id: 'street-snap', name: 'Street Snap', nameKo: '스트릿 스냅', prompt: 'street photography, candid, urban, high contrast, documentary', category: '사진/시네마틱' },
      { id: 'macro', name: 'Macro', nameKo: '매크로', prompt: 'macro photography, extreme close-up, shallow DOF, detailed texture', category: '사진/시네마틱' },
      { id: 'drone-aerial', name: 'Drone Aerial', nameKo: '드론 항공', prompt: 'aerial drone photography, birds eye view, sweeping landscape', category: '사진/시네마틱' },
      { id: 'food-sizzle', name: 'Food Sizzle', nameKo: '푸드 시즐', prompt: 'food photography, appetizing, steam, perfect lighting, delicious', category: '사진/시네마틱' },
    ],
  },
  {
    name: '영화/장르',
    styles: [
      { id: 'noir', name: 'Film Noir', nameKo: '필름 누아르', prompt: 'film noir style, high contrast black and white, dramatic shadows, detective', category: '영화/장르' },
      { id: 'k-drama', name: 'K-Drama', nameKo: 'K-드라마', prompt: 'Korean drama aesthetic, soft focus, romantic lighting, cinematic', category: '영화/장르' },
      { id: 'horror', name: 'Horror', nameKo: '호러', prompt: 'horror movie style, dark atmosphere, eerie, unsettling, moody', category: '영화/장르' },
      { id: 'scifi', name: 'Sci-Fi', nameKo: 'SF 퓨처리스틱', prompt: 'science fiction, futuristic, neon, cyberpunk, advanced technology', category: '영화/장르' },
      { id: 'wes-anderson', name: 'Wes Anderson', nameKo: '웨스 앤더슨', prompt: 'Wes Anderson style, symmetrical composition, pastel colors, quirky', category: '영화/장르' },
      { id: 'wong-karwai', name: 'Wong Kar-wai', nameKo: '왕가위', prompt: 'Wong Kar-wai style, neon lights, moody, saturated colors, blurry', category: '영화/장르' },
    ],
  },
  {
    name: '디자인/커머셜',
    styles: [
      { id: 'k-ad', name: 'K-Ad', nameKo: 'K-광고', prompt: 'Korean advertisement style, clean, modern, professional, product focused', category: '디자인/커머셜' },
      { id: 'luxury-fashion', name: 'Luxury Fashion', nameKo: '럭셔리 패션', prompt: 'luxury fashion editorial, high-end, elegant, minimalist, couture', category: '디자인/커머셜' },
      { id: 'tech-minimal', name: 'Tech Minimalism', nameKo: '테크 미니멀', prompt: 'tech product photography, minimalist, clean white, modern design', category: '디자인/커머셜' },
      { id: 'eco-green', name: 'Eco/Green', nameKo: '에코/그린', prompt: 'eco-friendly, green, natural, sustainable, organic aesthetic', category: '디자인/커머셜' },
    ],
  },
  {
    name: '재질/3D',
    styles: [
      { id: 'clay-stopmotion', name: 'Clay/Stop Motion', nameKo: '클레이/스톱모션', prompt: 'clay animation style, stop motion, handmade, tactile texture', category: '재질/3D' },
      { id: 'voxel', name: 'Voxel Art', nameKo: '복셀 아트', prompt: 'voxel art style, 3D pixel art, isometric, colorful blocks', category: '재질/3D' },
      { id: 'pixel-art', name: 'Pixel Art', nameKo: '픽셀 아트', prompt: '16-bit pixel art, retro game, sprite style, limited palette', category: '재질/3D' },
      { id: 'lego', name: 'LEGO', nameKo: '레고', prompt: 'LEGO brick style, plastic toy, blocky, colorful, playful', category: '재질/3D' },
      { id: 'paper-art', name: 'Paper Art', nameKo: '페이퍼 아트', prompt: 'paper craft, paper cut art, layered, 3D paper, origami', category: '재질/3D' },
    ],
  },
];

export function getAllStyles(): VisualStyle[] {
  return STYLE_CATEGORIES.flatMap((c) => c.styles);
}

export interface ImageRequest {
  prompt: string;
  negativePrompt?: string;
  engine: ImageEngine;
  style?: VisualStyle;
  aspectRatio: AspectRatio;
  referenceImageUrl?: string;
  count: number;
}

export interface VideoRequest {
  prompt: string;
  engine: VideoEngine;
  style?: VisualStyle;
  aspectRatio: AspectRatio;
  duration: number;
  sourceImageUrl?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  engine: ImageEngine;
  style?: string;
  aspectRatio: AspectRatio;
  createdAt: number;
  cost: number;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  engine: VideoEngine;
  style?: string;
  aspectRatio: AspectRatio;
  duration: number;
  createdAt: number;
  cost: number;
}

export async function generateImage(
  req: ImageRequest,
  apiKeys: Record<string, string>
): Promise<GeneratedImage[]> {
  const engineConfig = IMAGE_ENGINES.find((e) => e.id === req.engine);
  if (!engineConfig) throw new Error('지원하지 않는 이미지 엔진입니다');

  const key = apiKeys[engineConfig.requiresKey];
  if (!key) throw new Error(`${engineConfig.label} API 키를 설정해주세요`);

  const fullPrompt = req.style
    ? `${req.prompt}, ${req.style.prompt}`
    : req.prompt;

  // Engine-specific API calls
  switch (req.engine) {
    case 'nanobanana':
      return generateNanoBanana(fullPrompt, req, key, engineConfig.costPerImage);
    case 'imagen':
      return generateImagen(fullPrompt, req, key, engineConfig.costPerImage);
    case 'grok':
      return generateGrokImage(fullPrompt, req, key, engineConfig.costPerImage);
    default:
      throw new Error(`${engineConfig.label} 엔진 연동이 필요합니다`);
  }
}

async function generateNanoBanana(
  prompt: string, req: ImageRequest, apiKey: string, cost: number
): Promise<GeneratedImage[]> {
  // Evolink NanoBanana API
  const res = await fetch('https://api.evolink.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'nanobanana-2',
      prompt,
      n: req.count,
      size: req.aspectRatio === '16:9' ? '1024x576' : req.aspectRatio === '9:16' ? '576x1024' : '1024x1024',
    }),
  });

  if (!res.ok) throw new Error(`NanoBanana API 오류: ${res.status}`);
  const data = await res.json();

  return (data.data || []).map((item: any) => ({
    id: crypto.randomUUID(),
    url: item.url,
    prompt,
    engine: 'nanobanana' as ImageEngine,
    style: req.style?.nameKo,
    aspectRatio: req.aspectRatio,
    createdAt: Date.now(),
    cost,
  }));
}

async function generateImagen(
  prompt: string, req: ImageRequest, apiKey: string, cost: number
): Promise<GeneratedImage[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.5-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: req.count,
          aspectRatio: req.aspectRatio.replace(':', ':'),
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Imagen API 오류: ${res.status}`);
  const data = await res.json();

  return (data.predictions || []).map((pred: any) => ({
    id: crypto.randomUUID(),
    url: `data:image/png;base64,${pred.bytesBase64Encoded}`,
    prompt,
    engine: 'imagen' as ImageEngine,
    style: req.style?.nameKo,
    aspectRatio: req.aspectRatio,
    createdAt: Date.now(),
    cost,
  }));
}

async function generateGrokImage(
  prompt: string, req: ImageRequest, apiKey: string, cost: number
): Promise<GeneratedImage[]> {
  const res = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-2-image',
      prompt,
      n: req.count,
    }),
  });

  if (!res.ok) throw new Error(`Grok Image API 오류: ${res.status}`);
  const data = await res.json();

  return (data.data || []).map((item: any) => ({
    id: crypto.randomUUID(),
    url: item.url,
    prompt,
    engine: 'grok' as ImageEngine,
    style: req.style?.nameKo,
    aspectRatio: req.aspectRatio,
    createdAt: Date.now(),
    cost,
  }));
}

export async function generateVideo(
  req: VideoRequest,
  apiKeys: Record<string, string>
): Promise<GeneratedVideo> {
  const engineConfig = VIDEO_ENGINES.find((e) => e.id === req.engine);
  if (!engineConfig) throw new Error('지원하지 않는 영상 엔진입니다');

  const key = apiKeys[engineConfig.requiresKey];
  if (!key) throw new Error(`${engineConfig.label} API 키를 설정해주세요`);

  // Placeholder - actual API integration needed
  throw new Error(`${engineConfig.label} 영상 생성 API 연동이 필요합니다`);
}

export const PAN_ZOOM_PRESETS = [
  { id: 'none', label: '없음', desc: '정지' },
  { id: 'zoom-in', label: '줌 인', desc: '천천히 확대' },
  { id: 'zoom-out', label: '줌 아웃', desc: '천천히 축소' },
  { id: 'pan-left', label: '팬 좌', desc: '왼쪽으로 이동' },
  { id: 'pan-right', label: '팬 우', desc: '오른쪽으로 이동' },
  { id: 'pan-up', label: '팬 상', desc: '위로 이동' },
  { id: 'pan-down', label: '팬 하', desc: '아래로 이동' },
  { id: 'ken-burns', label: '켄번즈', desc: '줌+팬 조합' },
];
