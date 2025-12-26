'use client';

import {
  type ChangeEvent,
  type JSX,
  type RefObject,
  useCallback,
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

const BASE_STEPS_PER_FRAME = 203;
const INITIAL_RESIZE_DIMENSIONS: ResizeDimensions = {
  height: 0,
  width: 0,
};
const GAP_THRESHOLD_RATIO = 2.5;

type SortOperationType = 'compare' | 'swap';

interface SortYield {
  type: SortOperationType;
  indices: number[];
  accessCount: number;
  compareCount: number;
  fillStyle: string;
}

function* bubbleSortGenerator(
  arr: number[],
): Generator<SortYield, void, unknown> {
  let swapped: boolean;
  for (let i = 0; i < arr.length; i += 1) {
    swapped = false;
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      yield {
        type: 'compare',
        indices: [j, j + 1],
        compareCount: 1,
        accessCount: 2,
        fillStyle: '#ff0000',
      };
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        yield {
          type: 'swap',
          indices: [j, j + 1],
          compareCount: 0,
          accessCount: 2,
          fillStyle: '#ff0000',
        };
        swapped = true;
      }
    }
    if (!swapped) {
      break;
    }
  }
}

function composeFisherYatesIntegerRangeShuffle(start: number, end: number) {
  return fisherYatesShuffle(integerRange(start, end));
}

function draw(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  arrayRef: RefObject<number[]>,
  activeHighlightsRef: RefObject<Map<number, string>>,
  rangeEnd: number,
) {
  if (!canvasRef.current || arrayRef.current.length === 0) {
    return;
  }
  const ctx = getCanvasCtxByRef(canvasRef.current);
  const { width, height } = canvasRef.current;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.translate(0, height);
  ctx.scale(1, -1);
  const dpr = window.devicePixelRatio || 1;
  const physicalBarWidth = width / arrayRef.current.length;
  const shouldShowGap = physicalBarWidth > dpr * GAP_THRESHOLD_RATIO;
  const physicalGap = shouldShowGap ? dpr : 0;
  for (let i = 0; i < arrayRef.current.length; i += 1) {
    const xi = i * physicalBarWidth;
    const xf = shouldShowGap
      ? Math.max(0, physicalBarWidth - physicalGap)
      : physicalBarWidth + 0.5;
    const yi = 0;
    const yf = (arrayRef.current[i] * height) / rangeEnd;
    ctx.fillStyle = activeHighlightsRef.current.get(i) || '#ffffff';
    ctx.beginPath();
    ctx.rect(xi, yi, xf, yf);
    ctx.fill();
  }
}

function SortingAlgorithms(): JSX.Element {
  const [isSorted, setIsSorted] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [rangeEnd, setRangeEnd] = useState(100);
  const [speed, setSpeed] = useState(0);
  const [stats, setStats] = useState({ comparisons: 0, accesses: 0 });

  const activeHighlightsRef = useRef<Map<number, string>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);
  const arrayRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialArrayRef = useRef<number[]>([]);
  const sortingGeneratorRef = useRef<Generator<
    SortYield,
    void,
    unknown
  > | null>(null);
  const speedRef = useRef(speed);
  const statsRef = useRef({ comparisons: 0, accesses: 0 });

  const countRangeInputId = useId();
  const speedRangeInputId = useId();

  const { dimensions, resizeRef } = useResizeDimensions<HTMLDivElement>(
    INITIAL_RESIZE_DIMENSIONS,
  );

  const reset = useCallback(
    (shouldGenerateNewValues: boolean) => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      setIsSorting(false);
      setIsSorted(false);
      if (shouldGenerateNewValues || initialArrayRef.current.length === 0) {
        initialArrayRef.current = composeFisherYatesIntegerRangeShuffle(
          1,
          rangeEnd,
        );
      }
      arrayRef.current = [...initialArrayRef.current];
      sortingGeneratorRef.current = bubbleSortGenerator(arrayRef.current);
      statsRef.current = { comparisons: 0, accesses: 0 };
      setStats({ comparisons: 0, accesses: 0 });
      activeHighlightsRef.current.clear();
      draw(canvasRef, arrayRef, activeHighlightsRef, rangeEnd);
    },
    [rangeEnd],
  );

  const processStep = (shouldDraw: boolean): SortYield | null => {
    if (!sortingGeneratorRef.current) {
      return null;
    }
    const { value, done } = sortingGeneratorRef.current.next();
    if (done) {
      setIsSorting(false);
      setIsSorted(true);
      activeHighlightsRef.current.clear();
      draw(canvasRef, arrayRef, activeHighlightsRef, rangeEnd);
      setStats({ ...statsRef.current });
      return null;
    }
    statsRef.current.comparisons += value.compareCount;
    statsRef.current.accesses += value.accessCount;
    activeHighlightsRef.current.clear();
    for (const index of value.indices) {
      activeHighlightsRef.current.set(index, value.fillStyle);
    }
    if (shouldDraw) {
      draw(canvasRef, arrayRef, activeHighlightsRef, rangeEnd);
    }
    return value;
  };

  const executeSortingLoop = () => {
    const executeBatch = (steps: number): boolean => {
      for (let i = 0; i < steps; i += 1) {
        if (processStep(false) === null) {
          return true;
        }
      }
      return false;
    };
    let previousTime = performance.now();
    let accumulator = 0;
    const loop = (currentTime: number) => {
      const elapsedTime = currentTime - previousTime;
      previousTime = currentTime;
      if (speedRef.current > 0) {
        accumulator = Math.min(accumulator + elapsedTime, 500);
      } else {
        accumulator = 0;
      }
      const calculatedSteps =
        speedRef.current === 0
          ? BASE_STEPS_PER_FRAME
          : Math.floor(accumulator / speedRef.current);
      if (executeBatch(calculatedSteps)) {
        return;
      }
      accumulator -= calculatedSteps * speedRef.current;
      setStats({ ...statsRef.current });
      draw(canvasRef, arrayRef, activeHighlightsRef, rangeEnd);
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
  };

  const handlePause = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    setIsSorting(false);
    setStats({ ...statsRef.current });
  };

  const handleSort = () => {
    setIsSorting(true);
    executeSortingLoop();
  };

  const handleReset = () => {
    reset(false);
  };

  const handleSortAgain = () => {
    handleReset();
    handleSort();
  };

  const handleStep = () => {
    setIsSorting(false);
    const result = processStep(true);
    if (result !== null) {
      setStats({ ...statsRef.current });
    }
  };

  const handleOnChangeSpeed = (e: ChangeEvent<HTMLInputElement>) => {
    speedRef.current = Number(e.target.value);
    setSpeed(speedRef.current);
  };

  const handleOnChangeRangeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setRangeEnd(Number(e.target.value));
  };

  const composePrimaryAction = () => {
    if (isSorted) {
      return {
        primaryActionLabel: 'Sort Again',
        primaryActionHandler: handleSortAgain,
      };
    }
    if (isSorting) {
      return {
        primaryActionLabel: 'Pause',
        primaryActionHandler: handlePause,
      };
    }
    return {
      primaryActionLabel: 'Sort',
      primaryActionHandler: handleSort,
    };
  };
  const { primaryActionLabel, primaryActionHandler } = composePrimaryAction();

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
    if (arrayRef.current.length > 0) {
      draw(canvasRef, arrayRef, activeHighlightsRef, rangeEnd);
    }
  }, [dimensions.width, dimensions.height, rangeEnd]);

  useEffect(() => {
    reset(true);
  }, [reset]);

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <label htmlFor={countRangeInputId}>
            Items: <strong>{rangeEnd}</strong>
          </label>
          <input
            id={countRangeInputId}
            type="range"
            min="100"
            max="1000"
            step="100"
            value={rangeEnd}
            onChange={handleOnChangeRangeEnd}
          />
        </div>
        <div className={styles.controlRow}>
          <label htmlFor={speedRangeInputId}>
            Speed delay: <strong>{speed}ms</strong>
          </label>
          <input
            id={speedRangeInputId}
            type="range"
            min="0"
            max="100"
            step="10"
            value={speed}
            onChange={handleOnChangeSpeed}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleReset} className={styles.button} type="button">
            Reset
          </button>
          <button
            onClick={handleStep}
            className={styles.button}
            disabled={isSorted || isSorting}
            type="button"
          >
            Step
          </button>
          <button
            onClick={primaryActionHandler}
            className={styles.button}
            type="button"
          >
            {primaryActionLabel}
          </button>
        </div>
        <div className={styles.stats}>
          <span>
            Comparisons: <strong>{stats.comparisons}</strong>
          </span>
          <span>
            Accesses: <strong>{stats.accesses}</strong>
          </span>
        </div>
      </div>
      <div className={styles.sortingAlgorithmsContainer} ref={resizeRef}>
        <canvas
          className={styles.sortingAlgorithmsCanvas}
          height={0}
          ref={canvasRef}
          width={0}
        />
      </div>
    </>
  );
}

export default SortingAlgorithms;
