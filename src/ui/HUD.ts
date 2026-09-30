/**
 * High-Definition Tactical Avionics Combat HUD
 * Transforms the entire canvas into an authentic military mecha cockpit & arcade cabinet:
 * - Left Wing: Player Hull LED segmented meter, Shield cell, Turbo Dash reactor, Cannon caliber, and Installed Modules rack
 * - Center Viewport: Heavy chamfered ballistic bezel with caution hazard chevrons and corner hex bolts
 * - Right Wing: Command Bastion live telemetry, animated sweep radar threat scanner, sector environmental intel, scrap salvage vault, and control schematics
 * - Top Bulkhead: DEFCON status, mission theater banner, and zone progression
 */

import { PlayerTank } from '../entities/PlayerTank';
import { EagleBase } from '../entities/EagleBase';
import { playerInventory } from '../roguelite/Inventory';
import { getRarityColor } from '../roguelite/Upgrades';

export class HUD {
  private static radarAngle: number = 0;

  public static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    arenaX: number,
    arenaY: number,
    arenaSize: number,
    player: PlayerTank,
    base: EagleBase,
    enemiesRemaining: number,
    currentFloor: number,
    isBossFight: boolean = false,
    themeName: string = ''
  ) {
    ctx.save();
    this.radarAngle = (this.radarAngle + 0.04) % (Math.PI * 2);

    const hasWings = arenaX >= 140;

    // -------------------------------------------------------------
    // 1. TOP COMMAND BULKHEAD STRIPE
    // -------------------------------------------------------------
    const topH = 50;
    const grad = ctx.createLinearGradient(0, 0, 0, topH);
    grad.addColorStop(0, '#1a2234');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#080c14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, topH);

    // Hazard bottom accent border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, topH);
    ctx.lineTo(width, topH);
    ctx.stroke();

    // Top Header Left: DEFCON & Console status
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(20, 25, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 12px "Share Tech Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('SYS // DEFCON-1 ENGAGED', 32, 22);

    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('FREQ: 142.80 MHz // SECURE LINK', 32, 36);

    // Top Header Center: Theater Title & Squad threat
    ctx.textAlign = 'center';
    if (isBossFight) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 15px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText('[ ⚠ 紧急战况：陆上巡洋舰「歌利亚」决战 ⚠ ]', width / 2, 22);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText(`敌军剩余装甲: ${enemiesRemaining} 机`, width / 2, 22);
    }

    if (themeName) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillText(`⬡ 战区: ${themeName} ⬡`, width / 2, 38);
    }

    // Top Header Right: Zone & Salvage
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px "Chakra Petch", system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`ZONE ${currentFloor + 1} / 5`, width - 20, 20);

    ctx.font = 'bold 13px "Share Tech Mono", monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`⚙ ${playerInventory.scraps} SCRAP`, width - 20, 36);

    // -------------------------------------------------------------
    // 2. ARENA VIEWPORT HEAVY INDUSTRIAL FRAMING
    // -------------------------------------------------------------
    ctx.save();
    // Bezel shadow and outer steel casing
    const bPad = 6;
    const bx = arenaX - bPad;
    const by = arenaY - bPad;
    const bw = arenaSize + bPad * 2;
    const bh = arenaSize + bPad * 2;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);

    // High-tech Cyan/Steel Bezel border
    ctx.strokeStyle = isBossFight ? '#ef4444' : '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Corner Hex Bolts
    const boltCorners = [
      [bx - 8, by - 8],
      [bx + bw + 8, by - 8],
      [bx - 8, by + bh + 8],
      [bx + bw + 8, by + bh + 8]
    ];
    for (const [x, y] of boltCorners) {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Top Bezel Hazard Chevrons (Yellow/Black striped bar)
    const stripeW = 80;
    const stripeX = arenaX + (arenaSize - stripeW) / 2;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(stripeX, by - 5, stripeW, 4);
    ctx.fillStyle = '#000000';
    for (let s = 0; s < stripeW; s += 10) {
      ctx.beginPath();
      ctx.moveTo(stripeX + s, by - 5);
      ctx.lineTo(stripeX + s + 5, by - 5);
      ctx.lineTo(stripeX + s + 2, by - 1);
      ctx.lineTo(stripeX + s - 3, by - 1);
      ctx.fill();
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 3. LEFT AVIONICS WING: TANK TELEMETRY
    // -------------------------------------------------------------
    if (hasWings) {
      const leftW = arenaX - 16;
      const lx = 8;
      const ly = topH + 8;
      const lh = height - ly - 8;

      // Instrument Panel Box
      ctx.fillStyle = 'rgba(11, 17, 32, 0.92)';
      ctx.fillRect(lx, ly, leftW, lh);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lx, ly, leftW, lh);

      // Panel Header
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lx, ly, leftW, 26);
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('// TNK-01 TELEMETRY', lx + 8, ly + 18);

      let curY = ly + 40;

      // Section A: Hull Armor
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('HULL INTEGRITY', lx + 8, curY);

      curY += 8;
      const barW = leftW - 16;
      const barH = 14;

      // Background segment track
      ctx.fillStyle = '#090d16';
      ctx.fillRect(lx + 8, curY, barW, barH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(lx + 8, curY, barW, barH);

      // 10 Segments
      const hpPct = Math.max(0, player.hp / player.maxHp);
      const segCount = 10;
      const segW = (barW - 4) / segCount;
      const filledSegs = Math.round(hpPct * segCount);

      const hpColor = hpPct > 0.45 ? '#22c55e' : hpPct > 0.2 ? '#f59e0b' : '#ef4444';
      for (let i = 0; i < filledSegs; i++) {
        ctx.fillStyle = hpColor;
        ctx.fillRect(lx + 10 + i * segW, curY + 2, segW - 2, barH - 4);
      }

      curY += barH + 12;
      ctx.font = 'bold 12px "Share Tech Mono", monospace';
      ctx.fillStyle = hpColor;
      ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp} HP`, lx + 8, curY);

      // Section B: Energy Shield
      curY += 18;
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('SHIELD CORE', lx + 8, curY);

      curY += 8;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(lx + 8, curY, barW, 8);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(lx + 8, curY, barW, 8);

      if (player.maxShield > 0) {
        const shieldPct = Math.max(0, player.shield / player.maxShield);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(lx + 10, curY + 2, (barW - 4) * shieldPct, 4);
        curY += 18;
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${Math.ceil(player.shield)} / ${player.maxShield} SHIELD`, lx + 8, curY);
      } else {
        curY += 18;
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillStyle = '#475569';
        ctx.fillText('NO SHIELD GENERATOR', lx + 8, curY);
      }

      // Section C: Turbo Dash Reactor
      curY += 20;
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('TURBO BOOST [SHIFT]', lx + 8, curY);

      curY += 8;
      if (player.dashCooldown <= 0) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(lx + 8, curY, barW, 20);
        ctx.strokeStyle = '#22c55e';
        ctx.strokeRect(lx + 8, curY, barW, 20);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ BOOST READY', lx + 8 + barW / 2, curY + 14);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(lx + 8, curY, barW, 20);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(lx + 8, curY, barW, 20);

        const cdRatio = Math.max(0, 1 - player.dashCooldown / 2.5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(lx + 10, curY + 2, (barW - 4) * cdRatio, 16);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`CHARGING ${player.dashCooldown.toFixed(1)}s`, lx + 8 + barW / 2, curY + 14);
        ctx.textAlign = 'left';
      }

      // Section D: Main Gun Tier
      curY += 34;
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`MAIN CANNON MK-${playerInventory.starsCollected + 1}`, lx + 8, curY);

      curY += 14;
      let stars = '';
      for (let s = 0; s <= playerInventory.starsCollected; s++) stars += '★ ';
      ctx.font = 'bold 14px "Share Tech Mono", monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(stars, lx + 8, curY);

      // Section E: Mounted Roguelike Modules Rack
      curY += 26;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lx + 8, curY, barW, 18);
      ctx.font = 'bold 10px "Share Tech Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('MOUNTED MODULES', lx + 12, curY + 13);

      curY += 24;
      const chips = playerInventory.getActiveChips();
      if (chips.length > 0) {
        for (let i = 0; i < Math.min(chips.length, 5); i++) {
          const item = chips[i];
          const rColor = getRarityColor(item.chip.rarity);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(lx + 8, curY, barW, 22);
          ctx.strokeStyle = rColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(lx + 8, curY, barW, 22);

          // Dot
          ctx.fillStyle = rColor;
          ctx.beginPath();
          ctx.arc(lx + 16, curY + 11, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 11px "Chakra Petch", sans-serif';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(item.chip.nameZh.slice(0, 5), lx + 24, curY + 15);

          if (item.count > 1) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 10px "Share Tech Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`×${item.count}`, lx + barW + 4, curY + 15);
            ctx.textAlign = 'left';
          }

          curY += 26;
        }
      } else {
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillStyle = '#475569';
        ctx.fillText('NO MODULES', lx + 8, curY + 10);
      }
    }

    // -------------------------------------------------------------
    // 4. RIGHT COMMAND & RECON WING
    // -------------------------------------------------------------
    if (hasWings) {
      const rx = arenaX + arenaSize + 8;
      const rw = width - rx - 8;
      const ry = topH + 8;
      const rh = height - ry - 8;

      ctx.fillStyle = 'rgba(11, 17, 32, 0.92)';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rx, ry, rw, rh);

      // Panel Header
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx, ry, rw, 26);
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.fillText('// HQ RECON COMMAND', rx + 8, ry + 18);

      let rCurY = ry + 40;

      // Section A: Command Bastion
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText('EAGLE BASTION', rx + 8, rCurY);

      rCurY += 8;
      const rBarW = rw - 16;
      const rBarH = 14;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(rx + 8, rCurY, rBarW, rBarH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx + 8, rCurY, rBarW, rBarH);

      const bHpPct = Math.max(0, base.hp / base.maxHp);
      const bColor = bHpPct > 0.4 ? '#eab308' : '#ef4444';
      ctx.fillStyle = bColor;
      ctx.fillRect(rx + 10, rCurY + 2, (rBarW - 4) * bHpPct, rBarH - 4);

      rCurY += rBarH + 12;
      ctx.font = 'bold 12px "Share Tech Mono", monospace';
      ctx.fillStyle = bColor;
      ctx.fillText(`${Math.ceil(base.hp)}% INTEGRITY`, rx + 8, rCurY);

      // Point Defense Status
      rCurY += 18;
      ctx.font = '10px "Share Tech Mono", monospace';
      if (base.hasPointDefense) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('• GATLING TURRET: ARMED', rx + 8, rCurY);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText('• GATLING TURRET: OFFLINE', rx + 8, rCurY);
      }

      // Section B: Animated Sweep Threat Radar
      rCurY += 28;
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('TACTICAL RADAR', rx + 8, rCurY);

      rCurY += 10;
      const radarCenterX = rx + rw / 2;
      const radarRadius = Math.min(36, rw / 2 - 12);
      const radarCenterY = rCurY + radarRadius;

      // Radar Screen Circle
      ctx.fillStyle = '#02101e';
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Radar Concentric grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(radarCenterX - radarRadius, radarCenterY);
      ctx.lineTo(radarCenterX + radarRadius, radarCenterY);
      ctx.moveTo(radarCenterX, radarCenterY - radarRadius);
      ctx.lineTo(radarCenterX, radarCenterY + radarRadius);
      ctx.stroke();

      // Rotating Sweep Beam
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.lineTo(
        radarCenterX + Math.cos(this.radarAngle) * radarRadius,
        radarCenterY + Math.sin(this.radarAngle) * radarRadius
      );
      ctx.stroke();

      // Mock Enemy Blips on Radar
      const blip1 = (this.radarAngle + 1.2) % (Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(radarCenterX + Math.cos(blip1) * (radarRadius * 0.7), radarCenterY + Math.sin(blip1) * (radarRadius * 0.7), 2.5, 0, Math.PI * 2);
      ctx.fill();

      rCurY = radarCenterY + radarRadius + 14;
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`THREAT: ${enemiesRemaining} UNITS`, rx + 8, rCurY);

      // Section C: Environmental Intel
      rCurY += 24;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx + 8, rCurY, rBarW, 18);
      ctx.font = 'bold 10px "Share Tech Mono", monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('SECTOR INTEL', rx + 12, rCurY + 13);

      rCurY += 26;
      ctx.font = '11px "Chakra Petch", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(themeName ? themeName.split(' ')[0] : '标准战区', rx + 8, rCurY);

      // Section D: Pilot Controls Quick Ref
      rCurY = rh - 80;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(rx + 8, rCurY, rBarW, 72);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx + 8, rCurY, rBarW, 72);

      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('CONTROLS:', rx + 12, rCurY + 16);
      ctx.fillText('• WASD: 机动行驶', rx + 12, rCurY + 30);
      ctx.fillText('• MOUSE: 360° 瞄准', rx + 12, rCurY + 44);
      ctx.fillText('• SPACE/L-CLK: 开火', rx + 12, rCurY + 58);
    }

    // -------------------------------------------------------------
    // 5. COMPACT OVERLAY FALLBACK (FOR NARROW / MOBILE SCREENS)
    // -------------------------------------------------------------
    if (!hasWings) {
      const bY = height - 40;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, bY, width, 40);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, bY, width, 40);

      ctx.font = 'bold 12px "Share Tech Mono", monospace';
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`HULL: ${Math.ceil(player.hp)}/${player.maxHp}`, 16, bY + 24);

      ctx.fillStyle = '#facc15';
      ctx.fillText(`BASE: ${Math.ceil(base.hp)}%`, 140, bY + 24);

      if (player.dashCooldown <= 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('[SHIFT] DASH READY', 240, bY + 24);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`[SHIFT] ${player.dashCooldown.toFixed(1)}s`, 240, bY + 24);
      }
    }

    ctx.restore();
  }
}
