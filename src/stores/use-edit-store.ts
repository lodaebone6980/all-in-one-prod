import { create } from 'zustand';

export interface EditScene {
  id: string;
  order: number;
  narration: string;
  visualDescription: string;
  imageUrl?: string;
  videoUrl?: string;
  duration: number;
  audioOffset: number;
  panZoom: string;
  effect: string;
  transition: string;
  subtitle: string;
  subtitleStyle: SubtitleStyle;
}

export interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  bgColor: string;
  position: 'top' | 'center' | 'bottom';
  bold: boolean;
  italic: boolean;
  outline: boolean;
}

export interface AudioTrack {
  id: string;
  name: string;
  type: 'narration' | 'bgm' | 'sfx';
  url?: string;
  volume: number;
  startTime: number;
  duration: number;
}

type SubTab = 'timeline' | 'effects' | 'subtitles' | 'transition' | 'edit-point';

interface EditState {
  subTab: SubTab;
  setSubTab: (t: SubTab) => void;

  scenes: EditScene[];
  setScenes: (s: EditScene[]) => void;
  addScene: (s: Omit<EditScene, 'id' | 'order'>) => void;
  updateScene: (id: string, data: Partial<EditScene>) => void;
  removeScene: (id: string) => void;
  reorderScene: (fromIdx: number, toIdx: number) => void;
  splitScene: (id: string, atTime: number) => void;

  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;

  audioTracks: AudioTrack[];
  addAudioTrack: (t: Omit<AudioTrack, 'id'>) => void;
  updateAudioTrack: (id: string, data: Partial<AudioTrack>) => void;
  removeAudioTrack: (id: string) => void;

  globalSubtitleStyle: SubtitleStyle;
  setGlobalSubtitleStyle: (s: Partial<SubtitleStyle>) => void;

  playing: boolean;
  setPlaying: (p: boolean) => void;
  currentTime: number;
  setCurrentTime: (t: number) => void;

  exportFormat: 'mp4' | 'premiere' | 'davinci' | 'srt';
  setExportFormat: (f: 'mp4' | 'premiere' | 'davinci' | 'srt') => void;
}

const defaultSubtitleStyle: SubtitleStyle = {
  fontSize: 24,
  fontFamily: 'Pretendard',
  color: '#ffffff',
  bgColor: 'rgba(0,0,0,0.6)',
  position: 'bottom',
  bold: false,
  italic: false,
  outline: true,
};

export const useEditStore = create<EditState>((set, get) => ({
  subTab: 'timeline',
  setSubTab: (t) => set({ subTab: t }),

  scenes: [],
  setScenes: (s) => set({ scenes: s }),
  addScene: (s) =>
    set((state) => ({
      scenes: [...state.scenes, { ...s, id: crypto.randomUUID(), order: state.scenes.length }],
    })),
  updateScene: (id, data) =>
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  removeScene: (id) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })),
    })),
  reorderScene: (fromIdx, toIdx) =>
    set((state) => {
      const scenes = [...state.scenes];
      const [moved] = scenes.splice(fromIdx, 1);
      scenes.splice(toIdx, 0, moved);
      return { scenes: scenes.map((s, i) => ({ ...s, order: i })) };
    }),
  splitScene: (id, atTime) =>
    set((state) => {
      const idx = state.scenes.findIndex((s) => s.id === id);
      if (idx < 0) return state;
      const scene = state.scenes[idx];
      if (atTime <= 0 || atTime >= scene.duration) return state;

      const scene1 = { ...scene, duration: atTime };
      const scene2 = {
        ...scene,
        id: crypto.randomUUID(),
        order: scene.order + 1,
        duration: scene.duration - atTime,
        narration: '',
      };

      const newScenes = [...state.scenes];
      newScenes.splice(idx, 1, scene1, scene2);
      return { scenes: newScenes.map((s, i) => ({ ...s, order: i })) };
    }),

  selectedSceneId: null,
  setSelectedSceneId: (id) => set({ selectedSceneId: id }),

  audioTracks: [],
  addAudioTrack: (t) =>
    set((state) => ({
      audioTracks: [...state.audioTracks, { ...t, id: crypto.randomUUID() }],
    })),
  updateAudioTrack: (id, data) =>
    set((state) => ({
      audioTracks: state.audioTracks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeAudioTrack: (id) =>
    set((state) => ({
      audioTracks: state.audioTracks.filter((t) => t.id !== id),
    })),

  globalSubtitleStyle: defaultSubtitleStyle,
  setGlobalSubtitleStyle: (s) =>
    set((state) => ({
      globalSubtitleStyle: { ...state.globalSubtitleStyle, ...s },
    })),

  playing: false,
  setPlaying: (p) => set({ playing: p }),
  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),

  exportFormat: 'mp4',
  setExportFormat: (f) => set({ exportFormat: f }),
}));
