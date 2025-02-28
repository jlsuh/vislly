'use client';

import { type Context, createContext } from 'react';
import { FALLBACK_THEME_VALUE, type ThemeValue } from '../config/theme.ts';

interface ThemeContextType {
  changeTheme: (newTheme: string) => void;
  currentThemeValue: ThemeValue;
}

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    changeTheme: (_: string): void => {
      return;
    },
    currentThemeValue: FALLBACK_THEME_VALUE,
  },
);

export default ThemeContext;
