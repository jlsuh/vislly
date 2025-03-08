import type { JSX } from 'react';
import styles from './footer.module.css';

type FooterProps = {
  sxFooter: string;
};

function Footer({ sxFooter }: FooterProps): JSX.Element {
  return (
    <footer className={`${styles.footer} ${sxFooter}`}>
      <p>© 2025</p>
      <p>All rights reserved.</p>
    </footer>
  );
}

export default Footer;
