/**
 * High-Definition Military Tactical Console UI
 * Complete departure from SaaS/web tropes:
 * Uses chamfered armored cartridges, CRT phosphor HUDs, classified dossiers, and scene illustrations.
 */

import { UpgradeChip, getRarityColor, ALL_UPGRADES } from '../roguelite/Upgrades';
import { playerInventory } from '../roguelite/Inventory';
import { campaignMap, MapNode } from '../roguelite/CampaignMap';
import { sounds } from '../audio/SoundEffects';
import { bgm } from '../audio/MusicEngine';
import { TacticalIcons } from '../graphics/TacticalIcons';
import { GameArtwork } from '../graphics/GameArtwork';

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
    this.setupAudioToggle();
  }

  private setupAudioToggle() {
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        sounds.playUiClick();
        const isEnabled = bgm.toggleMute();
        btn.textContent = isEnabled ? '🔊 BGM: ON' : '🔇 BGM: OFF';
        btn.style.color = isEnabled ? '#38bdf8' : '#94a3b8';
      });
      btn.addEventListener('mouseenter', () => sounds.playUiHover());
    }
  }

  private attachAudioFeedback(root: HTMLElement) {
    root.querySelectorAll('button, .mod-cartridge, .tactical-node-badge, .armory-row, .event-option-card').forEach((el) => {
      el.addEventListener('mouseenter', () => sounds.playUiHover());
    });
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
        font-family: 'Chakra Petch', -apple-system, sans-serif;
        color: #f8fafc;
        user-select: none;
      }
      .terminal-backdrop {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(6, 11, 25, 0.92) 0%, rgba(2, 4, 10, 0.98) 100%);
        backdrop-filter: blur(16px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        animation: consoleBoot 0.22s ease-out;
        padding: 16px;
      }
      @keyframes consoleBoot {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }

      /* Heavy Armored Military Box with 45° Chamfered Corners */
      .armored-chassis {
        max-width: 960px;
        width: 96%;
        max-height: 94vh;
        overflow-y: auto;
        background: linear-gradient(180deg, #1b2434 0%, #101726 60%, #080c14 100%);
        border: 2px solid #38bdf8;
        clip-path: polygon(
          22px 0%, calc(100% - 22px) 0%, 100% 22px,
          100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%,
          0% calc(100% - 22px), 0% 22px
        );
        box-shadow: 0 45px 90px rgba(0, 0, 0, 0.95), 0 0 40px rgba(56, 189, 248, 0.3);
        padding: 26px 30px;
        text-align: center;
        position: relative;
      }
      .armored-chassis::-webkit-scrollbar {
        width: 6px;
      }
      .armored-chassis::-webkit-scrollbar-track {
        background: #090d16;
      }
      .armored-chassis::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 3px;
      }

      /* Industrial Top Header Stripe */
      .chassis-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid rgba(56, 189, 248, 0.35);
        padding-bottom: 12px;
        margin-bottom: 18px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        color: #38bdf8;
        letter-spacing: 2px;
      }
      .chassis-header-bar .warning-tag {
        background: #ef4444;
        color: #ffffff;
        font-weight: 700;
        padding: 3px 10px;
        clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
        letter-spacing: 1px;
      }
      .console-main-title {
        font-size: 30px;
        font-weight: 800;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
      }
      .console-sub-title {
        font-size: 13.5px;
        color: #94a3b8;
        font-family: 'Share Tech Mono', monospace;
        letter-spacing: 1px;
        margin-top: 4px;
        margin-bottom: 20px;
      }

      /* -----------------------------------------------------------
         FEATURE DOSSIER CARDS (Title Screen)
      ----------------------------------------------------------- */
      .title-dossier-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 20px;
      }
      @media (max-width: 768px) {
        .title-dossier-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .title-dossier-card {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(56, 189, 248, 0.25);
        clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        padding: 12px 10px;
        text-align: left;
      }
      .title-dossier-card .card-tag {
        font-family: 'Share Tech Mono', monospace;
        font-size: 10px;
        color: #facc15;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .title-dossier-card .card-heading {
        font-size: 14px;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 4px;
      }
      .title-dossier-card .card-text {
        font-size: 11.5px;
        color: #94a3b8;
        line-height: 1.45;
      }

      /* -----------------------------------------------------------
         PHYSICAL ARMORED CARTRIDGES (Three-Pick-One Overhaul)
      ----------------------------------------------------------- */
      .cartridges-rack {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 22px;
        margin-bottom: 18px;
        perspective: 1200px;
      }
      @media (max-width: 768px) {
        .cartridges-rack {
          grid-template-columns: 1fr;
        }
      }
      .cartridge-wrapper {
        perspective: 1200px;
      }
      .mod-cartridge {
        background: linear-gradient(165deg, #1e293b 0%, #0f172a 70%, #020617 100%);
        clip-path: polygon(
          14px 0%, calc(100% - 14px) 0%, 100% 14px,
          100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%,
          0% calc(100% - 14px), 0% 14px
        );
        border: 2px solid var(--border-color, #475569);
        padding: 22px 18px 20px;
        cursor: pointer;
        transition: transform 0.18s ease-out, box-shadow 0.2s ease, border-color 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        transform-style: preserve-3d;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
      }
      .mod-cartridge:hover {
        border-color: var(--highlight-color, #38bdf8);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.85), 0 0 35px var(--highlight-color, rgba(56, 189, 248, 0.4));
      }
      .cartridge-pins {
        display: flex;
        gap: 6px;
        margin-bottom: 10px;
      }
      .cartridge-pin {
        width: 8px;
        height: 6px;
        background: #facc15;
        border-radius: 1px;
      }
      .cartridge-serial {
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        letter-spacing: 1.5px;
        color: #64748b;
        margin-bottom: 8px;
      }
      .cartridge-rarity-badge {
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
        padding: 3px 12px;
        clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
        margin-bottom: 14px;
      }
      .cartridge-schematic {
        margin-bottom: 14px;
        filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.6));
      }
      .cartridge-title {
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 1px;
        margin-bottom: 8px;
      }
      .cartridge-desc {
        font-size: 13px;
        color: #cbd5e1;
        line-height: 1.55;
        font-family: 'Chakra Petch', sans-serif;
      }
      .cartridge-equip-btn {
        margin-top: 14px;
        padding: 6px 16px;
        font-size: 12px;
        font-family: 'Share Tech Mono', monospace;
        font-weight: 700;
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid #38bdf8;
        color: #38bdf8;
        clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
      }

      /* -----------------------------------------------------------
         TACTICAL WAR ROOM MAP (TWO-COLUMN BRIEFING)
      ----------------------------------------------------------- */
      .war-room-split {
        display: flex;
        gap: 20px;
        margin-bottom: 14px;
        text-align: left;
      }
      @media (max-width: 800px) {
        .war-room-split {
          flex-direction: column;
        }
      }
      .war-table-canvas-wrap {
        position: relative;
        flex: 1;
        height: 380px;
        border: 2px solid #38bdf8;
        clip-path: polygon(
          12px 0%, calc(100% - 12px) 0%, 100% 12px,
          100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%,
          0% calc(100% - 12px), 0% 12px
        );
        overflow: hidden;
      }
      .war-table-nodes-layer {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 16px 0;
      }
      .war-table-row {
        display: flex;
        justify-content: center;
        gap: 40px;
      }
      .tactical-node-badge {
        width: 72px;
        height: 72px;
        clip-path: polygon(
          10px 0%, calc(100% - 10px) 0%, 100% 10px,
          100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%,
          0% calc(100% - 10px), 0% 10px
        );
        background: rgba(15, 23, 42, 0.94);
        border: 2px solid #334155;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: not-allowed;
        opacity: 0.35;
        transition: all 0.22s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
      }
      .tactical-node-badge.available {
        cursor: pointer;
        opacity: 1;
        border-color: #22c55e;
        box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
        transform: scale(1.12);
        animation: radarPulse 1.6s infinite;
      }
      .tactical-node-badge.current {
        border-color: #38bdf8;
        box-shadow: 0 0 22px rgba(56, 189, 248, 0.7);
      }
      .tactical-node-label {
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        color: #f1f5f9;
        margin-top: 4px;
        letter-spacing: 1px;
      }
      @keyframes radarPulse {
        0%, 100% { transform: scale(1.12); box-shadow: 0 0 18px rgba(34, 197, 94, 0.5); }
        50% { transform: scale(1.18); box-shadow: 0 0 35px rgba(34, 197, 94, 0.9); }
      }

      /* Right Reconnaissance Dossier Panel */
      .recon-dossier-panel {
        width: 320px;
        background: rgba(11, 17, 32, 0.95);
        border: 2px solid #334155;
        clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
        padding: 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .recon-header {
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        color: #38bdf8;
        border-bottom: 1px solid rgba(56, 189, 248, 0.3);
        padding-bottom: 8px;
        margin-bottom: 12px;
      }
      .recon-sector-title {
        font-size: 20px;
        font-weight: 800;
        color: #f8fafc;
        margin-bottom: 6px;
      }
      .recon-threat-tag {
        display: inline-block;
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid #ef4444;
        color: #ef4444;
        margin-bottom: 12px;
      }
      .recon-desc {
        font-size: 13px;
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      /* -----------------------------------------------------------
         MECHANICAL INDUSTRIAL BUTTONS
      ----------------------------------------------------------- */
      .mech-btn-primary {
        background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
        border: 2px solid #38bdf8;
        clip-path: polygon(
          10px 0%, calc(100% - 10px) 0%, 100% 10px,
          100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%,
          0% calc(100% - 10px), 0% 10px
        );
        color: #ffffff;
        font-family: 'Chakra Petch', sans-serif;
        font-size: 17px;
        font-weight: 700;
        letter-spacing: 1.5px;
        padding: 13px 36px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 6px 20px rgba(2, 132, 199, 0.45);
      }
      .mech-btn-primary:hover {
        background: linear-gradient(180deg, #0369a1 0%, #075985 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(2, 132, 199, 0.7);
      }
      .mech-btn-primary:active {
        transform: translateY(1px);
      }
      .mech-btn-secondary {
        background: #1e293b;
        border: 1px solid #475569;
        clip-path: polygon(
          8px 0%, calc(100% - 8px) 0%, 100% 8px,
          100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%,
          0% calc(100% - 8px), 0% 8px
        );
        color: #f8fafc;
        font-family: 'Share Tech Mono', monospace;
        font-size: 14px;
        font-weight: 700;
        padding: 10px 22px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .mech-btn-secondary:hover {
        background: #334155;
        border-color: #38bdf8;
      }

      /* Military Armory / Shop Item */
      .armory-row {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid #334155;
        clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
        padding: 14px 24px;
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
  // 1. TITLE SCREEN WITH CINEMATIC BATTLEFIELD COVER ART & DOSSIERS
  // -------------------------------------------------------------
  public showStartMenu(onStart: () => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>SYS // TACTICAL COMMAND MK-IV</div>
        <div class="warning-tag">DEFCON-1 ENGAGED</div>
      </div>

      <div id="title-cover-canvas-box" style="margin-bottom: 18px; border: 2px solid #38bdf8; clip-path: polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0% calc(100% - 14px), 0% 14px);"></div>

      <div class="console-main-title">
        ${TacticalIcons.getEagleLogo(36)}
        <span>钢铁誓约：重装肉鸽坦克</span>
        ${TacticalIcons.getEagleLogo(36)}
      </div>
      <div class="console-sub-title">
        BATTLE CITY : ROGUE BASTION // 4K RETINA VECTOR × CHIP-TREE ROGUELITE
      </div>

      <!-- 4 Strategic Feature Cards -->
      <div class="title-dossier-grid">
        <div class="title-dossier-card">
          <div class="card-tag">DOSSIER 01</div>
          <div class="card-heading">10 大战术战场</div>
          <div class="card-text">莱茵水堑、废墟巷战、热带密林、极地霜冻、钛钢要塞与角斗场</div>
        </div>
        <div class="title-dossier-card">
          <div class="card-tag">DOSSIER 02</div>
          <div class="card-heading">20+ 战备芯片树</div>
          <div class="card-text">穿甲重炮、能量护盾、吸血死灵、连锁电弧与多重自动副炮</div>
        </div>
        <div class="title-dossier-card">
          <div class="card-tag">DOSSIER 03</div>
          <div class="card-heading">高精火控机动</div>
          <div class="card-text">360° 独立自由炮塔、喷气漂移冲刺、老鹰指挥要塞自动近防系统</div>
        </div>
        <div class="title-dossier-card">
          <div class="card-tag">DOSSIER 04</div>
          <div class="card-heading">歌利亚巨兽 BOSS</div>
          <div class="card-text">多炮塔重型巡洋要塞巨坦，四向重炮与导弹齐射终极决斗</div>
        </div>
      </div>

      <!-- Operator Controls Manual -->
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.25); clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%); padding: 14px 20px; text-align: left; max-width: 720px; margin: 0 auto 20px; font-size: 13px; line-height: 1.7;">
        <span style="color: #facc15; font-weight: 700; font-family: 'Share Tech Mono', monospace;">[ 驾驶员火控与机动指南 ]</span><br/>
        • <b>WASD / 方向键</b>：战车履带差速行驶（附带物理惯性与泥地印痕）<br/>
        • <b>鼠标指针</b>：独立 360° 炮塔自由瞄准 · <b>左键 / 空格</b>：120mm 穿甲高爆射击<br/>
        • <b>Shift / 右键</b>：超燃喷气冲刺（瞬时无敌突进） · <b>老鹰基地</b>：附带能量屏障与全自动速射近防炮
      </div>

      <button class="mech-btn-primary" id="btn-deploy-run">
        启动引擎 · 投入战役 (START CAMPAIGN)
      </button>
    `;

    // Embed procedural cover canvas
    const coverCanvas = GameArtwork.getTitleCoverArt(720, 220);
    coverCanvas.style.display = 'block';
    coverCanvas.style.width = '100%';
    coverCanvas.style.height = 'auto';
    box.querySelector('#title-cover-canvas-box')!.appendChild(coverCanvas);

    this.attachAudioFeedback(box);

    box.querySelector('#btn-deploy-run')!.addEventListener('click', () => {
      sounds.playUiClick();
      sounds.playPowerup();
      this.clear();
      onStart();
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 2. THREE-PICK-ONE ARMORED MOD CARTRIDGES DRAFT
  // -------------------------------------------------------------
  public showCardDraft(onSelect: (chip: UpgradeChip) => void) {
    bgm.playTrack('briefing');
    sounds.playVictory();
    const choices = playerInventory.getRandomChoices(3);

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>LOG // SALVAGE BLUEPRINT ACQUIRED</div>
        <div class="warning-tag" style="background: #22c55e;">SELECT 1 REINFORCEMENT</div>
      </div>

      <div class="console-main-title">
        ${TacticalIcons.getEagleLogo(32)}
        <span>战备整备：装甲模块配件加装</span>
        ${TacticalIcons.getEagleLogo(32)}
      </div>
      <div class="console-sub-title">从击溃敌军核心回收的高规原型芯片中，挑选一件装载至战车卡槽</div>
      <div class="cartridges-rack" id="cartridges-box"></div>
    `;

    const rack = box.querySelector('#cartridges-box')!;

    choices.forEach((chip, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'cartridge-wrapper';

      const cart = document.createElement('div');
      cart.className = 'mod-cartridge';
      const rColor = getRarityColor(chip.rarity);
      cart.style.setProperty('--border-color', `${rColor}88`);
      cart.style.setProperty('--highlight-color', rColor);

      cart.innerHTML = `
        <div class="cartridge-pins">
          <div class="cartridge-pin"></div>
          <div class="cartridge-pin"></div>
          <div class="cartridge-pin"></div>
          <div class="cartridge-pin"></div>
        </div>
        <div class="cartridge-serial">SERIAL: MOD-${idx + 401}-${chip.rarity.toUpperCase().slice(0, 3)}</div>
        <div class="cartridge-rarity-badge" style="background: ${rColor}33; color: ${rColor}; border: 1px solid ${rColor};">
          ${chip.rarity.toUpperCase()} GRADE
        </div>
        <div class="cartridge-schematic">
          ${TacticalIcons.getChipIcon(chip.id, 68)}
        </div>
        <div class="cartridge-title">${chip.nameZh}</div>
        <div class="cartridge-desc">${chip.descriptionZh}</div>
        <div class="cartridge-equip-btn">装载此模块 (INSTALL)</div>
      `;

      // 3D Card Tilt Mouse Physics
      cart.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = cart.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        cart.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
      });

      cart.addEventListener('mouseleave', () => {
        cart.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      cart.onclick = () => {
        sounds.playModuleEquip();
        sounds.playPowerup();
        playerInventory.addChip(chip.id);
        this.clear();
        onSelect(chip);
      };

      wrapper.appendChild(cart);
      rack.appendChild(wrapper);
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 3. CAMPAIGN MAP (TOPOGRAPHIC WAR TABLE WITH RECON INSPECTOR)
  // -------------------------------------------------------------
  public showCampaignMap(onNodeSelected: (node: MapNode) => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    // Find the first available node to preview
    let defaultPreviewNode: MapNode | null = null;
    for (const row of campaignMap.floors) {
      for (const n of row) {
        if (n.available) {
          defaultPreviewNode = n;
          break;
        }
      }
      if (defaultPreviewNode) break;
    }

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>STRATEGIC // THEATER OF OPERATIONS</div>
        <div class="warning-tag">SELECT SECTOR</div>
      </div>

      <div class="console-main-title">战役作战全景沙盘 (WAR ROOM)</div>
      <div class="console-sub-title">分析等高线地势与雷达目标，选择推进战区，突破防线直逼要塞巨兽</div>

      <div class="war-room-split">
        <!-- Left: Holo Map Table -->
        <div class="war-table-canvas-wrap" id="war-table-wrap">
          <div class="war-table-nodes-layer" id="war-table-nodes"></div>
        </div>

        <!-- Right: Reconnaissance Dossier Panel -->
        <div class="recon-dossier-panel" id="recon-panel">
          <div>
            <div class="recon-header">// TACTICAL RECONNAISSANCE</div>
            <div class="recon-sector-title" id="recon-title">${defaultPreviewNode ? defaultPreviewNode.nameZh : '选择战区'}</div>
            <div class="recon-threat-tag" id="recon-threat">THREAT LEVEL: HIGH</div>
            <div class="recon-desc" id="recon-desc">${defaultPreviewNode ? defaultPreviewNode.descZh : '请点击左侧沙盘的高亮战区节点查看侦察简报并出击。'}</div>
          </div>
          <div>
            <div style="font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #facc15; margin-bottom: 10px;">
              • 预计回收: 160 ~ 240 零件
            </div>
            <button class="mech-btn-primary" id="btn-confirm-sector" style="width: 100%; padding: 10px 0; font-size: 15px;" ${defaultPreviewNode ? '' : 'disabled'}>
              锁定航线 · 投入战役
            </button>
          </div>
        </div>
      </div>
    `;

    // Embed Topographic War Table Canvas as Background
    const warTableWrap = box.querySelector('#war-table-wrap')!;
    const warTableCanvas = GameArtwork.getTacticalWarTableBg(600, 380);
    warTableCanvas.style.position = 'absolute';
    warTableCanvas.style.inset = '0';
    warTableCanvas.style.width = '100%';
    warTableCanvas.style.height = '100%';
    warTableWrap.insertBefore(warTableCanvas, warTableWrap.firstChild);

    const nodesLayer = box.querySelector('#war-table-nodes')!;
    const reconTitle = box.querySelector('#recon-title') as HTMLElement;
    const reconDesc = box.querySelector('#recon-desc') as HTMLElement;
    const btnConfirm = box.querySelector('#btn-confirm-sector') as HTMLButtonElement;

    let selectedNode: MapNode | null = defaultPreviewNode;

    const updateRecon = (node: MapNode) => {
      selectedNode = node;
      reconTitle.textContent = node.nameZh;
      reconDesc.textContent = node.descZh;
      btnConfirm.disabled = !node.available;
      btnConfirm.textContent = node.available ? '锁定航线 · 投入战役' : '不可通行';
    };

    btnConfirm.onclick = () => {
      if (selectedNode && selectedNode.available) {
        const confirmed = campaignMap.selectNode(selectedNode.id);
        if (confirmed) {
          sounds.playUiClick();
          sounds.playPowerup();
          this.clear();
          onNodeSelected(confirmed);
        }
      }
    };

    // Render from Boss floor down to Floor 0
    for (let f = campaignMap.floors.length - 1; f >= 0; f--) {
      const row = document.createElement('div');
      row.className = 'war-table-row';

      campaignMap.floors[f].forEach((node) => {
        const btn = document.createElement('button');
        btn.className = `tactical-node-badge ${node.available ? 'available' : ''} ${node.visited ? 'visited' : ''} ${node.id === campaignMap.currentNodeId ? 'current' : ''}`;

        btn.innerHTML = `
          <div>${TacticalIcons.getMapNodeIcon(node.type, 30)}</div>
          <span class="tactical-node-label">${node.nameZh.slice(0, 4)}</span>
        `;
        btn.title = `${node.nameZh} // ${node.descZh}`;

        btn.onmouseenter = () => {
          sounds.playUiHover();
          updateRecon(node);
        };

        if (node.available) {
          btn.onclick = () => {
            updateRecon(node);
            const confirmed = campaignMap.selectNode(node.id);
            if (confirmed) {
              sounds.playUiClick();
              sounds.playPowerup();
              this.clear();
              onNodeSelected(confirmed);
            }
          };
        }

        row.appendChild(btn);
      });

      nodesLayer.appendChild(row);
    }

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 4. BLACK MARKET ARMORY SHOP
  // -------------------------------------------------------------
  public showShop(onLeave: () => void, onRepair: () => void, onFortify: () => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    const shopChips = ALL_UPGRADES.filter(c => !playerInventory.hasChip(c.id)).slice(0, 3);

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>DEPOT // BLACK MARKET LOGISTICS</div>
        <div style="color: #facc15; font-weight: 700;">SALVAGE COGS: ${playerInventory.scraps} SCRAP</div>
      </div>

      <div class="console-main-title">战地黑市军械库 (ARMORY SHOP)</div>
      <div class="console-sub-title">消耗收集的废铁零件，采购特种弹药改质、全装甲大修或加固要塞白钢防线</div>
      <div id="armory-items-list" style="margin-bottom: 20px;"></div>
      <button class="mech-btn-primary" id="btn-leave-shop">完成补给 · 继续推进</button>
    `;

    const list = box.querySelector('#armory-items-list')!;

    // 1. Repair
    const repairRow = document.createElement('div');
    repairRow.className = 'armory-row';
    repairRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        ${TacticalIcons.getChipIcon('nanite_repair', 44)}
        <div>
          <div style="font-weight: 700; font-size: 16px;">战地紧急装甲抢修 (+50 HP)</div>
          <div style="font-size: 13px; color: #94a3b8; font-family: 'Share Tech Mono', monospace;">REPAIR HULL +50 HP</div>
        </div>
      </div>
      <button class="mech-btn-secondary" id="buy-repair">30 零件</button>
    `;
    repairRow.querySelector('#buy-repair')!.addEventListener('click', () => {
      if (playerInventory.spendScrap(30)) {
        onRepair();
        sounds.playUiClick();
        sounds.playPowerup();
        this.clear();
        this.showShop(onLeave, onRepair, onFortify);
      } else {
        sounds.playError();
      }
    });
    list.appendChild(repairRow);

    // 2. Fortify
    const fortifyRow = document.createElement('div');
    fortifyRow.className = 'armory-row';
    fortifyRow.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        ${TacticalIcons.getChipIcon('reinforced_armor', 44)}
        <div>
          <div style="font-weight: 700; font-size: 16px;">基地钛合金全钢加固 (25秒)</div>
          <div style="font-size: 13px; color: #94a3b8; font-family: 'Share Tech Mono', monospace;">FORTIFY BASTION STEEL</div>
        </div>
      </div>
      <button class="mech-btn-secondary" id="buy-fortify">40 零件</button>
    `;
    fortifyRow.querySelector('#buy-fortify')!.addEventListener('click', () => {
      if (playerInventory.spendScrap(40)) {
        onFortify();
        sounds.playUiClick();
        sounds.playPowerup();
        this.clear();
        this.showShop(onLeave, onRepair, onFortify);
      } else {
        sounds.playError();
      }
    });
    list.appendChild(fortifyRow);

    // 3. Chips
    shopChips.forEach((chip) => {
      const chipRow = document.createElement('div');
      chipRow.className = 'armory-row';
      const rColor = getRarityColor(chip.rarity);
      chipRow.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px;">
          ${TacticalIcons.getChipIcon(chip.id, 44)}
          <div>
            <div style="font-weight: 700; font-size: 16px; color: ${rColor};">${chip.nameZh}</div>
            <div style="font-size: 13px; color: #cbd5e1;">${chip.descriptionZh}</div>
          </div>
        </div>
        <button class="mech-btn-secondary" id="buy-chip-${chip.id}">${chip.cost || 60} 零件</button>
      `;
      chipRow.querySelector(`#buy-chip-${chip.id}`)!.addEventListener('click', () => {
        if (playerInventory.spendScrap(chip.cost || 60)) {
          playerInventory.addChip(chip.id);
          sounds.playUiClick();
          sounds.playPowerup();
          this.clear();
          this.showShop(onLeave, onRepair, onFortify);
        } else {
          sounds.playError();
        }
      });
      list.appendChild(chipRow);
    });

    box.querySelector('#btn-leave-shop')!.addEventListener('click', () => {
      sounds.playUiClick();
      this.clear();
      onLeave();
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 5. REST DEPOT MODAL
  // -------------------------------------------------------------
  public showRest(onDone: () => void, onFullHeal: () => void, onUpgradeWeapon: () => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>DEPOT // EMERGENCY FIELD DOCK</div>
        <div class="warning-tag" style="background: #22c55e;">REST SECURED</div>
      </div>

      <div class="console-main-title">战地地下机修站 (FIELD DEPOT)</div>
      <div class="console-sub-title">在交火间隙寻获地下整备车间，请选择一项战备抢修方案</div>

      <div style="display: flex; gap: 24px; justify-content: center; margin-top: 18px;">
        <div class="mod-cartridge" id="rest-heal" style="--border-color: #22c55e; flex: 1;">
          <div class="cartridge-schematic">${TacticalIcons.getChipIcon('nanite_repair', 56)}</div>
          <div class="cartridge-title" style="color: #4ade80;">全面抢修大修</div>
          <div class="cartridge-desc">战车恢复 70% 最大生命值，并为老鹰要塞抢修恢复 50 点装甲。</div>
          <div class="cartridge-equip-btn" style="border-color: #4ade80; color: #4ade80;">执行大修 (REPAIR)</div>
        </div>
        <div class="mod-cartridge" id="rest-upgrade" style="--border-color: #facc15; flex: 1;">
          <div class="cartridge-schematic">${TacticalIcons.getChipIcon('high_velocity', 56)}</div>
          <div class="cartridge-title" style="color: #fde047;">主炮火控升级</div>
          <div class="cartridge-desc">主炮星级提升 1 级，全面强化弹速、射速与穿透威力。</div>
          <div class="cartridge-equip-btn" style="border-color: #fde047; color: #fde047;">校准升级 (UPGRADE)</div>
        </div>
      </div>
    `;

    box.querySelector('#rest-heal')!.addEventListener('click', () => {
      onFullHeal();
      sounds.playUiClick();
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    box.querySelector('#rest-upgrade')!.addEventListener('click', () => {
      onUpgradeWeapon();
      sounds.playUiClick();
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 6. FIELD EVENT MODAL
  // -------------------------------------------------------------
  public showEvent(onDone: () => void, onAddScrap: (n: number) => void, onTakeDamage: (n: number) => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>INTEL // FIELD CLASSIFIED EVENT</div>
        <div class="warning-tag" style="background: #eab308; color: #000;">ENCRYPTED SIGNAL</div>
      </div>

      <div class="console-main-title">战地机密情报：废弃的原型重装车</div>
      <div class="console-sub-title">前线雷达探测到一辆冒着浓烟的敌军原型实验车，车体内隐约有高能辐射反应。</div>

      <div style="display: flex; flex-direction: column; gap: 14px; margin: 20px 0;">
        <button class="armory-row event-option-card" id="opt-1" style="cursor: pointer; width: 100%;">
          <div style="display: flex; align-items: center; gap: 16px;">
            ${TacticalIcons.getChipIcon('overdrive_thruster', 42)}
            <div>
              <div style="font-weight: 700; color: #38bdf8;">1. 冒险强拆反应堆核心</div>
              <div style="font-size: 13px; color: #94a3b8;">高风险：获得 60 点零件，但泄露冲击波将扣除自身 20 点生命</div>
            </div>
          </div>
        </button>
        <button class="armory-row event-option-card" id="opt-2" style="cursor: pointer; width: 100%;">
          <div style="display: flex; align-items: center; gap: 16px;">
            ${TacticalIcons.getChipIcon('scrap_collector', 42)}
            <div>
              <div style="font-weight: 700; color: #22c55e;">2. 安全回收外挂备件</div>
              <div style="font-size: 13px; color: #94a3b8;">低风险：拆解外层轻装甲板，稳定获得 25 点零件</div>
            </div>
          </div>
        </button>
        <button class="armory-row event-option-card" id="opt-3" style="cursor: pointer; width: 100%;">
          <div style="display: flex; align-items: center; gap: 16px;">
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
      sounds.playUiClick();
      this.clear();
      onDone();
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 7. RESULT MODAL (VICTORY / DEFEAT)
  // -------------------------------------------------------------
  public showResult(isVictory: boolean, reason: string, onRestart: () => void) {
    if (isVictory) {
      sounds.playVictory();
      bgm.playTrack('briefing');
    } else {
      sounds.playExplosion(true);
      bgm.stop();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'terminal-backdrop';

    const box = document.createElement('div');
    box.className = 'armored-chassis';

    box.innerHTML = `
      <div class="chassis-header-bar">
        <div>OPERATION STATUS // MISSION TERMINATED</div>
        <div class="warning-tag" style="background: ${isVictory ? '#22c55e' : '#ef4444'}; color: #fff;">
          ${isVictory ? 'MISSION ACCOMPLISHED' : 'CASUALTY REPORT'}
        </div>
      </div>

      <div class="console-main-title" style="color: ${isVictory ? '#facc15' : '#ef4444'};">
        ${isVictory ? TacticalIcons.getEagleLogo(36) : TacticalIcons.getMapNodeIcon('elite', 36)}
        <span>${isVictory ? '战役大捷：终极要塞已摧毁！' : '战车阵亡 / 基地沦陷'}</span>
        ${isVictory ? TacticalIcons.getEagleLogo(36) : TacticalIcons.getMapNodeIcon('elite', 36)}
      </div>
      <div class="console-sub-title">${reason}</div>

      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; clip-path: polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px); padding: 22px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div>
          <div style="color: #94a3b8; font-family: 'Share Tech Mono', monospace; font-size: 13px;">歼灭敌军</div>
          <div style="font-size: 28px; font-weight: 800; color: #38bdf8;">${playerInventory.kills}</div>
        </div>
        <div>
          <div style="color: #94a3b8; font-family: 'Share Tech Mono', monospace; font-size: 13px;">回收零件</div>
          <div style="font-size: 28px; font-weight: 800; color: #facc15;">${playerInventory.scraps}</div>
        </div>
        <div>
          <div style="color: #94a3b8; font-family: 'Share Tech Mono', monospace; font-size: 13px;">装载芯片</div>
          <div style="font-size: 28px; font-weight: 800; color: #c084fc;">${playerInventory.getActiveChips().length}</div>
        </div>
      </div>

      <button class="mech-btn-primary" id="btn-restart">
        重新出击 (DEPLOY AGAIN)
      </button>
    `;

    box.querySelector('#btn-restart')!.addEventListener('click', () => {
      sounds.playUiClick();
      this.clear();
      onRestart();
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }
}
