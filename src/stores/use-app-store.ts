import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TabId, ApiKeys } from '../types';

interface AppState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  apiKeys: ApiKeys;
  setApiKey: (key: keyof ApiKeys, value: string) => void;
  setApiKeys: (keys: Partial<ApiKeys>) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const defaultApiKeys: ApiKeys = {
  evolink: '',
  gemini: '',
  kieAi: '',
  xAi: '',
  typecast: '',
  youtubeDataApi: '',
  cloudinary: '',
  removeBg: '',
  apimart: '',
  coupangAccessKey: '',
  coupangSecretKey: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'project',
      setActiveTab: (tab) => set({ activeTab: tab }),
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      apiKeys: defaultApiKeys,
      setApiKey: (key, value) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [key]: value },
        })),
      setApiKeys: (keys) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, ...keys },
        })),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'aio-app-store',
      partialize: (state) => ({
        activeTab: state.activeTab,
        apiKeys: state.apiKeys,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
