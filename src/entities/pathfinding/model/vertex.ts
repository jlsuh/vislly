import type { ReadonlyDeep } from 'type-fest';

const EMPTY = 'empty';
const END = 'end';
const GRAVEL = 'gravel';
const GRASS = 'grass';
const SAND = 'sand';
const SNOW = 'snow';
const START = 'start';
const STONE = 'stone';
const WALL = 'wall';
const WATER = 'water';
const WATER_DEEP = 'water-deep';

const INITIAL_COORDINATE = -1;

const WEIGHTS: ReadonlyDeep<Record<VertexName, number>> = {
  [EMPTY]: 1,
  [END]: 1,
  [GRASS]: 5,
  [GRAVEL]: 50,
  [SAND]: 7,
  [SNOW]: 75,
  [START]: 1,
  [STONE]: 25,
  [WALL]: Number.POSITIVE_INFINITY,
  [WATER_DEEP]: 100,
  [WATER]: 50,
};

type VertexName =
  | typeof EMPTY
  | typeof END
  | typeof GRAVEL
  | typeof GRASS
  | typeof SAND
  | typeof SNOW
  | typeof START
  | typeof STONE
  | typeof WALL
  | typeof WATER
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

function isVertexName(value: unknown): value is VertexName {
  return (
    value === EMPTY ||
    value === END ||
    value === GRAVEL ||
    value === GRASS ||
    value === SAND ||
    value === SNOW ||
    value === START ||
    value === STONE ||
    value === WALL ||
    value === WATER ||
    value === WATER_DEEP
  );
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

const VERTEX_NAMES: ReadonlyDeep<VertexName[]> = [
  EMPTY,
  END,
  GRASS,
  GRAVEL,
  SAND,
  SNOW,
  START,
  STONE,
  WALL,
  WATER_DEEP,
  WATER,
];

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
