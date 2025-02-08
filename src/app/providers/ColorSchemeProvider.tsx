import { type JSX, useLayoutEffect, useState } from 'react';
import isColorSchemeValue from '../lib/isColorSchemeValue';
import {
  type ColorSchemeValue,
  INITIAL_COLOR_SCHEME,
} from '../model/color-scheme';
import ColorSchemeContext from './ColorSchemeContext';

interface ColorSchemeProviderProps {
  children: React.ReactNode;
}

const COLOR_SCHEME_KEY = 'color-scheme';
const COLOR_SCHEME_TRANSITION_CLASS = 'root_transition_enabled';

const getInitialColorScheme = () => {
  const currentColorScheme = localStorage.getItem(COLOR_SCHEME_KEY);
  return isColorSchemeValue(currentColorScheme)
    ? currentColorScheme
    : INITIAL_COLOR_SCHEME;
};

function triggerColorSchemeTransition() {
  document.documentElement.classList.add(COLOR_SCHEME_TRANSITION_CLASS);
}

function ColorSchemeProvider({
  children,
}: ColorSchemeProviderProps): JSX.Element {
  const [colorScheme, setColorScheme] = useState(getInitialColorScheme);

  function changeColorScheme(newColorScheme: ColorSchemeValue) {
    setColorScheme(newColorScheme);
    triggerColorSchemeTransition();
  }

  useLayoutEffect(() => {
    localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
    document.documentElement.style.setProperty(COLOR_SCHEME_KEY, colorScheme);
  }, [colorScheme]);

  return (
    <ColorSchemeContext value={{ changeColorScheme, colorScheme }}>
      {children}
    </ColorSchemeContext>
  );
}

export default ColorSchemeProvider;
