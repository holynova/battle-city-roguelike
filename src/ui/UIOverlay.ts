/**
 * Slay the Spire Inspired Tactical Roguelike Game UI
 * Fully incorporates authentic Slay the Spire aesthetics:
 * - High-Resolution Comic Book Dieselpunk Game Artworks
 * - Slay the Spire Card Anatomy: Energy orb, title ribbon, framed artwork, card type badge, parchment rules box with keyword highlights
 * - Slay the Spire War Map: Weathered parchment background, ascending floor paths with ink dashes, authentic map symbols
 * - Slay the Spire Shopkeeper: Merchant portrait with dialogue bubble, card shelves and relic rows with price tags
 * - Slay the Spire Campfire: Underground bunker campfire art with [ 休息 (REST) ] & [ 锻造 (SMITH) ] decision tablets
 * - Slay the Spire Event: Illustrated storybook modal with narrative choices
 * - Slay the Spire Victory/Defeat: "VICTORY ACHIEVED" & "DEFEAT / THE RUN HAS ENDED" artwork screens
 */

import { UpgradeChip, getRarityColor, ALL_UPGRADES } from '../roguelite/Upgrades';
import { playerInventory } from '../roguelite/Inventory';
import { campaignMap, MapNode } from '../roguelite/CampaignMap';
import { sounds } from '../audio/SoundEffects';
import { bgm } from '../audio/MusicEngine';

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
        btn.textContent = isEnabled ? '🔊 音乐: 开' : '🔇 音乐: 关';
        btn.style.color = isEnabled ? '#facc15' : '#94a3b8';
      });
      btn.addEventListener('mouseenter', () => sounds.playUiHover());
    }
  }

  private attachAudioFeedback(root: HTMLElement) {
    root.querySelectorAll('button, .spire-card, .spire-map-node, .spire-tablet, .spire-event-choice').forEach((el) => {
      el.addEventListener('mouseenter', () => sounds.playUiHover());
    });
  }

  // Get comic-book illustration for upgrade card
  private getCardArtUrl(chipId: string): string {
    switch (chipId) {
      case 'weapon_tesla':
      case 'tesla_coil':
      case 'laser_beam':
      case 'weapon_laser':
        return './assets/images/card_tesla_coil.jpg';
      case 'dual_barrel':
      case 'high_velocity':
      case 'rapid_loader':
      case 'weapon_standard':
        return './assets/images/card_twin_barrel.jpg';
      case 'shield_generator':
      case 'reinforced_armor':
      case 'eagle_nano_shield':
        return './assets/images/card_energy_shield.jpg';
      case 'vampiric_scavenger':
      case 'steel_breaker':
      case 'weapon_vortex':
        return './assets/images/card_vampiric_scavenger.jpg';
      case 'weapon_napalm':
      case 'artillery_barrage':
      case 'bouncing_rounds':
      case 'weapon_cryo':
        return './assets/images/goliath_boss_portrait.jpg';
      default:
        return './assets/images/slay_camp_rest.jpg';
    }
  }

  private getCardTypeInfo(chip: UpgradeChip): { typeZh: string; cost: number; color: string } {
    const attackIds = ['high_velocity', 'rapid_loader', 'bouncing_rounds', 'dual_barrel', 'explosive_shrapnel', 'laser_beam', 'artillery_barrage'];
    const powerIds = ['reinforced_armor', 'scrap_collector', 'nanite_repair', 'vampiric_scavenger', 'eagle_point_defense', 'eagle_nano_shield', 'steel_breaker'];

    if (chip.id.startsWith('weapon_')) {
      return { typeZh: '核心主炮 (WEAPON)', cost: 2, color: '#f59e0b' };
    } else if (attackIds.includes(chip.id)) {
      return { typeZh: '攻击模块 (ATTACK)', cost: 1, color: '#ef4444' };
    } else if (powerIds.includes(chip.id)) {
      return { typeZh: '核心能力 (POWER)', cost: 2, color: '#a855f7' };
    } else {
      return { typeZh: '战术技能 (SKILL)', cost: 1, color: '#38bdf8' };
    }
  }

  private formatKeywords(text: string): string {
    return text
      .replace(/穿甲/g, '<span class="kw-bold kw-pierce">穿甲</span>')
      .replace(/反弹/g, '<span class="kw-bold kw-bounce">反弹</span>')
      .replace(/双管/g, '<span class="kw-bold kw-attack">双管</span>')
      .replace(/装甲/g, '<span class="kw-bold kw-armor">装甲</span>')
      .replace(/护盾/g, '<span class="kw-bold kw-shield">护盾</span>')
      .replace(/生命值/g, '<span class="kw-bold kw-hp">生命值</span>')
      .replace(/电弧/g, '<span class="kw-bold kw-tesla">电弧</span>')
      .replace(/吸取/g, '<span class="kw-bold kw-vamp">吸取</span>')
      .replace(/激光/g, '<span class="kw-bold kw-laser">激光</span>')
      .replace(/烈焰/g, '<span class="kw-bold kw-attack">烈焰</span>')
      .replace(/冰霜/g, '<span class="kw-bold kw-bounce">冰霜</span>')
      .replace(/引力/g, '<span class="kw-bold kw-tesla">引力</span>');
  }

  private injectStyles() {
    if (document.getElementById('slay-spire-styles')) return;
    const style = document.createElement('style');
    style.id = 'slay-spire-styles';
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
      .spire-backdrop {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(14, 18, 28, 0.94) 0%, rgba(3, 5, 10, 0.98) 100%);
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        animation: spireFadeIn 0.22s ease-out;
        padding: 12px;
      }
      @keyframes spireFadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }

      /* Slay the Spire Top Banner Bar */
      .spire-top-bar {
        width: 100%;
        max-width: 960px;
        background: linear-gradient(180deg, #2b1f14 0%, #17110b 100%);
        border: 2px solid #8d6e40;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 215, 0, 0.25);
        padding: 8px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        font-family: 'Share Tech Mono', monospace;
      }
      .spire-top-left {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .spire-stat-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 700;
      }
      .spire-stat-pill.hp {
        color: #ef4444;
      }
      .spire-stat-pill.gold {
        color: #facc15;
      }
      .spire-stat-pill.act {
        color: #e2d7be;
        font-size: 13px;
        font-family: 'Chakra Petch', sans-serif;
      }

      /* -----------------------------------------------------------
         SLAY THE SPIRE TRADING CARDS (Three-Pick-One Card Draft)
      ----------------------------------------------------------- */
      .spire-draft-title {
        font-family: 'Chakra Petch', serif;
        font-size: 28px;
        font-weight: 800;
        color: #facc15;
        letter-spacing: 2px;
        text-shadow: 0 0 20px rgba(250, 204, 21, 0.4), 0 4px 8px rgba(0, 0, 0, 0.8);
        margin-bottom: 4px;
        text-align: center;
      }
      .spire-draft-subtitle {
        font-size: 13px;
        color: #c7b89d;
        font-family: 'Share Tech Mono', monospace;
        letter-spacing: 1px;
        margin-bottom: 22px;
        text-align: center;
      }
      .spire-cards-row {
        display: flex;
        gap: 26px;
        justify-content: center;
        margin-bottom: 24px;
        perspective: 1200px;
      }
      @media (max-width: 800px) {
        .spire-cards-row {
          flex-direction: column;
          align-items: center;
        }
      }
      .spire-card {
        width: 250px;
        height: 380px;
        background: linear-gradient(170deg, #2a2218 0%, #16120c 60%, #0d0a07 100%);
        border: 3px solid var(--card-border, #8d6e40);
        border-radius: 12px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.85), 0 0 25px var(--card-glow, rgba(141, 110, 64, 0.3));
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease, border-color 0.2s;
        transform-style: preserve-3d;
      }
      .spire-card:hover {
        transform: translateY(-8px) scale(1.05) !important;
        border-color: #ffd700;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 40px var(--card-glow, rgba(255, 215, 0, 0.6));
      }
      /* Energy / Scrap Orb */
      .spire-energy-orb {
        position: absolute;
        top: -12px;
        left: -12px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #0284c7 0%, #034875 70%, #011b33 100%);
        border: 2px solid #facc15;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8), 0 0 14px rgba(56, 189, 248, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Chakra Petch', sans-serif;
        font-weight: 800;
        font-size: 20px;
        color: #ffffff;
        z-index: 5;
      }
      /* Title Ribbon */
      .spire-card-title {
        width: 100%;
        background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 20%, rgba(212, 175, 55, 0.4) 50%, rgba(212, 175, 55, 0.2) 80%, transparent 100%);
        border-top: 1px solid #8d6e40;
        border-bottom: 1px solid #8d6e40;
        padding: 5px 0;
        font-size: 16px;
        font-weight: 700;
        color: #fff9ea;
        letter-spacing: 1px;
        text-align: center;
        margin-top: 4px;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
      }
      /* Illustration Frame */
      .spire-card-art-box {
        width: 100%;
        height: 140px;
        border-radius: 6px;
        border: 2px solid #5a452c;
        overflow: hidden;
        margin-bottom: 8px;
        background: #000;
        box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.8);
      }
      .spire-card-art-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      /* Type Bar */
      .spire-card-type-bar {
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        color: #facc15;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      /* Rules Parchment Box */
      .spire-card-desc-box {
        flex: 1;
        width: 100%;
        background: rgba(18, 14, 10, 0.85);
        border: 1px solid #4a3824;
        border-radius: 6px;
        padding: 10px 12px;
        font-size: 12.5px;
        color: #e2d7be;
        line-height: 1.6;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
      }
      .kw-bold {
        font-weight: 700;
      }
      .kw-attack { color: #f87171; }
      .kw-pierce { color: #facc15; }
      .kw-bounce { color: #38bdf8; }
      .kw-armor { color: #4ade80; }
      .kw-shield { color: #60a5fa; }
      .kw-hp { color: #ef4444; }
      .kw-tesla { color: #c084fc; }
      .kw-vamp { color: #34d399; }
      .kw-laser { color: #fb923c; }

      /* Slay the Spire Skip Button */
      .spire-skip-btn {
        background: linear-gradient(180deg, #3d2f21 0%, #20170e 100%);
        border: 2px solid #8d6e40;
        border-radius: 4px;
        color: #e2d7be;
        font-family: 'Chakra Petch', sans-serif;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 2px;
        padding: 10px 36px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
      }
      .spire-skip-btn:hover {
        background: linear-gradient(180deg, #57432f 0%, #322518 100%);
        border-color: #ffd700;
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
      }

      /* -----------------------------------------------------------
         SLAY THE SPIRE CAMPAIGN WAR MAP
      ----------------------------------------------------------- */
      .spire-map-wrapper {
        width: 100%;
        max-width: 960px;
        height: 520px;
        position: relative;
        background-image: url('./assets/images/tactical_parchment_map.jpg');
        background-size: cover;
        background-position: center;
        border: 3px solid #8d6e40;
        border-radius: 8px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 60px rgba(0, 0, 0, 0.7);
        display: flex;
        overflow: hidden;
      }
      .spire-map-scroll-area {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 36px;
        padding: 40px 30px;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
      }
      .spire-map-scroll-area::-webkit-scrollbar {
        width: 8px;
      }
      .spire-map-scroll-area::-webkit-scrollbar-track {
        background: rgba(14, 10, 6, 0.6);
      }
      .spire-map-scroll-area::-webkit-scrollbar-thumb {
        background: #8d6e40;
        border-radius: 4px;
      }
      .spire-map-floor-row {
        display: flex;
        justify-content: center;
        gap: 60px;
        position: relative;
        z-index: 5;
      }
      .spire-map-node {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #2a1f14 0%, #120d07 100%);
        border: 2px solid #5a452c;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: not-allowed;
        opacity: 0.45;
        transition: all 0.22s;
        position: relative;
      }
      .spire-map-node.available {
        cursor: pointer;
        opacity: 1;
        border-color: #ffd700;
        box-shadow: 0 0 24px rgba(255, 215, 0, 0.7), 0 6px 18px rgba(0, 0, 0, 0.9);
        transform: scale(1.15);
        animation: spirePulse 1.6s infinite;
      }
      .spire-map-node.current {
        border-color: #38bdf8;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.8);
      }
      .spire-node-icon {
        font-size: 24px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
      }
      .spire-node-title-tag {
        position: absolute;
        bottom: -18px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 10.5px;
        font-weight: 700;
        color: #e2d7be;
        white-space: nowrap;
        text-shadow: 0 2px 4px #000;
      }
      @keyframes spirePulse {
        0%, 100% { transform: scale(1.15); box-shadow: 0 0 16px rgba(255, 215, 0, 0.5); }
        50% { transform: scale(1.22); box-shadow: 0 0 32px rgba(255, 215, 0, 0.9); }
      }

      /* Right Dossier Sidebar */
      .spire-map-sidebar {
        width: 320px;
        background: rgba(14, 10, 6, 0.92);
        border-left: 2px solid #8d6e40;
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: left;
      }
      .spire-sidebar-heading {
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        color: #facc15;
        border-bottom: 1px solid #5a452c;
        padding-bottom: 6px;
        margin-bottom: 12px;
      }
      .spire-sidebar-title {
        font-size: 22px;
        font-weight: 800;
        color: #fff9ea;
        margin-bottom: 8px;
      }
      .spire-sidebar-desc {
        font-size: 13.5px;
        color: #c7b89d;
        line-height: 1.65;
        margin-bottom: 20px;
      }

      /* -----------------------------------------------------------
         SLAY THE SPIRE SHOP (地牢商人)
      ----------------------------------------------------------- */
      .spire-shop-box {
        width: 100%;
        max-width: 960px;
        background: linear-gradient(180deg, #1f1810 0%, #100c08 100%);
        border: 3px solid #8d6e40;
        border-radius: 8px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95);
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
      }
      .spire-merchant-banner {
        display: flex;
        align-items: center;
        gap: 20px;
        background: rgba(10, 7, 5, 0.85);
        border: 1px solid #5a452c;
        border-radius: 6px;
        padding: 12px 18px;
        margin-bottom: 20px;
        text-align: left;
      }
      .spire-merchant-avatar {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        border: 2px solid #facc15;
        overflow: hidden;
        flex-shrink: 0;
      }
      .spire-merchant-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .spire-speech-bubble {
        font-size: 13.5px;
        color: #e2d7be;
        line-height: 1.6;
        font-style: italic;
      }
      .spire-shop-shelf {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }
      .spire-shop-item-card {
        background: rgba(22, 17, 12, 0.9);
        border: 1px solid #5a452c;
        border-radius: 6px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: left;
        transition: transform 0.2s, border-color 0.2s;
      }
      .spire-shop-item-card:hover {
        border-color: #facc15;
        transform: translateY(-3px);
      }
      .spire-price-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        font-weight: 700;
        color: #facc15;
      }

      /* -----------------------------------------------------------
         SLAY THE SPIRE REST SITE (营火休息)
      ----------------------------------------------------------- */
      .spire-camp-box {
        width: 100%;
        max-width: 960px;
        height: 520px;
        position: relative;
        background-image: url('./assets/images/slay_camp_rest.jpg');
        background-size: cover;
        background-position: center;
        border: 3px solid #8d6e40;
        border-radius: 8px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 80px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 30px;
      }
      .spire-tablets-row {
        display: flex;
        gap: 30px;
        justify-content: center;
        margin-top: auto;
      }
      .spire-tablet {
        width: 280px;
        background: rgba(14, 10, 6, 0.88);
        border: 2px solid #8d6e40;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
        padding: 22px 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
      }
      .spire-tablet:hover {
        transform: translateY(-6px);
        border-color: #ffd700;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 215, 0, 0.5);
      }
      .spire-tablet-icon {
        font-size: 42px;
        margin-bottom: 12px;
      }
      .spire-tablet-title {
        font-size: 20px;
        font-weight: 800;
        color: #fff9ea;
        margin-bottom: 8px;
      }
      .spire-tablet-desc {
        font-size: 13px;
        color: #c7b89d;
        line-height: 1.55;
        text-align: center;
      }

      /* -----------------------------------------------------------
         SLAY THE SPIRE EVENT MODAL (问号事件)
      ----------------------------------------------------------- */
      .spire-event-box {
        width: 100%;
        max-width: 960px;
        background: linear-gradient(180deg, #1f1810 0%, #0d0a07 100%);
        border: 3px solid #8d6e40;
        border-radius: 8px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95);
        display: flex;
        overflow: hidden;
      }
      @media (max-width: 800px) {
        .spire-event-box {
          flex-direction: column;
        }
      }
      .spire-event-left-art {
        flex: 1;
        max-height: 480px;
        background: #000;
        overflow: hidden;
      }
      .spire-event-left-art img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .spire-event-right-story {
        flex: 1;
        padding: 30px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: left;
      }
      .spire-story-title {
        font-size: 24px;
        font-weight: 800;
        color: #ffd700;
        margin-bottom: 14px;
      }
      .spire-story-text {
        font-size: 14px;
        color: #e2d7be;
        line-height: 1.7;
        margin-bottom: 24px;
      }
      .spire-event-choice {
        background: rgba(30, 22, 14, 0.85);
        border: 1px solid #8d6e40;
        border-radius: 4px;
        padding: 12px 18px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }
      .spire-event-choice:hover {
        background: rgba(50, 36, 24, 0.95);
        border-color: #ffd700;
        transform: translateX(4px);
      }
    `;
    document.head.appendChild(style);
  }

  public clear() {
    this.container.innerHTML = '';
  }

  // -------------------------------------------------------------
  // 1. TITLE SCREEN: HIGH RESOLUTION BATTLE ARTWORK
  // -------------------------------------------------------------
  public showStartMenu(onStart: () => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'spire-backdrop';

    const box = document.createElement('div');
    box.style.width = '100%';
    box.style.maxWidth = '960px';
    box.style.background = 'linear-gradient(180deg, #20170f 0%, #100b07 100%)';
    box.style.border = '3px solid #8d6e40';
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 30px 70px rgba(0, 0, 0, 0.95)';
    box.style.overflow = 'hidden';
    box.style.textAlign = 'center';

    box.innerHTML = `
      <!-- Hero Cover Image -->
      <div style="width: 100%; height: 340px; position: relative; overflow: hidden; border-bottom: 2px solid #8d6e40;">
        <img src="./assets/images/title_hero_cover.jpg" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(16, 11, 7, 0.8) 100%);"></div>
        <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center;">
          <h1 style="font-family: 'Chakra Petch', serif; font-size: 38px; font-weight: 800; color: #ffd700; text-shadow: 0 4px 16px rgba(0,0,0,0.9), 0 0 25px rgba(255, 215, 0, 0.4); margin-bottom: 6px;">
            钢铁誓约 · BATTLE CITY: ROGUE BASTION
          </h1>
          <p style="font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #e2d7be; letter-spacing: 2px;">
            [ 4K SLAY-THE-SPIRE STYLE COMBAT & ROGUELIKE REINFORCEMENTS ]
          </p>
        </div>
      </div>

      <!-- Feature Badges -->
      <div style="padding: 24px 30px;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; text-align: left;">
          <div style="background: rgba(30, 22, 14, 0.8); border: 1px solid #5a452c; border-radius: 6px; padding: 12px;">
            <div style="color: #ffd700; font-weight: 700; font-size: 14px; margin-bottom: 4px;">⚔ 10 大战术地形</div>
            <div style="color: #c7b89d; font-size: 12px; line-height: 1.5;">水堑阻隔、废墟巷战、热带密林、极地霜原与钢铁要塞</div>
          </div>
          <div style="background: rgba(30, 22, 14, 0.8); border: 1px solid #5a452c; border-radius: 6px; padding: 12px;">
            <div style="color: #ffd700; font-weight: 700; font-size: 14px; margin-bottom: 4px;">🃏 20+ 战备卡牌</div>
            <div style="color: #c7b89d; font-size: 12px; line-height: 1.5;">双联火炮、高膛穿甲、能量护盾、电弧连锁与死灵吸血</div>
          </div>
          <div style="background: rgba(30, 22, 14, 0.8); border: 1px solid #5a452c; border-radius: 6px; padding: 12px;">
            <div style="color: #ffd700; font-weight: 700; font-size: 14px; margin-bottom: 4px;">⚡ 拟真火控机动</div>
            <div style="color: #c7b89d; font-size: 12px; line-height: 1.5;">360° 自由旋转炮塔、喷气漂移冲刺、老鹰近防自动速射机炮</div>
          </div>
          <div style="background: rgba(30, 22, 14, 0.8); border: 1px solid #5a452c; border-radius: 6px; padding: 12px;">
            <div style="color: #ffd700; font-weight: 700; font-size: 14px; margin-bottom: 4px;">👑 歌利亚巨兽 BOSS</div>
            <div style="color: #c7b89d; font-size: 12px; line-height: 1.5;">多炮塔陆上巡洋要塞巨坦，四联主炮与导弹齐射角斗场死斗</div>
          </div>
        </div>

        <button class="spire-skip-btn" id="btn-start-run" style="font-size: 18px; padding: 14px 50px; background: linear-gradient(180deg, #991b1b 0%, #581010 100%); border-color: #f87171; color: #fff;">
          开始战役 (START RUN)
        </button>
      </div>
    `;

    this.attachAudioFeedback(box);

    box.querySelector('#btn-start-run')!.addEventListener('click', () => {
      sounds.playUiClick();
      sounds.playPowerup();
      this.clear();
      onStart();
    });

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 2. THREE-PICK-ONE SLAY THE SPIRE CARD DRAFT
  // -------------------------------------------------------------
  public showCardDraft(onSelect: (chip: UpgradeChip) => void) {
    bgm.playTrack('briefing');
    sounds.playVictory();
    const choices = playerInventory.getRandomChoices(3);

    const backdrop = document.createElement('div');
    backdrop.className = 'spire-backdrop';

    const box = document.createElement('div');
    box.style.textAlign = 'center';

    box.innerHTML = `
      <div class="spire-draft-title">挑选一张战备模块卡牌</div>
      <div class="spire-draft-subtitle">CHOOSE 1 OF 3 REINFORCEMENT CARDS FOR YOUR DECK</div>

      <div class="spire-cards-row" id="spire-cards-container"></div>

      <button class="spire-skip-btn" id="btn-skip-card">
        跳过此卡 (SKIP CARD)
      </button>
    `;

    const container = box.querySelector('#spire-cards-container')!;

    choices.forEach((chip) => {
      const typeInfo = this.getCardTypeInfo(chip);
      const cardArtUrl = this.getCardArtUrl(chip.id);
      const rColor = getRarityColor(chip.rarity);

      const card = document.createElement('div');
      card.className = 'spire-card';
      card.style.setProperty('--card-border', rColor);
      card.style.setProperty('--card-glow', `${rColor}55`);

      card.innerHTML = `
        <div class="spire-energy-orb">${typeInfo.cost}</div>
        <div class="spire-card-title">${chip.nameZh}</div>
        <div class="spire-card-art-box">
          <img src="${cardArtUrl}" alt="${chip.nameZh}" />
        </div>
        <div class="spire-card-type-bar" style="color: ${typeInfo.color};">${typeInfo.typeZh}</div>
        <div class="spire-card-desc-box">
          <div>${this.formatKeywords(chip.descriptionZh)}</div>
        </div>
      `;

      // 3D Card tilt
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rx = ((y - cy) / cy) * -14;
        const ry = ((x - cx) / cx) * 14;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.05, 1.05, 1.05)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      card.addEventListener('click', () => {
        sounds.playModuleEquip();
        sounds.playPowerup();
        this.clear();
        onSelect(chip);
      });

      container.appendChild(card);
    });

    box.querySelector('#btn-skip-card')!.addEventListener('click', () => {
      sounds.playUiClick();
      this.clear();
      // Dummy empty chip for skip
      onSelect({
        id: 'skip',
        name: 'Skip',
        nameZh: '跳过',
        rarity: 'common',
        description: 'Skipped',
        descriptionZh: '跳过',
        icon: '⏭️'
      });
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 3. CAMPAIGN MAP (SLAY THE SPIRE PARCHMENT SCROLL MAP)
  // -------------------------------------------------------------
  public showCampaignMap(onNodeSelected: (node: MapNode) => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'spire-backdrop';

    // Find first available node
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

    const box = document.createElement('div');
    box.style.width = '100%';
    box.style.maxWidth = '960px';

    box.innerHTML = `
      <!-- Top Slay the Spire Bar -->
      <div class="spire-top-bar">
        <div class="spire-top-left">
          <div class="spire-stat-pill hp">
            <span>♥</span>
            <span>100 / 100 HP</span>
          </div>
          <div class="spire-stat-pill gold">
            <span>⚙</span>
            <span>${playerInventory.scraps} 零件</span>
          </div>
          <div class="spire-stat-pill act">
            <span>第 ${Math.floor(campaignMap.currentFloor / 4) + 1} 幕 // FLOOR ${campaignMap.currentFloor + 1} OF ${campaignMap.totalFloors}</span>
          </div>
        </div>
        <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #ffd700;">
          已装载模块 (${playerInventory.getActiveChips().length})
        </div>
      </div>

      <!-- Spire Parchment Map Container -->
      <div class="spire-map-wrapper">
        <div class="spire-map-scroll-area" id="spire-nodes-scroll"></div>

        <!-- Right Mission Dossier Sidebar -->
        <div class="spire-map-sidebar">
          <div>
            <div class="spire-sidebar-heading">// TACTICAL BRIEFING DOSSIER</div>
            <div class="spire-sidebar-title" id="dossier-title">${defaultPreviewNode ? defaultPreviewNode.nameZh : '选择战区'}</div>
            <div style="display: inline-block; padding: 2px 8px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #ef4444; font-family: 'Share Tech Mono', monospace; font-size: 11px; margin-bottom: 12px;">
              THREAT LEVEL: HIGH
            </div>
            <div class="spire-sidebar-desc" id="dossier-desc">
              ${defaultPreviewNode ? defaultPreviewNode.descZh : '请点击沙盘高亮路线节点确认出击。'}
            </div>
          </div>
          <div>
            <div style="font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #facc15; margin-bottom: 12px;">
              • 预计战利品: 180 ~ 260 零件
            </div>
            <button class="spire-skip-btn" id="btn-enter-spire-node" style="width: 100%; padding: 12px 0; background: linear-gradient(180deg, #991b1b 0%, #581010 100%); border-color: #f87171; color: #fff;" ${defaultPreviewNode ? '' : 'disabled'}>
              踏入战区 (PROCEED)
            </button>
          </div>
        </div>
      </div>
    `;

    const nodesArea = box.querySelector('#spire-nodes-scroll')!;
    const dossierTitle = box.querySelector('#dossier-title') as HTMLElement;
    const dossierDesc = box.querySelector('#dossier-desc') as HTMLElement;
    const btnEnter = box.querySelector('#btn-enter-spire-node') as HTMLButtonElement;

    let selectedNode: MapNode | null = defaultPreviewNode;

    const updateDossier = (node: MapNode) => {
      selectedNode = node;
      dossierTitle.textContent = node.nameZh;
      dossierDesc.textContent = node.descZh;
      btnEnter.disabled = !node.available;
      btnEnter.textContent = node.available ? '踏入战区 (PROCEED)' : '不可通行';
    };

    btnEnter.onclick = () => {
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
      row.className = 'spire-map-floor-row';

      campaignMap.floors[f].forEach((node) => {
        const btn = document.createElement('button');
        btn.className = `spire-map-node ${node.available ? 'available' : ''} ${node.visited ? 'visited' : ''} ${node.id === campaignMap.currentNodeId ? 'current' : ''}`;

        let iconSymbol = '⚔';
        if (node.type === 'elite') iconSymbol = '💀';
        else if (node.type === 'shop') iconSymbol = '🛒';
        else if (node.type === 'rest') iconSymbol = '🔥';
        else if (node.type === 'event') iconSymbol = '?';
        else if (node.type === 'boss') iconSymbol = '👑';

        btn.innerHTML = `
          <span class="spire-node-icon">${iconSymbol}</span>
          <span class="spire-node-title-tag">${node.nameZh.slice(0, 4)}</span>
        `;

        btn.onmouseenter = () => {
          sounds.playUiHover();
          updateDossier(node);
        };

        if (node.available) {
          btn.onclick = () => {
            updateDossier(node);
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

      nodesArea.appendChild(row);
    }

    // Auto-scroll to active / available node
    requestAnimationFrame(() => {
      const activeEl = nodesArea.querySelector('.spire-map-node.available, .spire-map-node.current') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        nodesArea.scrollTop = nodesArea.scrollHeight;
      }
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 4. SLAY THE SPIRE SHOP (地牢黑市商人)
  // -------------------------------------------------------------
  public showShop(onLeave: () => void, onRepair: () => void, onFortify: () => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'spire-backdrop';

    const box = document.createElement('div');
    box.className = 'spire-shop-box';

    const shopChips = ALL_UPGRADES.filter(c => !playerInventory.hasChip(c.id)).slice(0, 3);

    box.innerHTML = `
      <!-- Merchant Portrait & Dialogue -->
      <div class="spire-merchant-banner">
        <div class="spire-merchant-avatar">
          <img src="./assets/images/merchant_shopkeeper.jpg" alt="Merchant" />
        </div>
        <div>
          <div style="font-family: 'Chakra Petch', serif; font-size: 18px; font-weight: 700; color: #ffd700; margin-bottom: 4px;">
            黑市军械军需官「老锤」
          </div>
          <div class="spire-speech-bubble">
            “嘿，车长！前线刚缴获的特种战备芯片，随便挑！只要废铁零件管够，保你一路杀穿歌利亚！”
          </div>
        </div>
        <div style="margin-left: auto; text-align: right; font-family: 'Share Tech Mono', monospace; font-size: 15px; color: #facc15; font-weight: 700;">
          ⚙ 拥有: ${playerInventory.scraps} 零件
        </div>
      </div>

      <!-- Shop Shelf 1: Cards -->
      <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #ffd700; margin-bottom: 8px; text-align: left;">
        // 战备芯片特惠货架 (UPGRADE CARDS)
      </div>
      <div class="spire-shop-shelf" id="shop-cards-shelf"></div>

      <!-- Shop Shelf 2: Services -->
      <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #ffd700; margin-bottom: 8px; text-align: left;">
        // 战地整备服务 (SPECIAL SERVICES)
      </div>
      <div class="spire-shop-shelf" style="margin-bottom: 24px;">
        <div class="spire-shop-item-card">
          <div>
            <div style="font-weight: 700; color: #4ade80; font-size: 15px;">战车紧急大修 (+50 HP)</div>
            <div style="font-size: 12px; color: #c7b89d; margin-top: 4px;">立即修复战车装甲结构 50 点生命值。</div>
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span class="spire-price-tag">⚙ 30 零件</span>
            <button class="spire-skip-btn" id="buy-repair" style="padding: 6px 16px; font-size: 13px;">采购</button>
          </div>
        </div>

        <div class="spire-shop-item-card">
          <div>
            <div style="font-weight: 700; color: #38bdf8; font-size: 15px;">基地钛钢白防线 (25秒)</div>
            <div style="font-size: 12px; color: #c7b89d; margin-top: 4px;">将老鹰指挥要塞周边加固为无敌白钢。</div>
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span class="spire-price-tag">⚙ 40 零件</span>
            <button class="spire-skip-btn" id="buy-fortify" style="padding: 6px 16px; font-size: 13px;">采购</button>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <button class="spire-skip-btn" id="btn-leave-shop">
          离开商店 (LEAVE SHOP)
        </button>
      </div>
    `;

    // Populate Shop Cards
    const cardsShelf = box.querySelector('#shop-cards-shelf')!;
    shopChips.forEach((chip) => {
      const rColor = getRarityColor(chip.rarity);
      const cost = chip.cost || 55;

      const itemCard = document.createElement('div');
      itemCard.className = 'spire-shop-item-card';
      itemCard.innerHTML = `
        <div>
          <div style="font-weight: 700; color: ${rColor}; font-size: 16px;">${chip.nameZh}</div>
          <div style="font-size: 12.5px; color: #c7b89d; margin-top: 4px; line-height: 1.5;">${chip.descriptionZh}</div>
        </div>
        <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span class="spire-price-tag">⚙ ${cost} 零件</span>
          <button class="spire-skip-btn" id="buy-chip-${chip.id}" style="padding: 6px 16px; font-size: 13px;">采购</button>
        </div>
      `;

      itemCard.querySelector(`#buy-chip-${chip.id}`)!.addEventListener('click', () => {
        if (playerInventory.spendScrap(cost)) {
          playerInventory.addChip(chip.id);
          sounds.playUiClick();
          sounds.playPowerup();
          this.clear();
          this.showShop(onLeave, onRepair, onFortify);
        } else {
          sounds.playError();
        }
      });

      cardsShelf.appendChild(itemCard);
    });

    box.querySelector('#buy-repair')!.addEventListener('click', () => {
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

    box.querySelector('#buy-fortify')!.addEventListener('click', () => {
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
  // 5. SLAY THE SPIRE REST SITE (营火休息与主炮锻造)
  // -------------------------------------------------------------
  public showRest(onDone: () => void, onFullHeal: () => void, onUpgradeWeapon: () => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'spire-backdrop';

    const box = document.createElement('div');
    box.className = 'spire-camp-box';

    box.innerHTML = `
      <div style="text-align: center; text-shadow: 0 4px 16px rgba(0,0,0,0.9);">
        <h2 style="font-family: 'Chakra Petch', serif; font-size: 32px; font-weight: 800; color: #ffd700; margin-bottom: 4px;">
          战地地下庇护营火 (REST SITE)
        </h2>
        <p style="font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #e2d7be;">
          在交火间隙寻获掩蔽车间，请选择今夜的整备方案
        </p>
      </div>

      <div class="spire-tablets-row">
        <!-- Tablet 1: Rest -->
        <div class="spire-tablet" id="camp-heal">
          <div class="spire-tablet-icon">🔥</div>
          <div class="spire-tablet-title" style="color: #4ade80;">抢修休整 (REST)</div>
          <div class="spire-tablet-desc">战车恢复 70% 最大生命值，并紧急修复老鹰要塞 50 点装甲。</div>
        </div>

        <!-- Tablet 2: Smith -->
        <div class="spire-tablet" id="camp-upgrade">
          <div class="spire-tablet-icon">🔨</div>
          <div class="spire-tablet-title" style="color: #facc15;">车床锻造 (SMITH)</div>
          <div class="spire-tablet-desc">主炮星级升级 1 阶，全面强化炮弹穿透威力、初速与覆盖面。</div>
        </div>
      </div>
    `;

    box.querySelector('#camp-heal')!.addEventListener('click', () => {
      onFullHeal();
      sounds.playUiClick();
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    box.querySelector('#camp-upgrade')!.addEventListener('click', () => {
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
  // 6. SLAY THE SPIRE EVENT (未知问号叙事事件)
  // -------------------------------------------------------------
  public showEvent(onDone: () => void, onAddScrap: (n: number) => void, onTakeDamage: (n: number) => void) {
    bgm.playTrack('briefing');

    const backdrop = document.createElement('div');
    backdrop.className = 'spire-backdrop';

    const box = document.createElement('div');
    box.className = 'spire-event-box';

    box.innerHTML = `
      <!-- Left: Event Artwork -->
      <div class="spire-event-left-art">
        <img src="./assets/images/event_derelict_tank.jpg" alt="Derelict Prototype Tank" />
      </div>

      <!-- Right: Story & Choices -->
      <div class="spire-event-right-story">
        <div>
          <div style="font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #ffd700; margin-bottom: 6px;">
            // UNKNOWN EVENT // 战地机密发现
          </div>
          <div class="spire-story-title">废弃的原型战车「GOLIATH PROTO」</div>
          <div class="spire-story-text">
            在泥沼与焦黑的巨型弹坑深处，你发现了一辆半埋在废墟中的敌军重型实验坦克。<br/><br/>
            装甲裂口内隐约跳动着高能辐射反应堆的幽蓝电弧，周围散落着尚未受损的高规战备零件与芯片。车长，你打算如何处置？
          </div>
        </div>

        <div>
          <div class="spire-event-choice" id="choice-1">
            <div style="font-weight: 700; color: #f87171; font-size: 14px;">[ 冒险拆解反应堆核心 ]</div>
            <div style="font-size: 12.5px; color: #c7b89d; margin-top: 3px;">高收益高风险：回收 65 零件，被辐射电弧灼伤扣除 20 生命值。</div>
          </div>
          <div class="spire-event-choice" id="choice-2">
            <div style="font-weight: 700; color: #4ade80; font-size: 14px;">[ 安全回收外挂备件 ]</div>
            <div style="font-size: 12.5px; color: #c7b89d; margin-top: 3px;">稳妥收益：拆解外层轻型装甲板，安全获得 30 零件。</div>
          </div>
          <div class="spire-event-choice" id="choice-3">
            <div style="font-weight: 700; color: #e2d7be; font-size: 14px;">[ 保持警戒离开 ]</div>
            <div style="font-size: 12.5px; color: #94a3b8; margin-top: 3px;">不冒任何意外风险，迅速撤离现场。</div>
          </div>
        </div>
      </div>
    `;

    box.querySelector('#choice-1')!.addEventListener('click', () => {
      onAddScrap(65);
      onTakeDamage(20);
      sounds.playExplosion(false);
      this.clear();
      onDone();
    });

    box.querySelector('#choice-2')!.addEventListener('click', () => {
      onAddScrap(30);
      sounds.playPowerup();
      this.clear();
      onDone();
    });

    box.querySelector('#choice-3')!.addEventListener('click', () => {
      sounds.playUiClick();
      this.clear();
      onDone();
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }

  // -------------------------------------------------------------
  // 7. VICTORY & DEFEAT (通关大捷与阵亡战报)
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
    backdrop.className = 'spire-backdrop';

    const box = document.createElement('div');
    box.style.width = '100%';
    box.style.maxWidth = '900px';
    box.style.background = 'linear-gradient(180deg, #20170f 0%, #0d0a07 100%)';
    box.style.border = `3px solid ${isVictory ? '#ffd700' : '#ef4444'}`;
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 30px 70px rgba(0, 0, 0, 0.95)';
    box.style.overflow = 'hidden';
    box.style.textAlign = 'center';

    const bannerArt = isVictory ? './assets/images/victory_medal_art.jpg' : './assets/images/defeat_graveyard_art.jpg';

    box.innerHTML = `
      <div style="width: 100%; height: 320px; position: relative; overflow: hidden; border-bottom: 2px solid ${isVictory ? '#ffd700' : '#ef4444'};">
        <img src="${bannerArt}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
      </div>

      <div style="padding: 24px 30px;">
        <h2 style="font-family: 'Chakra Petch', serif; font-size: 32px; font-weight: 800; color: ${isVictory ? '#ffd700' : '#ef4444'}; margin-bottom: 8px;">
          ${isVictory ? '战役大捷：终极要塞「歌利亚」已彻底粉碎！' : '战役终结：战车残骸终结于此...'}
        </h2>
        <p style="font-size: 14px; color: #c7b89d; margin-bottom: 24px;">
          ${reason}
        </p>

        <!-- Stats Breakdown -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: rgba(14, 10, 6, 0.85); border: 1px solid #5a452c; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
          <div>
            <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #c7b89d;">歼灭敌军</div>
            <div style="font-size: 28px; font-weight: 800; color: #f87171;">${playerInventory.kills} 辆</div>
          </div>
          <div>
            <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #c7b89d;">回收零件</div>
            <div style="font-size: 28px; font-weight: 800; color: #facc15;">${playerInventory.scraps}</div>
          </div>
          <div>
            <div style="font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #c7b89d;">装载模块</div>
            <div style="font-size: 28px; font-weight: 800; color: #c084fc;">${playerInventory.getActiveChips().length} 张</div>
          </div>
        </div>

        <button class="spire-skip-btn" id="btn-restart-run" style="font-size: 17px; padding: 12px 48px; background: linear-gradient(180deg, #991b1b 0%, #581010 100%); border-color: #f87171; color: #fff;">
          再次出击 (RETRY RUN)
        </button>
      </div>
    `;

    box.querySelector('#btn-restart-run')!.addEventListener('click', () => {
      sounds.playUiClick();
      this.clear();
      onRestart();
    });

    this.attachAudioFeedback(box);

    backdrop.appendChild(box);
    this.container.appendChild(backdrop);
  }
}
