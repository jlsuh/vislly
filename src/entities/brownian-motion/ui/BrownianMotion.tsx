import useChartDimensions from '@/shared/lib/chart/useChartDimensions';
import { interval, select } from 'd3';
import { type MouseEvent, useEffect } from 'react';
import {
  type Angle,
  type CoefficientOfRestitution,
  type Coord,
  type Limit,
  Particle,
  type ParticleSettings,
  RGBA,
  Vector2,
} from '../model/brownian-motion';

function getRandomAngle(): Angle {
  return Math.random() * 2 * Math.PI;
}

function getRandomBetween(min: Limit, max: Limit): Coord {
  return Math.random() * (max - min) + min;
}

function getCanvasCtxById(id: string) {
  const canvas = select(`#${id}`).node() as HTMLCanvasElement;
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function drawParticle(p: Particle) {
  const particlesContext = getCanvasCtxById('particles');
  particlesContext.beginPath();
  particlesContext.arc(p.curr.x, p.curr.y, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fillColor;
  particlesContext.closePath();
  particlesContext.fill();
}

function drawHistoricalPath(p: Particle) {
  const historicalContext = getCanvasCtxById('historical');
  historicalContext.beginPath();
  historicalContext.moveTo(p.prev.x, p.prev.y);
  historicalContext.lineTo(p.curr.x, p.curr.y);
  historicalContext.closePath();
  historicalContext.stroke();
}

function configureHistoricalCanvas() {
  const historicalContext = getCanvasCtxById('historical');
  historicalContext.lineCap = 'round';
  historicalContext.lineJoin = 'round';
  historicalContext.lineWidth = 0.5;
  historicalContext.strokeStyle = 'purple';
}

function resetCanvas(width: Limit, height: Limit) {
  getCanvasCtxById('particles').clearRect(0, 0, width, height);
}

function handleParticleCollisions(
  p1: Particle,
  p2: Particle,
  cor: CoefficientOfRestitution,
) {
  if (p1.shouldCollideWith(p2)) p1.collide(p2, cor);
}

function handleWallCollision(p: Particle, width: Limit, height: Limit) {
  if (p.isHorizontalWallCollision(width)) p.v = new Vector2(-p.v.x, p.v.y);
  if (p.isVerticalWallCollision(height)) p.v = new Vector2(p.v.x, -p.v.y);
}

function handleHistoricalPath(p: Particle) {
  if (p.isTracked) drawHistoricalPath(p);
}

const update = (
  particles: Particle[],
  width: Limit,
  height: Limit,
  cor: CoefficientOfRestitution,
) => {
  resetCanvas(width, height);
  for (const p1 of particles) {
    drawParticle(p1);
    handleHistoricalPath(p1);
    handleWallCollision(p1, width, height);
    p1.move();
    for (const p2 of particles) handleParticleCollisions(p1, p2, cor);
  }
};

function composeParticles(
  numberOfParticles: number,
  particleSettings: () => ParticleSettings,
) {
  return Array.from(
    { length: numberOfParticles },
    () => new Particle(particleSettings()),
  );
}

const disableContextMenu = (e: MouseEvent<HTMLCanvasElement>) =>
  e.preventDefault();

const CHART_DIMENSIONS = {
  boundedHeight: 0,
  boundedWidth: 0,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  marginTop: 50,
  height: 0,
  width: 0,
};

const BLUE = new RGBA(0, 0, 1, 1);
const RED = new RGBA(1, 0, 0, 1);

const COR: CoefficientOfRestitution = 1;
const INITIAL_SPEED = 10;
const NUMBER_OF_PARTICLES = 100;
const RADIUS = 8;
const DIAMETER = RADIUS * 2;

function BrownianMotion(): JSX.Element {
  const { ref, dimensions } = useChartDimensions(CHART_DIMENSIONS);

  useEffect(() => {
    configureHistoricalCanvas();
    const particles = [
      ...composeParticles(1, () => ({
        fillColor: RED.toStyle(),
        isTracked: true,
        r: RADIUS * 2.5,
        vix: Math.random() * INITIAL_SPEED * Math.cos(getRandomAngle()),
        viy: Math.random() * INITIAL_SPEED * Math.sin(getRandomAngle()),
        x: dimensions.boundedWidth / 2,
        y: dimensions.boundedHeight / 2,
      })),
      ...composeParticles(NUMBER_OF_PARTICLES, () => ({
        fillColor: BLUE.toStyle(),
        isTracked: false,
        r: RADIUS,
        vix: Math.random() * INITIAL_SPEED * Math.cos(getRandomAngle()),
        viy: Math.random() * INITIAL_SPEED * Math.sin(getRandomAngle()),
        x: getRandomBetween(DIAMETER, dimensions.boundedWidth - DIAMETER),
        y: getRandomBetween(DIAMETER, dimensions.boundedHeight - DIAMETER),
      })),
    ];
    const timer = interval(() =>
      update(particles, dimensions.boundedWidth, dimensions.boundedHeight, COR),
    );
    return () => timer.stop();
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  return (
    <div
      ref={ref}
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        maxHeight: '100vh',
        minHeight: '100vh',
      }}
    >
      <canvas
        height={dimensions.boundedHeight}
        id="particles"
        onContextMenu={disableContextMenu}
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
        onContextMenu={disableContextMenu}
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
