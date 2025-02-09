const Theme = {
  Auto: 'light dark',
  Dark: 'only dark',
  Light: 'only light',
} as const;

const DEFAULT_THEME: ThemeValue = Theme.Dark;

type ThemeValue = (typeof Theme)[keyof typeof Theme];

export { DEFAULT_THEME, Theme, type ThemeValue };
