/**
 * High-Definition Particle and Visual FX System
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation?: number;
  vRot?: number;
  shape?: 'circle' | 'debris' | 'spark' | 'smoke' | 'ring' | 'casing';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface TreadMark {
  x: number;
  y: number;
  angle: number;
  alpha: number;
  width: number;
}

export interface ScorchMark {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

export class ParticleFX {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public treadMarks: TreadMark[] = [];
  public scorchMarks: ScorchMark[] = [];

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.vRot !== undefined && p.rotation !== undefined) {
        p.rotation += p.vRot * dt;
      }

      // Drag / friction
      p.vx *= Math.pow(0.92, dt * 60);
      p.vy *= Math.pow(0.92, dt * 60);

      if (p.shape === 'smoke') {
        p.size += 15 * dt; // Smoke expands as it fades
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 30 * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / ft.maxLife);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Fade tread marks and scorch marks slowly
    for (let i = this.treadMarks.length - 1; i >= 0; i--) {
      const tm = this.treadMarks[i];
      tm.alpha -= 0.05 * dt;
      if (tm.alpha <= 0) {
        this.treadMarks.splice(i, 1);
      }
    }

    for (let i = this.scorchMarks.length - 1; i >= 0; i--) {
      const sm = this.scorchMarks[i];
      sm.alpha -= 0.015 * dt;
      if (sm.alpha <= 0) {
        this.scorchMarks.splice(i, 1);
      }
    }
  }

  // Draw ground decals (scorch craters & tread marks) under entities
  public renderGroundDecals(ctx: CanvasRenderingContext2D) {
    // 1. Scorch marks / blast craters
    for (const sm of this.scorchMarks) {
      ctx.save();
      const grad = ctx.createRadialGradient(sm.x, sm.y, 2, sm.x, sm.y, sm.r);
      grad.addColorStop(0, `rgba(10, 8, 7, ${sm.alpha * 0.75})`);
      grad.addColorStop(0.6, `rgba(28, 25, 23, ${sm.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Tread marks
    for (const tm of this.treadMarks) {
      ctx.save();
      ctx.translate(tm.x, tm.y);
      ctx.rotate(tm.angle);
      ctx.fillStyle = `rgba(18, 16, 14, ${tm.alpha * 0.35})`;
      // Left track
      ctx.fillRect(-tm.width / 2, -4, 6, 8);
      // Right track
      ctx.fillRect(tm.width / 2 - 6, -4, 6, 8);
      ctx.restore();
    }
  }

  // Draw particles and floating texts above entities
  public renderVFX(ctx: CanvasRenderingContext2D) {
    // Render particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, p.size * 0.15);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'debris') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      } else if (p.shape === 'casing') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        // Ejected brass shell casing
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-p.size, -p.size * 0.4, 2, p.size * 0.8);
      } else if (p.shape === 'spark') {
        ctx.translate(p.x, p.y);
        const speed = Math.hypot(p.vx, p.vy);
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2 + speed * 0.04, p.size * 0.8);
      } else if (p.shape === 'smoke') {
        const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'rgba(30, 30, 30, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard circle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render floating combat text
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // Spawn tank tread track
  public addTreadMark(x: number, y: number, angle: number, width: number = 32) {
    if (this.treadMarks.length > 200) {
      this.treadMarks.shift();
    }
    this.treadMarks.push({ x, y, angle, alpha: 1.0, width });
  }

  // Spawn muzzle flash
  public spawnMuzzleFlash(x: number, y: number, angle: number, color: string = '#fef08a') {
    // Flash shock ring
    this.particles.push({
      x, y, vx: 0, vy: 0,
      size: 8, color, alpha: 1.0, life: 0.08, maxLife: 0.08, shape: 'ring'
    });

    // Sparks forward
    const forwardX = Math.cos(angle);
    const forwardY = Math.sin(angle);
    for (let i = 0; i < 6; i++) {
      const spread = (Math.random() - 0.5) * 0.4;
      const speed = 120 + Math.random() * 160;
      this.particles.push({
        x: x + forwardX * 4,
        y: y + forwardY * 4,
        vx: (forwardX * Math.cos(spread) - forwardY * Math.sin(spread)) * speed,
        vy: (forwardX * Math.sin(spread) + forwardY * Math.cos(spread)) * speed,
        size: 2.5,
        color: '#ffedd5',
        alpha: 1.0,
        life: 0.12,
        maxLife: 0.12,
        shape: 'spark'
      });
    }

    // Gun smoke
    this.particles.push({
      x, y,
      vx: forwardX * 25 + (Math.random() - 0.5) * 10,
      vy: forwardY * 25 + (Math.random() - 0.5) * 10,
      size: 6,
      color: 'rgba(180, 180, 180, 0.4)',
      alpha: 0.7,
      life: 0.35,
      maxLife: 0.35,
      shape: 'smoke'
    });
  }

  // Spawn brick shattering debris
  public spawnBrickDebris(x: number, y: number) {
    const debrisColors = ['#c2410c', '#9a3412', '#7c2d12', '#44403c'];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
        alpha: 1.0,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 15,
        shape: 'debris'
      });
    }
  }

  // Steel ricochet sparks
  public spawnRicochetSparks(x: number, y: number, normalAngle: number) {
    for (let i = 0; i < 8; i++) {
      const spread = (Math.random() - 0.5) * 1.2;
      const angle = normalAngle + spread;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2,
        color: '#fef08a',
        alpha: 1.0,
        life: 0.15 + Math.random() * 0.15,
        maxLife: 0.3,
        shape: 'spark'
      });
    }
  }

  // Massive explosion (tanks, boss, eagle base)
  public spawnExplosion(x: number, y: number, isLarge: boolean = false) {
    const scale = isLarge ? 2.0 : 1.0;

    // Shockwave ring
    this.particles.push({
      x, y, vx: 0, vy: 0,
      size: 15 * scale,
      color: '#f97316',
      alpha: 1.0,
      life: 0.25 * scale,
      maxLife: 0.25 * scale,
      shape: 'ring'
    });

    // Fireball particles
    const fireColors = ['#fef08a', '#fb923c', '#ef4444', '#b91c1c'];
    const count = isLarge ? 30 : 16;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 180) * scale;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10 * scale,
        y: y + (Math.random() - 0.5) * 10 * scale,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (8 + Math.random() * 14) * scale,
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
        alpha: 1.0,
        life: 0.3 + Math.random() * 0.35,
        maxLife: 0.65,
        shape: 'circle'
      });
    }

    // Heavy black smoke clouds
    for (let i = 0; i < (isLarge ? 16 : 8); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (20 + Math.random() * 60) * scale;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (12 + Math.random() * 18) * scale,
        color: 'rgba(28, 25, 23, 0.7)',
        alpha: 0.85,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        shape: 'smoke'
      });
    }

    // High velocity sparks
    for (let i = 0; i < (isLarge ? 24 : 12); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (150 + Math.random() * 250) * scale;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 * scale,
        color: '#ffedd5',
        alpha: 1.0,
        life: 0.2 + Math.random() * 0.3,
        maxLife: 0.5,
        shape: 'spark'
      });
    }

    // Leave a persistent scorched blast crater on the ground
    this.addScorchMark(x, y, isLarge ? 36 : 22);
  }

  // Add persistent scorch crater decal
  public addScorchMark(x: number, y: number, r: number = 22) {
    if (this.scorchMarks.length > 80) {
      this.scorchMarks.shift();
    }
    this.scorchMarks.push({ x, y, r, alpha: 1.0 });
  }

  // Eject brass spent shell casing
  public ejectShellCasing(x: number, y: number, turretAngle: number) {
    const ejectAngle = turretAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    const speed = 80 + Math.random() * 60;
    this.particles.push({
      x, y,
      vx: Math.cos(ejectAngle) * speed,
      vy: Math.sin(ejectAngle) * speed,
      size: 4,
      color: '#facc15',
      alpha: 1.0,
      life: 2.0,
      maxLife: 2.0,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 25,
      shape: 'casing'
    });
  }

  // Floating text
  public spawnFloatingText(x: number, y: number, text: string, color: string = '#facc15') {
    this.floatingTexts.push({
      x, y, text, color, alpha: 1.0, life: 0.8, maxLife: 0.8
    });
  }
}
