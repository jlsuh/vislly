import type { ReadonlyDeep } from 'type-fest';
import {
  assertIsNodeKey,
  EMPTY,
  END,
  type PathfindingNodeKey,
  type PathfindingNodeKeyFirstChar,
  START,
  WALL,
} from './pathfinding.ts';

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

export { NODE_STRATEGIES, PathfindingNodeStrategy };
