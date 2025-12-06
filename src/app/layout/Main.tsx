import type { JSX, PropsWithChildren } from 'react';
import styles from './main.module.css';

function Main({ children }: PropsWithChildren): JSX.Element {
  return <main className={styles.main}>{children}</main>;
}

export default Main;
