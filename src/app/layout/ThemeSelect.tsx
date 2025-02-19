import useOnClickOutside from '@/shared/lib/useOnClickOutside';
import {
  type JSX,
  type MouseEvent,
  type PointerEvent,
  use,
  useRef,
} from 'react';
import { THEME_VALUES, Theme } from '../config/theme.ts';
import ThemeContext from '../providers/ThemeContext.tsx';
import styles from './theme-select.module.css';

function ThemeSelect(): JSX.Element {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const themeSelectRef = useRef<HTMLDivElement>(null);
  const { changeTheme, currentThemeValue } = use(ThemeContext);

  const CurrentThemeIcon = Theme[currentThemeValue].Icon;

  const uncheckCheckboxContinuation = (
    _: Event | MouseEvent<HTMLInputElement> | PointerEvent<HTMLInputElement>,
  ): void => {
    if (checkboxRef.current !== null) {
      checkboxRef.current.checked = false;
    }
  };

  useOnClickOutside([themeSelectRef], uncheckCheckboxContinuation);

  const handleOnClickUncheckCheckbox = (
    e: MouseEvent<HTMLInputElement> | PointerEvent<HTMLInputElement>,
  ): void => {
    changeTheme(e.currentTarget.value);
    uncheckCheckboxContinuation(e);
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
            <li className={styles.listItem} key={id}>
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
