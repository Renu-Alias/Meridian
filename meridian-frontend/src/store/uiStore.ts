import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  activeStack: string[];
  toggleSidebar: () => void;
  setActiveStack: (stack: string[]) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeStack: ['Python', 'Kubernetes', 'AWS', 'Rust', 'React'],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveStack: (stack) => set({ activeStack: stack }),
}));
