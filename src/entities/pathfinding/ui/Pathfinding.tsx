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
type CellTypeValueFirstChar = StringSlice<CellTypeValue, 0, 1>;
type CellType = (typeof CELL_TYPE)[CellTypeValueFirstChar];

const CELL_TYPE: ReadonlyDeep<{
  [key in CellTypeValueFirstChar]: { value: CellTypeValue; className: string };
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
const DEFAULT_SELECTED_CELL_TYPE = CELL_TYPE.w;

function isCellType(value: unknown): value is CellTypeValue {
  return CELL_TYPES.some((cellType) => cellType.value === value);
}

function isCellTypeFirstChar(value: unknown): value is CellTypeValueFirstChar {
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

function getCellTypeFirstChar(value: CellTypeValue): CellTypeValueFirstChar {
  const firstChar = value.charAt(0);
  if (!isCellTypeFirstChar(firstChar)) {
    throw new Error(`Invalid cell type first character: ${firstChar}`);
  }
  return firstChar;
}

function Cell({
  cellTypeInitialValue,
  colIndex,
  grid,
  rowIndex,
  selectedCellType,
}: {
  cellTypeInitialValue: CellType;
  colIndex: number;
  grid: CellTypeValueFirstChar[][];
  rowIndex: number;
  selectedCellType: CellType;
}): JSX.Element {
  const [cellType, setCellType] = useState(cellTypeInitialValue);

  const setNewCellType = (newCellType: CellType): void => {
    const newCellTypeFirstChar = getCellTypeFirstChar(newCellType.value);
    grid[rowIndex][colIndex] = newCellTypeFirstChar;
    setCellType(CELL_TYPE[newCellTypeFirstChar]);
  };

  return (
    <button
      className={styles.cell}
      onContextMenu={(e): void => e.preventDefault()}
      onMouseDown={(): void => setNewCellType(selectedCellType)}
      onTouchStart={(): void => setNewCellType(selectedCellType)}
      type="button"
    >
      <p className={`${styles.cellText} ${cellType.className}`}>
        {getCellTypeFirstChar(cellType.value)}
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
  const [selectedCellType, setSelectedCellType] = useState(
    DEFAULT_SELECTED_CELL_TYPE,
  );
  const [grid, setGrid] = useState<CellTypeValueFirstChar[][]>([]);
  const isHoldingClick = useRef(false);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () =>
          getCellTypeFirstChar(CELL_TYPE.e.value),
        ),
      );
      for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
        for (let colIndex = 0; colIndex < cols; colIndex += 1) {
          const cellValue = prevGrid[rowIndex]?.[colIndex];
          if (cellValue !== undefined) {
            newGrid[rowIndex][colIndex] = cellValue;
          }
        }
      }
      return newGrid;
    });
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
        key={selectedCellType.value}
        value={selectedCellType.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsCellType(value);
          const cellTypeFirstChar = getCellTypeFirstChar(value);
          setSelectedCellType(CELL_TYPE[cellTypeFirstChar]);
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
          row.map((cellValueFirstChar, colIndex) => {
            return (
              <Cell
                cellTypeInitialValue={CELL_TYPE[cellValueFirstChar]}
                colIndex={colIndex}
                grid={grid}
                key={`cell-row-${rowIndex}-col-${colIndex}-value-${cellValueFirstChar}`}
                rowIndex={rowIndex}
                selectedCellType={selectedCellType}
              />
            );
          }),
        )}
      </section>
    </>
  );
}

export default Pathfinding;
