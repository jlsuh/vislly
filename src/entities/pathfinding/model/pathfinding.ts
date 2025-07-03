import type { StringSlice } from 'type-fest';

type NodeTypeKey = 'wall' | 'empty' | 'end' | 'start';
type NodeTypeKeyFirstChar = StringSlice<NodeTypeKey, 0, 1>;

class PathfindingNode {
  public row: number;
  public col: number;
  public value: NodeTypeKey;

  public constructor({
    row,
    col,
    value,
  }: { row: number; col: number; value: NodeTypeKey }) {
    this.row = row;
    this.col = col;
    this.value = value;
  }

  public setToInitialPositionIfCondition({
    condition,
  }: {
    condition: ({
      targetCol,
      targetRow,
    }: {
      targetCol: number;
      targetRow: number;
    }) => boolean;
  }) {
    if (condition({ targetCol: this.col, targetRow: this.row })) {
      this.row = -1;
      this.col = -1;
    }
  }

  public isInitialPosition() {
    return this.row === -1 && this.col === -1;
  }

  public isWallNode() {
    return this.value === 'wall';
  }

  public isEmptyNode() {
    return this.value === 'empty';
  }

  public isEndNode() {
    return this.value === 'end';
  }

  public isStartNode() {
    return this.value === 'start';
  }
}

export { PathfindingNode, type NodeTypeKey, type NodeTypeKeyFirstChar };
