/**
 * High-Definition Aggressive Enemy Tank Entity
 * Highly lethal enemy units with tactical tracking, rapid fire, and hit reaction feedback.
 */

import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { TileMap } from '../map/TileMap';
import { ParticleFX } from '../graphics/ParticleFX';
import { HDGraphics } from '../graphics/HDGraphics';
import { sounds } from '../audio/SoundEffects';

export type EnemyClass = 'scout' | 'assault' | 'heavy' | 'missile';

export class EnemyTank extends Tank {
  public enemyClass: EnemyClass;
  public isBonusTank: boolean = false; // Classic flashing red tank that drops powerups

  private shootCooldown: number = 0;
  private changeDirTimer: number = 0;
  private targetType: 'player' | 'base' = 'player'; // Prioritize player for aggressive combat

  constructor(x: number, y: number, enemyClass: EnemyClass, isBonus: boolean = false) {
    let hp = 30;
    let speed = 130;
    if (enemyClass === 'scout') {
      hp = 30;
      speed = 195; // Very agile
    } else if (enemyClass === 'assault') {
      hp = 75;
      speed = 135;
    } else if (enemyClass === 'heavy') {
      hp = 160;
      speed = 85;
    } else if (enemyClass === 'missile') {
      hp = 60;
      speed = 105;
    }

    super(x, y, hp, speed);
    this.enemyClass = enemyClass;
    this.isBonusTank = isBonus;

    this.chassisAngle = Math.PI / 2;
    this.turretAngle = Math.PI / 2;

    this.shootCooldown = 0.3 + Math.random() * 0.8;
    this.changeDirTimer = 0.8 + Math.random() * 1.2;
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

    if (this.freezeTimer > 0 || this.stunTimer > 0) {
      return spawnedBullets;
    }

    const distToPlayer = Math.hypot(playerPos.x - this.x, playerPos.y - this.y);
    const angleToPlayer = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);

    // Dynamic Turret Tracking: If player is nearby, turret tracks player!
    if (distToPlayer < 360) {
      let diff = angleToPlayer - this.turretAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.turretAngle += diff * Math.min(1.0, dt * 12);
    } else {
      this.turretAngle = this.chassisAngle;
    }

    // AI Direction Decisions
    this.changeDirTimer -= dt;
    if (this.changeDirTimer <= 0) {
      this.changeDirTimer = 1.0 + Math.random() * 1.2;

      // 70% chance to target player directly, 30% to target base
      this.targetType = Math.random() < 0.7 ? 'player' : 'base';
      const target = this.targetType === 'base' ? basePos : playerPos;

      const dx = target.x - this.x;
      const dy = target.y - this.y;

      if (Math.abs(dy) > Math.abs(dx) && Math.random() < 0.75) {
        this.chassisAngle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else if (Math.random() < 0.75) {
        this.chassisAngle = dx > 0 ? 0 : Math.PI;
      } else {
        const dirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        this.chassisAngle = dirs[Math.floor(Math.random() * dirs.length)];
      }
    }

    // Move forward
    const moveDist = this.speed * dt;
    const nx = this.x + Math.cos(this.chassisAngle) * moveDist;
    const ny = this.y + Math.sin(this.chassisAngle) * moveDist;

    if (!map.checkTankCollision(nx, ny, this.radius, false)) {
      this.x = nx;
      this.y = ny;

      this.treadTimer += dt;
      if (this.treadTimer >= 0.15) {
        this.treadTimer = 0;
        vfx.addTreadMark(this.x, this.y, this.chassisAngle);
      }
    } else {
      // Wall blocked: immediately turn or destroy
      this.shootCooldown = 0.05;
      const dirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      this.chassisAngle = dirs[Math.floor(Math.random() * dirs.length)];
      this.changeDirTimer = 0.6;
    }

    // -------------------------------------------------------------
    // High-Aggression Shooting AI
    // -------------------------------------------------------------
    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = this.enemyClass === 'assault' ? 0.8 : (this.enemyClass === 'scout' ? 0.9 : 1.2);

      const bulletSpeed = this.enemyClass === 'scout' ? 360 : 280;
      const bulletDamage = this.enemyClass === 'heavy' ? 30 : (this.enemyClass === 'scout' ? 14 : 20);

      const muzzleX = this.x + Math.cos(this.turretAngle) * 26;
      const muzzleY = this.y + Math.sin(this.turretAngle) * 26;

      if (this.enemyClass === 'missile') {
        spawnedBullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 240,
          vy: Math.sin(this.turretAngle) * 240,
          angle: this.turretAngle,
          damage: 28,
          speed: 240,
          owner: 'enemy',
          isMissile: true,
          target: playerPos
        }));
        sounds.playShoot('missile');
      } else if (this.enemyClass === 'assault') {
        // Dual parallel burst
        for (const side of [-6, 6]) {
          const perpX = Math.cos(this.turretAngle + Math.PI / 2) * side;
          const perpY = Math.sin(this.turretAngle + Math.PI / 2) * side;
          spawnedBullets.push(new Projectile({
            x: muzzleX + perpX,
            y: muzzleY + perpY,
            vx: Math.cos(this.turretAngle) * bulletSpeed,
            vy: Math.sin(this.turretAngle) * bulletSpeed,
            angle: this.turretAngle,
            damage: 16,
            speed: bulletSpeed,
            owner: 'enemy'
          }));
        }
        sounds.playShoot('dual');
      } else {
        spawnedBullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * bulletSpeed,
          vy: Math.sin(this.turretAngle) * bulletSpeed,
          angle: this.turretAngle,
          damage: bulletDamage,
          speed: bulletSpeed,
          owner: 'enemy'
        }));
        sounds.playShoot('standard');
      }
      vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#ef4444');
    }

    return spawnedBullets;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit Flash feedback (white silhouette overlay on hit)
    if (this.hitFlashTimer > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18;
    } else if (this.isBonusTank) {
      const flash = Math.sin(Date.now() * 0.015) > 0;
      if (flash) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
      }
    } else if (this.freezeTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    }

    // Rotate chassis
    ctx.save();
    ctx.rotate(this.chassisAngle + Math.PI / 2);

    let tex: HTMLCanvasElement;
    if (this.enemyClass === 'scout') tex = HDGraphics.getEnemyScout();
    else if (this.enemyClass === 'assault') tex = HDGraphics.getEnemyAssault();
    else if (this.enemyClass === 'heavy') tex = HDGraphics.getEnemyHeavy();
    else tex = HDGraphics.getEnemyMissile();

    const half = this.radius * 1.3;
    ctx.drawImage(tex, -half, -half, half * 2, half * 2);
    ctx.restore();

    // Rotate turret towards aiming angle
    ctx.save();
    ctx.rotate(this.turretAngle + Math.PI / 2);
    const turretTex = HDGraphics.getEnemyTurret(this.enemyClass === 'heavy' ? 'heavy' : 'single');
    ctx.drawImage(turretTex, -half, -half, half * 2, half * 2);
    ctx.restore();

    ctx.restore();

    // Overhead Health Bar
    this.renderHealthBar(ctx, 32, 24);
  }
}
