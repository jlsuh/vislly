import { type ChangeEvent, type JSX, useId } from 'react';
import styles from './range-input.module.css';

type RangeInputSize = 'sm' | 'md' | 'lg';

type RangeInputProps = {
  disabled?: boolean;
  label: string;
  max: number;
  min: number;
  size?: RangeInputSize;
  step: number;
  value: number | string;
  handleOnChangeInput: (e: ChangeEvent<HTMLInputElement>) => void;
};

function RangeInput({
  disabled = false,
  label,
  max,
  min,
  size = 'md',
  step,
  value,
  handleOnChangeInput,
}: RangeInputProps): JSX.Element {
  const id = useId();
  const wrapperClass = `${styles.rangeWrapper} ${styles[size]}`;

  return (
    <div className={wrapperClass}>
      <label className={styles.rangeLabel} htmlFor={id}>
        {label}:<strong>{value}</strong>
      </label>
      <input
        className={styles.rangeInput}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onChange={handleOnChangeInput}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}

export default RangeInput;
