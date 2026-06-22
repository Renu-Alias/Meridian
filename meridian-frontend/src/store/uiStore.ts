import { create } from 'zustand';

type Toast = { message: string; type?: 'info' | 'success' } | null;

type UiState = {
  sidebarOpen: boolean;
  activeStack: string[];
  toast: Toast;
  toggleSidebar: () => void;
  setActiveStack: (stack: string[]) => void;
  showToast: (message: string, type?: 'info' | 'success') => void;
  clearToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeStack: ['Python', 'Kubernetes', 'AWS', 'Rust', 'React'],
  toast: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveStack: (stack) => set({ activeStack: stack }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
