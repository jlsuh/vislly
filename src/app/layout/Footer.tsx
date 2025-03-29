import type { JSX } from 'react';
import styles from './footer.module.css';

function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <span className={styles.copyrightNotice}>
          Copyright &copy; 2025 Joel Suh. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
