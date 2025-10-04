import type { JSX } from 'react';
import Pathfinding from '@/entities/pathfinding/ui/Pathfinding.tsx';
import styles from './page.module.css';

export default function Page(): JSX.Element {
  return (
    <article className={styles.pathfindingArticle}>
      <h1>Pathfinding</h1>
      <Pathfinding />
    </article>
  );
}
