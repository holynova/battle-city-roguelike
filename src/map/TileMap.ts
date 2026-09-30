/**
 * High-Definition TileMap and Authentic Multi-Quadrant Destruction System
 * Features 8 completely unique tactical map archetypes with rich environmental variety.
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

export type MapArchetype =
  | 'RIVER_CROSSING'
  | 'LABYRINTH_RUINS'
  | 'CROSSROAD_AMBUSH'
  | 'JUNGLE_HUNT'
  | 'GLACIAL_ICEFIELD'
  | 'TRENCH_WARFARE'
  | 'CHECKERED_PILLARS'
  | 'IRON_FORTRESS'
  | 'TWIN_OUTPOSTS'
  | 'GOLIATH_COLOSSEUM';

export class TileMap {
  public readonly cols: number = 13;
  public readonly rows: number = 13;
  public readonly tileSize: number = 52; // 52px per tile => 676x676 arena

  public grid: TileType[][];
  public brickHealth: BrickSubTile[][];
  public steelReinforcedUntil: number = 0; // Shovel powerup timer
  public currentThemeName: string = '标准战场';
  public currentArchetype: MapArchetype = 'CROSSROAD_AMBUSH';

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

  // Load level layout based on floor, column, and node type
  public loadLevel(floor: number = 0, col: number = 0, nodeType: string = 'battle') {
    this.initEmptyGrid();

    // Standard Eagle Bastion at (row 12, col 6)
    this.grid[12][6] = TileType.BASE;
    this.setBrick(11, 5);
    this.setBrick(11, 6);
    this.setBrick(11, 7);
    this.setBrick(12, 5);
    this.setBrick(12, 7);

    // Select distinct archetype based on node type and coordinates
    if (nodeType === 'boss') {
      this.buildGoliathColosseum();
      this.currentArchetype = 'GOLIATH_COLOSSEUM';
      this.currentThemeName = '歌利亚决斗场 (GOLIATH COLOSSEUM)';
      return;
    }

    if (nodeType === 'elite') {
      const eliteVariant = (floor + col) % 3;
      if (eliteVariant === 0) {
        this.buildIronFortress();
        this.currentArchetype = 'IRON_FORTRESS';
        this.currentThemeName = '钢铁要塞碉堡 (IRON FORTRESS)';
      } else if (eliteVariant === 1) {
        this.buildTwinOutposts();
        this.currentArchetype = 'TWIN_OUTPOSTS';
        this.currentThemeName = '双子前哨基地 (TWIN OUTPOSTS)';
      } else {
        this.buildCheckeredPillars();
        this.currentArchetype = 'CHECKERED_PILLARS';
        this.currentThemeName = '列柱方阵要塞 (COLUMNS BASTION)';
      }
      return;
    }

    // Regular battle variations based on floor & col combination
    const variant = (floor * 3 + col) % 6;
    switch (variant) {
      case 0:
        this.buildRiverCrossing();
        this.currentArchetype = 'RIVER_CROSSING';
        this.currentThemeName = '莱茵水堑阻击战 (RIVER CROSSING)';
        break;
      case 1:
        this.buildLabyrinthRuins();
        this.currentArchetype = 'LABYRINTH_RUINS';
        this.currentThemeName = '巷战废墟迷宫 (LABYRINTH)';
        break;
      case 2:
        this.buildCrossroadAmbush();
        this.currentArchetype = 'CROSSROAD_AMBUSH';
        this.currentThemeName = '十字街区遭遇战 (CROSSROAD)';
        break;
      case 3:
        this.buildJungleHunt();
        this.currentArchetype = 'JUNGLE_HUNT';
        this.currentThemeName = '热带丛林伏击战 (JUNGLE HUNT)';
        break;
      case 4:
        this.buildGlacialIcefield();
        this.currentArchetype = 'GLACIAL_ICEFIELD';
        this.currentThemeName = '极地霜冻冰原 (GLACIAL ICEFIELD)';
        break;
      case 5:
        this.buildTrenchWarfare();
        this.currentArchetype = 'TRENCH_WARFARE';
        this.currentThemeName = '纵深战壕防线 (TRENCH WARFARE)';
        break;
    }
  }

  // -------------------------------------------------------------
  // MAP ARCHETYPE BUILDERS
  // -------------------------------------------------------------

  /**
   * 1. RIVER CROSSING: Deep horizontal river with only 2 narrow bridges
   */
  private buildRiverCrossing() {
    // River across row 6
    for (let c = 0; c < this.cols; c++) {
      if (c !== 2 && c !== 10 && c !== 6) {
        this.grid[6][c] = TileType.WATER;
        this.grid[5][c] = TileType.WATER;
      }
    }

    // Bridgehead fortified pillboxes
    this.setBrick(4, 1);
    this.setBrick(4, 3);
    this.setBrick(7, 1);
    this.setBrick(7, 3);

    this.setBrick(4, 9);
    this.setBrick(4, 11);
    this.setBrick(7, 9);
    this.setBrick(7, 11);

    // Center bridge guard towers
    this.grid[4][6] = TileType.STEEL;
    this.grid[7][6] = TileType.STEEL;

    // Outer brick clusters
    for (let r = 1; r < 4; r++) {
      this.setBrick(r, 4);
      this.setBrick(r, 8);
    }
    for (let r = 8; r < 11; r++) {
      this.setBrick(r, 2);
      this.setBrick(r, 10);
    }

    // Riverbank foliage
    this.grid[4][0] = TileType.FOREST;
    this.grid[7][0] = TileType.FOREST;
    this.grid[4][12] = TileType.FOREST;
    this.grid[7][12] = TileType.FOREST;
  }

  /**
   * 2. LABYRINTH RUINS: Dense urban maze of interlocking alleys
   */
  private buildLabyrinthRuins() {
    // Interlocking brick maze walls
    for (let r = 1; r < 11; r++) {
      for (let c = 1; c < 12; c++) {
        if (r >= 10 && c >= 4 && c <= 8) continue; // Base protection
        if (r <= 2 && (c === 0 || c === 6 || c === 12)) continue; // Spawn paths

        // Spiral maze walls
        if (r === 2 && c >= 2 && c <= 10 && c !== 6) this.setBrick(r, c);
        if (r === 8 && c >= 2 && c <= 10 && c !== 4 && c !== 8) this.setBrick(r, c);
        if (c === 2 && r >= 3 && r <= 7 && r !== 5) this.setBrick(r, c);
        if (c === 10 && r >= 3 && r <= 7 && r !== 5) this.setBrick(r, c);

        // Center maze blocks
        if (r === 4 && (c === 4 || c === 5 || c === 7 || c === 8)) this.setBrick(r, c);
        if (r === 6 && (c === 4 || c === 8)) this.grid[r][c] = TileType.STEEL;
        if (r === 5 && c === 6) this.grid[r][c] = TileType.STEEL;
      }
    }
  }

  /**
   * 3. CROSSROAD AMBUSH: Wide central 4-lane crossroads, 4 fortified corners
   */
  private buildCrossroadAmbush() {
    // The main avenues at row 5-6 and col 5-7 are mostly open
    // Top-Left fortified district
    for (let r = 2; r <= 4; r++) {
      for (let c = 1; c <= 4; c++) {
        if (r === 3 && c === 3) this.grid[r][c] = TileType.STEEL;
        else if (r !== 3 || c !== 2) this.setBrick(r, c);
      }
    }

    // Top-Right fortified district
    for (let r = 2; r <= 4; r++) {
      for (let c = 8; c <= 11; c++) {
        if (r === 3 && c === 9) this.grid[r][c] = TileType.STEEL;
        else if (r !== 3 || c !== 10) this.setBrick(r, c);
      }
    }

    // Bottom-Left district
    for (let r = 7; r <= 9; r++) {
      for (let c = 1; c <= 4; c++) {
        if (r === 8 && c === 2) this.grid[r][c] = TileType.STEEL;
        else this.setBrick(r, c);
      }
    }

    // Bottom-Right district
    for (let r = 7; r <= 9; r++) {
      for (let c = 8; c <= 11; c++) {
        if (r === 8 && c === 10) this.grid[r][c] = TileType.STEEL;
        else this.setBrick(r, c);
      }
    }

    // Crossroads center island
    this.grid[5][5] = TileType.FOREST;
    this.grid[5][7] = TileType.FOREST;
    this.grid[7][5] = TileType.FOREST;
    this.grid[7][7] = TileType.FOREST;
  }

  /**
   * 4. JUNGLE HUNT: 45% dense forest foliage with ambush corridors
   */
  private buildJungleHunt() {
    // Big jungle canopy in top-left, center, and right
    for (let r = 1; r < 11; r++) {
      for (let c = 1; c < 12; c++) {
        if (r >= 10 && c >= 4 && c <= 8) continue;

        // Jungle patches
        if ((r + c) % 3 === 0 || (r * c) % 5 === 0) {
          this.grid[r][c] = TileType.FOREST;
        } else if ((r % 2 === 1 && c % 4 === 1) && r > 2) {
          this.setBrick(r, c);
        }
      }
    }

    // Hidden steel pillars within jungle
    this.grid[3][3] = TileType.STEEL;
    this.grid[3][9] = TileType.STEEL;
    this.grid[7][3] = TileType.STEEL;
    this.grid[7][9] = TileType.STEEL;
  }

  /**
   * 5. GLACIAL ICEFIELD: Vast central sheet of slippery ice
   */
  private buildGlacialIcefield() {
    // Large center ice sheet
    for (let r = 3; r <= 8; r++) {
      for (let c = 2; c <= 10; c++) {
        this.grid[r][c] = TileType.ICE;
      }
    }

    // Steel crash barriers on ice boundaries
    this.grid[3][2] = TileType.STEEL;
    this.grid[3][10] = TileType.STEEL;
    this.grid[8][2] = TileType.STEEL;
    this.grid[8][10] = TileType.STEEL;
    this.grid[5][6] = TileType.STEEL; // Center anchor

    // Outer brick fortifications
    for (let c = 1; c < 12; c += 2) {
      this.setBrick(1, c);
      this.setBrick(10, c);
    }
  }

  /**
   * 6. IRON FORTRESS (Elite): Thick titanium steel bunkers
   */
  private buildIronFortress() {
    // Concentric steel barrier ring
    for (let c = 3; c <= 9; c++) {
      if (c !== 6) this.grid[3][c] = TileType.STEEL;
      if (c !== 6 && c !== 4 && c !== 8) this.grid[7][c] = TileType.STEEL;
    }
    this.grid[4][3] = TileType.STEEL;
    this.grid[5][3] = TileType.STEEL;
    this.grid[4][9] = TileType.STEEL;
    this.grid[5][9] = TileType.STEEL;

    // Brick embrasures guarding inner fortress
    this.setBrick(4, 5);
    this.setBrick(4, 7);
    this.setBrick(5, 5);
    this.setBrick(5, 7);

    // Perimeter defenses
    for (let r = 8; r <= 10; r++) {
      this.setBrick(r, 1);
      this.setBrick(r, 11);
    }
  }

  /**
   * 7. TWIN OUTPOSTS (Elite): Moat dividing battlefield
   */
  private buildTwinOutposts() {
    // Water moat cutting through middle with 2 access corridors
    for (let r = 3; r <= 8; r++) {
      if (r !== 5 && r !== 6) {
        this.grid[r][4] = TileType.WATER;
        this.grid[r][8] = TileType.WATER;
      }
    }

    // West Outpost
    this.setBrick(4, 1);
    this.setBrick(5, 1);
    this.setBrick(6, 1);
    this.grid[5][2] = TileType.STEEL;

    // East Outpost
    this.setBrick(4, 11);
    this.setBrick(5, 11);
    this.setBrick(6, 11);
    this.grid[5][10] = TileType.STEEL;

    // Center Bastion
    this.setBrick(4, 6);
    this.grid[5][6] = TileType.STEEL;
    this.setBrick(6, 6);
  }

  /**
   * 8. GOLIATH COLOSSEUM (Boss): Grand circular arena
   */
  private buildGoliathColosseum() {
    // 4 Massive steel columns for tactical duck-and-cover
    this.grid[4][3] = TileType.STEEL;
    this.grid[4][4] = TileType.STEEL;
    this.grid[5][3] = TileType.STEEL;
    this.grid[5][4] = TileType.STEEL;

    this.grid[4][8] = TileType.STEEL;
    this.grid[4][9] = TileType.STEEL;
    this.grid[5][8] = TileType.STEEL;
    this.grid[5][9] = TileType.STEEL;

    // Outer destructible brick arena wall
    for (let c = 1; c <= 11; c++) {
      if (c < 4 || c > 8) {
        this.setBrick(1, c);
        this.setBrick(8, c);
      }
    }
    for (let r = 2; r <= 7; r++) {
      this.setBrick(r, 1);
      this.setBrick(r, 11);
    }

    // Two strategic ice slip zones for dodging boss missile barrages
    this.grid[3][6] = TileType.ICE;
    this.grid[6][6] = TileType.ICE;
  }

  /**
   * 9. TRENCH WARFARE: Long vertical trench corridors with reinforced sandbags and bunkers
   */
  private buildTrenchWarfare() {
    // Two major vertical trench lines at col 3 and col 9
    for (let r = 2; r <= 9; r++) {
      if (r !== 5 && r !== 6) {
        this.setBrick(r, 2);
        this.setBrick(r, 4);
        this.setBrick(r, 8);
        this.setBrick(r, 10);
      }
    }

    // Steel pillbox bunkers at trench angles
    this.grid[4][2] = TileType.STEEL;
    this.grid[7][4] = TileType.STEEL;
    this.grid[4][10] = TileType.STEEL;
    this.grid[7][8] = TileType.STEEL;

    // Central no-man's-land sandbags and foliage
    this.setBrick(5, 5);
    this.setBrick(5, 7);
    this.setBrick(6, 6);
    this.grid[5][6] = TileType.FOREST;
    this.grid[6][5] = TileType.FOREST;
    this.grid[6][7] = TileType.FOREST;

    // Flank foliage along far borders
    for (let r = 3; r <= 8; r++) {
      this.grid[r][0] = TileType.FOREST;
      this.grid[r][12] = TileType.FOREST;
    }
  }

  /**
   * 10. CHECKERED PILLARS (Elite/Classic): Roman column grid of alternating steel & brick
   */
  private buildCheckeredPillars() {
    // Alternating pillars across rows 2, 4, 6, 8 and cols 2, 4, 6, 8, 10
    const rows = [2, 4, 6, 8];
    const cols = [2, 4, 6, 8, 10];

    for (let ri = 0; ri < rows.length; ri++) {
      for (let ci = 0; ci < cols.length; ci++) {
        const r = rows[ri];
        const c = cols[ci];
        if (r === 6 && c === 6) continue;

        if ((ri + ci) % 2 === 0) {
          this.setBrick(r, c);
        } else {
          this.grid[r][c] = TileType.STEEL;
        }
      }
    }

    // Center rapid ice runway at row 5
    for (let c = 3; c <= 9; c++) {
      this.grid[5][c] = TileType.ICE;
    }

    // Flanking foliage clusters
    this.grid[3][0] = TileType.FOREST;
    this.grid[4][0] = TileType.FOREST;
    this.grid[3][12] = TileType.FOREST;
    this.grid[4][12] = TileType.FOREST;
  }

  private setBrick(r: number, c: number) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
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

      const cos = Math.cos(bulletAngle);
      const sin = Math.sin(bulletAngle);

      let subHit = false;
      if (Math.abs(sin) > Math.abs(cos)) {
        if (sin < 0) {
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
        if (cos < 0) {
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
        if (tileLocalX < 0.5 && tileLocalY < 0.5) hp.tl = false;
        else if (tileLocalX >= 0.5 && tileLocalY < 0.5) hp.tr = false;
        else if (tileLocalX < 0.5 && tileLocalY >= 0.5) hp.bl = false;
        else hp.br = false;
      }

      vfx.spawnBrickDebris(bulletX, bulletY);
      sounds.playBrickDestroy();

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
