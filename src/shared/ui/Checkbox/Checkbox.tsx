import { type ChangeEvent, type JSX, useId } from 'react';
import styles from './checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  disabled: boolean;
  handleOnChangeCheckbox: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export default function Checkbox({
  checked,
  disabled,
  handleOnChangeCheckbox,
  label,
}: CheckboxProps): JSX.Element {
  const checkboxId = useId();
  return (
    <label className={styles.container} htmlFor={checkboxId}>
      <span className={styles.iconWrapper}>
        <input
          aria-label={label}
          checked={checked}
          className={styles.input}
          disabled={disabled}
          id={checkboxId}
          onChange={handleOnChangeCheckbox}
          type="checkbox"
        />
        <span className={styles.icon}></span>
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
