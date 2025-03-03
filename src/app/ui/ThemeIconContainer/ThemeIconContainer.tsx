import type { JSX, PropsWithChildren } from 'react';
import styles from './theme-icon-container.module.css';

type ThemeIconContainerProps = PropsWithChildren;

function ThemeIconContainer({
  children,
}: ThemeIconContainerProps): JSX.Element {
  return <span className={styles.themeIconContainer}>{children}</span>;
}

export default ThemeIconContainer;
