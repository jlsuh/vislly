import type { JSX } from 'react';
import BrandLogo from '../BrandLogo/BrandLogo';
import GithubButton from '../GithubButton/GithubButton';
import styles from './header.module.css';

function Header(): JSX.Element {
  return (
    <header>
      <div className={styles.header}>
        <div className={styles.header__leftContainer}>
          <BrandLogo />
        </div>
        <div className={styles.header__rightContainer}>
          <GithubButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
