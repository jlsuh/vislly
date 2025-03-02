import type { JSX } from 'react';
import styles from './burger-button.module.css';

function BurgerButton(): JSX.Element {
  return (
    <label className={styles.burger} htmlFor="burger">
      <input className={styles.burgerInput} type="checkbox" id="burger" />
      <span className={styles.burgerSpan} />
      <span className={styles.burgerSpan} />
      <span className={styles.burgerSpan} />
    </label>
  );
}

export default BurgerButton;
