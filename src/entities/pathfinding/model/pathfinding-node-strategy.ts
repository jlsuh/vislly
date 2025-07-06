import type { ReadonlyDeep } from 'type-fest';
import {
  EMPTY,
  END,
  type PathfindingNodeKey,
  type PathfindingNodeKeyFirstChar,
  type PathfindingSpecialNodeKey,
  START,
  WALL,
} from './pathfinding.ts';

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

export { NODE_STRATEGIES, PathfindingNodeStrategy };
