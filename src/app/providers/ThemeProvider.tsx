import useSystemAppearance from '@/shared/lib/useSystemAppearance';
import {
  type JSX,
  type PropsWithChildren,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  FALLBACK_THEME_VALUE,
  THEME_VALUES,
  Theme,
  type ThemeValue,
} from '../config/theme.ts';
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

const getThemeSnapshot = (): ThemeValue => {
  const currentThemeValue = localStorage.getItem(THEME_KEY);
  return isThemeValue(currentThemeValue)
    ? currentThemeValue
    : FALLBACK_THEME_VALUE;
};

const subscribeToStorage = (callback: () => void): (() => void) => {
  window.addEventListener(STORAGE, callback);
  return (): void => {
    window.removeEventListener(STORAGE, callback);
  };
};

const setTheme = (newThemeValue: string): void => {
  localStorage.setItem(THEME_KEY, newThemeValue);
  window.dispatchEvent(new Event(STORAGE));
};

function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const currentThemeValue = useSyncExternalStore(
    subscribeToStorage,
    getThemeSnapshot,
  );
  const documentRef = useRef(document);

  const { isDarkAppearance } = useSystemAppearance();

  function changeTheme(newThemeValue: string): void {
    if (isThemeValue(newThemeValue)) {
      const { shouldTriggerViewTransition } = Theme[currentThemeValue];
      if (
        shouldTriggerViewTransition(newThemeValue, isDarkAppearance) &&
        documentRef.current.startViewTransition
      ) {
        documentRef.current.startViewTransition(() => setTheme(newThemeValue));
      } else {
        setTheme(newThemeValue);
      }
    }
  }

  useLayoutEffect(() => {
    documentRef.current
      .querySelector(META_COLOR_SCHEME_NAME_SELECTOR)
      ?.setAttribute(CONTENT, currentThemeValue);
    setTheme(currentThemeValue);
  }, [currentThemeValue]);

  return (
    <ThemeContext value={{ changeTheme, currentThemeValue }}>
      {children}
    </ThemeContext>
  );
}

export default ThemeProvider;
