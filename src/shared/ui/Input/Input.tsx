import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type JSX,
  useId,
} from 'react';
import styles from './input.module.css';

type InputSize = 'sm' | 'md' | 'lg';

type InputProps = {
  disabled?: boolean;
  handleOnChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  label: string;
  maxLength?: number;
  name?: string;
  pattern?: string;
  placeholder?: string;
  size?: InputSize;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  value: string;
};

function Input({
  disabled,
  handleOnChange,
  inputMode,
  label,
  maxLength,
  name,
  pattern,
  placeholder,
  size = 'md',
  type = 'text',
  value,
}: InputProps): JSX.Element {
  const inputId = useId();
  const containerClass = `${styles.inputContainer} ${styles[size]}`;

  return (
    <div className={containerClass}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        className={styles.input}
        disabled={disabled}
        id={inputId}
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onChange={handleOnChange}
        pattern={pattern}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      <fieldset aria-hidden="true" className={styles.fieldset}>
        <legend className={styles.legend}>
          <span>{label}</span>
        </legend>
      </fieldset>
    </div>
  );
}

export default Input;
