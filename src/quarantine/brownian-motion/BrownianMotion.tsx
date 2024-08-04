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
  id: string;

  constructor(
    x: number,
    y: number,
    radius: number,
    initialAngle: number,
    speed: number,
    fill: string,
    id: string,
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
    this.id = id;
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
    return squaredDistance < squaredRadius;
  }
}

function testForWalls(particle: Particle, width: number, height: number) {
  if (
    particle.x + particle.dx >= width - particle.radius ||
    particle.x + particle.dx <= particle.radius
  ) {
    particle.dx = -particle.dx;
  }
  if (
    particle.y + particle.dy >= height - particle.radius ||
    particle.y + particle.dy <= particle.radius
  ) {
    particle.dy = -particle.dy;
  }
}

function drawParticle(particle: Particle, container: HTMLDivElement | null) {
  const svg = d3.select(container).select('svg');
  const particleElement = svg
    .selectAll(`#particle-${particle.id}`)
    .data([particle]);
  particleElement
    .enter()
    .append('circle')
    .attr('id', `particle-${particle.id}`);
  particleElement
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.radius)
    .attr('fill', (d) => d.fill);
  if (particle.id === 'tracked-particle') {
    // TODO: draw a line from the tracked particle to the other particles
    // svg
    //   .append('line')
    //   .attr('x1', particle.x)
    //   .attr('y1', particle.y)
    //   .attr('x2', particle.x + particle.dx)
    //   .attr('y2', particle.y + particle.dy)
    //   .attr('stroke', 'black')
    //   .attr('stroke-width', 2);
    svg
      .append('path')
      .attr(
        'd',
        `M${particle.x},${particle.y} L${particle.x + particle.dx},${particle.y + particle.dy}`,
      )
      .attr('stroke', 'grey')
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-miterlimit', 2);
  }
}

function collide(first: Particle, second: Particle) {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const vx = second.dx - first.dx;
  const vy = second.dy - first.dy;
  const dotProduct = dx * vx + dy * vy;

  if (dotProduct > 0) {
    const totalMass = first.mass + second.mass;
    const massDifference = first.mass - second.mass;

    const vx1 =
      (massDifference * first.dx + 2 * second.mass * second.dx) / totalMass;
    const vy1 =
      (massDifference * first.dy + 2 * second.mass * second.dy) / totalMass;
    const vx2 =
      (2 * first.mass * first.dx - massDifference * second.dx) / totalMass;
    const vy2 =
      (2 * first.mass * first.dy - massDifference * second.dy) / totalMass;

    first.dx = vx1;
    first.dy = vy1;
    second.dx = vx2;
    second.dy = vy2;

    first.move();
    second.move();
  }
}

function checkForCollisions(particle: Particle, particles: Particle[]) {
  for (const second of particles) {
    if (particle === second) continue;
    if (particle.isCollidingWith(second)) {
      collide(particle, second);
    }
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
      initialAngle,
      Math.random() * INITIAL_SPEED + 3,
      fill,
      id,
    ),
  );
}

// TODO: Generate logic for maximum of 200 particles
const NUMBER_OF_PARTICLES = 500;
const RADIUS = 5;
const FILL = 'black';
const INITIAL_SPEED = 5;

// TODO: Consider 10 as masimum velocity
// dx: 10,
// dy: -10,
// dx: Math.random() * 10 + 3,
// dy: Math.random() * 10 + 3,
function composeParticles(width: number, height: number) {
  const particles: Particle[] = [];
  addParticle(particles, RADIUS * 2, width, height, 'red', 'tracked-particle');
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
