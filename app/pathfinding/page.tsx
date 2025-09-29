import type { JSX } from 'react';
import PathfindingGrid from '@/entities/pathfinding/ui/PathfindingGrid';
import styles from './page.module.css';

export default function Page(): JSX.Element {
  return (
    <article className={styles.pathfindingArticle}>
      <h1>Pathfinding</h1>
      <PathfindingGrid />
    </article>
  );
}
