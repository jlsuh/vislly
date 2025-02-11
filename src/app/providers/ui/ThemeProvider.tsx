import {
  type JSX,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  FALLBACK_THEME_VALUE,
  Theme,
  type ThemeValue,
} from '../constant/theme';
import isThemeValue from '../lib/isThemeValue';
import useSystemAppearance from '../lib/useSystemAppearance';
import ThemeContext from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

const CONTENT = 'content';
const META_COLOR_SCHEME_NAME_SELECTOR = 'meta[name="color-scheme"]';
const THEME_KEY = 'theme';

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

  function changeTheme(newThemeValue: ThemeValue) {
    const { value } = Theme[newThemeValue];
    const { shouldTriggerViewTransition } = Theme[currentThemeValue];
    if (
      shouldTriggerViewTransition(value, isDarkAppearance) &&
      documentRef.current.startViewTransition
    )
      documentRef.current.startViewTransition(() =>
        setCurrentThemeValue(value),
      );
    else setCurrentThemeValue(value);
    localStorage.setItem(THEME_KEY, value);
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
