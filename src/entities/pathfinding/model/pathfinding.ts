import type { ReadonlyDeep, StringSlice } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

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

abstract class PathfindingNodeStrategy {
  public readonly value: PathfindingNodeKey;

  public constructor(value: PathfindingNodeKey) {
    assertIsNodeKey(value);
    this.value = value;
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

function isNodeType(value: string): value is PathfindingNodeKey {
  return value === EMPTY || value === END || value === START || value === WALL;
}

function assertIsNodeKey(value: string): asserts value is PathfindingNodeKey {
  if (!isNodeType(value)) {
    throw new Error(`Invalid node type: ${value}`);
  }
}

function assertIsSpecialNodeKey(
  value: string,
): asserts value is PathfindingSpecialNodeKey {
  if (value !== END && value !== START) {
    throw new Error(`Invalid special node key: ${value}`);
  }
}

export {
  assertIsNodeKey,
  assertIsSpecialNodeKey,
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  PathfindingNode,
  type PathfindingNodeStrategy,
  type PathfindingSpecialNodeKey,
};
