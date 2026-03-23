import type { ComponentType } from 'react';
import type { ReadonlyDeep } from 'type-fest';
import type { SymbologyConfig } from '../model/barcode-symbologies';

export type BarcodeLoadingSkeletonProps = {
  canvasClassName: string | null;
  currentSymbology: ReadonlyDeep<SymbologyConfig>;
  fontName: string;
};

export type BarcodeLoadingSkeleton = {
  canvasClassName: string | null;
  Component: ComponentType<BarcodeLoadingSkeletonProps>;
};
