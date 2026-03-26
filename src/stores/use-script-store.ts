import { create } from 'zustand';
import type { AiModel, ScriptFormat, ScriptStructure, ScriptResult } from '../services/ai-api';

interface ScriptState {
  // Model
  model: AiModel;
  setModel: (m: AiModel) => void;

  // Result
  result: ScriptResult | null;
  setResult: (r: ScriptResult | null) => void;
  generating: boolean;
  setGenerating: (g: boolean) => void;
  streamText: string;
  setStreamText: (t: string) => void;

  // Legacy fields kept for compatibility
  topic: string;
  setTopic: (t: string) => void;
  format: ScriptFormat;
  setFormat: (f: ScriptFormat) => void;
  structure: ScriptStructure;
  setStructure: (s: ScriptStructure) => void;
  targetLength: number;
  setTargetLength: (l: number) => void;
  tone: string;
  setTone: (t: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (n: string) => void;

  // History
  history: ScriptResult[];
  addToHistory: (r: ScriptResult) => void;
  clearHistory: () => void;

  resetForm: () => void;
}

export const useScriptStore = create<ScriptState>((set) => ({
  model: 'gemini-3.1-pro',
  setModel: (m) => set({ model: m }),

  result: null,
  setResult: (r) => set({ result: r }),
  generating: false,
  setGenerating: (g) => set({ generating: g }),
  streamText: '',
  setStreamText: (t) => set({ streamText: t }),

  topic: '',
  setTopic: (t) => set({ topic: t }),
  format: 'long-form',
  setFormat: (f) => set({ format: f }),
  structure: 'narrative',
  setStructure: (s) => set({ structure: s }),
  targetLength: 10,
  setTargetLength: (l) => set({ targetLength: l }),
  tone: '',
  setTone: (t) => set({ tone: t }),
  additionalNotes: '',
  setAdditionalNotes: (n) => set({ additionalNotes: n }),

  history: [],
  addToHistory: (r) => set((state) => ({ history: [r, ...state.history].slice(0, 20) })),
  clearHistory: () => set({ history: [] }),

  resetForm: () => set({
    topic: '',
    format: 'long-form',
    structure: 'narrative',
    targetLength: 10,
    tone: '',
    additionalNotes: '',
    result: null,
    streamText: '',
  }),
}));
