import { BarcodeSymbology } from '../model/barcode-symbologies';
import type { BarcodeLoadingSkeleton } from './barcode-loading-skeleton.ts';
import Ean13BarcodeLoadingSkeleton from './Ean13BarcodeLoadingSkeleton.tsx';
import ean13Styles from './ean13-barcode-loading-skeleton.module.css';
import LinearBarcodeLoadingSkeleton from './LinearBarcodeLoadingSkeleton';
import linearStyles from './linear-barcode-loading-skeleton.module.css';
import QrCodeLoadingSkeleton from './QrCodeLoadingSkeleton.tsx';

const SKELETON_BY_BARCODE_SYMBOLOGY: Record<
  BarcodeSymbology,
  BarcodeLoadingSkeleton
> = {
  [BarcodeSymbology.Code128]: {
    Component: LinearBarcodeLoadingSkeleton,
    canvasClassName: linearStyles.loadingCanvas,
  },
  [BarcodeSymbology.Ean13]: {
    Component: Ean13BarcodeLoadingSkeleton,
    canvasClassName: ean13Styles.loadingCanvas,
  },
  [BarcodeSymbology.Itf14]: {
    Component: LinearBarcodeLoadingSkeleton,
    canvasClassName: linearStyles.loadingCanvas,
  },
  [BarcodeSymbology.QrCode]: {
    Component: QrCodeLoadingSkeleton,
    canvasClassName: null,
  },
};

export { SKELETON_BY_BARCODE_SYMBOLOGY };
