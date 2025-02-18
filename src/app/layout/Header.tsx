import BrandLogo from '@/shared/ui/BrandLogo/BrandLogo';
import type { JSX } from 'react';
import ThemeSelect from './ThemeSelect';
import styles from './header.module.css';

function Header(): JSX.Element {
  return (
    <header>
      <div className={styles.header}>
        <div className={styles.leftContainer}>
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
