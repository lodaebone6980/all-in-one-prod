import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  tier: 'trial' | 'pro' | 'enterprise';
  trialExpiresAt?: number;
  createdAt: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  checking: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setChecking: (c: boolean) => void;
  logout: () => void;
  isAdmin: () => boolean;
  trialDaysLeft: () => number;
  isTrialExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      checking: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setChecking: (c) => set({ checking: c }),
      logout: () => set({ user: null, token: null }),
      isAdmin: () => get().user?.role === 'admin',
      trialDaysLeft: () => {
        const u = get().user;
        if (!u?.trialExpiresAt) return 0;
        return Math.max(0, Math.ceil((u.trialExpiresAt - Date.now()) / 86400000));
      },
      isTrialExpired: () => {
        const u = get().user;
        if (!u?.trialExpiresAt) return false;
        return u.trialExpiresAt < Date.now();
      },
    }),
    {
      name: 'aio-auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
