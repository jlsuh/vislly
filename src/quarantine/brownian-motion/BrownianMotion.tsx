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
  currX: number;
  currY: number;
  prevX: number;
  prevY: number;
  r: number;
  mass: number;
  dx: number;
  dy: number;
  fill: string;
  id: string;

  constructor(
    x: number,
    y: number,
    prevX: number,
    prevY: number,
    r: number,
    initialAngle: number,
    initialVelocity: number,
    fill: string,
    id: string,
  ) {
    this.currX = x;
    this.currY = y;
    this.prevX = prevX;
    this.prevY = prevY;
    this.r = r;
    this.mass = r;
    this.dx = initialVelocity * Math.cos(initialAngle);
    this.dy = initialVelocity * Math.sin(initialAngle);
    this.fill = fill;
    this.id = id;
  }

  move() {
    this.prevX = this.currX;
    this.prevY = this.currY;
    this.currX += this.dx;
    this.currY += this.dy;
  }

  isCollidingWith(p: Particle) {
    const dx = this.currX - p.currX;
    const dy = this.currY - p.currY;
    const dSqrd = dx ** 2 + dy ** 2;
    const rSqrd = (this.r + p.r) ** 2;
    return dSqrd < rSqrd;
  }
}

function testForWalls(p: Particle, width: number, height: number) {
  if (p.currX + p.r > width || p.currX - p.r < 0) {
    p.dx = -p.dx;
  }
  if (p.currY + p.r > height || p.currY - p.r < 0) {
    p.dy = -p.dy;
  }
}

// TODO: Maybe id isn't needed in particle
function drawParticle(p: Particle, container: HTMLDivElement | null) {
  const particleCanvas = d3
    .select(container)
    .select('#particles')
    .node() as HTMLCanvasElement;
  const particlesContext = particleCanvas.getContext(
    '2d',
  ) as CanvasRenderingContext2D;
  particlesContext.beginPath();
  particlesContext.arc(p.currX, p.currY, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fill;
  particlesContext.fill();
  particlesContext.closePath();
}

function collide(p1: Particle, p2: Particle) {
  const dx = p1.currX - p2.currX;
  const dy = p1.currY - p2.currY;
  const dvx = p1.dx - p2.dx;
  const dvy = p1.dy - p2.dy;
  const dot = dx * -dvx + dy * -dvy;

  if (dot > 0) {
    const mt = p1.mass + p2.mass;
    const dSqrd = dx ** 2 + dy ** 2;
    const cr = 1; // TODO: Make coefficient of restitution variable

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

function drawHistoricalPath(p: Particle, container: HTMLDivElement | null) {
  const historicalCanvas = d3
    .select(container)
    .select('#historical')
    .node() as HTMLCanvasElement;
  const historicalContext = historicalCanvas.getContext(
    '2d',
  ) as CanvasRenderingContext2D;
  historicalContext.beginPath();
  historicalContext.moveTo(p.prevX, p.prevY);
  historicalContext.lineJoin = 'round';
  historicalContext.lineCap = 'round';
  historicalContext.strokeStyle = 'purple';
  historicalContext.lineTo(p.currX, p.currY);
  historicalContext.stroke();
  historicalContext.closePath();
}

function update(
  particles: Particle[],
  width: number,
  height: number,
  ref: React.MutableRefObject<null>,
) {
  const particleCanvas = d3
    .select(ref.current)
    .select('#particles')
    .node() as HTMLCanvasElement;
  const particleContext = particleCanvas.getContext(
    '2d',
  ) as CanvasRenderingContext2D;
  particleContext.clearRect(0, 0, width, height);
  for (const p of particles) {
    drawParticle(p, ref.current);
    if (p.id === 'tracked-particle') {
      drawHistoricalPath(p, ref.current);
    }
    testForWalls(p, width, height);
    p.move();
    checkForCollisions(p, particles);
  }
}

function addParticle(
  particles: Particle[],
  r: number,
  width: number,
  height: number,
  fill: string,
  id: string,
) {
  const diameter = r * 2;
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
      x,
      y,
      r, // Math.random() * r + r,
      initialAngle,
      Math.random() * INITIAL_VELOCITY + 3,
      fill,
      id,
    ),
  );
}

const NUMBER_OF_PARTICLES = 200;
const RADIUS = 8;
const FILL = 'blue';
const INITIAL_VELOCITY = 1;

// TODO: Consider 10 as masimum velocity
function composeParticles(width: number, height: number) {
  const particles: Particle[] = [];
  addParticle(
    particles,
    RADIUS * 2.5,
    width,
    height,
    'red',
    'tracked-particle',
  );
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
      timer.stop();
    };
  }, [dimensions.boundedWidth, dimensions.boundedHeight, ref]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <canvas
        id="particles"
        width={dimensions.boundedWidth}
        height={dimensions.boundedHeight}
        style={{
          width: dimensions.boundedWidth,
          height: dimensions.boundedHeight,
          border: '1px solid black',
        }}
      />
      <canvas
        id="historical"
        style={{
          position: 'absolute',
          width: dimensions.boundedWidth,
          height: dimensions.boundedHeight,
        }}
        width={dimensions.boundedWidth}
        height={dimensions.boundedHeight}
      />
    </div>
  );
}

export default BrownianMotion;
