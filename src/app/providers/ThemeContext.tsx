import { type Context, createContext } from 'react';
import { Theme } from '../config/theme.ts';

type ThemeContextType = {
  currentThemeValue: Theme['value'];
  toggleTheme: () => void;
};

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    currentThemeValue: Theme.dark.value,
    toggleTheme: () => {
      return;
    },
  },
);

export default ThemeContext;
