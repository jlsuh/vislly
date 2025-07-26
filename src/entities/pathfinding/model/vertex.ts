import type { ReadonlyDeep } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const START = 'start';
const WALL = 'wall';

const INITIAL_COORDINATE = -1;

type VertexName = typeof WALL | typeof EMPTY | typeof START | typeof END;
type TerminalVertex = Extract<VertexName, typeof START | typeof END>;

class Vertex {
  public readonly row: number;
  public readonly col: number;
  public readonly name: VertexName;

  public constructor(row: number, col: number, name: VertexName) {
    assertIsVertexName(name);
    this.name = name;
    this.row = row;
    this.col = col;
  }

  public appearsOnGrid(): boolean {
    return this.row !== INITIAL_COORDINATE && this.col !== INITIAL_COORDINATE;
  }

  public deepCopy(): Vertex {
    return new Vertex(this.row, this.col, this.name);
  }

  public positionEquals(that: Vertex): boolean {
    return this.row === that.row && this.col === that.col;
  }
}

function isVertexName(value: unknown): value is VertexName {
  return value === WALL || value === EMPTY || value === START || value === END;
}

function assertIsVertexName(value: unknown): asserts value is VertexName {
  if (!isVertexName(value)) {
    throw new Error(`Invalid vertex: ${value}`);
  }
}

function isTerminalVertex(value: unknown): value is TerminalVertex {
  return value === START || value === END;
}

function assertIsTerminalVertex(
  value: unknown,
): asserts value is TerminalVertex {
  if (!isTerminalVertex(value)) {
    throw new Error(`Invalid terminal vertex: ${value}`);
  }
}

const VERTEX_NAMES: ReadonlyDeep<VertexName[]> = [WALL, EMPTY, START, END];

export {
  assertIsTerminalVertex,
  assertIsVertexName,
  EMPTY,
  END,
  INITIAL_COORDINATE,
  isTerminalVertex,
  START,
  Vertex,
  VERTEX_NAMES,
  WALL,
  type TerminalVertex,
  type VertexName,
};
