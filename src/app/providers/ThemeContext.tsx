import { type Context, createContext } from 'react';
import { FALLBACK_THEME_VALUE, type ThemeValue } from '../config/theme';

interface ThemeContextType {
  changeTheme: (newTheme: string) => void;
  currentThemeValue: ThemeValue;
}

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    changeTheme: (_: string) => {},
    currentThemeValue: FALLBACK_THEME_VALUE,
  },
);

export default ThemeContext;
