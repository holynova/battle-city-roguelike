/**
 * Battle City: Rogue Bastion - Core Game Engine
 * Coordinates High-DPI rendering, physics, ECS updates, state transitions, and audio.
 */

import { TileMap } from '../map/TileMap';
import { PlayerTank } from '../entities/PlayerTank';
import { Tank } from '../entities/Tank';
import { EnemyTank, EnemyClass } from '../entities/EnemyTank';
import { BossTank } from '../entities/BossTank';
import { EagleBase } from '../entities/EagleBase';
import { Projectile } from '../entities/Projectile';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { ParticleFX } from '../graphics/ParticleFX';
import { HUD } from '../ui/HUD';
import { UIOverlay } from '../ui/UIOverlay';
import { campaignMap, MapNode } from '../roguelite/CampaignMap';
import { playerInventory } from '../roguelite/Inventory';
import { sounds } from '../audio/SoundEffects';
import { bgm } from '../audio/MusicEngine';

export type GameState = 'START_MENU' | 'MAP_VIEW' | 'PLAYING' | 'CARD_DRAFT' | 'SHOP' | 'REST' | 'EVENT' | 'GAME_OVER' | 'VICTORY';

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number = 1;

  // Viewport and Arena Dimensions
  private width: number = 960;
  private height: number = 740;
  private arenaX: number = 0;
  private arenaY: number = 0;
  private readonly arenaSize: number = 676; // 13 * 52px

  // State
  public state: GameState = 'START_MENU';
  public map: TileMap;
  public player: PlayerTank;
  public eagleBase: EagleBase;
  public enemies: (EnemyTank | BossTank)[] = [];
  public projectiles: Projectile[] = [];
  public powerUps: PowerUp[] = [];
  public vfx: ParticleFX;
  public ui: UIOverlay;

  // Wave Director
  private isBossFight: boolean = false;
  private totalEnemiesToSpawn: number = 14;
  private enemiesSpawnedCount: number = 0;
  private spawnCooldown: number = 1.0;
  private spawnPoints = [
    { x: 36, y: 36 },
    { x: 338, y: 36 },
    { x: 640, y: 36 }
  ];

  // Screen Shake & Hit Stop
  private screenShakeTime: number = 0;
  private screenShakeMagnitude: number = 0;
  private hitStopTimer: number = 0;

  // Base Defense Cooldown
  private basePointDefenseTimer: number = 0;

  // Animation frame
  private lastTime: number = 0;
  private animFrameIndex: number = 0;
  private waterAnimTimer: number = 0;

  // Mouse / Pointer State
  private mouseCanvasX: number = 0;
  private mouseCanvasY: number = 0;
  private isMouseDown: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.map = new TileMap();
    this.player = new PlayerTank(4 * 52 + 26, 12 * 52 + 26);
    this.eagleBase = new EagleBase(6, 12, 52);
    this.vfx = new ParticleFX();
    this.ui = new UIOverlay();

    this.setupHighDPI();
    this.setupInputs();
    this.showStartMenu();

    // Start loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private setupHighDPI() {
    this.dpr = window.devicePixelRatio || 1;
    const resize = () => {
      this.width = Math.min(window.innerWidth, 1024);
      this.height = Math.min(window.innerHeight, 780);
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      // Center the 676x676 arena in the window
      this.arenaX = Math.floor((this.width - this.arenaSize) / 2);
      this.arenaY = Math.floor((this.height - this.arenaSize) / 2) + 10;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  private setupInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (this.state === 'START_MENU') {
        this.startRun();
        return;
      }
      if (this.state !== 'PLAYING') return;

      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.player.moveY = -1;
      if (k === 's' || k === 'arrowdown') this.player.moveY = 1;
      if (k === 'a' || k === 'arrowleft') this.player.moveX = -1;
      if (k === 'd' || k === 'arrowright') this.player.moveX = 1;

      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerPlayerFire();
      }
      if (e.shiftKey || k === 'f' || k === 'q') {
        this.player.tryDash(this.vfx);
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if ((k === 'w' || k === 'arrowup') && this.player.moveY < 0) this.player.moveY = 0;
      if ((k === 's' || k === 'arrowdown') && this.player.moveY > 0) this.player.moveY = 0;
      if ((k === 'a' || k === 'arrowleft') && this.player.moveX < 0) this.player.moveX = 0;
      if ((k === 'd' || k === 'arrowright') && this.player.moveX > 0) this.player.moveX = 0;
    });

    // Mouse Tracking
    const updateMousePos = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseCanvasX = e.clientX - rect.left;
      this.mouseCanvasY = e.clientY - rect.top;

      // Convert to arena coordinates
      this.player.aimX = this.mouseCanvasX - this.arenaX;
      this.player.aimY = this.mouseCanvasY - this.arenaY;
    };

    this.canvas.addEventListener('mousemove', updateMousePos);

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state !== 'PLAYING') return;
      if (e.button === 0) {
        this.isMouseDown = true;
        this.triggerPlayerFire();
      } else if (e.button === 2) {
        // Right click: Dash
        e.preventDefault();
        this.player.tryDash(this.vfx);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private triggerPlayerFire() {
    const newBullets = this.player.fire(this.vfx);
    if (newBullets.length > 0) {
      this.projectiles.push(...newBullets);
    }
  }

  // -------------------------------------------------------------
  // FLOW AND STATE TRANSITIONS
  // -------------------------------------------------------------
  public showStartMenu() {
    this.state = 'START_MENU';
    this.ui.showStartMenu(() => {
      this.startRun();
    });
  }

  public startRun() {
    this.ui.clear();
    playerInventory.reset();
    campaignMap.generateAct(1);
    this.showCampaignMap();
  }

  public showCampaignMap() {
    this.state = 'MAP_VIEW';
    this.ui.showCampaignMap((node) => {
      this.enterNode(node);
    });
  }

  public enterNode(node: MapNode) {
    if (node.type === 'shop') {
      this.state = 'SHOP';
      this.ui.showShop(
        () => this.showCampaignMap(),
        () => {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
          this.vfx.spawnFloatingText(this.player.x, this.player.y - 25, '+50 HP', '#22c55e');
        },
        () => {
          this.map.fortifyBaseWithSteel(25);
        }
      );
    } else if (node.type === 'rest') {
      this.state = 'REST';
      this.ui.showRest(
        () => this.showCampaignMap(),
        () => {
          this.player.hp = this.player.maxHp;
          this.player.shield = this.player.maxShield;
          this.eagleBase.repair(50);
        },
        () => {
          playerInventory.starsCollected = Math.min(3, playerInventory.starsCollected + 1);
        }
      );
    } else if (node.type === 'event') {
      this.state = 'EVENT';
      this.ui.showEvent(
        () => this.showCampaignMap(),
        (scraps) => playerInventory.addScrap(scraps),
        (dmg) => {
          this.player.takeDamage(dmg, this.vfx);
          if (this.player.hp <= 0) {
            this.handleGameOver('在拆解实验车反应堆时遭遇剧烈殉爆！');
          }
        }
      );
    } else {
      // 'battle' | 'elite' | 'boss'
      this.startCombatLevel(node);
    }
  }

  public startCombatLevel(node: MapNode) {
    this.state = 'PLAYING';
    this.isBossFight = node.type === 'boss';

    // Reset battlefield
    this.map.loadLevel(node.floor + 1);
    this.player.x = 4 * 52 + 26;
    this.player.y = 12 * 52 + 26;
    this.player.isAlive = true;
    this.player.invulnerableTimer = 2.0;

    // Reset eagle base
    this.eagleBase.hasPointDefense = playerInventory.hasChip('eagle_point_defense');
    this.eagleBase.hasNanoShield = playerInventory.hasChip('eagle_nano_shield');

    this.enemies = [];
    this.projectiles = [];
    this.powerUps = [];

    if (this.isBossFight) {
      // Spawn Goliath Boss at top center
      this.enemies.push(new BossTank(338, 120));
      this.totalEnemiesToSpawn = 1;
      this.enemiesSpawnedCount = 1;
      sounds.playBaseAlarm();
      bgm.playTrack('boss');
    } else {
      this.totalEnemiesToSpawn = node.type === 'elite' ? 16 : 12;
      this.enemiesSpawnedCount = 0;
      this.spawnCooldown = 0.5;
      bgm.playTrack('battle');
    }
  }

  private handleBattleVictory() {
    this.state = 'CARD_DRAFT';
    sounds.playVictory();
    bgm.playTrack('briefing');
    playerInventory.stage++;

    // Boss win check
    if (this.isBossFight) {
      this.state = 'VICTORY';
      this.ui.showResult(true, '你成功粉碎了要塞终极陆上战舰「歌利亚」，捍卫了老鹰基地！', () => {
        this.showStartMenu();
      });
      return;
    }

    // Three-Pick-One Card Draft
    this.ui.showCardDraft((chip) => {
      // Apply immediate effects if any
      if (chip.id === 'reinforced_armor') {
        this.player.maxHp += 40;
        this.player.hp += 40;
      }
      this.showCampaignMap();
    });
  }

  private handleGameOver(reason: string) {
    this.state = 'GAME_OVER';
    bgm.stop();
    this.ui.showResult(false, reason, () => {
      this.showStartMenu();
    });
  }

  // -------------------------------------------------------------
  // UPDATE TICK
  // -------------------------------------------------------------
  private update(dt: number) {
    if (this.state !== 'PLAYING') return;

    // Screen Shake decay
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    // Hit stop (freeze frames)
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      return;
    }

    // Water ripple animation timer
    this.waterAnimTimer += dt;
    if (this.waterAnimTimer > 0.2) {
      this.waterAnimTimer = 0;
      this.animFrameIndex++;
    }

    // Auto-fire while mouse held down
    if (this.isMouseDown) {
      this.triggerPlayerFire();
    }

    // Update Map
    this.map.update(dt);

    // Update Player
    const playerBullets = this.player.update(dt, this.map, this.vfx);
    this.projectiles.push(...playerBullets);

    if (!this.player.isAlive) {
      this.handleGameOver('你的战车被敌方炮火击毁！装甲彻底报废。');
      return;
    }

    // Update Eagle Base
    this.eagleBase.update(dt, this.vfx);
    if (this.eagleBase.isDestroyed) {
      this.handleGameOver('老鹰基地指挥要塞被摧毁！战役彻底失败。');
      return;
    }

    // Eagle Point Defense Turret Perk
    if (this.eagleBase.hasPointDefense && this.enemies.length > 0) {
      this.basePointDefenseTimer += dt;
      if (this.basePointDefenseTimer >= 1.2) {
        this.basePointDefenseTimer = 0;
        // Find closest enemy
        let closest: Tank | null = null;
        let minDist = 400;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - this.eagleBase.x, e.y - this.eagleBase.y);
          if (d < minDist) {
            minDist = d;
            closest = e;
          }
        }
        if (closest) {
          const angle = Math.atan2(closest.y - this.eagleBase.y, closest.x - this.eagleBase.x);
          this.projectiles.push(new Projectile({
            x: this.eagleBase.x,
            y: this.eagleBase.y,
            vx: Math.cos(angle) * 450,
            vy: Math.sin(angle) * 450,
            angle,
            damage: 25,
            speed: 450,
            owner: 'base'
          }));
          sounds.playShoot('standard');
          this.vfx.spawnMuzzleFlash(this.eagleBase.x, this.eagleBase.y, angle, '#38bdf8');
        }
      }
    }

    // Enemy Spawning
    if (!this.isBossFight && this.enemiesSpawnedCount < this.totalEnemiesToSpawn) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0 && this.enemies.length < 5) {
        this.spawnCooldown = 2.0 + Math.random() * 1.5;
        this.spawnOneEnemy();
      }
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const bullets = e.update(dt, this.map, { x: this.player.x, y: this.player.y }, { x: this.eagleBase.x, y: this.eagleBase.y }, this.vfx);
      this.projectiles.push(...bullets);

      if (!e.isAlive) {
        playerInventory.kills++;
        playerInventory.addScrap(15);
        this.vfx.spawnFloatingText(e.x, e.y - 30, '+15 零件', '#facc15');

        // Vampiric perk
        if (playerInventory.hasChip('vampiric_scavenger')) {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 12);
          this.vfx.spawnFloatingText(this.player.x, this.player.y - 20, '+12 HP (吸取)', '#22c55e');
        }

        // Drop Powerup if bonus tank or small random chance
        if ((e instanceof EnemyTank && e.isBonusTank) || Math.random() < 0.15) {
          const types: PowerUpType[] = ['star', 'clock', 'bomb', 'shovel', 'helmet', 'repair', 'scrap'];
          const picked = types[Math.floor(Math.random() * types.length)];
          this.powerUps.push(new PowerUp(e.x, e.y, picked));
        }

        this.enemies.splice(i, 1);

        // Check if all enemies in wave destroyed
        if (this.enemies.length === 0 && this.enemiesSpawnedCount >= this.totalEnemiesToSpawn) {
          this.handleBattleVictory();
          return;
        }
      }
    }

    // Update PowerUps and Pickups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update(dt);

      // Scrap magnet perk: suck powerups toward player
      if (playerInventory.hasChip('scrap_collector')) {
        const dx = this.player.x - p.x;
        const dy = this.player.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 220) {
          p.x += (dx / dist) * 180 * dt;
          p.y += (dy / dist) * 180 * dt;
        }
      }

      // Check pickup by player
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < this.player.radius + p.radius) {
        this.applyPowerUp(p.type);
        this.vfx.spawnFloatingText(this.player.x, this.player.y - 25, `GET ${p.type.toUpperCase()}!`, '#fde047');
        sounds.playPowerup();
        this.powerUps.splice(i, 1);
        continue;
      }

      if (!p.isAlive) {
        this.powerUps.splice(i, 1);
      }
    }

    // Update Projectiles and Collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const b = this.projectiles[i];
      b.update(dt);

      if (!b.isAlive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // 1. Tile Map Collision (Bricks, Steel)
      const hitResult = this.map.hitTile(b.x, b.y, b.angle, b.canBreakSteel, this.vfx);
      if (hitResult.hit) {
        if (hitResult.ricochet && b.bouncesLeft > 0) {
          b.bounce(b.angle + Math.PI);
        } else {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // 2. Eagle Base Collision
      if (b.owner === 'enemy') {
        const distToBase = Math.hypot(b.x - this.eagleBase.x, b.y - this.eagleBase.y);
        if (distToBase < this.eagleBase.size / 2 + b.radius) {
          this.eagleBase.takeDamage(b.damage, this.vfx);
          this.screenShake(0.2, 4);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // 3. Player Collision
      if (b.owner === 'enemy') {
        const distToPlayer = Math.hypot(b.x - this.player.x, b.y - this.player.y);
        if (distToPlayer < this.player.radius + b.radius) {
          this.player.takeDamage(b.damage, this.vfx);
          this.screenShake(0.18, 5);
          sounds.playExplosion(false);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // 4. Enemy Collision
      if (b.owner === 'player' || b.owner === 'base') {
        let hitEnemy = false;
        for (const e of this.enemies) {
          const distToEnemy = Math.hypot(b.x - e.x, b.y - e.y);
          if (distToEnemy < e.radius + b.radius) {
            e.takeDamage(b.damage, this.vfx);

            // Apply elemental statuses
            if (b.isCryo) e.applyFreeze(2.5);
            if (b.isIncendiary) e.applyBurn(4.0);
            if (b.isTesla) {
              e.applyStun(1.0);
              // Jump arc to nearest second enemy
              this.chainLightning(e);
            }

            sounds.playExplosion(false);

            if (!b.isLaser) {
              hitEnemy = true;
            }
            break;
          }
        }
        if (hitEnemy) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }

    // Update VFX & Particles
    this.vfx.update(dt);
  }

  // Spawn an individual enemy tank based on current node difficulty
  private spawnOneEnemy() {
    this.enemiesSpawnedCount++;
    const sp = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

    let cls: EnemyClass = 'scout';
    const rand = Math.random();
    if (rand < 0.35) cls = 'scout';
    else if (rand < 0.65) cls = 'assault';
    else if (rand < 0.85) cls = 'heavy';
    else cls = 'missile';

    const isBonus = Math.random() < 0.35; // 35% chance to be classic flashing bonus tank
    const tank = new EnemyTank(sp.x, sp.y, cls, isBonus);
    this.enemies.push(tank);
    this.vfx.spawnExplosion(sp.x, sp.y, false);
  }

  // Chain lightning to nearby enemies
  private chainLightning(source: Tank) {
    for (const e of this.enemies) {
      if (e !== source && e.isAlive) {
        const d = Math.hypot(e.x - source.x, e.y - source.y);
        if (d < 160) {
          e.takeDamage(20, this.vfx);
          e.applyStun(0.8);
          this.vfx.spawnFloatingText(e.x, e.y - 20, 'TESLA CHAIN!', '#38bdf8');
          break;
        }
      }
    }
  }

  // Trigger screen shake
  public screenShake(duration: number, magnitude: number) {
    this.screenShakeTime = duration;
    this.screenShakeMagnitude = magnitude;
  }

  // Apply classic + modern powerup
  private applyPowerUp(type: PowerUpType) {
    switch (type) {
      case 'star':
        playerInventory.starsCollected = Math.min(3, playerInventory.starsCollected + 1);
        break;
      case 'clock':
        // Freeze all enemies for 8 seconds
        for (const e of this.enemies) {
          e.applyFreeze(8.0);
        }
        break;
      case 'bomb':
        // Wipe regular enemies
        for (const e of this.enemies) {
          if (!(e instanceof BossTank)) {
            e.takeDamage(999, this.vfx);
          } else {
            e.takeDamage(80, this.vfx);
          }
        }
        sounds.playExplosion(true);
        this.screenShake(0.3, 8);
        break;
      case 'shovel':
        this.map.fortifyBaseWithSteel(15);
        break;
      case 'helmet':
        this.player.invulnerableTimer = 8.0;
        break;
      case 'repair':
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
        break;
      case 'scrap':
        playerInventory.addScrap(30);
        break;
    }
  }

  // -------------------------------------------------------------
  // RENDER PIPELINE (Retina / High-DPI Scaled)
  // -------------------------------------------------------------
  private render() {
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);

    // Deep Dark Sci-Fi Command Background
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle tactical grid lines in surrounding space
    this.ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Apply Screen Shake if active
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeTime > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
      shakeY = (Math.random() - 0.5) * this.screenShakeMagnitude * 2;
    }

    // -------------------------------------------------------------
    // RENDER 676x676 ARENA BATTLEFIELD
    // -------------------------------------------------------------
    this.ctx.save();
    this.ctx.translate(this.arenaX + shakeX, this.arenaY + shakeY);

    // Arena Floor Bed
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(0, 0, this.arenaSize, this.arenaSize);

    // High-Tech Outer Metallic Border Frame
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(-2, -2, this.arenaSize + 4, this.arenaSize + 4);

    // 1. Persistent Ground Decals (Tread marks)
    this.vfx.renderGroundDecals(this.ctx);

    // 2. Tilemap Base Layer (Bricks, Steel, Water, Ice)
    this.map.renderBaseLayer(this.ctx, this.animFrameIndex);

    // 3. Eagle Bastion
    this.eagleBase.render(this.ctx);

    // 4. Power-up Pickups
    for (const p of this.powerUps) {
      p.render(this.ctx);
    }

    // 5. Enemies
    for (const e of this.enemies) {
      e.render(this.ctx);
    }

    // 6. Player Tank
    this.player.render(this.ctx);

    // 7. Projectiles
    for (const b of this.projectiles) {
      b.render(this.ctx);
    }

    // Dynamic Lighting Bloom Pass (Illuminates battlefield and obstacles)
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    for (const b of this.projectiles) {
      const glowR = b.isLaser ? 36 : (b.isMortar ? 28 : 18);
      const grad = this.ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, glowR);
      const glowColor = b.owner === 'player' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.22)';
      grad.addColorStop(0, glowColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, glowR, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // 8. Top Tile Layer (Forests that hide tanks underneath!)
    this.map.renderTopLayer(this.ctx);

    // 9. Particle VFX & Floating Combat Texts
    this.vfx.renderVFX(this.ctx);

    this.ctx.restore();

    // -------------------------------------------------------------
    // RENDER TOP HUD & BOTTOM METERS
    // -------------------------------------------------------------
    if (this.state === 'PLAYING') {
      HUD.render(
        this.ctx,
        this.width,
        this.height,
        this.player,
        this.eagleBase,
        this.isBossFight ? 1 : Math.max(0, this.totalEnemiesToSpawn - this.enemiesSpawnedCount + this.enemies.length),
        campaignMap.currentFloor,
        this.isBossFight
      );
    }

    this.ctx.restore();
  }

  // Main Loop
  private loop(timestamp: number) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }
}
