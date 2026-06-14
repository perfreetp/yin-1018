import type { Coordinate } from './events';

export type FloodLevel = 'light' | 'moderate' | 'heavy' | 'severe';
export type ManholeIssueType = 'missing' | 'damaged' | 'tilted' | 'blocked' | 'overflow';
export type PumpStatus = 'running' | 'stopped' | 'maintenance' | 'fault';

export interface FloodPoint {
  id: string;
  name: string;
  level: FloodLevel;
  depth: number;
  area: number;
  affectedLanes: number;
  coordinate: Coordinate;
  district: string;
  address: string;
  startTime: string;
  expectedDrainTime: string;
  handlerTeam: string;
  vehiclesAffected: number;
  isDraining: boolean;
}

export interface ManholeIssue {
  id: string;
  location: string;
  issueType: ManholeIssueType;
  coordinate: Coordinate;
  district: string;
  reportTime: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'critical';
  hasWarningSign: boolean;
  assignedWorker: string;
  repairStatus: 'pending' | 'arrived' | 'repairing' | 'completed';
  estimatedCompleteTime: string;
}

export interface PumpStation {
  id: string;
  name: string;
  capacity: number;
  currentFlow: number;
  waterLevel: number;
  maxWaterLevel: number;
  warningWaterLevel: number;
  status: PumpStatus;
  coordinate: Coordinate;
  district: string;
  address: string;
  operators: number;
  lastMaintenance: string;
  nextMaintenance: string;
  runningHours: number;
  powerConsumption: number;
  efficiency: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const districtList = ['中心街道', '东湖街道', '西湖街道', '南山街道', '北岭街道', '新城街道'];

const districtCoords: Record<string, Coordinate> = {
  '中心街道': { lng: 116.4074, lat: 39.9042 },
  '东湖街道': { lng: 116.4342, lat: 39.9289 },
  '西湖街道': { lng: 116.3821, lat: 39.9156 },
  '南山街道': { lng: 116.4215, lat: 39.8765 },
  '北岭街道': { lng: 116.3956, lat: 39.9432 },
  '新城街道': { lng: 116.4512, lat: 39.8923 }
};

function randomCoord(district: string): Coordinate {
  const base = districtCoords[district];
  return {
    lng: base.lng + (Math.random() - 0.5) * 0.03,
    lat: base.lat + (Math.random() - 0.5) * 0.03
  };
}

function generateTime(base: Date, offsetMinutes: number): string {
  const date = new Date(base.getTime() + offsetMinutes * 60 * 1000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

const floodBaseTime = new Date('2026-06-15T07:30:00');

const floodNames = [
  '人民路下穿隧道', '中山大道地下通道', '湖滨路低洼路段', '南山工业园门口',
  '世纪大道涵洞', '西山路老旧小区', '北岭广场地下停车场入口', '东湖路立交桥下'
];

const floodLevels: FloodLevel[] = ['light', 'moderate', 'heavy', 'severe'];
const floodDepthRange: Record<FloodLevel, [number, number]> = {
  light: [0.1, 0.3],
  moderate: [0.3, 0.6],
  heavy: [0.6, 1.2],
  severe: [1.2, 2.5]
};
const floodAreaRange: Record<FloodLevel, [number, number]> = {
  light: [50, 200],
  moderate: [200, 800],
  heavy: [800, 2000],
  severe: [2000, 5000]
};

const handlerTeams = ['排水一组', '排水二组', '排水三组', '应急抢险队', '市政维护队'];

export const floodPoints: FloodPoint[] = floodNames.map((name, index) => {
  const district = districtList[index % districtList.length];
  const level = floodLevels[index % floodLevels.length];
  const [minDepth, maxDepth] = floodDepthRange[level];
  const [minArea, maxArea] = floodAreaRange[level];
  const startOffset = randomInt(-180, -30);
  return {
    id: `FLD${String(index + 1).padStart(4, '0')}`,
    name,
    level,
    depth: randomFloat(minDepth, maxDepth, 2),
    area: randomInt(minArea, maxArea),
    affectedLanes: level === 'light' ? randomInt(1, 2) : level === 'moderate' ? randomInt(2, 4) : level === 'heavy' ? randomInt(3, 6) : randomInt(4, 8),
    coordinate: randomCoord(district),
    district,
    address: `${district} ${name}`,
    startTime: generateTime(floodBaseTime, startOffset),
    expectedDrainTime: generateTime(floodBaseTime, startOffset + randomInt(60, 240)),
    handlerTeam: randomFrom(handlerTeams),
    vehiclesAffected: level === 'light' ? randomInt(0, 5) : level === 'moderate' ? randomInt(5, 20) : level === 'heavy' ? randomInt(20, 60) : randomInt(60, 150),
    isDraining: Math.random() > 0.2
  };
});

const manholeIssueTypes: ManholeIssueType[] = ['missing', 'damaged', 'tilted', 'blocked', 'overflow'];
const dangerMap: Record<ManholeIssueType, Array<'low' | 'medium' | 'high' | 'critical'>> = {
  missing: ['high', 'critical'],
  damaged: ['medium', 'high'],
  tilted: ['low', 'medium'],
  blocked: ['medium', 'high'],
  overflow: ['high', 'critical']
};
const repairStatuses: Array<'pending' | 'arrived' | 'repairing' | 'completed'> = ['pending', 'arrived', 'repairing', 'repairing', 'completed'];

const workers = ['王师傅-井盖维修组', '李师傅-市政维修', '张工-管线维护', '陈队-应急维修', '刘师傅-井盖班'];

const manholeBaseTime = new Date('2026-06-15T06:00:00');

export const manholeIssues: ManholeIssue[] = Array.from({ length: 12 }, (_, i) => {
  const district = districtList[i % districtList.length];
  const issueType = manholeIssueTypes[i % manholeIssueTypes.length];
  const dangerLevel = randomFrom(dangerMap[issueType]);
  const reportOffset = randomInt(-480, -60);
  return {
    id: `MHL${String(i + 1).padStart(4, '0')}`,
    location: `第${i + 1}号井`,
    issueType,
    coordinate: randomCoord(district),
    district,
    reportTime: generateTime(manholeBaseTime, reportOffset),
    dangerLevel,
    hasWarningSign: Math.random() > 0.3,
    assignedWorker: randomFrom(workers),
    repairStatus: repairStatuses[randomInt(0, repairStatuses.length - 1)],
    estimatedCompleteTime: generateTime(manholeBaseTime, reportOffset + randomInt(60, 360))
  };
});

const pumpNames = [
  '中心排水泵站', '东湖排涝站', '西湖雨水泵站', '南山工业园泵站',
  '北岭防洪泵站', '新城污水泵站'
];

const pumpStatuses: PumpStatus[] = ['running', 'running', 'running', 'running', 'stopped', 'maintenance', 'fault'];

export const pumpStations: PumpStation[] = pumpNames.map((name, index) => {
  const district = districtList[index % districtList.length];
  const status = randomFrom(pumpStatuses);
  const capacity = randomInt(500, 5000);
  const currentFlow = status === 'running' ? randomInt(Math.floor(capacity * 0.4), capacity) : 0;
  const maxWaterLevel = randomFloat(6, 12);
  const warningWaterLevel = randomFloat(maxWaterLevel * 0.7, maxWaterLevel * 0.85);
  const waterLevel = status === 'fault' ? randomFloat(warningWaterLevel, maxWaterLevel) : randomFloat(1, warningWaterLevel);
  return {
    id: `PMP${String(index + 1).padStart(4, '0')}`,
    name,
    capacity,
    currentFlow,
    waterLevel: randomFloat(waterLevel * 0.9, waterLevel, 2),
    maxWaterLevel,
    warningWaterLevel: randomFloat(warningWaterLevel * 0.95, warningWaterLevel, 2),
    status,
    coordinate: randomCoord(district),
    district,
    address: `${district} ${name}`,
    operators: randomInt(2, 6),
    lastMaintenance: '2026-05-20 09:00:00',
    nextMaintenance: '2026-07-20 09:00:00',
    runningHours: randomInt(1200, 5800),
    powerConsumption: currentFlow > 0 ? randomFloat(currentFlow * 0.8, currentFlow * 1.5, 1) : 0,
    efficiency: status === 'running' ? randomFloat(75, 95, 1) : 0
  };
});

export function getFloodPointsByDistrict(district: string): FloodPoint[] {
  return floodPoints.filter(f => f.district === district);
}

export function getSevereFloodPoints(): FloodPoint[] {
  return floodPoints.filter(f => ['heavy', 'severe'].includes(f.level));
}

export function getManholeIssuesByDistrict(district: string): ManholeIssue[] {
  return manholeIssues.filter(m => m.district === district);
}

export function getCriticalManholeIssues(): ManholeIssue[] {
  return manholeIssues.filter(m => m.dangerLevel === 'critical' || (m.dangerLevel === 'high' && m.repairStatus !== 'completed'));
}

export function getPumpStationsByStatus(status: PumpStatus): PumpStation[] {
  return pumpStations.filter(p => p.status === status);
}

export function getWarningPumpStations(): PumpStation[] {
  return pumpStations.filter(p => p.waterLevel >= p.warningWaterLevel || p.status === 'fault');
}
