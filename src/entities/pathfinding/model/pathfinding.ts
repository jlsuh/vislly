import type { StringSlice } from 'type-fest';

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
  EMPTY,
  END,
  START,
  WALL,
  type PathfindingNodeKey,
  type PathfindingNodeKeyFirstChar,
  type PathfindingSpecialNodeKey,
};
