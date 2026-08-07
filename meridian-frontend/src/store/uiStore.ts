import { create } from 'zustand';
import { api } from '../services/api';

type Toast = { message: string; type?: 'info' | 'success' } | null;

export type Me = {
  username: string;
  display_name: string;
  avatar_url: string;
  email: string;
  bio: string;
  created_at?: string;
};

type UiState = {
  sidebarOpen: boolean;
  activeStack: string[];
  toast: Toast;
  isAuthenticated: boolean;
  token: string | null;
  me: Me | null;
  toggleSidebar: () => void;
  setActiveStack: (stack: string[]) => void;
  showToast: (message: string, type?: 'info' | 'success') => void;
  clearToast: () => void;
  setAuthenticated: (value: boolean) => void;
  setToken: (token: string | null) => void;
  setMe: (me: Me | null) => void;
  setAvatar: (avatarUrl: string) => void;
  restoreSession: () => Promise<void>;
  logout: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeStack: ['Python', 'Kubernetes', 'AWS', 'Rust', 'React'],
  toast: null,
  isAuthenticated: false,
  token: null,
  me: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveStack: (stack) => set({ activeStack: stack }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  setMe: (me) => {
    if (me) localStorage.setItem('me', JSON.stringify(me));
    else localStorage.removeItem('me');
    set({ me });
  },
  setAvatar: (avatarUrl) =>
    set((state) => {
      if (!state.me) return state;
      const me = { ...state.me, avatar_url: avatarUrl };
      localStorage.setItem('me', JSON.stringify(me));
      return { me };
    }),
  restoreSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let me: Me | null = null;
    try {
      const raw = localStorage.getItem('me');
      if (raw) me = JSON.parse(raw) as Me;
    } catch {
      me = null;
    }
    set({ token, me, isAuthenticated: true });
    try {
      const fresh = await api.getMe();
      const next: Me = {
        username: fresh.username,
        display_name: fresh.display_name,
        avatar_url: fresh.avatar_url,
        email: fresh.email,
        bio: fresh.bio,
        created_at: fresh.created_at,
      };
      localStorage.setItem('me', JSON.stringify(next));
      set({ me: next });
    } catch {
      // keep the stored session if the refresh fails
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('me');
    set({ token: null, me: null, isAuthenticated: false });
  },
}));
