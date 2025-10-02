import type { JSX } from 'react';
import styles from './divider.module.css';

export function Divider(): JSX.Element {
  return <div className={styles.divider} />;
}
