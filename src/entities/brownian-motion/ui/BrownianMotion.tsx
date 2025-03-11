'use client';

import useResizeDimensions from '@/shared/lib/useResizeDimensions';
import { type JSX, useEffect } from 'react';
import {
  type Angle,
  type CoefficientOfRestitution,
  type Coord,
  type Limit,
  Particle,
  type ParticleSettings,
  RGBA,
  Vector2,
} from '../model/brownian-motion.ts';
import styles from './brownian-motion.module.css';

function getRandomAngle(): Angle {
  return Math.random() * 2 * Math.PI;
}

function getRandomBetween(min: Limit, max: Limit): Coord {
  return Math.random() * (max - min) + min;
}

function getCanvasCtxByRef(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D {
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function drawParticle(
  p: Particle,
  particlesContext: CanvasRenderingContext2D,
): void {
  particlesContext.beginPath();
  particlesContext.arc(p.curr.x, p.curr.y, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fillColor;
  particlesContext.closePath();
  particlesContext.fill();
}

function drawHistoricalPath(
  p: Particle,
  historicalContext: CanvasRenderingContext2D,
): void {
  historicalContext.beginPath();
  historicalContext.moveTo(p.prev.x, p.prev.y);
  historicalContext.lineTo(p.curr.x, p.curr.y);
  historicalContext.closePath();
  historicalContext.stroke();
}

function configureHistoricalCanvas(
  historicalContext: CanvasRenderingContext2D,
): void {
  historicalContext.lineCap = 'round';
  historicalContext.lineJoin = 'round';
  historicalContext.lineWidth = 0.8;
  historicalContext.strokeStyle = PURPLE.toStyle();
}

function resetCanvas(
  width: Limit,
  height: Limit,
  particlesContext: CanvasRenderingContext2D,
): void {
  particlesContext.clearRect(0, 0, width, height);
}

function handleParticleCollisions(
  p1: Particle,
  p2: Particle,
  cor: CoefficientOfRestitution,
): void {
  if (p1.shouldCollideWith(p2)) {
    p1.collide(p2, cor);
  }
}

function handleWallCollision(p: Particle, width: Limit, height: Limit): void {
  if (p.isHorizontalWallCollision(width)) {
    p.v = new Vector2(-p.v.x, p.v.y);
  }
  if (p.isVerticalWallCollision(height)) {
    p.v = new Vector2(p.v.x, -p.v.y);
  }
}

function handleHistoricalPath(
  p: Particle,
  historicalContext: CanvasRenderingContext2D,
): void {
  if (p.isTracked) {
    drawHistoricalPath(p, historicalContext);
  }
}

const update = ({
  cor,
  particles,
  height,
  width,
  historicalContext,
  particlesContext,
}: {
  cor: CoefficientOfRestitution;
  particles: Particle[];
  height: Limit;
  width: Limit;
  historicalContext: CanvasRenderingContext2D;
  particlesContext: CanvasRenderingContext2D;
}): void => {
  resetCanvas(width, height, particlesContext);
  for (const p1 of particles) {
    drawParticle(p1, particlesContext);
    handleHistoricalPath(p1, historicalContext);
    handleWallCollision(p1, width, height);
    p1.move();
    for (const p2 of particles) {
      handleParticleCollisions(p1, p2, cor);
    }
  }
};

function composeParticles(
  numberOfParticles: number,
  particleSettings: () => ParticleSettings,
): Particle[] {
  return Array.from(
    { length: numberOfParticles },
    () => new Particle(particleSettings()),
  );
}

const RESIZE_DIMENSIONS = {
  boundedHeight: 0,
  boundedWidth: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  height: 0,
  width: 0,
};

const BLUE = new RGBA(0.23725490196, 0.53725490196, 0.85490196078, 0.25);
const POLLEN = new RGBA(0.97647058823, 0.81568627451, 0.0862745098, 1);
const PURPLE = new RGBA(
  0.7843137254901961,
  0.4549019607843137,
  0.6980392156862745,
  1,
);

const COR: CoefficientOfRestitution = 1;
const INITIAL_SPEED = 1.5;
const MOLECULE_RADIUS = 6;
const MOLECULE_DIAMETER = MOLECULE_RADIUS * 2;
const NUMBER_OF_PARTICLES = 500;
const POLLEN_RADIUS = 35;

function BrownianMotion(): JSX.Element {
  const { dimensions, ref: mainContainerRef } =
    useResizeDimensions(RESIZE_DIMENSIONS);

  useEffect(() => {
    const historicalContext = getCanvasCtxByRef(
      document.getElementById('historical') as HTMLCanvasElement,
    );
    const particlesContext = getCanvasCtxByRef(
      document.getElementById('particles') as HTMLCanvasElement,
    );
    configureHistoricalCanvas(historicalContext);
    const particles = [
      ...composeParticles(1, () => ({
        fillColor: POLLEN.toStyle(),
        isTracked: true,
        r: POLLEN_RADIUS,
        vix: 0,
        viy: 0,
        x: dimensions.boundedWidth / 2,
        y: dimensions.boundedHeight / 2,
      })),
      ...composeParticles(NUMBER_OF_PARTICLES, () => ({
        fillColor: BLUE.toStyle(),
        isTracked: false,
        r: MOLECULE_RADIUS,
        vix: Math.random() * INITIAL_SPEED * Math.cos(getRandomAngle()),
        viy: Math.random() * INITIAL_SPEED * Math.sin(getRandomAngle()),
        x: getRandomBetween(
          MOLECULE_DIAMETER,
          dimensions.boundedWidth - MOLECULE_DIAMETER,
        ),
        y: getRandomBetween(
          MOLECULE_DIAMETER,
          dimensions.boundedHeight - MOLECULE_DIAMETER,
        ),
      })),
    ];
    const intervalID = window.setInterval(() =>
      update({
        cor: COR,
        particles,
        height: dimensions.boundedHeight,
        width: dimensions.boundedWidth,
        historicalContext,
        particlesContext,
      }),
    );
    return (): void => window.clearInterval(intervalID);
  }, [dimensions.boundedHeight, dimensions.boundedWidth]);

  return (
    <div className={styles.brownianMotionContainer} ref={mainContainerRef}>
      <canvas
        className={styles.particlesCanvas}
        height={dimensions.boundedHeight}
        id="particles"
        width={dimensions.boundedWidth}
      />
      <canvas
        className={styles.historicalCanvas}
        height={dimensions.boundedHeight}
        id="historical"
        width={dimensions.boundedWidth}
      />
    </div>
  );
}

export default BrownianMotion;
