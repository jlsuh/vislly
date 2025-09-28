import { PriorityQueue } from '@/shared/lib/priority-queue.ts';
import { Heuristics, type HeuristicsName } from './heuristics.ts';
import { PathfindingStrategy } from './pathfinding-strategy.ts';
import type { Vertex } from './vertex.ts';

class GreedyBestFirstSearchStrategy extends PathfindingStrategy {
  private processNeighbor({
    closed,
    current,
    end,
    heuristicsName,
    neighbor,
    open,
    parent,
  }: {
    closed: Set<Vertex>;
    current: Vertex;
    end: Vertex;
    heuristicsName: HeuristicsName;
    neighbor: Vertex;
    open: PriorityQueue<Vertex>;
    parent: Map<Vertex, Vertex | null>;
  }): void {
    if (closed.has(neighbor)) {
      return;
    }
    const priority = Heuristics[heuristicsName](neighbor, end);
    open.enqueue(neighbor, priority);
    parent.set(neighbor, current);
    closed.add(neighbor);
  }

  public *generator({
    end,
    grid,
    heuristicsName,
    isDiagonalAllowed,
    start,
  }: {
    end: Vertex;
    grid: Vertex[][];
    heuristicsName: HeuristicsName;
    isDiagonalAllowed: boolean;
    start: Vertex;
  }): Generator<Vertex[], Vertex[]> {
    const open = new PriorityQueue<Vertex>([
      { item: start, priority: Heuristics[heuristicsName](start, end) },
    ]);
    const closed = new Set<Vertex>([start]);
    const parent = new Map<Vertex, Vertex | null>(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    while (!open.empty()) {
      const current =
        open.dequeue() ??
        (() => {
          throw new Error('PriorityQueue is empty');
        })();
      yield [...closed];
      if (current.positionEquals(end)) {
        return super.reconstructPath(parent, start, current);
      }
      const neighbors = super.composeNeighbors(
        grid,
        current,
        isDiagonalAllowed,
      );
      for (const neighbor of neighbors) {
        this.processNeighbor({
          closed,
          current,
          end,
          heuristicsName,
          neighbor,
          open,
          parent,
        });
      }
    }
    throw new Error('Greedy Best-First Search: No path found');
  }
}

export { GreedyBestFirstSearchStrategy };
