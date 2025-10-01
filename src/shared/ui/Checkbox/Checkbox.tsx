import { type JSX, useId } from 'react';
import styles from './checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Checkbox({
  checked,
  disabled,
  label,
  onChange,
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
          onChange={onChange}
          type="checkbox"
        />
        <span className={styles.icon}></span>
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
