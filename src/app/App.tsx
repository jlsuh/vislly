import type { JSX, PropsWithChildren } from 'react';
import styles from './app.module.css';
import BrandLogo from './ui/BrandLogo/BrandLogo.tsx';
import BurgerIcon from './ui/BurgerIcon/BurgerIcon.tsx';
import CloseIcon from './ui/CloseIcon/CloseIcon.tsx';
import IconButton from './ui/IconButton/IconButton.tsx';
import ThemeSelect from './ui/ThemeSelect/ThemeSelect.tsx';

function App({ children }: PropsWithChildren): JSX.Element {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.leftContainer}>
            <IconButton
              inputID="sidebar-toggle-icon-button"
              sxInput={styles.input}
              sxLabel={styles.label}
            >
              <BurgerIcon sx={styles.burgerIcon} />
              <CloseIcon sx={styles.closeIcon} />
            </IconButton>
            <BrandLogo />
          </div>
          <div className={styles.rightContainer}>
            <ThemeSelect />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <nav className={styles.sidebar}>
          <ul>
            <li>
              <span>Home</span>
            </li>
            <li>
              <span className="">Profile</span>
            </li>
            <li>
              <span className="">Contact</span>
            </li>
          </ul>
        </nav>
        <div className={styles.content}>{children}</div>
      </main>
    </>
  );
}

export default App;
