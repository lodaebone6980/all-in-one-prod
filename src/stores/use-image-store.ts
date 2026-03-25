import { create } from 'zustand';
import type { ImageModel, VideoEngine, AspectRatio, VisualStyle } from '../services/image-api';

interface GeneratedImage {
  id: string; url: string; prompt: string; engine: string; style?: string;
  aspectRatio: AspectRatio; createdAt: number; cost: number;
}
interface GeneratedVideo {
  id: string; url: string; prompt: string; engine: string; style?: string;
  aspectRatio: AspectRatio; duration: number; createdAt: number; cost: number;
}

type SubTab = 'image' | 'video' | 'batch' | 'gallery';

interface ImageState {
  subTab: SubTab;
  setSubTab: (t: SubTab) => void;

  // Image generation
  imagePrompt: string;
  setImagePrompt: (p: string) => void;
  imageEngine: ImageModel;
  setImageModel: (e: ImageModel) => void;
  imageStyle: VisualStyle | null;
  setImageStyle: (s: VisualStyle | null) => void;
  imageAspect: AspectRatio;
  setImageAspect: (a: AspectRatio) => void;
  imageCount: number;
  setImageCount: (n: number) => void;
  negativePrompt: string;
  setNegativePrompt: (p: string) => void;

  // Video generation
  videoPrompt: string;
  setVideoPrompt: (p: string) => void;
  videoEngine: VideoEngine;
  setVideoEngine: (e: VideoEngine) => void;
  videoStyle: VisualStyle | null;
  setVideoStyle: (s: VisualStyle | null) => void;
  videoAspect: AspectRatio;
  setVideoAspect: (a: AspectRatio) => void;
  videoDuration: number;
  setVideoDuration: (d: number) => void;

  // Generated results
  images: GeneratedImage[];
  addImages: (imgs: GeneratedImage[]) => void;
  removeImage: (id: string) => void;
  videos: GeneratedVideo[];
  addVideo: (v: GeneratedVideo) => void;

  // Loading
  generating: boolean;
  setGenerating: (g: boolean) => void;

  // Style browser
  styleSearch: string;
  setStyleSearch: (s: string) => void;
  styleCategory: string;
  setStyleCategory: (c: string) => void;
}

export const useImageStore = create<ImageState>((set) => ({
  subTab: 'image',
  setSubTab: (t) => set({ subTab: t }),

  imagePrompt: '',
  setImagePrompt: (p) => set({ imagePrompt: p }),
  imageEngine: 'model_pro_cost',
  setImageModel: (e) => set({ imageEngine: e }),
  imageStyle: null,
  setImageStyle: (s) => set({ imageStyle: s }),
  imageAspect: '16:9',
  setImageAspect: (a) => set({ imageAspect: a }),
  imageCount: 1,
  setImageCount: (n) => set({ imageCount: n }),
  negativePrompt: '',
  setNegativePrompt: (p) => set({ negativePrompt: p }),

  videoPrompt: '',
  setVideoPrompt: (p) => set({ videoPrompt: p }),
  videoEngine: 'veo3',
  setVideoEngine: (e) => set({ videoEngine: e }),
  videoStyle: null,
  setVideoStyle: (s) => set({ videoStyle: s }),
  videoAspect: '16:9',
  setVideoAspect: (a) => set({ videoAspect: a }),
  videoDuration: 4,
  setVideoDuration: (d) => set({ videoDuration: d }),

  images: [],
  addImages: (imgs) => set((state) => ({ images: [...imgs, ...state.images] })),
  removeImage: (id) => set((state) => ({ images: state.images.filter((i) => i.id !== id) })),
  videos: [],
  addVideo: (v) => set((state) => ({ videos: [v, ...state.videos] })),

  generating: false,
  setGenerating: (g) => set({ generating: g }),

  styleSearch: '',
  setStyleSearch: (s) => set({ styleSearch: s }),
  styleCategory: '',
  setStyleCategory: (c) => set({ styleCategory: c }),
}));
