import useClickOutside from '@/shared/lib/useClickOutside';
import { type JSX, type MouseEvent, use, useRef } from 'react';
import { Theme } from '../constant/theme';
import ThemeContext from './ThemeContext';
import styles from './theme-select.module.css';

function ThemeSelect(): JSX.Element {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const themeSelectRef = useRef<HTMLDivElement>(null);
  const { currentThemeValue, changeTheme } = use(ThemeContext);

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
    <div className={styles.themeSelect} ref={themeSelectRef}>
      {Object.values(Theme).map(({ id, value }) => (
        <input
          className={styles[`themeSelect__${id}Input`]}
          defaultChecked={currentThemeValue === value}
          id={id}
          key={id}
          name="theme"
          onClick={handleOnClickUncheckCheckbox}
          type="radio"
          value={value}
        />
      ))}
      <input
        className={styles.themeSelect__checkboxInput}
        id="checkbox"
        ref={checkboxRef}
        type="checkbox"
      />
      <label className={styles.themeSelect__button} htmlFor="checkbox">
        <span className={styles.themeSelect__icons}>
          {Object.values(Theme).map(({ Icon }) => (
            <Icon key={Icon.name} />
          ))}
        </span>
      </label>
      <div className={styles.themeSelect__listContainer}>
        <ul className={styles.themeSelect__list}>
          {Object.values(Theme).map(({ Icon, id, label }) => (
            <li key={id}>
              <label className={styles.themeSelect__listLabel} htmlFor={id}>
                <span className={styles.themeSelect__icons}>
                  <Icon />
                </span>
                <span className={styles.themeSelect__listLabelDescription}>
                  {label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ThemeSelect;
