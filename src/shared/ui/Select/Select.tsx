import { type ChangeEvent, type JSX, useId } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import styles from './select.module.css';

type SelectSize = 'sm' | 'md' | 'lg';

type SelectProps = {
  disabled?: boolean;
  label: string;
  options: ReadonlyDeep<Option[]>;
  size?: SelectSize;
  value: string | null;
  handleOnSelectChange: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function Select({
  disabled,
  label,
  options,
  size = 'md',
  value,
  handleOnSelectChange,
}: SelectProps): JSX.Element {
  const selectId = useId();
  const containerClass = `${styles.selectContainer} ${styles[size]}`;

  return (
    <div className={containerClass}>
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <fieldset aria-hidden="true" className={styles.fieldset}>
        <legend className={styles.legend}>
          <span>{label}</span>
        </legend>
      </fieldset>
    </div>
  );
}

export default Select;
