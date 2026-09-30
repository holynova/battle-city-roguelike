/**
 * UI Overlay Manager
 * Controls modern glassmorphism modal dialogs with 3D Holographic Card Tilt,
 * crisp vector badges, and zero emojis.
 */

import { UpgradeChip, getRarityColor, ALL_UPGRADES } from '../roguelite/Upgrades';
import { playerInventory } from '../roguelite/Inventory';
import { campaignMap, MapNode } from '../roguelite/CampaignMap';
import { sounds } from '../audio/SoundEffects';
import { TacticalIcons } from '../graphics/TacticalIcons';

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
        background: radial-gradient(circle at center, rgba(15, 23, 42, 0.82) 0%, rgba(6, 9, 17, 0.95) 100%);
        backdrop-filter: blur(12px);
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
        max-width: 920px;
        width: 92%;
        background: linear-gradient(180deg, rgba(24, 34, 53, 0.95) 0%, rgba(13, 19, 33, 0.98) 100%);
        border: 1px solid rgba(56, 189, 248, 0.35);
        border-radius: 20px;
        box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.18);
        padding: 32px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      /* Top metallic decorative rivets */
      .modal-box::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, transparent, #38bdf8, transparent);
      }
      .modal-title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: 1px;
        margin-bottom: 6px;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      .modal-subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin-bottom: 28px;
      }
      /* 3D Holographic Tilt Cards Grid */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 22px;
        margin-bottom: 20px;
        perspective: 1000px;
      }
      .upgrade-card-wrapper {
        perspective: 1000px;
      }
      .upgrade-card {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%);
        border-radius: 16px;
        padding: 26px 20px;
        cursor: pointer;
        transition: transform 0.15s ease-out, box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        overflow: hidden;
        transform-style: preserve-3d;
        border: 2px solid rgba(255, 255, 255, 0.1);
      }
      .upgrade-card:hover {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px var(--glow-color, rgba(56, 189, 248, 0.4));
      }
      /* Holographic light sheen reflection */
      .card-sheen {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.18) 0%, transparent 65%);
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: 16px;
      }
      .upgrade-card:hover .card-sheen {
        opacity: 1;
      }
      .card-rarity {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 16px;
      }
      .card-icon-wrapper {
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
      }
      .card-name {
        font-size: 17px;
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
        gap: 22px;
        padding: 16px 0;
      }
      .map-floor-row {
        display: flex;
        gap: 48px;
        justify-content: center;
      }
      .map-node-btn {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #111827;
        border: 2px solid #374151;
        cursor: not-allowed;
        opacity: 0.35;
        transition: all 0.22s;
      }
      .map-node-btn.available {
        cursor: pointer;
        opacity: 1;
        border-color: #22c55e;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.45);
        transform: scale(1.1);
        animation: pulseGreen 1.6s infinite;
      }
      .map-node-btn.visited {
        opacity: 0.25;
        border-color: #4b5563;
      }
      .map-node-btn.current {
        border-color: #38bdf8;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.6);
      }
      .map-node-label {
        font-size: 11px;
        font-weight: 700;
        margin-top: 3px;
        color: #f1f5f9;
        letter-spacing: 0.5px;
      }
      @keyframes pulseGreen {
        0%, 100% { transform: scale(1.1); box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
        50% { transform: scale(1.16); box-shadow: 0 0 28px rgba(34, 197, 94, 0.85); }
      }
      /* Buttons */
      .btn-primary {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: white;
        border: 1px solid #38bdf8;
        border-radius: 12px;
        padding: 13px 32px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 6px 20px rgba(2, 132, 199, 0.45);
      }
      .btn-primary:hover {
        background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(2, 132, 199, 0.6);
      }
      .btn-secondary {
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid #475569;
        border-radius: 10px;
        padding: 10px 22px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-secondary:hover {
        background: #334155;
        border-color: #94a3b8;
      }
      /* Shop item */
      .shop-item {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 16px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
        text-align: left;
        gap: 16px;
      }
      .shop-item-left {
        display: flex;
        align-items: center;
        gap: 16px;
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
      <div class="modal-title">
        ${TacticalIcons.getEagleLogo(30)}
        <span>战地整备：三选一科技改装</span>
        ${TacticalIcons.getEagleLogo(30)}
      </div>
      <div class="modal-subtitle">从击破敌军核心拆解的原型配件中挑选一件强化你的战车</div>
      <div class="cards-grid" id="cards-container"></div>
    `;

    const grid = box.querySelector('#cards-container')!;

    choices.forEach((chip) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'upgrade-card-wrapper';

      const card = document.createElement('div');
      card.className = 'upgrade-card';
      const rColor = getRarityColor(chip.rarity);
      card.style.borderColor = rColor;
      card.style.setProperty('--glow-color', `${rColor}66`);

      card.innerHTML = `
        <div class="card-sheen"></div>
        <span class="card-rarity" style="background: ${rColor}22; color: ${rColor}; border: 1px solid ${rColor}">
          ${chip.rarity.toUpperCase()}
        </span>
        <div class="card-icon-wrapper">
          ${TacticalIcons.getChipIcon(chip.id, 64)}
        </div>
        <div class="card-name">${chip.nameZh}</div>
        <div class="card-desc">${chip.descriptionZh}</div>
      `;

      // 3D Card Tilt Mouse Physics
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      card.onclick = () => {
        sounds.playPowerup();
        playerInventory.addChip(chip.id);
        this.clear();
        onSelect(chip);
      };

      wrapper.appendChild(card);
      grid.appendChild(wrapper);
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
      <div class="modal-title">
        <span>战役行进全景战略图 (WAR ROOM)</span>
      </div>
      <div class="modal-subtitle">分析战场情报，选择前进战区，突破防线直逼敌军核心要塞</div>
      <div class="map-container" id="map-tree"></div>
    `;

    const mapTree = box.querySelector('#map-tree')!;

    for (let f = campaignMap.floors.length - 1; f >= 0; f--) {
      const row = document.createElement('div');
      row.className = 'map-floor-row';

      campaignMap.floors[f].forEach((node) => {
        const btn = document.createElement('button');
        btn.className = `map-node-btn ${node.available ? 'available' : ''} ${node.visited ? 'visited' : ''} ${node.id === campaignMap.currentNodeId ? 'current' : ''}`;

        btn.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center;">
            ${TacticalIcons.getMapNodeIcon(node.type, 32)}
          </div>
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
      <div class="modal-title">
        <span>战地黑市军械库 (ARMORY SHOP)</span>
      </div>
      <div class="modal-subtitle">当前零件库存：<b style="color: #facc15; font-size: 18px;">${playerInventory.scraps} SCRAP</b></div>
      <div id="shop-items-list" style="margin-bottom: 24px;"></div>
      <button class="btn-primary" id="btn-leave-shop">离开军械库，继续前进</button>
    `;

    const list = box.querySelector('#shop-items-list')!;

    // 1. Repair Tank
    const repairRow = document.createElement('div');
    repairRow.className = 'shop-item';
    repairRow.innerHTML = `
      <div class="shop-item-left">
        ${TacticalIcons.getChipIcon('nanite_repair', 48)}
        <div>
          <div style="font-weight: 700; font-size: 16px;">战地紧急装甲抢修 (+50 HP)</div>
          <div style="font-size: 13px; color: #94a3b8;">为战车快速更换装甲板并恢复 50 点生命值</div>
        </div>
      </div>
      <button class="btn-secondary" id="buy-repair">30 零件</button>
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
      <div class="shop-item-left">
        ${TacticalIcons.getChipIcon('reinforced_armor', 48)}
        <div>
          <div style="font-weight: 700; font-size: 16px;">基地钛合金全钢加固 (25秒)</div>
          <div style="font-size: 13px; color: #94a3b8;">下一场战斗使老鹰基地外围固化为不可摧毁的钛合金白钢</div>
        </div>
      </div>
      <button class="btn-secondary" id="buy-fortify">40 零件</button>
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
        <div class="shop-item-left">
          ${TacticalIcons.getChipIcon(chip.id, 48)}
          <div>
            <div style="font-weight: 700; font-size: 16px; color: ${rColor};">${chip.nameZh}</div>
            <div style="font-size: 13px; color: #cbd5e1;">${chip.descriptionZh}</div>
          </div>
        </div>
        <button class="btn-secondary" id="buy-chip-${chip.id}">${chip.cost || 60} 零件</button>
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
      <div class="modal-title">
        <span>战地整备所 (FIELD DEPOT)</span>
      </div>
      <div class="modal-subtitle">在残垣断壁中找到一处隐蔽地下机修站，请选择一项整备方案</div>
      <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
        <div class="upgrade-card" id="rest-heal" style="border: 2px solid #22c55e; flex: 1;">
          <div class="card-icon-wrapper">${TacticalIcons.getChipIcon('nanite_repair', 56)}</div>
          <div class="card-name">全面检修大修</div>
          <div class="card-desc">战车恢复 70% 最大生命值，并为老鹰要塞恢复 50 点装甲。</div>
        </div>
        <div class="upgrade-card" id="rest-upgrade" style="border: 2px solid #facc15; flex: 1;">
          <div class="card-icon-wrapper">${TacticalIcons.getChipIcon('high_velocity', 56)}</div>
          <div class="card-name">主炮火控升级</div>
          <div class="card-desc">主炮等级提升 1 星级，大幅提升射速与炮弹穿透威力。</div>
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
      <div class="modal-title">
        <span>战地机密情报：废弃的原型重装车</span>
      </div>
      <div class="modal-subtitle">战地雷达探测到一辆冒着浓烟的敌军原型实验车，车体内隐约有高能反应。</div>
      <div style="display: flex; flex-direction: column; gap: 14px; margin: 20px 0;">
        <button class="shop-item" id="opt-1" style="cursor: pointer; width: 100%;">
          <div class="shop-item-left">
            ${TacticalIcons.getChipIcon('overdrive_thruster', 42)}
            <div>
              <div style="font-weight: 700; color: #38bdf8;">1. 冒险强拆反应堆核心</div>
              <div style="font-size: 13px; color: #94a3b8;">高风险：获得 60 点零件，但泄露冲击波将扣除自身 20 点生命</div>
            </div>
          </div>
        </button>
        <button class="shop-item" id="opt-2" style="cursor: pointer; width: 100%;">
          <div class="shop-item-left">
            ${TacticalIcons.getChipIcon('scrap_collector', 42)}
            <div>
              <div style="font-weight: 700; color: #22c55e;">2. 安全回收外挂备件</div>
              <div style="font-size: 13px; color: #94a3b8;">低风险：拆解外层轻装甲板，稳定获得 25 点零件</div>
            </div>
          </div>
        </button>
        <button class="shop-item" id="opt-3" style="cursor: pointer; width: 100%;">
          <div class="shop-item-left">
            ${TacticalIcons.getMapNodeIcon('event', 42)}
            <div>
              <div style="font-weight: 700; color: #cbd5e1;">3. 保持警戒，绕道前进</div>
              <div style="font-size: 13px; color: #94a3b8;">不冒任何意外风险，迅速撤离现场</div>
            </div>
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
        ${isVictory ? TacticalIcons.getEagleLogo(36) : TacticalIcons.getMapNodeIcon('elite', 36)}
        <span>${isVictory ? '战役大捷：终极要塞已摧毁！' : '战车阵亡 / 基地沦陷'}</span>
        ${isVictory ? TacticalIcons.getEagleLogo(36) : TacticalIcons.getMapNodeIcon('elite', 36)}
      </div>
      <div class="modal-subtitle">${reason}</div>
      <div style="background: rgba(30, 41, 59, 0.6); border-radius: 14px; padding: 22px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div>
          <div style="color: #94a3b8; font-size: 13px;">歼灭敌军</div>
          <div style="font-size: 24px; font-weight: 800; color: #38bdf8;">${playerInventory.kills}</div>
        </div>
        <div>
          <div style="color: #94a3b8; font-size: 13px;">回收零件</div>
          <div style="font-size: 24px; font-weight: 800; color: #facc15;">${playerInventory.scraps}</div>
        </div>
        <div>
          <div style="color: #94a3b8; font-size: 13px;">装备芯片</div>
          <div style="font-size: 24px; font-weight: 800; color: #c084fc;">${playerInventory.getActiveChips().length}</div>
        </div>
      </div>
      <button class="btn-primary" id="btn-restart" style="font-size: 17px; padding: 14px 40px;">
        再次出击 (DEPLOY AGAIN)
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
