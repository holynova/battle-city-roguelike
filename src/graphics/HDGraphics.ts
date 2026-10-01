/**
 * High-Definition Procedural Graphics Generator
 * Generates high-resolution, vector-crisp textures on off-screen canvases
 * to ensure razor-sharp graphics on Retina/4K displays.
 */

export class HDGraphics {
  private static cache: Map<string, HTMLCanvasElement> = new Map();
  private static imageAssets: Map<string, HTMLImageElement> = new Map();
  private static initialized: boolean = false;

  // Initialize and preload all high-res textured art assets
  public static initAssets() {
    if (this.initialized) return;
    this.initialized = true;

    const assets: Record<string, string> = {
      ground: './assets/images/battlefield_ground.jpg',
      brick: './assets/images/tile_brick.jpg',
      steel: './assets/images/tile_steel.jpg',
      forest: './assets/images/tile_forest.jpg',
      water: './assets/images/tile_water.jpg',
      eagle_bastion: './assets/images/eagle_bastion.jpg',
      eagle_destroyed: './assets/images/eagle_destroyed.jpg',
    };

    for (const [key, src] of Object.entries(assets)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        // Invalidate corresponding cache entries so high-res textures render immediately
        if (key === 'ground') this.cache.delete('battlefield_ground');
        if (key === 'brick') this.cache.delete('tile_brick');
        if (key === 'steel') this.cache.delete('tile_steel');
        if (key === 'forest') this.cache.delete('tile_forest');
        if (key === 'water') {
          for (let f = 0; f < 4; f++) this.cache.delete(`tile_water_${f}`);
        }
        if (key === 'eagle_bastion') this.cache.delete('eagle_base_false');
        if (key === 'eagle_destroyed') this.cache.delete('eagle_base_true');
      };
      this.imageAssets.set(key, img);
    }
  }

  private static getImage(key: string): HTMLImageElement | null {
    if (!this.initialized) {
      this.initAssets();
    }
    const img = this.imageAssets.get(key);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }

  // Helper to create an offscreen canvas at a high resolution
  public static createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    return { canvas, ctx };
  }

  // -------------------------------------------------------------
  // BATTLEFIELD ARENA GROUND (HIGH-RES TEXTURED WARZONE BED)
  // -------------------------------------------------------------
  public static getBattlefieldGround(): HTMLCanvasElement {
    const key = 'battlefield_ground';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 676;
    const { canvas, ctx } = this.createCanvas(size, size);
    const img = this.getImage('ground');

    if (img) {
      // Draw high-resolution scorched earth, cracked asphalt, and hazard-striped plates
      ctx.drawImage(img, 0, 0, size, size);

      // Subtle atmospheric grid overlay for tactical military feel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 52;
      for (let x = 0; x <= size; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
      for (let y = 0; y <= size; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
    } else {
      // Fallback dark tactical floor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size, size);
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  // -------------------------------------------------------------
  // PLAYER TANK (CHASSIS & TURRET)
  // -------------------------------------------------------------
  public static getPlayerChassis(): HTMLCanvasElement {
    const key = 'player_chassis';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(16, 20, 96, 92, 12);
    ctx.fill();

    // Left Tread
    this.drawTread(ctx, 14, 18, 22, 92, '#2b2e33', '#16181b');
    // Right Tread
    this.drawTread(ctx, 92, 18, 22, 92, '#2b2e33', '#16181b');

    // Main Hull (Chassis body)
    const hullGrad = ctx.createLinearGradient(32, 20, 96, 108);
    hullGrad.addColorStop(0, '#4a6b32'); // Military Olive Green
    hullGrad.addColorStop(0.5, '#3b5825');
    hullGrad.addColorStop(1, '#253817');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#1e2c13';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(32, 20, 64, 88, 10);
    ctx.fill();
    ctx.stroke();

    // Front Armor Sloped Plate
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(34, 34);
    ctx.lineTo(64, 22);
    ctx.lineTo(94, 34);
    ctx.lineTo(88, 48);
    ctx.lineTo(40, 48);
    ctx.closePath();
    ctx.fill();

    // Rivets / Bolts
    ctx.fillStyle = '#6b8e23';
    const bolts = [
      [38, 26], [90, 26],
      [38, 100], [90, 100],
      [40, 52], [88, 52]
    ];
    for (const [bx, by] of bolts) {
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rear engine vent grilles
    ctx.fillStyle = '#1a2214';
    ctx.fillRect(44, 90, 40, 12);
    ctx.strokeStyle = '#324227';
    ctx.lineWidth = 1.5;
    for (let y = 92; y <= 100; y += 3) {
      ctx.beginPath();
      ctx.moveTo(46, y);
      ctx.lineTo(82, y);
      ctx.stroke();
    }

    // Turret Mounting Ring
    ctx.fillStyle = '#1c2417';
    ctx.beginPath();
    ctx.arc(64, 60, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a783d';
    ctx.lineWidth = 2;
    ctx.stroke();

    this.cache.set(key, canvas);
    return canvas;
  }

  public static getPlayerTurret(barrelType: 'single' | 'dual' | 'heavy' | 'laser' = 'single'): HTMLCanvasElement {
    const key = `player_turret_${barrelType}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Center is (64, 64)
    ctx.save();
    ctx.translate(64, 64);

    // Barrel(s) pointing UP (angle 0 corresponds to -Y in standard canvas)
    if (barrelType === 'dual') {
      this.drawBarrel(ctx, -7, -56, 6, 46, '#555f6d', '#1e2329');
      this.drawBarrel(ctx, 7, -56, 6, 46, '#555f6d', '#1e2329');
    } else if (barrelType === 'heavy') {
      this.drawBarrel(ctx, 0, -62, 14, 52, '#48525f', '#191f26', true);
    } else if (barrelType === 'laser') {
      this.drawLaserBarrel(ctx, 0, -64, 10, 54);
    } else {
      // Standard single barrel
      this.drawBarrel(ctx, 0, -54, 9, 44, '#555f6d', '#1e2329');
    }

    // Turret Dome Body
    const domeGrad = ctx.createRadialGradient(-4, -6, 4, 0, 0, 22);
    domeGrad.addColorStop(0, '#5f8741');
    domeGrad.addColorStop(0.7, '#42612b');
    domeGrad.addColorStop(1, '#243717');

    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = '#18240f';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(-20, -18, 40, 38, 8);
    ctx.fill();
    ctx.stroke();

    // Commander Hatch
    ctx.fillStyle = '#2f441f';
    ctx.strokeStyle = '#6f9c4d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hatch hinge
    ctx.fillStyle = '#8fad68';
    ctx.fillRect(4, 9, 4, 3);

    // Front Optics / Periscope
    ctx.fillStyle = '#4cd4ff';
    ctx.shadowColor = '#00e1ff';
    ctx.shadowBlur = 6;
    ctx.fillRect(-12, -14, 8, 4);
    ctx.shadowBlur = 0;

    ctx.restore();
    this.cache.set(key, canvas);
    return canvas;
  }

  // Helper for drawing tank treads with individual links and road wheels
  private static drawTread(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c1: string, c2: string) {
    ctx.fillStyle = c2;
    ctx.strokeStyle = '#0e0f12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Tread links (horizontal rubber / steel pads)
    ctx.fillStyle = c1;
    for (let py = y + 4; py < y + h - 4; py += 7) {
      ctx.fillRect(x + 2, py, w - 4, 4);
    }

    // Road wheels inside
    ctx.fillStyle = '#1c1e22';
    ctx.strokeStyle = '#4a505b';
    ctx.lineWidth = 1.5;
    const wheelY = [y + 16, y + 36, y + 56, y + 76];
    for (const wy of wheelY) {
      ctx.beginPath();
      ctx.arc(x + w / 2, wy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8f98a8';
      ctx.beginPath();
      ctx.arc(x + w / 2, wy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1e22';
    }
  }

  // Draw main tank gun barrel with recoil sleeve and muzzle brake
  private static drawBarrel(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    topY: number,
    width: number,
    height: number,
    c1: string,
    c2: string,
    isHeavy: boolean = false
  ) {
    const x = centerX - width / 2;
    const grad = ctx.createLinearGradient(x, topY, x + width, topY);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, '#7f8a9a');
    grad.addColorStop(1, c2);

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#121518';
    ctx.lineWidth = 1.5;

    // Main barrel tube
    ctx.beginPath();
    ctx.rect(x, topY + 8, width, height - 8);
    ctx.fill();
    ctx.stroke();

    // Muzzle brake at tip
    ctx.fillStyle = '#22272e';
    ctx.beginPath();
    ctx.roundRect(x - (isHeavy ? 4 : 2), topY, width + (isHeavy ? 8 : 4), 10, 2);
    ctx.fill();
    ctx.stroke();

    // Recoil cylinder at base
    ctx.fillStyle = '#2b313a';
    ctx.fillRect(x - 2, topY + height - 12, width + 4, 12);
  }

  // Draw high-tech Railgun / Laser barrel
  private static drawLaserBarrel(ctx: CanvasRenderingContext2D, centerX: number, topY: number, width: number, height: number) {
    const x = centerX - width / 2;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, topY + 8, width, height - 8);

    // Glowing energy rail
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.fillRect(centerX - 2, topY + 4, 4, height - 4);
    ctx.shadowBlur = 0;

    // Focus rings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let y = topY + 14; y < topY + height - 10; y += 10) {
      ctx.strokeRect(x - 2, y, width + 4, 3);
    }
  }

  // -------------------------------------------------------------
  // ENEMY TANKS (4 DISTINCT CLASSES)
  // -------------------------------------------------------------

  /**
   * 1. SCOUT TANK (Fast, light, yellow/orange armor)
   */
  public static getEnemyScout(): HTMLCanvasElement {
    const key = 'enemy_scout';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Treads
    this.drawTread(ctx, 22, 24, 16, 80, '#3a3a3a', '#1e1e1e');
    this.drawTread(ctx, 90, 24, 16, 80, '#3a3a3a', '#1e1e1e');

    // Hull (Sleek aerodynamic high-speed shape)
    const hullGrad = ctx.createLinearGradient(38, 24, 90, 104);
    hullGrad.addColorStop(0, '#eab308'); // Bright military yellow
    hullGrad.addColorStop(0.7, '#ca8a04');
    hullGrad.addColorStop(1, '#854d0e');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(64, 22);
    ctx.lineTo(90, 42);
    ctx.lineTo(86, 102);
    ctx.lineTo(42, 102);
    ctx.lineTo(38, 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Twin exhausts
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(44, 98, 8, 8);
    ctx.fillRect(76, 98, 8, 8);

    // Turret
    ctx.save();
    ctx.translate(64, 60);
    this.drawBarrel(ctx, 0, -48, 6, 38, '#4b5563', '#1f2937');

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Red scout scanner lens
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * 2. ASSAULT MEDIUM TANK (Aggressive, balanced, cyan/blue armor)
   */
  public static getEnemyAssault(): HTMLCanvasElement {
    const key = 'enemy_assault';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Treads
    this.drawTread(ctx, 16, 20, 20, 88, '#334155', '#0f172a');
    this.drawTread(ctx, 92, 20, 20, 88, '#334155', '#0f172a');

    // Body
    const hullGrad = ctx.createLinearGradient(36, 22, 92, 106);
    hullGrad.addColorStop(0, '#0284c7'); // Ocean assault blue
    hullGrad.addColorStop(0.6, '#0369a1');
    hullGrad.addColorStop(1, '#0c4a6e');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#082f49';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(36, 22, 56, 84, 8);
    ctx.fill();
    ctx.stroke();

    // Turret with dual quick-fire cannons
    ctx.save();
    ctx.translate(64, 58);
    this.drawBarrel(ctx, -5, -52, 6, 42, '#64748b', '#1e293b');
    this.drawBarrel(ctx, 5, -52, 6, 42, '#64748b', '#1e293b');

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#075985';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-18, -16, 36, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Cyan visor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-10, -12, 20, 4);
    ctx.restore();

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * 3. MAMMOTH HEAVY TANK (Classic 4-hit Red Heavy Armor Monster)
   */
  public static getEnemyHeavy(): HTMLCanvasElement {
    const key = 'enemy_heavy';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Dual wide heavy treads with armored side skirts
    this.drawTread(ctx, 10, 16, 26, 96, '#450a0a', '#180303');
    this.drawTread(ctx, 92, 16, 26, 96, '#450a0a', '#180303');

    // Massive Crimson Hull
    const hullGrad = ctx.createLinearGradient(30, 18, 98, 110);
    hullGrad.addColorStop(0, '#dc2626'); // Heavy Red Armor
    hullGrad.addColorStop(0.5, '#991b1b');
    hullGrad.addColorStop(1, '#450a0a');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#2b0707';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(30, 18, 68, 92, 10);
    ctx.fill();
    ctx.stroke();

    // Front Ramming Blade
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(24, 20);
    ctx.lineTo(64, 10);
    ctx.lineTo(104, 20);
    ctx.lineTo(96, 28);
    ctx.lineTo(32, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Turret with Twin Heavy Cannons
    ctx.save();
    ctx.translate(64, 62);
    this.drawBarrel(ctx, -8, -60, 10, 50, '#57534e', '#1c1917', true);
    this.drawBarrel(ctx, 8, -60, 10, 50, '#57534e', '#1c1917', true);

    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-24, -22, 48, 44, 8);
    ctx.fill();
    ctx.stroke();

    // Heavy Commander Cupola
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Menacing Red Optics
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillRect(-14, -16, 28, 5);
    ctx.shadowBlur = 0;
    ctx.restore();

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * 4. MISSILE ARTILLERY CARRIER (Purple/Dark, long-range mortar)
   */
  public static getEnemyMissile(): HTMLCanvasElement {
    const key = 'enemy_missile';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    this.drawTread(ctx, 18, 20, 20, 88, '#3b0764', '#19032b');
    this.drawTread(ctx, 90, 20, 20, 88, '#3b0764', '#19032b');

    // Dark Violet Body
    const hullGrad = ctx.createLinearGradient(38, 22, 90, 106);
    hullGrad.addColorStop(0, '#7e22ce');
    hullGrad.addColorStop(0.6, '#581c87');
    hullGrad.addColorStop(1, '#2e1065');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#1e053a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(38, 22, 52, 84, 8);
    ctx.fill();
    ctx.stroke();

    // Quad Rocket Pod Turret
    ctx.save();
    ctx.translate(64, 58);

    ctx.fillStyle = '#3b0764';
    ctx.strokeStyle = '#1e053a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, -26, 44, 48, 6);
    ctx.fill();
    ctx.stroke();

    // 4 Rocket Launch Tubes
    const tubes = [
      [-14, -20], [-4, -20],
      [4, -20], [14, -20]
    ];
    for (const [tx, ty] of tubes) {
      ctx.fillStyle = '#0f041a';
      ctx.fillRect(tx - 3, ty, 6, 36);
      // Red missile tips
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(tx, ty + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.cache.set(key, canvas);
    return canvas;
  }

  // -------------------------------------------------------------
  // MODULAR ENEMY CHASSIS & TURRET (FOR INDEPENDENT ROTATION & ELITES)
  // -------------------------------------------------------------
  public static getEnemyChassis(enemyClass: string = 'heavy'): HTMLCanvasElement {
    const key = `enemy_chassis_${enemyClass}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    if (enemyClass === 'scout') {
      this.drawTread(ctx, 22, 24, 16, 80, '#3a3a3a', '#1e1e1e');
      this.drawTread(ctx, 90, 24, 16, 80, '#3a3a3a', '#1e1e1e');
      const hullGrad = ctx.createLinearGradient(38, 24, 90, 104);
      hullGrad.addColorStop(0, '#eab308');
      hullGrad.addColorStop(0.7, '#ca8a04');
      hullGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = hullGrad;
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(64, 22);
      ctx.lineTo(90, 42);
      ctx.lineTo(86, 102);
      ctx.lineTo(42, 102);
      ctx.lineTo(38, 42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (enemyClass === 'assault') {
      this.drawTread(ctx, 16, 20, 20, 88, '#334155', '#0f172a');
      this.drawTread(ctx, 92, 20, 20, 88, '#334155', '#0f172a');
      const hullGrad = ctx.createLinearGradient(36, 22, 92, 106);
      hullGrad.addColorStop(0, '#0284c7');
      hullGrad.addColorStop(0.6, '#0369a1');
      hullGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = hullGrad;
      ctx.strokeStyle = '#082f49';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(36, 22, 56, 84, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      // Heavy / Elite / Boss chassis
      this.drawTread(ctx, 10, 16, 26, 96, '#450a0a', '#180303');
      this.drawTread(ctx, 92, 16, 26, 96, '#450a0a', '#180303');
      const hullGrad = ctx.createLinearGradient(30, 18, 98, 110);
      hullGrad.addColorStop(0, '#dc2626');
      hullGrad.addColorStop(0.5, '#991b1b');
      hullGrad.addColorStop(1, '#450a0a');
      ctx.fillStyle = hullGrad;
      ctx.strokeStyle = '#2b0707';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(30, 18, 68, 92, 10);
      ctx.fill();
      ctx.stroke();

      // Front Ramming Blade
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(24, 20);
      ctx.lineTo(64, 10);
      ctx.lineTo(104, 20);
      ctx.lineTo(96, 28);
      ctx.lineTo(32, 28);
      ctx.closePath();
      ctx.fill();
    }

    // Turret Mounting Ring
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(64, 60, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();

    this.cache.set(key, canvas);
    return canvas;
  }

  public static getEnemyTurret(turretType: string = 'heavy'): HTMLCanvasElement {
    const key = `enemy_turret_${turretType}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    ctx.save();
    ctx.translate(64, 64);

    if (turretType === 'single') {
      this.drawBarrel(ctx, 0, -52, 7, 44, '#475569', '#1e293b');
      ctx.fillStyle = '#991b1b';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -16, 32, 32, 6);
      ctx.fill();
      ctx.stroke();
    } else {
      // Heavy & Boss: Double heavy reinforced barrel with muzzle brake
      this.drawBarrel(ctx, -8, -58, 8, 48, '#334155', '#0f172a', true);
      this.drawBarrel(ctx, 8, -58, 8, 48, '#334155', '#0f172a', true);

      const domeGrad = ctx.createRadialGradient(-4, -6, 4, 0, 0, 24);
      domeGrad.addColorStop(0, '#ef4444');
      domeGrad.addColorStop(0.6, '#b91c1c');
      domeGrad.addColorStop(1, '#450a0a');

      ctx.fillStyle = domeGrad;
      ctx.strokeStyle = '#2b0707';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-22, -20, 44, 42, 8);
      ctx.fill();
      ctx.stroke();
    }

    // Glowing Crimson Optic Sensor
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(-10, -12, 20, 4);
    ctx.shadowBlur = 0;

    ctx.restore();
    this.cache.set(key, canvas);
    return canvas;
  }

  // -------------------------------------------------------------
  // BOSS: LAND CRUISER "GOLIATH" (256x256 GIANT BATTLE PLATFORM)
  // -------------------------------------------------------------
  public static getBossGoliath(): HTMLCanvasElement {
    const key = 'boss_goliath';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 256;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Quad Heavy Treads (Four monster tread units)
    this.drawTread(ctx, 20, 24, 34, 96, '#27272a', '#09090b');
    this.drawTread(ctx, 20, 136, 34, 96, '#27272a', '#09090b');
    this.drawTread(ctx, 202, 24, 34, 96, '#27272a', '#09090b');
    this.drawTread(ctx, 202, 136, 34, 96, '#27272a', '#09090b');

    // Central Super Fortress Chassis
    const hullGrad = ctx.createLinearGradient(48, 20, 208, 236);
    hullGrad.addColorStop(0, '#52525b');
    hullGrad.addColorStop(0.5, '#27272a');
    hullGrad.addColorStop(1, '#09090b');

    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(48, 24, 160, 208, 18);
    ctx.fill();
    ctx.stroke();

    // Hazard Stripes on front & back bumpers
    this.drawHazardStripes(ctx, 54, 28, 148, 14);
    this.drawHazardStripes(ctx, 54, 214, 148, 14);

    // Left Secondary Turret
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(80, 70, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.stroke();
    this.drawBarrel(ctx, 80, 24, 6, 34, '#52525b', '#18181b');

    // Right Secondary Turret
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(176, 70, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.stroke();
    this.drawBarrel(ctx, 176, 24, 6, 34, '#52525b', '#18181b');

    // Central Heavy Siege Cannon / Plasma Core
    ctx.save();
    ctx.translate(128, 144);
    this.drawBarrel(ctx, -12, -120, 16, 100, '#a1a1aa', '#18181b', true);
    this.drawBarrel(ctx, 12, -120, 16, 100, '#a1a1aa', '#18181b', true);

    // Boss Core Dome
    const domeGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 48);
    domeGrad.addColorStop(0, '#ef4444');
    domeGrad.addColorStop(0.5, '#991b1b');
    domeGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pulsing energy core
    ctx.fillStyle = '#f87171';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    this.cache.set(key, canvas);
    return canvas;
  }

  private static drawHazardStripes(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#18181b';
    const stripeW = 12;
    for (let px = x - h; px < x + w + h; px += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + stripeW, y);
      ctx.lineTo(px + stripeW - h, y + h);
      ctx.lineTo(px - h, y + h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // EAGLE BASE (COMMAND BASTION)
  // -------------------------------------------------------------
  public static getEagleBase(isDestroyed: boolean = false): HTMLCanvasElement {
    const key = `eagle_base_${isDestroyed}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);

    const img = this.getImage(isDestroyed ? 'eagle_destroyed' : 'eagle_bastion');
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(8, 8, 112, 112, 16);
      ctx.clip();
      ctx.drawImage(img, 8, 8, 112, 112);
      ctx.restore();

      // Border and corner rivets
      ctx.strokeStyle = isDestroyed ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(8, 8, 112, 112, 16);
      ctx.stroke();

      if (!isDestroyed) {
        // Cyan energy shield pulse corners
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        const corners = [[14, 14], [114, 14], [14, 114], [114, 114]];
        for (const [cx, cy] of corners) {
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      this.cache.set(key, canvas);
      return canvas;
    }

    if (isDestroyed) {
      // Scorched rubble and shattered eagle
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3f3f46';
      for (let i = 0; i < 18; i++) {
        const rx = 30 + Math.random() * 68;
        const ry = 30 + Math.random() * 68;
        const rs = 6 + Math.random() * 14;
        ctx.fillRect(rx, ry, rs, rs);
      }

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(88, 88);
      ctx.moveTo(88, 40);
      ctx.lineTo(40, 88);
      ctx.stroke();

      this.cache.set(key, canvas);
      return canvas;
    }

    // Intact High-Tech Military Eagle Bastion
    // Concrete bunker platform
    const baseGrad = ctx.createRadialGradient(64, 64, 10, 64, 64, 54);
    baseGrad.addColorStop(0, '#475569');
    baseGrad.addColorStop(0.8, '#1e293b');
    baseGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(14, 14, 100, 100, 14);
    ctx.fill();
    ctx.stroke();

    // Corner fortification bolts
    ctx.fillStyle = '#cbd5e1';
    for (const [bx, by] of [[22, 22], [106, 22], [22, 106], [106, 106]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden Mechanized Eagle Emblem
    ctx.save();
    ctx.translate(64, 64);

    // Wings
    const wingGrad = ctx.createLinearGradient(-44, 0, 44, 0);
    wingGrad.addColorStop(0, '#f59e0b');
    wingGrad.addColorStop(0.5, '#fbbf24');
    wingGrad.addColorStop(1, '#f59e0b');

    ctx.fillStyle = wingGrad;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-24, -28);
    ctx.lineTo(-44, -12);
    ctx.lineTo(-32, 16);
    ctx.lineTo(-14, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(24, -28);
    ctx.lineTo(44, -12);
    ctx.lineTo(32, 16);
    ctx.lineTo(14, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eagle Body & Crown
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(14, -8);
    ctx.lineTo(10, 24);
    ctx.lineTo(0, 32);
    ctx.lineTo(-10, 24);
    ctx.lineTo(-14, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cyan Core Eye
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
    this.cache.set(key, canvas);
    return canvas;
  }

  // -------------------------------------------------------------
  // HIGH DEFINITION TERRAIN TILES (64x64)
  // -------------------------------------------------------------

  /**
   * HD Brick Wall (Weathered ceramic masonry with cement joints and texture)
   */
  public static getBrickTile(): HTMLCanvasElement {
    const key = 'tile_brick';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 64;
    const { canvas, ctx } = this.createCanvas(size, size);

    const img = this.getImage('brick');
    if (img) {
      // Draw high-resolution textured brick wall
      ctx.drawImage(img, 0, 0, size, size);

      // Add clear mortar grid lines dividing into 4 quadrants (0..32, 32..64)
      // for seamless compatibility with TileMap's quadrant destruction!
      ctx.fillStyle = 'rgba(20, 20, 20, 0.75)';
      ctx.fillRect(31, 0, 2, size); // Vertical center mortar seam
      ctx.fillRect(0, 31, size, 2); // Horizontal center mortar seam

      // Subtle quadrant highlight edges for 3D depth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(0, 0, size, 1);
      ctx.fillRect(0, 0, 1, size);
      ctx.fillRect(33, 0, 1, size);
      ctx.fillRect(0, 33, size, 1);

      this.cache.set(key, canvas);
      return canvas;
    }

    // Mortar Background (Cement lines)
    ctx.fillStyle = '#262626';
    ctx.fillRect(0, 0, size, size);

    // Individual Bricks
    const brickRows = 4;
    const rowH = 16;
    for (let r = 0; r < brickRows; r++) {
      const y = r * rowH;
      const isOffset = r % 2 === 1;
      const cols = isOffset ? [0, 22, 44] : [0, 32];
      const widths = isOffset ? [20, 20, 18] : [30, 30];

      cols.forEach((colX, idx) => {
        const bw = widths[idx];
        const bh = rowH - 2;

        const grad = ctx.createLinearGradient(colX + 1, y + 1, colX + bw, y + bh);
        grad.addColorStop(0, '#c2410c'); // Deep Terracotta Red
        grad.addColorStop(0.5, '#9a3412');
        grad.addColorStop(1, '#7c2d12');

        ctx.fillStyle = grad;
        ctx.fillRect(colX + 1, y + 1, bw, bh);

        // Highlight top/left edges for 3D bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(colX + 1, y + 1, bw, 2);
        ctx.fillRect(colX + 1, y + 1, 2, bh);

        // Shadow bottom/right
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(colX + 1, y + bh - 1, bw, 1);
        ctx.fillRect(colX + bw - 1, y + 1, 1, bh);

        // Micro weathering specks
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(colX + 6, y + 6, 2, 2);
        ctx.fillRect(colX + bw - 7, y + 8, 3, 2);
      });
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * HD Steel Wall (Brushed Titanium Alloy with rivets)
   */
  public static getSteelTile(): HTMLCanvasElement {
    const key = 'tile_steel';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 64;
    const { canvas, ctx } = this.createCanvas(size, size);

    const img = this.getImage('steel');
    if (img) {
      ctx.drawImage(img, 0, 0, size, size);

      // Industrial border bevel & highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(2, 2, size - 4, size - 4);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, 4, size - 8, size - 8);

      // 4 Heavy corner bolts
      ctx.fillStyle = '#f1f5f9';
      for (const [rx, ry] of [[8, 8], [size - 8, 8], [8, size - 8], [size - 8, size - 8]]) {
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      this.cache.set(key, canvas);
      return canvas;
    }

    // Titanium Plate
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#cbd5e1');
    grad.addColorStop(0.3, '#94a3b8');
    grad.addColorStop(0.7, '#64748b');
    grad.addColorStop(1, '#475569');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Bevel borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.strokeRect(4, 4, size - 8, size - 8);

    // Inner cross reinforcement
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(size - 8, size - 8);
    ctx.moveTo(size - 8, 8);
    ctx.lineTo(8, size - 8);
    ctx.stroke();

    // Rivets at 4 corners
    ctx.fillStyle = '#f1f5f9';
    for (const [rx, ry] of [[8, 8], [size - 8, 8], [8, size - 8], [size - 8, size - 8]]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * HD Forest Tile (Lush layered leaves)
   */
  public static getForestTile(): HTMLCanvasElement {
    const key = 'tile_forest';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 64;
    const { canvas, ctx } = this.createCanvas(size, size);

    const img = this.getImage('forest');
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(2, 2, size - 4, size - 4, 8);
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();

      // Top leafy specular highlights
      ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
      ctx.beginPath();
      ctx.arc(24, 24, 12, 0, Math.PI * 2);
      ctx.fill();

      this.cache.set(key, canvas);
      return canvas;
    }

    // Translucent foliage layers
    const clusters = [
      { x: 20, y: 20, r: 18, c: '#166534' },
      { x: 44, y: 22, r: 16, c: '#15803d' },
      { x: 24, y: 44, r: 17, c: '#22c55e' },
      { x: 44, y: 44, r: 19, c: '#16a34a' },
      { x: 32, y: 32, r: 15, c: '#4ade80' }
    ];

    for (const cl of clusters) {
      const g = ctx.createRadialGradient(cl.x, cl.y, 2, cl.x, cl.y, cl.r);
      g.addColorStop(0, cl.c);
      g.addColorStop(1, '#14532d');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * HD Water Tile (Fluid azure water with ripple highlights)
   */
  public static getWaterTile(frame: number = 0): HTMLCanvasElement {
    const key = `tile_water_${frame % 4}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 64;
    const { canvas, ctx } = this.createCanvas(size, size);

    const img = this.getImage('water');
    if (img) {
      ctx.drawImage(img, 0, 0, size, size);

      // Animated caustic ripples overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      const shift = (frame % 4) * 8;
      for (let y = 10; y < size; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(16, y - 4 + Math.sin(shift) * 3, 32, y + 4, 48, y - 2);
        ctx.lineTo(size, y + 2);
        ctx.stroke();
      }

      this.cache.set(key, canvas);
      return canvas;
    }

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#0369a1');
    grad.addColorStop(1, '#075985');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Moving caustic waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    const shift = (frame % 4) * 8;
    for (let y = 10; y < size; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(16, y - 4 + Math.sin(shift) * 3, 32, y + 4, 48, y - 2);
      ctx.lineTo(size, y + 2);
      ctx.stroke();
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * HD Ice Tile (Glacial crystalline surface)
   */
  public static getIceTile(): HTMLCanvasElement {
    const key = 'tile_ice';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 64;
    const { canvas, ctx } = this.createCanvas(size, size);

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.5, '#bae6fd');
    grad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Frost cracks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(34, 28);
    ctx.lineTo(54, 22);
    ctx.moveTo(34, 28);
    ctx.lineTo(26, 52);
    ctx.stroke();

    this.cache.set(key, canvas);
    return canvas;
  }

  // -------------------------------------------------------------
  // POWER-UP ICONS (64x64)
  // -------------------------------------------------------------
  public static getPowerupIcon(type: 'star' | 'clock' | 'bomb' | 'shovel' | 'helmet' | 'repair' | 'scrap'): HTMLCanvasElement {
    const key = `powerup_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 64;
    const { canvas, ctx } = this.createCanvas(size, size);

    // Outer Glowing Disc
    const bgGrad = ctx.createRadialGradient(32, 32, 8, 32, 32, 30);
    bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(32, 32);

    if (type === 'star') {
      // Golden 5-point star
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 18, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 18);
        ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 8, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 8);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'clock') {
      // Stopwatch
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 2, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-2, -16, 4, 4);
      // Clock hands
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, -6);
      ctx.moveTo(0, 2);
      ctx.lineTo(6, 2);
      ctx.stroke();
    } else if (type === 'bomb') {
      // High-explosive grenade
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 4, 14, 0, Math.PI * 2);
      ctx.fill();
      // Fuse
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(8, -18, 12, -12);
      ctx.stroke();
      // Spark
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(12, -12, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'shovel') {
      // Entrenching shovel
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(12, 4);
      ctx.lineTo(0, 16);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
      // Wooden handle
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-3, -18, 6, 8);
    } else if (type === 'helmet') {
      // Energy Shield Forcefield
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'repair') {
      // Medical repair cross
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-5, -16, 10, 32);
      ctx.fillRect(-16, -5, 32, 10);
    } else if (type === 'scrap') {
      // Golden Gear / Cog
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.cache.set(key, canvas);
    return canvas;
  }
}
