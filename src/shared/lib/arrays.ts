function integerRange(start: number, end: number): number[] {
  const length = end - start + 1;
  return [...Array(length).keys()].map((i) => i + start);
}

export { integerRange };
