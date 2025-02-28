'use client';

import { type Context, createContext } from 'react';
import { FALLBACK_THEME_VALUE, type ThemeValue } from '../config/theme.ts';

type ThemeContextType = {
  changeTheme: (newTheme: ThemeValue) => void;
  currentThemeValue: ThemeValue;
};

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    changeTheme: (_: ThemeValue): void => {
      return;
    },
    currentThemeValue: FALLBACK_THEME_VALUE,
  },
);

export default ThemeContext;
