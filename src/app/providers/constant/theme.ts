import type { ReadonlyDeep } from 'type-fest';

const DARK_LIGHT = 'dark light';
const ONLY_DARK = 'only dark';
const ONLY_LIGHT = 'only light';

const DARK_LIGHT_LABEL = 'System';
const ONLY_DARK_LABEL = 'Always Dark';
const ONLY_LIGHT_LABEL = 'Always Light';

const Theme: ReadonlyDeep<Record<ThemeValue, ThemeObject>> = {
  [DARK_LIGHT]: {
    label: DARK_LIGHT_LABEL,
    shouldTriggerViewTransition(
      destinationTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme
        ? destinationTheme === ONLY_LIGHT
        : destinationTheme === ONLY_DARK;
    },
    value: DARK_LIGHT,
  },
  [ONLY_LIGHT]: {
    label: ONLY_LIGHT_LABEL,
    shouldTriggerViewTransition(
      destinationTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme ? true : destinationTheme === ONLY_DARK;
    },
    value: ONLY_LIGHT,
  },
  [ONLY_DARK]: {
    label: ONLY_DARK_LABEL,
    shouldTriggerViewTransition(
      destinationTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme ? destinationTheme === ONLY_LIGHT : true;
    },
    value: ONLY_DARK,
  },
};

const FALLBACK_THEME_VALUE: ThemeValue = ONLY_DARK;

type ThemeValue = typeof DARK_LIGHT | typeof ONLY_DARK | typeof ONLY_LIGHT;
type ThemeLabel =
  | typeof DARK_LIGHT_LABEL
  | typeof ONLY_DARK_LABEL
  | typeof ONLY_LIGHT_LABEL;
type ThemeObject = {
  label: ThemeLabel;
  shouldTriggerViewTransition: (
    destinationTheme: ThemeValue,
    userPrefersDarkTheme: boolean,
  ) => boolean;
  value: ThemeValue;
};

export { FALLBACK_THEME_VALUE, Theme, type ThemeValue };
