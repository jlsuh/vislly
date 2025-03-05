import { type Context, createContext } from 'react';
import { Theme, type ThemeValue } from '../config/theme.ts';

type ThemeContextType = {
  currentThemeValue: ThemeValue;
  toggleTheme: () => void;
};

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    currentThemeValue: Theme.dark.value,
    toggleTheme: (): void => {
      return;
    },
  },
);

export default ThemeContext;
