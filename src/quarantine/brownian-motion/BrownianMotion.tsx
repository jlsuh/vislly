import * as d3 from 'd3';
import { useEffect } from 'react';
import useChartDimensions from '../useChartDimensions';

class Vector2 {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(that: Vector2) {
    return new Vector2(this.x + that.x, this.y + that.y);
  }

  public clone() {
    return new Vector2(this.x, this.y);
  }

  public dot(that: Vector2) {
    return this.x * that.x + this.y * that.y;
  }

  public map(fn: (x: number) => number) {
    return new Vector2(fn(this.x), fn(this.y));
  }

  public sqrdDistanceTo(that: Vector2) {
    const dx = that.x - this.x;
    const dy = that.y - this.y;
    return dx * dx + dy * dy;
  }

  public sub(that: Vector2) {
    return new Vector2(this.x - that.x, this.y - that.y);
  }
}

type Limit = number;

type ParticleSettings = {
  x: number;
  y: number;
  r: number;
  speed: number;
  initialAngle: number;
  fillColor: string;
  isTracked: boolean;
};

class Particle {
  curr: Vector2;
  prev: Vector2;
  r: number;
  mass: number;
  v: Vector2;
  fillColor: string;
  isTracked: boolean;

  constructor(settings: ParticleSettings) {
    const { x, y, r, speed, initialAngle, fillColor, isTracked } = settings;
    this.curr = new Vector2(x, y);
    this.prev = new Vector2(x, y);
    this.r = r;
    this.mass = r;
    this.v = new Vector2(
      speed * Math.cos(initialAngle),
      speed * Math.sin(initialAngle),
    );
    this.fillColor = fillColor;
    this.isTracked = isTracked;
  }

  private rSqrd(that: Particle) {
    const rt = this.r + that.r;
    return rt * rt;
  }

  public move() {
    this.prev = this.curr.clone();
    this.curr = this.curr.add(this.v);
  }

  public isCollidingWithParticle(that: Particle) {
    return this.curr.sqrdDistanceTo(that.curr) < this.rSqrd(that);
  }

  public isHorizontalWallCollision(width: Limit) {
    return this.curr.x - this.r < 0 || this.curr.x + this.r > width;
  }

  public isVerticalWallCollision(height: Limit) {
    return this.curr.y - this.r < 0 || this.curr.y + this.r > height;
  }
}

function drawParticle(p: Particle) {
  const particlesContext = getCanvasCtxById('particles');
  particlesContext.beginPath();
  particlesContext.arc(p.curr.x, p.curr.y, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fillColor;
  particlesContext.fill();
  particlesContext.closePath();
}

function collide(p1: Particle, p2: Particle) {
  const d = p1.curr.sub(p2.curr);
  const v = p1.v.sub(p2.v);
  const minusV = v.map((x) => -x);
  const minusVDot = d.dot(minusV);
  if (minusVDot > 0) {
    const mt = p1.mass + p2.mass;
    const dSqrd = p1.curr.sqrdDistanceTo(p2.curr);
    const cr = 1; // TODO: Make coefficient of restitution variable
    const dot = d.dot(v);
    const v1x = p1.v.x - ((1 + cr) * p2.mass * dot * d.x) / (dSqrd * mt);
    const v1y = p1.v.y - ((1 + cr) * p2.mass * dot * d.y) / (dSqrd * mt);
    const v2x = p2.v.x + ((1 + cr) * p1.mass * dot * d.x) / (dSqrd * mt);
    const v2y = p2.v.y + ((1 + cr) * p1.mass * dot * d.y) / (dSqrd * mt);
    p1.v = new Vector2(v1x, v1y);
    p2.v = new Vector2(v2x, v2y);
  }
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

function getCanvasCtxById(id: string) {
  const canvas = d3.select(`#${id}`).node() as HTMLCanvasElement;
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function resetCanvas(width: number, height: number) {
  getCanvasCtxById('particles').clearRect(0, 0, width, height);
}

const update = (particles: Particle[], width: number, height: number) => {
  resetCanvas(width, height);
  for (const p1 of particles) {
    drawParticle(p1);
    if (p1.isTracked) drawHistoricalPath(p1);
    if (p1.isHorizontalWallCollision(width)) {
      p1.v = new Vector2(-p1.v.x, p1.v.y);
    }
    if (p1.isVerticalWallCollision(height)) {
      p1.v = new Vector2(p1.v.x, -p1.v.y);
    }
    p1.move();
    for (const p2 of particles) {
      if (p1 !== p2 && p1.isCollidingWithParticle(p2)) {
        collide(p1, p2);
      }
    }
  }
};

function getRandomAngle() {
  return Math.random() * Math.PI * 2;
}

const NUMBER_OF_PARTICLES = 20;
const RADIUS = 8;
const INITIAL_SPEED = 5; // TODO: Consider 10 as masimum speed

function composeParticle(
  height: number,
  width: number,
  isTracked: boolean,
  r: number,
  initialSpeed: number,
  fillColor: string,
) {
  const diameter = r * 2;
  const maxX = width - diameter;
  const maxY = height - diameter;
  const minX = diameter;
  const minY = diameter;
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;
  const speed = Math.random() * initialSpeed;
  return new Particle({
    x,
    y,
    r,
    speed,
    initialAngle: getRandomAngle(),
    fillColor: fillColor,
    isTracked,
  });
}

function composeParticles(
  height: number,
  width: number,
  isTracked: boolean,
  r: number,
  initialSpeed: number,
  fillColor: string,
  numberOfParticles: number,
) {
  return Array.from({ length: numberOfParticles }, () =>
    composeParticle(height, width, isTracked, r, initialSpeed, fillColor),
  );
}

// NOTE: If height or width is 0, the canvas will calculate max value for viewport
const chartSettings = {
  boundedHeight: 0,
  boundedWidth: 0,
  marginBottom: 30,
  marginLeft: 30,
  marginRight: 30,
  marginTop: 30,
  height: 0,
  width: 0,
};

const disableContextMenu = (
  e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
) => e.preventDefault();

function BrownianMotion(): JSX.Element {
  const { ref, dimensions } = useChartDimensions(chartSettings);

  useEffect(() => {
    configureHistoricalCanvas();
    const particles = [
      ...composeParticles(
        dimensions.boundedHeight,
        dimensions.boundedWidth,
        true,
        RADIUS * 2.5,
        INITIAL_SPEED,
        'red',
        1,
      ),
      ...composeParticles(
        dimensions.boundedHeight,
        dimensions.boundedWidth,
        false,
        RADIUS,
        INITIAL_SPEED,
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
        justifyContent: 'center',
        position: 'relative',
        maxHeight: 'calc(100vh)',
        minHeight: 'calc(100vh)',
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
