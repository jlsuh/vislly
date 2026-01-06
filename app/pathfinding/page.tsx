import type { JSX } from 'react';
import Pathfinding from '@/entities/pathfinding/ui/Pathfinding.tsx';
import styles from './page.module.css';

function PathfindingPage(): JSX.Element {
  return (
    <article className={styles.pathfindingArticle}>
      <h1>Pathfinding</h1>
      <Pathfinding />
    </article>
  );
}

export default PathfindingPage;
