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

export {
  EMPTY,
  END,
  START,
  WALL,
  type PathfindingNodeKey,
  type PathfindingNodeKeyFirstChar,
  type PathfindingSpecialNodeKey,
};
