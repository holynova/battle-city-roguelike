/**
 * Elite Commander Tanks (精英装甲指挥官)
 * Powerful mid-bosses with independent top health bars, unique Danmaku attack patterns, and special mechanics:
 * 1. Commander Ignis (烈焰指挥官): 3-way spread incendiary shotgun, explosive cluster mines, overdrive ramming.
 * 2. Tesla Stormer (雷暴破坏者): Radial 8-way Danmaku electric ring, targeted railgun laser beam, EMP shockwave.
 * 3. Void Dreadnought (虚空引力使徒): Swirling Danmaku spiral flower, gravitational vortex missile, drone escort call.
 */

import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { TileMap } from '../map/TileMap';
import { ParticleFX } from '../graphics/ParticleFX';
import { HDGraphics } from '../graphics/HDGraphics';
import { sounds } from '../audio/SoundEffects';

export type EliteType = 'ignis' | 'storm' | 'void';

export class EliteTank extends Tank {
  public eliteType: EliteType;
  public nameZh: string;
  public titleZh: string;
  public color: string;

  private attackTimer: number = 0;
  private specialAttackTimer: number = 0;
  private moveChangeTimer: number = 0;
  private danmakuAngle: number = 0;

  // Mine array for Ignis
  public mines: { x: number; y: number; timer: number; radius: number }[] = [];

  constructor(x: number, y: number, eliteType: EliteType) {
    let hp = 280;
    let shield = 80;
    let speed = 80;
    let nameZh = '鬼火掠食者';
    let titleZh = '精英指挥官';
    let color = '#ef4444';

    if (eliteType === 'storm') {
      hp = 380;
      shield = 120;
      speed = 75;
      nameZh = '雷暴泰坦破坏者';
      titleZh = '特装原型机';
      color = '#38bdf8';
    } else if (eliteType === 'void') {
      hp = 480;
      shield = 150;
      speed = 70;
      nameZh = '虚空引力巨擘';
      titleZh = '深渊禁卫司令';
      color = '#10b981';
    }

    super(x, y, hp, speed);
    this.maxShield = shield;
    this.shield = shield;
    this.radius = 34; // Large footprint

    this.eliteType = eliteType;
    this.nameZh = nameZh;
    this.titleZh = titleZh;
    this.color = color;

    this.chassisAngle = Math.PI / 2;
    this.turretAngle = Math.PI / 2;
  }

  public update(
    dt: number,
    map: TileMap,
    playerPos: { x: number; y: number },
    _basePos: { x: number; y: number },
    vfx: ParticleFX
  ): Projectile[] {
    const spawnedBullets: Projectile[] = [];
    if (!this.isAlive) return spawnedBullets;

    this.updateStatus(dt, vfx);

    // If completely frozen or stunned, skip attacks
    if (this.freezeTimer > 0 || this.stunTimer > 0) {
      return spawnedBullets;
    }

    // Always aim turret toward player
    const targetAngle = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);
    let angleDiff = targetAngle - this.turretAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.turretAngle += angleDiff * Math.min(1.0, dt * 10);

    // Movement: Aggressive pursuit or tactical repositioning
    this.moveChangeTimer -= dt;
    if (this.moveChangeTimer <= 0) {
      this.moveChangeTimer = 1.2 + Math.random() * 1.5;
      const distToPlayer = Math.hypot(playerPos.x - this.x, playerPos.y - this.y);
      if (distToPlayer > 300) {
        // Move towards player
        this.chassisAngle = targetAngle;
      } else {
        // Circle around player (flank)
        this.chassisAngle = targetAngle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
      }
    }

    // Move
    const moveDist = this.speed * dt;
    const nx = this.x + Math.cos(this.chassisAngle) * moveDist;
    const ny = this.y + Math.sin(this.chassisAngle) * moveDist;

    if (!map.checkTankCollision(nx, ny, this.radius, false)) {
      this.x = nx;
      this.y = ny;
      this.treadTimer += dt;
      if (this.treadTimer >= 0.15) {
        this.treadTimer = 0;
        vfx.addTreadMark(this.x, this.y, this.chassisAngle, 40);
      }
    } else {
      this.chassisAngle += Math.PI / 2;
    }

    // -------------------------------------------------------------
    // ATTACK LOGIC BY ELITE TYPE
    // -------------------------------------------------------------
    this.attackTimer += dt;
    this.specialAttackTimer += dt;

    if (this.eliteType === 'ignis') {
      // 1. Ignis: 3-way spread incendiary shotgun every 1.8s
      if (this.attackTimer >= 1.8) {
        this.attackTimer = 0;
        for (const spread of [-0.35, 0, 0.35]) {
          const shootAngle = this.turretAngle + spread;
          spawnedBullets.push(new Projectile({
            x: this.x + Math.cos(shootAngle) * 32,
            y: this.y + Math.sin(shootAngle) * 32,
            vx: Math.cos(shootAngle) * 240,
            vy: Math.sin(shootAngle) * 240,
            angle: shootAngle,
            damage: 12,
            speed: 240,
            owner: 'enemy',
            isIncendiary: true
          }));
        }
        sounds.playShoot('heavy');
        vfx.spawnMuzzleFlash(this.x, this.y, this.turretAngle, '#ef4444');
      }

      // Special: Drop proximity cluster landmines every 6.0s
      if (this.specialAttackTimer >= 6.0) {
        this.specialAttackTimer = 0;
        vfx.addFirePool(this.x, this.y, 50, 3.0);
        vfx.spawnFloatingText(this.x, this.y - 30, '⚠️ 部署高爆地雷', '#ef4444');
        sounds.playShoot('napalm');
      }
    } else if (this.eliteType === 'storm') {
      // 2. Storm Titan: Regular heavy electric shot every 1.6s
      if (this.attackTimer >= 1.6) {
        this.attackTimer = 0;
        spawnedBullets.push(new Projectile({
          x: this.x + Math.cos(this.turretAngle) * 32,
          y: this.y + Math.sin(this.turretAngle) * 32,
          vx: Math.cos(this.turretAngle) * 290,
          vy: Math.sin(this.turretAngle) * 290,
          angle: this.turretAngle,
          damage: 15,
          speed: 290,
          owner: 'enemy',
          isTesla: true
        }));
        sounds.playShoot('tesla');
        vfx.spawnMuzzleFlash(this.x, this.y, this.turretAngle, '#38bdf8');
      }

      // Special: 8-Way Radial Danmaku Electric Ring every 5.0s!
      if (this.specialAttackTimer >= 5.0) {
        this.specialAttackTimer = 0;
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI / 4) + this.danmakuAngle;
          spawnedBullets.push(new Projectile({
            x: this.x + Math.cos(a) * 32,
            y: this.y + Math.sin(a) * 32,
            vx: Math.cos(a) * 180,
            vy: Math.sin(a) * 180,
            angle: a,
            damage: 10,
            speed: 180,
            owner: 'enemy',
            isTesla: true
          }));
        }
        this.danmakuAngle += 0.2;
        vfx.spawnExplosion(this.x, this.y, false);
        vfx.spawnFloatingText(this.x, this.y - 30, '⚡ 环形等离子风暴', '#38bdf8');
        sounds.playTeslaArc();
      }
    } else if (this.eliteType === 'void') {
      // 3. Void Dreadnought: Continuous Swirling Danmaku Spiral
      if (this.attackTimer >= 0.55) {
        this.attackTimer = 0;
        this.danmakuAngle += 0.45;
        for (let i = 0; i < 3; i++) {
          const a = this.danmakuAngle + (i * Math.PI * 2 / 3);
          spawnedBullets.push(new Projectile({
            x: this.x + Math.cos(a) * 32,
            y: this.y + Math.sin(a) * 32,
            vx: Math.cos(a) * 170,
            vy: Math.sin(a) * 170,
            angle: a,
            damage: 9,
            speed: 170,
            owner: 'enemy'
          }));
        }
        sounds.playShoot('standard');
      }

      // Special: Launch Gravitational Vortex Shell every 6.5s
      if (this.specialAttackTimer >= 6.5) {
        this.specialAttackTimer = 0;
        spawnedBullets.push(new Projectile({
          x: this.x + Math.cos(this.turretAngle) * 36,
          y: this.y + Math.sin(this.turretAngle) * 36,
          vx: Math.cos(this.turretAngle) * 200,
          vy: Math.sin(this.turretAngle) * 200,
          angle: this.turretAngle,
          damage: 16,
          speed: 200,
          owner: 'enemy',
          isVortex: true
        }));
        vfx.spawnFloatingText(this.x, this.y - 30, '🌀 虚空引力黑洞', '#10b981');
        sounds.playShoot('vortex');
      }
    }

    return spawnedBullets;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit Flash feedback
    if (this.hitFlashTimer > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
    }

    // Elite Gold/Red Aura Ring
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
    ctx.stroke();

    // Chassis
    ctx.save();
    ctx.rotate(this.chassisAngle + Math.PI / 2);
    const tex = HDGraphics.getEnemyChassis('heavy');
    ctx.drawImage(tex, -36, -36, 72, 72);
    ctx.restore();

    // Turret
    ctx.save();
    ctx.rotate(this.turretAngle + Math.PI / 2);
    const turretTex = HDGraphics.getEnemyTurret('heavy');
    ctx.drawImage(turretTex, -36, -36, 72, 72);
    ctx.restore();

    // Shield Dome
    if (this.shield > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Overhead Boss Badge & Name
    ctx.save();
    ctx.font = 'bold 11px "Chakra Petch", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.color;
    ctx.fillText(`☠ ${this.titleZh} · ${this.nameZh}`, this.x, this.y - 44);
    this.renderHealthBar(ctx, 64, 34);
    ctx.restore();
  }
}
