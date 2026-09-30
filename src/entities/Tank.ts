/**
 * Base Tank Class for Player, Enemies, and Bosses
 */

import { ParticleFX } from '../graphics/ParticleFX';
import { sounds } from '../audio/SoundEffects';

export abstract class Tank {
  public x: number;
  public y: number;
  public chassisAngle: number = 0; // Direction of chassis / movement
  public turretAngle: number = 0;  // Direction of cannon aiming
  public speed: number = 100;
  public radius: number = 22;

  public hp: number = 100;
  public maxHp: number = 100;
  public shield: number = 0;
  public maxShield: number = 0;
  public isAlive: boolean = true;

  // Status effects
  public invulnerableTimer: number = 0;
  public freezeTimer: number = 0;
  public burnTimer: number = 0;
  public stunTimer: number = 0;
  private burnTickTimer: number = 0;

  // Track mark generation timer
  protected treadTimer: number = 0;

  constructor(x: number, y: number, hp: number = 100, speed: number = 100) {
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
  }

  public updateStatus(dt: number, vfx: ParticleFX) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }
    if (this.freezeTimer > 0) {
      this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    }
    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
    }

    if (this.burnTimer > 0) {
      this.burnTimer = Math.max(0, this.burnTimer - dt);
      this.burnTickTimer += dt;
      if (this.burnTickTimer >= 0.5) {
        this.burnTickTimer = 0;
        this.takeDamage(4, vfx);
        vfx.spawnFloatingText(this.x, this.y - 15, 'BURN -4', '#ea580c');
      }
    }
  }

  public takeDamage(amount: number, vfx: ParticleFX): boolean {
    if (!this.isAlive || this.invulnerableTimer > 0) return false;

    let dmg = amount;
    if (this.shield > 0) {
      if (this.shield >= dmg) {
        this.shield -= dmg;
        dmg = 0;
        vfx.spawnFloatingText(this.x, this.y - 15, 'SHIELD -' + amount, '#38bdf8');
      } else {
        dmg -= this.shield;
        this.shield = 0;
      }
    }

    if (dmg > 0) {
      this.hp -= dmg;
      vfx.spawnFloatingText(this.x, this.y - 15, `-${dmg}`, '#ef4444');
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isAlive = false;
      this.onDeath(vfx);
      return true;
    }
    return false;
  }

  public applyFreeze(duration: number) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  public applyStun(duration: number) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  public applyBurn(duration: number) {
    this.burnTimer = Math.max(this.burnTimer, duration);
  }

  protected onDeath(vfx: ParticleFX) {
    vfx.spawnExplosion(this.x, this.y, this.radius > 30);
    sounds.playExplosion(this.radius > 30);
  }

  // Draw overhead health and shield bar
  protected renderHealthBar(ctx: CanvasRenderingContext2D, width: number = 36, offsetY: number = 28) {
    if (this.hp <= 0) return;
    const barH = 4;
    const barX = this.x - width / 2;
    const barY = this.y - offsetY;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX, barY, width, barH);

    // HP Fill
    const pct = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = pct > 0.4 ? '#22c55e' : '#ef4444';
    ctx.fillRect(barX, barY, width * pct, barH);

    // Shield Fill
    if (this.maxShield > 0 && this.shield > 0) {
      const sPct = Math.max(0, this.shield / this.maxShield);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(barX, barY - 3, width * sPct, 2.5);
    }
  }

  public abstract render(ctx: CanvasRenderingContext2D): void;
}
