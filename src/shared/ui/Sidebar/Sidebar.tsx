import type { JSX } from 'react';
import styles from './sidebar.module.css';

export default function Sidebar(): JSX.Element {
  return (
    <nav className={styles.sidebar}>
      <ul>
        <li>
          <span>Home</span>
        </li>
        <li>
          <span className="">Profile</span>
        </li>
        <li>
          <span className="">Contact</span>
        </li>
      </ul>
    </nav>
  );
}
