import {
  type JSX,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import useSystemAppearance from '../../lib/useSystemAppearance';
import ThemeContext from './ThemeContext';
import {
  FALLBACK_THEME_VALUE,
  THEME_VALUES,
  Theme,
  type ThemeValue,
} from './theme';

interface ThemeProviderProps {
  children: ReactNode;
}

const CONTENT = 'content';
const META_COLOR_SCHEME_NAME_SELECTOR = 'meta[name="color-scheme"]';
const THEME_KEY = 'theme';

function isThemeValue(themeValue: string | null): themeValue is ThemeValue {
  return (
    themeValue !== null &&
    THEME_VALUES.map(({ value }) => value).some(
      (knownThemeValue) => knownThemeValue === themeValue,
    )
  );
}

const getInitialThemeValue = () => {
  const currentThemeValue = localStorage.getItem(THEME_KEY);
  return isThemeValue(currentThemeValue)
    ? currentThemeValue
    : FALLBACK_THEME_VALUE;
};

function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [currentThemeValue, setCurrentThemeValue] =
    useState(getInitialThemeValue);
  const documentRef = useRef(document);

  const { isDarkAppearance } = useSystemAppearance();

  function changeTheme(newThemeValue: string) {
    if (isThemeValue(newThemeValue)) {
      const { shouldTriggerViewTransition } = Theme[currentThemeValue];
      if (
        shouldTriggerViewTransition(newThemeValue, isDarkAppearance) &&
        documentRef.current.startViewTransition
      )
        documentRef.current.startViewTransition(() =>
          setCurrentThemeValue(newThemeValue),
        );
      else setCurrentThemeValue(newThemeValue);
      localStorage.setItem(THEME_KEY, newThemeValue);
    }
  }

  useLayoutEffect(() => {
    documentRef.current
      .querySelector(META_COLOR_SCHEME_NAME_SELECTOR)
      ?.setAttribute(CONTENT, currentThemeValue);
    localStorage.setItem(THEME_KEY, currentThemeValue);
  }, [currentThemeValue]);

  return (
    <ThemeContext value={{ changeTheme, currentThemeValue }}>
      {children}
    </ThemeContext>
  );
}

export default ThemeProvider;
