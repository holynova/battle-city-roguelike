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

  public generateAct(_actNumber: number = 1) {
    this.floors = [];
    this.currentFloor = 0;
    this.currentNodeId = null;

    // Floor 0: Starter battles (3 branches with distinct terrains)
    const floor0: MapNode[] = [
      {
        id: 'node_0_0',
        floor: 0,
        col: 0,
        type: 'battle',
        nameZh: '莱茵水堑',
        descZh: '深水横阻，攻守两座狭窄过河石桥',
        icon: '⚔️',
        nextIds: [],
        visited: false,
        available: true,
      },
      {
        id: 'node_0_1',
        floor: 0,
        col: 1,
        type: 'battle',
        nameZh: '巷战迷宫',
        descZh: '红砖错综巷道，适合拐角近距离伏击',
        icon: '⚔️',
        nextIds: [],
        visited: false,
        available: true,
      },
      {
        id: 'node_0_2',
        floor: 0,
        col: 2,
        type: 'battle',
        nameZh: '十字防线',
        descZh: '四通八达开阔街区，清理四角碉堡',
        icon: '⚔️',
        nextIds: [],
        visited: false,
        available: true,
      }
    ];
    this.floors.push(floor0);

    // Floor 1: Battles / Events
    const floor1: MapNode[] = [
      {
        id: 'node_1_0',
        floor: 1,
        col: 0,
        type: 'battle',
        nameZh: '热带密林',
        descZh: '大面积丛林伪装，在密林暗处猎杀敌车',
        icon: '⚔️',
        nextIds: [],
        visited: false,
        available: false,
      },
      {
        id: 'node_1_1',
        floor: 1,
        col: 1,
        type: 'event',
        nameZh: '战地机密',
        descZh: '截获军用秘密信号与战损特种原型车',
        icon: '❓',
        nextIds: [],
        visited: false,
        available: false,
      },
      {
        id: 'node_1_2',
        floor: 1,
        col: 2,
        type: 'battle',
        nameZh: '纵深战壕',
        descZh: '双向垂直坚固战壕阵地与交叉火力',
        icon: '⚔️',
        nextIds: [],
        visited: false,
        available: false,
      }
    ];
    this.floors.push(floor1);

    // Floor 2: Elite / Shop
    const floor2: MapNode[] = [
      {
        id: 'node_2_0',
        floor: 2,
        col: 0,
        type: 'elite',
        nameZh: '列柱要塞',
        descZh: '列柱方阵要塞，迎战敌方四星重型王牌',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
      },
      {
        id: 'node_2_1',
        floor: 2,
        col: 1,
        type: 'shop',
        nameZh: '黑市军械',
        descZh: '采购战术芯片、白钢要塞加固与修护',
        icon: '🛒',
        nextIds: [],
        visited: false,
        available: false,
      },
      {
        id: 'node_2_2',
        floor: 2,
        col: 2,
        type: 'elite',
        nameZh: '双子要塞',
        descZh: '护城河环抱的双子哨所重装守军',
        icon: '💀',
        nextIds: [],
        visited: false,
        available: false,
      }
    ];
    this.floors.push(floor2);

    // Floor 3: Rest Depot / Event
    const floor3: MapNode[] = [
      {
        id: 'node_3_0',
        floor: 3,
        col: 0,
        type: 'rest',
        nameZh: '战地整备',
        descZh: '全面修复装甲结构并校准强化主炮',
        icon: '⛺',
        nextIds: [],
        visited: false,
        available: false,
      },
      {
        id: 'node_3_1',
        floor: 3,
        col: 1,
        type: 'event',
        nameZh: '军需遗迹',
        descZh: '搜刮深入战区遗弃的军需补给列车',
        icon: '❓',
        nextIds: [],
        visited: false,
        available: false,
      },
      {
        id: 'node_3_2',
        floor: 3,
        col: 2,
        type: 'rest',
        nameZh: '前线工兵',
        descZh: '紧急维修战车装甲并强化老鹰防线',
        icon: '⛺',
        nextIds: [],
        visited: false,
        available: false,
      }
    ];
    this.floors.push(floor3);

    // Floor 4: Boss Node
    const bossNode: MapNode = {
      id: `node_4_boss`,
      floor: 4,
      col: 1,
      type: 'boss',
      nameZh: '决战歌利亚',
      descZh: '在巨型角斗场终极决战陆上巡洋舰「歌利亚」！',
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
