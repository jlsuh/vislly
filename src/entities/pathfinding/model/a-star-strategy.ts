import { PriorityQueue } from '@/shared/lib/priority-queue.ts';
import { Heuristics, type HeuristicsName } from './heuristics.ts';
import { PathfindingStrategy } from './pathfinding-strategy';
import type { Vertex } from './vertex';

class AStarStrategy extends PathfindingStrategy {
  private processNeighbor({
    current,
    neighbor,
    end,
    open,
    closed,
    parent,
    gScore,
    heuristicsName,
  }: {
    current: Vertex;
    neighbor: Vertex;
    end: Vertex;
    open: PriorityQueue<Vertex>;
    closed: Set<Vertex>;
    parent: Map<Vertex, Vertex | null>;
    gScore: Map<Vertex, number>;
    heuristicsName: HeuristicsName;
  }): void {
    if (closed.has(neighbor)) {
      return;
    }
    const tentativeGScore = (gScore.get(current) ?? Infinity) + neighbor.weight;
    if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
      gScore.set(neighbor, tentativeGScore);
      const fScore =
        tentativeGScore + Heuristics[heuristicsName](neighbor, end);
      open.enqueue(neighbor, fScore);
      parent.set(neighbor, current);
    }
  }

  public *generator(
    grid: Vertex[][],
    start: Vertex,
    end: Vertex,
    isDiagonalAllowed: boolean,
    heuristicsName: HeuristicsName,
  ): Generator<Vertex[], Vertex[]> {
    const open = new PriorityQueue<Vertex>();
    const closed = new Set<Vertex>();
    const gScore = new Map<Vertex, number>(
      grid.flatMap((row) => row.map((vertex) => [vertex, Infinity])),
    );
    const parent = new Map<Vertex, Vertex | null>(
      grid.flatMap((row) => row.map((vertex) => [vertex, null])),
    );
    gScore.set(start, 0);
    open.enqueue(start, 0);
    while (!open.empty()) {
      const current =
        open.dequeue() ??
        (() => {
          throw new Error('PriorityQueue is empty');
        })();
      closed.add(current);
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
          current,
          neighbor,
          end,
          open,
          closed,
          parent,
          gScore,
          heuristicsName,
        });
      }
    }
    throw new Error('A*: No path found');
  }
}

export { AStarStrategy };
