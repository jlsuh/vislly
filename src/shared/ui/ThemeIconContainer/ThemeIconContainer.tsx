import type { JSX, PropsWithChildren } from 'react';
import styles from './theme-icon-container.module.css';

function ThemeIconContainer({ children }: PropsWithChildren): JSX.Element {
  return <span className={styles.themeIconContainer}>{children}</span>;
}

export default ThemeIconContainer;
