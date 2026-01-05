import type { ButtonHTMLAttributes, JSX } from 'react';
import styles from './button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  icon?: JSX.Element;
  label: string;
  variant?: 'primary' | 'secondary';
}

function Button({
  disabled = false,
  fullWidth = false,
  icon,
  label,
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`}
      disabled={disabled}
      type="button"
      {...props}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default Button;
