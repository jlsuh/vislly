const LIGHT_DARK = 'light dark';
const ONLY_DARK = 'only dark';
const ONLY_LIGHT = 'only light';

const LIGHT_DARK_LABEL = 'System';
const ONLY_DARK_LABEL = 'Always Dark';
const ONLY_LIGHT_LABEL = 'Always Light';

const Theme: Record<ThemeValue, ThemeObject> = {
  [`${LIGHT_DARK}`]: {
    label: LIGHT_DARK_LABEL,
    shouldTriggerViewTransition(
      destinationTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme
        ? destinationTheme === ONLY_LIGHT
        : destinationTheme === ONLY_DARK;
    },
    value: LIGHT_DARK,
  },
  [`${ONLY_LIGHT}`]: {
    label: ONLY_LIGHT_LABEL,
    shouldTriggerViewTransition(
      destinationTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme ? true : destinationTheme === ONLY_DARK;
    },
    value: ONLY_LIGHT,
  },
  [`${ONLY_DARK}`]: {
    label: ONLY_DARK_LABEL,
    shouldTriggerViewTransition(
      destinationTheme: ThemeValue,
      userPrefersDarkTheme: boolean,
    ) {
      return userPrefersDarkTheme ? destinationTheme === ONLY_LIGHT : true;
    },
    value: ONLY_DARK,
  },
} as const;

const FALLBACK_THEME_VALUE: ThemeValue = ONLY_DARK;

type ThemeValue = typeof LIGHT_DARK | typeof ONLY_DARK | typeof ONLY_LIGHT;
type ThemeLabel =
  | typeof ONLY_DARK_LABEL
  | typeof ONLY_LIGHT_LABEL
  | typeof LIGHT_DARK_LABEL;
type ThemeObject = {
  label: ThemeLabel;
  shouldTriggerViewTransition: (
    destinationTheme: ThemeValue,
    userPrefersDarkTheme: boolean,
  ) => boolean;
  value: ThemeValue;
};

export { FALLBACK_THEME_VALUE, Theme, type ThemeValue };
