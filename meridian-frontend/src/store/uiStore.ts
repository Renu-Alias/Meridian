import { create } from 'zustand';

type Toast = { message: string; type?: 'info' | 'success' } | null;

type UiState = {
  sidebarOpen: boolean;
  activeStack: string[];
  toast: Toast;
  isAuthenticated: boolean;
  toggleSidebar: () => void;
  setActiveStack: (stack: string[]) => void;
  showToast: (message: string, type?: 'info' | 'success') => void;
  clearToast: () => void;
  setAuthenticated: (value: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeStack: ['Python', 'Kubernetes', 'AWS', 'Rust', 'React'],
  toast: null,
  isAuthenticated: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveStack: (stack) => set({ activeStack: stack }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
