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
  helperText?: string;
  helperTextVariant?: 'default' | 'warning' | 'error';
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
  characterCount,
  disabled,
  handleOnChange,
  helperText,
  helperTextVariant = 'default',
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
  const wrapperClass = `${styles.inputWrapper} ${styles[size]}`;
  const helperClass = `${styles.helperText} ${styles[helperTextVariant]}`;
  const showFooter = helperText || characterCount;

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
      {showFooter && (
        <div className={styles.footer}>
          <span className={helperClass}>{helperText ?? ''}</span>
          {characterCount && (
            <span className={styles.characterCount}>{characterCount}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default Input;
