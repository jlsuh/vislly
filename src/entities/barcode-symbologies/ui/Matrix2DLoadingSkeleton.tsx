import type { JSX } from 'react';
import {
  type CssCustomProperty,
  composeCssCustomProperty,
} from '@/shared/lib/css.ts';
import type { SymbologyConfig } from '../model/barcode-symbologies.ts';
import styles from './matrix-2d-loading-skeleton.module.css';

type BarcodeLoadingSkeletonProps = { currentSymbology: SymbologyConfig };

const QR_GRID_SIZE = 21;
const TOTAL_MODULES = QR_GRID_SIZE * QR_GRID_SIZE;

function isFinderPattern(x: number, y: number) {
  const inTopLeft = x <= 7 && y <= 7;
  const inTopRight = x >= 13 && y <= 7;
  const inBottomLeft = x <= 7 && y >= 13;
  return inTopLeft || inTopRight || inBottomLeft;
}

function generateModules() {
  const modules: string[] = [];
  for (let i = 0; i < TOTAL_MODULES; ++i) {
    const x = i % QR_GRID_SIZE;
    const y = Math.floor(i / QR_GRID_SIZE);
    if (!isFinderPattern(x, y) && Math.random() > 0.5) {
      modules.push(`${x}em ${y}em currentColor`);
    }
  }
  return modules.join(', ');
}

function Matrix2DLoadingSkeleton({
  currentSymbology,
}: BarcodeLoadingSkeletonProps): JSX.Element {
  const { loadingDimensions } = currentSymbology;
  const { width } = loadingDimensions;
  const loadingVariables: CssCustomProperty = {
    ...composeCssCustomProperty('loading-barcode-width', `${width}px`),
    ...composeCssCustomProperty('qr-modules', generateModules()),
  };

  return (
    <div className={styles.loadingCanvas} style={loadingVariables}>
      <div className={styles.qrCode} />
    </div>
  );
}

export default Matrix2DLoadingSkeleton;
