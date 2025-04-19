'use client';

import composeCSSCustomProperty from '@/shared/lib/composeCSSVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type {
  JSX,
  MouseEvent,
  MouseEventHandler,
  TouchEvent,
  TouchEventHandler,
} from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ReadonlyDeep, StringSlice } from 'type-fest';
import styles from './pathfinding.module.css';

const RESIZE_DIMENSIONS = {
  boundedHeight: 0,
  boundedWidth: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  height: 0,
  width: 0,
};

const CELL_DIM_SIZE = 1;
const CELL_SIZE_VAR = composeCSSCustomProperty(
  'cell-size',
  `${CELL_DIM_SIZE}rem`,
);

type CellTypeValue = 'empty' | 'wall' | 'start' | 'finish';
type CellTypeValueInitial = StringSlice<CellTypeValue, 0, 1>;
type CellType = (typeof CELL_TYPE)[CellTypeValueInitial];

const CELL_TYPE: ReadonlyDeep<{
  [key in CellTypeValueInitial]: { value: CellTypeValue; className: string };
}> = {
  w: {
    value: 'wall',
    className: styles.wall,
  },
  e: {
    value: 'empty',
    className: styles.empty,
  },
  f: {
    value: 'finish',
    className: styles.finish,
  },
  s: {
    value: 'start',
    className: styles.start,
  },
};

const CELL_TYPES = Object.values(CELL_TYPE);

function isCellType(value: unknown): value is CellTypeValue {
  return CELL_TYPES.some((cellType) => cellType.value === value);
}

function isCellTypeInitial(value: unknown): value is CellTypeValueInitial {
  return CELL_TYPES.some((cellType) => cellType.value.charAt(0) === value);
}

function assertIsCellType(value: unknown): asserts value is CellTypeValue {
  if (typeof value !== 'string') {
    throw new Error(`Expected a string, but received: ${typeof value}`);
  }
  if (!isCellType(value)) {
    throw new Error(`Invalid cell type: ${value}`);
  }
}

function getCellTypeInitial(value: CellTypeValue): CellTypeValueInitial {
  const initial = value.charAt(0);
  if (!isCellTypeInitial(initial)) {
    throw new Error(`Invalid cell type initial: ${initial}`);
  }
  return initial;
}

function Cell({
  colIndex,
  currentCellType,
  grid,
  initialCellType,
  rowIndex,
  setGrid,
}: {
  colIndex: number;
  currentCellType: CellType;
  grid: CellTypeValueInitial[][];
  initialCellType: CellType;
  rowIndex: number;
  setGrid: (grid: CellTypeValueInitial[][]) => void;
}): JSX.Element {
  const [cellType, setCellType] = useState(initialCellType);

  return (
    <button
      className={styles.cell}
      onContextMenu={(e): void => e.preventDefault()}
      onMouseDown={(): void => {
        const newCellTypeInitial = getCellTypeInitial(currentCellType.value);
        grid[rowIndex][colIndex] = newCellTypeInitial;
        setCellType(CELL_TYPE[newCellTypeInitial]);
        setGrid(grid);
      }}
      onTouchStart={(): void => {
        const newCellTypeInitial = getCellTypeInitial(currentCellType.value);
        grid[rowIndex][colIndex] = newCellTypeInitial;
        setCellType(CELL_TYPE[newCellTypeInitial]);
        setGrid(grid);
      }}
      type="button"
    >
      <p className={`${styles.cellText} ${cellType.className}`}>
        {getCellTypeInitial(cellType.value)}
      </p>
    </button>
  );
}

const hideBodyOverflow = (): void => {
  document.body.style.overflow = 'hidden';
};

const unsetBodyOverflow = (): void => {
  document.body.style.overflow = 'unset';
};

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const [currentCellType, setCurrentCellType] = useState(CELL_TYPE.w);
  const [grid, setGrid] = useState<CellTypeValueInitial[][]>([]);
  const isHoldingClick = useRef(false);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid(
      Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () =>
          getCellTypeInitial(CELL_TYPE.e.value),
        ),
      ),
    );
  }, [rows, cols]);

  const setIsHoldingClickToFalse = (): void => {
    isHoldingClick.current = false;
  };

  const setIsHoldingClickToTrue = (): void => {
    isHoldingClick.current = true;
  };

  function dispatchEvent({
    clientX,
    clientY,
  }: { clientX: number; clientY: number }): void {
    const cell = document.elementFromPoint(clientX, clientY);
    if (cell) {
      const cellButton = cell.closest('button');
      if (cellButton) {
        cellButton.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            clientX,
            clientY,
          }),
        );
      }
    }
  }

  const dispatchPointerDown: TouchEventHandler<HTMLElement> = (
    e: TouchEvent<HTMLElement>,
  ): void => {
    const touch = e.touches[0];
    const { clientX, clientY } = touch;
    dispatchEvent({ clientX, clientY });
  };

  const dispatchMouseDown: MouseEventHandler<HTMLElement> = (
    e: MouseEvent<HTMLElement>,
  ): void => {
    if (!isHoldingClick.current) {
      return;
    }
    const { clientX, clientY } = e;
    dispatchEvent({ clientX, clientY });
  };

  return (
    <>
      <select
        key={currentCellType.value}
        value={currentCellType.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsCellType(value);
          const cellTypeInitial = getCellTypeInitial(value);
          setCurrentCellType(CELL_TYPE[cellTypeInitial]);
        }}
      >
        {CELL_TYPES.map((cellType) => (
          <option key={cellType.value} value={cellType.value}>
            {cellType.value.charAt(0).toUpperCase() + cellType.value.slice(1)}
          </option>
        ))}
      </select>
      <section
        aria-label="Pathfinding grid"
        className={styles.grid}
        onMouseDown={setIsHoldingClickToTrue}
        onMouseLeave={setIsHoldingClickToFalse}
        onMouseMove={dispatchMouseDown}
        onMouseUp={setIsHoldingClickToFalse}
        onTouchMove={dispatchPointerDown}
        onTouchStart={hideBodyOverflow}
        ref={ref}
        style={CELL_SIZE_VAR}
      >
        {grid.map((row, rowIndex) =>
          row.map((cellValueInitial, colIndex) => {
            return (
              <Cell
                colIndex={colIndex}
                currentCellType={currentCellType}
                grid={grid}
                initialCellType={CELL_TYPE[cellValueInitial]}
                key={`cell-row-${rowIndex}-col-${colIndex}-value-${cellValueInitial}`}
                rowIndex={rowIndex}
                setGrid={setGrid}
              />
            );
          }),
        )}
      </section>
    </>
  );
}

export default Pathfinding;
