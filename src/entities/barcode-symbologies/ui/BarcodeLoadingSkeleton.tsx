import type { JSX } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import type { BarcodeConfig } from '../model/barcode-symbologies.ts';
import styles from './barcode-loading-skeleton.module.css';

type BarcodeLoadingSkeletonProps = { currentSymbology: BarcodeConfig };

const HORIZONTAL_QUIET_ZONE = 40;

function BarcodeLoadingSkeleton({
  currentSymbology,
}: BarcodeLoadingSkeletonProps): JSX.Element {
  const { loadingDimensions } = currentSymbology;
  const { width, height } = loadingDimensions;
  const totalRenderedWidth = width + HORIZONTAL_QUIET_ZONE * 2;
  const maxWidthPercentage = (width / totalRenderedWidth) * 100;
  const aspectRatio = `${width} / ${height}`;
  const loadingVariables: CssCustomProperty = {
    ...composeCssCustomProperty('loading-barcode-width', `${width}px`),
    ...composeCssCustomProperty('loading-aspect-ratio', aspectRatio),
    ...composeCssCustomProperty('loading-max-width', `${maxWidthPercentage}%`),
  };

  return <div className={styles.loadingCanvas} style={loadingVariables} />;
}

export default BarcodeLoadingSkeleton;
