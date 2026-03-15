import type { ComponentType } from 'react';
import {
  BarcodeType,
  type SymbologyConfig,
} from '../model/barcode-symbologies';
import LinearBarcodeLoadingSkeleton from './LinearBarcodeLoadingSkeleton';
import Matrix2DLoadingSkeleton from './Matrix2DLoadingSkeleton';

type SkeletonProps = { currentSymbology: SymbologyConfig };

export const SKELETON_BY_BARCODE_TYPE: Record<
  BarcodeType,
  ComponentType<SkeletonProps>
> = {
  [BarcodeType.Linear]: LinearBarcodeLoadingSkeleton,
  [BarcodeType.Matrix2D]: Matrix2DLoadingSkeleton,
};
