import { useEffect, useState } from 'react';

const CHANGE_EVENT = 'change';
const PREFERS_DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function useSystemAppearance(): {
  prefersDarkColorScheme: boolean;
} {
  const [prefersDarkColorScheme, setPrefersDarkColorScheme] = useState(false);

  useEffect(() => {
    setPrefersDarkColorScheme(
      window.matchMedia(PREFERS_DARK_COLOR_SCHEME_QUERY).matches,
    );
    const mediaQueryListListener = ({ matches }: MediaQueryListEvent): void =>
      setPrefersDarkColorScheme(matches);
    const prefersDarkColorSchemeMediaQueryList = window.matchMedia(
      PREFERS_DARK_COLOR_SCHEME_QUERY,
    );
    prefersDarkColorSchemeMediaQueryList.addEventListener(
      CHANGE_EVENT,
      mediaQueryListListener,
      { capture: true },
    );
    return () =>
      prefersDarkColorSchemeMediaQueryList.removeEventListener(
        CHANGE_EVENT,
        mediaQueryListListener,
        { capture: true },
      );
  }, []);

  return { prefersDarkColorScheme };
}

export default useSystemAppearance;
