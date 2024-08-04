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

class Particle {
  x: number;
  y: number;
  radius: number;
  mass: number;
  initialAngle: number;
  speed: number;
  dx: number;
  dy: number;
  fill: string;

  constructor(
    x: number,
    y: number,
    radius: number,
    initialAngle: number,
    speed: number,
    fill: string,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = radius;
    this.initialAngle = initialAngle;
    this.speed = speed;
    this.dx = this.speed * Math.cos(this.initialAngle);
    this.dy = this.speed * Math.sin(this.initialAngle);
    this.fill = fill;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  isCollidingWith(particle: Particle) {
    const dx = this.x - particle.x;
    const dy = this.y - particle.y;
    const squaredDistance = dx ** 2 + dy ** 2;
    const squaredRadius = (this.radius + particle.radius) ** 2;
    return squaredDistance <= squaredRadius;
  }
}

function testForWalls(particle: Particle, width: number, height: number) {
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
  particle: Particle,
  container: HTMLDivElement | null,
  id: string,
) {
  const svg = d3.select(container).select('svg');
  const particleElement = svg.selectAll(`#particle-${id}`).data([particle]);
  particleElement.enter().append('circle').attr('id', `particle-${id}`);
  particleElement
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.radius)
    .attr('fill', (d) => d.fill);
}

function update(
  particles: Particle[],
  width: number,
  height: number,
  ref: React.MutableRefObject<null>,
) {
  particles.forEach((particle, index) => {
    drawParticle(particle, ref.current, index.toString());
    testForWalls(particle, width, height);
    particle.move();
  });
}

const NUMBER_OF_PARTICLES = 200;

// TODO: Consider 10 as masimum velocity
// dx: 10,
// dy: -10,
// dx: Math.random() * 10 + 3,
// dy: Math.random() * 10 + 3,
function composeParticles(width: number, height: number) {
  const particles: Particle[] = [];
  for (let i = 0; i < NUMBER_OF_PARTICLES; i++) {
    particles.push(
      new Particle(
        width / 2,
        height / 2,
        5,
        Math.random() * Math.PI * 2,
        Math.random() * 10 + 3,
        'black',
      ),
    );
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
    const timer = d3.interval(() => {
      update(particles, dimensions.boundedWidth, dimensions.boundedHeight, ref);
    });
    return () => timer.stop();
  }, [dimensions.boundedWidth, dimensions.boundedHeight, ref]);

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
