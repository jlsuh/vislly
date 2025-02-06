import { type Context, createContext } from 'react';
import type { Theme } from './themes';
import Themes from './themes';

const ThemeContext: Context<{
  changeTheme: (newTheme: Theme) => void;
  theme: Theme;
}> = createContext<{ changeTheme: (newTheme: Theme) => void; theme: Theme }>({
  changeTheme: (_: Theme) => {},
  theme: Themes.DARK,
});

export default ThemeContext;
