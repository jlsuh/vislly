import { type JSX, type MouseEvent, type PointerEvent, useRef } from 'react';
import { THEME_VALUES } from '../../config/theme.ts';
import useOnClickOutside from '../../lib/useOnClickOutside.ts';
import IconButton from '../IconButton/IconButton.tsx';
import styles from './theme-select.module.css';

type ThemeSelectProps = {
  changeTheme: (newTheme: string) => void;
  CurrentThemeIcon: () => JSX.Element;
  currentThemeValue: string;
};

function ThemeSelect({
  changeTheme,
  CurrentThemeIcon,
  currentThemeValue,
}: ThemeSelectProps): JSX.Element {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const themeSelectRef = useRef<HTMLDivElement>(null);

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
    <div className={styles.themeSelectContainer} ref={themeSelectRef}>
      <IconButton
        inputID="theme-icon-button"
        inputRef={checkboxRef}
        sxInput={styles.checkboxInput}
        sxLabel={styles.button}
      >
        <CurrentThemeIcon />
      </IconButton>
      <div className={styles.listContainer}>
        <ul className={styles.list}>
          {THEME_VALUES.map(({ Icon, id, label, value }) => (
            <li className={styles.listItem} key={id}>
              <label className={styles.listItemLabel}>
                <Icon />
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
