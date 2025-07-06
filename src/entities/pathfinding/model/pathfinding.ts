import type { ReadonlyDeep, StringSlice } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

const INITIAL_COORDINATE = -1;

type PathfindingNodeKey =
  | typeof WALL
  | typeof EMPTY
  | typeof END
  | typeof START;
type PathfindingSpecialNodeKey = Extract<
  PathfindingNodeKey,
  typeof END | typeof START
>;
type PathfindingNodeKeyFirstChar = StringSlice<PathfindingNodeKey, 0, 1>;

class PathfindingNode {
  public readonly row: number;
  public readonly col: number;
  public pathfindingNodeStrategy: ReadonlyDeep<PathfindingNodeStrategy>;

  public constructor(
    row: number,
    col: number,
    pathfindingNodeStrategy: ReadonlyDeep<PathfindingNodeStrategy>,
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

abstract class PathfindingNodeStrategy {
  public readonly value: PathfindingNodeKey;

  public constructor(value: PathfindingNodeKey) {
    PathfindingNodeStrategy.assertIsNode(value);
    this.value = value;
  }

  private isNode(value: string): value is PathfindingNodeKey {
    return (
      value === EMPTY || value === END || value === START || value === WALL
    );
  }

  private isSpecialNode(value: string): value is PathfindingSpecialNodeKey {
    return value === END || value === START;
  }

  public static assertIsNode(
    value: string,
  ): asserts value is PathfindingNodeKey {
    if (!PathfindingNodeStrategy.prototype.isNode(value)) {
      throw new Error(`Invalid node: ${value}`);
    }
  }

  public static assertIsSpecialNode(
    value: string,
  ): asserts value is PathfindingSpecialNodeKey {
    if (!PathfindingNodeStrategy.prototype.isSpecialNode(value)) {
      throw new Error(`Invalid special node: ${value}`);
    }
  }

  public getFirstChar(): PathfindingNodeKeyFirstChar {
    return this.value.charAt(0) as PathfindingNodeKeyFirstChar;
  }

  public abstract isSpecial(): boolean;
}

class PathfindingStartNodeStrategy extends PathfindingNodeStrategy {
  public isSpecial(): boolean {
    return true;
  }
}

class PathfindingEndNodeStrategy extends PathfindingNodeStrategy {
  public isSpecial(): boolean {
    return true;
  }
}

class PathfindingEmptyNodeStrategy extends PathfindingNodeStrategy {
  public isSpecial(): boolean {
    return false;
  }
}

class PathfindingWallNodeStrategy extends PathfindingNodeStrategy {
  public isSpecial(): boolean {
    return false;
  }
}

const NODE_STRATEGIES: ReadonlyDeep<
  Record<PathfindingNodeKey, PathfindingNodeStrategy>
> = {
  empty: new PathfindingEmptyNodeStrategy(EMPTY),
  end: new PathfindingEndNodeStrategy(END),
  start: new PathfindingStartNodeStrategy(START),
  wall: new PathfindingWallNodeStrategy(WALL),
};

export {
  EMPTY,
  END,
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  PathfindingNode,
  PathfindingNodeStrategy,
  START,
  WALL,
  type PathfindingNodeKey,
  type PathfindingNodeKeyFirstChar,
  type PathfindingSpecialNodeKey,
};
