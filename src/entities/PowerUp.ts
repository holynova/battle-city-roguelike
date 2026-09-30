/**
 * PowerUp Pickup Entity
 * Spawns on battlefield, hovers, pulses, and provides classic + roguelite benefits.
 */

import { HDGraphics } from '../graphics/HDGraphics';

export type PowerUpType = 'star' | 'clock' | 'bomb' | 'shovel' | 'helmet' | 'repair' | 'scrap';

export class PowerUp {
  public x: number;
  public y: number;
  public type: PowerUpType;
  public radius: number = 18;
  public isAlive: boolean = true;
  public lifetime: number = 0;
  public maxLifetime: number = 20; // 20 seconds before disappearing

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  public update(dt: number) {
    this.lifetime += dt;
    if (this.lifetime >= this.maxLifetime) {
      this.isAlive = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const icon = HDGraphics.getPowerupIcon(this.type);
    const pulse = 1 + Math.sin(this.lifetime * 6) * 0.1;
    const hoverY = Math.sin(this.lifetime * 4) * 4;

    ctx.save();
    ctx.translate(this.x, this.y + hoverY);
    ctx.scale(pulse, pulse);

    // Blinking warning when about to expire
    if (this.lifetime > this.maxLifetime - 4) {
      if (Math.floor(this.lifetime * 8) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
    }

    const drawSize = 38;
    ctx.drawImage(icon, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

    ctx.restore();
  }
}
