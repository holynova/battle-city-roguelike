/**
 * Roguelite Upgrades, Modifiers, and Chip System
 */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UpgradeChip {
  id: string;
  name: string;
  nameZh: string;
  rarity: Rarity;
  description: string;
  descriptionZh: string;
  icon: string;
  cost?: number;
}

export const ALL_UPGRADES: UpgradeChip[] = [
  // --- COMMON CHIPS ---
  {
    id: 'high_velocity',
    name: 'High-Velocity Rounds',
    nameZh: '高膛压穿甲弹',
    rarity: 'common',
    description: 'Bullet speed +35%, damage +15%.',
    descriptionZh: '炮弹飞行速度 +35%，基础伤害 +15%。',
    icon: '⚡',
    cost: 40,
  },
  {
    id: 'reinforced_armor',
    name: 'Reinforced Plating',
    nameZh: '加厚复合装甲',
    rarity: 'common',
    description: 'Max HP +40 and immediately restore 40 HP.',
    descriptionZh: '装甲上限 +40，并立即修复 40 点生命值。',
    icon: '🛡️',
    cost: 45,
  },
  {
    id: 'rapid_loader',
    name: 'Auto-Loading Mechanism',
    nameZh: '双路自动装弹机',
    rarity: 'common',
    description: 'Cannon reload time reduced by 28%.',
    descriptionZh: '主炮装填冷却时间缩短 28%，射速大幅提升。',
    icon: '⏱️',
    cost: 45,
  },
  {
    id: 'turbo_engine',
    name: 'Turbocharger Engine',
    nameZh: '涡轮增压发动机',
    rarity: 'common',
    description: 'Chassis movement speed +25%, dash cooldown -20%.',
    descriptionZh: '战车机动移速 +25%，战术冲刺冷却减少 20%。',
    icon: '🚀',
    cost: 40,
  },
  {
    id: 'scrap_collector',
    name: 'Scrap Magnet Harvester',
    nameZh: '电磁废料回收仪',
    rarity: 'common',
    description: 'Attracts powerups/scraps from afar; scrap drop +50%.',
    descriptionZh: '大范围吸附战利品与零件，零件收益提升 50%。',
    icon: '🧲',
    cost: 35,
  },
  {
    id: 'nanite_repair',
    name: 'Nanite Repair Swarm',
    nameZh: '纳米修复工程虫',
    rarity: 'common',
    description: 'Passively regenerates 3 HP every 4 seconds.',
    descriptionZh: '常驻被动：每 4 秒自动修复 3 点装甲生命值。',
    icon: '🔧',
    cost: 50,
  },

  // --- RARE CHIPS ---
  {
    id: 'bouncing_rounds',
    name: 'Kinetic Bouncing Shells',
    nameZh: '跳弹动能改质',
    rarity: 'rare',
    description: 'Shells bounce off steel walls and borders twice with +25% damage per bounce.',
    descriptionZh: '炮弹命中钢墙或边界时可物理反弹 2 次，每次反弹增伤 25%。',
    icon: '🔄',
    cost: 75,
  },
  {
    id: 'dual_barrel',
    name: 'Twin-Linked Cannons',
    nameZh: '双联并行火炮',
    rarity: 'rare',
    description: 'Fires two parallel shells simultaneously for devastating spread coverage.',
    descriptionZh: '每次开火双管并射两枚炮弹，火力覆盖范围翻倍。',
    icon: '♊',
    cost: 80,
  },
  {
    id: 'ramming_prow',
    name: 'Heavy Ramming Prow',
    nameZh: '重装破障撞角',
    rarity: 'rare',
    description: 'Crash directly through brick walls without stopping; deals 80 ramming damage to enemies.',
    descriptionZh: '可直接碾碎冲穿砖墙障碍，撞击敌人造成 80 点重装冲撞伤害。',
    icon: '🦏',
    cost: 70,
  },
  {
    id: 'incendiary_rounds',
    name: 'Thermite Incendiary Rounds',
    nameZh: '铝热燃烧弹',
    rarity: 'rare',
    description: 'Impacts ignite a pool of ground fire that scorches enemies for 4s.',
    descriptionZh: '着弹点留下一滩高温火海，对进入的敌坦造成持续灼烧。',
    icon: '🔥',
    cost: 75,
  },
  {
    id: 'cryo_shells',
    name: 'Cryo-Frost Ordnance',
    nameZh: '极寒深冷弹头',
    rarity: 'rare',
    description: 'Slows hit enemies by 50%; frozen enemies take double ramming damage.',
    descriptionZh: '炮弹减缓敌人 50% 移速，冰冻受创目标撞墙受双倍伤害。',
    icon: '❄️',
    cost: 70,
  },
  {
    id: 'eagle_point_defense',
    name: 'Eagle Bastion Gatling',
    nameZh: '要塞自动速射近防炮',
    rarity: 'rare',
    description: 'Equips the Eagle Base with an automated 360° point-defense machine gun.',
    descriptionZh: '为老鹰要塞加装全自动 360° 近防速射机炮，自动扫射近身敌军。',
    icon: '🦅',
    cost: 80,
  },
  {
    id: 'eagle_nano_shield',
    name: 'Eagle Nano-Shield Matrix',
    nameZh: '要塞充能能量护盾',
    rarity: 'rare',
    description: 'Eagle Base gains a 50 HP energy shield that regenerates over time.',
    descriptionZh: '老鹰要塞获得 50 点能量护盾，且随时间持续自我充能修复。',
    icon: '💠',
    cost: 75,
  },

  // --- EPIC CHIPS ---
  {
    id: 'railgun_laser',
    name: 'High-Energy Railgun Beam',
    nameZh: '高能电磁轨道炮',
    rarity: 'epic',
    description: 'Replaces cannon with a piercing laser beam that cuts through multiple tanks.',
    descriptionZh: '主炮升级为穿透磁轨光束，瞬间贯穿一条直线上的所有敌坦与砖墙。',
    icon: '💫',
    cost: 120,
  },
  {
    id: 'tesla_overload',
    name: 'Tesla Arc Chain',
    nameZh: '特斯拉闪电链',
    rarity: 'epic',
    description: 'Hits discharge lightning arcs jumping to 2 nearby enemies with EMP stun.',
    descriptionZh: '命中时向周围 2 台敌坦释放高压电弧并造成 EMP 短暂瘫痪。',
    icon: '⚡',
    cost: 110,
  },
  {
    id: 'mortar_siege',
    name: 'Siege Mortar Trajectory',
    nameZh: '重装攻城迫击炮',
    rarity: 'epic',
    description: 'Fires high-arc explosive shells that soar over walls and water to carpet bomb.',
    descriptionZh: '曲射抛射高爆重弹，无视中间墙体与河流阻隔，在瞄准点引发大爆炸。',
    icon: '💣',
    cost: 115,
  },
  {
    id: 'hover_chassis',
    name: 'Hovercraft Amphibious Chassis',
    nameZh: '全地形气垫水陆悬浮底盘',
    rarity: 'epic',
    description: 'Allows floating across water/rivers freely; immune to ice drifting.',
    descriptionZh: '底盘改装为悬浮气垫，可直接漂浮越过河流，并在冰面不再打滑。',
    icon: '🌊',
    cost: 100,
  },
  {
    id: 'vampiric_scavenger',
    name: 'Battlefield Scavenger Core',
    nameZh: '战地纳米吞噬核心',
    rarity: 'epic',
    description: 'Destroying an enemy tank instantly recovers 12 HP.',
    descriptionZh: '击毁任意敌方战车时，立即回收金属纳米修复自身 12 点生命值。',
    icon: '🩸',
    cost: 125,
  },

  // --- LEGENDARY CHIPS ---
  {
    id: 'steel_breaker',
    name: 'Depleted Uranium Core (Steel Breaker)',
    nameZh: '贫铀穿甲弹芯（碎钢者）',
    rarity: 'legendary',
    description: 'Shells obliterate indestructible STEEL walls; deal +75% damage to Heavy/Boss tanks.',
    descriptionZh: '真·破钢者！炮弹可直接轰碎钛合金钢墙，对重装敌人与Boss增伤 75%！',
    icon: '⭐',
    cost: 160,
  },
  {
    id: 'overdrive_thruster',
    name: 'Tactical Overdrive Afterburner',
    nameZh: '战术过载超燃推进器',
    rarity: 'legendary',
    description: 'Dash cooldown halved; dash leaves explosive fire trail and grants invulnerability.',
    descriptionZh: '战术冲刺冷却减半，冲刺时全程无敌并在身后留下剧烈爆炸烈焰。',
    icon: '👑',
    cost: 150,
  }
];

export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return '#94a3b8'; // Slate
    case 'rare': return '#38bdf8';   // Sky Blue
    case 'epic': return '#c084fc';   // Purple
    case 'legendary': return '#facc15'; // Gold
  }
}
