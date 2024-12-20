import useChartDimensions from '@/shared/lib/chart/useChartDimensions';
import * as d3 from 'd3';
import { type JSX, useEffect } from 'react';

// First approach

const chartSettings = {
  boundedHeight: 0,
  boundedWidth: 0,
  height: 500, // TODO: Calculate height to occupy 40% of the viewport
  marginBottom: 30,
  marginLeft: 30,
  marginRight: 30,
  marginTop: 30,
  width: 0, // If height is 0, the width is calculated
};

// function drawBall(
//   e:
//     | React.MouseEvent<SVGGElement, MouseEvent>
//     | React.KeyboardEvent<SVGGElement>,
//   width: number,
//   height: number,
// ) {
//   const { target } = e;
//   const [x, y] = d3.pointer(e, target);
//   d3.select(target as SVGGElement)
//     .append('circle')
//     .attr('cx', Math.min(width, x))
//     .attr('cy', Math.min(height, y))
//     .attr('r', 5)
//     .attr('fill', 'black');
// }

function test(
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
  },
  width: number,
  height: number,
) {
  if (
    ball.x + ball.dx > width - ball.radius ||
    ball.x + ball.dx < ball.radius
  ) {
    ball.dx = -ball.dx;
  }
  if (
    ball.y + ball.dy > height - ball.radius ||
    ball.y + ball.dy < ball.radius
  ) {
    ball.dy = -ball.dy;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;
}

function drawBall(
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
  },
  width: number,
  height: number,
  current: HTMLDivElement | null,
) {
  const svg = d3.select(current).select('svg');
  const ballElement = svg.selectAll('circle').data([ball]);

  ballElement.enter().append('circle');

  test(ball, width, height);

  ballElement
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.radius)
    .attr('fill', 'black');
}

function BouncingBall(): JSX.Element {
  const { ref, dimensions } = useChartDimensions(chartSettings);

  useEffect(() => {
    // TODO: Consider 10 as masimum velocity
    // dx: 10,
    // dy: -10,
    // dx: Math.random() * 10 + 3,
    // dy: Math.random() * 10 + 3,
    const ball = {
      x: dimensions.boundedWidth / 2,
      y: dimensions.boundedHeight / 2,
      dx: Math.random() * 10 + 3,
      dy: Math.random() * 10 + 3,
      radius: 10,
    };
    const timer = d3.interval(() => {
      drawBall(
        ball,
        dimensions.boundedWidth,
        dimensions.boundedHeight,
        ref.current,
      );
    });
    return () => timer.stop();
  }, [dimensions.boundedWidth, dimensions.boundedHeight, ref.current]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg
        style={{
          width: dimensions.boundedWidth,
          height: dimensions.boundedHeight,
          border: '1px solid black',
        }}
      />
    </div>
  );
}

export default BouncingBall;
