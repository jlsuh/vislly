const ColorScheme = {
  Auto: 'light dark',
  Dark: 'dark',
  Light: 'light',
} as const;

export type ColorSchemeValue = (typeof ColorScheme)[keyof typeof ColorScheme];

export default ColorScheme;
