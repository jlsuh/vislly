import type { JSX } from 'react';
import styles from './footer.module.css';

function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();
  const lastDeployDate = process.env.NEXT_PUBLIC_LAST_DEPLOY_DATE;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <span className={styles.copyrightNotice}>
          Copyright &copy; {currentYear} Joel Suh
        </span>
        {lastDeployDate && (
          <span className={styles.deployNotice}>
            Last deploy: {lastDeployDate}
          </span>
        )}
      </div>
    </footer>
  );
}

export default Footer;
