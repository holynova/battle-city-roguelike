/**
 * High-Definition Enemy Tank Entity
 * 4 unique tactical classes with intelligent behaviors and classic flashing bonus tanks.
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
  private targetType: 'player' | 'base' = 'base';

  constructor(x: number, y: number, enemyClass: EnemyClass, isBonus: boolean = false) {
    let hp = 30;
    let speed = 110;
    if (enemyClass === 'scout') {
      hp = 25;
      speed = 170;
    } else if (enemyClass === 'assault') {
      hp = 60;
      speed = 115;
    } else if (enemyClass === 'heavy') {
      hp = 130; // 4-5 hits to destroy
      speed = 70;
    } else if (enemyClass === 'missile') {
      hp = 45;
      speed = 90;
    }

    super(x, y, hp, speed);
    this.enemyClass = enemyClass;
    this.isBonusTank = isBonus;

    // Initial heading: downwards into the arena
    this.chassisAngle = Math.PI / 2;
    this.turretAngle = Math.PI / 2;

    this.shootCooldown = 0.5 + Math.random() * 1.5;
    this.changeDirTimer = 1.0 + Math.random() * 2.0;
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

    // If completely frozen (e.g. Clock powerup) or stunned, skip logic
    if (this.freezeTimer > 0 || this.stunTimer > 0) {
      return spawnedBullets;
    }

    // AI Direction Decisions
    this.changeDirTimer -= dt;
    if (this.changeDirTimer <= 0) {
      this.changeDirTimer = 1.5 + Math.random() * 2.0;

      // Pick target
      this.targetType = Math.random() < 0.65 ? 'base' : 'player';
      const target = this.targetType === 'base' ? basePos : playerPos;

      // Decide whether to move horizontally or vertically toward target
      const dx = target.x - this.x;
      const dy = target.y - this.y;

      // 4 cardinal directions or angled
      if (Math.abs(dy) > Math.abs(dx) && Math.random() < 0.7) {
        this.chassisAngle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else if (Math.random() < 0.7) {
        this.chassisAngle = dx > 0 ? 0 : Math.PI;
      } else {
        // Random wandering turn
        const dirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        this.chassisAngle = dirs[Math.floor(Math.random() * dirs.length)];
      }
      this.turretAngle = this.chassisAngle;
    }

    // Move forward
    const moveDist = this.speed * dt;
    const nx = this.x + Math.cos(this.chassisAngle) * moveDist;
    const ny = this.y + Math.sin(this.chassisAngle) * moveDist;

    if (!map.checkTankCollision(nx, ny, this.radius, false)) {
      this.x = nx;
      this.y = ny;

      // Tread marks
      this.treadTimer += dt;
      if (this.treadTimer >= 0.18) {
        this.treadTimer = 0;
        vfx.addTreadMark(this.x, this.y, this.chassisAngle);
      }
    } else {
      // Blocked by wall: fire immediately to break obstacles, then turn
      this.shootCooldown = 0.05;
      const dirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      this.chassisAngle = dirs[Math.floor(Math.random() * dirs.length)];
      this.turretAngle = this.chassisAngle;
      this.changeDirTimer = 0.8 + Math.random() * 1.0;
    }

    // Shooting AI
    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = this.enemyClass === 'assault' ? 1.1 : 1.8;

      const bulletSpeed = this.enemyClass === 'scout' ? 320 : 250;
      const bulletDamage = this.enemyClass === 'heavy' ? 35 : (this.enemyClass === 'scout' ? 15 : 20);

      const muzzleX = this.x + Math.cos(this.turretAngle) * 26;
      const muzzleY = this.y + Math.sin(this.turretAngle) * 26;

      if (this.enemyClass === 'missile') {
        // Guided rocket or mortar
        spawnedBullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 220,
          vy: Math.sin(this.turretAngle) * 220,
          angle: this.turretAngle,
          damage: 30,
          speed: 220,
          owner: 'enemy',
          isMissile: true,
          target: basePos
        }));
        sounds.playShoot('missile');
      } else {
        // Direct cannon shell
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

    // Flashing effect for classic bonus tanks
    if (this.isBonusTank) {
      const flash = Math.sin(Date.now() * 0.012) > 0;
      if (flash) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
      }
    }

    // Freeze / Stun visual overlay
    if (this.freezeTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
    }

    // Rotate chassis & turret
    ctx.rotate(this.chassisAngle + Math.PI / 2);

    let tex: HTMLCanvasElement;
    if (this.enemyClass === 'scout') tex = HDGraphics.getEnemyScout();
    else if (this.enemyClass === 'assault') tex = HDGraphics.getEnemyAssault();
    else if (this.enemyClass === 'heavy') tex = HDGraphics.getEnemyHeavy();
    else tex = HDGraphics.getEnemyMissile();

    const drawSize = this.enemyClass === 'heavy' ? 64 : 54;
    ctx.drawImage(tex, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

    ctx.restore();

    // Overhead HP bar
    this.renderHealthBar(ctx, 34, 26);
  }
}
