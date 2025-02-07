import { type Context, createContext } from 'react';
import type { ColorSchemeValue } from '../model/color-scheme';
import ColorScheme from '../model/color-scheme';

const ColorSchemeContext: Context<{
  changeColorScheme: (newColorScheme: ColorSchemeValue) => void;
  colorScheme: ColorSchemeValue;
}> = createContext<{
  changeColorScheme: (newColorScheme: ColorSchemeValue) => void;
  colorScheme: ColorSchemeValue;
}>({
  changeColorScheme: (_: ColorSchemeValue) => {},
  colorScheme: ColorScheme.Dark,
});

export default ColorSchemeContext;
