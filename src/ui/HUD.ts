/**
 * High-Definition Tactical Floating Combat HUD
 * Seamless, modern gaming avionics without jarring division lines or border cages.
 * - Top Center: Independent Grand Elite & Boss Health Bars with Phase & Title indicators
 * - Top Left: Player Hull Armor LED meter, Shield Cell, and Tactical Dash recharge meter
 * - Top Right: Bastion Command Base Telemetry & Scrap salvage vault
 * - Bottom Center: Tactical Weapon Selector Dock (Displays Unlock status & Stacking LV.1..5)
 */

import { PlayerTank, WeaponType, WEAPON_REGISTRY } from '../entities/PlayerTank';
import { EagleBase } from '../entities/EagleBase';
import { EliteTank } from '../entities/EliteTank';
import { BossTank } from '../entities/BossTank';
import { playerInventory } from '../roguelite/Inventory';

export class HUD {
  public static getWeaponSlotAt(width: number, height: number, x: number, y: number, player: PlayerTank): WeaponType | null {
    const weaponKeys: WeaponType[] = ['standard', 'laser', 'tesla', 'vortex', 'napalm', 'cryo'];
    const slotW = 72;
    const slotH = 56;
    const gap = 8;
    const totalW = weaponKeys.length * slotW + (weaponKeys.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const startY = height - slotH - 14;

    if (y >= startY && y <= startY + slotH && x >= startX && x <= startX + totalW) {
      const relX = x - startX;
      const idx = Math.floor(relX / (slotW + gap));
      const inSlotX = relX % (slotW + gap);
      if (idx >= 0 && idx < weaponKeys.length && inSlotX <= slotW) {
        const wType = weaponKeys[idx];
        if (player.unlockedWeapons.includes(wType)) {
          return wType;
        }
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
    autoAim: boolean = true,
    eliteEnemy: EliteTank | null = null,
    bossEnemy: BossTank | null = null
  ) {
    ctx.save();

    // -------------------------------------------------------------
    // 1. TOP CENTER: ELITE / BOSS GRAND HEALTH BAR OR INTEL POD
    // -------------------------------------------------------------
    if (bossEnemy && bossEnemy.isAlive) {
      // 👑 Goliath Grand Boss Bar
      const bossBarW = Math.min(520, width - 40);
      const bossBarH = 52;
      const bx = (width - bossBarW) / 2;
      const by = 12;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(bx, by, bossBarW, bossBarH, 12);
      ctx.fill();

      const phaseColor = bossEnemy.phase === 3 ? '#ef4444' : (bossEnemy.phase === 2 ? '#f59e0b' : '#38bdf8');
      ctx.strokeStyle = phaseColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Title & Phase
      ctx.font = 'bold 13px "Chakra Petch", system-ui, sans-serif';
      ctx.fillStyle = phaseColor;
      ctx.textAlign = 'left';
      ctx.fillText(`👑 陆上巡洋舰「歌利亚」MK-IV`, bx + 16, by + 20);

      ctx.textAlign = 'right';
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillText(`[ 阶 段  ${bossEnemy.phase} / 3 ]`, bx + bossBarW - 16, by + 20);

      // HP Bar
      const barInnerW = bossBarW - 32;
      const hpPct = Math.max(0, bossEnemy.hp / bossEnemy.maxHp);
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(bx + 16, by + 26, barInnerW, 10, 5);
      ctx.fill();

      const hpGrad = ctx.createLinearGradient(bx + 16, 0, bx + 16 + barInnerW, 0);
      hpGrad.addColorStop(0, '#ef4444');
      hpGrad.addColorStop(0.5, '#f59e0b');
      hpGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = hpGrad;
      ctx.beginPath();
      ctx.roundRect(bx + 16, by + 26, barInnerW * hpPct, 10, 5);
      ctx.fill();

      // Shield overlay
      if (bossEnemy.shield > 0) {
        const sPct = Math.max(0, bossEnemy.shield / bossEnemy.maxShield);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(bx + 16, by + 38, barInnerW * sPct, 4, 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (eliteEnemy && eliteEnemy.isAlive) {
      // ☠ Elite Commander Grand Bar
      const eliteBarW = Math.min(480, width - 40);
      const eliteBarH = 48;
      const ex = (width - eliteBarW) / 2;
      const ey = 12;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(ex, ey, eliteBarW, eliteBarH, 12);
      ctx.fill();

      ctx.strokeStyle = eliteEnemy.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 13px "Chakra Petch", system-ui, sans-serif';
      ctx.fillStyle = eliteEnemy.color;
      ctx.textAlign = 'left';
      ctx.fillText(`☠ ${eliteEnemy.titleZh} · ${eliteEnemy.nameZh}`, ex + 16, ey + 18);

      ctx.textAlign = 'right';
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillText(`${Math.ceil(eliteEnemy.hp)} / ${eliteEnemy.maxHp} HP`, ex + eliteBarW - 16, ey + 18);

      const barInnerW = eliteBarW - 32;
      const hpPct = Math.max(0, eliteEnemy.hp / eliteEnemy.maxHp);
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(ex + 16, ey + 24, barInnerW, 9, 4);
      ctx.fill();

      ctx.fillStyle = eliteEnemy.color;
      ctx.beginPath();
      ctx.roundRect(ex + 16, ey + 24, barInnerW * hpPct, 9, 4);
      ctx.fill();

      if (eliteEnemy.shield > 0) {
        const sPct = Math.max(0, eliteEnemy.shield / eliteEnemy.maxShield);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(ex + 16, ey + 35, barInnerW * sPct, 4, 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      // Normal Zone Intel Pod
      const centerPodW = Math.min(380, width - 40);
      const centerPodH = 46;
      const centerPodX = (width - centerPodW) / 2;
      const centerPodY = 12;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.beginPath();
      ctx.roundRect(centerPodX, centerPodY, centerPodW, centerPodH, 12);
      ctx.fill();
      ctx.strokeStyle = isBossFight ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px "Chakra Petch", system-ui, sans-serif';
      ctx.fillText(`敌军剩余装甲: ${enemiesRemaining} 机`, width / 2, centerPodY + 20);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      const sectorText = themeName ? `⬡ ${themeName} // FLOOR ${currentFloor + 1} / 16 ⬡` : `FLOOR ${currentFloor + 1} / 16`;
      ctx.fillText(sectorText, width / 2, centerPodY + 36);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // 2. TOP LEFT: TANK TELEMETRY POD (Hull, Shield, Tactical Dash)
    // -------------------------------------------------------------
    const leftPodW = 215;
    const leftPodH = 92;
    const leftPodX = 18;
    const leftPodY = 12;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
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

    // Tactical Dodge Dash status
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    if (player.dashCooldown <= 0) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('⚡ 战术闪避: 就绪 [SHIFT/右键]', leftPodX + 12, leftPodY + 76);
    } else {
      const pct = Math.max(0, 1 - (player.dashCooldown / player.maxDashCooldown));
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`⚡ 闪避充能中 (${Math.round(pct * 100)}%)`, leftPodX + 12, leftPodY + 76);
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 3. TOP RIGHT: BASTION & REPUTATION STATUS POD
    // -------------------------------------------------------------
    const rightPodW = 205;
    const rightPodH = 92;
    const rightPodX = width - rightPodW - 18;
    const rightPodY = 12;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
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
      ctx.fillText('🎯 自动瞄准开火: 开启 (T)', rightPodX + 12, rightPodY + 76);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🎯 手动瞄准开火: 开启 (T)', rightPodX + 12, rightPodY + 76);
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 4. BOTTOM CENTER: TACTICAL WEAPON DOCK (Unlocks & Stacking Lv.1..5)
    // -------------------------------------------------------------
    const weaponKeys: WeaponType[] = ['standard', 'laser', 'tesla', 'vortex', 'napalm', 'cryo'];
    const slotW = 72;
    const slotH = 56;
    const gap = 8;
    const totalW = weaponKeys.length * slotW + (weaponKeys.length - 1) * gap;
    const dockX = (width - totalW) / 2;
    const dockY = height - slotH - 14;

    ctx.save();
    // Dock background tray
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.beginPath();
    ctx.roundRect(dockX - 8, dockY - 6, totalW + 16, slotH + 12, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    weaponKeys.forEach((wType, idx) => {
      const slotX = dockX + idx * (slotW + gap);
      const isUnlocked = player.unlockedWeapons.includes(wType);
      const isSelected = isUnlocked && player.currentWeapon === wType;
      const wInfo = WEAPON_REGISTRY[wType];
      const level = player.getWeaponLevel(wType);

      ctx.save();
      // Slot Card
      if (isSelected) {
        ctx.fillStyle = 'rgba(14, 116, 144, 0.85)';
        ctx.shadowColor = wInfo.color;
        ctx.shadowBlur = 14;
      } else if (isUnlocked) {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.shadowBlur = 0;
      } else {
        // Locked Weapon
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(slotX, dockY, slotW, slotH, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? wInfo.color : (isUnlocked ? 'rgba(71, 85, 105, 0.6)' : 'rgba(51, 65, 85, 0.35)');
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.stroke();

      if (isUnlocked) {
        // Hotkey badge
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(`[${idx + 1}]`, slotX + 5, dockY + 12);

        // Stacking Upgrade Level Badge (e.g. LV.1 .. LV.5)
        ctx.textAlign = 'right';
        ctx.fillStyle = level >= 3 ? '#facc15' : '#38bdf8';
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.fillText(`Lv.${level}`, slotX + slotW - 5, dockY + 12);

        // Weapon Icon
        ctx.font = '16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(wInfo.icon, slotX + slotW / 2, dockY + 29);

        // Weapon Name
        ctx.font = 'bold 10px "Chakra Petch", system-ui, sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.fillText(wInfo.nameZh.slice(0, 4), slotX + slotW / 2, dockY + 47);
      } else {
        // Locked Weapon Display
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'left';
        ctx.fillText(`[${idx + 1}]`, slotX + 5, dockY + 12);

        ctx.font = '14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', slotX + slotW / 2, dockY + 29);

        ctx.font = 'bold 9px "Chakra Petch", system-ui, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('3选1解锁', slotX + slotW / 2, dockY + 47);
      }

      ctx.restore();
    });
    ctx.restore();

    ctx.restore();
  }
}
