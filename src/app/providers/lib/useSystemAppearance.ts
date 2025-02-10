import { useEffect, useState } from 'react';

const PREFERS_DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const getCurrentColorSchemePreference = globalThis.matchMedia(
  PREFERS_DARK_COLOR_SCHEME_QUERY,
).matches;

function useSystemAppearance(): {
  isDarkAppearance: boolean;
} {
  const [isDarkAppearance, setIsDarkAppearance] = useState(
    getCurrentColorSchemePreference,
  );

  useEffect(() => {
    const mediaQueryListListener = ({ matches }: MediaQueryListEvent) =>
      setIsDarkAppearance(matches);
    const prefersDarkColorSchemeMediaQueryList = globalThis.matchMedia(
      PREFERS_DARK_COLOR_SCHEME_QUERY,
    );
    prefersDarkColorSchemeMediaQueryList.addEventListener(
      'change',
      mediaQueryListListener,
    );
    return () =>
      prefersDarkColorSchemeMediaQueryList.removeEventListener(
        'change',
        mediaQueryListListener,
      );
  }, []);

  return { isDarkAppearance };
}

export default useSystemAppearance;
