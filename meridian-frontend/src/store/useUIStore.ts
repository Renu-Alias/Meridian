import create from 'zustand';

type UIState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
