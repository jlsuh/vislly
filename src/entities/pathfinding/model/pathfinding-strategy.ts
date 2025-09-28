import type { ReadonlyDeep } from 'type-fest';
import type { HeuristicsName } from './heuristics.ts';
import { START, type Vertex, WALL } from './vertex.ts';

type PathfindingAlgorithm = 'a-star' | 'bfs' | 'dijkstra' | 'gbfs';
type Step = { row: number; col: number };

const OrthogonalCardinalDirections: ReadonlyDeep<Step[]> = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: -1 },
];
const DiagonalCardinalDirections: ReadonlyDeep<Step[]> = [
  { row: -1, col: -1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
  { row: -1, col: 1 },
];

abstract class PathfindingStrategy {
  private isWithinBounds(
    row: number,
    col: number,
    gridRows: number,
    gridCols: number,
  ): boolean {
    return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
  }

  private composeOrthogonalizedDirections({ row, col }: Step): Step[] {
    return [
      { row, col: 0 },
      { row: 0, col },
    ];
  }

  private shouldSkipDiagonalStep(
    grid: Vertex[][],
    vertex: Vertex,
    dir: Step,
  ): boolean {
    const [o1, o2] = this.composeOrthogonalizedDirections(dir);
    const o1Row = vertex.row + o1.row;
    const o1Col = vertex.col + o1.col;
    if (!this.isWithinBounds(o1Row, o1Col, grid.length, grid[0].length)) {
      return true;
    }
    const o2Row = vertex.row + o2.row;
    const o2Col = vertex.col + o2.col;
    if (!this.isWithinBounds(o2Row, o2Col, grid.length, grid[0].length)) {
      return true;
    }
    if (grid[o1Row][o1Col].name === WALL && grid[o2Row][o2Col].name === WALL) {
      return true;
    }
    return false;
  }

  private isDiagonalMovement(row: number, col: number): boolean {
    return Math.abs(row) === 1 && Math.abs(col) === 1;
  }

  public composeNeighbors(
    grid: Vertex[][],
    vertex: Vertex,
    isDiagonalAllowed: boolean,
  ): Vertex[] {
    const directions: Step[] = [...OrthogonalCardinalDirections];
    if (isDiagonalAllowed) {
      directions.push(...DiagonalCardinalDirections);
    }
    const neighbors: Vertex[] = [];
    for (const dir of directions) {
      const dRow = vertex.row + dir.row;
      const dCol = vertex.col + dir.col;
      if (!this.isWithinBounds(dRow, dCol, grid.length, grid[0].length)) {
        continue;
      }
      const neighbor = grid[dRow][dCol];
      if (neighbor.name === WALL || neighbor.name === START) {
        continue;
      }
      if (
        this.isDiagonalMovement(dir.row, dir.col) &&
        this.shouldSkipDiagonalStep(grid, vertex, dir)
      ) {
        continue;
      }
      neighbors.push(neighbor);
    }
    return neighbors;
  }

  public reconstructPath(
    previous: Map<Vertex, Vertex | null>,
    start: Vertex,
    end: Vertex,
  ): Vertex[] {
    const path: Vertex[] = [];
    let current: Vertex | null = end;
    while (current !== start) {
      if (current === null) {
        throw new Error('Current vertex is null, path reconstruction failed');
      }
      path.unshift(current);
      current = previous.get(current) ?? null;
    }
    path.unshift(start);
    return path;
  }

  public abstract generator({
    end,
    grid,
    heuristicsName,
    isDiagonalAllowed,
    start,
  }: {
    end: Vertex;
    grid: Vertex[][];
    heuristicsName?: HeuristicsName;
    isDiagonalAllowed: boolean;
    start: Vertex;
  }): Generator<Vertex[], Vertex[]>;
}

export { PathfindingStrategy, type PathfindingAlgorithm };
