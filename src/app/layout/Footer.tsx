import type { JSX } from 'react';
import styles from './footer.module.css';

function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <span className={styles.copyrightNotice}>
          Copyright &copy; {currentYear} Joel Suh. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
