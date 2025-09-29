'use client';

import { type JSX, useId } from 'react';
import styles from './select.module.css';

export type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
};

export default function Select({
  label,
  options,
  value,
  onChange,
}: SelectProps): JSX.Element {
  const selectId = useId();
  return (
    <div className={styles.selectContainer}>
      <label className={styles.label} htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        className={styles.select}
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className={styles.option}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
