import { type Context, createContext } from 'react';
import {
  type ColorSchemeValue,
  INITIAL_COLOR_SCHEME,
} from '../../shared/ui/theme/color-scheme';

interface ColorSchemeContextType {
  changeColorScheme: (newColorScheme: ColorSchemeValue) => void;
  colorScheme: ColorSchemeValue;
}

const ColorSchemeContext: Context<ColorSchemeContextType> =
  createContext<ColorSchemeContextType>({
    changeColorScheme: (_: ColorSchemeValue) => {},
    colorScheme: INITIAL_COLOR_SCHEME,
  });

export default ColorSchemeContext;
