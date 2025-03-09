import type { JSX, PropsWithChildren } from 'react';
import NavigationList from './NavigationList.tsx';
import styles from './main.module.css';

type MainProps = PropsWithChildren<{
  sxContent: string;
  sxMain: string;
  sxSidebar: string;
}>;

function Main({
  children,
  sxContent,
  sxMain,
  sxSidebar,
}: MainProps): JSX.Element {
  return (
    <main className={`${styles.main} ${sxMain}`}>
      <nav className={`${styles.sidebar} ${sxSidebar}`}>
        <NavigationList />
      </nav>
      <div className={`${styles.content} ${sxContent}`}>{children}</div>
    </main>
  );
}

export default Main;
