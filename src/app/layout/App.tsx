import type { JSX, PropsWithChildren } from 'react';
import styles from './app.module.css';
import Footer from './Footer.tsx';
import Header from './Header.tsx';
import Main from './Main.tsx';
import NavigationList from './NavigationList.tsx';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <Header sxHeader={styles.header} sxInput={styles.input} />
      <div className={styles.mainContainer}>
        <nav className={styles.sidebar}>
          <NavigationList />
        </nav>
        <Main sxContent={styles.content} sxMain={styles.main}>
          {children}
        </Main>
      </div>
      <Footer sxFooter={styles.footer} />
    </>
  );
}

export default App;
