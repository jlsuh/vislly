import type { JSX } from 'react';
import BrandLogo from '../ui/BrandLogo/BrandLogo.tsx';
import GithubIconButton from '../ui/GithubIconButton/GithubIconButton.tsx';
import SidebarIconButton from '../ui/SidebarIconButton/SidebarIconButton.tsx';
import ThemeSelect from '../ui/ThemeSelect/ThemeSelect.tsx';
import styles from './header.module.css';

type HeaderProps = {
  sxHeader: string;
  sxInput: string;
};

function Header({ sxHeader, sxInput }: HeaderProps): JSX.Element {
  return (
    <header className={`${styles.header} ${sxHeader}`}>
      <div className={styles.headerContainer}>
        <div className={styles.leftContainer}>
          <SidebarIconButton sxInput={sxInput} />
          <BrandLogo />
        </div>
        <div className={styles.rightContainer}>
          <ThemeSelect />
          <GithubIconButton href="https://github.com/jlsuh/vislly" />
        </div>
      </div>
    </header>
  );
}

export default Header;
