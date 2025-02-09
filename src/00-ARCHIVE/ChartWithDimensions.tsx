import useResizeDimensions from '@/shared/lib/resize-dimension/useResizeDimensions';
import * as d3 from 'd3';
import type { JSX } from 'react';
import Axis from './Axis';

const resizeDimensionsSettings = {
  boundedHeight: 0,
  boundedWidth: 0,
  height: 500, // TODO: Calculate height to occupy 40% of the viewport
  marginBottom: 30,
  marginLeft: 30,
  marginRight: 30,
  marginTop: 30,
  width: 0, // If height is 0, width is calculated
};

const ChartWithDimensions = (): JSX.Element => {
  const { ref, dimensions } = useResizeDimensions(resizeDimensionsSettings);

  const xScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, dimensions.boundedWidth]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg width={dimensions.width} height={dimensions.height}>
        <title>A chart showing information</title>
        <g
          transform={`translate(${[dimensions.marginLeft, dimensions.marginTop].join(',')})`}
        >
          <rect
            width={dimensions.boundedWidth}
            height={dimensions.boundedHeight}
            fill="lavender"
          />
          <g
            transform={`translate(${[0, dimensions.boundedHeight].join(',')})`}
          >
            <Axis domain={xScale.domain()} range={xScale.range()} />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ChartWithDimensions;
