import type { ReadonlyDeep, StringSlice } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

type NodeTypeKey = typeof WALL | typeof EMPTY | typeof END | typeof START;
type NodeOfInterest = Extract<NodeTypeKey, typeof END | typeof START>;
type NodeTypeKeyFirstChar = StringSlice<NodeTypeKey, 0, 1>;

const INITIAL_COORDINATE = -1;

class PathfindingNode {
  public row: number;
  public col: number;
  public pathfindingNodeStrategy: PathfindingNodeStrategy;

  public constructor(
    row: number,
    col: number,
    pathfindingNodeStrategy: PathfindingNodeStrategy,
  ) {
    this.pathfindingNodeStrategy = pathfindingNodeStrategy;
    this.row = row;
    this.col = col;
  }

  public eliminateFromGrid(): void {
    this.row = INITIAL_COORDINATE;
    this.col = INITIAL_COORDINATE;
  }

  public positionEquals(that: PathfindingNode): boolean {
    return this.row === that.row && this.col === that.col;
  }

  public appearsOnGrid(): boolean {
    return this.row !== INITIAL_COORDINATE && this.col !== INITIAL_COORDINATE;
  }

  public getFirstChar(): NodeTypeKeyFirstChar {
    return this.pathfindingNodeStrategy.getFirstChar();
  }

  public isNodeOfInterest(): boolean {
    return this.pathfindingNodeStrategy.isNodeOfInterest();
  }

  public get value(): NodeTypeKey {
    return this.pathfindingNodeStrategy.value;
  }
}

abstract class PathfindingNodeStrategy {
  public value: NodeTypeKey;

  public constructor(value: NodeTypeKey) {
    assertIsNodeTypeKey(value);
    this.value = value;
  }

  public getFirstChar(): NodeTypeKeyFirstChar {
    return this.value.charAt(0) as NodeTypeKeyFirstChar;
  }

  public abstract isNodeOfInterest(): boolean;
}

class PathfindingStartNodeStrategy extends PathfindingNodeStrategy {
  public isNodeOfInterest(): boolean {
    return true;
  }
}

class PathfindingEndNodeStrategy extends PathfindingNodeStrategy {
  public isNodeOfInterest(): boolean {
    return true;
  }
}

class PathfindingEmptyNodeStrategy extends PathfindingNodeStrategy {
  public isNodeOfInterest(): boolean {
    return false;
  }
}

class PathfindingWallNodeStrategy extends PathfindingNodeStrategy {
  public isNodeOfInterest(): boolean {
    return false;
  }
}

const NODE_STRATEGIES: ReadonlyDeep<
  Record<NodeTypeKey, PathfindingNodeStrategy>
> = {
  empty: new PathfindingEmptyNodeStrategy(EMPTY),
  end: new PathfindingEndNodeStrategy(END),
  start: new PathfindingStartNodeStrategy(START),
  wall: new PathfindingWallNodeStrategy(WALL),
};

function isNodeType(value: string): value is NodeTypeKey {
  return value === EMPTY || value === END || value === START || value === WALL;
}

function assertIsNodeTypeKey(value: string): asserts value is NodeTypeKey {
  if (!isNodeType(value)) {
    throw new Error(`Invalid node type: ${value}`);
  }
}

function assertIsNodeOfInterest(
  value: string,
): asserts value is NodeOfInterest {
  if (value !== END && value !== START) {
    throw new Error(`Invalid node of interest: ${value}`);
  }
}

export {
  assertIsNodeOfInterest,
  assertIsNodeTypeKey,
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  PathfindingEmptyNodeStrategy,
  PathfindingEndNodeStrategy,
  PathfindingNode,
  PathfindingStartNodeStrategy,
  PathfindingWallNodeStrategy,
  type NodeOfInterest,
  type NodeTypeKey,
  type PathfindingNodeStrategy,
};
