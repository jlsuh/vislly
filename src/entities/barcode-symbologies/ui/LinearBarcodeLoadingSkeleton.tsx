import type { JSX } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import { composeRandomFlooredIntegerBetween } from '@/shared/lib/random.ts';
import type { SymbologyConfig } from '../model/barcode-symbologies.ts';
import styles from './linear-barcode-loading-skeleton.module.css';

type LinearBarcodeLoadingSkeletonProps = { currentSymbology: SymbologyConfig };

function LinearBarcodeLoadingSkeleton({
  currentSymbology,
}: LinearBarcodeLoadingSkeletonProps): JSX.Element {
  const { loadingDimensions, horizontalQuietZone } = currentSymbology;
  const { width, height } = loadingDimensions;
  const totalRenderedWidth = width + horizontalQuietZone * 2;
  const maxWidthPercentage = (width / totalRenderedWidth) * 100;
  const seed = composeRandomFlooredIntegerBetween(0, 100);
  const loadingVariables: CssCustomProperty = {
    ...composeCssCustomProperty('loading-aspect-ratio', `${width}/${height}`),
    ...composeCssCustomProperty('loading-barcode-width', `${width}px`),
    ...composeCssCustomProperty('loading-max-width', `${maxWidthPercentage}%`),
    ...composeCssCustomProperty('seed', seed),
  };

  return <div className={styles.loadingCanvas} style={loadingVariables} />;
}

export default LinearBarcodeLoadingSkeleton;
