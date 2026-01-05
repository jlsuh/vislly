import type { JSX } from 'react';
import styles from './divider.module.css';

type DividerProps = {
  paddingVertical?: 'sm' | 'md' | 'big';
};

export function Divider({
  paddingVertical = 'big',
}: DividerProps): JSX.Element {
  return <div className={`${styles.divider} ${styles[paddingVertical]}`} />;
}
