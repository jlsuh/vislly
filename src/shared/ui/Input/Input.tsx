import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type JSX,
  useId,
} from 'react';
import styles from './input.module.css';

type InputSize = 'sm' | 'md' | 'lg';

type InputProps = {
  characterCount?: string;
  disabled?: boolean;
  handleOnChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  isError?: boolean;
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
  characterCount,
  disabled,
  handleOnChange,
  inputMode,
  isError = false,
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
  const wrapperClass = `${styles.inputWrapper} ${styles[size]} ${isError ? styles.error : ''}`;

  return (
    <div className={styles.container}>
      <div className={wrapperClass}>
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
      {characterCount && (
        <div className={styles.footer}>
          <span className={styles.characterCount}>{characterCount}</span>
        </div>
      )}
    </div>
  );
}

export default Input;
