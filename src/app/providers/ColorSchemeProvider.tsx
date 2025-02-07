import { type JSX, useLayoutEffect, useState } from 'react';
import isColorSchemeValue from '../lib/isColorSchemeValue';
import ColorScheme, { type ColorSchemeValue } from '../model/color-scheme';
import ColorSchemeContext from './ColorSchemeContext';

interface ColorSchemeProviderProps {
  children: React.ReactNode;
}

const COLOR_SCHEME_KEY = 'color-scheme';
const TRANSITION_DURATION_MILLIS = 300;
const TRANSITION_VALUE = `color ${TRANSITION_DURATION_MILLIS}ms, background-color ${TRANSITION_DURATION_MILLIS}ms`;

function getInitialColorScheme() {
  const currentColorScheme = localStorage.getItem(COLOR_SCHEME_KEY);
  return isColorSchemeValue(currentColorScheme)
    ? currentColorScheme
    : ColorScheme.Dark;
}

function triggerColorSchemeTransition() {
  document.documentElement.style.transition = TRANSITION_VALUE;
  setTimeout(
    () => document.documentElement.style.removeProperty('transition'),
    TRANSITION_DURATION_MILLIS,
  );
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
