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
import { GREEN, RED, WHITE } from '@/shared/lib/rgba.ts';
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
import { SortingStats } from '../model/sorting-stats.ts';
import { SortingStatus } from '../model/sorting-status.ts';
import {
  type HighlightGroup,
  type SortingStrategyYield,
  SortOperationType,
} from '../model/sorting-strategy.ts';
import TheSoundOfSortingControls from './TheSoundOfSortingControls.tsx';
import TheSoundOfSortingStats from './TheSoundOfSortingStats.tsx';
import styles from './the-sound-of-sorting.module.css';

const BASE_STEPS_PER_FRAME = 73;
const GAP_THRESHOLD_RATIO = 2.5;
const INITIAL_MAX_RANGE = 200;
const INITIAL_RESIZE_DIMENSIONS: ResizeDimensions = { height: 0, width: 0 };
const INITIAL_STATS = new SortingStats(0, 0, 0, 0);
const VERIFICATION_TONE_DURATION_MS = 30;

function composePendingExecutionTimeMs(
  delay: number,
  pendingExecutionTimeMs: number,
  Δt: number,
): number {
  if (delay === 0) {
    return 0;
  }
  return pendingExecutionTimeMs + Δt;
}

function composeBatchedStepsPerFrame(
  delay: number,
  pendingExecutionTimeMs: number,
): number {
  if (delay === 0) {
    return BASE_STEPS_PER_FRAME;
  }
  return Math.floor(pendingExecutionTimeMs / delay);
}

function composeBatchedAudioStepsPerFrame(delay: number): number {
  if (delay === 0) {
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
    ctx.fillStyle = activeHighlightsRef.current.get(i) || WHITE;
    ctx.beginPath();
    ctx.rect(xi, yi, xf, yf);
    ctx.fill();
  }
}

function TheSoundOfSorting(): JSX.Element {
  const [delay, setDelay] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [maxRange, setMaxRange] = useState(INITIAL_MAX_RANGE);
  const [sortingAlgorithm, setSortingAlgorithm] = useState(
    INITIAL_SORTING_ALGORITHM,
  );
  const [stats, setStats] = useState(INITIAL_STATS.deepCopy());
  const [status, setStatus] = useState<SortingStatus>(SortingStatus.Idle);

  const activeHighlightsRef = useRef<Map<number, string>>(new Map());
  const animationFrameIdRef = useRef<number>(null);
  const arrayRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const delayRef = useRef(delay);
  const initialArrayRef = useRef<number[]>([]);
  const isMutedRef = useRef(isMuted);
  const sortingAlgorithmRef = useRef(sortingAlgorithm);
  const sortingGeneratorRef =
    useRef<Generator<SortingStrategyYield, void, unknown>>(null);
  const statsRef = useRef(INITIAL_STATS.deepCopy());
  const statusRef = useRef<SortingStatus>(SortingStatus.Idle);
  const verificationIndexRef = useRef(0);

  const { dimensions, resizeRef } = useResizeDimensions<HTMLDivElement>(
    INITIAL_RESIZE_DIMENSIONS,
  );

  const { initAudio, playTone } = useTheSoundOfSortingAudio();

  const updateStatus = useCallback((newStatus: SortingStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  const cancelAnimationFrameIfAny = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, []);

  const reset = useCallback(
    (shouldGenerateNewValues: boolean) => {
      cancelAnimationFrameIfAny();
      updateStatus(SortingStatus.Idle);
      verificationIndexRef.current = 0;
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
      statsRef.current = INITIAL_STATS.deepCopy();
      setStats(INITIAL_STATS.deepCopy());
      activeHighlightsRef.current.clear();
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
    },
    [cancelAnimationFrameIfAny, maxRange, updateStatus],
  );

  function applySortStepEffects({
    highlightGroups,
    shouldArbitrarilySkipTone,
    toneDurationMs,
    type,
  }: {
    highlightGroups: HighlightGroup[];
    shouldArbitrarilySkipTone: boolean;
    toneDurationMs: number;
    type: SortOperationType;
  }): void {
    const shouldPlayTone =
      !(shouldArbitrarilySkipTone || isMutedRef.current) &&
      type === SortOperationType.Compare;
    for (const group of highlightGroups) {
      for (const index of group.indices) {
        activeHighlightsRef.current.set(index, group.color);
        if (shouldPlayTone && !group.skipHighlightGroupTone) {
          playTone({
            maxRange,
            toneDurationMs,
            value: arrayRef.current[index],
          });
        }
      }
    }
  }

  const processSortFrame = (
    shouldArbitrarilySkipTone: boolean,
    toneDurationMs: number,
  ): boolean => {
    if (sortingGeneratorRef.current === null) {
      throw new Error('Sorting generator ref is null');
    }
    const { done, value } = sortingGeneratorRef.current.next();
    if (done) {
      activeHighlightsRef.current.clear();
      setNewStats();
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
      return true;
    }
    statsRef.current
      .addAccesses(value.accessCount)
      .addAssignments(value.assignmentCount)
      .addComparisons(value.comparisonCount)
      .addSwaps(value.swapCount);
    activeHighlightsRef.current.clear();
    applySortStepEffects({
      highlightGroups: value.highlights,
      shouldArbitrarilySkipTone,
      toneDurationMs,
      type: value.type,
    });
    setNewStats();
    draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
    return false;
  };

  const processVerificationFrame = useCallback(
    (stepsToExec: number): boolean => {
      for (let i = 0; i < stepsToExec; i++) {
        const idx = verificationIndexRef.current;
        if (idx === arrayRef.current.length) {
          activeHighlightsRef.current.clear();
          draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
          updateStatus(SortingStatus.Finished);
          return true;
        }
        if (arrayRef.current[idx] > arrayRef.current[idx + 1]) {
          cancelAnimationFrameIfAny();
          activeHighlightsRef.current.clear();
          draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
          updateStatus(SortingStatus.Finished);
          throw new Error('Sorting verification failed');
        }
        if (idx > 0) {
          activeHighlightsRef.current.set(idx - 1, GREEN);
        }
        activeHighlightsRef.current.set(idx, RED);
        if (!isMutedRef.current) {
          playTone({
            maxRange,
            toneDurationMs: VERIFICATION_TONE_DURATION_MS,
            value: arrayRef.current[idx],
          });
        }
        verificationIndexRef.current += 1;
      }
      draw({ activeHighlightsRef, arrayRef, canvasRef, maxRange });
      return false;
    },
    [maxRange, cancelAnimationFrameIfAny, playTone, updateStatus],
  );

  const executeVerificationLoop = useCallback(() => {
    updateStatus(SortingStatus.Verifying);
    let previousTime = performance.now();
    let pendingExecutionTimeMs = 0;
    const loop = (currentTime: number) => {
      const Δt = currentTime - previousTime;
      previousTime = currentTime;
      let batchedSteps = 3;
      if (delayRef.current > 0) {
        batchedSteps = Math.floor(pendingExecutionTimeMs / delayRef.current);
        pendingExecutionTimeMs += Δt;
      }
      if (batchedSteps > 0) {
        const isLastVerificationFrame = processVerificationFrame(batchedSteps);
        if (isLastVerificationFrame) {
          return;
        }
        if (delayRef.current > 0) {
          pendingExecutionTimeMs -= batchedSteps * delayRef.current;
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
  }, [processVerificationFrame, updateStatus]);

  const executeSortingLoop = () => {
    initAudio();
    updateStatus(SortingStatus.Sorting);
    let previousTime = performance.now();
    let pendingExecutionTimeMs = 0;
    const loop = (currentTime: number) => {
      const Δt = currentTime - previousTime;
      previousTime = currentTime;
      pendingExecutionTimeMs = composePendingExecutionTimeMs(
        delayRef.current,
        pendingExecutionTimeMs,
        Δt,
      );
      const batchedSteps = composeBatchedStepsPerFrame(
        delayRef.current,
        pendingExecutionTimeMs,
      );
      const batchedAudioStep = composeBatchedAudioStepsPerFrame(
        delayRef.current,
      );
      for (let i = 0; i < batchedSteps; i += 1) {
        const shouldArbitrarilySkipTone = i % batchedAudioStep !== 0;
        const isLastSortingFrame = processSortFrame(
          shouldArbitrarilySkipTone,
          20,
        );
        if (isLastSortingFrame) {
          executeVerificationLoop();
          return;
        }
      }
      pendingExecutionTimeMs -= batchedSteps * delayRef.current;
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
  };

  const handleStep = () => {
    initAudio();
    if (statusRef.current === SortingStatus.ReadyToResumeVerifying) {
      processVerificationFrame(1);
      return;
    }
    const isLastSortingFrame = processSortFrame(false, 100);
    if (isLastSortingFrame) {
      updateStatus(SortingStatus.ReadyToResumeVerifying);
    }
  };

  const setNewSortingAlgorithm = (newAlgorithm: SortingAlgorithm) => {
    sortingAlgorithmRef.current = newAlgorithm;
    setSortingAlgorithm(sortingAlgorithmRef.current);
  };

  const setNewDelay = (newDelay: number) => {
    delayRef.current = newDelay;
    setDelay(delayRef.current);
  };

  const setNewStats = () => {
    setStats(statsRef.current.deepCopy());
  };

  const handlePause = () => {
    cancelAnimationFrameIfAny();
    if (status === SortingStatus.Verifying) {
      updateStatus(SortingStatus.ReadyToResumeVerifying);
    } else {
      updateStatus(SortingStatus.ReadyToResumeSorting);
    }
    setNewStats();
  };

  const handleResume = () => {
    if (status === SortingStatus.ReadyToResumeVerifying) {
      executeVerificationLoop();
    } else {
      executeSortingLoop();
    }
  };

  const toggleMute = () => {
    isMutedRef.current = !isMuted;
    setIsMuted(isMutedRef.current);
  };

  const handleResetWithNewValues = useCallback(() => {
    reset(true);
  }, [reset]);

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
          delay={delay}
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
        delay={delay}
        isMuted={isMuted}
        maxRange={maxRange}
        sortingAlgorithm={sortingAlgorithm}
        status={status}
        handlePause={handlePause}
        handleResetWithNewValues={handleResetWithNewValues}
        handleResume={handleResume}
        handleStep={handleStep}
        reset={reset}
        setMaxRange={setMaxRange}
        setNewDelay={setNewDelay}
        setNewSortingAlgorithm={setNewSortingAlgorithm}
        toggleMute={toggleMute}
      />
    </div>
  );
}

export default TheSoundOfSorting;
