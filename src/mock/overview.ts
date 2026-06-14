// 总览页核心指标
export interface OverviewMetrics {
  totalPopulation: number;
  todayEvents: number;
  eventResolutionRate: number;
  cityHealthIndex: number;
  averageResponseTime: number;
  comparedYesterday: {
    events: number;
    resolutionRate: number;
    healthIndex: number;
    responseTime: number;
  };
}

// 预警统计
export interface AlertStatistics {
  red: number;
  orange: number;
  yellow: number;
  blue: number;
}

// 事件分类统计
export interface EventCategoryStatistics {
  category: string;
  count: number;
  percentage: number;
  trend: number;
}

// 24小时事件趋势
export interface HourlyEventData {
  hour: number;
  count: number;
  resolved: number;
}

// 实时动态
export interface RealtimeFeed {
  id: string;
  type: 'event' | 'alert' | 'system' | 'weather';
  title: string;
  content: string;
  timestamp: string;
  level?: 'red' | 'orange' | 'yellow' | 'blue' | 'info';
  link?: string;
}

// 初始核心指标数据（占位）
export const overviewMetrics: OverviewMetrics = {
  totalPopulation: 1258600,
  todayEvents: 47,
  eventResolutionRate: 89.4,
  cityHealthIndex: 92.6,
  averageResponseTime: 8.5,
  comparedYesterday: {
    events: -5.2,
    resolutionRate: 2.1,
    healthIndex: 0.8,
    responseTime: -1.3,
  },
};

// 初始预警统计（占位）
export const alertStatistics: AlertStatistics = {
  red: 1,
  orange: 3,
  yellow: 8,
  blue: 15,
};

// 初始事件分类统计（占位）
export const eventCategoryStats: EventCategoryStatistics[] = [];

// 初始24小时趋势数据（占位）
export const hourlyEventTrend: HourlyEventData[] = [];

// 初始实时动态列表（占位）
export const realtimeFeeds: RealtimeFeed[] = [];
