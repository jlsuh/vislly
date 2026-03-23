import type { JSX } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import { composeRandomFlooredIntegerBetween } from '@/shared/lib/random.ts';
import { generateRandomNumericStringOfLength } from '@/shared/lib/string.ts';
import type { BarcodeLoadingSkeletonProps } from './barcode-loading-skeleton';

type LinearBarcodeLoadingSkeletonProps = BarcodeLoadingSkeletonProps;

function LinearBarcodeLoadingSkeleton({
  currentSymbology,
  canvasClassName,
  fontName,
}: LinearBarcodeLoadingSkeletonProps): JSX.Element {
  const {
    loadingDimensions,
    horizontalQuietZone,
    rightPaddingChar,
    maxInputLength,
  } = currentSymbology;
  const { width, height } = loadingDimensions;
  const checksumDigits = currentSymbology.checksumDigits ?? 0;
  const className = canvasClassName ?? '';
  const fontSizeCqi = (32.8 / width) * 100;
  const totalRenderedWidth = width + horizontalQuietZone * 2;
  const maxWidthPercentage = (width / totalRenderedWidth) * 100;
  const seed = composeRandomFlooredIntegerBetween(0, 100);
  const skeletonText = rightPaddingChar
    ? `"${generateRandomNumericStringOfLength(maxInputLength + checksumDigits)}"`
    : '""';
  const loadingVariables: CssCustomProperty = {
    ...composeCssCustomProperty('loading-aspect-ratio', `${width}/${height}`),
    ...composeCssCustomProperty('loading-barcode-width', `${width}px`),
    ...composeCssCustomProperty('loading-max-width', `${maxWidthPercentage}%`),
    ...composeCssCustomProperty('seed', seed),
    ...composeCssCustomProperty('loading-text', skeletonText),
    ...composeCssCustomProperty('loading-font-size', `${fontSizeCqi}cqi`),
    ...composeCssCustomProperty('loading-font-family', fontName),
  };

  return <div className={className} style={loadingVariables} />;
}

export default LinearBarcodeLoadingSkeleton;
