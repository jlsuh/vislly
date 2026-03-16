import type { ComponentType } from 'react';
import {
  BarcodeSymbology,
  type SymbologyConfig,
} from '../model/barcode-symbologies';
import LinearBarcodeLoadingSkeleton from './LinearBarcodeLoadingSkeleton';
import QrCodeLoadingSkeleton from './QrCodeLoadingSkeleton.tsx';

type SkeletonProps = { currentSymbology: SymbologyConfig };

export const SKELETON_BY_BARCODE_SYMBOLOGY: Record<
  BarcodeSymbology,
  ComponentType<SkeletonProps>
> = {
  [BarcodeSymbology.Code128]: LinearBarcodeLoadingSkeleton,
  [BarcodeSymbology.Ean13]: LinearBarcodeLoadingSkeleton,
  [BarcodeSymbology.Itf14]: LinearBarcodeLoadingSkeleton,
  [BarcodeSymbology.QrCode]: QrCodeLoadingSkeleton,
};
