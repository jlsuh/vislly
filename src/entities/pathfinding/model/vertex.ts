import type { ReadonlyDeep } from 'type-fest';

const START = 'start';
const END = 'end';
const WALL = 'wall';
const EMPTY = 'empty';
const GRASS = 'grass';
const SAND = 'sand';
const STONE = 'stone';
const GRAVEL = 'gravel';
const WATER = 'water';
const SNOW = 'snow';
const WATER_DEEP = 'water-deep';

const INITIAL_COORDINATE = -1;

const WEIGHTS: ReadonlyDeep<Record<VertexName, number>> = {
  [START]: 1,
  [END]: 1,
  [WALL]: Number.POSITIVE_INFINITY,
  [EMPTY]: 1,
  [GRASS]: 5,
  [SAND]: 7,
  [STONE]: 25,
  [GRAVEL]: 50,
  [WATER]: 50,
  [SNOW]: 75,
  [WATER_DEEP]: 100,
};

type VertexName =
  | typeof START
  | typeof END
  | typeof WALL
  | typeof EMPTY
  | typeof GRASS
  | typeof SAND
  | typeof STONE
  | typeof GRAVEL
  | typeof WATER
  | typeof SNOW
  | typeof WATER_DEEP;
type TerminalVertex = Extract<VertexName, typeof START | typeof END>;

class Vertex {
  public readonly row: number;
  public readonly col: number;
  public readonly name: VertexName;
  public readonly weight: number;

  public constructor(row: number, col: number, name: VertexName) {
    assertIsVertexName(name);
    this.row = row;
    this.col = col;
    this.name = name;
    this.weight = WEIGHTS[name];
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

function isVertexName(value: string): value is VertexName {
  return WEIGHTS[value as VertexName] !== undefined;
}

function assertIsVertexName(value: string): asserts value is VertexName {
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

const NON_TERMINAL_VERTEX_NAMES: ReadonlyDeep<VertexName[]> = [
  WALL,
  EMPTY,
  GRASS,
  SAND,
  STONE,
  GRAVEL,
  WATER,
  SNOW,
  WATER_DEEP,
];

const VERTEX_NAMES: ReadonlyDeep<VertexName[]> = [
  START,
  END,
  WALL,
  EMPTY,
  GRASS,
  SAND,
  STONE,
  GRAVEL,
  WATER,
  SNOW,
  WATER_DEEP,
];

const INITIAL_VERTEX_NAME: VertexName = START;

export {
  assertIsTerminalVertex,
  assertIsVertexName,
  EMPTY,
  END,
  INITIAL_COORDINATE,
  INITIAL_VERTEX_NAME,
  isTerminalVertex,
  NON_TERMINAL_VERTEX_NAMES,
  START,
  Vertex,
  VERTEX_NAMES,
  WALL,
  type TerminalVertex,
  type VertexName,
};
