import { create } from 'zustand';

type Toast = { message: string; type?: 'info' | 'success' } | null;

export type Me = {
  username: string;
  display_name: string;
  avatar_url: string;
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
  restoreSession: () => void;
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
  restoreSession: () => {
    const token = localStorage.getItem('token');
    if (token) {
      let me: Me | null = null;
      try {
        const raw = localStorage.getItem('me');
        if (raw) me = JSON.parse(raw) as Me;
      } catch {
        me = null;
      }
      set({ token, me, isAuthenticated: true });
    }
  },
}));
