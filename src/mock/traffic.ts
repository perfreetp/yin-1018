import type { Coordinate } from './events';

export type RoadLevel = 'expressway' | 'main_road' | 'secondary_road';
export type TrafficStatus = 'smooth' | 'slow' | 'congested' | 'blocked';

export interface TrafficRoad {
  id: string;
  name: string;
  level: RoadLevel;
  status: TrafficStatus;
  speed: number;
  vehicleCount: number;
  congestionIndex: number;
  path: Coordinate[];
  length: number;
  lanes: number;
  district: string;
}

export interface BusInfo {
  id: string;
  lineNumber: string;
  lineName: string;
  startStation: string;
  endStation: string;
  operationTime: string;
  ticketPrice: string;
  totalStations: number;
  currentBuses: number;
  averageInterval: number;
  path: Coordinate[];
  stations: Array<{ name: string; coordinate: Coordinate; order: number }>;
  status: 'normal' | 'delayed' | 'suspended';
}

export interface TrafficMetrics {
  totalVehicles: number;
  averageSpeed: number;
  congestionIndex: number;
  smoothRate: number;
  slowRate: number;
  congestedRate: number;
  blockedRate: number;
  totalRoadLength: number;
  totalBusLines: number;
  totalBuses: number;
  totalPassengers: number;
  peakHour: string;
  peakFlow: number;
  comparedYesterday: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

function generatePath(start: Coordinate, segments: number, offsetRange = 0.01): Coordinate[] {
  const path: Coordinate[] = [start];
  let current = { ...start };
  for (let i = 0; i < segments; i++) {
    current = {
      lng: current.lng + (Math.random() - 0.5) * offsetRange,
      lat: current.lat + (Math.random() - 0.5) * offsetRange
    };
    path.push({ ...current });
  }
  return path;
}

const roadNames: Array<{ name: string; level: RoadLevel; district: string; start: Coordinate }> = [
  { name: '中山大道', level: 'main_road', district: '中心街道', start: { lng: 116.395, lat: 39.908 } },
  { name: '人民快速路', level: 'expressway', district: '中心街道', start: { lng: 116.400, lat: 39.912 } },
  { name: '建设路', level: 'secondary_road', district: '中心街道', start: { lng: 116.410, lat: 39.900 } },
  { name: '湖滨路', level: 'main_road', district: '东湖街道', start: { lng: 116.428, lat: 39.925 } },
  { name: '望湖大道', level: 'expressway', district: '东湖街道', start: { lng: 116.438, lat: 39.932 } },
  { name: '东岸街', level: 'secondary_road', district: '东湖街道', start: { lng: 116.442, lat: 39.920 } },
  { name: '西山路', level: 'main_road', district: '西湖街道', start: { lng: 116.375, lat: 39.918 } },
  { name: '湖西街', level: 'secondary_road', district: '西湖街道', start: { lng: 116.385, lat: 39.910 } },
  { name: '南山大道', level: 'main_road', district: '南山街道', start: { lng: 116.418, lat: 39.872 } },
  { name: '南环快速路', level: 'expressway', district: '南山街道', start: { lng: 116.428, lat: 39.868 } },
  { name: '北岭路', level: 'main_road', district: '北岭街道', start: { lng: 116.390, lat: 39.940 } },
  { name: '世纪大道', level: 'expressway', district: '新城街道', start: { lng: 116.448, lat: 39.888 } }
];

const statusWeights: TrafficStatus[] = ['smooth', 'smooth', 'smooth', 'slow', 'slow', 'congested', 'blocked'];

function randomStatus(): TrafficStatus {
  return statusWeights[randomInt(0, statusWeights.length - 1)];
}

function speedByStatus(status: TrafficStatus): number {
  const ranges: Record<TrafficStatus, [number, number]> = {
    smooth: [45, 65],
    slow: [20, 35],
    congested: [5, 15],
    blocked: [0, 3]
  };
  const [min, max] = ranges[status];
  return randomInt(min, max);
}

function congestionByStatus(status: TrafficStatus): number {
  const ranges: Record<TrafficStatus, [number, number]> = {
    smooth: [0.1, 0.3],
    slow: [0.4, 0.6],
    congested: [0.7, 0.85],
    blocked: [0.9, 1.0]
  };
  return randomFloat(ranges[status][0], ranges[status][1], 2);
}

export const trafficRoads: TrafficRoad[] = roadNames.map((road, index) => {
  const status = randomStatus();
  return {
    id: `ROAD${String(index + 1).padStart(4, '0')}`,
    name: road.name,
    level: road.level,
    status,
    speed: speedByStatus(status),
    vehicleCount: randomInt(120, 2800),
    congestionIndex: congestionByStatus(status),
    path: generatePath(road.start, randomInt(6, 12)),
    length: randomFloat(1.2, 8.5, 1),
    lanes: road.level === 'expressway' ? randomInt(6, 8) : road.level === 'main_road' ? randomInt(4, 6) : randomInt(2, 4),
    district: road.district
  };
});

const busLineTemplates = [
  { line: '1路', name: '中心环线', start: '中心站', end: '东站', price: '2元' },
  { line: '5路', name: '东西快线', start: '东湖客运站', end: '西山公园', price: '2元' },
  { line: '8路', name: '南北干线', start: '北岭广场', end: '南山工业园', price: '2元' },
  { line: '12路', name: '新城专线', start: '新城会展中心', end: '中心火车站', price: '3元' },
  { line: '15路', name: '观光1号线', start: '火车站', end: '科技园区', price: '2元' },
  { line: '23路', name: '社区接驳A线', start: '湖畔花园', end: '地铁口', price: '1元' },
  { line: '28路', name: '晚班线', start: '商业中心', end: '居民小区', price: '2元' },
  { line: '36路', name: '机场快线', start: '市中心', end: '国际机场', price: '20元' },
  { line: '52路', name: '高峰专线', start: '工业园', end: '软件园', price: '2元' },
  { line: '88路', name: '夜间接驳', start: '夜市街', end: '大学城', price: '2元' }
];

const districtCoords: Record<string, Coordinate> = {
  '中心街道': { lng: 116.4074, lat: 39.9042 },
  '东湖街道': { lng: 116.4342, lat: 39.9289 },
  '西湖街道': { lng: 116.3821, lat: 39.9156 },
  '南山街道': { lng: 116.4215, lat: 39.8765 },
  '北岭街道': { lng: 116.3956, lat: 39.9432 },
  '新城街道': { lng: 116.4512, lat: 39.8923 }
};

function generateStations(startCoord: Coordinate, endCoord: Coordinate, count: number): Array<{ name: string; coordinate: Coordinate; order: number }> {
  const stations: Array<{ name: string; coordinate: Coordinate; order: number }> = [];
  const stationNames = ['中山路', '人民路', '广场', '公园', '商场', '医院', '学校', '社区', '路口', '小区'];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    stations.push({
      name: `${stationNames[(i + Math.floor(Math.random() * stationNames.length)) % stationNames.length]}${i + 1}站`,
      coordinate: {
        lng: startCoord.lng + (endCoord.lng - startCoord.lng) * t + (Math.random() - 0.5) * 0.008,
        lat: startCoord.lat + (endCoord.lat - startCoord.lat) * t + (Math.random() - 0.5) * 0.008
      },
      order: i + 1
    });
  }
  return stations;
}

const districtList = ['中心街道', '东湖街道', '西湖街道', '南山街道', '北岭街道', '新城街道'];

export const busInfos: BusInfo[] = busLineTemplates.map((bus, index) => {
  const startDist = districtList[index % districtList.length];
  const endDist = districtList[(index + 2) % districtList.length];
  const startCoord = districtCoords[startDist];
  const endCoord = districtCoords[endDist];
  const stationCount = randomInt(8, 18);
  const statuses: Array<'normal' | 'delayed' | 'suspended'> = ['normal', 'normal', 'normal', 'normal', 'delayed'];
  return {
    id: `BUS${String(index + 1).padStart(4, '0')}`,
    lineNumber: bus.line,
    lineName: bus.name,
    startStation: bus.start,
    endStation: bus.end,
    operationTime: '06:00 - 22:30',
    ticketPrice: bus.price,
    totalStations: stationCount,
    currentBuses: randomInt(3, 12),
    averageInterval: randomInt(5, 15),
    path: generatePath(startCoord, randomInt(10, 18), 0.015),
    stations: generateStations(startCoord, endCoord, stationCount),
    status: statuses[randomInt(0, statuses.length - 1)]
  };
});

const smoothCount = trafficRoads.filter(r => r.status === 'smooth').length;
const slowCount = trafficRoads.filter(r => r.status === 'slow').length;
const congestedCount = trafficRoads.filter(r => r.status === 'congested').length;
const blockedCount = trafficRoads.filter(r => r.status === 'blocked').length;
const totalRoadCount = trafficRoads.length;

export const trafficMetrics: TrafficMetrics = {
  totalVehicles: randomInt(85000, 120000),
  averageSpeed: randomFloat(28, 42),
  congestionIndex: randomFloat(0.35, 0.55, 2),
  smoothRate: randomFloat(smoothCount / totalRoadCount * 0.85, smoothCount / totalRoadCount * 1.0, 2),
  slowRate: randomFloat(slowCount / totalRoadCount * 0.85, slowCount / totalRoadCount * 1.0, 2),
  congestedRate: randomFloat(congestedCount / totalRoadCount * 0.85, congestedCount / totalRoadCount * 1.0, 2),
  blockedRate: randomFloat(blockedCount / totalRoadCount * 0.85, blockedCount / totalRoadCount * 1.0, 2),
  totalRoadLength: trafficRoads.reduce((sum, r) => sum + r.length, 0),
  totalBusLines: busInfos.length,
  totalBuses: busInfos.reduce((sum, b) => sum + b.currentBuses, 0),
  totalPassengers: randomInt(180000, 260000),
  peakHour: '08:15 - 09:00',
  peakFlow: randomInt(8500, 12000),
  comparedYesterday: randomFloat(-5, 8, 1)
};

export function getRoadsByDistrict(district: string): TrafficRoad[] {
  return trafficRoads.filter(r => r.district === district);
}

export function getRoadsByStatus(status: TrafficStatus): TrafficRoad[] {
  return trafficRoads.filter(r => r.status === status);
}

export function getCongestedRoads(): TrafficRoad[] {
  return trafficRoads.filter(r => ['congested', 'blocked'].includes(r.status));
}
