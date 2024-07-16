import * as d3 from 'd3';
import Axis from './Axis';
import useChartDimensions from './useChartDimensions';

const chartSettings = {
  width: 0, // If height is 0, the width is calculated
  // Calculate height to occupy 40% of the viewport
  height: 500,
  marginTop: 30,
  marginRight: 30,
  marginBottom: 30,
  marginLeft: 30,
};

const ChartWithDimensions = () => {
  const { ref, newDimensions } = useChartDimensions(chartSettings);

  const xScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, newDimensions.boundedWidth]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg width={newDimensions.width} height={newDimensions.height}>
        <title>A chart showing information</title>
        <g
          transform={`translate(${[newDimensions.marginLeft, newDimensions.marginTop].join(',')})`}
        >
          <rect
            width={newDimensions.boundedWidth}
            height={newDimensions.boundedHeight}
            fill="lavender"
          />
          <g
            transform={`translate(${[0, newDimensions.boundedHeight].join(',')})`}
          >
            <Axis domain={xScale.domain()} range={xScale.range()} />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ChartWithDimensions;
