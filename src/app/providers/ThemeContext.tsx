import {
  FALLBACK_THEME_VALUE,
  type ThemeValue,
} from '@/shared/config/theme.ts';
import { type Context, createContext } from 'react';

type ThemeContextType = {
  changeTheme: (newTheme: string) => void;
  currentThemeValue: ThemeValue;
};

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    changeTheme: (_: string): void => {
      return;
    },
    currentThemeValue: FALLBACK_THEME_VALUE,
  },
);

export default ThemeContext;
