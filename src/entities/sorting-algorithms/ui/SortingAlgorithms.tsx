'use client';

import {
  type ChangeEvent,
  type JSX,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { integerRange } from '@/shared/lib/arrays.ts';
import { getCanvasCtxByRef } from '@/shared/lib/canvas.ts';
import { fisherYatesShuffle } from '@/shared/lib/random.ts';
import {
  type ResizeDimensions,
  useResizeDimensions,
} from '@/shared/lib/useResizeDimensions.ts';
import styles from './sorting-algorithms.module.css';

const INITIAL_RESIZE_DIMENSIONS: ResizeDimensions = {
  height: 0,
  width: 0,
};
const GAP_THRESHOLD_RATIO = 2.5;

function composeFisherYatesIntegerRangeShuffle(start: number, end: number) {
  return fisherYatesShuffle(integerRange(start, end));
}

function SortingAlgorithms(): JSX.Element {
  const [rangeEnd, setRangeEnd] = useState(50);
  const { dimensions, resizeRef } = useResizeDimensions<HTMLDivElement>(
    INITIAL_RESIZE_DIMENSIONS,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRangeInputId = useId();

  const handleOnChangeCountRageInput = (e: ChangeEvent<HTMLInputElement>) => {
    setRangeEnd(Number(e.target.value));
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    if (dimensions.width === 0 || dimensions.height === 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = dimensions.width * dpr;
    canvasRef.current.height = dimensions.height * dpr;

    const ctx = getCanvasCtxByRef(canvasRef.current);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.translate(0, canvasRef.current.height);
    ctx.scale(1, -1);

    const randomArray = composeFisherYatesIntegerRangeShuffle(1, rangeEnd);
    const physicalBarWidth = canvasRef.current.width / rangeEnd;
    const shouldShowGap = physicalBarWidth > dpr * GAP_THRESHOLD_RATIO;
    const physicalGap = shouldShowGap ? dpr : 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < randomArray.length; i += 1) {
      const xi = i * physicalBarWidth;
      const xf = shouldShowGap
        ? Math.max(0, physicalBarWidth - physicalGap)
        : physicalBarWidth + 0.5;
      const yi = 0;
      const yf = (randomArray[i] * canvasRef.current.height) / rangeEnd;
      ctx.rect(xi, yi, xf, yf);
    }
    ctx.fill();
  }, [dimensions.height, dimensions.width, rangeEnd]);

  return (
    <>
      <div className={styles.controls}>
        <label htmlFor={countRangeInputId}>
          Item Count: <strong>{rangeEnd}</strong>
        </label>
        <input
          id={countRangeInputId}
          type="range"
          min="50"
          max="1000"
          step="50"
          value={rangeEnd}
          onChange={handleOnChangeCountRageInput}
        />
      </div>
      <div className={styles.sortingAlgorithmsContainer} ref={resizeRef}>
        <canvas className={styles.sortingAlgorithmsCanvas} ref={canvasRef} />
      </div>
    </>
  );
}

export default SortingAlgorithms;
