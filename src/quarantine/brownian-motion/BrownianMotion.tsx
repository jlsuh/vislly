import * as d3 from 'd3';
import { useEffect } from 'react';
import useChartDimensions from '../useChartDimensions';

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

// function drawParticle(
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
  particle: {
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
    particle.x + particle.dx > width - particle.radius ||
    particle.x + particle.dx < particle.radius
  ) {
    particle.dx = -particle.dx;
  }
  if (
    particle.y + particle.dy > height - particle.radius ||
    particle.y + particle.dy < particle.radius
  ) {
    particle.dy = -particle.dy;
  }
}

function drawParticle(
  particle: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
  },
  width: number,
  height: number,
  container: HTMLDivElement | null,
  id: string,
) {
  const svg = d3.select(container).select('svg');
  const particleElement = svg.selectAll(`#particle-${id}`).data([particle]);

  particleElement.enter().append('circle').attr('id', `particle-${id}`);

  test(particle, width, height);

  particle.x += particle.dx;
  particle.y += particle.dy;

  particleElement
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.radius)
    .attr('fill', 'black');
}

function getRandomFromInterval(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function composeParticles(width: number, height: number) {
  const particles = [];
  for (let i = 0; i < 500; i++) {
    particles.push({
      x: width / 2,
      y: height / 2,
      dx: getRandomFromInterval(-10, 10),
      dy: getRandomFromInterval(-10, 10),
      radius: 5,
    });
  }
  return particles;
}

function BrownianMotion(): JSX.Element {
  const { ref, dimensions } = useChartDimensions(chartSettings);

  useEffect(() => {
    const particles = composeParticles(
      dimensions.boundedWidth,
      dimensions.boundedHeight,
    );
    // TODO: Consider 10 as masimum velocity
    // dx: 10,
    // dy: -10,
    // dx: Math.random() * 10 + 3,
    // dy: Math.random() * 10 + 3,
    const timer = d3.interval(() => {
      particles.forEach((particle, index) => {
        drawParticle(
          particle,
          dimensions.boundedWidth,
          dimensions.boundedHeight,
          ref.current,
          index.toString(),
        );
      });
    });
    return () => timer.stop();
  }, [dimensions.boundedHeight, dimensions.boundedWidth, ref]);

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

export default BrownianMotion;
