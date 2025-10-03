'use client';

import { type JSX, use } from 'react';
import IconButton from '@/shared/ui/IconButton/IconButton.tsx';
import { Theme } from './../../config/theme.ts';
import ThemeContext from './../../providers/ThemeContext.tsx';

function ThemeSelect(): JSX.Element {
  const { toggleTheme, currentThemeValue } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].icon;

  return (
    <IconButton
      inputId="theme-icon-button"
      isCheckboxControlled={true}
      onChangeIconButton={toggleTheme}
    >
      <CurrentThemeIcon />
    </IconButton>
  );
}

export default ThemeSelect;
