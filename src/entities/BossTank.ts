/**
 * Epic Boss Tank: Land Cruiser "Goliath" (多炮塔陆上巡洋舰)
 * Multi-turret, phased attacks, missile barrages, and dynamic destruction states.
 */

import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { TileMap } from '../map/TileMap';
import { ParticleFX } from '../graphics/ParticleFX';
import { HDGraphics } from '../graphics/HDGraphics';
import { sounds } from '../audio/SoundEffects';

export class BossTank extends Tank {
  public phase: 1 | 2 = 1;
  private mainGunCooldown: number = 2.0;
  private subGunsCooldown: number = 0.8;
  private missileCooldown: number = 4.0;

  constructor(x: number, y: number) {
    super(x, y, 450, 55); // 450 HP
    this.shield = 100;
    this.maxShield = 100;
    this.radius = 48; // Huge footprint

    this.chassisAngle = Math.PI / 2; // Facing down
    this.turretAngle = Math.PI / 2;
  }

  public update(
    dt: number,
    map: TileMap,
    playerPos: { x: number; y: number },
    basePos: { x: number; y: number },
    vfx: ParticleFX
  ): Projectile[] {
    const spawnedBullets: Projectile[] = [];
    if (!this.isAlive) return spawnedBullets;

    this.updateStatus(dt, vfx);

    // Phase transition check
    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.speed = 85; // Enrage speed boost
      vfx.spawnExplosion(this.x, this.y, true);
      vfx.spawnFloatingText(this.x, this.y - 40, '⚠️ BOSS ENRAGED! PHASE 2 ⚠️', '#ef4444');
      sounds.playExplosion(true);
      sounds.playBaseAlarm();
    }

    // Heavy boss crushes brick walls simply by moving
    const col = Math.floor(this.x / map.tileSize);
    const row = Math.floor(this.y / map.tileSize);
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < map.rows && c >= 0 && c < map.cols) {
          if (map.grid[r][c] === 1) { // Brick
            map.grid[r][c] = 0;
            vfx.spawnBrickDebris(c * map.tileSize + 26, r * map.tileSize + 26);
            sounds.playBrickDestroy();
          }
        }
      }
    }

    // Movement: Patrol horizontally across top/middle of map
    const moveDist = this.speed * dt;
    this.x += Math.cos(this.chassisAngle) * moveDist;
    if (this.x < 120) {
      this.x = 120;
      this.chassisAngle = 0; // Turn right
    } else if (this.x > map.cols * map.tileSize - 120) {
      this.x = map.cols * map.tileSize - 120;
      this.chassisAngle = Math.PI; // Turn left
    }

    // Main Siege Cannon
    this.mainGunCooldown -= dt;
    if (this.mainGunCooldown <= 0) {
      this.mainGunCooldown = this.phase === 2 ? 1.4 : 2.2;

      // Fires heavy explosive shells aimed toward player or base
      const target = Math.random() < 0.5 ? playerPos : basePos;
      const angle = Math.atan2(target.y - this.y, target.x - this.x);

      spawnedBullets.push(new Projectile({
        x: this.x,
        y: this.y + 20,
        vx: Math.cos(angle) * 320,
        vy: Math.sin(angle) * 320,
        angle,
        damage: 45,
        speed: 320,
        owner: 'enemy',
        canBreakSteel: true,
        isMortar: true
      }));

      sounds.playShoot('heavy');
      vfx.spawnMuzzleFlash(this.x, this.y + 40, angle, '#ef4444');
    }

    // Sub-guns rapid fire (tracking player)
    this.subGunsCooldown -= dt;
    if (this.subGunsCooldown <= 0) {
      this.subGunsCooldown = 0.7;
      const angleToPlayer = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);

      // Left gun
      spawnedBullets.push(new Projectile({
        x: this.x - 30,
        y: this.y + 10,
        vx: Math.cos(angleToPlayer) * 360,
        vy: Math.sin(angleToPlayer) * 360,
        angle: angleToPlayer,
        damage: 18,
        speed: 360,
        owner: 'enemy'
      }));

      // Right gun
      spawnedBullets.push(new Projectile({
        x: this.x + 30,
        y: this.y + 10,
        vx: Math.cos(angleToPlayer) * 360,
        vy: Math.sin(angleToPlayer) * 360,
        angle: angleToPlayer,
        damage: 18,
        speed: 360,
        owner: 'enemy'
      }));

      sounds.playShoot('dual');
      vfx.spawnMuzzleFlash(this.x - 30, this.y + 10, angleToPlayer, '#f97316');
      vfx.spawnMuzzleFlash(this.x + 30, this.y + 10, angleToPlayer, '#f97316');
    }

    // Phase 2: Homing Missile Barrages
    if (this.phase === 2) {
      this.missileCooldown -= dt;
      if (this.missileCooldown <= 0) {
        this.missileCooldown = 4.0;
        for (const side of [-1, 1]) {
          spawnedBullets.push(new Projectile({
            x: this.x + side * 40,
            y: this.y,
            vx: side * 150,
            vy: -80,
            angle: -Math.PI / 2,
            damage: 35,
            speed: 250,
            owner: 'enemy',
            isMissile: true,
            target: playerPos
          }));
        }
        sounds.playShoot('missile');
      }
    }

    return spawnedBullets;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const tex = HDGraphics.getBossGoliath();
    const drawSize = 128;
    ctx.drawImage(tex, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

    // Glowing aura if in Phase 2
    if (this.phase === 2) {
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(Date.now() * 0.01) * 0.25})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Large boss health bar
    this.renderHealthBar(ctx, 80, 48);
  }
}
