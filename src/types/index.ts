// 预警级别
export type AlertLevel = 'red' | 'orange' | 'yellow' | 'blue';

// 图层类型
export type LayerType =
  | 'buildings'    // 建筑图层
  | 'roads'        // 道路图层
  | 'water'        // 水系图层
  | 'vegetation'   // 植被图层
  | 'poi'          // POI图层
  | 'traffic'      // 交通热力图层
  | 'pipeline'     // 管网监测图层
  | 'environment'  // 环境站点图层
  | 'video';       // 视频点位图层

// 区域/街道
export interface District {
  id: string;
  name: string;
  code?: string;
}

// 时间范围
export interface TimeRange {
  start: Date | string;
  end: Date | string;
}

// 轮播模式配置
export interface CarouselMode {
  enabled: boolean;
  interval: number; // 轮播间隔（毫秒）
}

// 值班班次
export type DutyShift = 'morning' | 'afternoon' | 'night';

// 值班信息
export interface DutyInfo {
  personName: string;     // 值班人员姓名
  shift: DutyShift;       // 班次
  phone: string;          // 联系电话
  startTime: Date | string; // 值班开始时间
}

// 相机位置（Three.js）
export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

// 相机目标点
export interface CameraTarget {
  x: number;
  y: number;
  z: number;
}

// 收藏区域
export interface FavoriteArea {
  id: string;
  name: string;
  cameraPosition: CameraPosition;
  cameraTarget: CameraTarget;
  description?: string;
  createdAt: Date | string;
}

// 事件类型
export type EventCategory =
  | 'traffic'      // 交通事件
  | 'pipeline'     // 管网事件
  | 'environment'  // 环境事件
  | 'safety'       // 安全事件
  | 'facility'     // 市政设施
  | 'public'       // 公共事件
  | 'other';       // 其他事件

// 事件状态
export type EventStatus =
  | 'pending'      // 待派发
  | 'dispatched'   // 已派发
  | 'processing'   // 处置中
  | 'resolved'     // 已解决
  | 'closed';      // 已结案

// 事件处置进度节点
export interface ProgressNode {
  id: string;
  title: string;
  description?: string;
  operator: string;
  timestamp: Date | string;
  completed: boolean;
}

// 事件对象
export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  level: AlertLevel;
  status: EventStatus;
  district: District;
  location: {
    address: string;
    lng?: number;
    lat?: number;
  };
  reporter?: string;
  reportTime: Date | string;
  deadline?: Date | string;
  dispatchedTo?: string;
  dispatchedTime?: Date | string;
  resolvedTime?: Date | string;
  progress: ProgressNode[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  relatedVideoIds?: string[];
}

// 事件筛选条件
export interface EventFilters {
  districtId?: string;
  timeRange?: TimeRange;
  categories?: EventCategory[];
  levels?: AlertLevel[];
  statuses?: EventStatus[];
  keyword?: string;
}

// POI点
export interface POI {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  info?: Record<string, unknown>;
}
