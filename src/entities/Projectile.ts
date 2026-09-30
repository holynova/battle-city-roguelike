/**
 * High-Definition Projectile System
 * Supports standard shells, bouncing kinetics, armor-piercers, lasers, and missiles.
 */

export interface ProjectileOptions {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  damage: number;
  speed: number;
  owner: 'player' | 'enemy' | 'base';
  canBreakSteel?: boolean;
  bouncesLeft?: number;
  isLaser?: boolean;
  isMortar?: boolean;
  isMissile?: boolean;
  isTesla?: boolean;
  isIncendiary?: boolean;
  isCryo?: boolean;
  target?: { x: number; y: number };
}

export class Projectile {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public angle: number;
  public damage: number;
  public speed: number;
  public owner: 'player' | 'enemy' | 'base';

  public canBreakSteel: boolean;
  public bouncesLeft: number;
  public isLaser: boolean;
  public isMortar: boolean;
  public isMissile: boolean;
  public isTesla: boolean;
  public isIncendiary: boolean;
  public isCryo: boolean;
  public target?: { x: number; y: number };

  public radius: number = 4;
  public isAlive: boolean = true;
  public lifetime: number = 0;
  public maxLifetime: number = 5.0;

  constructor(opts: ProjectileOptions) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx;
    this.vy = opts.vy;
    this.angle = opts.angle;
    this.damage = opts.damage;
    this.speed = opts.speed;
    this.owner = opts.owner;

    this.canBreakSteel = opts.canBreakSteel ?? false;
    this.bouncesLeft = opts.bouncesLeft ?? 0;
    this.isLaser = opts.isLaser ?? false;
    this.isMortar = opts.isMortar ?? false;
    this.isMissile = opts.isMissile ?? false;
    this.isTesla = opts.isTesla ?? false;
    this.isIncendiary = opts.isIncendiary ?? false;
    this.isCryo = opts.isCryo ?? false;
    this.target = opts.target;

    if (this.isLaser) {
      this.radius = 5;
      this.maxLifetime = 0.8;
    } else if (this.isMortar) {
      this.radius = 7;
      this.maxLifetime = 2.0;
    } else if (this.isMissile) {
      this.radius = 5;
      this.maxLifetime = 3.5;
    }
  }

  public update(dt: number): void {
    this.lifetime += dt;
    if (this.lifetime >= this.maxLifetime) {
      this.isAlive = false;
      return;
    }

    // Missile homing guidance
    if (this.isMissile && this.target) {
      const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      let angleDiff = targetAngle - this.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const turnRate = 4.0 * dt;
      this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);

      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  // Handle ricochet bounce off walls
  public bounce(normalAngle: number) {
    if (this.bouncesLeft > 0) {
      this.bouncesLeft--;
      // Reflect velocity vector
      const currentSpeed = Math.hypot(this.vx, this.vy);
      // Invert against normal
      this.angle = 2 * normalAngle - this.angle + Math.PI;
      this.vx = Math.cos(this.angle) * currentSpeed;
      this.vy = Math.sin(this.angle) * currentSpeed;
      // Slight damage boost on bounce (Kinetic bounce mod)
      this.damage *= 1.25;
      return true;
    }
    this.isAlive = false;
    return false;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.isLaser) {
      // High-energy cyan beam
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-16, -3, 32, 6);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-18, -1.5, 36, 3);
      ctx.shadowBlur = 0;
    } else if (this.isMissile) {
      // Guided rocket with smoke tail
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-8, -3, 16, 6);
      // Red warhead
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(8, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      // Fins
      ctx.fillStyle = '#475569';
      ctx.fillRect(-8, -5, 4, 10);
    } else if (this.isMortar) {
      // Large explosive shell
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard HD artillery shell with glowing core
      const color = this.owner === 'player' ? '#fde047' : '#f87171';
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-1, 0, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elemental tints
      if (this.isTesla) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-6, -2, 12, 4);
      } else if (this.isIncendiary) {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(-6, -2, 12, 4);
      }

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
