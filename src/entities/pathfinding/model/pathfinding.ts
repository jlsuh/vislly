import type { StringSlice } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

const INITIAL_COORDINATE = -1;

type VertexName = typeof WALL | typeof EMPTY | typeof END | typeof START;
type TerminalVertex = Extract<VertexName, typeof END | typeof START>;
type VertexNameFirstChar = StringSlice<VertexName, 0, 1>;

class Vertex {
  public readonly row: number;
  public readonly col: number;
  public readonly vertexName: VertexName;

  public constructor(row: number, col: number, vertexName: VertexName) {
    this.vertexName = vertexName;
    this.row = row;
    this.col = col;
  }

  public deepCopy(): Vertex {
    return new Vertex(this.row, this.col, this.vertexName);
  }

  public appearsOnGrid(): boolean {
    return this.row !== INITIAL_COORDINATE && this.col !== INITIAL_COORDINATE;
  }

  public getFirstChar(): VertexNameFirstChar {
    return this.vertexName.charAt(0) as VertexNameFirstChar;
  }
}

function isVertex(value: string): value is VertexName {
  return value === EMPTY || value === WALL || value === END || value === START;
}

function isTerminal(value: string): value is TerminalVertex {
  return value === END || value === START;
}

function assertIsVertex(value: string): asserts value is VertexName {
  if (!isVertex(value)) {
    throw new Error(`Invalid vertex: ${value}`);
  }
}

function assertIsTerminal(value: string): asserts value is TerminalVertex {
  if (!isTerminal(value)) {
    throw new Error(`Invalid terminal vertex: ${value}`);
  }
}

export {
  assertIsTerminal,
  assertIsVertex,
  EMPTY,
  END,
  INITIAL_COORDINATE,
  isTerminal,
  START,
  Vertex,
  WALL,
  type TerminalVertex,
  type VertexName,
};
