import type { JSX } from 'react';
import styles from './button.module.css';

interface ButtonProps {
  disabled?: boolean;
  fullWidth?: boolean;
  icon: JSX.Element;
  label: string;
  variant?: 'primary' | 'secondary';
  handleOnClickButton: () => void;
}

function Button({
  disabled = false,
  fullWidth = false,
  icon,
  label,
  variant = 'primary',
  handleOnClickButton,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`}
      disabled={disabled}
      onClick={handleOnClickButton}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default Button;
