/**
 * Modern High-Definition Combat HUD
 * Overlays player armor, eagle bastion integrity, scrap currency, dash gauge, and wave progress.
 */

import { PlayerTank } from '../entities/PlayerTank';
import { EagleBase } from '../entities/EagleBase';
import { playerInventory } from '../roguelite/Inventory';

export class HUD {
  public static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: PlayerTank,
    base: EagleBase,
    enemiesRemaining: number,
    currentFloor: number,
    isBossFight: boolean = false,
    themeName: string = ''
  ) {
    ctx.save();

    // -------------------------------------------------------------
    // TOP STATUS BAR (Glassmorphism Dark Ribbon)
    // -------------------------------------------------------------
    const topBarH = 50;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, width, topBarH);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, topBarH);
    ctx.lineTo(width, topBarH);
    ctx.stroke();

    // 1. Player Health & Shield (Left)
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TANK HULL', 18, 18);

    // HP Bar
    const hpBarW = 120;
    const hpBarH = 10;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(18, 24, hpBarW, hpBarH);
    const hpPct = Math.max(0, player.hp / player.maxHp);
    ctx.fillStyle = hpPct > 0.35 ? '#22c55e' : '#ef4444';
    ctx.fillRect(18, 24, hpBarW * hpPct, hpBarH);

    // Shield Bar
    if (player.maxShield > 0) {
      const shieldPct = Math.max(0, player.shield / player.maxShield);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(18, 36, hpBarW * shieldPct, 4);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp}`, 144, 33);

    // 2. Eagle Bastion Health (Center Left)
    const eagleX = 220;
    ctx.fillStyle = base.hp <= 30 ? '#ef4444' : '#fbbf24';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('COMMAND BASTION', eagleX, 18);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(eagleX, 24, hpBarW, hpBarH);
    const baseHpPct = Math.max(0, base.hp / base.maxHp);
    ctx.fillStyle = baseHpPct > 0.35 ? '#eab308' : '#ef4444';
    ctx.fillRect(eagleX, 24, hpBarW * baseHpPct, hpBarH);

    if (base.maxShield > 0) {
      const baseShieldPct = Math.max(0, base.shield / base.maxShield);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(eagleX, 36, hpBarW * baseShieldPct, 4);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`${Math.ceil(base.hp)}%`, eagleX + hpBarW + 6, 33);

    // 3. Enemies Remaining / Boss Warning (Center)
    ctx.textAlign = 'center';
    if (isBossFight) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText('[ ⚠ 紧急战况：陆上巡洋舰「歌利亚」 ⚠ ]', width / 2, 20);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText(`敌军剩余装甲: ${enemiesRemaining} 机`, width / 2, 20);
    }

    // Tactical Theater Theme Banner
    if (themeName) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillText(`⬡ 战区: ${themeName} ⬡`, width / 2, 38);
    }

    // 4. Floor Progress & Scrap Currency (Right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`ZONE ${currentFloor + 1} / 5`, width - 20, 18);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(`${playerInventory.scraps} SCRAP`, width - 20, 36);

    // -------------------------------------------------------------
    // BOTTOM STATUS RIBBON (Dash Gauge & Active Chips)
    // -------------------------------------------------------------
    const bottomY = height - 36;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, bottomY, width, 36);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, bottomY);
    ctx.lineTo(width, bottomY);
    ctx.stroke();

    // Dash status
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px system-ui, sans-serif';
    if (player.dashCooldown <= 0) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('[SHIFT / 右键] DASH: READY', 20, bottomY + 22);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`[SHIFT] DASH: ${player.dashCooldown.toFixed(1)}s`, 20, bottomY + 22);
    }

    // Active Chips list
    ctx.textAlign = 'right';
    const chips = playerInventory.getActiveChips();
    if (chips.length > 0) {
      let badgeX = width - 20;
      for (let i = chips.length - 1; i >= 0; i--) {
        const item = chips[i];
        const label = `${item.chip.nameZh.slice(0, 4)}${item.count > 1 ? `×${item.count}` : ''}`;
        ctx.font = 'bold 11px system-ui, sans-serif';
        const txtW = ctx.measureText(label).width;

        // Background chip pill
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX - txtW - 12, bottomY + 8, txtW + 10, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(label, badgeX - 7, bottomY + 22);

        badgeX -= txtW + 18;
      }
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('NO UPGRADE CHIPS EQUIPPED', width - 20, bottomY + 22);
    }

    ctx.restore();
  }
}
