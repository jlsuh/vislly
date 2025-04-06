const pxToRem = (px: number | string): number => {
  const tempPx = `${px}`.replace('px', '');
  const base = window
    .getComputedStyle(document.documentElement, null)
    .getPropertyValue('font-size');
  return (1 / Number.parseFloat(base)) * Number.parseInt(tempPx);
};

export default pxToRem;
