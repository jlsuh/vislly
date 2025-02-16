import useClickOutside from '@/shared/lib/useClickOutside';
import { type JSX, type MouseEvent, use, useRef } from 'react';
import { THEME_VALUES, Theme } from '../constant/theme';
import ThemeContext from './ThemeContext';
import styles from './theme-select.module.css';

function ThemeSelect(): JSX.Element {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const themeSelectRef = useRef<HTMLDivElement>(null);
  const { currentThemeValue, changeTheme } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].Icon;

  function uncheckCheckbox() {
    if (checkboxRef.current) checkboxRef.current.checked = false;
  }

  useClickOutside(themeSelectRef, uncheckCheckbox, true);

  const handleOnClickUncheckCheckbox = (
    e: MouseEvent<HTMLInputElement, globalThis.MouseEvent>,
  ) => {
    uncheckCheckbox();
    const { currentTarget } = e;
    const { value } = currentTarget;
    changeTheme(value);
  };

  return (
    <div className={styles.mainContainer} ref={themeSelectRef}>
      <label className={styles.button}>
        <span className={styles.iconContainer}>
          <CurrentThemeIcon />
        </span>
        <input
          className={styles.checkboxInput}
          id="checkbox"
          ref={checkboxRef}
          type="checkbox"
        />
      </label>
      <div className={styles.listContainer}>
        <ul className={styles.list}>
          {THEME_VALUES.map(({ Icon, id, label, value }) => (
            <li key={id}>
              <label className={styles.listItemLabel}>
                <span className={styles.iconContainer}>
                  <Icon />
                </span>
                <span className={styles.label}>{label}</span>
                <input
                  className={styles[`${id}Input`]}
                  defaultChecked={currentThemeValue === value}
                  key={id}
                  name="theme"
                  onClick={handleOnClickUncheckCheckbox}
                  type="radio"
                  value={value}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ThemeSelect;
