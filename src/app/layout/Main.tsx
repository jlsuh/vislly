import type { JSX, PropsWithChildren } from 'react';
import styles from './main.module.css';

type MainProps = PropsWithChildren<{
  sxContent: string;
  sxMain: string;
}>;

function Main({ children, sxContent, sxMain }: MainProps): JSX.Element {
  return (
    <main className={`${styles.main} ${sxMain}`}>
      <div className={`${styles.content} ${sxContent}`}>{children}</div>
    </main>
  );
}

export default Main;
