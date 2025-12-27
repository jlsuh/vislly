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
import Select from '@/shared/ui/Select/Select.tsx';
import {
  assertIsSortingAlgorithm,
  INITIAL_SORTING_ALGORITHM,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
} from '../model/sorting-algorithms.ts';
import type { SortingStrategyYield } from '../model/sorting-strategy.ts';
import styles from './the-sound-of-sorting.module.css';

const BASE_STEPS_PER_FRAME = 203;
const INITIAL_RESIZE_DIMENSIONS: ResizeDimensions = {
  height: 0,
  width: 0,
};
const GAP_THRESHOLD_RATIO = 2.5;

function composeFisherYatesIntegerRangeShuffle(start: number, end: number) {
  return fisherYatesShuffle(integerRange(start, end));
}

function draw({
  activeHighlightsRef,
  arrayRef,
  canvasRef,
  rangeEnd,
}: {
  activeHighlightsRef: RefObject<Map<number, string>>;
  arrayRef: RefObject<number[]>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  rangeEnd: number;
}) {
  if (canvasRef.current === null || arrayRef.current.length === 0) {
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

function TheSoundOfSorting(): JSX.Element {
  const [sortingAlgorithm, setSortingAlgorithm] = useState<SortingAlgorithm>(
    INITIAL_SORTING_ALGORITHM,
  );
  const [isSorted, setIsSorted] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [rangeEnd, setRangeEnd] = useState(100);
  const [speed, setSpeed] = useState(0);
  const [stats, setStats] = useState({ comparisons: 0, accesses: 0 });

  const activeHighlightsRef = useRef<Map<number, string>>(new Map());
  const sortingAlgorithmRef = useRef(sortingAlgorithm);
  const animationFrameIdRef = useRef<number | null>(null);
  const arrayRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialArrayRef = useRef<number[]>([]);
  const sortingGeneratorRef =
    useRef<Generator<SortingStrategyYield, void, unknown>>(null);
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
      sortingGeneratorRef.current = SORTING_ALGORITHMS[
        sortingAlgorithmRef.current
      ].strategy.generator({ array: arrayRef.current });
      statsRef.current = { comparisons: 0, accesses: 0 };
      setStats({ comparisons: 0, accesses: 0 });
      activeHighlightsRef.current.clear();
      draw({ activeHighlightsRef, arrayRef, canvasRef, rangeEnd });
    },
    [rangeEnd],
  );

  const processStep = (shouldDraw: boolean): SortingStrategyYield | null => {
    if (sortingGeneratorRef.current === null) {
      return null;
    }
    const { done, value } = sortingGeneratorRef.current.next();
    if (done) {
      setIsSorting(false);
      setIsSorted(true);
      activeHighlightsRef.current.clear();
      draw({ activeHighlightsRef, arrayRef, canvasRef, rangeEnd });
      setStats({ ...statsRef.current });
      return null;
    }
    statsRef.current.comparisons += value.compareCount;
    statsRef.current.accesses += value.accessCount;
    activeHighlightsRef.current.clear();
    for (const group of value.highlights) {
      for (const index of group.indices) {
        activeHighlightsRef.current.set(index, group.color);
      }
    }
    if (shouldDraw) {
      draw({ activeHighlightsRef, arrayRef, canvasRef, rangeEnd });
    }
    return value;
  };

  const executeBatch = (batchedSteps: number): boolean => {
    for (let i = 0; i < batchedSteps; i += 1) {
      if (processStep(false) === null) {
        return true;
      }
    }
    return false;
  };

  const executeSortingLoop = () => {
    let previousTime = performance.now();
    let pendingExecutionTimeMs = 0;
    const loop = (currentTime: number) => {
      const Δt = currentTime - previousTime;
      previousTime = currentTime;
      pendingExecutionTimeMs =
        speedRef.current > 0 ? pendingExecutionTimeMs + Δt : 0;
      const batchedSteps =
        speedRef.current === 0
          ? BASE_STEPS_PER_FRAME
          : Math.floor(pendingExecutionTimeMs / speedRef.current);
      if (executeBatch(batchedSteps)) {
        return;
      }
      pendingExecutionTimeMs -= batchedSteps * speedRef.current;
      setStats({ ...statsRef.current });
      draw({ activeHighlightsRef, arrayRef, canvasRef, rangeEnd });
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
  };

  const handleStep = () => {
    setIsSorting(false);
    const result = processStep(true);
    if (result !== null) {
      setStats({ ...statsRef.current });
    }
  };

  const handleReset = () => {
    reset(false);
  };

  const handleSortAgain = () => {
    handleReset();
    handleSort();
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

  const handleOnChangeSpeed = (e: ChangeEvent<HTMLInputElement>) => {
    speedRef.current = Number(e.target.value);
    setSpeed(speedRef.current);
  };

  const handleOnChangeRangeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setRangeEnd(Number(e.target.value));
  };

  const handleOnChangeAlgorithm = (e: ChangeEvent<HTMLSelectElement>) => {
    const newAlgorithm = e.target.value;
    assertIsSortingAlgorithm(newAlgorithm);
    setSortingAlgorithm(newAlgorithm);
    sortingAlgorithmRef.current = newAlgorithm;
    reset(false);
  };

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    if (dimensions.width === 0 || dimensions.height === 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = dimensions.width * dpr;
    canvasRef.current.height = dimensions.height * dpr;
    if (arrayRef.current.length > 0) {
      draw({ activeHighlightsRef, arrayRef, canvasRef, rangeEnd });
    }
  }, [dimensions.width, dimensions.height, rangeEnd]);

  useEffect(() => {
    reset(true);
  }, [reset]);

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <Select
            disabled={isSorting}
            handleOnSelectChange={handleOnChangeAlgorithm}
            label="Algorithm"
            options={Object.values(SORTING_ALGORITHMS).map(
              ({ key, label }) => ({ value: key, label }),
            )}
            value={sortingAlgorithm}
          />
        </div>
        <div className={styles.controlRow}>
          <label htmlFor={countRangeInputId}>
            Items: <strong>{rangeEnd}</strong>
          </label>
          <input
            id={countRangeInputId}
            max="1000"
            min="100"
            onChange={handleOnChangeRangeEnd}
            step="100"
            type="range"
            value={rangeEnd}
          />
        </div>
        <div className={styles.controlRow}>
          <label htmlFor={speedRangeInputId}>
            Speed delay: <strong>{speed}ms</strong>
          </label>
          <input
            id={speedRangeInputId}
            max="100"
            min="0"
            onChange={handleOnChangeSpeed}
            step="10"
            type="range"
            value={speed}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleReset} type="button">
            Reset
          </button>
          <button
            className={styles.button}
            disabled={isSorted || isSorting}
            onClick={handleStep}
            type="button"
          >
            Step
          </button>
          <button
            className={styles.button}
            onClick={primaryActionHandler}
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
      <div className={styles.container} ref={resizeRef}>
        <canvas
          className={styles.canvas}
          height={0}
          ref={canvasRef}
          width={0}
        />
      </div>
    </>
  );
}

export default TheSoundOfSorting;
