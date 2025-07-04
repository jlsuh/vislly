import type { StringSlice } from 'type-fest';

type NodeTypeKey = 'wall' | 'empty' | 'end' | 'start';
type NodeTypeKeyFirstChar = StringSlice<NodeTypeKey, 0, 1>;

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

  public isEndNode(): boolean {
    return this.value === 'end';
  }

  public isStartNode(): boolean {
    return this.value === 'start';
  }
}

const NODE_OPTIONS: NodeTypeKey[] = ['wall', 'empty', 'start', 'end'];

function assertIsNodeTypeKey(value: unknown): asserts value is NodeTypeKey {
  if (typeof value !== 'string') {
    throw new Error(`Expected a string, but received: ${typeof value}`);
  }
  if (!isNodeType(value)) {
    throw new Error(`Invalid node type: ${value}`);
  }
}

function isNodeType(value: unknown): value is NodeTypeKey {
  return NODE_OPTIONS.some((nodeType) => nodeType === value);
}

export { assertIsNodeTypeKey, NODE_OPTIONS, PathfindingNode, type NodeTypeKey };
