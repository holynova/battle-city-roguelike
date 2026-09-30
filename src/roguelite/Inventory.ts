/**
 * Player Run Inventory & Progression Tracker
 * Tracks scraps, passive chips, and stacking weapon unlock & upgrades (Lv.1 to Lv.5)
 */

import { UpgradeChip, ALL_UPGRADES } from './Upgrades';

export class Inventory {
  public scraps: number = 0;
  public chips: Map<string, number> = new Map(); // chipId -> count
  public weapons: Map<string, number> = new Map([['standard', 1]]); // weaponType -> level (1..5)
  public kills: number = 0;
  public stage: number = 1;
  public starsCollected: number = 0; // Classic star level 0..3

  constructor() {
    this.reset();
  }

  public reset() {
    this.scraps = 25;
    this.chips.clear();
    this.weapons.clear();
    this.weapons.set('standard', 1);
    this.kills = 0;
    this.stage = 1;
    this.starsCollected = 0;
  }

  public addScrap(amount: number) {
    this.scraps += Math.max(0, amount);
  }

  public spendScrap(amount: number): boolean {
    if (this.scraps >= amount) {
      this.scraps -= amount;
      return true;
    }
    return false;
  }

  public addChip(chipId: string) {
    // If it's a weapon chip, handle weapon unlock / level-up!
    if (chipId.startsWith('weapon_')) {
      const wType = chipId.replace('weapon_', '');
      this.unlockOrUpgradeWeapon(wType);
    }
    const current = this.chips.get(chipId) || 0;
    this.chips.set(chipId, current + 1);
  }

  public hasChip(chipId: string): boolean {
    return (this.chips.get(chipId) || 0) > 0;
  }

  public getChipCount(chipId: string): number {
    return this.chips.get(chipId) || 0;
  }

  public getWeaponLevel(wType: string): number {
    return this.weapons.get(wType) || 0;
  }

  public unlockOrUpgradeWeapon(wType: string): { isNew: boolean; level: number } {
    const current = this.weapons.get(wType) || 0;
    if (current === 0) {
      this.weapons.set(wType, 1);
      return { isNew: true, level: 1 };
    } else {
      const next = Math.min(5, current + 1);
      this.weapons.set(wType, next);
      return { isNew: false, level: next };
    }
  }

  public getActiveChips(): { chip: UpgradeChip; count: number }[] {
    const list: { chip: UpgradeChip; count: number }[] = [];
    for (const [id, count] of this.chips.entries()) {
      const chip = ALL_UPGRADES.find(c => c.id === id);
      if (chip) list.push({ chip, count });
    }
    return list;
  }

  // Generate 3 random upgrade choices for battle victory
  public getRandomChoices(count: number = 3): UpgradeChip[] {
    const available = ALL_UPGRADES.filter(c => {
      // If weapon chip, allow up to level 5!
      if (c.id.startsWith('weapon_')) {
        const wType = c.id.replace('weapon_', '');
        const lvl = this.getWeaponLevel(wType);
        if (lvl >= 5) return false; // Max level reached
        return true;
      }

      // Don't repeat unique single-purchase non-stacking chips if already owned
      if ((c.id === 'steel_breaker' || c.id === 'hover_chassis' || c.id === 'eagle_point_defense' || c.id === 'eagle_nano_shield') && this.hasChip(c.id)) {
        return false;
      }
      return true;
    });

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    // Format card title & description dynamically for weapon upgrades
    return picked.map(chip => {
      if (chip.id.startsWith('weapon_')) {
        const wType = chip.id.replace('weapon_', '');
        const currentLvl = this.getWeaponLevel(wType);
        if (currentLvl > 0) {
          return {
            ...chip,
            nameZh: `【升级 Lv.${currentLvl + 1}】${chip.nameZh}`,
            descriptionZh: `强化武器性能：全伤害 +35%、冷却缩减 16%，并提升元素特效范围与持续时间（当前 Lv.${currentLvl} ➔ Lv.${currentLvl + 1}）！`
          };
        } else {
          return {
            ...chip,
            nameZh: `【新武器解锁】${chip.nameZh}`,
            descriptionZh: `获得并解锁全新主炮系统！` + chip.descriptionZh
          };
        }
      }
      return chip;
    });
  }
}

export const playerInventory = new Inventory();
