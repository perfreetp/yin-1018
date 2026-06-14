import type { EventItem, District } from '../types';

// 经纬度坐标类型（被其他 mock 文件引用）
export interface Coordinate {
  lng: number;
  lat: number;
}

// 预设区域/街道列表
export const districts: District[] = [
  { id: 'd001', name: '中心街道', code: 'ZX001' },
  { id: 'd002', name: '东湖街道', code: 'DH002' },
  { id: 'd003', name: '西湖街道', code: 'XY003' },
  { id: 'd004', name: '南山街道', code: 'NJ004' },
  { id: 'd005', name: '北岭街道', code: 'BL005' },
  { id: 'd006', name: '新城街道', code: 'XC006' },
];

// 初始事件数据
export const events: EventItem[] = [
  {
    id: 'e001',
    title: '主干道交通拥堵严重',
    description: '人民大道与解放路交叉口发生交通事故，导致双向车道拥堵，建议绕行。',
    category: 'traffic',
    level: 'orange',
    status: 'processing',
    district: districts[0],
    location: {
      address: '人民大道与解放路交叉口',
      lng: 116.4074,
      lat: 39.9042,
    },
    reporter: '市民热线12345',
    reportTime: '2026-06-15T08:30:00',
    deadline: '2026-06-15T12:30:00',
    dispatchedTo: '交警支队一大队',
    dispatchedTime: '2026-06-15T08:45:00',
    progress: [
      {
        id: 'p1',
        title: '事件上报',
        description: '市民通过12345热线反映交通拥堵情况',
        operator: '接线员王芳',
        timestamp: '2026-06-15T08:30:00',
        completed: true,
      },
      {
        id: 'p2',
        title: '派发处置',
        description: '已派发至交警支队一大队，3名交警已出发',
        operator: '调度员李强',
        timestamp: '2026-06-15T08:45:00',
        completed: true,
      },
      {
        id: 'p3',
        title: '现场处置',
        description: '交警已到达现场，正在疏导交通，事故车辆正在拖离',
        operator: '交警张伟',
        timestamp: '2026-06-15T09:10:00',
        completed: false,
      },
    ],
    attachments: [
      { name: '现场照片1.jpg', url: '/mock/img1.jpg', type: 'image' },
    ],
    relatedVideoIds: ['v001', 'v002'],
  },
  {
    id: 'e002',
    title: '井盖破损存在安全隐患',
    description: '东湖南路23号门口井盖破损严重，需立即更换，防止行人车辆受伤。',
    category: 'pipeline',
    level: 'yellow',
    status: 'dispatched',
    district: districts[1],
    location: {
      address: '东湖南路23号门口',
      lng: 116.4174,
      lat: 39.9142,
    },
    reporter: '网格员刘敏',
    reportTime: '2026-06-15T07:15:00',
    deadline: '2026-06-15T17:00:00',
    dispatchedTo: '市政维护处',
    dispatchedTime: '2026-06-15T07:30:00',
    progress: [
      {
        id: 'p1',
        title: '网格员巡查发现',
        operator: '网格员刘敏',
        timestamp: '2026-06-15T07:15:00',
        completed: true,
      },
      {
        id: 'p2',
        title: '派发市政维护处',
        operator: '调度员赵磊',
        timestamp: '2026-06-15T07:30:00',
        completed: true,
      },
    ],
  },
  {
    id: 'e003',
    title: '工业区疑似废气排放超标',
    description: '西郊工业园区周边居民反映有刺激性气味，怀疑某工厂夜间违规排放废气。',
    category: 'environment',
    level: 'red',
    status: 'pending',
    district: districts[2],
    location: {
      address: '西郊工业园区A区',
      lng: 116.3874,
      lat: 39.8942,
    },
    reporter: '匿名举报人',
    reportTime: '2026-06-15T06:00:00',
    deadline: '2026-06-15T14:00:00',
    progress: [
      {
        id: 'p1',
        title: '匿名举报受理',
        operator: '值班员陈静',
        timestamp: '2026-06-15T06:00:00',
        completed: true,
      },
    ],
    relatedVideoIds: ['v003'],
  },
  {
    id: 'e004',
    title: '地铁站入口人流拥挤',
    description: '早高峰期间2号线中心广场站A出入口人流密集，存在踩踏风险，需增派安保人员。',
    category: 'public',
    level: 'yellow',
    status: 'resolved',
    district: districts[0],
    location: {
      address: '中心广场地铁站A出口',
      lng: 116.4064,
      lat: 39.9052,
    },
    reporter: '地铁站工作人员',
    reportTime: '2026-06-15T07:45:00',
    dispatchedTo: '地铁安保部',
    dispatchedTime: '2026-06-15T07:50:00',
    resolvedTime: '2026-06-15T09:00:00',
    progress: [
      {
        id: 'p1',
        title: '上报情况',
        operator: '地铁站长孙明',
        timestamp: '2026-06-15T07:45:00',
        completed: true,
      },
      {
        id: 'p2',
        title: '增派安保人员',
        description: '已调派5名安保人员现场维持秩序',
        operator: '安保主管周洋',
        timestamp: '2026-06-15T07:55:00',
        completed: true,
      },
      {
        id: 'p3',
        title: '客流恢复正常',
        operator: '地铁站长孙明',
        timestamp: '2026-06-15T09:00:00',
        completed: true,
      },
    ],
  },
  {
    id: 'e005',
    title: '低洼路段积水风险预警',
    description: '气象台发布暴雨蓝色预警，北郊3处低洼路段需提前做好防汛准备。',
    category: 'pipeline',
    level: 'blue',
    status: 'processing',
    district: districts[4],
    location: {
      address: '北岭街道低洼路段区域',
      lng: 116.4084,
      lat: 39.9242,
    },
    reporter: '气象预警系统',
    reportTime: '2026-06-15T05:00:00',
    deadline: '2026-06-15T20:00:00',
    dispatchedTo: '防汛应急办',
    dispatchedTime: '2026-06-15T05:20:00',
    progress: [
      {
        id: 'p1',
        title: '气象预警发布',
        operator: '系统自动推送',
        timestamp: '2026-06-15T05:00:00',
        completed: true,
      },
      {
        id: 'p2',
        title: '应急防汛部署',
        description: '已通知各居委会做好居民通知工作，抢险队伍待命',
        operator: '防汛办主任黄磊',
        timestamp: '2026-06-15T05:45:00',
        completed: true,
      },
      {
        id: 'p3',
        title: '现场值守巡查',
        operator: '防汛巡查队',
        timestamp: '2026-06-15T07:00:00',
        completed: false,
      },
    ],
  },
];
