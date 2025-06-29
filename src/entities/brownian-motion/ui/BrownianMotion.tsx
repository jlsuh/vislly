'use client';

import { type JSX, useEffect, useId } from 'react';
import getRootFontSize from '@/shared/lib/getRootFontSize.ts';
import useResizeDimensions from '@/shared/lib/useResizeDimensions';
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

function scaleMagnitudeByRem(magnitudeBase: number): number {
  const rootFontSize = getRootFontSize();
  const scaleFactor = rootFontSize / DEFAULT_ROOT_FONT_SIZE;
  return scaleFactor * magnitudeBase;
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

const BLUE = new RGBA(
  0.237_254_901_96,
  0.537_254_901_96,
  0.854_901_960_78,
  0.25,
);
const POLLEN = new RGBA(0.976_470_588_23, 0.815_686_274_51, 0.086_274_509_8, 1);
const PURPLE = new RGBA(
  0.784_313_725_490_196_1,
  0.454_901_960_784_313_7,
  0.698_039_215_686_274_5,
  1,
);

const COR: CoefficientOfRestitution = 1;
const DEFAULT_ROOT_FONT_SIZE = 16;
const INITIAL_SPEED = 1.5;
const MOLECULE_RADIUS = 6;
const MOLECULE_DIAMETER = MOLECULE_RADIUS * 2;
const NUMBER_OF_PARTICLES = 500;
const POLLEN_RADIUS = 35;

function BrownianMotion(): JSX.Element {
  const { dimensions, ref } = useResizeDimensions(RESIZE_DIMENSIONS);

  const particlesCanvasId = useId();
  const historicalCanvasId = useId();

  useEffect(() => {
    const currentMoleculeRadius = scaleMagnitudeByRem(MOLECULE_RADIUS);
    const currentMoleculeDiameter = scaleMagnitudeByRem(MOLECULE_DIAMETER);
    const currentPollenRadius = scaleMagnitudeByRem(POLLEN_RADIUS);
    const currentInitialSpeed = scaleMagnitudeByRem(INITIAL_SPEED);
    const historicalContext = getCanvasCtxByRef(
      document.getElementById(historicalCanvasId) as HTMLCanvasElement,
    );
    const particlesContext = getCanvasCtxByRef(
      document.getElementById(particlesCanvasId) as HTMLCanvasElement,
    );
    configureHistoricalCanvas(historicalContext);
    const particles = [
      ...composeParticles(1, () => ({
        fillColor: POLLEN.toStyle(),
        isTracked: true,
        r: currentPollenRadius,
        vix: 0,
        viy: 0,
        x: dimensions.boundedWidth / 2,
        y: dimensions.boundedHeight / 2,
      })),
      ...composeParticles(NUMBER_OF_PARTICLES, () => ({
        fillColor: BLUE.toStyle(),
        isTracked: false,
        r: currentMoleculeRadius,
        vix: Math.random() * currentInitialSpeed * Math.cos(getRandomAngle()),
        viy: Math.random() * currentInitialSpeed * Math.sin(getRandomAngle()),
        x: getRandomBetween(
          currentMoleculeDiameter,
          dimensions.boundedWidth - currentMoleculeDiameter,
        ),
        y: getRandomBetween(
          currentMoleculeDiameter,
          dimensions.boundedHeight - currentMoleculeDiameter,
        ),
      })),
    ];
    const intervalId = window.setInterval(() =>
      update({
        cor: COR,
        particles,
        height: dimensions.boundedHeight,
        width: dimensions.boundedWidth,
        historicalContext,
        particlesContext,
      }),
    );
    return (): void => window.clearInterval(intervalId);
  }, [
    dimensions.boundedHeight,
    dimensions.boundedWidth,
    particlesCanvasId,
    historicalCanvasId,
  ]);

  return (
    <div className={styles.brownianMotionContainer} ref={ref}>
      <canvas
        className={styles.particlesCanvas}
        height={dimensions.boundedHeight}
        id={particlesCanvasId}
        width={dimensions.boundedWidth}
      />
      <canvas
        className={styles.historicalCanvas}
        height={dimensions.boundedHeight}
        id={historicalCanvasId}
        width={dimensions.boundedWidth}
      />
    </div>
  );
}

export default BrownianMotion;
