import type { JSX, PropsWithChildren } from 'react';
import styles from './main.module.css';

type MainProps = PropsWithChildren;

function Main({ children }: MainProps): JSX.Element {
  return <main className={styles.main}>{children}</main>;
}

export default Main;
