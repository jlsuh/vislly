import type { JSX } from 'react';
import styles from './button.module.css';

function concatClasses(...classes: string[]): string {
  return classes.join(' ');
}

function Button(): JSX.Element {
  return (
    <button
      className={concatClasses(styles.button)}
      type="button"
      onClick={() => console.log('asdfasdf')}
    >
      <span
        className={concatClasses(styles.icon, styles.icon_social_twitter)}
      />
      <span className={styles.button__text}>Twitter</span>
    </button>
  );
}

export default Button;
