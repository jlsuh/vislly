import { type JSX, type ReactNode, useLayoutEffect, useState } from 'react';
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

  const { isDarkAppearance } = useSystemAppearance();

  function changeTheme(newThemeValue: ThemeValue) {
    const { value } = Theme[newThemeValue];
    const { shouldTriggerViewTransition } = Theme[currentThemeValue];
    if (
      shouldTriggerViewTransition(value, isDarkAppearance) &&
      document.startViewTransition
    )
      document.startViewTransition(() => setCurrentThemeValue(value));
    else setCurrentThemeValue(value);
    localStorage.setItem(THEME_KEY, value);
  }

  useLayoutEffect(() => {
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute('content', currentThemeValue);
    localStorage.setItem(THEME_KEY, currentThemeValue);
  }, [currentThemeValue]);

  return (
    <ThemeContext value={{ changeTheme, currentThemeValue }}>
      {children}
    </ThemeContext>
  );
}

export default ThemeProvider;
