import type { Coordinate } from './events';

// 建筑信息
export interface BuildingInfo {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'government' | 'public';
  floors: number;
  height: number;
  area: number;
  coordinate: Coordinate;
  district: string;
  address: string;
  builtYear: number;
  population?: number;
  status: 'normal' | 'maintenance' | 'renovation';
}

// POI分类
export type POICategory =
  | 'subway'
  | 'bus_station'
  | 'hospital'
  | 'school'
  | 'bank'
  | 'park'
  | 'mall'
  | 'restaurant'
  | 'hotel'
  | 'government'
  | 'police'
  | 'fire_station';

// POI点信息
export interface POIInfo {
  id: string;
  name: string;
  category: POICategory;
  coordinate: Coordinate;
  district: string;
  address: string;
  phone?: string;
  workingHours?: string;
  rating?: number;
}

// 视频监控点
export interface VideoPoint {
  id: string;
  name: string;
  coordinate: Coordinate;
  position: { x: number; y: number; z: number };
  district: string;
  address: string;
  status: 'online' | 'offline' | 'maintenance';
  manufacturer: string;
  model: string;
  installedDate: string;
  lastMaintenance: string;
  streamUrl?: string;
}

// 初始建筑数据（占位）
export const buildings: BuildingInfo[] = [];

// 初始POI数据（占位）
export const pois: POIInfo[] = [];

const districts = ['中心区', '东区', '西区', '南区', '北区'];
const manufacturers = ['海康威视', '大华', '宇视', '华为'];
const models = ['DS-2CD2T47', 'IPC-HFW5442', 'IPC-B512-IR', 'HW-D2040-M'];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateCameraPoints(): VideoPoint[] {
  const points: VideoPoint[] = [];
  const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'online', 'online', 'online', 'offline', 'maintenance'];

  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const radius = 20 + rand(0, 70);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    points.push({
      id: `cam-${String(i + 1).padStart(3, '0')}`,
      name: `监控点位${i + 1}`,
      coordinate: { lat: 39.9042 + rand(-0.05, 0.05), lng: 116.4074 + rand(-0.05, 0.05) } as Coordinate,
      position: { x, y: 8 + rand(0, 4), z },
      district: districts[Math.floor(Math.random() * districts.length)],
      address: `XX路${Math.floor(rand(1, 999))}号`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      model: models[Math.floor(Math.random() * models.length)],
      installedDate: `202${Math.floor(rand(1, 4))}-${String(Math.floor(rand(1, 13))).padStart(2, '0')}-${String(Math.floor(rand(1, 29))).padStart(2, '0')}`,
      lastMaintenance: `2025-${String(Math.floor(rand(1, 7))).padStart(2, '0')}-${String(Math.floor(rand(1, 29))).padStart(2, '0')}`,
      streamUrl: `rtsp://192.168.1.${100 + i}:554/stream`,
    });
  }
  return points;
}

export const cameraPoints: VideoPoint[] = generateCameraPoints();

export const videoPoints: VideoPoint[] = cameraPoints;
