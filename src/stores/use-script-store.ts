import { create } from 'zustand';
import type { AiModel, ScriptFormat, ScriptStructure, ScriptResult } from '../services/ai-api';

interface ScriptState {
  // Wizard step
  step: number;
  setStep: (s: number) => void;

  // Request form
  topic: string;
  setTopic: (t: string) => void;
  model: AiModel;
  setModel: (m: AiModel) => void;
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

  // Result
  result: ScriptResult | null;
  setResult: (r: ScriptResult | null) => void;
  generating: boolean;
  setGenerating: (g: boolean) => void;
  streamText: string;
  setStreamText: (t: string) => void;

  // History
  history: ScriptResult[];
  addToHistory: (r: ScriptResult) => void;
  clearHistory: () => void;

  // Reset form
  resetForm: () => void;
}

export const useScriptStore = create<ScriptState>((set) => ({
  step: 1,
  setStep: (s) => set({ step: s }),

  topic: '',
  setTopic: (t) => set({ topic: t }),
  model: 'claude-sonnet',
  setModel: (m) => set({ model: m }),
  format: 'long',
  setFormat: (f) => set({ format: f }),
  structure: 'narrative',
  setStructure: (s) => set({ structure: s }),
  targetLength: 10,
  setTargetLength: (l) => set({ targetLength: l }),
  tone: '',
  setTone: (t) => set({ tone: t }),
  additionalNotes: '',
  setAdditionalNotes: (n) => set({ additionalNotes: n }),

  result: null,
  setResult: (r) => set({ result: r }),
  generating: false,
  setGenerating: (g) => set({ generating: g }),
  streamText: '',
  setStreamText: (t) => set({ streamText: t }),

  history: [],
  addToHistory: (r) => set((state) => ({ history: [r, ...state.history].slice(0, 20) })),
  clearHistory: () => set({ history: [] }),

  resetForm: () =>
    set({
      step: 1,
      topic: '',
      format: 'long',
      structure: 'narrative',
      targetLength: 10,
      tone: '',
      additionalNotes: '',
      result: null,
      streamText: '',
    }),
}));
