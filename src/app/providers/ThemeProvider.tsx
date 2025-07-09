'use client';

import {
  type JSX,
  type PropsWithChildren,
  useEffect,
  useSyncExternalStore,
} from 'react';
import useSystemAppearance from '@/shared/lib/useSystemAppearance';
import { THEME_VALUES, Theme, type ThemeValue } from '../config/theme.ts';
import ThemeContext from './ThemeContext.tsx';

type ThemeProviderProps = PropsWithChildren;

const CONTENT = 'content';
const META_COLOR_SCHEME_NAME_SELECTOR = 'meta[name="color-scheme"]';
const STORAGE = 'storage';
const THEME_KEY = 'theme';

function isThemeValue(themeValue: string | null): themeValue is ThemeValue {
  return (
    themeValue !== null &&
    THEME_VALUES.map(({ value }) => value).some(
      (knownThemeValue) => knownThemeValue === themeValue,
    )
  );
}

function getThemeSnapshot(prefersDarkColorScheme: boolean) {
  return (): ThemeValue => {
    const currentThemeValue = localStorage.getItem(THEME_KEY);
    if (isThemeValue(currentThemeValue)) {
      return currentThemeValue;
    }
    if (prefersDarkColorScheme) {
      return Theme.dark.value;
    }
    return Theme.light.value;
  };
}

const subscribeToStorage = (callback: () => void): (() => void) => {
  window.addEventListener(STORAGE, callback);
  return () => {
    window.removeEventListener(STORAGE, callback);
  };
};

const applyTheme = (newThemeValue: string): void => {
  localStorage.setItem(THEME_KEY, newThemeValue);
  window.dispatchEvent(new Event(STORAGE));
};

function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const { prefersDarkColorScheme } = useSystemAppearance();

  const currentThemeValue = useSyncExternalStore(
    subscribeToStorage,
    getThemeSnapshot(prefersDarkColorScheme),
    () => null,
  );

  function toggleTheme(): void {
    if (currentThemeValue === null) {
      return;
    }
    const newThemeValue = Theme[currentThemeValue].next;
    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme(newThemeValue));
    } else {
      applyTheme(newThemeValue);
    }
  }

  useEffect(() => {
    if (currentThemeValue === null) {
      return;
    }
    const metaColorScheme = document.querySelector(
      META_COLOR_SCHEME_NAME_SELECTOR,
    );
    if (metaColorScheme === null) {
      return;
    }
    metaColorScheme.setAttribute(CONTENT, currentThemeValue);
  }, [currentThemeValue]);

  if (currentThemeValue === null) {
    return <></>;
  }

  return (
    <ThemeContext value={{ currentThemeValue, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}

export default ThemeProvider;
