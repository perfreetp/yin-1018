import type { Coordinate } from './events';

export type AQILevel = 'excellent' | 'good' | 'mild' | 'moderate' | 'heavy' | 'severe';

export interface AirQuality {
  id: string;
  stationName: string;
  district: string;
  coordinate: Coordinate;
  aqi: number;
  aqiLevel: AQILevel;
  pm25: number;
  pm10: number;
  so2: number;
  no2: number;
  co: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  updateTime: string;
  primaryPollutant?: string;
}

export interface NoiseData {
  id: string;
  monitorName: string;
  district: string;
  coordinate: Coordinate;
  currentDb: number;
  dayAverage: number;
  nightAverage: number;
  maxDb: number;
  minDb: number;
  standardLimit: number;
  isOverLimit: boolean;
  overLimitCount: number;
  zoneType: 'residential' | 'commercial' | 'industrial' | 'hospital' | 'school';
  updateTime: string;
  hourlyData: number[];
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  windSpeed: number;
  windDirection: string;
  windLevel: number;
  weather: string;
  weatherIcon: string;
  aqi: number;
  aqiLevel: AQILevel;
  sunrise: string;
  sunset: string;
  updateTime: string;
  forecast: Array<{
    date: string;
    dayWeather: string;
    nightWeather: string;
    highTemp: number;
    lowTemp: number;
    windDirection: string;
    windLevel: number;
    aqi: number;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;
    weather: string;
    precipitation: number;
  }>;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
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
    lng: base.lng + (Math.random() - 0.5) * 0.025,
    lat: base.lat + (Math.random() - 0.5) * 0.025
  };
}

function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return 'excellent';
  if (aqi <= 100) return 'good';
  if (aqi <= 150) return 'mild';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'heavy';
  return 'severe';
}

const airStationNames = [
  '中心监测站', '东湖公园站', '西湖风景区站', '南山工业园站',
  '北岭山区站', '新城科技园站'
];

const primaryPollutants = ['PM2.5', 'PM10', 'NO2', 'O3', 'CO', 'SO2'];

function generateTime(base: Date, offsetMinutes: number): string {
  const date = new Date(base.getTime() + offsetMinutes * 60 * 1000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

const envBaseTime = new Date('2026-06-15T10:00:00');
const windDirections = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];

export const airQualityStations: AirQuality[] = airStationNames.map((name, index) => {
  const district = districtList[index % districtList.length];
  const aqi = randomInt(35, 165);
  const hasPrimary = aqi > 80;
  return {
    id: `AIR${String(index + 1).padStart(4, '0')}`,
    stationName: name,
    district,
    coordinate: randomCoord(district),
    aqi,
    aqiLevel: getAQILevel(aqi),
    pm25: randomInt(12, 120),
    pm10: randomInt(30, 200),
    so2: randomFloat(3, 28, 1),
    no2: randomInt(15, 110),
    co: randomFloat(0.4, 2.2, 1),
    o3: randomInt(40, 180),
    temperature: randomFloat(22, 35),
    humidity: randomInt(35, 85),
    windSpeed: randomFloat(0.5, 6.5),
    windDirection: windDirections[randomInt(0, windDirections.length - 1)],
    updateTime: generateTime(envBaseTime, randomInt(-120, -5)),
    primaryPollutant: hasPrimary ? primaryPollutants[randomInt(0, primaryPollutants.length - 1)] : undefined
  };
});

const noiseNames = [
  '居民区A区', '中心商业街', '第一医院', '实验小学', '工业园西区',
  '东湖居民区', '西湖景区', '南山学校', '北岭医院', '科技园B区'
];

const noiseDistricts = [
  '中心街道', '中心街道', '中心街道', '中心街道', '南山街道',
  '东湖街道', '西湖街道', '南山街道', '北岭街道', '新城街道'
];

const zoneTypes: Array<'residential' | 'commercial' | 'industrial' | 'hospital' | 'school'> = [
  'residential', 'commercial', 'hospital', 'school', 'industrial',
  'residential', 'residential', 'school', 'hospital', 'industrial'
];

const standardLimits: Record<string, number> = {
  residential: 55,
  commercial: 60,
  industrial: 65,
  hospital: 50,
  school: 55
};

export const noiseMonitorPoints: NoiseData[] = noiseNames.map((name, index) => {
  const district = noiseDistricts[index];
  const zoneType = zoneTypes[index];
  const limit = standardLimits[zoneType];
  const currentDb = randomFloat(40, limit + 15);
  const isOverLimit = currentDb > limit;
  return {
    id: `NOI${String(index + 1).padStart(4, '0')}`,
    monitorName: name,
    district,
    coordinate: randomCoord(district),
    currentDb: randomFloat(currentDb * 0.95, currentDb, 1),
    dayAverage: randomFloat(limit - 10, limit + 5, 1),
    nightAverage: randomFloat(limit - 20, limit, 1),
    maxDb: randomFloat(limit + 5, limit + 25, 1),
    minDb: randomFloat(30, limit - 15, 1),
    standardLimit: limit,
    isOverLimit,
    overLimitCount: isOverLimit ? randomInt(1, 18) : randomInt(0, 3),
    zoneType,
    updateTime: generateTime(envBaseTime, randomInt(-60, -2)),
    hourlyData: Array.from({ length: 24 }, () => randomFloat(limit - 20, limit + 15, 1))
  };
});

export const weatherData: WeatherData = {
  temperature: randomFloat(26, 34),
  feelsLike: randomFloat(28, 38),
  humidity: randomInt(40, 80),
  pressure: randomInt(998, 1015),
  visibility: randomFloat(5, 25),
  uvIndex: randomInt(5, 11),
  windSpeed: randomFloat(1, 5),
  windDirection: windDirections[randomInt(0, windDirections.length - 1)],
  windLevel: randomInt(2, 5),
  weather: '多云',
  weatherIcon: 'cloudy',
  aqi: randomInt(55, 95),
  aqiLevel: 'good',
  sunrise: '04:52',
  sunset: '19:48',
  updateTime: generateTime(envBaseTime, -10),
  forecast: [
    { date: '06-15', dayWeather: '多云', nightWeather: '晴', highTemp: 34, lowTemp: 22, windDirection: '南风', windLevel: 3, aqi: 78 },
    { date: '06-16', dayWeather: '晴', nightWeather: '多云', highTemp: 35, lowTemp: 23, windDirection: '东南风', windLevel: 2, aqi: 65 },
    { date: '06-17', dayWeather: '雷阵雨', nightWeather: '小雨', highTemp: 30, lowTemp: 21, windDirection: '东风', windLevel: 4, aqi: 52 },
    { date: '06-18', dayWeather: '小雨', nightWeather: '阴', highTemp: 28, lowTemp: 20, windDirection: '东北风', windLevel: 3, aqi: 48 },
    { date: '06-19', dayWeather: '阴', nightWeather: '多云', highTemp: 29, lowTemp: 20, windDirection: '北风', windLevel: 2, aqi: 58 },
    { date: '06-20', dayWeather: '多云', nightWeather: '晴', highTemp: 32, lowTemp: 21, windDirection: '西北风', windLevel: 2, aqi: 72 },
    { date: '06-21', dayWeather: '晴', nightWeather: '晴', highTemp: 35, lowTemp: 23, windDirection: '西风', windLevel: 3, aqi: 85 }
  ],
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    temperature: i >= 6 && i <= 18 ? randomFloat(26, 35) : randomFloat(20, 27),
    weather: i >= 13 && i <= 16 ? '雷阵雨' : '多云',
    precipitation: i >= 13 && i <= 16 ? randomFloat(0.5, 3.5, 1) : 0
  }))
};

export function getAirQualityByDistrict(district: string): AirQuality | undefined {
  return airQualityStations.find(a => a.district === district);
}

export function getOverLimitNoisePoints(): NoiseData[] {
  return noiseMonitorPoints.filter(n => n.isOverLimit);
}

export function getAverageAQI(): number {
  return Math.round(airQualityStations.reduce((sum, s) => sum + s.aqi, 0) / airQualityStations.length);
}

export function getNoiseByDistrict(district: string): NoiseData[] {
  return noiseMonitorPoints.filter(n => n.district === district);
}
