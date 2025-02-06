import { type JSX, useLayoutEffect, useState } from 'react';
import ThemeContext from './ThemeContext';
import isTheme from './isTheme';
import type { Theme } from './themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

function transitionTheme() {
  document.documentElement.addEventListener('transitionend', () =>
    document.documentElement.removeAttribute('style'),
  );
  document.documentElement.style.transition = 'color .3s, background-color .3s';
}

function getInitialTheme() {
  const currentTheme = localStorage.getItem('theme');
  return isTheme(currentTheme) ? currentTheme : 'dark';
}

function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState(getInitialTheme);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    transitionTheme();
  };

  useLayoutEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <ThemeContext value={{ changeTheme, theme }}>{children}</ThemeContext>;
}

export default ThemeProvider;
