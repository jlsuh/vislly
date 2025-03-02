import type { JSX } from 'react';
import IconButton from '../IconButton/IconButton.tsx';
import styles from './burger-button.module.css';

function BurgerButton(): JSX.Element {
  return (
    <IconButton inputID="burger-icon-button" inputStyles={styles.burgerInput}>
      <svg
        aria-hidden="true"
        className={styles.burgerIcon}
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
      <svg
        aria-hidden="true"
        className={styles.closeIcon}
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </IconButton>
  );
}

export default BurgerButton;
