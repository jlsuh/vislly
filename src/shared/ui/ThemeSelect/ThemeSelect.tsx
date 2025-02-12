import { Theme } from '@/app/providers/constant/theme';
import type { JSX } from 'react';
import styles from './theme-select.module.css';

interface SelectProps {
  changeTheme: (newTheme: string) => void;
  currentThemeValue: string;
}

function ThemeSelect({
  changeTheme,
  currentThemeValue,
}: SelectProps): JSX.Element {
  return (
    <select
      onChange={(e) => changeTheme(e.target.value)}
      title="Select Theme"
      value={currentThemeValue}
      id="theme-select"
      className={styles.select}
    >
      {Object.values(Theme).map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default ThemeSelect;
