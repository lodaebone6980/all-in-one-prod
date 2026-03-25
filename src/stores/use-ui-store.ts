import { create } from 'zustand';

interface UiState {
  showApiSettings: boolean;
  setShowApiSettings: (v: boolean) => void;
  showFeedbackModal: boolean;
  setShowFeedbackModal: (v: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (v: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  showHelpGuide: boolean;
  setShowHelpGuide: (v: boolean) => void;
  showTrialGuide: boolean;
  setShowTrialGuide: (v: boolean) => void;
  lightboxUrl: string | null;
  setLightboxUrl: (url: string | null) => void;

  // Sidebar accordion
  postProdOpen: boolean;
  setPostProdOpen: (v: boolean) => void;
  toolboxOpen: boolean;
  setToolboxOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  showApiSettings: false,
  setShowApiSettings: (v) => set({ showApiSettings: v }),
  showFeedbackModal: false,
  setShowFeedbackModal: (v) => set({ showFeedbackModal: v }),
  showProfileModal: false,
  setShowProfileModal: (v) => set({ showProfileModal: v }),
  showAuthModal: false,
  setShowAuthModal: (v) => set({ showAuthModal: v }),
  showHelpGuide: false,
  setShowHelpGuide: (v) => set({ showHelpGuide: v }),
  showTrialGuide: false,
  setShowTrialGuide: (v) => set({ showTrialGuide: v }),
  lightboxUrl: null,
  setLightboxUrl: (url) => set({ lightboxUrl: url }),

  postProdOpen: true,
  setPostProdOpen: (v) => set({ postProdOpen: v }),
  toolboxOpen: false,
  setToolboxOpen: (v) => set({ toolboxOpen: v }),
}));
