function getCanvasCtxByRef(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D {
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

export { getCanvasCtxByRef };
