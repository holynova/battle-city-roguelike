/**
 * Procedural Campaign Route Map (Slay-the-Spire Style Node Progression)
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
}

export class CampaignMap {
  public floors: MapNode[][] = [];
  public currentFloor: number = 0;
  public currentNodeId: string | null = null;
  public totalFloors: number = 5; // 5 floors per Act

  constructor() {
    this.generateAct(1);
  }

  public generateAct(actNumber: number = 1) {
    this.floors = [];
    this.currentFloor = 0;
    this.currentNodeId = null;

    // Floor 0: Starter battles (3 branches)
    const floor0: MapNode[] = [];
    for (let c = 0; c < 3; c++) {
      floor0.push({
        id: `node_0_${c}`,
        floor: 0,
        col: c,
        type: 'battle',
        nameZh: '前哨遭遇战',
        descZh: '肃清敌方先头侦察分队',
        icon: '⚔️',
        nextIds: [],
        visited: false,
        available: true,
      });
    }
    this.floors.push(floor0);

    // Floor 1: Battles / Events
    const floor1: MapNode[] = [];
    const types1: NodeType[] = ['battle', 'event', 'battle'];
    for (let c = 0; c < 3; c++) {
      floor1.push({
        id: `node_1_${c}`,
        floor: 1,
        col: c,
        type: types1[c],
        nameZh: types1[c] === 'event' ? '战地机密' : '阻击战',
        descZh: types1[c] === 'event' ? '未知雷达信号与废弃战车' : '突破敌军中坦巡逻线',
        icon: types1[c] === 'event' ? '❓' : '⚔️',
        nextIds: [],
        visited: false,
        available: false,
      });
    }
    this.floors.push(floor1);

    // Floor 2: Elite / Shop
    const floor2: MapNode[] = [];
    const types2: NodeType[] = ['elite', 'shop', 'elite'];
    for (let c = 0; c < 3; c++) {
      floor2.push({
        id: `node_2_${c}`,
        floor: 2,
        col: c,
        type: types2[c],
        nameZh: types2[c] === 'elite' ? '重装精英' : '黑市军械库',
        descZh: types2[c] === 'elite' ? '遭遇敌方四星重坦王牌' : '采购战术芯片与后勤补给',
        icon: types2[c] === 'elite' ? '💀' : '🛒',
        nextIds: [],
        visited: false,
        available: false,
      });
    }
    this.floors.push(floor2);

    // Floor 3: Rest Depot / Event
    const floor3: MapNode[] = [];
    const types3: NodeType[] = ['rest', 'event', 'rest'];
    for (let c = 0; c < 3; c++) {
      floor3.push({
        id: `node_3_${c}`,
        floor: 3,
        col: c,
        type: types3[c],
        nameZh: types3[c] === 'rest' ? '战地整备所' : '军需遗迹',
        descZh: types3[c] === 'rest' ? '全面修复装甲与强化主炮' : '探索战损的补给军列',
        icon: types3[c] === 'rest' ? '⛺' : '❓',
        nextIds: [],
        visited: false,
        available: false,
      });
    }
    this.floors.push(floor3);

    // Floor 4: Boss Node
    const bossNode: MapNode = {
      id: `node_4_boss`,
      floor: 4,
      col: 1,
      type: 'boss',
      nameZh: actNumber === 1 ? '最终决战：陆上巡洋舰「歌利亚」' : '终极要塞核心',
      descZh: '击溃多炮塔重装要塞巨坦',
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
          // All converge to boss
          curr.nextIds.push(nextLayer[0].id);
        } else {
          // Connect to adjacent columns in next layer
          nextLayer.forEach((next) => {
            if (Math.abs(curr.col - next.col) <= 1) {
              curr.nextIds.push(next.id);
            }
          });
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
