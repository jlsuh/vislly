function getRootFontSize(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export default getRootFontSize;
