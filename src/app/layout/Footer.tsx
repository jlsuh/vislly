import type { JSX } from 'react';
import styles from './footer.module.css';

type FooterProps = {
  sxFooter: string;
};

function Footer({ sxFooter }: FooterProps): JSX.Element {
  return (
    <footer className={sxFooter}>
      <div className={styles.footerContainer}>
        <span className={styles.copyrightNotice}>
          Copyright &copy; 2025 Joel Suh. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
