'use client';

import {
  type JSX,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getCanvasCtxByRef } from '@/shared/lib/canvas.ts';
import { composeFisherYatesIntegerRangeShuffle } from '@/shared/lib/random.ts';
import {
  type ResizeDimensions,
  useResizeDimensions,
} from '@/shared/lib/useResizeDimensions.ts';
import useTheSoundOfSortingAudio from '../lib/useTheSoundOfSortingAudio.ts';
import {
  INITIAL_SORTING_ALGORITHM,
  SORTING_ALGORITHMS,
  type SortingAlgorithm,
} from '../model/sorting-algorithms.ts';
import type { SortingStats } from '../model/sorting-stats.ts';
import type {
  HighlightGroup,
  SortingStrategyYield,
  SortOperationType,
} from '../model/sorting-strategy.ts';
import TheSoundOfSortingControls from './TheSoundOfSortingControls.tsx';
import TheSoundOfSortingStats from './TheSoundOfSortingStats.tsx';
import styles from './the-sound-of-sorting.module.css';

const BASE_STEPS_PER_FRAME = 73;
const GAP_THRESHOLD_RATIO = 2.5;
const INITIAL_RANGE_END = 100;
const INITIAL_RESIZE_DIMENSIONS: ResizeDimensions = { height: 0, width: 0 };
const INITIAL_STATS: SortingStats = { accesses: 0, comparisons: 0 };

function composePendingExecutionTimeMs({
  currentSpeed,
  pendingExecutionTimeMs,
  Δt,
}: {
  currentSpeed: number;
  pendingExecutionTimeMs: number;
  Δt: number;
}): number {
  if (currentSpeed === 0) {
    return 0;
  }
  return pendingExecutionTimeMs + Δt;
}

function composeBatchedStepsPerFrame({
  currentSpeed,
  pendingExecutionTimeMs,
}: {
  currentSpeed: number;
  pendingExecutionTimeMs: number;
}): number {
  if (currentSpeed === 0) {
    return BASE_STEPS_PER_FRAME;
  }
  return Math.floor(pendingExecutionTimeMs / currentSpeed);
}

function composeBatchedAudioStepsPerFrame({
  currentSpeed,
}: {
  currentSpeed: number;
}): number {
  if (currentSpeed === 0) {
    return 15;
  }
  return 1;
}

function draw({
  activeHighlightsRef,
  arrayRef,
  canvasRef,
  maxRange,
}: {
  activeHighlightsRef: RefObject<Map<number, string>>;
  arrayRef: RefObject<number[]>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  maxRange: number;
}) {
  if (canvasRef.current === null) {
    throw new Error('Canvas ref is null');
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
    const yf = (arrayRef.current[i] * height) / maxRange;
    ctx.fillStyle = activeHighlightsRef.current.get(i) || '#ffffff';
    ctx.beginPath();
    ctx.rect(xi, yi, xf, yf);
    ctx.fill();
  }
}

function TheSoundOfSorting(): JSX.Element {
  const [isSorted, setIsSorted] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [maxRange, setMaxRange] = useState(INITIAL_RANGE_END);
  const [sortingAlgorithm, setSortingAlgorithm] = useState(
    INITIAL_SORTING_ALGORITHM,
  );
  const [speed, setSpeed] = useState(0);
  const [stats, setStats] = useState({ ...INITIAL_STATS });
  const [isMuted, setIsMuted] = useState(false);

  const activeHighlightsRef = useRef<Map<number, string>>(new Map());
  const animationFrameIdRef = useRef<number>(null);
  const arrayRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialArrayRef = useRef<number[]>([]);
  const sortingAlgorithmRef = useRef(sortingAlgorithm);
  const sortingGeneratorRef =
    useRef<Generator<SortingStrategyYield, void, unknown>>(null);
  const speedRef = useRef(speed);
  const statsRef = useRef({ ...INITIAL_STATS });
  const isMutedRef = useRef(isMuted);

  const { dimensions, resizeRef } = useResizeDimensions<HTMLDivElement>(
    INITIAL_RESIZE_DIMENSIONS,
  );

  const { initAudio, playTone } = useTheSoundOfSortingAudio();

  const cancelAnimationFrameIfAny = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, []);

  const reset = useCallback(
    (shouldGenerateNewValues: boolean) => {
      cancelAnimationFrameIfAny();
      setIsSorting(false);
      setIsSorted(false);
      if (shouldGenerateNewValues || initialArrayRef.current.length === 0) {
        initialArrayRef.current = composeFisherYatesIntegerRangeShuffle(
          1,
          maxRange,
        );
      }
      arrayRef.current = [...initialArrayRef.current];
      sortingGeneratorRef.current = SORTING_ALGORITHMS[
        sortingAlgorithmRef.current
      ].strategy.generator({ array: arrayRef.current });
      statsRef.current = { ...INITIAL_STATS };
      setStats({ ...INITIAL_STATS });
      activeHighlightsRef.current.clear();
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
    },
    [maxRange, cancelAnimationFrameIfAny],
  );

  function applySortStepEffects({
    highlightGroups,
    shouldPlaySound,
    toneDurationMs,
    type,
  }: {
    highlightGroups: HighlightGroup[];
    shouldPlaySound: boolean;
    toneDurationMs: number;
    type: SortOperationType;
  }): void {
    const isAudioEnabled =
      !isMutedRef.current && type === 'compare' && shouldPlaySound;
    for (const group of highlightGroups) {
      for (const index of group.indices) {
        activeHighlightsRef.current.set(index, group.color);
        if (isAudioEnabled) {
          playTone({
            maxRange,
            toneDurationMs,
            value: arrayRef.current[index],
          });
        }
      }
    }
  }

  const processStep = (
    shouldDraw: boolean,
    shouldPlaySound: boolean,
    toneDurationMs: number,
  ): boolean => {
    if (sortingGeneratorRef.current === null) {
      throw new Error('Sorting generator ref is null');
    }
    const { done, value } = sortingGeneratorRef.current.next();
    if (done) {
      setIsSorting(false);
      setIsSorted(true);
      activeHighlightsRef.current.clear();
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
      setNewStats();
      return true;
    }
    statsRef.current.comparisons += value.compareCount;
    statsRef.current.accesses += value.accessCount;
    activeHighlightsRef.current.clear();
    applySortStepEffects({
      highlightGroups: value.highlights,
      shouldPlaySound,
      toneDurationMs,
      type: value.type,
    });
    if (shouldDraw) {
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
    }
    return false;
  };

  const executeSortingLoop = () => {
    initAudio();
    let previousTime = performance.now();
    let pendingExecutionTimeMs = 0;
    const loop = (currentTime: number) => {
      const Δt = currentTime - previousTime;
      previousTime = currentTime;
      pendingExecutionTimeMs = composePendingExecutionTimeMs({
        currentSpeed: speedRef.current,
        pendingExecutionTimeMs,
        Δt,
      });
      const batchedSteps = composeBatchedStepsPerFrame({
        currentSpeed: speedRef.current,
        pendingExecutionTimeMs,
      });
      const batchedAudioStep = composeBatchedAudioStepsPerFrame({
        currentSpeed: speedRef.current,
      });
      for (let i = 0; i < batchedSteps; i += 1) {
        const shouldPlaySound = i % batchedAudioStep === 0;
        const isGeneratorDone = processStep(false, shouldPlaySound, 20);
        if (isGeneratorDone) {
          return;
        }
      }
      pendingExecutionTimeMs -= batchedSteps * speedRef.current;
      setNewStats();
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
  };

  const handleStep = () => {
    initAudio();
    setIsSorting(false);
    const isGeneratorDone = processStep(true, true, 100);
    if (!isGeneratorDone) {
      setNewStats();
    }
  };

  const handleResetWithNewValues = useCallback(() => {
    reset(true);
  }, [reset]);

  const setNewSortingAlgorithm = (newAlgorithm: SortingAlgorithm) => {
    sortingAlgorithmRef.current = newAlgorithm;
    setSortingAlgorithm(sortingAlgorithmRef.current);
  };

  const setNewSpeed = (newSpeed: number) => {
    speedRef.current = newSpeed;
    setSpeed(speedRef.current);
  };

  const setNewStats = () => {
    setStats({ ...statsRef.current });
  };

  const toggleMute = () => {
    isMutedRef.current = !isMuted;
    setIsMuted(isMutedRef.current);
  };

  useEffect(() => {
    if (canvasRef.current === null) {
      throw new Error('Canvas ref is null');
    }
    if (dimensions.width === 0 || dimensions.height === 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = dimensions.width * dpr;
    canvasRef.current.height = dimensions.height * dpr;
    if (arrayRef.current.length > 0) {
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
    }
  }, [dimensions.width, dimensions.height, maxRange]);

  useEffect(() => {
    handleResetWithNewValues();
  }, [handleResetWithNewValues]);

  return (
    <div className={styles.theSoundOfSortingContainer}>
      <div className={styles.canvasContainer}>
        <TheSoundOfSortingStats
          algorithm={sortingAlgorithm}
          speed={speed}
          stats={stats}
        />
        <div className={styles.canvasWrapper} ref={resizeRef}>
          <canvas
            className={styles.canvas}
            height={0}
            ref={canvasRef}
            width={0}
          />
        </div>
      </div>
      <TheSoundOfSortingControls
        isMuted={isMuted}
        isSorted={isSorted}
        isSorting={isSorting}
        maxRange={maxRange}
        sortingAlgorithm={sortingAlgorithm}
        speed={speed}
        cancelAnimationFrameIfAny={cancelAnimationFrameIfAny}
        executeSortingLoop={executeSortingLoop}
        handleResetWithNewValues={handleResetWithNewValues}
        handleStep={handleStep}
        reset={reset}
        setIsSorting={setIsSorting}
        setNewSortingAlgorithm={setNewSortingAlgorithm}
        setNewSpeed={setNewSpeed}
        setNewStats={setNewStats}
        setMaxRange={setMaxRange}
        toggleMute={toggleMute}
      />
    </div>
  );
}

export default TheSoundOfSorting;
