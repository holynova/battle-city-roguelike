/**
 * Player Run Inventory & Progression Tracker
 */

import { UpgradeChip, ALL_UPGRADES } from './Upgrades';

export class Inventory {
  public scraps: number = 0;
  public chips: Map<string, number> = new Map(); // chipId -> count
  public kills: number = 0;
  public stage: number = 1;
  public starsCollected: number = 0; // Classic star level 0..3

  constructor() {
    this.reset();
  }

  public reset() {
    this.scraps = 20;
    this.chips.clear();
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
    const current = this.chips.get(chipId) || 0;
    this.chips.set(chipId, current + 1);
  }

  public hasChip(chipId: string): boolean {
    return (this.chips.get(chipId) || 0) > 0;
  }

  public getChipCount(chipId: string): number {
    return this.chips.get(chipId) || 0;
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
      // Don't repeat unique single-purchase chips if already owned
      if ((c.id === 'steel_breaker' || c.id === 'railgun_laser' || c.id === 'mortar_siege' || c.id === 'hover_chassis' || c.id === 'eagle_point_defense' || c.id === 'eagle_nano_shield') && this.hasChip(c.id)) {
        return false;
      }
      return true;
    });

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

export const playerInventory = new Inventory();
