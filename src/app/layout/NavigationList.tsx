import PrefetchOnHoverLink from '@/shared/ui/PrefetchOnHoverLink/PrefetchOnHoverLink.tsx';
import type { JSX } from 'react';
import styles from './navigation-list.module.css';

function NavigationList(): JSX.Element {
  return (
    <ul className={styles.sidebarList}>
      <li>
        <PrefetchOnHoverLink href="/">Gallery</PrefetchOnHoverLink>
      </li>
    </ul>
  );
}

export default NavigationList;
