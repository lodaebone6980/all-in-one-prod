import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CostState {
  exchangeRate: number;
  costs: {
    image: number;
    video: number;
    analysis: number;
    tts: number;
    music: number;
  };
  counts: {
    image: number;
    video: number;
    analysis: number;
    tts: number;
    music: number;
  };
  addCost: (category: keyof CostState['costs'], usd: number) => void;
  totalUsd: () => number;
  totalKrw: () => number;
  totalCalls: () => number;
  reset: () => void;
}

// Pricing constants matching original v4.5 Ke object
export const PRICING = {
  EXCHANGE_RATE: 1450,
  IMAGE_GENERATION: 0.0806,        // NanoBanana 2 per image (~₩87/장)
  IMAGE_GENERATION_FALLBACK: 0.05,
  IMAGE_PREVIEW: 0.02,
  IMAGE_FLASH: 0.02,
  VIDEO_VEO: 0.169,
  VIDEO_GROK_6S: 0.1,
  VIDEO_GROK_10S: 0.15,
  VIDEO_SEEDANCE_4S: 0.1,
  VIDEO_SEEDANCE_8S: 0.2,
  VIDEO_SEEDANCE_12S: 0.3,
  VIDEO_SEEDANCE_PER_SEC: 0.025,
  VIDEO_WAN_V2V_720P_PER_SEC: 0.07,
  VIDEO_WAN_V2V_1080P_PER_SEC: 0.105,
  MUSIC_SUNO_PER_TRACK: 0.06,
  MUSIC_SUNO_EXTEND: 0.06,
  TTS_ELEVENLABS_TURBO_PER_1K: 0.03,
  TTS_ELEVENLABS_MULTI_PER_1K: 0.06,
  TTS_TYPECAST_V30_PER_1K: 0.15,
  TTS_TYPECAST_V21_PER_1K: 0.075,
  STT_SCRIBE_PER_CALL: 0.05,
  GEMINI_FLASH_INPUT_PER_1M: 0.5,
  GEMINI_FLASH_OUTPUT_PER_1M: 3,
  GEMINI_PRO_INPUT_PER_1M: 1.6,
  GEMINI_PRO_OUTPUT_PER_1M: 9.6,
  CLAUDE_SONNET_INPUT_PER_1M: 2.55,
  CLAUDE_SONNET_OUTPUT_PER_1M: 12.75,
  CLAUDE_OPUS_INPUT_PER_1M: 4.13,
  CLAUDE_OPUS_OUTPUT_PER_1M: 21.25,
  ANALYSIS_INITIAL: 0.005,
  ANALYSIS_IMAGE: 0.005,
};

const defaultCosts = { image: 0, video: 0, analysis: 0, tts: 0, music: 0 };
const defaultCounts = { image: 0, video: 0, analysis: 0, tts: 0, music: 0 };

export const useCostStore = create<CostState>()(
  persist(
    (set, get) => ({
      exchangeRate: 1450,
      costs: { ...defaultCosts },
      counts: { ...defaultCounts },
      addCost: (category, usd) =>
        set((state) => ({
          costs: { ...state.costs, [category]: state.costs[category] + usd },
          counts: { ...state.counts, [category]: state.counts[category] + 1 },
        })),
      totalUsd: () => {
        const c = get().costs;
        return c.image + c.video + c.analysis + c.tts + c.music;
      },
      totalKrw: () => get().totalUsd() * get().exchangeRate,
      totalCalls: () => {
        const c = get().counts;
        return c.image + c.video + c.analysis + c.tts + c.music;
      },
      reset: () => set({ costs: { ...defaultCosts }, counts: { ...defaultCounts } }),
      fetchExchangeRate: async () => {
        try {
          const res = await fetch('https://open.er-api.com/v4/latest/USD');
          if (res.ok) { const d = await res.json(); if (d.rates?.KRW) set({ exchangeRate: d.rates.KRW }); return; }
        } catch {}
        try {
          const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW');
          if (res.ok) { const d = await res.json(); if (d.rates?.KRW) set({ exchangeRate: d.rates.KRW }); }
        } catch {}
      },
    }),
    { name: 'aio-cost-store' }
  )
);
