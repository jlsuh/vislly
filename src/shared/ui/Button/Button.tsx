import type { JSX } from 'react';
import styles from './button.module.css';

interface ButtonProps {
  disabled?: boolean;
  fullWidth?: boolean;
  handleOnClickButton: () => void;
  icon: JSX.Element;
  label: string;
}

function Button({
  disabled = false,
  fullWidth = false,
  handleOnClickButton,
  icon,
  label,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.playButton} elevation-1 ${fullWidth ? styles.fullWidth : ''}`}
      disabled={disabled}
      onClick={handleOnClickButton}
      type="button"
    >
      {icon}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

export default Button;
