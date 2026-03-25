// Image model enum matching original
export type ImageModel = 'model_std_flash' | 'model_pro_cost' | 'model_pro_speed' | 'model_google_imagen' | 'model_google_whisk';
export type VideoEngine = 'google-veo-3.1' | 'veo-3.1-evolink' | 'veo-3.1-quality' | 'grok' | 'seedance-1.5-pro' | 'wan-2.6-v2v';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export const IMAGE_MODELS = [
  { id: 'model_google_imagen' as ImageModel, label: 'Google Imagen 3.5 (무료 · 쿠키 필요 · 캐릭터/화풍 미적용)', cost: 0, requiresKey: 'gemini' },
  { id: 'model_google_whisk' as ImageModel, label: 'Google Whisk (무료 · 쿠키 필요 · 레퍼런스 리믹싱)', cost: 0, requiresKey: 'gemini' },
  { id: 'model_pro_cost' as ImageModel, label: 'NanoBanana 2 (₩87/장 · 최고 품질)', cost: 0.0806, requiresKey: 'kieAi' },
];

export const VIDEO_ENGINES = [
  { id: 'veo-3.1-evolink' as VideoEngine, label: 'Veo 3.1 Fast (Evolink)', cost: 0.169, maxDuration: 8, res: '1080p', requiresKey: 'evolink' },
  { id: 'veo-3.1-quality' as VideoEngine, label: 'Veo 3.1 Quality', cost: 0.25, maxDuration: 8, res: '1080p', requiresKey: 'evolink' },
  { id: 'grok' as VideoEngine, label: 'Grok Video (6s/10s)', cost: 0.1, maxDuration: 10, res: '720p', requiresKey: 'kieAi' },
  { id: 'seedance-1.5-pro' as VideoEngine, label: 'Seedance 1.5 Pro', cost: 0.2, maxDuration: 12, res: '720p', requiresKey: 'kieAi' },
  { id: 'wan-2.6-v2v' as VideoEngine, label: 'Wan 2.6 V2V', cost: 0.07, maxDuration: 10, res: '720p', requiresKey: 'kieAi' },
];

export const ASPECT_RATIOS = [
  { id: '16:9' as AspectRatio, label: '16:9 (가로형/유튜브)' },
  { id: '9:16' as AspectRatio, label: '9:16 (세로형/쇼츠)' },
  { id: '1:1' as AspectRatio, label: '1:1 (정사각형/인스타)' },
];

// Negative prompt logic matching original $p function
export function getNegativePrompt(stylePrompt: string): string {
  const p = stylePrompt.toLowerCase();
  if (/anime|illustration|webtoon|comic|manga|cartoon|2d|chibi|ghibli|pixar|disney/.test(p)) {
    return '(photorealistic: -2.0), (3d render: -2.0), (realistic texture: -2.0), (photo: -2.0), (unreal engine: -2.0), (photograph), (realistic), (8K resolution: -2.0), (volumetric lighting: -2.0), (cinematic: -2.0), (professional photography: -2.0)';
  }
  if (/realistic|photo|cinematic|film|movie|documentary|street|macro|drone|fashion/.test(p)) {
    return '(anime: -2.0), (cartoon: -2.0), (2d: -2.0), (drawing: -2.0), (sketch: -2.0), (illustration: -2.0), (flattened)';
  }
  if (/3d|pixar|disney|clay|stop.?motion|voxel|lego/.test(p)) {
    return '(2d: -2.0), (sketch: -2.0), (photorealistic: -2.0), (anime: -2.0), (drawing: -2.0)';
  }
  return '';
}

// Video prompt constants matching original
export const VIDEO_PROMPT_CONSTANTS = {
  sfxOnly: '[CRITICAL: Sound Effects Only] [ABSOLUTELY No Background Music] [ABSOLUTELY No Speech] [ABSOLUTELY No Narration] [No Voice] [No Dialogue] [Mute all human voice] [Silent film with SFX only]',
  stylePreserve: '[CRITICAL: Preserve exact art style of input image] [Maintain same color palette] [Keep same rendering technique] [No style change] [Consistent visual identity]',
  characterConsistency: '[Maintain character consistency throughout the video] [Preserve exact facial features, hairstyle, and body proportions from the input image] [Keep clothing details, colors, and accessories identical] [Consistent lighting and skin tone] [Keep all subjects inside the camera frame]',
};

// Visual styles - 7 categories, 100+ styles matching original ZH array
export interface VisualStyle {
  id: string;
  name: string;
  nameKo: string;
  prompt: string;
  category: string;
}

export interface StyleCategory {
  name: string;
  styles: VisualStyle[];
}

export const STYLE_CATEGORIES: StyleCategory[] = [
  {
    name: '영화 & 드라마',
    styles: [
      { id: 'cinematic', name: 'Cinematic', nameKo: '시네마틱', prompt: 'cinematic photography, dramatic lighting, shallow depth of field, film grain, anamorphic lens', category: '영화 & 드라마' },
      { id: 'film-noir', name: 'Film Noir', nameKo: '필름 누아르', prompt: 'film noir style, high contrast black and white, dramatic shadows, venetian blinds lighting, detective mood', category: '영화 & 드라마' },
      { id: 'historical-drama', name: 'Historical Drama', nameKo: '시대극', prompt: 'historical drama, period costume, grand sets, natural lighting, oil painting quality', category: '영화 & 드라마' },
      { id: 'vintage-film', name: 'Vintage Film', nameKo: '빈티지 필름', prompt: 'vintage film photography, Kodak Portra 400, warm tones, natural grain, retro color grading', category: '영화 & 드라마' },
      { id: 'documentary', name: 'Documentary', nameKo: '다큐멘터리', prompt: 'documentary style, raw authentic footage, natural lighting, handheld camera feel', category: '영화 & 드라마' },
      { id: 'western', name: 'Western', nameKo: '서부극', prompt: 'western movie style, dusty desert, golden hour, wide angle, Sergio Leone inspired', category: '영화 & 드라마' },
      { id: 'spy', name: 'Spy/Espionage', nameKo: '스파이/첩보', prompt: 'spy thriller, sleek modern, neon city lights, surveillance aesthetic, cold blue tones', category: '영화 & 드라마' },
      { id: 'k-drama', name: 'K-Drama', nameKo: 'K-드라마', prompt: 'Korean drama aesthetic, soft focus, romantic lighting, cinematic color grading, beautiful bokeh', category: '영화 & 드라마' },
      { id: 'scifi', name: 'Sci-Fi', nameKo: 'SF', prompt: 'science fiction, futuristic, neon, cyberpunk, advanced technology, holographic', category: '영화 & 드라마' },
      { id: 'horror', name: 'Horror', nameKo: '호러', prompt: 'horror movie style, dark atmosphere, eerie, unsettling, moody, low key lighting', category: '영화 & 드라마' },
      { id: 'wes-anderson', name: 'Wes Anderson', nameKo: '웨스 앤더슨', prompt: 'Wes Anderson style, symmetrical composition, pastel colors, quirky, whimsical production design', category: '영화 & 드라마' },
      { id: 'wong-karwai', name: 'Wong Kar-wai', nameKo: '왕가위', prompt: 'Wong Kar-wai style, neon lights, moody, saturated colors, blurry motion, expressive color', category: '영화 & 드라마' },
      { id: 'musical', name: 'Musical', nameKo: '뮤지컬', prompt: 'musical movie style, vibrant colors, stage lighting, dynamic performance, theatrical', category: '영화 & 드라마' },
      { id: 'zombie', name: 'Zombie/Apocalypse', nameKo: '좀비/묵시록', prompt: 'post-apocalyptic, zombie outbreak, desaturated, gritty, survival horror atmosphere', category: '영화 & 드라마' },
      { id: 'nouvelle-vague', name: 'Nouvelle Vague', nameKo: '누벨바그', prompt: 'French New Wave cinema, grainy black and white, jump cuts aesthetic, existential mood', category: '영화 & 드라마' },
    ],
  },
  {
    name: 'CF & 커머셜',
    styles: [
      { id: 'k-ad', name: 'K-Ad', nameKo: 'K-광고', prompt: 'Korean advertisement style, clean, modern, professional, product focused, studio lighting', category: 'CF & 커머셜' },
      { id: 'luxury-fashion', name: 'Luxury Fashion', nameKo: '럭셔리 패션', prompt: 'luxury fashion editorial, high-end, elegant, minimalist, couture, studio beauty lighting', category: 'CF & 커머셜' },
      { id: 'food-sizzle', name: 'Food Sizzle', nameKo: '푸드 시즐', prompt: 'food photography, appetizing, steam, perfect lighting, delicious, macro detail', category: 'CF & 커머셜' },
      { id: 'tech-minimal', name: 'Tech Minimalism', nameKo: '테크 미니멀', prompt: 'tech product photography, minimalist, clean white background, modern design, premium feel', category: 'CF & 커머셜' },
      { id: 'beauty', name: 'Beauty/Cosmetic', nameKo: '뷰티/코스메틱', prompt: 'beauty cosmetic photography, soft glowing skin, dewy, luxury packaging, pastel backdrop', category: 'CF & 커머셜' },
      { id: 'eco-green', name: 'Eco/Green', nameKo: '에코/그린', prompt: 'eco-friendly, green, natural, sustainable, organic aesthetic, earth tones', category: 'CF & 커머셜' },
      { id: 'kids', name: 'Kids/Toys', nameKo: '키즈/완구', prompt: 'kids toy photography, bright primary colors, playful, fun, energetic, clean background', category: 'CF & 커머셜' },
      { id: 'sports', name: 'Sports/Dynamic', nameKo: '스포츠/다이내믹', prompt: 'dynamic sports photography, action freeze, motion blur, intense, powerful, dramatic lighting', category: 'CF & 커머셜' },
      { id: 'real-estate', name: 'Real Estate', nameKo: '부동산/인테리어', prompt: 'real estate photography, wide angle interior, bright natural light, modern architecture', category: 'CF & 커머셜' },
    ],
  },
  {
    name: '애니메이션 & 3D',
    styles: [
      { id: 'disney-pixar', name: 'Disney/Pixar 3D', nameKo: '디즈니/픽사 3D', prompt: 'Disney Pixar 3D animation style, CGI, vibrant, expressive characters, smooth render', category: '애니메이션 & 3D' },
      { id: 'retro-anime', name: '90s Retro Anime', nameKo: '90년대 레트로', prompt: '90s retro anime style, cel animation, VHS aesthetic, nostalgic, warm color palette', category: '애니메이션 & 3D' },
      { id: 'ghibli', name: 'Ghibli', nameKo: '지브리', prompt: 'Studio Ghibli style, soft watercolor, pastoral, warm lighting, anime, detailed background', category: '애니메이션 & 3D' },
      { id: 'clay-stopmotion', name: 'Clay/Stop Motion', nameKo: '클레이/스톱모션', prompt: 'clay animation style, stop motion, handmade, tactile texture, visible fingerprints', category: '애니메이션 & 3D' },
      { id: 'arcane', name: 'Arcane', nameKo: '아케인', prompt: 'Arcane animation style, painterly, dramatic lighting, stylized, oil painting texture', category: '애니메이션 & 3D' },
      { id: 'low-poly', name: 'Low Poly', nameKo: '로우 폴리', prompt: 'low poly 3D art, geometric facets, flat shading, colorful, minimal polygons', category: '애니메이션 & 3D' },
      { id: 'paper-art', name: 'Paper Art', nameKo: '페이퍼 아트', prompt: 'paper craft, paper cut art, layered paper, 3D paper sculpture, origami', category: '애니메이션 & 3D' },
      { id: 'voxel', name: 'Voxel Art', nameKo: '복셀 아트', prompt: 'voxel art style, 3D pixel art, isometric view, colorful blocks, MagicaVoxel', category: '애니메이션 & 3D' },
      { id: 'spiderverse', name: 'Spider-Verse', nameKo: '스파이더버스', prompt: 'Into the Spider-Verse style, comic book halftone dots, bold outlines, dynamic angles', category: '애니메이션 & 3D' },
      { id: 'edgerunners', name: 'Edgerunners', nameKo: '엣지러너', prompt: 'Cyberpunk Edgerunners anime style, neon colors, high contrast, dynamic action poses', category: '애니메이션 & 3D' },
      { id: 'chinese-3d', name: 'Chinese 3D Anime', nameKo: '중국식 3D', prompt: 'Chinese 3D animation style, martial arts aesthetic, silk fabric, jade colors, dynamic poses', category: '애니메이션 & 3D' },
      { id: 'miniature', name: 'Miniature/Tilt-shift', nameKo: '미니어처/틸트시프트', prompt: 'miniature tilt-shift photography, toy-like, shallow depth of field, bird eye view', category: '애니메이션 & 3D' },
      { id: 'isekai', name: 'Isekai Fantasy', nameKo: '이세계 판타지', prompt: 'isekai fantasy anime, magical world, RPG game-like, vibrant colors, detailed fantasy environment', category: '애니메이션 & 3D' },
    ],
  },
  {
    name: '웹툰 & 코믹',
    styles: [
      { id: 'k-webtoon', name: 'K-Webtoon', nameKo: 'K-웹툰', prompt: 'Korean webtoon style, manhwa, clean lineart, digital coloring, vibrant colors, vertical scroll format', category: '웹툰 & 코믹' },
      { id: 'us-comics', name: 'US Comics', nameKo: '미국 코믹스', prompt: 'American comic book style, bold inking, Ben-Day dots, dynamic action, superhero aesthetic', category: '웹툰 & 코믹' },
      { id: 'bw-manga', name: 'B&W Manga', nameKo: '흑백 만화', prompt: 'black and white manga, screentone shading, dynamic paneling, Japanese comic style', category: '웹툰 & 코믹' },
      { id: 'pop-art', name: 'Pop Art', nameKo: '팝 아트', prompt: 'pop art style, bold colors, Ben-Day dots, Andy Warhol and Roy Lichtenstein inspired', category: '웹툰 & 코믹' },
      { id: 'chibi', name: 'Chibi/SD', nameKo: '치비/SD', prompt: 'chibi super deformed style, cute, big head, small body, kawaii, simple clean lines', category: '웹툰 & 코믹' },
      { id: 'shoujo', name: 'Shoujo Manga', nameKo: '소녀 만화', prompt: 'shoujo manga style, sparkling eyes, flower backgrounds, soft pastel tones, romantic', category: '웹툰 & 코믹' },
      { id: 'bl-manga', name: 'BL Manga', nameKo: 'BL 만화', prompt: 'BL manga style, bishonen characters, elegant lineart, dramatic expressions, soft shading', category: '웹툰 & 코믹' },
      { id: 'classic-korean', name: 'Classic Korean Manga', nameKo: '고전 한국 만화', prompt: 'classic Korean manhwa style, 80s-90s aesthetic, hand-drawn, nostalgic ink work', category: '웹툰 & 코믹' },
    ],
  },
  {
    name: '스케치 & 스토리보드',
    styles: [
      { id: 'pencil-sketch', name: 'Pencil Sketch', nameKo: '연필 스케치', prompt: 'pencil sketch drawing, graphite, detailed shading, cross-hatching, paper texture', category: '스케치 & 스토리보드' },
      { id: 'marker', name: 'Marker Rendering', nameKo: '마커 렌더링', prompt: 'marker rendering, industrial design sketch, Copic markers, bold strokes, design concept', category: '스케치 & 스토리보드' },
      { id: 'ink-pen', name: 'Ink Pen', nameKo: '잉크 펜', prompt: 'ink pen drawing, crosshatching, detailed linework, monochrome, fine nib', category: '스케치 & 스토리보드' },
      { id: 'blueprint', name: 'Blueprint', nameKo: '블루프린트', prompt: 'blueprint technical drawing, white lines on blue background, schematic, engineering', category: '스케치 & 스토리보드' },
      { id: 'storyboard', name: 'Storyboard', nameKo: '스토리보드', prompt: 'film storyboard thumbnail, quick sketch, camera angles noted, sequential art, grayscale', category: '스케치 & 스토리보드' },
      { id: 'chalkboard', name: 'Chalkboard', nameKo: '칠판', prompt: 'chalkboard drawing, white chalk on dark green board, educational illustration, hand-drawn', category: '스케치 & 스토리보드' },
    ],
  },
  {
    name: '아트 & 컨셉',
    styles: [
      { id: 'oil-impasto', name: 'Oil/Impasto', nameKo: '유화/임파스토', prompt: 'oil painting, thick impasto brushstrokes, rich texture, classical fine art, gallery quality', category: '아트 & 컨셉' },
      { id: 'watercolor', name: 'Watercolor', nameKo: '수채화', prompt: 'watercolor painting, soft washes, delicate, fluid colors, wet-on-wet technique, paper texture', category: '아트 & 컨셉' },
      { id: 'pixel-art', name: 'Pixel Art', nameKo: '픽셀 아트', prompt: '16-bit pixel art, retro game sprite style, limited color palette, clean pixels', category: '아트 & 컨셉' },
      { id: 'graffiti', name: 'Graffiti', nameKo: '그래피티', prompt: 'graffiti street art, spray paint, urban wall, bold colors, wildstyle lettering', category: '아트 & 컨셉' },
      { id: 'geometric', name: 'Geometric', nameKo: '기하학', prompt: 'geometric abstract art, clean shapes, mathematical patterns, vibrant color blocks', category: '아트 & 컨셉' },
      { id: 'synthwave', name: '80s Synthwave', nameKo: '80년대 신스웨이브', prompt: '80s synthwave retrowave, neon grid, sunset gradient, chrome, VHS scanlines', category: '아트 & 컨셉' },
      { id: 'art-deco', name: 'Art Deco', nameKo: '아르데코', prompt: 'Art Deco style, geometric ornament, gold and black, luxury, 1920s Gatsby era', category: '아트 & 컨셉' },
      { id: 'surrealism', name: 'Surrealism', nameKo: '초현실주의', prompt: 'surrealist art, dreamlike, impossible scenes, Dali and Magritte inspired, melting forms', category: '아트 & 컨셉' },
      { id: 'stained-glass', name: 'Stained Glass', nameKo: '스테인드글라스', prompt: 'stained glass window art, lead came lines, backlit translucent colors, gothic cathedral', category: '아트 & 컨셉' },
      { id: 'ukiyoe', name: 'Ukiyo-e', nameKo: '우키요에', prompt: 'ukiyo-e Japanese woodblock print style, flat colors, bold outlines, Hokusai wave inspired', category: '아트 & 컨셉' },
      { id: 'art-nouveau', name: 'Art Nouveau', nameKo: '아르누보', prompt: 'Art Nouveau style, organic flowing lines, floral motifs, ornamental, Mucha inspired', category: '아트 & 컨셉' },
      { id: 'botanical', name: 'Botanical', nameKo: '보타니컬', prompt: 'botanical illustration, detailed scientific accuracy, elegant, naturalist, vintage plate', category: '아트 & 컨셉' },
      { id: 'psychedelic', name: 'Psychedelic', nameKo: '사이키델릭', prompt: 'psychedelic art, trippy visuals, vibrant swirling colors, fractal patterns, 1960s concert poster', category: '아트 & 컨셉' },
      { id: 'mspaint', name: 'MS Paint', nameKo: 'MS 페인트', prompt: 'MS Paint art, crude digital drawing, pixel brush, limited tools, nostalgic internet art', category: '아트 & 컨셉' },
    ],
  },
  {
    name: '포토그래피',
    styles: [
      { id: 'drone-aerial', name: 'Drone Aerial', nameKo: '드론 항공', prompt: 'aerial drone photography, birds eye view, sweeping landscape, DJI cinematic', category: '포토그래피' },
      { id: 'street-snap', name: 'Street Snap', nameKo: '스트릿 스냅', prompt: 'street photography, candid, urban, high contrast, documentary feel, 35mm', category: '포토그래피' },
      { id: 'fashion-editorial', name: 'Fashion Editorial', nameKo: '패션 에디토리얼', prompt: 'fashion editorial photography, Vogue style, dramatic pose, studio lighting, high fashion', category: '포토그래피' },
      { id: 'macro', name: 'Macro', nameKo: '매크로', prompt: 'macro photography, extreme close-up, shallow DOF, detailed texture, water droplets', category: '포토그래피' },
      { id: 'long-exposure', name: 'Long Exposure', nameKo: '장노출', prompt: 'long exposure photography, light trails, smooth water, star trails, motion blur', category: '포토그래피' },
      { id: 'film-camera', name: 'Film Camera', nameKo: '필름 카메라', prompt: 'analog film photography, Kodak Portra 400, natural grain, warm tones, vintage', category: '포토그래피' },
    ],
  },
];

export function getAllStyles(): VisualStyle[] {
  return STYLE_CATEGORIES.flatMap((c) => c.styles);
}

// API call implementations matching original
export async function generateImageNanoBanana(
  prompt: string, aspectRatio: AspectRatio, kieKey: string, imageInput?: string[]
) {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kieKey}` },
    body: JSON.stringify({
      model: 'nano-banana-2',
      input: { prompt, image_input: imageInput || [], aspect_ratio: aspectRatio, resolution: '2K', output_format: 'jpg', google_search: true },
    }),
  });
  if (!res.ok) throw new Error(`NanoBanana API 오류: ${res.status}`);
  return res.json();
}

export async function generateVideoVeo(
  prompt: string, aspectRatio: AspectRatio, evolinkKey: string, imageUrls?: string[]
) {
  const res = await fetch('https://api.evolink.ai/v1/videos/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${evolinkKey}` },
    body: JSON.stringify({
      model: 'veo-3.1-fast-generate-preview',
      prompt, generation_type: 'FIRST&LAST', aspect_ratio: aspectRatio === '1:1' ? '16:9' : aspectRatio,
      duration: 8, quality: '1080p', generate_audio: true, n: 1,
      image_urls: imageUrls || [],
    }),
  });
  if (!res.ok) throw new Error(`Veo API 오류: ${res.status}`);
  return res.json();
}

export async function generateVideoSeedance(
  prompt: string, imageUrl: string, kieKey: string, duration = '8'
) {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kieKey}` },
    body: JSON.stringify({
      model: 'bytedance/seedance-1.5-pro',
      input: { prompt, input_urls: [imageUrl], aspect_ratio: '16:9', resolution: '720p', duration, fixed_lens: false, generate_audio: true },
    }),
  });
  if (!res.ok) throw new Error(`Seedance API 오류: ${res.status}`);
  return res.json();
}

export async function generateVideoGrok(
  prompt: string, imageUrl: string, kieKey: string, duration = '6'
) {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kieKey}` },
    body: JSON.stringify({
      model: 'grok-imagine/image-to-video',
      input: { image_urls: [imageUrl], prompt, mode: 'normal', duration, resolution: '720p' },
    }),
  });
  if (!res.ok) throw new Error(`Grok Video API 오류: ${res.status}`);
  return res.json();
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
