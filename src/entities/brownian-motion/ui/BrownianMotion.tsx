import useResizeDimensions from '@/shared/lib/useResizeDimensions';
import { interval, select } from 'd3';
import {
  type JSX,
  type MouseEvent,
  type RefObject,
  useEffect,
  useRef,
} from 'react';
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
import styles from './brownian-motion.module.css';

function getRandomAngle(): Angle {
  return Math.random() * 2 * Math.PI;
}

function getRandomBetween(min: Limit, max: Limit): Coord {
  return Math.random() * (max - min) + min;
}

function getCanvasCtxById(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const canvas = select(canvasRef.current).node() as HTMLCanvasElement;
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function drawParticle(
  p: Particle,
  particlesCanvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const particlesContext = getCanvasCtxById(particlesCanvasRef);
  particlesContext.beginPath();
  particlesContext.arc(p.curr.x, p.curr.y, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fillColor;
  particlesContext.closePath();
  particlesContext.fill();
}

function drawHistoricalPath(
  p: Particle,
  historicalCanvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const historicalContext = getCanvasCtxById(historicalCanvasRef);
  historicalContext.beginPath();
  historicalContext.moveTo(p.prev.x, p.prev.y);
  historicalContext.lineTo(p.curr.x, p.curr.y);
  historicalContext.closePath();
  historicalContext.stroke();
}

function configureHistoricalCanvas(
  historicalCanvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const historicalContext = getCanvasCtxById(historicalCanvasRef);
  historicalContext.lineCap = 'round';
  historicalContext.lineJoin = 'round';
  historicalContext.lineWidth = 0.5;
  historicalContext.strokeStyle = 'purple';
}

function resetCanvas(
  width: Limit,
  height: Limit,
  particlesCanvasRef: RefObject<HTMLCanvasElement | null>,
) {
  getCanvasCtxById(particlesCanvasRef).clearRect(0, 0, width, height);
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

function handleHistoricalPath(
  p: Particle,
  historicalCanvasRef: RefObject<HTMLCanvasElement | null>,
) {
  if (p.isTracked) drawHistoricalPath(p, historicalCanvasRef);
}

const update = ({
  cor,
  particles,
  height,
  width,
  historicalCanvasRef,
  particlesCanvasRef,
}: {
  cor: CoefficientOfRestitution;
  particles: Particle[];
  height: Limit;
  width: Limit;
  historicalCanvasRef: RefObject<HTMLCanvasElement | null>;
  particlesCanvasRef: RefObject<HTMLCanvasElement | null>;
}) => {
  resetCanvas(width, height, particlesCanvasRef);
  for (const p1 of particles) {
    drawParticle(p1, particlesCanvasRef);
    handleHistoricalPath(p1, historicalCanvasRef);
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

const RESIZE_DIMENSIONS = {
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
const NUMBER_OF_PARTICLES = 400;
const RADIUS = 8;
const DIAMETER = RADIUS * 2;

function BrownianMotion(): JSX.Element {
  const { ref: containerRef, dimensions } =
    useResizeDimensions(RESIZE_DIMENSIONS);

  const historicalCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    configureHistoricalCanvas(historicalCanvasRef);
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
      update({
        cor: COR,
        particles,
        height: dimensions.boundedHeight,
        width: dimensions.boundedWidth,
        historicalCanvasRef,
        particlesCanvasRef,
      }),
    );
    return () => timer.stop();
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  return (
    <div className={styles.mainContainer} ref={containerRef}>
      <canvas
        className={styles.particlesCanvas}
        height={dimensions.boundedHeight}
        onContextMenu={disableContextMenu}
        ref={particlesCanvasRef}
        width={dimensions.boundedWidth}
      />
      <canvas
        className={styles.historicalCanvas}
        height={dimensions.boundedHeight}
        onContextMenu={disableContextMenu}
        ref={historicalCanvasRef}
        width={dimensions.boundedWidth}
      />
    </div>
  );
}

export default BrownianMotion;
