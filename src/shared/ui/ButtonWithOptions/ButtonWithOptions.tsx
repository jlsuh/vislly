import type { ChangeEvent, JSX, ReactNode } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { Option } from '@/shared/model/option.ts';
import styles from './button-with-options.module.css';

type ButtonWithOptionsTheme = 'adaptive' | 'light' | 'dark';

type ButtonWithOptionsProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  label: string;
  options: ReadonlyDeep<Option[]>;
  selectedOption: Option;
  theme?: ButtonWithOptionsTheme;
  handleOnChangeOption: (option: Option) => void;
  handleOnClickButton: () => void;
};

function ButtonWithOptions({
  disabled,
  fullWidth = false,
  icon,
  label,
  options,
  selectedOption,
  theme = 'adaptive',
  handleOnChangeOption,
  handleOnClickButton,
}: ButtonWithOptionsProps): JSX.Element {
  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const option = options.find((opt) => opt.value === e.target.value);
    if (!option) {
      throw new Error(
        `Selected option ${e.target.value} is not a valid option.`,
      );
    }
    handleOnChangeOption(option);
  };

  const themeClass =
    theme === 'light'
      ? styles.themeLight
      : theme === 'dark'
        ? styles.themeDark
        : '';
  const containerClassName =
    `${styles.container} ${fullWidth ? styles.fullWidth : ''} ${themeClass}`.trim();

  return (
    <div className={containerClassName}>
      <button
        className={styles.actionButton}
        disabled={disabled}
        onClick={handleOnClickButton}
        type="button"
      >
        {icon && <span className={styles.iconWrapper}>{icon}</span>}
        <span className={styles.label}>{label}</span>
      </button>
      <div className={styles.selectWrapper}>
        <select
          aria-label="Select format"
          className={styles.select}
          disabled={disabled}
          onChange={onChange}
          value={selectedOption.value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ButtonWithOptions;
