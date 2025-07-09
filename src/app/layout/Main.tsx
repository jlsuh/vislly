import type { JSX, PropsWithChildren } from 'react';
import styles from './main.module.css';

type MainProps = PropsWithChildren;

function Main({ children }: MainProps): JSX.Element {
  return (
    <main className={styles.main}>
      <div className={styles.content}>{children}</div>
    </main>
  );
}

export default Main;
