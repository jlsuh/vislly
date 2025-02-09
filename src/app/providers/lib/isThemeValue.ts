import { Theme, type ThemeValue } from '../constant/theme';

function isThemeValue(theme: string | null): theme is ThemeValue {
  return (
    theme !== null &&
    Object.values(Theme).some((themeValue) => themeValue === theme)
  );
}

export default isThemeValue;
