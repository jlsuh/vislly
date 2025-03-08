import type { JSX, PropsWithChildren } from 'react';
import Header from './Header.tsx';
import Main from './Main.tsx';
import styles from './app.module.css';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <Header sxHeader={styles.header} sxInput={styles.input} />
      <Main
        sxContent={styles.content}
        sxMain={styles.main}
        sxSidebar={styles.sidebar}
      >
        {children}
      </Main>
      <footer className={styles.footer}>
        <p>© 2025</p>
        <p>All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
