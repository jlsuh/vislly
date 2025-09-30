'use client';

import type { JSX } from 'react';
import styles from './button.module.css';

interface ButtonProps {
  fullWidth?: boolean;
  handleOnClickButton: () => void;
  icon: JSX.Element;
  label: string;
}

function Button({
  fullWidth = false,
  handleOnClickButton,
  icon,
  label,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`elevation-1 ${styles.playButton} ${fullWidth && styles.fullWidth}`}
      onClick={handleOnClickButton}
      type="button"
    >
      {icon}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

export default Button;
