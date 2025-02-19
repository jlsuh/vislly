function generateDataset(): number[][] {
  return new Array(100)
    .fill(0)
    .map((_, i) => [i, Math.random() * 80 + 10, Math.random() * 35 + 10]);
}

export default generateDataset;
