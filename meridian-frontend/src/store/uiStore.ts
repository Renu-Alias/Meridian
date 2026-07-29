import { create } from 'zustand';

type Toast = { message: string; type?: 'info' | 'success' } | null;

type UiState = {
  sidebarOpen: boolean;
  activeStack: string[];
  toast: Toast;
  isAuthenticated: boolean;
  token: string | null;
  toggleSidebar: () => void;
  setActiveStack: (stack: string[]) => void;
  showToast: (message: string, type?: 'info' | 'success') => void;
  clearToast: () => void;
  setAuthenticated: (value: boolean) => void;
  setToken: (token: string | null) => void;
  restoreSession: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeStack: ['Python', 'Kubernetes', 'AWS', 'Rust', 'React'],
  toast: null,
  isAuthenticated: false,
  token: null,
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
  restoreSession: () => {
    const token = localStorage.getItem('token');
    if (token) set({ token, isAuthenticated: true });
  },
}));
