import type { JSX } from 'react';
import BrandLogo from '@/shared/ui/BrandLogo/BrandLogo.tsx';
import GithubIconButton from '@/shared/ui/GithubIconButton/GithubIconButton.tsx';
import ThemeProvider from '../providers/ThemeProvider.tsx';
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
          <ThemeProvider>
            <ThemeSelect />
          </ThemeProvider>
          <GithubIconButton href="https://github.com/jlsuh/vislly" />
        </div>
      </div>
    </header>
  );
}

export default Header;
