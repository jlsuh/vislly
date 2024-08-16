type Dimensions = {
  boundedHeight: number;
  boundedWidth: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  /**
   * Will be set to the current height of the ref element if set to 0.
   * Otherwise, height will be fixed to the provided height.
   *
   * @see {@link useChartDimensions}
   */
  height: number;
  /**
   * Will be set to the current width of the ref element if set to 0.
   * Otherwise, width will be fixed to the provided width.
   *
   * @see {@link useChartDimensions}
   */
  width: number;
};

export type { Dimensions };
