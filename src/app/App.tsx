import Sidebar from '@/shared/ui/Sidebar/Sidebar.tsx';
import type { JSX, PropsWithChildren } from 'react';
import styles from './app.module.css';
import Header from './layout/Header.tsx';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Sidebar />
        <div className={styles.content}>{children}</div>
      </main>
    </>
  );
}

export default App;
