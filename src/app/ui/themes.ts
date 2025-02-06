const Themes = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type Theme = (typeof Themes)[keyof typeof Themes];

export default Themes;
