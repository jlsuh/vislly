import type { JSX } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import { composeRandomFlooredIntegerBetween } from '@/shared/lib/random.ts';
import { generateRandomNumericStringOfLength } from '@/shared/lib/string.ts';
import type { BarcodeLoadingSkeletonProps } from './barcode-loading-skeletons.ts';
import styles from './ean13-barcode-loading-skeleton.module.css';

type Ean13BarcodeLoadingSkeletonProps = BarcodeLoadingSkeletonProps;

function Ean13BarcodeLoadingSkeleton({
  currentSymbology,
  canvasClassName,
  fontName,
}: Ean13BarcodeLoadingSkeletonProps): JSX.Element {
  const { loadingDimensions, horizontalQuietZone, maxInputLength } =
    currentSymbology;
  const { width, height } = loadingDimensions;
  const className = canvasClassName ?? '';
  const fontSizeCqi = (32.8 / width) * 100;
  const totalRenderedWidth = width + horizontalQuietZone * 2;
  const maxWidthPercentage = (width / totalRenderedWidth) * 100;
  const seed = composeRandomFlooredIntegerBetween(0, 100);
  const loadingVariables: CssCustomProperty = {
    ...composeCssCustomProperty('loading-aspect-ratio', `${width}/${height}`),
    ...composeCssCustomProperty('loading-barcode-width', `${width}px`),
    ...composeCssCustomProperty('loading-max-width', `${maxWidthPercentage}%`),
    ...composeCssCustomProperty('seed', seed),
    ...composeCssCustomProperty('loading-font-size', `${fontSizeCqi}cqi`),
    ...composeCssCustomProperty('loading-font-family', fontName),
  };
  const rawText = generateRandomNumericStringOfLength(maxInputLength + 1);

  return (
    <div className={className} style={loadingVariables}>
      <div className={styles.textContainer}>
        <span className={styles.firstDigit}>{rawText[0]}</span>
        <span className={styles.leftGroup}>{rawText.slice(1, 7)}</span>
        <span className={styles.rightGroup}>{rawText.slice(7, 13)}</span>
      </div>
    </div>
  );
}

export default Ean13BarcodeLoadingSkeleton;
