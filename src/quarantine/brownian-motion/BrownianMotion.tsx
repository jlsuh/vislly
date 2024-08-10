import * as d3 from 'd3';
import { useEffect } from 'react';
import useChartDimensions from '../useChartDimensions';

type Angle = number;
type Channel = number;
type Coord = number;
type Limit = number;
type Mass = number;
type Radius = number;
type Speed = number;

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

type ParticleSettings = {
  x: Coord;
  y: Coord;
  r: Radius;
  speed: Speed;
  initialAngle: Angle;
  fillColor: RGBA;
  isTracked: boolean;
};

class Particle {
  curr: Vector2;
  prev: Vector2;
  r: Radius;
  mass: Mass;
  v: Vector2;
  fillColor: RGBA;
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

// class ParticleBuilder {
//   private particle: Particle = new Particle({
//     x: 0,
//     y: 0,
//     r: 0,
//     speed: 0,
//     initialAngle: 0,
//     fillColor: new RGBA(0, 0, 0, 0),
//     isTracked: false,
//   });

//   constructor() {
//     this.reset();
//   }

//   public curr(x: Coord, y: Coord) {
//     this.particle.curr = new Vector2(x, y);
//     return this;
//   }

//   public prev(x: Coord, y: Coord) {
//     this.particle.prev = new Vector2(x, y);
//     return this;
//   }

//   public r(r: Radius) {
//     this.particle.r = r;
//     return this;
//   }

//   public mass(mass: Mass) {
//     this.particle.mass = mass;
//     return this;
//   }

//   public v(vx: Coord, vy: Coord) {
//     this.particle.v = new Vector2(vx, vy);
//     return this;
//   }

//   public fillColor(fillColor: RGBA) {
//     this.particle.fillColor = fillColor;
//     return this;
//   }

//   public isTracked(isTracked: boolean) {
//     this.particle.isTracked = isTracked;
//     return this;
//   }

//   private reset() {
//     this.particle = new Particle({
//       x: 0,
//       y: 0,
//       r: 0,
//       speed: 0,
//       initialAngle: 0,
//       fillColor: new RGBA(0, 0, 0, 0),
//       isTracked: false,
//     });
//   }

//   public build() {
//     const particle = this.particle;
//     this.reset();
//     return particle;
//   }
// }

function drawParticle(p: Particle) {
  const particlesContext = getCanvasCtxById('particles');
  particlesContext.beginPath();
  particlesContext.arc(p.curr.x, p.curr.y, p.r, 0, Math.PI * 2);
  particlesContext.fillStyle = p.fillColor.toStyle();
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

function resetCanvas(width: Limit, height: Limit) {
  getCanvasCtxById('particles').clearRect(0, 0, width, height);
}

const update = (particles: Particle[], width: Limit, height: Limit) => {
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

const NUMBER_OF_PARTICLES = 500;
const RADIUS = 8;
const INITIAL_SPEED = 10; // TODO: Consider 10 as masimum speed
// const PARTICLE_BUILDER = new ParticleBuilder();

function composeParticles(
  height: Limit,
  width: Limit,
  isTracked: boolean,
  r: Radius,
  initialSpeed: Speed,
  fillColor: RGBA,
  numberOfParticles: number,
) {
  return Array.from({ length: numberOfParticles }, () => {
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
      fillColor,
      isTracked,
    });
    // return PARTICLE_BUILDER.curr(x, y)
    //   .prev(x, y)
    //   .r(r)
    //   .mass(r)
    //   .v(speed * Math.cos(getRandomAngle()), speed * Math.sin(getRandomAngle()))
    //   .fillColor(fillColor)
    //   .isTracked(isTracked)
    //   .build();
  });
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
        new RGBA(255, 0, 0, 1),
        1,
      ),
      ...composeParticles(
        dimensions.boundedHeight,
        dimensions.boundedWidth,
        false,
        RADIUS,
        INITIAL_SPEED,
        new RGBA(0, 0, 255, 1),
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
