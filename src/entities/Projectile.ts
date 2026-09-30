/**
 * High-Definition Elemental & Ballistic Projectile System
 * Distinct mechanical weapons:
 * - Laser: High-speed piercing beam with prism refraction on hitting hardened steel/bosses
 * - Tesla Ball Lightning: Slow plasma orb that radially discharges arc chains with EMP stun
 * - Gale Vortex: Cyclone singularity that exerts inward suction on tanks and deflects bullets
 * - Napalm Mortar: High-arc incendiary shell leaving persistent ground fire zones
 * - Cryo Nova: Sub-zero frost canister freezing enemies in an area solid
 * - Heavy AP / Twin Cannon: Kinetic ballistic artillery with ricochet bounce
 */

export type ProjectileElementType = 'kinetic' | 'laser' | 'tesla' | 'vortex' | 'napalm' | 'cryo';

export interface ProjectileOptions {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  damage: number;
  speed: number;
  owner: 'player' | 'enemy' | 'base';
  elementType?: ProjectileElementType;
  canBreakSteel?: boolean;
  bouncesLeft?: number;
  isLaser?: boolean;
  isMortar?: boolean;
  isMissile?: boolean;
  isTesla?: boolean;
  isIncendiary?: boolean;
  isCryo?: boolean;
  isVortex?: boolean;
  isNapalm?: boolean;
  isRefracted?: boolean;
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

  public elementType: ProjectileElementType;
  public canBreakSteel: boolean;
  public bouncesLeft: number;
  public isLaser: boolean;
  public isMortar: boolean;
  public isMissile: boolean;
  public isTesla: boolean;
  public isIncendiary: boolean;
  public isCryo: boolean;
  public isVortex: boolean;
  public isNapalm: boolean;
  public isRefracted: boolean;
  public target?: { x: number; y: number };

  public radius: number = 4;
  public isAlive: boolean = true;
  public lifetime: number = 0;
  public maxLifetime: number = 5.0;

  // Track entities pierced by laser or continuous beam to avoid multi-hitting per frame
  public hitTargets: Set<any> = new Set();

  // Periodic discharge ticker for Ball Lightning
  public dischargeTimer: number = 0;

  // Visual spin / pulse
  public animTimer: number = 0;

  constructor(opts: ProjectileOptions) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx;
    this.vy = opts.vy;
    this.angle = opts.angle;
    this.damage = opts.damage;
    this.speed = opts.speed;
    this.owner = opts.owner;

    this.elementType = opts.elementType ?? (opts.isLaser ? 'laser' : opts.isTesla ? 'tesla' : opts.isVortex ? 'vortex' : opts.isNapalm ? 'napalm' : opts.isCryo ? 'cryo' : 'kinetic');
    this.canBreakSteel = opts.canBreakSteel ?? false;
    this.bouncesLeft = opts.bouncesLeft ?? 0;
    this.isLaser = opts.isLaser ?? (this.elementType === 'laser');
    this.isMortar = opts.isMortar ?? false;
    this.isMissile = opts.isMissile ?? false;
    this.isTesla = opts.isTesla ?? (this.elementType === 'tesla');
    this.isIncendiary = opts.isIncendiary ?? false;
    this.isCryo = opts.isCryo ?? (this.elementType === 'cryo');
    this.isVortex = opts.isVortex ?? (this.elementType === 'vortex');
    this.isNapalm = opts.isNapalm ?? (this.elementType === 'napalm');
    this.isRefracted = opts.isRefracted ?? false;
    this.target = opts.target;

    if (this.isLaser) {
      this.radius = 5;
      this.maxLifetime = 0.55;
    } else if (this.isTesla) {
      this.radius = 11;
      this.maxLifetime = 2.4;
    } else if (this.isVortex) {
      this.radius = 8;
      this.maxLifetime = 1.4;
    } else if (this.isNapalm) {
      this.radius = 8;
      this.maxLifetime = 1.8;
      this.isMortar = true;
    } else if (this.isCryo) {
      this.radius = 7;
      this.maxLifetime = 1.6;
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
    this.animTimer += dt;

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
      const currentSpeed = Math.hypot(this.vx, this.vy);
      this.angle = 2 * normalAngle - this.angle + Math.PI;
      this.vx = Math.cos(this.angle) * currentSpeed;
      this.vy = Math.sin(this.angle) * currentSpeed;
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
      // 1. High-Energy Prismatic Laser Beam
      const glowColor = this.isRefracted ? '#e879f9' : '#00f0ff';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14;
      // Outer colored aura
      ctx.fillStyle = glowColor;
      ctx.fillRect(-22, -4, 44, 8);
      // Bright white core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-20, -2, 40, 4);
      ctx.shadowBlur = 0;
    } else if (this.isTesla) {
      // 2. Tesla Ball Lightning Plasma Orb
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      // Outer electric corona
      const pulseR = this.radius + Math.sin(this.animTimer * 20) * 2;
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, pulseR);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.8, '#0284c7');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // Crackling mini electric tendrils
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const a = (this.animTimer * 15) + (i * Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * (pulseR + 4), Math.sin(a) * (pulseR + 4));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    } else if (this.isVortex) {
      // 3. Gale Vortex Singularity Projectile
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.rotate(this.animTimer * 12);
      // Swirling aerodynamic turbine core
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a = i * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 3, a, a + 1.2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    } else if (this.isNapalm) {
      // 4. Burning Napalm Mortar Shell
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Flame core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(1, 0, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.isCryo) {
      // 5. Cryo Frost Nova Ice Canister
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      // Diamond ice crystal shape
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(0, -5);
      ctx.lineTo(-8, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-4, -2, 6, 4);
      ctx.shadowBlur = 0;
    } else if (this.isMissile) {
      // Guided rocket with red warhead
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-8, -3, 16, 6);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(8, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillRect(-8, -5, 4, 10);
    } else if (this.isMortar) {
      // Heavy Ballistic Siege Mortar
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard HD Kinetic Artillery Shell
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

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
