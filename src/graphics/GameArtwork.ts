/**
 * High-Definition Game Key Visuals & Scene Illustrations
 * Procedurally generates cinematic illustrations for Title Cover, War Table, Victory, and Defeat.
 */

export class GameArtwork {
  private static cache: Map<string, HTMLCanvasElement> = new Map();

  private static createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    return { canvas, ctx };
  }

  // -------------------------------------------------------------
  // 1. TITLE SCREEN COVER ART (Cinematic Battlefield Storm)
  // -------------------------------------------------------------
  public static getTitleCoverArt(w: number = 720, h: number = 380): HTMLCanvasElement {
    const key = `title_cover_${w}x${h}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(w, h);

    // Dark Stormy Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.4, '#0f172a');
    skyGrad.addColorStop(0.7, '#1e1b4b');
    skyGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Lightning Flash in background
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.7, 0);
    ctx.lineTo(w * 0.65, 70);
    ctx.lineTo(w * 0.72, 120);
    ctx.lineTo(w * 0.68, 190);
    ctx.stroke();

    // Twin Military Searchlight Beams sweeping sky
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const beam1 = ctx.createLinearGradient(w * 0.2, h * 0.8, w * 0.5, 0);
    beam1.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    beam1.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beam1;
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.8);
    ctx.lineTo(w * 0.22, h * 0.8);
    ctx.lineTo(w * 0.55, 0);
    ctx.lineTo(w * 0.45, 0);
    ctx.closePath();
    ctx.fill();

    const beam2 = ctx.createLinearGradient(w * 0.8, h * 0.85, w * 0.55, 0);
    beam2.addColorStop(0, 'rgba(250, 204, 21, 0.35)');
    beam2.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = beam2;
    ctx.beginPath();
    ctx.moveTo(w * 0.78, h * 0.85);
    ctx.lineTo(w * 0.82, h * 0.85);
    ctx.lineTo(w * 0.6, 0);
    ctx.lineTo(w * 0.52, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Distant Fortress Cliffs & Mountain Ridges
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w * 0.3, h * 0.55);
    ctx.lineTo(w * 0.6, h * 0.6);
    ctx.lineTo(w * 0.85, h * 0.5);
    ctx.lineTo(w, h * 0.62);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Distant Eagle Command Bastion silhouette on cliff
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.78, h * 0.42, 60, 40);
    // Eagle Wings Monument
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(w * 0.82, h * 0.34);
    ctx.lineTo(w * 0.76, h * 0.42);
    ctx.lineTo(w * 0.88, h * 0.42);
    ctx.closePath();
    ctx.fill();

    // Glowing cyan radar beacon on bastion
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.33, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Foreground muddy war-torn ground
    const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    groundGrad.addColorStop(0, '#1c1917');
    groundGrad.addColorStop(0.5, '#0c0a09');
    groundGrad.addColorStop(1, '#000000');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.quadraticCurveTo(w * 0.4, h * 0.74, w, h * 0.66);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Foreground Hero Heavy Battle Tank (Side-3/4 angle)
    const tx = w * 0.35;
    const ty = h * 0.72;

    // Tank Tread base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(tx - 90, ty + 10, 180, 45, 10);
    ctx.fill();
    ctx.stroke();

    // Road wheels with silver rims
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#64748b';
    for (let wx = tx - 70; wx <= tx + 70; wx += 35) {
      ctx.beginPath();
      ctx.arc(wx, ty + 32, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Heavy Sloped Hull
    const hullG = ctx.createLinearGradient(tx - 75, ty - 25, tx + 75, ty + 10);
    hullG.addColorStop(0, '#3f6212'); // Military Camo Green
    hullG.addColorStop(0.6, '#365314');
    hullG.addColorStop(1, '#1a2e05');
    ctx.fillStyle = hullG;
    ctx.beginPath();
    ctx.moveTo(tx - 85, ty + 10);
    ctx.lineTo(tx - 65, ty - 20);
    ctx.lineTo(tx + 65, ty - 20);
    ctx.lineTo(tx + 95, ty + 10);
    ctx.closePath();
    ctx.fill();

    // Heavy Turret with reactive armor blocks
    ctx.fillStyle = '#4d7c0f';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx - 45, ty - 45, 90, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Massive Main Cannon aiming slightly upward into storm
    ctx.save();
    ctx.translate(tx + 25, ty - 32);
    ctx.rotate(-0.15); // Upward angle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -7, 130, 14);
    // Muzzle brake
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(120, -10, 18, 20);

    // Red-hot cannon tip glow
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 18;
    ctx.fillRect(135, -5, 6, 10);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Glowing menancing optic visor on turret
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 10;
    ctx.fillRect(tx - 25, ty - 38, 20, 5);
    ctx.shadowBlur = 0;

    // Atmospheric flying ember sparks
    ctx.fillStyle = '#facc15';
    for (let i = 0; i < 40; i++) {
      const ex = Math.random() * w;
      const ey = h * 0.4 + Math.random() * (h * 0.6);
      const er = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  // -------------------------------------------------------------
  // 2. TACTICAL WAR TABLE BLUEPRINT (Topographic Map Background)
  // -------------------------------------------------------------
  public static getTacticalWarTableBg(w: number = 800, h: number = 520): HTMLCanvasElement {
    const key = `war_table_${w}x${h}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(w, h);

    // Weathered military blueprint dark navy background
    const bg = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2);
    bg.addColorStop(0, '#0c1626');
    bg.addColorStop(0.8, '#060a12');
    bg.addColorStop(1, '#020408');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Topographic Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Topographic Elevation Contour Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1.2;
    const centers = [
      { x: w * 0.25, y: h * 0.35, maxR: 140 },
      { x: w * 0.75, y: h * 0.65, maxR: 160 },
      { x: w * 0.5, y: h * 0.2, maxR: 100 }
    ];
    for (const c of centers) {
      for (let r = 20; r < c.maxR; r += 24) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const wobble = Math.sin(a * 4) * 8 + Math.cos(a * 2) * 6;
          const px = c.x + Math.cos(a) * (r + wobble);
          const py = c.y + Math.sin(a) * (r + wobble);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Compass Rose in bottom left
    const cx = 80;
    const cy = h - 80;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.stroke();
    // North pointer
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 44);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();

    // Red Classified Dossier Stamp
    ctx.save();
    ctx.translate(w - 140, 70);
    ctx.rotate(-0.18);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(-90, -22, 180, 44);
    ctx.font = '900 18px monospace, sans-serif';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('TOP SECRET / CLASSIFIED', 0, 6);
    ctx.restore();

    this.cache.set(key, canvas);
    return canvas;
  }
}
