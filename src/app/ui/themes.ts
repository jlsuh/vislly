const Themes = {
  AUTO: 'light dark',
  DARK: 'dark',
  LIGHT: 'light',
} as const;

export type Theme = (typeof Themes)[keyof typeof Themes];

export default Themes;
