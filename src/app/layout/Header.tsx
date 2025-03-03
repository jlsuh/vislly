import BrandLogo from '@/shared/ui/BrandLogo/BrandLogo';
import BurgerButton from '@/shared/ui/BurgerButton/BurgerButton.tsx';
import type { JSX } from 'react';
import ThemeSelectAdapter from '../ui/ThemeSelectAdapter.tsx';
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
          <ThemeSelectAdapter />
        </div>
      </div>
    </header>
  );
}

export default Header;
