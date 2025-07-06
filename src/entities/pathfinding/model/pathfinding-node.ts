import type {
  PathfindingNodeKey,
  PathfindingNodeKeyFirstChar,
} from './pathfinding.ts';
import type { PathfindingNodeStrategy } from './pathfinding-node-strategy.ts';

const INITIAL_COORDINATE = -1;

class PathfindingNode {
  public readonly row: number;
  public readonly col: number;
  public readonly pathfindingNodeStrategy: PathfindingNodeStrategy;

  public constructor(
    row: number,
    col: number,
    pathfindingNodeStrategy: PathfindingNodeStrategy,
  ) {
    this.pathfindingNodeStrategy = pathfindingNodeStrategy;
    this.row = row;
    this.col = col;
  }

  public appearsOnGrid(): boolean {
    return this.row !== INITIAL_COORDINATE && this.col !== INITIAL_COORDINATE;
  }

  public getFirstChar(): PathfindingNodeKeyFirstChar {
    return this.pathfindingNodeStrategy.getFirstChar();
  }

  public isSpecial(): boolean {
    return this.pathfindingNodeStrategy.isSpecial();
  }

  public get value(): PathfindingNodeKey {
    return this.pathfindingNodeStrategy.value;
  }
}

export { INITIAL_COORDINATE, PathfindingNode };
