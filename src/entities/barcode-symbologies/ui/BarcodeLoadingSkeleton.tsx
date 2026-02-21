import type { JSX } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import { composeRandomFlooredIntegerBetween } from '@/shared/lib/random.ts';
import type { SymbologyConfig } from '../model/barcode-symbologies.ts';
import styles from './barcode-loading-skeleton.module.css';

type BarcodeLoadingSkeletonProps = { currentSymbology: SymbologyConfig };

const HORIZONTAL_QUIET_ZONE = 40;

function BarcodeLoadingSkeleton({
  currentSymbology,
}: BarcodeLoadingSkeletonProps): JSX.Element {
  const { loadingDimensions } = currentSymbology;
  const { width, height } = loadingDimensions;
  const totalRenderedWidth = width + HORIZONTAL_QUIET_ZONE * 2;
  const maxWidthPercentage = (width / totalRenderedWidth) * 100;
  const aspectRatio = `${width} / ${height}`;
  const seed = composeRandomFlooredIntegerBetween(0, 100);
  const loadingVariables: CssCustomProperty = {
    ...composeCssCustomProperty('loading-aspect-ratio', aspectRatio),
    ...composeCssCustomProperty('loading-barcode-width', `${width}px`),
    ...composeCssCustomProperty('loading-max-width', `${maxWidthPercentage}%`),
    ...composeCssCustomProperty('seed', seed),
  };

  return <div className={styles.loadingCanvas} style={loadingVariables} />;
}

export default BarcodeLoadingSkeleton;
