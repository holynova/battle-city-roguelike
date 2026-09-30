/**
 * Player Tank Entity
 * Supports dual-axis chassis/turret control, tactical dash, modular weapons, and perks.
 */

import { Tank } from './Tank';
import { Projectile } from './Projectile';
import { TileMap, TileType } from '../map/TileMap';
import { ParticleFX } from '../graphics/ParticleFX';
import { HDGraphics } from '../graphics/HDGraphics';
import { sounds } from '../audio/SoundEffects';
import { playerInventory } from '../roguelite/Inventory';

export type WeaponType = 'standard' | 'laser' | 'tesla' | 'vortex' | 'napalm' | 'cryo';

export interface WeaponInfo {
  type: WeaponType;
  nameZh: string;
  nameEn: string;
  icon: string;
  color: string;
  desc: string;
}

export const WEAPON_REGISTRY: Record<WeaponType, WeaponInfo> = {
  standard: {
    type: 'standard',
    nameZh: '重装穿甲双炮',
    nameEn: 'Twin AP Cannon',
    icon: '⚔️',
    color: '#facc15',
    desc: '高膛压穿甲弹，击穿砖墙，钢壁跳弹'
  },
  laser: {
    type: 'laser',
    nameZh: '高能棱镜光束',
    nameEn: 'Prism Laser',
    icon: '💫',
    color: '#00f0ff',
    desc: '强贯穿激光，击中钢壁与Boss发生棱镜折射'
  },
  tesla: {
    type: 'tesla',
    nameZh: '球状闪电电弧',
    nameEn: 'Tesla Plasma',
    icon: '⚡',
    color: '#38bdf8',
    desc: '缓慢电浆球，沿途周期释放电弧瘫痪EMP敌机'
  },
  vortex: {
    type: 'vortex',
    nameZh: '烈风引力涡流',
    nameEn: 'Gale Singularity',
    icon: '🌀',
    color: '#10b981',
    desc: '聚能风暴弹，引爆后强力聚怪吸扯并偏折敌弹'
  },
  napalm: {
    type: 'napalm',
    nameZh: '凝固汽油迫击炮',
    nameEn: 'Napalm Mortar',
    icon: '🔥',
    color: '#f97316',
    desc: '高抛曲射，着弹点残留持续烈焰火海破甲'
  },
  cryo: {
    type: 'cryo',
    nameZh: '急冻极寒霜爆',
    nameEn: 'Cryo Frost Nova',
    icon: '❄️',
    color: '#93c5fd',
    desc: ' sub-zero 冻结弹，大范围绝对冻结敌坦并脆化'
  }
};

export class PlayerTank extends Tank {
  // Input states
  public moveX: number = 0;
  public moveY: number = 0;
  public aimX: number = 0;
  public aimY: number = 0;

  // Active Weapon Selection
  public currentWeapon: WeaponType = 'standard';
  public unlockedWeapons: WeaponType[] = ['standard', 'laser', 'tesla', 'vortex', 'napalm', 'cryo'];

  // Aiming mode: 'mouse' (twin-stick) or 'classic' (fixed to heading)
  public aimMode: 'mouse' | 'classic' = 'mouse';

  // Tactical Dash
  public dashCooldown: number = 0;
  public maxDashCooldown: number = 3.5;
  public isDashing: boolean = false;
  public dashDuration: number = 0;

  // Fire control
  public fireCooldown: number = 0;
  public maxFireCooldown: number = 0.38; // base reload time

  // Recoil animation
  public recoilOffset: number = 0;

  // Passive regen timer
  private regenTimer: number = 0;

  // Velocity for smooth inertia and ice drift
  private vx: number = 0;
  private vy: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 100, 160);
    this.shield = 25;
    this.maxShield = 25;
    this.chassisAngle = -Math.PI / 2; // Facing UP initially
    this.turretAngle = -Math.PI / 2;
  }

  public update(dt: number, map: TileMap, vfx: ParticleFX): Projectile[] {
    const spawnedBullets: Projectile[] = [];

    this.updateStatus(dt, vfx);

    // Apply perks from inventory
    const hasTurbo = playerInventory.hasChip('turbo_engine');
    const hasRapid = playerInventory.hasChip('rapid_loader');
    const hasNanoRepair = playerInventory.hasChip('nanite_repair');
    const hasHover = playerInventory.hasChip('hover_chassis');
    const hasOverdrive = playerInventory.hasChip('overdrive_thruster');
    const hasRam = playerInventory.hasChip('ramming_prow');

    // Dynamic stats
    this.speed = (hasTurbo ? 210 : 160) * (hasHover ? 1.25 : 1.0);
    if (this.freezeTimer > 0) this.speed *= 0.5;

    this.maxDashCooldown = hasOverdrive ? 1.8 : (hasTurbo ? 2.8 : 3.5);
    this.maxFireCooldown = (hasRapid ? 0.25 : 0.38);

    // Passive repair
    if (hasNanoRepair && this.hp < this.maxHp) {
      this.regenTimer += dt;
      if (this.regenTimer >= 4.0) {
        this.regenTimer = 0;
        this.hp = Math.min(this.maxHp, this.hp + 3);
        vfx.spawnFloatingText(this.x, this.y - 20, '+3 HP', '#22c55e');
      }
    }

    // Cooldown tickers
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.recoilOffset > 0) this.recoilOffset = Math.max(0, this.recoilOffset - dt * 25);

    // Check current tile for terrain physics (e.g. Ice)
    const currentTileCol = Math.floor(this.x / map.tileSize);
    const currentTileRow = Math.floor(this.y / map.tileSize);
    const onIce = !hasHover && currentTileRow >= 0 && currentTileRow < map.rows &&
                  currentTileCol >= 0 && currentTileCol < map.cols &&
                  map.grid[currentTileRow][currentTileCol] === TileType.ICE;

    // Movement calculation
    let targetVx = 0;
    let targetVy = 0;

    if (this.stunTimer <= 0) {
      const inputLen = Math.hypot(this.moveX, this.moveY);
      if (inputLen > 0.05) {
        const normX = this.moveX / inputLen;
        const normY = this.moveY / inputLen;

        const currentMoveSpeed = this.isDashing ? this.speed * 2.8 : this.speed;
        targetVx = normX * currentMoveSpeed;
        targetVy = normY * currentMoveSpeed;

        // Smoothly rotate chassis toward movement direction
        const targetAngle = Math.atan2(normY, normX);
        let diff = targetAngle - this.chassisAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.chassisAngle += diff * Math.min(1.0, dt * 14);

        // Tread mark generation
        this.treadTimer += dt;
        if (this.treadTimer >= 0.12) {
          this.treadTimer = 0;
          vfx.addTreadMark(this.x, this.y, this.chassisAngle);
        }
      }
    }

    // Dash status handling
    if (this.isDashing) {
      this.dashDuration -= dt;
      if (hasOverdrive) {
        // Fire trail
        vfx.spawnMuzzleFlash(this.x, this.y, this.chassisAngle + Math.PI, '#ef4444');
      }
      if (this.dashDuration <= 0) {
        this.isDashing = false;
      }
    }

    // Acceleration & friction (slippery on ice)
    const frictionFactor = onIce ? 0.98 : 0.82;
    const accelFactor = onIce ? 0.1 : 0.35;
    this.vx = this.vx * Math.pow(frictionFactor, dt * 60) + targetVx * accelFactor;
    this.vy = this.vy * Math.pow(frictionFactor, dt * 60) + targetVy * accelFactor;

    // Move and collide X
    const newX = this.x + this.vx * dt;
    if (!map.checkTankCollision(newX, this.y, this.radius, hasHover)) {
      this.x = newX;
    } else {
      // If has Ramming Prow and hits brick, smash it!
      if (hasRam) {
        this.smashNearbyBricks(map, vfx);
      }
      this.vx = 0;
    }

    // Move and collide Y
    const newY = this.y + this.vy * dt;
    if (!map.checkTankCollision(this.x, newY, this.radius, hasHover)) {
      this.y = newY;
    } else {
      if (hasRam) {
        this.smashNearbyBricks(map, vfx);
      }
      this.vy = 0;
    }

    // Turret Aiming
    if (this.aimMode === 'mouse') {
      this.turretAngle = Math.atan2(this.aimY - this.y, this.aimX - this.x);
    } else {
      // Classic mode: turret follows chassis heading
      this.turretAngle = this.chassisAngle;
    }

    return spawnedBullets;
  }

  // Trigger Tactical Dash
  public tryDash(vfx: ParticleFX): boolean {
    if (this.dashCooldown > 0 || this.stunTimer > 0) return false;

    this.dashCooldown = this.maxDashCooldown;
    this.isDashing = true;
    this.dashDuration = 0.25;

    const hasOverdrive = playerInventory.hasChip('overdrive_thruster');
    if (hasOverdrive) {
      this.invulnerableTimer = 1.0;
    }

    vfx.spawnExplosion(this.x, this.y, false);
    sounds.playDash();
    return true;
  }

  // Switch active weapon
  public setWeapon(type: WeaponType) {
    if (this.unlockedWeapons.includes(type)) {
      this.currentWeapon = type;
      sounds.playModuleEquip();
    }
  }

  // Cycle active weapon (e.g. via mouse wheel)
  public cycleWeapon(dir: number = 1) {
    const idx = this.unlockedWeapons.indexOf(this.currentWeapon);
    const nextIdx = (idx + dir + this.unlockedWeapons.length) % this.unlockedWeapons.length;
    this.setWeapon(this.unlockedWeapons[nextIdx]);
  }

  // Fire active weapon
  public fire(vfx: ParticleFX): Projectile[] {
    if (this.fireCooldown > 0 || this.stunTimer > 0 || !this.isAlive) return [];

    this.recoilOffset = 6;

    const hasDual = playerInventory.hasChip('dual_barrel');
    const hasSteelBreaker = playerInventory.hasChip('steel_breaker') || playerInventory.starsCollected >= 3;
    const hasBouncing = playerInventory.hasChip('bouncing_rounds');
    const hasVelocity = playerInventory.hasChip('high_velocity');
    const hasRapid = playerInventory.hasChip('rapid_loader');

    const cooldownMod = hasRapid ? 0.72 : 1.0;
    const baseDamage = hasVelocity ? 38 : 32;

    const bullets: Projectile[] = [];

    // Muzzle location at tip of barrel
    const barrelLen = 30;
    const muzzleX = this.x + Math.cos(this.turretAngle) * barrelLen;
    const muzzleY = this.y + Math.sin(this.turretAngle) * barrelLen;

    // Eject spent brass shell casing
    vfx.ejectShellCasing(this.x, this.y, this.turretAngle);

    switch (this.currentWeapon) {
      case 'laser': {
        // 1. High-Energy Prismatic Laser Beam (Instant piercing line)
        this.fireCooldown = 0.42 * cooldownMod;
        bullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 850,
          vy: Math.sin(this.turretAngle) * 850,
          angle: this.turretAngle,
          damage: baseDamage * 1.7,
          speed: 850,
          owner: 'player',
          canBreakSteel: hasSteelBreaker,
          isLaser: true,
          elementType: 'laser'
        }));
        sounds.playShoot('laser');
        vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#00f0ff');
        break;
      }

      case 'tesla': {
        // 2. Tesla Ball Lightning Plasma Orb (Discharges radial arcs with EMP stun)
        this.fireCooldown = 0.50 * cooldownMod;
        bullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 220,
          vy: Math.sin(this.turretAngle) * 220,
          angle: this.turretAngle,
          damage: baseDamage * 1.2,
          speed: 220,
          owner: 'player',
          canBreakSteel: hasSteelBreaker,
          isTesla: true,
          elementType: 'tesla'
        }));
        sounds.playShoot('tesla');
        vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#38bdf8');
        break;
      }

      case 'vortex': {
        // 3. Gale Vortex Singularity (Pulls enemy tanks, deflects enemy bullets)
        this.fireCooldown = 0.65 * cooldownMod;
        bullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 420,
          vy: Math.sin(this.turretAngle) * 420,
          angle: this.turretAngle,
          damage: baseDamage * 1.1,
          speed: 420,
          owner: 'player',
          canBreakSteel: hasSteelBreaker,
          isVortex: true,
          elementType: 'vortex'
        }));
        sounds.playShoot('vortex');
        vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#10b981');
        break;
      }

      case 'napalm': {
        // 4. Napalm Mortar (Explodes into persistent burning ground fire)
        this.fireCooldown = 0.55 * cooldownMod;
        bullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 290,
          vy: Math.sin(this.turretAngle) * 290,
          angle: this.turretAngle,
          damage: baseDamage * 1.4,
          speed: 290,
          owner: 'player',
          canBreakSteel: hasSteelBreaker,
          isNapalm: true,
          isMortar: true,
          elementType: 'napalm'
        }));
        sounds.playShoot('napalm');
        vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#f97316');
        break;
      }

      case 'cryo': {
        // 5. Cryo Frost Nova (Explodes in wide sub-zero frost wave, freezes enemies solid)
        this.fireCooldown = 0.48 * cooldownMod;
        bullets.push(new Projectile({
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(this.turretAngle) * 380,
          vy: Math.sin(this.turretAngle) * 380,
          angle: this.turretAngle,
          damage: baseDamage * 1.3,
          speed: 380,
          owner: 'player',
          canBreakSteel: hasSteelBreaker,
          isCryo: true,
          elementType: 'cryo'
        }));
        sounds.playShoot('cryo');
        vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#93c5fd');
        break;
      }

      case 'standard':
      default: {
        // 6. Heavy AP Kinetic Ballistic Artillery (Twin-barrel spread if unlocked, ricochet bounce)
        this.fireCooldown = 0.35 * cooldownMod;
        const speed = hasVelocity ? 480 : 380;
        if (hasDual) {
          const perpX = Math.cos(this.turretAngle + Math.PI / 2) * 8;
          const perpY = Math.sin(this.turretAngle + Math.PI / 2) * 8;
          for (const side of [-1, 1]) {
            bullets.push(new Projectile({
              x: muzzleX + perpX * side,
              y: muzzleY + perpY * side,
              vx: Math.cos(this.turretAngle) * speed,
              vy: Math.sin(this.turretAngle) * speed,
              angle: this.turretAngle,
              damage: baseDamage * 0.95,
              speed,
              owner: 'player',
              canBreakSteel: hasSteelBreaker,
              bouncesLeft: hasBouncing ? 2 : 0,
              elementType: 'kinetic'
            }));
          }
          sounds.playShoot('dual');
        } else {
          bullets.push(new Projectile({
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(this.turretAngle) * speed,
            vy: Math.sin(this.turretAngle) * speed,
            angle: this.turretAngle,
            damage: baseDamage,
            speed,
            owner: 'player',
            canBreakSteel: hasSteelBreaker,
            bouncesLeft: hasBouncing ? 2 : 0,
            elementType: 'kinetic'
          }));
          sounds.playShoot('standard');
        }
        vfx.spawnMuzzleFlash(muzzleX, muzzleY, this.turretAngle, '#fde047');
        break;
      }
    }

    return bullets;
  }

  // Ramming prow brick smashing
  private smashNearbyBricks(map: TileMap, vfx: ParticleFX) {
    const col = Math.floor(this.x / map.tileSize);
    const row = Math.floor(this.y / map.tileSize);
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < map.rows && c >= 0 && c < map.cols) {
          if (map.grid[r][c] === TileType.BRICK) {
            map.grid[r][c] = TileType.EMPTY;
            vfx.spawnBrickDebris(c * map.tileSize + 26, r * map.tileSize + 26);
            sounds.playBrickDestroy();
          }
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw Chassis (Treads & Hull aligned with movement heading)
    ctx.save();
    ctx.rotate(this.chassisAngle + Math.PI / 2); // Texture faces UP by default
    const chassisTex = HDGraphics.getPlayerChassis();
    const half = 32;
    ctx.drawImage(chassisTex, -half, -half, 64, 64);
    ctx.restore();

    // Draw Turret (Aligned with aiming angle + recoil pushback)
    ctx.save();
    const recoilX = -Math.cos(this.turretAngle) * this.recoilOffset;
    const recoilY = -Math.sin(this.turretAngle) * this.recoilOffset;
    ctx.translate(recoilX, recoilY);
    ctx.rotate(this.turretAngle + Math.PI / 2);

    let barrelType: 'single' | 'dual' | 'heavy' | 'laser' = 'single';
    if (playerInventory.hasChip('railgun_laser')) barrelType = 'laser';
    else if (playerInventory.hasChip('mortar_siege')) barrelType = 'heavy';
    else if (playerInventory.hasChip('dual_barrel')) barrelType = 'dual';

    const turretTex = HDGraphics.getPlayerTurret(barrelType);
    ctx.drawImage(turretTex, -half, -half, 64, 64);
    ctx.restore();

    // Draw Invulnerability / Shield Forcefield
    if (this.invulnerableTimer > 0) {
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.5 + Math.sin(Date.now() * 0.015) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shield > 0) {
      ctx.strokeStyle = `rgba(56, 189, 248, 0.45)`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Overhead HP Bar
    this.renderHealthBar(ctx, 40, 28);
  }
}
