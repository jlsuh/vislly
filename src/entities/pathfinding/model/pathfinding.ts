const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

const NODES_OF_INTEREST: Set<NodeOfInterest> = new Set([END, START]);
const NODES: Set<NodeTypeKey> = new Set([WALL, EMPTY, END, START]);
const NODE_VALUES: NodeTypeKey[] = Array.from(NODES);

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

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNodeType(value: unknown): value is NodeTypeKey {
  return isString(value) && NODES.has(value as NodeTypeKey);
}

function isNodeOfInterest(value: unknown): value is NodeOfInterest {
  return isString(value) && NODES_OF_INTEREST.has(value as NodeOfInterest);
}

function assertIsNodeTypeKey(value: unknown): asserts value is NodeTypeKey {
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
