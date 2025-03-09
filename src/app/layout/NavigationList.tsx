import type { JSX } from 'react';
import styles from './navigation-list.module.css';

function NavigationList(): JSX.Element {
  return (
    <ul className={styles.sidebarList}>
      <li>Gallery</li>
    </ul>
  );
}

export default NavigationList;
