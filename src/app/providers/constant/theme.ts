import type { ReadonlyDeep } from 'type-fest';

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

interface ThemeType {
  label: ThemeLabel;
  shouldTriggerViewTransition: (
    targetTheme: ThemeValue,
    userPrefersDarkTheme: boolean,
  ) => boolean;
  value: ThemeValue;
}

const Theme: ReadonlyDeep<Record<ThemeValue, ThemeType>> = {
  [DARK_LIGHT]: {
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
    label: ONLY_LIGHT_LABEL,
    shouldTriggerViewTransition(
      targetTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme ? true : targetTheme === ONLY_DARK;
    },
    value: ONLY_LIGHT,
  },
  [ONLY_DARK]: {
    label: ONLY_DARK_LABEL,
    shouldTriggerViewTransition(
      targetTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme ? targetTheme === ONLY_LIGHT : true;
    },
    value: ONLY_DARK,
  },
};

const FALLBACK_THEME_VALUE: ThemeValue = DARK_LIGHT;

export { FALLBACK_THEME_VALUE, Theme, type ThemeValue };
