import type { JSX } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import DarkThemeIcon from '@/shared/ui/DarkThemeIcon/DarkThemeIcon.tsx';
import LightThemeIcon from '@/shared/ui/LightThemeIcon/LightThemeIcon.tsx';

const ONLY_DARK = 'dark';
const ONLY_LIGHT = 'light';

type ThemeValue = typeof ONLY_DARK | typeof ONLY_LIGHT;

type ThemeType = {
  icon: () => JSX.Element;
  next: ThemeValue;
  value: ThemeValue;
};

const Theme: ReadonlyDeep<Record<ThemeValue, ThemeType>> = {
  [ONLY_LIGHT]: {
    icon: LightThemeIcon,
    next: ONLY_DARK,
    value: ONLY_LIGHT,
  },
  [ONLY_DARK]: {
    icon: DarkThemeIcon,
    next: ONLY_LIGHT,
    value: ONLY_DARK,
  },
};

const THEME_VALUES: ReadonlyDeep<ThemeType[]> = Object.values(Theme);

export { Theme, THEME_VALUES, type ThemeValue };
