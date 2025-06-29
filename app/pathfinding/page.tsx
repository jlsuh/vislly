import type { JSX } from 'react';
import Pathfinding from '@/entities/pathfinding/ui/Pathfinding.tsx';

export default function Page(): JSX.Element {
  return (
    <article>
      <h1>Pathfinding</h1>
      <Pathfinding />
    </article>
  );
}
