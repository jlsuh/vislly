'use client';

import { Theme } from '@/shared/config/theme.ts';
import ThemeSelect from '@/shared/ui/ThemeSelect/ThemeSelect.tsx';
import { type JSX, use } from 'react';
import ThemeContext from '../providers/ThemeContext.tsx';

function ThemeSelectContainer(): JSX.Element {
  const { changeTheme, currentThemeValue } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].Icon;

  return (
    <ThemeSelect
      changeTheme={changeTheme}
      currentThemeValue={currentThemeValue}
      CurrentThemeIcon={CurrentThemeIcon}
    />
  );
}

export default ThemeSelectContainer;
