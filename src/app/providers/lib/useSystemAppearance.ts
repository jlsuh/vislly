import { useEffect, useRef, useState } from 'react';

const CHANGE_EVENT = 'change';
const PREFERS_DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function useSystemAppearance(): {
  isDarkAppearance: boolean;
} {
  const windowRef = useRef(window);

  const getCurrentColorSchemePreference = windowRef.current.matchMedia(
    PREFERS_DARK_COLOR_SCHEME_QUERY,
  ).matches;

  const [isDarkAppearance, setIsDarkAppearance] = useState(
    getCurrentColorSchemePreference,
  );

  useEffect(() => {
    const mediaQueryListListener = ({ matches }: MediaQueryListEvent) =>
      setIsDarkAppearance(matches);
    const prefersDarkColorSchemeMediaQueryList = windowRef.current.matchMedia(
      PREFERS_DARK_COLOR_SCHEME_QUERY,
    );
    prefersDarkColorSchemeMediaQueryList.addEventListener(
      CHANGE_EVENT,
      mediaQueryListListener,
    );
    return () =>
      prefersDarkColorSchemeMediaQueryList.removeEventListener(
        CHANGE_EVENT,
        mediaQueryListListener,
      );
  }, []);

  return { isDarkAppearance };
}

export default useSystemAppearance;
