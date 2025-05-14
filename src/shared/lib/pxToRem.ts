import getRootFontSize from './getRootFontSize.ts';

function pxToRem(px: number): number {
  const rootFontSize = getRootFontSize();
  return px / rootFontSize;
}

export default pxToRem;
