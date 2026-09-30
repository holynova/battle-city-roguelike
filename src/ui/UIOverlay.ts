/**
 * UI Overlay Manager
 * Controls modern glassmorphism modal dialogs for Card Drafting, Campaign Map, Shop, Events, and Victory/Defeat.
 */

import { UpgradeChip, getRarityColor, ALL_UPGRADES } from '../roguelite/Upgrades';
import { playerInventory } from '../roguelite/Inventory';
import { campaignMap, MapNode } from '../roguelite/CampaignMap';
import { sounds } from '../audio/SoundEffects';

export class UIOverlay {
  private container: HTMLElement;

  constructor() {
    let el = document.getElementById('ui-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ui-overlay';
      document.body.appendChild(el);
    }
    this.container = el;
    this.injectStyles();
  }

  private injectStyles() {
    if (document.getElementById('ui-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'ui-overlay-styles';
    style.textContent = `
      #ui-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        color: #f8fafc;
        user-select: none;
      }
      .modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(10, 15, 29, 0.88);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        animation: fadeIn 0.25s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to { opacity: 1; transform: scale(1); }
      }
      .modal-box {
        max-width: 900px;
        width: 92%;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15);
        padding: 32px;
        text-align: center;
      }
      .modal-title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: 1px;
        margin-bottom: 6px;
        background: linear-gradient(135deg, #f8fafc, #94a3b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .modal-subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin-bottom: 28px;
      }
      /* Card Selection */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 16px;
      }
      .upgrade-card {
        background: rgba(30, 41, 59, 0.8);
        border-radius: 14px;
        padding: 24px 20px;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        overflow: hidden;
      }
      .upgrade-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
      }
      .card-rarity {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 3px 10px;
        border-radius: 999px;
        margin-bottom: 12px;
      }
      .card-icon {
        font-size: 44px;
        margin-bottom: 12px;
      }
      .card-name {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
        color: #ffffff;
      }
      .card-desc {
        font-size: 13px;
        color: #cbd5e1;
        line-height: 1.5;
        margin-top: 4px;
      }
      /* Map View */
      .map-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        padding: 20px 0;
      }
      .map-floor-row {
        display: flex;
        gap: 40px;
        justify-content: center;
      }
      .map-node-btn {
        width: 76px;
        height: 76px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #1e293b;
        border: 2px solid #475569;
        cursor: not-allowed;
        opacity: 0.45;
        transition: all 0.2s;
        font-size: 22px;
      }
      .map-node-btn.available {
        cursor: pointer;
        opacity: 1;
        border-color: #22c55e;
        box-shadow: 0 0 18px rgba(34, 197, 94, 0.4);
        transform: scale(1.08);
        animation: pulseGreen 1.5s infinite;
      }
      .map-node-btn.visited {
        opacity: 0.3;
        border-color: #64748b;
      }
      .map-node-btn.current {
        border-color: #38bdf8;
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.6);
      }
      .map-node-label {
        font-size: 11px;
        font-weight: 600;
        margin-top: 2px;
        color: #f1f5f9;
      }
      @keyframes pulseGreen {
        0%, 100% { transform: scale(1.08); box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        50% { transform: scale(1.14); box-shadow: 0 0 25px rgba(34, 197, 94, 0.8); }
      }
      /* Buttons */
      .btn-primary {
        background: linear-gradient(135deg, #0284c7, #0369a1);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 12px 28px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
      }
      .btn-primary:hover {
        background: linear-gradient(135deg, #0369a1, #075985);
        transform: translateY(-2px);
      }
      .btn-secondary {
        background: #334155;
        color: #f8fafc;
        border: 1px solid #475569;
        border-radius: 10px;
        padding: 10px 22px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-secondary:hover {
        background: #475569;
      }
      /* Shop item */
      .shop-item {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        text-align: left;
      }
    `;
    document.head.appendChild(style);
  }

  public clear() {
    this.container.innerHTML = '';
  }

  // -------------------------------------------------------------
  // CARD SELECTION MODAL (Three-Pick-One Roguelite Draft)
  // -------------------------------------------------------------
  public showCardDraft(onSelect: (chip: UpgradeChip) => void) {
    sounds.playVictory();
    const choices = playerInventory.getRandomChoices(3);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal-box';

    box.innerHTML = `
      <div class="modal-title">⭐ 战地整备：三选一科技改装 ⭐</div>
      <div class="modal-subtitle">从击破敌军获取的原型配件中挑选一件强化你的战车</div>
      <div class="cards-grid" id="cards-container"></div>
    `;

    const grid = box.querySelector('#cards-container')!;

    choices.forEach((chip) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      const rColor = getRarityColor(chip.rarity);
      card.style.border = `2px solid ${rColor}`;

      card.innerHTML = `
        <span class="card-rarity" style="background: ${rColor}33; color: ${rColor}; border: 1px solid ${rColor}">
          ${chip.rarity.toUpperCase()}
        </span>
        <div class="card-icon">${chip.icon}</div>
        <div class="card-name">${chip.nameZh}</div>
        <div class="card-desc">${chip.descriptionZh}</div>
      `;

      card.onclick = () => {
        sounds.playPowerup();
        playerInventory.addChip(chip.id);
        this.clear();
        onSelect(chip);
      };

      grid.appendChild(card);
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // STRATEGIC CAMPAIGN MAP MODAL
  // -------------------------------------------------------------
  public showCampaignMap(onNodeSelected: (node: MapNode) => void) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal-box';

    box.innerHTML = `
      <div class="modal-title">🗺️ 战役战略行进图 (CAMPAIGN MAP)</div>
      <div class="modal-subtitle">选择前进的作战战区，步步为营逼近最终钢铁要塞</div>
      <div class="map-container" id="map-tree"></div>
    `;

    const mapTree = box.querySelector('#map-tree')!;

    // Render from Boss floor down to Floor 0
    for (let f = campaignMap.floors.length - 1; f >= 0; f--) {
      const row = document.createElement('div');
      row.className = 'map-floor-row';

      campaignMap.floors[f].forEach((node) => {
        const btn = document.createElement('button');
        btn.className = `map-node-btn ${node.available ? 'available' : ''} ${node.visited ? 'visited' : ''} ${node.id === campaignMap.currentNodeId ? 'current' : ''}`;

        btn.innerHTML = `
          <div>${node.icon}</div>
          <span class="map-node-label">${node.nameZh.slice(0, 4)}</span>
        `;

        if (node.available) {
          btn.onclick = () => {
            const selected = campaignMap.selectNode(node.id);
            if (selected) {
              sounds.playPowerup();
              this.clear();
              onNodeSelected(selected);
            }
          };
        }

        row.appendChild(btn);
      });

      mapTree.appendChild(row);
    }

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // ARMORY SHOP MODAL
  // -------------------------------------------------------------
  public showShop(onLeave: () => void, onRepair: () => void, onFortify: () => void) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal-box';

    const shopChips = ALL_UPGRADES.filter(c => !playerInventory.hasChip(c.id)).slice(0, 3);

    box.innerHTML = `
      <div class="modal-title">🛒 战地黑市军械库 (ARMORY SHOP)</div>
      <div class="modal-subtitle">当前零件库存：<b style="color: #facc15; font-size: 18px;">⚙️ ${playerInventory.scraps}</b></div>
      <div id="shop-items-list" style="margin-bottom: 24px;"></div>
      <button class="btn-primary" id="btn-leave-shop">离开军械库，继续前进</button>
    `;

    const list = box.querySelector('#shop-items-list')!;

    // 1. Repair Tank
    const repairRow = document.createElement('div');
    repairRow.className = 'shop-item';
    repairRow.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 16px;">🔧 战地紧急装甲抢修 (+50 HP)</div>
        <div style="font-size: 13px; color: #94a3b8;">为战车恢复 50 点受损装甲</div>
      </div>
      <button class="btn-secondary" id="buy-repair">⚙️ 30 购买</button>
    `;
    repairRow.querySelector('#buy-repair')!.addEventListener('click', () => {
      if (playerInventory.spendScrap(30)) {
        onRepair();
        sounds.playPowerup();
        this.clear();
        this.showShop(onLeave, onRepair, onFortify);
      } else {
        alert('零件不足！');
      }
    });
    list.appendChild(repairRow);

    // 2. Fortify Base
    const fortifyRow = document.createElement('div');
    fortifyRow.className = 'shop-item';
    fortifyRow.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 16px;">🛡️ 基地钛合金全钢加固 (20秒)</div>
        <div style="font-size: 13px; color: #94a3b8;">下一场战斗使老鹰基地外围固化为不可摧毁的白钢</div>
      </div>
      <button class="btn-secondary" id="buy-fortify">⚙️ 40 购买</button>
    `;
    fortifyRow.querySelector('#buy-fortify')!.addEventListener('click', () => {
      if (playerInventory.spendScrap(40)) {
        onFortify();
        sounds.playPowerup();
        this.clear();
        this.showShop(onLeave, onRepair, onFortify);
      } else {
        alert('零件不足！');
      }
    });
    list.appendChild(fortifyRow);

    // 3. Chips on sale
    shopChips.forEach((chip) => {
      const chipRow = document.createElement('div');
      chipRow.className = 'shop-item';
      const rColor = getRarityColor(chip.rarity);
      chipRow.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 16px; color: ${rColor};">${chip.icon} ${chip.nameZh}</div>
          <div style="font-size: 13px; color: #cbd5e1;">${chip.descriptionZh}</div>
        </div>
        <button class="btn-secondary" id="buy-chip-${chip.id}">⚙️ ${chip.cost || 60} 购买</button>
      `;
      chipRow.querySelector(`#buy-chip-${chip.id}`)!.addEventListener('click', () => {
        if (playerInventory.spendScrap(chip.cost || 60)) {
          playerInventory.addChip(chip.id);
          sounds.playPowerup();
          this.clear();
          this.showShop(onLeave, onRepair, onFortify);
        } else {
          alert('零件不足！');
        }
      });
      list.appendChild(chipRow);
    });

    box.querySelector('#btn-leave-shop')!.addEventListener('click', () => {
      this.clear();
      onLeave();
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // REST DEPOT MODAL
  // -------------------------------------------------------------
  public showRest(onDone: () => void, onFullHeal: () => void, onUpgradeWeapon: () => void) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal-box';

    box.innerHTML = `
      <div class="modal-title">⛺ 战地休整所 (REST DEPOT)</div>
      <div class="modal-subtitle">在残垣断壁中找到一处隐蔽补给站，请选择一项整备方案</div>
      <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
        <div class="upgrade-card" id="rest-heal" style="border: 2px solid #22c55e;">
          <div class="card-icon">🔧</div>
          <div class="card-name">全面检修</div>
          <div class="card-desc">战车恢复 70% 最大生命值，并充能全部护盾。</div>
        </div>
        <div class="upgrade-card" id="rest-upgrade" style="border: 2px solid #facc15;">
          <div class="card-icon">⭐</div>
          <div class="card-name">主炮火控升级</div>
          <div class="card-desc">提升 1 级主炮星级，提升射速与穿透威力。</div>
        </div>
      </div>
    `;

    box.querySelector('#rest-heal')!.addEventListener('click', () => {
      onFullHeal();
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    box.querySelector('#rest-upgrade')!.addEventListener('click', () => {
      onUpgradeWeapon();
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // FIELD EVENT MODAL
  // -------------------------------------------------------------
  public showEvent(onDone: () => void, onAddScrap: (n: number) => void, onTakeDamage: (n: number) => void) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal-box';

    box.innerHTML = `
      <div class="modal-title">❓ 战地突发机密：废弃的重装补给车</div>
      <div class="modal-subtitle">雷达探测到一辆冒着浓烟的敌军原型实验车，车体内隐约有电磁反应。</div>
      <div style="display: flex; flex-direction: column; gap: 14px; margin: 20px 0;">
        <button class="shop-item" id="opt-1" style="cursor: pointer;">
          <div>
            <div style="font-weight: 700; color: #38bdf8;">1. 冒险撬开反应堆核心</div>
            <div style="font-size: 13px; color: #94a3b8;">获得 60 点零件，但可能因辐射泄漏受到 20 点伤害</div>
          </div>
        </button>
        <button class="shop-item" id="opt-2" style="cursor: pointer;">
          <div>
            <div style="font-weight: 700; color: #22c55e;">2. 回收外层轻装甲零件</div>
            <div style="font-size: 13px; color: #94a3b8;">安全搜寻，稳定获得 25 点零件</div>
          </div>
        </button>
        <button class="shop-item" id="opt-3" style="cursor: pointer;">
          <div>
            <div style="font-weight: 700; color: #cbd5e1;">3. 保持警戒，绕道离开</div>
            <div style="font-size: 13px; color: #94a3b8;">不冒任何风险直接前进</div>
          </div>
        </button>
      </div>
    `;

    box.querySelector('#opt-1')!.addEventListener('click', () => {
      onAddScrap(60);
      onTakeDamage(20);
      sounds.playExplosion(false);
      this.clear();
      onDone();
    });

    box.querySelector('#opt-2')!.addEventListener('click', () => {
      onAddScrap(25);
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    box.querySelector('#opt-3')!.addEventListener('click', () => {
      this.clear();
      onDone();
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // GAME OVER / VICTORY MODAL
  // -------------------------------------------------------------
  public showResult(isVictory: boolean, reason: string, onRestart: () => void) {
    if (isVictory) sounds.playVictory();
    else sounds.playExplosion(true);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const box = document.createElement('div');
    box.className = 'modal-box';

    box.innerHTML = `
      <div class="modal-title" style="color: ${isVictory ? '#facc15' : '#ef4444'};">
        ${isVictory ? '🏆 战役大捷：终极要塞已摧毁！ 🏆' : '💀 战车阵亡 / 基地沦陷 💀'}
      </div>
      <div class="modal-subtitle">${reason}</div>
      <div style="background: rgba(30, 41, 59, 0.6); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 15px; margin-bottom: 8px;">歼灭敌军总数：<b style="color: #38bdf8;">${playerInventory.kills}</b></div>
        <div style="font-size: 15px; margin-bottom: 8px;">收集零件总量：<b style="color: #facc15;">⚙️ ${playerInventory.scraps}</b></div>
        <div style="font-size: 15px;">装备战术芯片数：<b style="color: #c084fc;">${playerInventory.getActiveChips().length}</b></div>
      </div>
      <button class="btn-primary" id="btn-restart" style="font-size: 17px; padding: 14px 36px;">
        🔄 再次出击 (DEPLOY AGAIN)
      </button>
    `;

    box.querySelector('#btn-restart')!.addEventListener('click', () => {
      this.clear();
      onRestart();
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }
}
