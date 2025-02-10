import { Theme, type ThemeValue } from '../constant/theme';

function isThemeValue(themeValue: string | null): themeValue is ThemeValue {
  return (
    themeValue !== null &&
    Object.values(Theme)
      .map(({ value }) => value)
      .some((knownThemeValue) => knownThemeValue === themeValue)
  );
}

export default isThemeValue;
