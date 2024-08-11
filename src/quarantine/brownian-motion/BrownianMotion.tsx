import * as d3 from 'd3';
import { type MouseEvent, useEffect } from 'react';
import useChartDimensions from '../useChartDimensions';

type Angle = number;
type Channel = number;
type Coord = number;
type Limit = number;
type Mass = number;
type Radius = number;
type CoefficientOfRestitution = number;

class RGBA {
  readonly r: Channel;
  readonly g: Channel;
  readonly b: Channel;
  readonly a: Channel;

  constructor(r: Channel, g: Channel, b: Channel, a: Channel) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toStyle() {
    return `rgba(${Math.floor(this.r * 255)}, ${Math.floor(this.g * 255)}, ${Math.floor(this.b * 255)}, ${this.a})`;
  }
}

class Vector2 {
  readonly x: Coord;
  readonly y: Coord;

  constructor(x: Coord, y: Coord) {
    this.x = x;
    this.y = y;
  }

  public add(that: Vector2) {
    return new Vector2(this.x + that.x, this.y + that.y);
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

function getRandomAngle(): Angle {
  return Math.random() * 2 * Math.PI;
}

function getRandomBetween(min: Limit, max: Limit): Coord {
  return Math.random() * (max - min) + min;
}

type ParticleSettings = {
  fillColor: RGBA;
  isTracked: boolean;
  r: Radius;
  vix: Coord;
  viy: Coord;
  x: Coord;
  y: Coord;
};

class Particle {
  readonly fillColor: RGBA;
  readonly isTracked: boolean;
  readonly mass: Mass;
  readonly r: Radius;
  curr: Vector2;
  prev: Vector2;
  v: Vector2;

  constructor(settings: ParticleSettings) {
    const { fillColor, isTracked, r, vix, viy, x, y } = settings;
    this.fillColor = fillColor;
    this.isTracked = isTracked;
    this.mass = r;
    this.r = r;
    this.curr = new Vector2(x, y);
    this.prev = this.curr;
    this.v = new Vector2(vix, viy);
  }

  private isCollidingWithParticle(that: Particle) {
    return this.curr.sqrdDistanceTo(that.curr) < this.rSqrd(that);
  }

  private isGoingTowards(that: Particle) {
    const d = this.curr.sub(that.curr);
    const v = this.v.sub(that.v);
    const minusV = v.map((x) => -x);
    const minusVDot = d.dot(minusV);
    return minusVDot > 0;
  }

  private rSqrd(that: Particle) {
    const rt = this.r + that.r;
    return rt * rt;
  }

  public collide(that: Particle, cor: CoefficientOfRestitution) {
    const mt = this.mass + that.mass;
    const dSqrd = this.curr.sqrdDistanceTo(that.curr);
    const d = this.curr.sub(that.curr);
    const v = this.v.sub(that.v);
    const dot = d.dot(v);
    const v1x = this.v.x - ((1 + cor) * that.mass * dot * d.x) / (dSqrd * mt);
    const v1y = this.v.y - ((1 + cor) * that.mass * dot * d.y) / (dSqrd * mt);
    const v2x = that.v.x + ((1 + cor) * this.mass * dot * d.x) / (dSqrd * mt);
    const v2y = that.v.y + ((1 + cor) * this.mass * dot * d.y) / (dSqrd * mt);
    this.v = new Vector2(v1x, v1y);
    that.v = new Vector2(v2x, v2y);
  }

  public isHorizontalWallCollision(width: Limit) {
    return this.curr.x - this.r < 0 || this.curr.x + this.r > width;
  }

  public isVerticalWallCollision(height: Limit) {
    return this.curr.y - this.r < 0 || this.curr.y + this.r > height;
  }

  public move() {
    this.prev = this.curr;
    this.curr = this.curr.add(this.v);
  }

  public shouldCollideWith(that: Particle) {
    return (
      this !== that &&
      this.isCollidingWithParticle(that) &&
      this.isGoingTowards(that)
    );
  }
}

function getCanvasCtxById(id: string) {
  const canvas = d3.select(`#${id}`).node() as HTMLCanvasElement;
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function drawParticle(p: Particle) {
  const particlesContext = getCanvasCtxById('particles');
  particlesContext.beginPath();
  particlesContext.arc(p.curr.x, p.curr.y, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fillColor.toStyle();
  particlesContext.fill();
  particlesContext.closePath();
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

const update = (
  particles: Particle[],
  width: Limit,
  height: Limit,
  cor: CoefficientOfRestitution,
) => {
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
    for (const p2 of particles)
      if (p1.shouldCollideWith(p2)) p1.collide(p2, cor);
  }
};

const disableContextMenu = (e: MouseEvent<HTMLCanvasElement>) =>
  e.preventDefault();

function composeParticles(
  numberOfParticles: number,
  particleSettings: () => ParticleSettings,
) {
  const particles: Particle[] = [];
  for (
    let i = 0;
    i < numberOfParticles;
    particles[i++] = new Particle(particleSettings())
  );
  return particles;
}

const DIMENSIONS = {
  boundedHeight: 0,
  boundedWidth: 0,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
  marginTop: 50,
  height: 0,
  width: 0,
};
const BLUE = new RGBA(0, 0, 255, 1);
const RED = new RGBA(255, 0, 0, 1);
const COR = 1;
const INITIAL_SPEED = 10;
const NUMBER_OF_PARTICLES = 800;
const RADIUS = 8;
const DIAMETER = RADIUS * 2;

function BrownianMotion(): JSX.Element {
  const { ref, dimensions } = useChartDimensions(DIMENSIONS);

  useEffect(() => {
    configureHistoricalCanvas();
    const particles = [
      ...composeParticles(1, () => ({
        fillColor: RED,
        isTracked: true,
        r: RADIUS * 2.5,
        vix: Math.random() * INITIAL_SPEED * Math.cos(getRandomAngle()),
        viy: Math.random() * INITIAL_SPEED * Math.sin(getRandomAngle()),
        x: dimensions.boundedWidth / 2,
        y: dimensions.boundedHeight / 2,
      })),
      ...composeParticles(NUMBER_OF_PARTICLES, () => ({
        fillColor: BLUE,
        isTracked: false,
        r: RADIUS,
        vix: Math.random() * INITIAL_SPEED * Math.cos(getRandomAngle()),
        viy: Math.random() * INITIAL_SPEED * Math.sin(getRandomAngle()),
        x: getRandomBetween(DIAMETER, dimensions.boundedWidth - DIAMETER),
        y: getRandomBetween(DIAMETER, dimensions.boundedHeight - DIAMETER),
      })),
    ];
    const timer = d3.interval(() =>
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
