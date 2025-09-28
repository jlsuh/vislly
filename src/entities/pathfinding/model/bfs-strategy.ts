import { Queue } from '@/shared/lib/queue.ts';
import { PathfindingStrategy } from './pathfinding-strategy.ts';
import type { Vertex } from './vertex.ts';

class BfsStrategy extends PathfindingStrategy {
  public *generator({
    end,
    grid,
    isDiagonalAllowed,
    start,
  }: {
    end: Vertex;
    grid: Vertex[][];
    isDiagonalAllowed: boolean;
    start: Vertex;
  }): Generator<Vertex[], Vertex[]> {
    const open: Queue<Vertex> = new Queue([start]);
    const closed: Set<Vertex> = new Set([start]);
    const parent: Map<Vertex, Vertex | null> = new Map(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    yield [...closed];
    while (!open.empty()) {
      const current =
        open.dequeue() ??
        (() => {
          throw new Error('Queue is empty');
        })();
      const neighbors = super.composeNeighbors(
        grid,
        current,
        isDiagonalAllowed,
      );
      for (const neighbor of neighbors) {
        if (closed.has(neighbor)) {
          continue;
        }
        parent.set(neighbor, current);
        open.enqueue(neighbor);
        closed.add(neighbor);
        yield [...closed];
        if (neighbor.name === end.name) {
          return super.reconstructPath(parent, start, neighbor);
        }
      }
    }
    throw new Error('BFS: No path found');
  }
}

export { BfsStrategy };
