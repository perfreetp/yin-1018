import type { AlertLevel, EventCategory, EventStatus } from '@/types';

export interface AlertLevelConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  severity: number;
}

export interface EventCategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface EventStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
}

export function formatNumber(num: number, decimals = 0): string {
  if (!isFinite(num)) return '0';
  const factor = Math.pow(10, decimals);
  const fixed = (Math.round(num * factor) / factor).toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function formatPercent(value: number, decimals = 1, multiply = true): string {
  if (!isFinite(value)) return '0%';
  const num = multiply ? value * 100 : value;
  const factor = Math.pow(10, decimals);
  const formatted = (Math.round(num * factor) / factor).toFixed(decimals);
  return `${formatted}%`;
}

export function formatCompact(num: number): string {
  if (!isFinite(num)) return '0';
  const abs = Math.abs(num);
  if (abs >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`;
  }
  if (abs >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (abs >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return formatNumber(num);
}

export function formatCurrency(num: number, symbol = '¥'): string {
  return `${symbol}${formatNumber(num, 2)}`;
}

export function padZero(num: number, length = 2): string {
  return String(num).padStart(length, '0');
}

export function formatDate(date: Date | string | number, pattern = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  const hours = padZero(d.getHours());
  const minutes = padZero(d.getMinutes());
  const seconds = padZero(d.getSeconds());
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[d.getDay()];
  return pattern
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds)
    .replace(/WW/g, weekDay);
}

export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
}

export function formatTime(date: Date | string | number): string {
  return formatDate(date, 'HH:mm:ss');
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return `${seconds}秒前`;
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(d, 'YYYY-MM-DD');
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${padZero(seconds % 60)}秒`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}小时${padZero(m)}分`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return `${d}天${padZero(h)}小时`;
}

export const alertLevelConfigs: Record<AlertLevel, AlertLevelConfig> = {
  blue: {
    label: '一般',
    color: '#1677ff',
    bgColor: 'rgba(22, 119, 255, 0.08)',
    borderColor: 'rgba(22, 119, 255, 0.3)',
    textColor: '#1677ff',
    severity: 1
  },
  yellow: {
    label: '较重',
    color: '#faad14',
    bgColor: 'rgba(250, 173, 20, 0.08)',
    borderColor: 'rgba(250, 173, 20, 0.3)',
    textColor: '#faad14',
    severity: 2
  },
  orange: {
    label: '严重',
    color: '#fa8c16',
    bgColor: 'rgba(250, 140, 22, 0.08)',
    borderColor: 'rgba(250, 140, 22, 0.3)',
    textColor: '#fa8c16',
    severity: 3
  },
  red: {
    label: '特别严重',
    color: '#f5222d',
    bgColor: 'rgba(245, 34, 45, 0.08)',
    borderColor: 'rgba(245, 34, 45, 0.3)',
    textColor: '#f5222d',
    severity: 4
  }
};

export function getAlertLevelConfig(level: AlertLevel): AlertLevelConfig {
  return alertLevelConfigs[level];
}

export function getAlertLevelLabel(level: AlertLevel): string {
  return alertLevelConfigs[level].label;
}

export function getAlertLevelColor(level: AlertLevel): string {
  return alertLevelConfigs[level].color;
}

export const eventCategoryConfigs: Record<EventCategory, EventCategoryConfig> = {
  traffic: {
    label: '交通出行',
    color: '#1677ff',
    bgColor: 'rgba(22, 119, 255, 0.08)',
    icon: 'Car'
  },
  pipeline: {
    label: '管线设施',
    color: '#13c2c2',
    bgColor: 'rgba(19, 194, 194, 0.08)',
    icon: 'Droplets'
  },
  environment: {
    label: '生态环境',
    color: '#52c41a',
    bgColor: 'rgba(82, 196, 26, 0.08)',
    icon: 'Leaf'
  },
  safety: {
    label: '公共安全',
    color: '#f5222d',
    bgColor: 'rgba(245, 34, 45, 0.08)',
    icon: 'Shield'
  },
  facility: {
    label: '市政设施',
    color: '#fa8c16',
    bgColor: 'rgba(250, 140, 22, 0.08)',
    icon: 'Wrench'
  },
  public: {
    label: '公共服务',
    color: '#722ed1',
    bgColor: 'rgba(114, 46, 209, 0.08)',
    icon: 'Users'
  },
  other: {
    label: '其他事件',
    color: '#8c8c8c',
    bgColor: 'rgba(140, 140, 140, 0.08)',
    icon: 'AlertTriangle'
  }
};

export function getEventCategoryConfig(category: EventCategory): EventCategoryConfig {
  return eventCategoryConfigs[category];
}

export function getEventCategoryLabel(category: EventCategory): string {
  return eventCategoryConfigs[category].label;
}

export function getEventCategoryColor(category: EventCategory): string {
  return eventCategoryConfigs[category].color;
}

export const eventStatusConfigs: Record<EventStatus, EventStatusConfig> = {
  pending: {
    label: '待处理',
    color: '#8c8c8c',
    bgColor: 'rgba(140, 140, 140, 0.1)',
    dotColor: '#bfbfbf'
  },
  dispatched: {
    label: '已派单',
    color: '#1677ff',
    bgColor: 'rgba(22, 119, 255, 0.1)',
    dotColor: '#4096ff'
  },
  processing: {
    label: '处置中',
    color: '#fa8c16',
    bgColor: 'rgba(250, 140, 22, 0.1)',
    dotColor: '#ffa940'
  },
  resolved: {
    label: '已解决',
    color: '#52c41a',
    bgColor: 'rgba(82, 196, 26, 0.1)',
    dotColor: '#73d13d'
  },
  closed: {
    label: '已关闭',
    color: '#8c8c8c',
    bgColor: 'rgba(140, 140, 140, 0.08)',
    dotColor: '#d9d9d9'
  }
};

export function getEventStatusConfig(status: EventStatus): EventStatusConfig {
  return eventStatusConfigs[status];
}

export function getEventStatusLabel(status: EventStatus): string {
  return eventStatusConfigs[status].label;
}

export function getEventStatusColor(status: EventStatus): string {
  return eventStatusConfigs[status].color;
}

export function formatCoordinate(lng: number, lat: number, decimals = 6): string {
  return `${lng.toFixed(decimals)}, ${lat.toFixed(decimals)}`;
}

export function formatSpeed(speed: number): string {
  return `${speed.toFixed(0)} km/h`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatArea(area: number): string {
  if (area < 1000000) return `${formatNumber(area, 2)} m²`;
  return `${formatNumber(area / 1000000, 2)} km²`;
}

export function formatVolume(volume: number): string {
  if (volume < 1000) return `${formatNumber(volume, 1)} L`;
  return `${formatNumber(volume / 1000, 2)} m³`;
}

export function formatDB(db: number): string {
  return `${db.toFixed(1)} dB`;
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatHumidity(humidity: number): string {
  return `${humidity.toFixed(0)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function formatDelta(value: number, withSign = true, decimals = 1): string {
  const sign = value > 0 && withSign ? '+' : '';
  return `${sign}${value.toFixed(decimals)}`;
}

export function getDeltaColor(value: number, positiveGood = true): string {
  if (value === 0) return '#8c8c8c';
  const isPositive = value > 0;
  const isGood = positiveGood ? isPositive : !isPositive;
  return isGood ? '#52c41a' : '#f5222d';
}
