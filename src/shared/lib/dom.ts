function getElementByCoordinates(row: number, col: number): Element {
  const element = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  if (element === null) {
    throw new Error(`Element not found at coordinates (${row}, ${col})`);
  }
  return element;
}

export { getElementByCoordinates };
