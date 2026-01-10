import type { ReadonlyDeep } from 'type-fest';

const VertexName = {
  Start: 'start',
  End: 'end',
  Wall: 'wall',
  Empty: 'empty',
  Grass: 'grass',
  Sand: 'sand',
  Stone: 'stone',
  Gravel: 'gravel',
  Snow: 'snow',
  Water: 'water',
  WaterDeep: 'water-deep',
} as const;

type VertexName = (typeof VertexName)[keyof typeof VertexName];

const INITIAL_COORDINATE = -1;

const WEIGHTS: ReadonlyDeep<Record<VertexName, number>> = {
  [VertexName.Start]: 1,
  [VertexName.End]: 1,
  [VertexName.Wall]: Number.POSITIVE_INFINITY,
  [VertexName.Empty]: 1,
  [VertexName.Grass]: 2,
  [VertexName.Gravel]: 4,
  [VertexName.Sand]: 8,
  [VertexName.Stone]: 16,
  [VertexName.Snow]: 32,
  [VertexName.Water]: 64,
  [VertexName.WaterDeep]: 128,
};

type TerminalVertex = Extract<
  VertexName,
  typeof VertexName.Start | typeof VertexName.End
>;

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
  return value === VertexName.Start || value === VertexName.End;
}

function assertIsTerminalVertex(
  value: unknown,
): asserts value is TerminalVertex {
  if (!isTerminalVertex(value)) {
    throw new Error(`Invalid terminal vertex: ${value}`);
  }
}

const VERTEX_NAMES: ReadonlyDeep<VertexName[]> = Object.values(VertexName);

const NON_TERMINAL_VERTEX_NAMES: ReadonlyDeep<VertexName[]> =
  VERTEX_NAMES.filter((v) => !isTerminalVertex(v));

const INITIAL_VERTEX_NAME: VertexName = VertexName.Start;

export {
  assertIsTerminalVertex,
  assertIsVertexName,
  INITIAL_COORDINATE,
  INITIAL_VERTEX_NAME,
  isTerminalVertex,
  NON_TERMINAL_VERTEX_NAMES,
  Vertex,
  VERTEX_NAMES,
  VertexName,
  type TerminalVertex,
};
