import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { YouTubeChannel, YouTubeVideo, KeywordSuggestion } from '../services/youtube-api';

export interface ChannelPreset {
  id: string;
  name: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  addedAt: number;
}

type SubTab = 'channel-search' | 'video-analysis' | 'keyword-research' | 'channel-room';

interface ChannelState {
  subTab: SubTab;
  setSubTab: (tab: SubTab) => void;

  // Channel search
  channelQuery: string;
  setChannelQuery: (q: string) => void;
  channels: YouTubeChannel[];
  setChannels: (ch: YouTubeChannel[]) => void;
  selectedChannel: YouTubeChannel | null;
  setSelectedChannel: (ch: YouTubeChannel | null) => void;
  channelVideos: YouTubeVideo[];
  setChannelVideos: (v: YouTubeVideo[]) => void;

  // Video analysis
  videoQuery: string;
  setVideoQuery: (q: string) => void;
  videos: YouTubeVideo[];
  setVideos: (v: YouTubeVideo[]) => void;

  // Keyword research
  keywordQuery: string;
  setKeywordQuery: (q: string) => void;
  suggestions: KeywordSuggestion[];
  setSuggestions: (s: KeywordSuggestion[]) => void;

  // Channel presets (bookmarks)
  presets: ChannelPreset[];
  addPreset: (preset: Omit<ChannelPreset, 'id' | 'addedAt'>) => void;
  removePreset: (id: string) => void;

  // Loading
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const useChannelStore = create<ChannelState>()(
  persist(
    (set) => ({
      subTab: 'channel-search',
      setSubTab: (tab) => set({ subTab: tab }),

      channelQuery: '',
      setChannelQuery: (q) => set({ channelQuery: q }),
      channels: [],
      setChannels: (ch) => set({ channels: ch }),
      selectedChannel: null,
      setSelectedChannel: (ch) => set({ selectedChannel: ch }),
      channelVideos: [],
      setChannelVideos: (v) => set({ channelVideos: v }),

      videoQuery: '',
      setVideoQuery: (q) => set({ videoQuery: q }),
      videos: [],
      setVideos: (v) => set({ videos: v }),

      keywordQuery: '',
      setKeywordQuery: (q) => set({ keywordQuery: q }),
      suggestions: [],
      setSuggestions: (s) => set({ suggestions: s }),

      presets: [],
      addPreset: (preset) =>
        set((state) => ({
          presets: [
            ...state.presets,
            { ...preset, id: crypto.randomUUID(), addedAt: Date.now() },
          ],
        })),
      removePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        })),

      loading: false,
      setLoading: (l) => set({ loading: l }),
    }),
    {
      name: 'aio-channel-store',
      partialize: (state) => ({
        presets: state.presets,
      }),
    }
  )
);
