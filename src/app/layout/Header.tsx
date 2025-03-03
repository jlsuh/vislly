import type { JSX } from 'react';
import BrandLogo from '../ui/BrandLogo/BrandLogo.tsx';
import SidebarToggleButton from '../ui/SidebarToggleIconButton/SidebarToggleIconButton.tsx';
import ThemeSelect from '../ui/ThemeSelect/ThemeSelect.tsx';
import styles from './header.module.css';

function Header(): JSX.Element {
  return (
    <header>
      <div className={styles.header}>
        <div className={styles.leftContainer}>
          <SidebarToggleButton />
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
