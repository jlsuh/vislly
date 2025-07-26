import { Queue } from '@/shared/lib/queue.ts';
import { PathfindingStrategy } from './pathfinding-strategy.ts';
import type { Vertex } from './vertex.ts';

class BfsStrategy extends PathfindingStrategy {
  public *generator(
    grid: Vertex[][],
    start: Vertex,
    end: Vertex,
    isDiagonalAllowed: boolean,
  ): Generator<Vertex[], Vertex[]> {
    const open: Queue<Vertex> = new Queue([start]);
    const closed: Set<Vertex> = new Set([start]);
    const previous: Map<Vertex, Vertex | null> = new Map(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
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
        previous.set(neighbor, current);
        if (neighbor.name === end.name) {
          return super.reconstructPath(previous, start, neighbor);
        }
        open.enqueue(neighbor);
        closed.add(neighbor);
        yield [...closed];
      }
    }
    throw new Error('BFS: No path found');
  }
}

export { BfsStrategy };
