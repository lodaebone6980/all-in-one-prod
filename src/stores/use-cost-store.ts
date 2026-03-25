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
    }),
    { name: 'aio-cost-store' }
  )
);
