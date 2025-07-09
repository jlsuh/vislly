import type { ReadonlyDeep, StringSlice } from 'type-fest';

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
  public vertexStrategy: ReadonlyDeep<VertexStrategy>;

  public constructor(
    row: number,
    col: number,
    vertexStrategy: ReadonlyDeep<VertexStrategy>,
  ) {
    this.vertexStrategy = vertexStrategy;
    this.row = row;
    this.col = col;
  }

  public appearsOnGrid(): boolean {
    return this.row !== INITIAL_COORDINATE && this.col !== INITIAL_COORDINATE;
  }

  public getFirstChar(): VertexNameFirstChar {
    return this.vertexStrategy.getFirstChar();
  }

  public isTerminal(): boolean {
    return this.vertexStrategy.isTerminal();
  }

  public get value(): VertexName {
    return this.vertexStrategy.value;
  }
}

abstract class VertexStrategy {
  public readonly value: VertexName;

  public constructor(value: VertexName) {
    VertexStrategy.assertIsNode(value);
    this.value = value;
  }

  private isNode(value: string): value is VertexName {
    return (
      value === EMPTY || value === END || value === START || value === WALL
    );
  }

  private isTerminalNode(value: string): value is TerminalVertex {
    return value === END || value === START;
  }

  public static assertIsNode(value: string): asserts value is VertexName {
    if (!VertexStrategy.prototype.isNode(value)) {
      throw new Error(`Invalid node: ${value}`);
    }
  }

  public static assertIsTerminalNode(
    value: string,
  ): asserts value is TerminalVertex {
    if (!VertexStrategy.prototype.isTerminalNode(value)) {
      throw new Error(`Invalid terminal node: ${value}`);
    }
  }

  public getFirstChar(): VertexNameFirstChar {
    return this.value.charAt(0) as VertexNameFirstChar;
  }

  public abstract isTerminal(): boolean;
}

class StartVertexStrategy extends VertexStrategy {
  public isTerminal(): boolean {
    return true;
  }
}

class EndVertexStrategy extends VertexStrategy {
  public isTerminal(): boolean {
    return true;
  }
}

class EmptyVertexStrategy extends VertexStrategy {
  public isTerminal(): boolean {
    return false;
  }
}

class WallVertexStrategy extends VertexStrategy {
  public isTerminal(): boolean {
    return false;
  }
}

const NODE_STRATEGIES: ReadonlyDeep<Record<VertexName, VertexStrategy>> = {
  empty: new EmptyVertexStrategy(EMPTY),
  end: new EndVertexStrategy(END),
  start: new StartVertexStrategy(START),
  wall: new WallVertexStrategy(WALL),
};

export {
  EMPTY,
  END,
  INITIAL_COORDINATE,
  NODE_STRATEGIES,
  START,
  Vertex,
  VertexStrategy,
  WALL,
  type TerminalVertex,
  type VertexName,
  type VertexNameFirstChar,
};
