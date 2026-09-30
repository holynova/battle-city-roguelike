/**
 * Eagle Base (Command Bastion) Entity
 * Preserves the classic FC defense objective with modern shields, upgrades, and tolerance.
 */

import { HDGraphics } from '../graphics/HDGraphics';
import { ParticleFX } from '../graphics/ParticleFX';
import { sounds } from '../audio/SoundEffects';

export class EagleBase {
  public x: number;
  public y: number;
  public size: number = 52;
  public hp: number = 100;
  public maxHp: number = 100;
  public shield: number = 50;
  public maxShield: number = 50;
  public isDestroyed: boolean = false;

  // Upgradable base features (from roguelite perks)
  public hasPointDefense: boolean = false;
  public hasNanoShield: boolean = false;
  private defenseCooldown: number = 0;
  private shieldRegenTimer: number = 0;

  constructor(gridCol: number = 6, gridRow: number = 12, tileSize: number = 52) {
    this.x = gridCol * tileSize + tileSize / 2;
    this.y = gridRow * tileSize + tileSize / 2;
  }

  public update(dt: number, _vfx: ParticleFX): { fireBullet?: { x: number; y: number; angle: number } } {
    if (this.isDestroyed) return {};

    // Nano-shield auto regen perk
    if (this.hasNanoShield && this.shield < this.maxShield) {
      this.shieldRegenTimer += dt;
      if (this.shieldRegenTimer >= 1.0) {
        this.shieldRegenTimer = 0;
        this.shield = Math.min(this.maxShield, this.shield + 5);
      }
    }

    // Point defense turret perk
    if (this.hasPointDefense) {
      this.defenseCooldown -= dt;
      // Triggers every 1.5 seconds if enemies are nearby (handled by Engine)
    }

    return {};
  }

  public takeDamage(amount: number, vfx: ParticleFX): boolean {
    if (this.isDestroyed) return false;

    // Absorb with shield first
    let remaining = amount;
    if (this.shield > 0) {
      if (this.shield >= remaining) {
        this.shield -= remaining;
        remaining = 0;
        vfx.spawnFloatingText(this.x, this.y - 20, 'SHIELD -' + amount, '#38bdf8');
      } else {
        remaining -= this.shield;
        this.shield = 0;
        vfx.spawnFloatingText(this.x, this.y - 20, 'SHIELD BREAK!', '#ef4444');
      }
    }

    if (remaining > 0) {
      this.hp -= remaining;
      sounds.playBaseAlarm();
      vfx.spawnBrickDebris(this.x, this.y);
      vfx.spawnFloatingText(this.x, this.y - 20, `-${remaining}`, '#ef4444');
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDestroyed = true;
      vfx.spawnExplosion(this.x, this.y, true);
      sounds.playExplosion(true);
      return true;
    }
    return false;
  }

  public repair(amount: number) {
    if (this.isDestroyed) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.shield = this.maxShield;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const tex = HDGraphics.getEagleBase(this.isDestroyed);
    const half = this.size / 2;

    ctx.save();
    ctx.drawImage(tex, this.x - half, this.y - half, this.size, this.size);

    if (!this.isDestroyed) {
      // Draw shield aura if shield > 0
      if (this.shield > 0) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(Date.now() * 0.005) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, half + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw health and shield bars
      const barW = 46;
      const barH = 5;
      const barY = this.y - half - 10;

      // Health background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.x - barW / 2, barY, barW, barH);

      // Health fill
      const hpPct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : '#ef4444';
      ctx.fillRect(this.x - barW / 2, barY, barW * hpPct, barH);

      // Shield bar
      if (this.maxShield > 0) {
        const shieldPct = Math.max(0, this.shield / this.maxShield);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(this.x - barW / 2, barY - 4, barW * shieldPct, 3);
      }
    }

    ctx.restore();
  }
}
