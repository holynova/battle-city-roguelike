/**
 * Player Tank Entity
 * Supports dual-axis chassis/turret control, tactical dodge dash (i-frames & afterimages),
 * progressive weapon unlocking, stacking upgrades, and perks.
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
    desc: '高膛压穿甲弹，击穿砖墙，钢壁跳弹增伤'
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
    desc: 'sub-zero 冻结弹，大范围绝对冻结敌坦并脆化'
  }
};

export interface DashGhost {
  x: number;
  y: number;
  chassisAngle: number;
  turretAngle: number;
  alpha: number;
}

export class PlayerTank extends Tank {
  // Input states
  public moveX: number = 0;
  public moveY: number = 0;
  public aimX: number = 0;
  public aimY: number = 0;

  // Active Weapon Selection (Starts with ONLY standard, unlocks via 3-pick-1 card draft)
  public currentWeapon: WeaponType = 'standard';
  public unlockedWeapons: WeaponType[] = ['standard'];
  public weaponLevels: Map<WeaponType, number> = new Map([['standard', 1]]);

  // Aiming mode: 'mouse' (twin-stick) or 'classic' (fixed to heading)
  public aimMode: 'mouse' | 'classic' = 'mouse';

  // Tactical Dodge Dash (i-frames to dodge bullets)
  public dashCooldown: number = 0;
  public maxDashCooldown: number = 1.5;
  public isDashing: boolean = false;
  public dashDuration: number = 0;
  public dashGhosts: DashGhost[] = [];
  private ghostTimer: number = 0;

  // Fire control
  public fireCooldown: number = 0;
  public maxFireCooldown: number = 0.30; // base reload time

  // Recoil animation
  public recoilOffset: number = 0;

  // Passive regen timer
  private regenTimer: number = 0;

  // Velocity for smooth inertia and ice drift
  private vx: number = 0;
  private vy: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 120, 175); // 120 HP, 175 base speed
    this.shield = 50; // 50 energy shield
    this.maxShield = 50;
    this.chassisAngle = -Math.PI / 2; // Facing UP initially
    this.turretAngle = -Math.PI / 2;
  }

  // Synchronize weapons and stacking upgrade levels from run inventory
  public syncWeapons() {
    this.unlockedWeapons = [];
    for (const [wTypeStr, lvl] of playerInventory.weapons.entries()) {
      const wType = wTypeStr as WeaponType;
      if (WEAPON_REGISTRY[wType]) {
        this.unlockedWeapons.push(wType);
        this.weaponLevels.set(wType, lvl);
      }
    }
    if (!this.unlockedWeapons.includes(this.currentWeapon)) {
      this.currentWeapon = this.unlockedWeapons[0] || 'standard';
    }
  }

  public getWeaponLevel(type: WeaponType): number {
    return this.weaponLevels.get(type) || 0;
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

    this.maxDashCooldown = hasOverdrive ? 1.6 : (hasTurbo ? 2.2 : 2.8);
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

        const currentMoveSpeed = this.isDashing ? this.speed * 3.4 : this.speed;
        targetVx = normX * currentMoveSpeed;
        targetVy = normY * currentMoveSpeed;

        // Smoothly rotate chassis toward movement direction
        const targetAngle = Math.atan2(normY, normX);
        let diff = targetAngle - this.chassisAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.chassisAngle += diff * Math.min(1.0, dt * (this.isDashing ? 28 : 14));

        // Tread mark generation
        this.treadTimer += dt;
        if (this.treadTimer >= 0.12) {
          this.treadTimer = 0;
          vfx.addTreadMark(this.x, this.y, this.chassisAngle);
        }
      } else if (this.isDashing) {
        // If dashing without directional input, surge forward in chassis direction
        targetVx = Math.cos(this.chassisAngle) * this.speed * 3.4;
        targetVy = Math.sin(this.chassisAngle) * this.speed * 3.4;
      }
    }

    // Dash status and afterimage generation
    if (this.isDashing) {
      this.dashDuration -= dt;
      this.ghostTimer += dt;
      if (this.ghostTimer >= 0.05) {
        this.ghostTimer = 0;
        this.dashGhosts.push({
          x: this.x,
          y: this.y,
          chassisAngle: this.chassisAngle,
          turretAngle: this.turretAngle,
          alpha: 0.8
        });
      }

      // Thrust exhaust particles
      vfx.spawnMuzzleFlash(this.x, this.y, this.chassisAngle + Math.PI, '#38bdf8');
      if (hasOverdrive) {
        vfx.spawnMuzzleFlash(this.x, this.y, this.chassisAngle + Math.PI, '#ef4444');
      }

      if (this.dashDuration <= 0) {
        this.isDashing = false;
      }
    }

    // Fade dash afterimage ghosts
    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      const g = this.dashGhosts[i];
      g.alpha -= dt * 3.5;
      if (g.alpha <= 0) {
        this.dashGhosts.splice(i, 1);
      }
    }

    // Acceleration & friction (slippery on ice)
    const frictionFactor = onIce ? 0.98 : (this.isDashing ? 0.94 : 0.82);
    const accelFactor = onIce ? 0.1 : (this.isDashing ? 0.6 : 0.35);
    this.vx = this.vx * Math.pow(frictionFactor, dt * 60) + targetVx * accelFactor;
    this.vy = this.vy * Math.pow(frictionFactor, dt * 60) + targetVy * accelFactor;

    // Move and collide X
    const newX = this.x + this.vx * dt;
    if (!map.checkTankCollision(newX, this.y, this.radius, hasHover)) {
      this.x = newX;
    } else {
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
      this.turretAngle = this.chassisAngle;
    }

    return spawnedBullets;
  }

  // Trigger Tactical Dodge Dash (i-frames to dodge bullets)
  public tryDash(vfx: ParticleFX): boolean {
    if (this.dashCooldown > 0 || this.stunTimer > 0) return false;

    this.dashCooldown = this.maxDashCooldown;
    this.isDashing = true;
    this.dashDuration = 0.38;
    // 100% Invulnerability during dash to dodge bullets safely!
    this.invulnerableTimer = 0.48;

    const hasOverdrive = playerInventory.hasChip('overdrive_thruster');
    if (hasOverdrive) {
      this.invulnerableTimer = 1.0;
    }

    vfx.spawnExplosion(this.x, this.y, false);
    vfx.spawnFloatingText(this.x, this.y - 25, '⚡ 战术闪避 (DODGE)', '#38bdf8');
    sounds.playDash();
    return true;
  }

  // Switch active weapon (only to unlocked weapons)
  public setWeapon(type: WeaponType) {
    if (this.unlockedWeapons.includes(type)) {
      this.currentWeapon = type;
      sounds.playModuleEquip();
    }
  }

  // Cycle active weapon (e.g. via mouse wheel)
  public cycleWeapon(dir: number = 1) {
    if (this.unlockedWeapons.length <= 1) return;
    const idx = this.unlockedWeapons.indexOf(this.currentWeapon);
    const nextIdx = (idx + dir + this.unlockedWeapons.length) % this.unlockedWeapons.length;
    this.setWeapon(this.unlockedWeapons[nextIdx]);
  }

  // Fire active weapon
  public fire(vfx: ParticleFX): Projectile[] {
    if (this.fireCooldown > 0 || this.stunTimer > 0 || !this.isAlive) return [];

    this.recoilOffset = 6;

    const level = this.getWeaponLevel(this.currentWeapon) || 1;
    const levelDmgMod = 1 + (level - 1) * 0.35;
    const levelCooldownMod = 1 / (1 + (level - 1) * 0.16);

    const hasDual = playerInventory.hasChip('dual_barrel');
    const hasSteelBreaker = playerInventory.hasChip('steel_breaker') || playerInventory.starsCollected >= 3;
    const hasBouncing = playerInventory.hasChip('bouncing_rounds');
    const hasVelocity = playerInventory.hasChip('high_velocity');
    const hasRapid = playerInventory.hasChip('rapid_loader');

    const cooldownMod = (hasRapid ? 0.70 : 1.0) * levelCooldownMod;
    const baseDamage = (hasVelocity ? 46 : 38) * levelDmgMod;

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
          damage: baseDamage * 1.25,
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
          damage: baseDamage * 1.15,
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
          damage: baseDamage * 1.45,
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
          damage: baseDamage * 1.35,
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
        this.fireCooldown = 0.28 * cooldownMod;
        const speed = hasVelocity ? 480 : 380;
        const bounceCount = (hasBouncing ? 2 : 0) + (level >= 3 ? 1 : 0);
        if (hasDual || level >= 2) {
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
              canBreakSteel: hasSteelBreaker || level >= 4,
              bouncesLeft: bounceCount,
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
            bouncesLeft: bounceCount,
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

    // 1. Draw Tactical Dash Afterimage Ghosts
    for (const g of this.dashGhosts) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.globalAlpha = g.alpha * 0.45;

      // Cyan Ghost Chassis
      ctx.save();
      ctx.rotate(g.chassisAngle + Math.PI / 2);
      ctx.drawImage(HDGraphics.getPlayerChassis(), -32, -32, 64, 64);
      ctx.restore();

      // Ghost Turret
      ctx.save();
      ctx.rotate(g.turretAngle + Math.PI / 2);
      ctx.drawImage(HDGraphics.getPlayerTurret('single'), -32, -32, 64, 64);
      ctx.restore();

      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit Flash feedback
    if (this.hitFlashTimer > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18;
    }

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
    if (this.currentWeapon === 'laser') barrelType = 'laser';
    else if (this.currentWeapon === 'napalm' || this.currentWeapon === 'vortex' || this.currentWeapon === 'cryo' || this.currentWeapon === 'tesla') barrelType = 'heavy';
    else if (this.currentWeapon === 'standard' && (playerInventory.hasChip('dual_barrel') || this.getWeaponLevel('standard') >= 2)) barrelType = 'dual';

    const turretTex = HDGraphics.getPlayerTurret(barrelType);
    ctx.drawImage(turretTex, -half, -half, 64, 64);
    ctx.restore();

    // Draw Invulnerability / Shield Forcefield / Dash i-frame barrier
    if (this.isDashing) {
      // High-speed cyan dodge vortex ring
      ctx.strokeStyle = `rgba(56, 189, 248, 0.85)`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.invulnerableTimer > 0) {
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
