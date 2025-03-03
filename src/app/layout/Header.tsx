import type { JSX } from 'react';
import BrandLogo from '../ui/BrandLogo/BrandLogo.tsx';
import BurgerButton from '../ui/BurgerButton/BurgerButton.tsx';
import ThemeSelect from '../ui/ThemeSelect/ThemeSelect.tsx';
import styles from './header.module.css';

function Header(): JSX.Element {
  return (
    <header>
      <div className={styles.header}>
        <div className={styles.leftContainer}>
          <BurgerButton />
          <BrandLogo />
        </div>
        <div className={styles.rightContainer}>
          <ThemeSelect />
        </div>
      </div>
    </header>
  );
}

export default Header;
