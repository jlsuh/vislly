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
  dx: number;
  dy: number;
  fill: string;
  id: string;

  constructor(
    x: number,
    y: number,
    radius: number,
    initialAngle: number,
    initialVelocity: number,
    fill: string,
    id: string,
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = radius;
    this.dx = initialVelocity * Math.cos(initialAngle);
    this.dy = initialVelocity * Math.sin(initialAngle);
    this.fill = fill;
    this.id = id;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }

  isCollidingWith(p: Particle) {
    const dx = this.x - p.x;
    const dy = this.y - p.y;
    const squaredDistance = dx ** 2 + dy ** 2;
    const squaredRadius = (this.radius + p.radius) ** 2;
    return squaredDistance < squaredRadius;
  }
}

function testForWalls(p: Particle, width: number, height: number) {
  if (p.x + p.dx >= width - p.radius || p.x + p.dx <= p.radius) {
    p.dx = -p.dx;
  }
  if (p.y + p.dy >= height - p.radius || p.y + p.dy <= p.radius) {
    p.dy = -p.dy;
  }
}

function drawParticle(p: Particle, container: HTMLDivElement | null) {
  const svg = d3.select(container).select('svg');
  const particleElement = svg.selectAll(`#particle-${p.id}`).data([p]);
  particleElement.enter().append('circle').attr('id', `particle-${p.id}`);
  particleElement
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.radius)
    .attr('fill', (d) => d.fill);
  if (p.id === 'tracked-particle') {
    // TODO: draw a line from the tracked particle to the other particles
    // const line = svg.selectAll(`#path-${particle.id}`).data([particle]);
    // line.enter().append('path');
    // line
    //   .attr('id', `path-${particle.id}`)
    //   .attr(
    //     'd',
    //     `M${particle.x},${particle.y} L${particle.x + particle.dx * 0.5},${particle.y + particle.dy * 0.5}`,
    //   )
    //   .attr('stroke', 'grey')
    //   .attr('stroke-width', 2)
    //   .attr('stroke-linejoin', 'round')
    //   .attr('stroke-linecap', 'round')
    //   .attr('stroke-miterlimit', 2);
  }
}

// TODO: Make coefficient of restitution variable
function collide(p1: Particle, p2: Particle) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dvx = p1.dx - p2.dx;
  const dvy = p1.dy - p2.dy;
  const dot = dx * -dvx + dy * -dvy;

  if (dot >= 0) {
    const mt = p1.mass + p2.mass;
    const dSqrd = dx ** 2 + dy ** 2;
    const cr = 1;

    const v1x =
      p1.dx - ((1 + cr) * p2.mass * (dvx * dx + dvy * dy) * dx) / (dSqrd * mt);
    const v1y =
      p1.dy - ((1 + cr) * p2.mass * (dvx * dx + dvy * dy) * dy) / (dSqrd * mt);
    const v2x =
      p2.dx + ((1 + cr) * p1.mass * (dvx * dx + dvy * dy) * dx) / (dSqrd * mt);
    const v2y =
      p2.dy + ((1 + cr) * p1.mass * (dvx * dx + dvy * dy) * dy) / (dSqrd * mt);

    p1.dx = v1x;
    p1.dy = v1y;
    p2.dx = v2x;
    p2.dy = v2y;
  }
}

function checkForCollisions(p1: Particle, particles: Particle[]) {
  for (const p2 of particles) {
    if (p1 === p2) continue;
    if (p1.isCollidingWith(p2)) collide(p1, p2);
  }
}

function update(
  particles: Particle[],
  width: number,
  height: number,
  ref: React.MutableRefObject<null>,
) {
  for (const particle of particles) {
    drawParticle(particle, ref.current);
    testForWalls(particle, width, height);
    particle.move();
    checkForCollisions(particle, particles);
  }
}

function addParticle(
  particles: Particle[],
  radius: number,
  width: number,
  height: number,
  fill: string,
  id: string,
) {
  const diameter = radius * 2;
  const minX = diameter;
  const minY = diameter;
  const maxX = width - diameter;
  const maxY = height - diameter;
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;
  const initialAngle = Math.random() * Math.PI * 2;
  particles.push(
    new Particle(
      x,
      y,
      radius,
      // Math.random() * radius + radius,
      initialAngle,
      Math.random() * INITIAL_SPEED + 3,
      fill,
      id,
    ),
  );
}

const NUMBER_OF_PARTICLES = 500;
const RADIUS = 9;
const FILL = 'black';
const INITIAL_SPEED = 0;

// TODO: Consider 10 as masimum velocity
function composeParticles(width: number, height: number) {
  const particles: Particle[] = [];
  addParticle(particles, RADIUS * 3, width, height, 'red', 'tracked-particle');
  for (let i = 0; i < NUMBER_OF_PARTICLES; i++) {
    addParticle(particles, RADIUS, width, height, FILL, i.toString());
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
    return () => {
      d3.select(ref.current).select('svg').selectAll('circle').remove();
      timer.stop();
    };
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
