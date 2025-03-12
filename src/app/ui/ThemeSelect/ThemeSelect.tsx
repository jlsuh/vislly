'use client';

import { type JSX, use } from 'react';
import { Theme } from '../../config/theme.ts';
import ThemeContext from '../../providers/ThemeContext.tsx';
import CheckboxButton from '../IconButton/CheckboxButton.tsx';
import styles from './theme-select.module.css';

function ThemeSelect(): JSX.Element {
  const { toggleTheme, currentThemeValue } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].Icon;

  return (
    <div className={styles.themeSelectContainer}>
      <CheckboxButton
        inputID="theme-icon-button"
        onChangeCheckboxButton={toggleTheme}
        sxInput={styles.checkboxInput}
        sxLabel={styles.button}
      >
        <CurrentThemeIcon />
      </CheckboxButton>
    </div>
  );
}

export default ThemeSelect;
