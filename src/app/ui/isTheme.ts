import type { Theme } from './themes';
import Themes from './themes';

function isTheme(theme: string | null): theme is Theme {
  return (
    theme !== null &&
    Object.values(Themes).some((knownTheme) => knownTheme === theme)
  );
}

export default isTheme;
