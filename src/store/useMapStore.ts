import { create } from 'zustand';
import type { LayerType, District, POI, CameraPosition, CameraTarget } from '../types';
import { districts } from '../mock/events';

// 图层状态映射
type ActiveLayers = Record<LayerType, boolean>;

// 飞行定位参数
interface FlyToParams {
  position: CameraPosition;
  target?: CameraTarget;
  duration?: number;
}

// 地图状态接口
interface MapState {
  // ===== 状态 =====

  /** 各图层的开关状态 */
  activeLayers: ActiveLayers;

  /** 当前可见的区域（用于地图视图过滤） */
  visibleDistrict: District | null;

  /** 历史回放当前时间 */
  currentTime: Date;

  /** 历史回放是否正在播放 */
  isPlaying: boolean;

  /** 回放倍速（0.5x, 1x, 2x, 4x, 8x） */
  playbackSpeed: number;

  /** 鼠标悬停的建筑ID */
  hoveredBuildingId: string | null;

  /** 点击选中的POI点 */
  clickedPOI: POI | null;

  /** 相机当前位置 */
  cameraPosition: CameraPosition;

  /** 相机当前目标点 */
  cameraTarget: CameraTarget;

  // ===== Actions =====

  /**
   * 切换指定图层的开关状态
   * @param layer 图层类型
   */
  toggleLayer: (layer: LayerType) => void;

  /**
   * 批量设置所有图层的开关状态
   * @param layers 图层状态对象
   */
  setAllLayers: (layers: Partial<ActiveLayers>) => void;

  /**
   * 开启所有图层
   */
  enableAllLayers: () => void;

  /**
   * 关闭所有图层
   */
  disableAllLayers: () => void;

  /**
   * 设置当前时间（历史回放）
   * @param time 时间
   */
  setTime: (time: Date) => void;

  /**
   * 切换播放/暂停状态
   */
  togglePlayback: () => void;

  /**
   * 开始回放
   */
  startPlayback: () => void;

  /**
   * 暂停回放
   */
  pausePlayback: () => void;

  /**
   * 设置回放倍速
   * @param speed 倍速值
   */
  setPlaybackSpeed: (speed: number) => void;

  /**
   * 设置鼠标悬停的建筑
   * @param buildingId 建筑ID，null表示取消悬停
   */
  setHoveredBuilding: (buildingId: string | null) => void;

  /**
   * 设置点击选中的POI点
   * @param poi POI点对象，null表示取消选中
   */
  setClickedPOI: (poi: POI | null) => void;

  /**
   * 设置可见区域
   * @param district 区域对象
   */
  setVisibleDistrict: (district: District | null) => void;

  /**
   * 飞行定位到指定位置
   * @param params 飞行参数（位置、目标点、时长）
   */
  flyToPosition: (params: FlyToParams) => void;

  /**
   * 更新相机位置
   * @param position 相机位置
   * @param target 相机目标点
   */
  updateCamera: (position: CameraPosition, target?: CameraTarget) => void;
}

// 默认图层状态
const defaultLayers: ActiveLayers = {
  buildings: true,    // 建筑图层 - 默认开启
  roads: true,        // 道路图层 - 默认开启
  water: true,        // 水系图层 - 默认开启
  vegetation: true,   // 植被图层 - 默认开启
  poi: false,         // POI图层 - 默认关闭
  traffic: false,     // 交通热力图层 - 默认关闭
  pipeline: false,    // 管网监测图层 - 默认关闭
  environment: false, // 环境站点图层 - 默认关闭
  video: false,       // 视频点位图层 - 默认关闭
};

export const useMapStore = create<MapState>((set, get) => ({
  // ===== 初始状态 =====
  activeLayers: defaultLayers,
  visibleDistrict: districts[0],
  currentTime: new Date(),
  isPlaying: false,
  playbackSpeed: 1,
  hoveredBuildingId: null,
  clickedPOI: null,
  cameraPosition: { x: 0, y: 150, z: 200 },
  cameraTarget: { x: 0, y: 0, z: 0 },

  // ===== Actions =====

  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layer]: !state.activeLayers[layer],
      },
    })),

  setAllLayers: (layers) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        ...layers,
      },
    })),

  enableAllLayers: () =>
    set({
      activeLayers: {
        buildings: true,
        roads: true,
        water: true,
        vegetation: true,
        poi: true,
        traffic: true,
        pipeline: true,
        environment: true,
        video: true,
      },
    }),

  disableAllLayers: () =>
    set({
      activeLayers: {
        buildings: false,
        roads: false,
        water: false,
        vegetation: false,
        poi: false,
        traffic: false,
        pipeline: false,
        environment: false,
        video: false,
      },
    }),

  setTime: (time) => set({ currentTime: time }),

  togglePlayback: () =>
    set((state) => ({ isPlaying: !state.isPlaying })),

  startPlayback: () => set({ isPlaying: true }),

  pausePlayback: () => set({ isPlaying: false }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  setHoveredBuilding: (buildingId) => set({ hoveredBuildingId: buildingId }),

  setClickedPOI: (poi) => set({ clickedPOI: poi }),

  setVisibleDistrict: (district) => set({ visibleDistrict: district }),

  flyToPosition: (params) => {
    // 实际飞行动画由 Three.js 组件处理，这里只更新目标状态
    // 组件可以通过订阅 cameraPosition/cameraTarget 变化来触发动画
    const target = params.target || get().cameraTarget;
    set({
      cameraPosition: params.position,
      cameraTarget: target,
    });
  },

  updateCamera: (position, target) =>
    set((state) => ({
      cameraPosition: position,
      cameraTarget: target || state.cameraTarget,
    })),
}));
