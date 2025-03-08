import type { JSX, PropsWithChildren } from 'react';
import BrandLogo from '../ui/BrandLogo/BrandLogo.tsx';
import SidebarIconButton from '../ui/SidebarIconButton/SidebarIconButton.tsx';
import ThemeSelect from '../ui/ThemeSelect/ThemeSelect.tsx';
import styles from './app.module.css';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.leftContainer}>
            <SidebarIconButton sxInput={styles.input} />
            <BrandLogo />
          </div>
          <div className={styles.rightContainer}>
            <ThemeSelect />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <nav className={styles.sidebar}>
          <ul className={styles.sidebarList}>
            <li>
              <span>Home</span>
            </li>
            <li>
              <span>Profile</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Last</span>
            </li>
          </ul>
        </nav>
        <div className={styles.content}>{children}</div>
      </main>
      <footer className={styles.footer}>
        <p>© 2025</p>
        <p>All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
