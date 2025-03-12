'use client';

import { type JSX, use } from 'react';
import { Theme } from '../../config/theme.ts';
import ThemeContext from '../../providers/ThemeContext.tsx';
import IconButton from '../IconButton/IconButton.tsx';

function ThemeSelect(): JSX.Element {
  const { toggleTheme, currentThemeValue } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].Icon;

  return (
    <IconButton
      inputID="theme-icon-button"
      isCheckboxControlled={true}
      onChangeIconButton={toggleTheme}
    >
      <CurrentThemeIcon />
    </IconButton>
  );
}

export default ThemeSelect;
