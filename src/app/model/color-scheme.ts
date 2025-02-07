const ColorScheme = {
  Auto: 'light dark',
  Dark: 'dark',
  Light: 'light',
} as const;

const INITIAL_COLOR_SCHEME: ColorSchemeValue = ColorScheme.Dark;

type ColorSchemeValue = (typeof ColorScheme)[keyof typeof ColorScheme];

export { ColorScheme, INITIAL_COLOR_SCHEME, type ColorSchemeValue };
