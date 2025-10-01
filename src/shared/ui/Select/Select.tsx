'use client';

import { type ChangeEvent, type JSX, useId } from 'react';
import styles from './select.module.css';

export type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  disabled?: boolean;
  handleOnSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  options: Option[];
  value: string | null;
};

export default function Select({
  disabled,
  handleOnSelectChange,
  label,
  options,
  value,
}: SelectProps): JSX.Element {
  const selectId = useId();
  return (
    <div className={styles.selectContainer}>
      <label className={styles.label} htmlFor={selectId}>
        {label}
      </label>
      <select
        aria-label={label}
        className={styles.select}
        disabled={disabled}
        id={selectId}
        onChange={handleOnSelectChange}
        value={value ?? ''}
      >
        {options.map((option) => (
          <option
            className={styles.option}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
