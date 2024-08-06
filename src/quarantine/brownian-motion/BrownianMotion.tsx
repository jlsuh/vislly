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

function getRandomAngle() {
  return Math.random() * Math.PI * 2;
}

class Particle {
  currX: number;
  currY: number;
  prevX: number;
  prevY: number;
  r: number;
  mass: number;
  vx: number;
  vy: number;
  fill: string;
  isTracked: boolean;

  constructor(
    x: number,
    y: number,
    prevX: number,
    prevY: number,
    r: number,
    speed: number,
    fill: string,
    isTracking: boolean,
  ) {
    this.currX = x;
    this.currY = y;
    this.prevX = prevX;
    this.prevY = prevY;
    this.r = r;
    this.mass = r;
    this.vx = speed * Math.cos(getRandomAngle());
    this.vy = speed * Math.sin(getRandomAngle());
    this.fill = fill;
    this.isTracked = isTracking;
  }

  move() {
    this.prevX = this.currX;
    this.prevY = this.currY;
    this.currX += this.vx;
    this.currY += this.vy;
  }

  isCollidingWith(p: Particle) {
    const vx = this.currX - p.currX;
    const vy = this.currY - p.currY;
    const dSqrd = vx ** 2 + vy ** 2;
    const rSqrd = (this.r + p.r) ** 2;
    return dSqrd < rSqrd;
  }
}

function testForWalls(p: Particle, width: number, height: number) {
  if (p.currX + p.r > width || p.currX - p.r < 0) {
    p.vx = -p.vx;
  }
  if (p.currY + p.r > height || p.currY - p.r < 0) {
    p.vy = -p.vy;
  }
}

function drawParticle(p: Particle) {
  const particlesContext = getCanvasCtxById('particles');
  particlesContext.beginPath();
  particlesContext.arc(p.currX, p.currY, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fill;
  particlesContext.fill();
  particlesContext.closePath();
}

function collide(p1: Particle, p2: Particle) {
  const dx = p1.currX - p2.currX;
  const dy = p1.currY - p2.currY;
  const dvx = p1.vx - p2.vx;
  const dvy = p1.vy - p2.vy;
  const dot = dx * -dvx + dy * -dvy;

  if (dot > 0) {
    const mt = p1.mass + p2.mass;
    const dSqrd = dx ** 2 + dy ** 2;
    const cr = 1; // TODO: Make coefficient of restitution variable

    const v1x =
      p1.vx - ((1 + cr) * p2.mass * (dvx * dx + dvy * dy) * dx) / (dSqrd * mt);
    const v1y =
      p1.vy - ((1 + cr) * p2.mass * (dvx * dx + dvy * dy) * dy) / (dSqrd * mt);
    const v2x =
      p2.vx + ((1 + cr) * p1.mass * (dvx * dx + dvy * dy) * dx) / (dSqrd * mt);
    const v2y =
      p2.vy + ((1 + cr) * p1.mass * (dvx * dx + dvy * dy) * dy) / (dSqrd * mt);

    p1.vx = v1x;
    p1.vy = v1y;
    p2.vx = v2x;
    p2.vy = v2y;
  }
}

function checkForCollisions(p1: Particle, particles: Particle[]) {
  for (const p2 of particles) {
    if (p1 === p2) continue;
    if (p1.isCollidingWith(p2)) collide(p1, p2);
  }
}

function drawHistoricalPath(p: Particle) {
  const historicalContext = getCanvasCtxById('historical');
  historicalContext.lineWidth = 1.5;
  historicalContext.lineJoin = 'round';
  historicalContext.lineCap = 'round';
  historicalContext.strokeStyle = 'purple';
  historicalContext.beginPath();
  historicalContext.moveTo(p.prevX, p.prevY);
  historicalContext.lineTo(p.currX, p.currY);
  historicalContext.stroke();
  historicalContext.closePath();
}

function getCanvasCtxById(id: string) {
  const canvas = d3.select(`#${id}`).node() as HTMLCanvasElement;
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function resetCanvas(width: number, height: number) {
  getCanvasCtxById('particles').clearRect(0, 0, width, height);
}

function update(particles: Particle[], width: number, height: number) {
  resetCanvas(width, height);
  for (const p of particles) {
    drawParticle(p);
    if (p.isTracked) {
      drawHistoricalPath(p);
    }
    testForWalls(p, width, height);
    p.move();
    checkForCollisions(p, particles);
  }
}

const NUMBER_OF_PARTICLES = 50;
const RADIUS = 8;
const INITIAL_VELOCITY = 6; // TODO: Consider 10 as masimum velocity

function composeParticle(
  height: number,
  width: number,
  isTracked: boolean,
  r: number,
  vi: number,
  fill: string,
) {
  const diameter = r * 2;
  const maxX = width - diameter;
  const maxY = height - diameter;
  const minX = diameter;
  const minY = diameter;
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;
  const velocity = Math.random() * vi;
  return new Particle(x, y, x, y, r, velocity, fill, isTracked);
}

function composeParticles(
  height: number,
  width: number,
  isTracked: boolean,
  r: number,
  vi: number,
  fill: string,
  numberOfParticles: number,
) {
  return Array.from({ length: numberOfParticles }, () =>
    composeParticle(height, width, isTracked, r, vi, fill),
  );
}

function BrownianMotion(): JSX.Element {
  const { ref, dimensions } = useChartDimensions(chartSettings);

  useEffect(() => {
    const particles = [
      ...composeParticles(
        dimensions.boundedHeight,
        dimensions.boundedWidth,
        true,
        RADIUS * 2.5,
        INITIAL_VELOCITY,
        'red',
        1,
      ),
      ...composeParticles(
        dimensions.boundedHeight,
        dimensions.boundedWidth,
        false,
        RADIUS,
        INITIAL_VELOCITY,
        'blue',
        NUMBER_OF_PARTICLES,
      ),
    ];
    const timer = d3.interval(() =>
      update(particles, dimensions.boundedWidth, dimensions.boundedHeight),
    );
    return () => timer.stop();
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  return (
    <div
      ref={ref}
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <canvas
        height={dimensions.boundedHeight}
        id="particles"
        style={{
          border: '1px solid black',
          height: dimensions.boundedHeight,
          width: dimensions.boundedWidth,
        }}
        width={dimensions.boundedWidth}
      />
      <canvas
        height={dimensions.boundedHeight}
        id="historical"
        style={{
          height: dimensions.boundedHeight,
          position: 'absolute',
          width: dimensions.boundedWidth,
        }}
        width={dimensions.boundedWidth}
      />
    </div>
  );
}

export default BrownianMotion;
