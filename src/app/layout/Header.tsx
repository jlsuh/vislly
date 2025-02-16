import type { JSX } from 'react';
import ThemeSelect from '../providers/ui/theme/ThemeSelect';
import BrandLogo from './BrandLogo';
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
