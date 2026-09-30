/**
 * High-Definition TileMap and Authentic Multi-Quadrant Destruction System
 */

import { HDGraphics } from '../graphics/HDGraphics';
import { ParticleFX } from '../graphics/ParticleFX';
import { sounds } from '../audio/SoundEffects';

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  FOREST = 3,
  WATER = 4,
  ICE = 5,
  BASE = 9,
}

export interface BrickSubTile {
  tl: boolean; // Top-Left
  tr: boolean; // Top-Right
  bl: boolean; // Bottom-Left
  br: boolean; // Bottom-Right
}

export class TileMap {
  public readonly cols: number = 13;
  public readonly rows: number = 13;
  public readonly tileSize: number = 52; // 52px per tile => 676x676 arena

  public grid: TileType[][];
  public brickHealth: BrickSubTile[][];
  public steelReinforcedUntil: number = 0; // Shovel powerup timer

  constructor() {
    this.grid = [];
    this.brickHealth = [];
    this.initEmptyGrid();
  }

  private initEmptyGrid() {
    this.grid = [];
    this.brickHealth = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      this.brickHealth[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = TileType.EMPTY;
        this.brickHealth[r][c] = { tl: true, tr: true, bl: true, br: true };
      }
    }
  }

  // Load level layout from text or procedural generator
  public loadLevel(levelIndex: number = 1) {
    this.initEmptyGrid();

    // Base location (bottom center: row 12, col 6)
    this.grid[12][6] = TileType.BASE;

    // Surround base with brick protection (classic Eagle fortress)
    this.setBrick(11, 5);
    this.setBrick(11, 6);
    this.setBrick(11, 7);
    this.setBrick(12, 5);
    this.setBrick(12, 7);

    // Varied procedural battlefield layouts based on levelIndex
    const seed = (levelIndex * 9301 + 49297) % 233280;
    const rng = (offset: number) => {
      const s = (seed + offset * 1337) % 233280;
      return (s * 9301 + 49297) % 233280 / 233280;
    };

    // Strategic pillars and corridors
    for (let r = 1; r < 11; r++) {
      for (let c = 1; c < 12; c++) {
        // Leave spawn areas clear:
        // Top corners and top center are enemy spawns (0,0), (0,6), (0,12)
        // Bottom left is player spawn (12, 4)
        if (r <= 2 && (c <= 1 || c === 6 || c >= 11)) continue;
        if (r >= 11 && c >= 4 && c <= 8) continue;

        const val = rng(r * 13 + c);

        if (r % 2 === 1 && c % 2 === 1) {
          // Standard pillars
          if (val < 0.6) {
            this.setBrick(r, c);
          } else if (val < 0.75) {
            this.grid[r][c] = TileType.STEEL;
          } else if (val < 0.88) {
            this.grid[r][c] = TileType.FOREST;
          }
        } else if (r === 6) {
          // River / Water barrier across middle on some levels
          if (levelIndex % 3 === 2 && c >= 2 && c <= 10 && c !== 4 && c !== 8) {
            this.grid[r][c] = TileType.WATER;
          } else if (val < 0.35) {
            this.setBrick(r, c);
          }
        } else if (val < 0.28) {
          this.setBrick(r, c);
        } else if (val > 0.88 && levelIndex % 2 === 1) {
          // Ice patches
          this.grid[r][c] = TileType.ICE;
        }
      }
    }
  }

  private setBrick(r: number, c: number) {
    this.grid[r][c] = TileType.BRICK;
    this.brickHealth[r][c] = { tl: true, tr: true, bl: true, br: true };
  }

  // Turn base perimeter into steel (Power-up Shovel)
  public fortifyBaseWithSteel(durationSeconds: number = 15) {
    this.steelReinforcedUntil = Date.now() + durationSeconds * 1000;
    const basePerimeter = [
      [11, 5], [11, 6], [11, 7],
      [12, 5], [12, 7]
    ];
    for (const [r, c] of basePerimeter) {
      this.grid[r][c] = TileType.STEEL;
    }
  }

  // Check if fortification expired and revert to brick
  public update(_dt: number) {
    if (this.steelReinforcedUntil > 0 && Date.now() > this.steelReinforcedUntil) {
      this.steelReinforcedUntil = 0;
      const basePerimeter = [
        [11, 5], [11, 6], [11, 7],
        [12, 5], [12, 7]
      ];
      for (const [r, c] of basePerimeter) {
        if (this.grid[r][c] === TileType.STEEL) {
          this.setBrick(r, c);
        }
      }
    }
  }

  // Sub-quadrant collision and damage when a bullet strikes
  public hitTile(
    bulletX: number,
    bulletY: number,
    bulletAngle: number,
    canBreakSteel: boolean,
    vfx: ParticleFX
  ): { hit: boolean; destroyed: boolean; ricochet: boolean } {
    const col = Math.floor(bulletX / this.tileSize);
    const row = Math.floor(bulletY / this.tileSize);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return { hit: true, destroyed: false, ricochet: true };
    }

    const tile = this.grid[row][col];
    if (tile === TileType.EMPTY || tile === TileType.FOREST || tile === TileType.ICE) {
      return { hit: false, destroyed: false, ricochet: false };
    }

    if (tile === TileType.WATER) {
      // Bullets fly freely over water
      return { hit: false, destroyed: false, ricochet: false };
    }

    // Steel Wall Collision
    if (tile === TileType.STEEL) {
      if (canBreakSteel) {
        this.grid[row][col] = TileType.EMPTY;
        vfx.spawnExplosion(col * this.tileSize + this.tileSize / 2, row * this.tileSize + this.tileSize / 2, false);
        sounds.playExplosion(false);
        return { hit: true, destroyed: true, ricochet: false };
      } else {
        const normalAngle = bulletAngle + Math.PI;
        vfx.spawnRicochetSparks(bulletX, bulletY, normalAngle);
        sounds.playRicochet();
        return { hit: true, destroyed: false, ricochet: true };
      }
    }

    // Brick Wall Collision (Multi-Quadrant authentic FC style)
    if (tile === TileType.BRICK) {
      const tileLocalX = (bulletX - col * this.tileSize) / this.tileSize;
      const tileLocalY = (bulletY - row * this.tileSize) / this.tileSize;
      const hp = this.brickHealth[row][col];

      // Determine bullet travel direction
      const cos = Math.cos(bulletAngle);
      const sin = Math.sin(bulletAngle);

      let subHit = false;
      if (Math.abs(sin) > Math.abs(cos)) {
        // Vertical hit
        if (sin < 0) {
          // Traveling UP, hit bottom quadrants first
          if (hp.bl || hp.br) {
            hp.bl = false;
            hp.br = false;
            subHit = true;
          } else if (hp.tl || hp.tr) {
            hp.tl = false;
            hp.tr = false;
            subHit = true;
          }
        } else {
          // Traveling DOWN, hit top quadrants first
          if (hp.tl || hp.tr) {
            hp.tl = false;
            hp.tr = false;
            subHit = true;
          } else if (hp.bl || hp.br) {
            hp.bl = false;
            hp.br = false;
            subHit = true;
          }
        }
      } else {
        // Horizontal hit
        if (cos < 0) {
          // Traveling LEFT, hit right quadrants first
          if (hp.tr || hp.br) {
            hp.tr = false;
            hp.br = false;
            subHit = true;
          } else if (hp.tl || hp.bl) {
            hp.tl = false;
            hp.bl = false;
            subHit = true;
          }
        } else {
          // Traveling RIGHT, hit left quadrants first
          if (hp.tl || hp.bl) {
            hp.tl = false;
            hp.bl = false;
            subHit = true;
          } else if (hp.tr || hp.br) {
            hp.tr = false;
            hp.br = false;
            subHit = true;
          }
        }
      }

      if (!subHit) {
        // Fallback: hit closest quadrant
        if (tileLocalX < 0.5 && tileLocalY < 0.5) hp.tl = false;
        else if (tileLocalX >= 0.5 && tileLocalY < 0.5) hp.tr = false;
        else if (tileLocalX < 0.5 && tileLocalY >= 0.5) hp.bl = false;
        else hp.br = false;
      }

      vfx.spawnBrickDebris(bulletX, bulletY);
      sounds.playBrickDestroy();

      // Check if all 4 quadrants are gone
      if (!hp.tl && !hp.tr && !hp.bl && !hp.br) {
        this.grid[row][col] = TileType.EMPTY;
        return { hit: true, destroyed: true, ricochet: false };
      }

      return { hit: true, destroyed: false, ricochet: false };
    }

    return { hit: true, destroyed: false, ricochet: false };
  }

  // Check tank AABB bounding box collision against solid walls
  public checkTankCollision(x: number, y: number, radius: number, canCrossWater: boolean = false): boolean {
    const half = radius * 0.85;
    const minCol = Math.floor((x - half) / this.tileSize);
    const maxCol = Math.floor((x + half) / this.tileSize);
    const minRow = Math.floor((y - half) / this.tileSize);
    const maxRow = Math.floor((y + half) / this.tileSize);

    // Arena boundary collision
    if (minCol < 0 || maxCol >= this.cols || minRow < 0 || maxRow >= this.rows) {
      return true;
    }

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const tile = this.grid[r][c];
        if (tile === TileType.STEEL || tile === TileType.BASE) {
          return true;
        }
        if (tile === TileType.WATER && !canCrossWater) {
          return true;
        }
        if (tile === TileType.BRICK) {
          // Check if any quadrant is active in this tile
          const hp = this.brickHealth[r][c];
          if (hp.tl || hp.tr || hp.bl || hp.br) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Render all background & solid tiles
  public renderBaseLayer(ctx: CanvasRenderingContext2D, animFrame: number = 0) {
    const brickTex = HDGraphics.getBrickTile();
    const steelTex = HDGraphics.getSteelTile();
    const waterTex = HDGraphics.getWaterTile(animFrame);
    const iceTex = HDGraphics.getIceTile();

    const halfSize = this.tileSize / 2;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = this.grid[r][c];
        const x = c * this.tileSize;
        const y = r * this.tileSize;

        if (tile === TileType.ICE) {
          ctx.drawImage(iceTex, x, y, this.tileSize, this.tileSize);
        } else if (tile === TileType.WATER) {
          ctx.drawImage(waterTex, x, y, this.tileSize, this.tileSize);
        } else if (tile === TileType.STEEL) {
          ctx.drawImage(steelTex, x, y, this.tileSize, this.tileSize);
        } else if (tile === TileType.BRICK) {
          const hp = this.brickHealth[r][c];
          // Draw individual sub-quadrants
          if (hp.tl) ctx.drawImage(brickTex, 0, 0, 32, 32, x, y, halfSize, halfSize);
          if (hp.tr) ctx.drawImage(brickTex, 32, 0, 32, 32, x + halfSize, y, halfSize, halfSize);
          if (hp.bl) ctx.drawImage(brickTex, 0, 32, 32, 32, x, y + halfSize, halfSize, halfSize);
          if (hp.br) ctx.drawImage(brickTex, 32, 32, 32, 32, x + halfSize, y + halfSize, halfSize, halfSize);
        }
      }
    }
  }

  // Render top layer (Forest/Bushes that conceal tanks underneath)
  public renderTopLayer(ctx: CanvasRenderingContext2D) {
    const forestTex = HDGraphics.getForestTile();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === TileType.FOREST) {
          ctx.drawImage(forestTex, c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
  }
}
