'use client';

import { type JSX, use } from 'react';
import { Theme } from '../../config/theme.ts';
import ThemeContext from '../../providers/ThemeContext.tsx';
import IconButton from '../IconButton/IconButton.tsx';
import styles from './theme-select.module.css';

function ThemeSelect(): JSX.Element {
  const { toggleTheme, currentThemeValue } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].Icon;

  return (
    <div className={styles.themeSelectContainer}>
      <IconButton
        inputID="theme-icon-button"
        onChangeIconButton={toggleTheme}
        sxInput={styles.checkboxInput}
        sxLabel={styles.button}
      >
        <CurrentThemeIcon />
      </IconButton>
    </div>
  );
}

export default ThemeSelect;
