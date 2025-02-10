import { type Context, createContext } from 'react';
import { FALLBACK_THEME_VALUE, type ThemeValue } from '../constant/theme';

interface ThemeContextType {
  changeTheme: (newTheme: ThemeValue) => void;
  currentThemeValue: ThemeValue;
}

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    changeTheme: (_: ThemeValue) => {},
    currentThemeValue: FALLBACK_THEME_VALUE,
  },
);

export default ThemeContext;
