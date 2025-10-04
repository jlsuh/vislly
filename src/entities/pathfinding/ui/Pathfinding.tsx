import type { JSX } from 'react';
import PathfindingControls from './PathfindingControls.tsx';
import PathfindingGrid from './PathfindingGrid.tsx';
import PathfindingProvider from './PathfindingProvider.tsx';
import styles from './pathfinding-container.module.css';

export default function Pathfinding(): JSX.Element {
  return (
    <div className={styles.pathfindingContainer}>
      <PathfindingProvider>
        <PathfindingGrid />
        <PathfindingControls />
      </PathfindingProvider>
    </div>
  );
}
