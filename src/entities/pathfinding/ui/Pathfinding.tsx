'use client';

import composeCSSCustomProperty from '@/shared/lib/composeCSSVariable.ts';
import pxToRem from '@/shared/lib/pxToRem.ts';
import useOnClickOutside from '@/shared/lib/useOnClickOutside.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type {
  JSX,
  MouseEvent,
  MouseEventHandler,
  RefObject,
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

type CellTypeKey = 'empty' | 'wall' | 'start' | 'finish';
type CellTypeKeyFirstChar = StringSlice<CellTypeKey, 0, 1>;
type CellType = (typeof CELL_TYPE)[CellTypeKey];
type CellPosition = { rowIndex: number; colIndex: number };

const CELL_TYPE: ReadonlyDeep<{
  [key in CellTypeKey]: { value: CellTypeKey; className: string };
}> = {
  wall: {
    value: 'wall',
    className: styles.wall,
  },
  empty: {
    value: 'empty',
    className: styles.empty,
  },
  finish: {
    value: 'finish',
    className: styles.finish,
  },
  start: {
    value: 'start',
    className: styles.start,
  },
};

const CELL_TYPES = Object.values(CELL_TYPE);
const DEFAULT_SELECTED_CELL_TYPE = CELL_TYPE.wall;

function isCellType(value: unknown): value is CellTypeKey {
  return CELL_TYPES.some((cellType) => cellType.value === value);
}

function isCellTypeFirstChar(value: unknown): value is CellTypeKeyFirstChar {
  return CELL_TYPES.some((cellType) => cellType.value.charAt(0) === value);
}

function assertIsCellType(value: unknown): asserts value is CellTypeKey {
  if (typeof value !== 'string') {
    throw new Error(`Expected a string, but received: ${typeof value}`);
  }
  if (!isCellType(value)) {
    throw new Error(`Invalid cell type: ${value}`);
  }
}

function getCellTypeFirstChar(value: CellTypeKey): CellTypeKeyFirstChar {
  const firstChar = value.charAt(0);
  if (!isCellTypeFirstChar(firstChar)) {
    throw new Error(`Invalid cell type first character: ${firstChar}`);
  }
  return firstChar;
}

function composeInitialPosition(): CellPosition {
  return { rowIndex: -1, colIndex: -1 };
}

function isStartCell(cellType: CellType): boolean {
  return cellType.value === CELL_TYPE.start.value;
}

function isFinishCell(cellType: CellType): boolean {
  return cellType.value === CELL_TYPE.finish.value;
}

function isWallCell(cellType: CellType): boolean {
  return cellType.value === CELL_TYPE.wall.value;
}

function isEmptyCell(cellType: CellType): boolean {
  return cellType.value === CELL_TYPE.empty.value;
}

function setToInitialPositionIfCondition(
  cells: RefObject<CellPosition>[],
  condition: (targetRowIndex: number, targetColIndex: number) => boolean,
): void {
  for (const cell of cells) {
    const { rowIndex, colIndex } = cell.current;
    if (condition(rowIndex, colIndex)) {
      cell.current = composeInitialPosition();
    }
  }
}

function getElementByPosition(
  rowIndex: number,
  colIndex: number,
): HTMLButtonElement | null {
  return document.querySelector(
    `[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`,
  );
}

function mutateAssociatedParagraph(
  cellTypeClassName: string,
  colIndex: number,
  rowIndex: number,
  textContent: CellTypeKeyFirstChar,
): void {
  const cellElement = getElementByPosition(rowIndex, colIndex);
  if (cellElement) {
    const paragraph = cellElement.querySelector('p');
    if (paragraph) {
      paragraph.className = `${styles.cellText} ${cellTypeClassName}`;
      paragraph.textContent = textContent;
    }
  }
}

function handleSpecialCell({
  grid,
  newCellTypeValue,
  newColIndex,
  newRowIndex,
  otherSpecialCells,
  specialCell,
}: {
  grid: CellTypeKey[][];
  newCellTypeValue: CellTypeKey;
  newColIndex: number;
  newRowIndex: number;
  otherSpecialCells: RefObject<CellPosition>[];
  specialCell: RefObject<CellPosition>;
}): void {
  const { rowIndex, colIndex } = specialCell.current;
  if (rowIndex !== -1 && colIndex !== -1) {
    grid[rowIndex][colIndex] = CELL_TYPE.empty.value;
    mutateAssociatedParagraph(
      CELL_TYPE.empty.className,
      colIndex,
      rowIndex,
      getCellTypeFirstChar(CELL_TYPE.empty.value),
    );
  }
  setToInitialPositionIfCondition(
    otherSpecialCells,
    (targetRowIndex, targetColIndex) =>
      newRowIndex === targetRowIndex && newColIndex === targetColIndex,
  );
  specialCell.current = { rowIndex: newRowIndex, colIndex: newColIndex };
  mutateAssociatedParagraph(
    CELL_TYPE[newCellTypeValue].className,
    newColIndex,
    newRowIndex,
    getCellTypeFirstChar(newCellTypeValue),
  );
}

function Cell({
  cellTypeInitialValue,
  colIndex,
  finishCell,
  grid,
  rowIndex,
  selectedCellType,
  startCell,
}: {
  cellTypeInitialValue: CellType;
  colIndex: number;
  finishCell: RefObject<CellPosition>;
  grid: CellTypeKey[][];
  rowIndex: number;
  selectedCellType: CellType;
  startCell: RefObject<CellPosition>;
}): JSX.Element {
  const [cellType, setCellType] = useState(cellTypeInitialValue);

  const setNewCellType = (newCellType: CellType): void => {
    if (isStartCell(newCellType)) {
      handleSpecialCell({
        grid,
        newCellTypeValue: newCellType.value,
        newColIndex: colIndex,
        newRowIndex: rowIndex,
        otherSpecialCells: [finishCell],
        specialCell: startCell,
      });
    }
    if (isFinishCell(newCellType)) {
      handleSpecialCell({
        grid,
        newCellTypeValue: newCellType.value,
        newColIndex: colIndex,
        newRowIndex: rowIndex,
        otherSpecialCells: [startCell],
        specialCell: finishCell,
      });
    }
    if (isWallCell(newCellType) || isEmptyCell(newCellType)) {
      setToInitialPositionIfCondition(
        [startCell, finishCell],
        (targetRowIndex, targetColIndex) =>
          rowIndex === targetRowIndex && colIndex === targetColIndex,
      );
    }
    setCellType(CELL_TYPE[newCellType.value]);
    grid[rowIndex][colIndex] = newCellType.value;
  };

  return (
    <button
      className={styles.cell}
      data-row-index={rowIndex}
      data-col-index={colIndex}
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
  const [grid, setGrid] = useState<CellTypeKey[][]>([]);
  const startCell = useRef<CellPosition>(composeInitialPosition());
  const finishCell = useRef<CellPosition>(composeInitialPosition());
  const isHoldingClick = useRef(false);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useOnClickOutside([ref], unsetBodyOverflow);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
    console.log('>>>>> startCell', startCell.current);
    console.log('>>>>> finishCell', finishCell.current);
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  useEffect(() => {
    setGrid((prevGrid) => {
      const newGrid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => CELL_TYPE.empty.value),
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

  useEffect(() => {
    setToInitialPositionIfCondition(
      [startCell],
      (targetRowIndex, targetColIndex) =>
        rows - 1 < targetRowIndex || cols - 1 < targetColIndex,
    );
    setToInitialPositionIfCondition(
      [finishCell],
      (targetRowIndex, targetColIndex) =>
        rows - 1 < targetRowIndex || cols - 1 < targetColIndex,
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
        key={selectedCellType.value}
        value={selectedCellType.value}
        onChange={(e): void => {
          const { value } = e.target;
          assertIsCellType(value);
          setSelectedCellType(CELL_TYPE[value]);
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
          row.map((cellValueFirstChar, colIndex) => (
            <Cell
              cellTypeInitialValue={CELL_TYPE[cellValueFirstChar]}
              colIndex={colIndex}
              finishCell={finishCell}
              grid={grid}
              key={`cell-row-${rowIndex}-col-${colIndex}-value-${cellValueFirstChar}`}
              rowIndex={rowIndex}
              selectedCellType={selectedCellType}
              startCell={startCell}
            />
          )),
        )}
      </section>
    </>
  );
}

export default Pathfinding;
