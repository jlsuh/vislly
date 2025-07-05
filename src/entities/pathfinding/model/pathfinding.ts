import type { ReadonlyDeep } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

type NodeTypeKey = typeof WALL | typeof EMPTY | typeof END | typeof START;
type NodeOfInterest = Extract<NodeTypeKey, typeof END | typeof START>;
type NodeTypeKeyFirstChar =
  `${NodeTypeKey extends `${infer FirstChar}${string}` ? FirstChar : never}`;

class PathfindingNode {
  public row: number;
  public col: number;
  public value: NodeTypeKey;

  public constructor(row: number, col: number, value: NodeTypeKey) {
    assertIsNodeTypeKey(value);
    this.row = row;
    this.col = col;
    this.value = value;
  }

  public eliminateFromGrid(): void {
    this.row = -1;
    this.col = -1;
  }

  public positionEquals(that: PathfindingNode): boolean {
    return this.row === that.row && this.col === that.col;
  }

  public getFirstChar(): NodeTypeKeyFirstChar {
    return this.value.charAt(0) as NodeTypeKeyFirstChar;
  }

  public appearsOnGrid(): boolean {
    return this.row !== -1 && this.col !== -1;
  }

  private isEndNode(): boolean {
    return this.value === END;
  }

  private isStartNode(): boolean {
    return this.value === START;
  }

  public isNodeOfInterest(): boolean {
    return this.isEndNode() || this.isStartNode();
  }
}

const NODES: ReadonlyDeep<Record<NodeTypeKey, NodeTypeKey>> = {
  wall: WALL,
  empty: EMPTY,
  end: END,
  start: START,
};
const NODES_OF_INTEREST: ReadonlyDeep<Record<NodeOfInterest, NodeOfInterest>> =
  {
    end: END,
    start: START,
  };
const NODE_VALUES: NodeTypeKey[] = Object.values(NODES);
const NODE_OF_INTEREST_VALUES: NodeOfInterest[] =
  Object.values(NODES_OF_INTEREST);

function isNodeType(value: string): value is NodeTypeKey {
  return NODE_VALUES.some((node) => node === value);
}

function isNodeOfInterest(value: NodeTypeKey): value is NodeOfInterest {
  return NODE_OF_INTEREST_VALUES.some((node) => node === value);
}

function assertIsNodeTypeKey(value: string): asserts value is NodeTypeKey {
  if (!isNodeType(value)) {
    throw new Error(`Invalid node type: ${value}`);
  }
}

export {
  assertIsNodeTypeKey,
  isNodeOfInterest,
  NODE_VALUES,
  NODES,
  PathfindingNode,
  type NodeOfInterest,
  type NodeTypeKey,
};
