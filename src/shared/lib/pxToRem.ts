import getRootFontSize from './getRootFontSize.ts';

const pxToRem = (px: number): number => {
  const rootFontSize = getRootFontSize();
  return px / rootFontSize;
};

export default pxToRem;
