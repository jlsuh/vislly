import { useEffect, useState } from 'react';

const CHANGE_EVENT = 'change';
const PREFERS_DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function useSystemAppearance(): {
  isDarkAppearance: boolean;
} {
  const [isDarkAppearance, setIsDarkAppearance] = useState(false);

  useEffect(() => {
    setIsDarkAppearance(
      window.matchMedia(PREFERS_DARK_COLOR_SCHEME_QUERY).matches,
    );
    const mediaQueryListListener = ({ matches }: MediaQueryListEvent): void =>
      setIsDarkAppearance(matches);
    const prefersDarkColorSchemeMediaQueryList = window.matchMedia(
      PREFERS_DARK_COLOR_SCHEME_QUERY,
    );
    prefersDarkColorSchemeMediaQueryList.addEventListener(
      CHANGE_EVENT,
      mediaQueryListListener,
      { capture: true },
    );
    return (): void =>
      prefersDarkColorSchemeMediaQueryList.removeEventListener(
        CHANGE_EVENT,
        mediaQueryListListener,
        { capture: true },
      );
  }, []);

  return { isDarkAppearance };
}

export default useSystemAppearance;
