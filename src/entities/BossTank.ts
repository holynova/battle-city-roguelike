/**
 * Epic Boss Tank: Land Cruiser "Goliath" (多炮塔陆上巡洋舰 MK-IV)
 * 3-Phase Multi-Turret Super-Boss with Danmaku Bullet Hell, Sweeping Laser, and Carpet Bombing.
 */

import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { TileMap } from '../map/TileMap';
import { ParticleFX } from '../graphics/ParticleFX';
import { HDGraphics } from '../graphics/HDGraphics';
import { sounds } from '../audio/SoundEffects';

export class BossTank extends Tank {
  public phase: 1 | 2 | 3 = 1;
  private mainGunCooldown: number = 2.0;
  private missileCooldown: number = 3.5;
  private danmakuCooldown: number = 1.8;
  private laserCooldown: number = 4.0;
  private danmakuAngle: number = 0;

  public isLaserFiring: boolean = false;
  public laserAngle: number = Math.PI / 2;
  public laserDuration: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 850, 50); // 850 HP, 50 speed
    this.shield = 200;
    this.maxShield = 200;
    this.radius = 52; // Massive Land Cruiser footprint

    this.chassisAngle = 0; // Patrols horizontally
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

    // Phase Transitions
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.30 && this.phase < 3) {
      this.phase = 3;
      this.speed = 95;
      vfx.spawnExplosion(this.x, this.y, true);
      vfx.spawnFloatingText(this.x, this.y - 45, '⚠️ CRITICAL OVERDRIVE: PHASE 3 ⚠️', '#ef4444');
      sounds.playExplosion(true);
      sounds.playBaseAlarm();
    } else if (hpRatio <= 0.65 && this.phase < 2) {
      this.phase = 2;
      this.speed = 80;
      vfx.spawnExplosion(this.x, this.y, true);
      vfx.spawnFloatingText(this.x, this.y - 45, '⚠️ GOLIATH ENRAGED: PHASE 2 ⚠️', '#f59e0b');
      sounds.playExplosion(true);
      sounds.playBaseAlarm();
    }

    // Heavy boss crushes brick walls simply by moving
    const col = Math.floor(this.x / map.tileSize);
    const row = Math.floor(this.y / map.tileSize);
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < map.rows && c >= 0 && c < map.cols) {
          if (map.grid[r][c] === 1) {
            map.grid[r][c] = 0;
            vfx.spawnBrickDebris(c * map.tileSize + 26, r * map.tileSize + 26);
            sounds.playBrickDestroy();
          }
        }
      }
    }

    // Movement: Patrol horizontally across upper arena
    const moveDist = this.speed * dt;
    this.x += Math.cos(this.chassisAngle) * moveDist;
    if (this.x < 130) {
      this.x = 130;
      this.chassisAngle = 0; // Move right
    } else if (this.x > map.cols * map.tileSize - 130) {
      this.x = map.cols * map.tileSize - 130;
      this.chassisAngle = Math.PI; // Move left
    }

    // -------------------------------------------------------------
    // PHASE 1 ATTACKS: Heavy Artillery & Missiles
    // -------------------------------------------------------------
    this.mainGunCooldown -= dt;
    if (this.mainGunCooldown <= 0) {
      this.mainGunCooldown = this.phase === 3 ? 1.6 : (this.phase === 2 ? 2.0 : 2.6);

      const target = Math.random() < 0.5 ? playerPos : basePos;
      const angle = Math.atan2(target.y - this.y, target.x - this.x);

      // Heavy 203mm AP Shell
      spawnedBullets.push(new Projectile({
        x: this.x,
        y: this.y + 24,
        vx: Math.cos(angle) * 260,
        vy: Math.sin(angle) * 260,
        angle,
        damage: 22,
        speed: 260,
        owner: 'enemy',
        canBreakSteel: true,
        isMortar: true
      }));

      sounds.playShoot('heavy');
      vfx.spawnMuzzleFlash(this.x, this.y + 36, angle, '#ef4444');
    }

    // Guided Missiles Volley
    this.missileCooldown -= dt;
    if (this.missileCooldown <= 0) {
      this.missileCooldown = this.phase === 3 ? 3.2 : 4.5;
      for (const side of [-35, 35]) {
        spawnedBullets.push(new Projectile({
          x: this.x + side,
          y: this.y - 10,
          vx: (side > 0 ? 1 : -1) * 70,
          vy: 120,
          angle: Math.PI / 2,
          damage: 14,
          speed: 200,
          owner: 'enemy',
          isMissile: true,
          target: playerPos
        }));
      }
      sounds.playShoot('missile');
    }

    // -------------------------------------------------------------
    // PHASE 2 ATTACKS: Swirling Danmaku Spiral Bullet Hell
    // -------------------------------------------------------------
    if (this.phase >= 2) {
      this.danmakuCooldown -= dt;
      if (this.danmakuCooldown <= 0) {
        this.danmakuCooldown = this.phase === 3 ? 0.65 : 0.95;
        this.danmakuAngle += 0.32;

        const bulletCount = this.phase === 3 ? 8 : 6;
        for (let i = 0; i < bulletCount; i++) {
          const a = this.danmakuAngle + (i * Math.PI * 2 / bulletCount);
          spawnedBullets.push(new Projectile({
            x: this.x + Math.cos(a) * 44,
            y: this.y + Math.sin(a) * 44,
            vx: Math.cos(a) * 170,
            vy: Math.sin(a) * 170,
            angle: a,
            damage: 10,
            speed: 170,
            owner: 'enemy'
          }));
        }
        sounds.playShoot('standard');
      }
    }

    // -------------------------------------------------------------
    // PHASE 3 ATTACKS: Sweeping Prismatic Laser Cannon
    // -------------------------------------------------------------
    if (this.phase === 3) {
      this.laserCooldown -= dt;
      if (this.laserCooldown <= 0) {
        this.laserCooldown = 4.5;
        // Fire sweeping laser barrage in front
        const targetAng = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);
        for (let offset = -0.4; offset <= 0.4; offset += 0.2) {
          const sweep = targetAng + offset;
          spawnedBullets.push(new Projectile({
            x: this.x,
            y: this.y + 30,
            vx: Math.cos(sweep) * 750,
            vy: Math.sin(sweep) * 750,
            angle: sweep,
            damage: 32,
            speed: 750,
            owner: 'enemy',
            isLaser: true
          }));
        }
        sounds.playShoot('laser');
        vfx.spawnFloatingText(this.x, this.y - 40, '⚡ 全域激光扫射', '#ef4444');
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
      ctx.shadowBlur = 25;
    }

    // Heavy Boss Aura (changes with phase)
    const auraColor = this.phase === 3 ? '#ef4444' : (this.phase === 2 ? '#f59e0b' : '#38bdf8');
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
    ctx.stroke();

    // Heavy Cruiser Chassis (facing down/patrol)
    ctx.save();
    ctx.rotate(Math.PI / 2); // default texture orientation
    const chassisTex = HDGraphics.getEnemyChassis('heavy');
    ctx.drawImage(chassisTex, -52, -52, 104, 104);
    ctx.restore();

    // Multiple Turrets
    // Center Main Turret
    ctx.save();
    ctx.rotate(this.turretAngle + Math.PI / 2);
    const mainTurretTex = HDGraphics.getEnemyTurret('heavy');
    ctx.drawImage(mainTurretTex, -40, -40, 80, 80);
    ctx.restore();

    // Left & Right Sponsons (secondary turrets)
    for (const sx of [-36, 36]) {
      ctx.save();
      ctx.translate(sx, 12);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();
      ctx.restore();
    }

    // Shield Forcefield Dome
    if (this.shield > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Overhead Boss Health Bar
    ctx.save();
    ctx.font = 'bold 13px "Chakra Petch", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = auraColor;
    ctx.fillText(`👑 陆上巡洋舰「歌利亚」 [PHASE ${this.phase}]`, this.x, this.y - 65);
    this.renderHealthBar(ctx, 96, 50);
    ctx.restore();
  }
}
