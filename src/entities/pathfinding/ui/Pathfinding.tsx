'use client';

import pxToRem from '@/shared/lib/pxToRem.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions.ts';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
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

function Pathfinding(): JSX.Element {
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  useEffect(() => {
    setCols(Math.floor(pxToRem(dimensions.boundedWidth) / CELL_DIM_SIZE));
    setRows(Math.floor(pxToRem(dimensions.boundedHeight) / CELL_DIM_SIZE));
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  return (
    <div
      className={styles.grid}
      ref={ref}
      style={{ '--cell-size': `${CELL_DIM_SIZE}rem` }}
    >
      {Array.from({ length: rows * cols })
        .fill(0)
        .map((_, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return (
            <div className={styles.cell} key={`cell-row-${row}-col-${col}`} />
          );
        })}
    </div>
  );
}

export default Pathfinding;
