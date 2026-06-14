export type VisualTheme = 'ion' | 'aqua' | 'flare';

type ThemeListener = (theme: VisualTheme) => void;

let theme: VisualTheme = 'ion';
const listeners = new Set<ThemeListener>();

export const visualModeStore = {
  getTheme() {
    return theme;
  },
  setTheme(nextTheme: VisualTheme) {
    theme = nextTheme;
    listeners.forEach((listener) => listener(theme));
  },
  subscribe(listener: ThemeListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
