import isThemeValue from '@/shared/ui/theme/isThemeValue';
import { DEFAULT_THEME, type ThemeValue } from '@/shared/ui/theme/theme';
import { type JSX, useLayoutEffect, useState } from 'react';
import ThemeContext from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_KEY = 'theme';
const COLOR_SCHEME_STYLE = 'color-scheme';
const THEME_TRANSITION_CLASS = 'root_transition_enabled';

const getInitialTheme = () => {
  const currentTheme = localStorage.getItem(THEME_KEY);
  return isThemeValue(currentTheme) ? currentTheme : DEFAULT_THEME;
};

function triggerThemeTransition() {
  document.documentElement.classList.add(THEME_TRANSITION_CLASS);
}

function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState(getInitialTheme);

  function changeTheme(newTheme: ThemeValue) {
    setTheme(newTheme);
    triggerThemeTransition();
  }

  useLayoutEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.style.setProperty(COLOR_SCHEME_STYLE, theme);
  }, [theme]);

  return (
    <ThemeContext value={{ changeTheme: changeTheme, theme: theme }}>
      {children}
    </ThemeContext>
  );
}

export default ThemeProvider;
