/**
 * Procedural Campaign Route Map (Slay-the-Spire Style 16-Floor Campaign)
 * At least 15 floors with 3 Elite Commander checkpoints (Floors 3, 7, 11) and Final Boss on Floor 15.
 */

export type NodeType = 'battle' | 'elite' | 'shop' | 'event' | 'rest' | 'boss';

export interface MapNode {
  id: string;
  floor: number;
  col: number;
  type: NodeType;
  nameZh: string;
  descZh: string;
  icon: string;
  nextIds: string[];
  visited: boolean;
  available: boolean;
  eliteVariant?: 'ignis' | 'storm' | 'void';
}

export class CampaignMap {
  public floors: MapNode[][] = [];
  public currentFloor: number = 0;
  public currentNodeId: string | null = null;
  public totalFloors: number = 16; // 16 floors (0 to 15)

  constructor() {
    this.generateAct(1);
  }

  public generateAct(_actNumber: number = 1) {
    this.floors = [];
    this.currentFloor = 0;
    this.currentNodeId = null;

    // Floor 0: Act 1 Starters
    this.floors.push([
      { id: 'node_0_0', floor: 0, col: 0, type: 'battle', nameZh: '莱茵水堑', descZh: '深水横阻，攻守狭窄石桥', icon: '⚔️', nextIds: [], visited: false, available: true },
      { id: 'node_0_1', floor: 0, col: 1, type: 'battle', nameZh: '巷战迷宫', descZh: '红砖错综巷道，短兵相接', icon: '⚔️', nextIds: [], visited: false, available: true },
      { id: 'node_0_2', floor: 0, col: 2, type: 'battle', nameZh: '十字防线', descZh: '四通八达开阔街区，清理四角碉堡', icon: '⚔️', nextIds: [], visited: false, available: true }
    ]);

    // Floor 1: Skirmish / Event
    this.floors.push([
      { id: 'node_1_0', floor: 1, col: 0, type: 'battle', nameZh: '热带密林', descZh: '大面积丛林伪装，暗处猎杀敌车', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_1_1', floor: 1, col: 1, type: 'event', nameZh: '战地机密', descZh: '截获军用秘密信号与战损特种原型车', icon: '❓', nextIds: [], visited: false, available: false },
      { id: 'node_1_2', floor: 1, col: 2, type: 'battle', nameZh: '纵深战壕', descZh: '坚固战壕阵地与交叉火力网', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 2: Battle / Black Market Shop
    this.floors.push([
      { id: 'node_2_0', floor: 2, col: 0, type: 'battle', nameZh: '列柱走廊', descZh: '方阵列柱要塞，正面强攻突破', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_2_1', floor: 2, col: 1, type: 'shop', nameZh: '黑市军械', descZh: '采购战术芯片、白钢要塞加固与修护', icon: '🛒', nextIds: [], visited: false, available: false },
      { id: 'node_2_2', floor: 2, col: 2, type: 'battle', nameZh: '双子要塞', descZh: '护城河环抱的双子哨所守军', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 3: [ELITE 1: 烈焰指挥官 (Commander Ignis)]
    this.floors.push([
      {
        id: 'node_3_0',
        floor: 3,
        col: 0,
        type: 'elite',
        nameZh: '鬼火指挥所',
        descZh: '【精英首领】烈焰掠食者指挥官：三向散射爆炎炮与高爆跳雷阵地！',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
        eliteVariant: 'ignis'
      },
      {
        id: 'node_3_1',
        floor: 3,
        col: 1,
        type: 'elite',
        nameZh: '熔岩堡垒',
        descZh: '【精英首领】烈焰掠食者指挥官：三向散射爆炎炮与高爆跳雷阵地！',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
        eliteVariant: 'ignis'
      }
    ]);

    // Floor 4: Rest / Supply
    this.floors.push([
      { id: 'node_4_0', floor: 4, col: 0, type: 'rest', nameZh: '战地篝火', descZh: '休整维修战车装甲并校准主炮', icon: '⛺', nextIds: [], visited: false, available: false },
      { id: 'node_4_1', floor: 4, col: 1, type: 'event', nameZh: '前线遗迹', descZh: '发掘废弃的战地装甲实验核心', icon: '❓', nextIds: [], visited: false, available: false },
      { id: 'node_4_2', floor: 4, col: 2, type: 'rest', nameZh: '野战车库', descZh: '紧急维修战车装甲并强化老鹰防线', icon: '⛺', nextIds: [], visited: false, available: false }
    ]);

    // Floor 5: Act 2 Polar & Desert Battles
    this.floors.push([
      { id: 'node_5_0', floor: 5, col: 0, type: 'battle', nameZh: '极地冰原', descZh: '滑溜冰面地形，极速穿插击溃敌军', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_5_1', floor: 5, col: 1, type: 'battle', nameZh: '钢铁迷城', descZh: '坚固防爆钢板与复杂巷战地形', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_5_2', floor: 5, col: 2, type: 'battle', nameZh: '暗夜丛林', descZh: '暗影遮蔽视线，歼灭高机动突击队', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 6: Heavy Battles & Shop
    this.floors.push([
      { id: 'node_6_0', floor: 6, col: 0, type: 'battle', nameZh: '峡谷隘口', descZh: '狭长防线扼守，直面重装集群冲锋', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_6_1', floor: 6, col: 1, type: 'shop', nameZh: '黑市中继站', descZh: '补给高阶主武器芯片与战地强化', icon: '🛒', nextIds: [], visited: false, available: false },
      { id: 'node_6_2', floor: 6, col: 2, type: 'battle', nameZh: '战损库房', descZh: '清理盘踞在军需库内的导弹坦克连队', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 7: [ELITE 2: 雷暴破坏者泰坦 (Tesla Stormer)]
    this.floors.push([
      {
        id: 'node_7_0',
        floor: 7,
        col: 0,
        type: 'elite',
        nameZh: '雷暴前哨',
        descZh: '【精英首领】雷暴泰坦破坏者：八向环形等离子风暴与重型电磁炮！',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
        eliteVariant: 'storm'
      },
      {
        id: 'node_7_1',
        floor: 7,
        col: 1,
        type: 'elite',
        nameZh: '高压电厂',
        descZh: '【精英首领】雷暴泰坦破坏者：八向环形等离子风暴与重型电磁炮！',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
        eliteVariant: 'storm'
      }
    ]);

    // Floor 8: Rest / Event
    this.floors.push([
      { id: 'node_8_0', floor: 8, col: 0, type: 'rest', nameZh: '前线庇护所', descZh: '全装甲纳米自愈与要塞防空加固', icon: '⛺', nextIds: [], visited: false, available: false },
      { id: 'node_8_1', floor: 8, col: 1, type: 'event', nameZh: '军械试验台', descZh: '过载调试主武器，换取极限射速提升', icon: '❓', nextIds: [], visited: false, available: false },
      { id: 'node_8_2', floor: 8, col: 2, type: 'rest', nameZh: '补给避风港', descZh: '全面检修装甲并为要塞充能', icon: '⛺', nextIds: [], visited: false, available: false }
    ]);

    // Floor 9: High Intensity Skirmish
    this.floors.push([
      { id: 'node_9_0', floor: 9, col: 0, type: 'battle', nameZh: '火山灰烬', descZh: '滚烫焦土与碎石防线，直面重坦主力', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_9_1', floor: 9, col: 1, type: 'battle', nameZh: '死神长廊', descZh: '两侧重机枪暗堡，撕碎敌方穿插部队', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 10: Deep Sector Skirmish & Shop
    this.floors.push([
      { id: 'node_10_0', floor: 10, col: 0, type: 'shop', nameZh: '深渊军需站', descZh: '选购终局史诗模块与武器突破升级', icon: '🛒', nextIds: [], visited: false, available: false },
      { id: 'node_10_1', floor: 10, col: 1, type: 'battle', nameZh: '反应堆外围', descZh: '辐射废墟与敌方王牌装甲连激战', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_10_2', floor: 10, col: 2, type: 'event', nameZh: '紧急广播', descZh: '拦截敌方巡洋舰调度指令获得密报', icon: '❓', nextIds: [], visited: false, available: false }
    ]);

    // Floor 11: [ELITE 3: 虚空引力巨擘 (Void Dreadnought)]
    this.floors.push([
      {
        id: 'node_11_0',
        floor: 11,
        col: 0,
        type: 'elite',
        nameZh: '虚空奇点要塞',
        descZh: '【精英首领】虚空引力使徒：旋转弹幕繁星风暴与黑洞引力弹！',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
        eliteVariant: 'void'
      },
      {
        id: 'node_11_1',
        floor: 11,
        col: 1,
        type: 'elite',
        nameZh: '重力塌缩核心',
        descZh: '【精英首领】虚空引力使徒：旋转弹幕繁星风暴与黑洞引力弹！',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
        eliteVariant: 'void'
      }
    ]);

    // Floor 12: Pre-Endgame Battles
    this.floors.push([
      { id: 'node_12_0', floor: 12, col: 0, type: 'battle', nameZh: '钛金壁垒', descZh: '全钛合金护壁，穿甲弹与跳弹交响曲', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_12_1', floor: 12, col: 1, type: 'battle', nameZh: '末日哨站', descZh: '重火力覆盖，粉碎敌方装甲先锋', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 13: Endgame Final Shop
    this.floors.push([
      { id: 'node_13_0', floor: 13, col: 0, type: 'shop', nameZh: '军团黑市总站', descZh: '最后军需倾销！将所有废铁零件转化为终极战力', icon: '🛒', nextIds: [], visited: false, available: false },
      { id: 'node_13_1', floor: 13, col: 1, type: 'rest', nameZh: '最后的篝火', descZh: '战役终章前的最后装甲整备与战意激发', icon: '⛺', nextIds: [], visited: false, available: false }
    ]);

    // Floor 14: Pre-Boss Vanguard Ambush
    this.floors.push([
      { id: 'node_14_0', floor: 14, col: 0, type: 'battle', nameZh: '巡洋舰泊位', descZh: '突破陆上巡洋舰护卫军团，直抵舰桥', icon: '⚔️', nextIds: [], visited: false, available: false },
      { id: 'node_14_1', floor: 14, col: 1, type: 'battle', nameZh: '核心动力室', descZh: '切断歌利亚动力护盾管线，迎战近卫军', icon: '⚔️', nextIds: [], visited: false, available: false }
    ]);

    // Floor 15: [FINAL BOSS: 超重型陆上巡洋舰「歌利亚」MK-IV]
    const bossNode: MapNode = {
      id: `node_15_boss`,
      floor: 15,
      col: 1,
      type: 'boss',
      nameZh: '终极决战·歌利亚',
      descZh: '【终局决战】陆上巡洋舰「歌利亚」：三阶全域弹幕、扫射激光与全屏重炮！',
      icon: '👑',
      nextIds: [],
      visited: false,
      available: false,
    };
    this.floors.push([bossNode]);

    // Connect node pathways between floors
    for (let f = 0; f < this.floors.length - 1; f++) {
      const currentLayer = this.floors[f];
      const nextLayer = this.floors[f + 1];

      currentLayer.forEach((curr) => {
        if (nextLayer.length === 1) {
          curr.nextIds.push(nextLayer[0].id);
        } else {
          nextLayer.forEach((next) => {
            if (Math.abs(curr.col - next.col) <= 1 || currentLayer.length !== nextLayer.length) {
              curr.nextIds.push(next.id);
            }
          });
          // Guarantee at least 1 connection
          if (curr.nextIds.length === 0 && nextLayer.length > 0) {
            curr.nextIds.push(nextLayer[0].id);
          }
        }
      });
    }
  }

  public selectNode(nodeId: string): MapNode | null {
    const targetNode = this.getNodeById(nodeId);
    if (!targetNode || !targetNode.available) return null;

    targetNode.visited = true;
    this.currentNodeId = targetNode.id;
    this.currentFloor = targetNode.floor;

    // Update availability for next floor
    for (const row of this.floors) {
      for (const node of row) {
        node.available = false;
      }
    }

    for (const nextId of targetNode.nextIds) {
      const nextNode = this.getNodeById(nextId);
      if (nextNode) nextNode.available = true;
    }

    return targetNode;
  }

  public getNodeById(id: string): MapNode | null {
    for (const row of this.floors) {
      for (const node of row) {
        if (node.id === id) return node;
      }
    }
    return null;
  }
}

export const campaignMap = new CampaignMap();
