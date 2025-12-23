import type { JSX } from 'react';
import BrandLogo from '@/shared/ui/BrandLogo/BrandLogo.tsx';
import CodebergButton from '@/shared/ui/CodebergButton/CodebergButton.tsx';
import ThemeSelect from '../ui/ThemeSelect/ThemeSelect.tsx';
import styles from './header.module.css';

function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.leftContainer}>
          <BrandLogo />
        </div>
        <div className={styles.rightContainer}>
          <ThemeSelect />
          <CodebergButton href="https://codeberg.org/jlsuh/vislly" />
        </div>
      </div>
    </header>
  );
}

export default Header;
