import type { JSX } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import DarkThemeIcon from '../ui/DarkThemeIcon';
import LightThemeIcon from '../ui/LightThemeIcon';
import SystemThemeIcon from '../ui/SystemThemeIcon';

const DARK_LIGHT = 'dark light';
const ONLY_DARK = 'only dark';
const ONLY_LIGHT = 'only light';

type ThemeValue = typeof DARK_LIGHT | typeof ONLY_DARK | typeof ONLY_LIGHT;

const DARK_LIGHT_LABEL = 'System';
const ONLY_DARK_LABEL = 'Always Dark';
const ONLY_LIGHT_LABEL = 'Always Light';

type ThemeLabel =
  | typeof DARK_LIGHT_LABEL
  | typeof ONLY_DARK_LABEL
  | typeof ONLY_LIGHT_LABEL;

const DARK_LIGHT_ID = 'system';
const ONLY_DARK_ID = 'alwaysDark';
const ONLY_LIGHT_ID = 'alwaysLight';

type ThemeId =
  | typeof DARK_LIGHT_ID
  | typeof ONLY_DARK_ID
  | typeof ONLY_LIGHT_ID;

interface ThemeType {
  Icon: () => JSX.Element;
  id: ThemeId;
  label: ThemeLabel;
  shouldTriggerViewTransition: (
    targetTheme: ThemeValue,
    userPrefersDarkTheme: boolean,
  ) => boolean;
  value: ThemeValue;
}

const Theme: ReadonlyDeep<Record<ThemeValue, ThemeType>> = {
  [DARK_LIGHT]: {
    Icon: SystemThemeIcon,
    id: DARK_LIGHT_ID,
    label: DARK_LIGHT_LABEL,
    shouldTriggerViewTransition(
      targetTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme
        ? targetTheme === ONLY_LIGHT
        : targetTheme === ONLY_DARK;
    },
    value: DARK_LIGHT,
  },
  [ONLY_LIGHT]: {
    Icon: LightThemeIcon,
    id: ONLY_LIGHT_ID,
    label: ONLY_LIGHT_LABEL,
    shouldTriggerViewTransition(
      targetTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme
        ? targetTheme !== ONLY_LIGHT
        : targetTheme === ONLY_DARK;
    },
    value: ONLY_LIGHT,
  },
  [ONLY_DARK]: {
    Icon: DarkThemeIcon,
    id: ONLY_DARK_ID,
    label: ONLY_DARK_LABEL,
    shouldTriggerViewTransition(
      targetTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme
        ? targetTheme === ONLY_LIGHT
        : targetTheme !== ONLY_DARK;
    },
    value: ONLY_DARK,
  },
};

const FALLBACK_THEME_VALUE: ThemeValue = DARK_LIGHT;

const THEME_VALUES: ReadonlyDeep<Array<ThemeType>> = Object.values(Theme);

export { FALLBACK_THEME_VALUE, Theme, THEME_VALUES, type ThemeValue };
