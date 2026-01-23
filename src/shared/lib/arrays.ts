function integerRange(start: number, end: number): number[] {
  const length = Math.max(0, end - start + 1);
  return Array.from({ length }, (_, i) => i + start);
}

export { integerRange };
