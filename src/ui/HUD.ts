/**
 * High-Definition Tactical Floating Combat HUD
 * Seamless, modern gaming avionics without jarring division lines or border cages.
 * - Top Left: Player Hull Armor LED meter, Shield Cell, and Turbo Boost status
 * - Top Center: DEFCON Threat Intel, Enemies Remaining counter, and Sector Progression
 * - Top Right: Bastion Command Base Telemetry & Scrap salvage vault
 * - Bottom Center: Tactical Weapon Selector Dock (Keys 1-6 / Click / Wheel to switch)
 */

import { PlayerTank, WeaponType, WEAPON_REGISTRY } from '../entities/PlayerTank';
import { EagleBase } from '../entities/EagleBase';
import { playerInventory } from '../roguelite/Inventory';

export class HUD {
  private static radarAngle: number = 0;

  public static getWeaponSlotAt(width: number, height: number, x: number, y: number): WeaponType | null {
    const weaponKeys: WeaponType[] = ['standard', 'laser', 'tesla', 'vortex', 'napalm', 'cryo'];
    const slotW = 70;
    const slotH = 54;
    const gap = 8;
    const totalW = weaponKeys.length * slotW + (weaponKeys.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const startY = height - slotH - 12;

    if (y >= startY && y <= startY + slotH && x >= startX && x <= startX + totalW) {
      const relX = x - startX;
      const idx = Math.floor(relX / (slotW + gap));
      const inSlotX = relX % (slotW + gap);
      if (idx >= 0 && idx < weaponKeys.length && inSlotX <= slotW) {
        return weaponKeys[idx];
      }
    }
    return null;
  }

  public static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _arenaX: number,
    _arenaY: number,
    _arenaSize: number,
    player: PlayerTank,
    base: EagleBase,
    enemiesRemaining: number,
    currentFloor: number,
    isBossFight: boolean = false,
    themeName: string = '',
    autoAim: boolean = true
  ) {
    ctx.save();
    this.radarAngle = (this.radarAngle + 0.04) % (Math.PI * 2);

    // -------------------------------------------------------------
    // 1. TOP CENTER FLOATING INTEL POD
    // -------------------------------------------------------------
    const centerPodW = Math.min(380, width - 40);
    const centerPodH = 46;
    const centerPodX = (width - centerPodW) / 2;
    const centerPodY = 12;

    ctx.save();
    // Glassmorphic backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.beginPath();
    ctx.roundRect(centerPodX, centerPodY, centerPodW, centerPodH, 12);
    ctx.fill();
    ctx.strokeStyle = isBossFight ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top Header Center: Theater Title & Threat
    ctx.textAlign = 'center';
    if (isBossFight) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText('⚠ 决战：陆上巡洋舰「歌利亚」 ⚠', width / 2, centerPodY + 20);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText(`敌军剩余装甲: ${enemiesRemaining} 机`, width / 2, centerPodY + 20);
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px "Share Tech Mono", monospace';
    const sectorText = themeName ? `⬡ ${themeName} // ZONE ${currentFloor + 1} / 5 ⬡` : `ZONE ${currentFloor + 1} / 5`;
    ctx.fillText(sectorText, width / 2, centerPodY + 36);
    ctx.restore();

    // -------------------------------------------------------------
    // 2. TOP LEFT: TANK TELEMETRY POD (Hull, Shield, Boost)
    // -------------------------------------------------------------
    const leftPodW = 210;
    const leftPodH = 88;
    const leftPodX = 18;
    const leftPodY = 12;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.beginPath();
    ctx.roundRect(leftPodX, leftPodY, leftPodW, leftPodH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Player Hull bar
    const hpPct = Math.max(0, player.hp / player.maxHp);
    const hpColor = hpPct > 0.45 ? '#22c55e' : hpPct > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('HULL ARMOR', leftPodX + 12, leftPodY + 18);

    ctx.textAlign = 'right';
    ctx.fillStyle = hpColor;
    ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp}`, leftPodX + leftPodW - 12, leftPodY + 18);

    // HP Bar Track
    const barW = leftPodW - 24;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(leftPodX + 12, leftPodY + 22, barW, 8, 4);
    ctx.fill();

    ctx.fillStyle = hpColor;
    ctx.beginPath();
    ctx.roundRect(leftPodX + 12, leftPodY + 22, barW * hpPct, 8, 4);
    ctx.fill();

    // Shield Bar
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('SHIELD CORE', leftPodX + 12, leftPodY + 44);

    ctx.textAlign = 'right';
    const shieldPct = player.maxShield > 0 ? Math.max(0, player.shield / player.maxShield) : 0;
    ctx.fillText(`${Math.ceil(player.shield)} / ${player.maxShield}`, leftPodX + leftPodW - 12, leftPodY + 44);

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(leftPodX + 12, leftPodY + 48, barW, 6, 3);
    ctx.fill();

    if (shieldPct > 0) {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(leftPodX + 12, leftPodY + 48, barW * shieldPct, 6, 3);
      ctx.fill();
    }

    // Dash status
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    if (player.dashCooldown <= 0) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('⚡ 战术冲刺: 就绪 [SHIFT]', leftPodX + 12, leftPodY + 74);
    } else {
      const pct = Math.max(0, 1 - (player.dashCooldown / player.maxDashCooldown));
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`⚡ 冲刺充能 (${Math.round(pct * 100)}%)`, leftPodX + 12, leftPodY + 74);
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 3. TOP RIGHT: BASTION & REPUTATION STATUS POD
    // -------------------------------------------------------------
    const rightPodW = 200;
    const rightPodH = 88;
    const rightPodX = width - rightPodW - 18;
    const rightPodY = 12;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.beginPath();
    ctx.roundRect(rightPodX, rightPodY, rightPodW, rightPodH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eagle Base HP
    const baseHpPct = Math.max(0, base.hp / base.maxHp);
    const baseColor = baseHpPct > 0.5 ? '#38bdf8' : baseHpPct > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('EAGLE BASTION', rightPodX + 12, rightPodY + 18);

    ctx.textAlign = 'right';
    ctx.fillStyle = baseColor;
    ctx.fillText(`${Math.ceil(base.hp)} / ${base.maxHp}`, rightPodX + rightPodW - 12, rightPodY + 18);

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(rightPodX + 12, rightPodY + 22, rightPodW - 24, 8, 4);
    ctx.fill();

    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.roundRect(rightPodX + 12, rightPodY + 22, (rightPodW - 24) * baseHpPct, 8, 4);
    ctx.fill();

    // Scrap vault
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px "Share Tech Mono", monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`⚙ ${playerInventory.scraps} 废料零件`, rightPodX + 12, rightPodY + 50);

    // Auto-Aim Status Badge
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    if (autoAim) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('🎯 自动锁定: 开启 (T)', rightPodX + 12, rightPodY + 74);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🎯 手动瞄准: 开启 (T)', rightPodX + 12, rightPodY + 74);
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 4. BOTTOM CENTER: TACTICAL WEAPON SELECTOR DOCK
    // -------------------------------------------------------------
    const weaponKeys: WeaponType[] = ['standard', 'laser', 'tesla', 'vortex', 'napalm', 'cryo'];
    const slotW = 70;
    const slotH = 54;
    const gap = 8;
    const totalW = weaponKeys.length * slotW + (weaponKeys.length - 1) * gap;
    const dockX = (width - totalW) / 2;
    const dockY = height - slotH - 12;

    ctx.save();
    // Dock background tray
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.beginPath();
    ctx.roundRect(dockX - 8, dockY - 6, totalW + 16, slotH + 12, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    weaponKeys.forEach((wType, idx) => {
      const slotX = dockX + idx * (slotW + gap);
      const isSelected = player.currentWeapon === wType;
      const wInfo = WEAPON_REGISTRY[wType];

      ctx.save();
      // Slot Card
      if (isSelected) {
        ctx.fillStyle = 'rgba(14, 116, 144, 0.75)';
        ctx.shadowColor = wInfo.color;
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(slotX, dockY, slotW, slotH, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? wInfo.color : 'rgba(71, 85, 105, 0.5)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Hotkey badge
      ctx.font = 'bold 9px "Share Tech Mono", monospace';
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(`[${idx + 1}]`, slotX + 5, dockY + 12);

      // Weapon Icon
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(wInfo.icon, slotX + slotW / 2, dockY + 28);

      // Weapon Name
      ctx.font = 'bold 10px "Chakra Petch", system-ui, sans-serif';
      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.fillText(wInfo.nameZh.slice(0, 4), slotX + slotW / 2, dockY + 46);

      ctx.restore();
    });
    ctx.restore();

    ctx.restore();
  }
}
