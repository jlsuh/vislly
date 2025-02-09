import { DEFAULT_THEME, type ThemeValue } from '@/shared/lib/theme/theme';
import { type Context, createContext } from 'react';

interface ThemeContextType {
  changeTheme: (newTheme: ThemeValue) => void;
  theme: ThemeValue;
}

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    changeTheme: (_: ThemeValue) => {},
    theme: DEFAULT_THEME,
  },
);

export default ThemeContext;
