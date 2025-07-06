import type { JSX } from 'react';
import PathfindingGrid from '@/entities/pathfinding/ui/PathfindingGrid';

export default function Page(): JSX.Element {
  return (
    <article>
      <h1>Pathfinding</h1>
      <PathfindingGrid />
    </article>
  );
}
