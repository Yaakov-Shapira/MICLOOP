import { create } from 'zustand';
import type { AppUser } from '../types';

interface AppState {
  // Auth
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Active room
  activeLoopId: string | null;
  activeRole: 'host' | 'speaker' | 'listener' | null;

  // Gate modal
  gateVisible: boolean;
  gateAction: (() => void) | null;

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Actions
  setUser: (user: AppUser | null) => void;
  setLoading: (v: boolean) => void;
  setActiveRoom: (loopId: string | null, role: AppState['activeRole']) => void;
  showGate: (onSuccess?: () => void) => void;
  hideGate: () => void;
  showToast: (message: string, type?: AppState['toast']['type']) => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  activeLoopId: null,
  activeRole: null,
  gateVisible: false,
  gateAction: null,
  toast: null,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  setActiveRoom: (activeLoopId, activeRole) =>
    set({ activeLoopId, activeRole }),

  showGate: (onSuccess) =>
    set({ gateVisible: true, gateAction: onSuccess ?? null }),

  hideGate: () =>
    set({ gateVisible: false, gateAction: null }),

  showToast: (message, type = 'success') =>
    set({ toast: { message, type } }),

  clearToast: () => set({ toast: null }),
}));
