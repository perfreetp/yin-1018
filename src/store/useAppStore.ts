import { create } from 'zustand';
import type {
  AlertLevel,
  District,
  TimeRange,
  CarouselMode,
  DutyInfo,
  FavoriteArea,
  CameraPosition,
  CameraTarget,
} from '../types';
import { districts } from '../mock/events';

// 全局应用状态接口
interface AppState {
  // ===== 状态 =====

  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean;

  /** 是否处于大屏模式 */
  bigScreenMode: boolean;

  /** 轮播模式配置（是否启用+间隔时间） */
  carouselMode: CarouselMode;

  /** 当前路由路径 */
  currentRoute: string;

  /** 当前选中的区域/街道 */
  selectedDistrict: District | null;

  /** 当前选中的时间范围筛选 */
  selectedTimeRange: TimeRange | null;

  /** 当前选中的预警级别筛选数组 */
  selectedAlertLevels: AlertLevel[];

  /** 当前值班人员信息 */
  currentDuty: DutyInfo;

  /** 收藏的重点区域列表 */
  favoriteAreas: FavoriteArea[];

  // ===== Actions =====

  /** 切换侧边栏折叠状态 */
  toggleSidebar: () => void;
  /** 设置侧边栏折叠状态 */
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** 进入大屏模式 */
  enterBigScreen: () => void;
  /** 退出大屏模式 */
  exitBigScreen: () => void;
  /** 切换大屏模式 */
  toggleBigScreen: () => void;

  /** 开启轮播模式 */
  startCarousel: (interval?: number) => void;
  /** 停止轮播模式 */
  stopCarousel: () => void;

  /** 设置当前路由 */
  setCurrentRoute: (route: string) => void;

  /** 设置选中的区域/街道 */
  setSelectedDistrict: (district: District | null) => void;

  /** 设置选中的时间范围 */
  setSelectedTimeRange: (range: TimeRange | null) => void;

  /** 切换选中的预警级别 */
  toggleAlertLevel: (level: AlertLevel) => void;
  /** 设置选中的预警级别数组 */
  setSelectedAlertLevels: (levels: AlertLevel[]) => void;

  /** 更新当前值班信息 */
  setCurrentDuty: (duty: Partial<DutyInfo>) => void;

  /** 添加收藏区域 */
  addFavoriteArea: (
    name: string,
    cameraPosition: CameraPosition,
    cameraTarget: CameraTarget,
    description?: string,
  ) => void;
  /** 移除收藏区域 */
  removeFavoriteArea: (id: string) => void;
  /** 更新收藏区域信息 */
  updateFavoriteArea: (id: string, data: Partial<FavoriteArea>) => void;
}

// 初始值班信息
const initialDuty: DutyInfo = {
  personName: '张伟',
  shift: 'morning',
  phone: '138****8888',
  startTime: new Date().toISOString().slice(0, 10) + 'T08:00:00',
};

export const useAppStore = create<AppState>((set, get) => ({
  // ===== 初始状态 =====
  sidebarCollapsed: false,
  bigScreenMode: false,
  carouselMode: {
    enabled: false,
    interval: 30000,
  },
  currentRoute: '/',
  selectedDistrict: districts[0],
  selectedTimeRange: null,
  selectedAlertLevels: [],
  currentDuty: initialDuty,
  favoriteAreas: [
    {
      id: 'fa001',
      name: '中央商务区',
      cameraPosition: { x: 0, y: 150, z: 200 },
      cameraTarget: { x: 0, y: 0, z: 0 },
      description: '城市核心商业区域，重点监控',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fa002',
      name: '火车站枢纽',
      cameraPosition: { x: 180, y: 120, z: 80 },
      cameraTarget: { x: 180, y: 0, z: 0 },
      description: '交通枢纽，人流密集区域',
      createdAt: new Date().toISOString(),
    },
  ],

  // ===== Actions =====

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  enterBigScreen: () => set({ bigScreenMode: true }),

  exitBigScreen: () => set({ bigScreenMode: false }),

  toggleBigScreen: () =>
    set((state) => ({ bigScreenMode: !state.bigScreenMode })),

  startCarousel: (interval = 30000) =>
    set({
      carouselMode: {
        enabled: true,
        interval,
      },
    }),

  stopCarousel: () =>
    set((state) => ({
      carouselMode: {
        ...state.carouselMode,
        enabled: false,
      },
    })),

  setCurrentRoute: (route) => set({ currentRoute: route }),

  setSelectedDistrict: (district) => set({ selectedDistrict: district }),

  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),

  toggleAlertLevel: (level) =>
    set((state) => ({
      selectedAlertLevels: state.selectedAlertLevels.includes(level)
        ? state.selectedAlertLevels.filter((l) => l !== level)
        : [...state.selectedAlertLevels, level],
    })),

  setSelectedAlertLevels: (levels) => set({ selectedAlertLevels: levels }),

  setCurrentDuty: (duty) =>
    set((state) => ({
      currentDuty: { ...state.currentDuty, ...duty },
    })),

  addFavoriteArea: (name, cameraPosition, cameraTarget, description) => {
    const newArea: FavoriteArea = {
      id: 'fa' + Date.now(),
      name,
      cameraPosition,
      cameraTarget,
      description,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      favoriteAreas: [...state.favoriteAreas, newArea],
    }));
  },

  removeFavoriteArea: (id) =>
    set((state) => ({
      favoriteAreas: state.favoriteAreas.filter((area) => area.id !== id),
    })),

  updateFavoriteArea: (id, data) =>
    set((state) => ({
      favoriteAreas: state.favoriteAreas.map((area) =>
        area.id === id ? { ...area, ...data } : area,
      ),
    })),
}));
