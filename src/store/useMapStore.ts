import { create } from 'zustand';
import type { LayerType, District, POI, CameraPosition, CameraTarget } from '@/types';
import { districts } from '@/mock/events';

export interface PatrolPoint {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  stayDuration: number;
}

export interface PatrolRoute {
  id: string;
  name: string;
  points: PatrolPoint[];
  createdAt: number;
}

export type PatrolPlayStatus = 'idle' | 'flying' | 'staying' | 'paused';

export type PresetName = 'daily' | 'rush' | 'emergency' | 'night';

type ActiveLayers = Record<LayerType, boolean>;

interface FlyToParams {
  position: CameraPosition;
  target?: CameraTarget;
  duration?: number;
}

interface FlyTarget {
  position: CameraPosition;
  target: CameraTarget;
  startTime: number;
  duration: number;
  startPosition: CameraPosition;
  startTarget: CameraTarget;
}

interface Playhead {
  startTimestamp: number;
  baseTime: number;
  speed: number;
}

interface PendingFocus {
  position: [number, number, number];
  target?: [number, number, number];
  label: string;
}

interface PersistedConfig {
  activeLayers: ActiveLayers;
  visibleDistrict: District | null;
  cameraPosition: CameraPosition;
  cameraTarget: CameraTarget;
  currentPreset: PresetName | null;
  playbackSpeed: number;
}

const STORAGE_KEY = 'dtcity_map_config';

const defaultLayers: ActiveLayers = {
  buildings: true,
  roads: true,
  water: true,
  vegetation: true,
  poi: false,
  traffic: false,
  pipeline: false,
  environment: false,
  video: false,
};

export const presets: Record<PresetName, Partial<ActiveLayers>> = {
  daily: {
    buildings: true,
    roads: true,
    water: true,
    poi: true,
    vegetation: false,
    traffic: false,
    pipeline: false,
    environment: false,
    video: false,
  },
  rush: {
    buildings: true,
    roads: true,
    water: false,
    poi: false,
    vegetation: false,
    traffic: true,
    pipeline: false,
    environment: false,
    video: true,
  },
  emergency: {
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
  night: {
    buildings: true,
    roads: false,
    water: false,
    vegetation: false,
    poi: true,
    traffic: false,
    pipeline: false,
    environment: false,
    video: true,
  },
};

function loadPersistedConfig(): Partial<PersistedConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedConfig;
    return parsed;
  } catch {
    return {};
  }
}

function savePersistedConfig(config: PersistedConfig) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

interface MapState {
  activeLayers: ActiveLayers;
  visibleDistrict: District | null;
  currentPreset: PresetName | null;
  currentTime: Date;
  playbackSpeed: number;
  playhead: Playhead | null;
  hoveredBuildingId: string | null;
  clickedPOI: POI | null;
  cameraPosition: CameraPosition;
  cameraTarget: CameraTarget;
  focusLabel: string | null;
  flyTarget: FlyTarget | null;
  pendingFocus: PendingFocus | null;
  patrolRoutes: PatrolRoute[];
  currentPatrolRouteId: string | null;
  patrolPlayStatus: PatrolPlayStatus;
  patrolCurrentPointIndex: number;
  patrolPaused: boolean;
  patrolStayRemaining: number;

  toggleLayer: (layer: LayerType) => void;
  setAllLayers: (layers: Partial<ActiveLayers>) => void;
  enableAllLayers: () => void;
  disableAllLayers: () => void;
  applyPreset: (name: PresetName) => void;

  setTime: (time: Date) => void;
  startPlayback: () => void;
  stopPlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  getCurrentPlaybackTime: () => Date;

  setHoveredBuilding: (buildingId: string | null) => void;
  setClickedPOI: (poi: POI | null) => void;
  setVisibleDistrict: (district: District | null) => void;

  queueFlyTo: (params: FlyToParams) => void;
  flyToPosition: (params: FlyToParams) => void;
  clearFlyTarget: () => void;
  updateCamera: (position: CameraPosition, target?: CameraTarget) => void;

  navigateAndFocus: (
    position: [number, number, number],
    target?: [number, number, number],
    label?: string,
  ) => void;
  consumePendingFocus: () => PendingFocus | null;

  addPatrolRoute: (name: string) => void;
  deletePatrolRoute: (id: string) => void;
  addPatrolPoint: (routeId: string, point: Omit<PatrolPoint, 'id'>) => void;
  removePatrolPoint: (routeId: string, pointId: string) => void;
  setCurrentPatrolRoute: (id: string | null) => void;
  startPatrol: () => void;
  pausePatrol: () => void;
  resumePatrol: () => void;
  stopPatrol: () => void;
  advancePatrolToNext: () => void;
  setPatrolStayRemaining: (ms: number) => void;
}

const persisted = loadPersistedConfig();

export const useMapStore = create<MapState>((set, get) => {
  const initialState: MapState = {
    activeLayers: persisted.activeLayers ?? defaultLayers,
    visibleDistrict: persisted.visibleDistrict ?? districts[0] ?? null,
    currentPreset: persisted.currentPreset ?? null,
    currentTime: new Date(),
    playbackSpeed: persisted.playbackSpeed ?? 1,
    playhead: null,
    hoveredBuildingId: null,
    clickedPOI: null,
    cameraPosition: persisted.cameraPosition ?? { x: 0, y: 150, z: 200 },
    cameraTarget: persisted.cameraTarget ?? { x: 0, y: 0, z: 0 },
    focusLabel: null,
    flyTarget: null,
    pendingFocus: null,
    patrolRoutes: [
      {
        id: 'route-1',
        name: '重点区域巡检',
        createdAt: Date.now(),
        points: [
          {
            id: 'pt-1-1',
            name: '中心广场',
            position: { x: 0, y: 60, z: 80 },
            target: { x: 0, y: 0, z: 0 },
            stayDuration: 3000,
          },
          {
            id: 'pt-1-2',
            name: '东湖公园',
            position: { x: 60, y: 50, z: 60 },
            target: { x: 50, y: 0, z: 0 },
            stayDuration: 3000,
          },
          {
            id: 'pt-1-3',
            name: '西站枢纽',
            position: { x: -60, y: 50, z: 60 },
            target: { x: -50, y: 0, z: 0 },
            stayDuration: 3000,
          },
          {
            id: 'pt-1-4',
            name: '北湖工业园',
            position: { x: 0, y: 50, z: 80 },
            target: { x: 0, y: 0, z: 70 },
            stayDuration: 3000,
          },
        ],
      },
      {
        id: 'route-2',
        name: '管网安全巡检',
        createdAt: Date.now(),
        points: [
          {
            id: 'pt-2-1',
            name: '南山供水站',
            position: { x: 40, y: 50, z: -70 },
            target: { x: 30, y: 0, z: -60 },
            stayDuration: 3000,
          },
          {
            id: 'pt-2-2',
            name: '新城泵站',
            position: { x: 80, y: 50, z: -40 },
            target: { x: 70, y: 0, z: -30 },
            stayDuration: 3000,
          },
          {
            id: 'pt-2-3',
            name: '西湖管网监测点',
            position: { x: -60, y: 50, z: 60 },
            target: { x: -50, y: 0, z: 0 },
            stayDuration: 3000,
          },
        ],
      },
    ],
    currentPatrolRouteId: null,
    patrolPlayStatus: 'idle',
    patrolCurrentPointIndex: 0,
    patrolPaused: false,
    patrolStayRemaining: 0,

    toggleLayer: (layer) =>
      set((state) => ({
        activeLayers: {
          ...state.activeLayers,
          [layer]: !state.activeLayers[layer],
        },
        currentPreset: null,
      })),

    setAllLayers: (layers) =>
      set((state) => ({
        activeLayers: {
          ...state.activeLayers,
          ...layers,
        },
        currentPreset: null,
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
        currentPreset: null,
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
        currentPreset: null,
      }),

    applyPreset: (name) => {
      const preset = presets[name];
      if (!preset) return;
      set({
        activeLayers: { ...defaultLayers, ...preset },
        currentPreset: name,
      });
    },

    setTime: (time) => set({ currentTime: time, playhead: null }),

    startPlayback: () => {
      const state = get();
      set({
        playhead: {
          startTimestamp: Date.now(),
          baseTime: state.currentTime.getTime(),
          speed: state.playbackSpeed,
        },
      });
    },

    stopPlayback: () => {
      const state = get();
      if (state.playhead) {
        const currentPlaybackTime = state.getCurrentPlaybackTime();
        set({ playhead: null, currentTime: currentPlaybackTime });
      }
    },

    setPlaybackSpeed: (speed) => {
      const state = get();
      if (state.playhead) {
        const currentPlaybackTime = state.getCurrentPlaybackTime();
        set({
          playbackSpeed: speed,
          playhead: {
            startTimestamp: Date.now(),
            baseTime: currentPlaybackTime.getTime(),
            speed,
          },
        });
      } else {
        set({ playbackSpeed: speed });
      }
    },

    getCurrentPlaybackTime: () => {
      const state = get();
      if (!state.playhead) {
        return state.currentTime;
      }
      const { startTimestamp, baseTime, speed } = state.playhead;
      const elapsed = Date.now() - startTimestamp;
      return new Date(baseTime + elapsed * speed);
    },

    setHoveredBuilding: (buildingId) => set({ hoveredBuildingId: buildingId }),

    setClickedPOI: (poi) => set({ clickedPOI: poi }),

    setVisibleDistrict: (district) => set({ visibleDistrict: district }),

    queueFlyTo: (params) => {
      const state = get();
      const target = params.target ?? state.cameraTarget;
      const duration = params.duration ?? 1500;
      set({
        flyTarget: {
          position: params.position,
          target,
          startTime: Date.now(),
          duration,
          startPosition: { ...state.cameraPosition },
          startTarget: { ...state.cameraTarget },
        },
      });
    },

    flyToPosition: (params) => {
      get().queueFlyTo(params);
    },

    clearFlyTarget: () => set({ flyTarget: null }),

    updateCamera: (position, target) =>
      set((state) => ({
        cameraPosition: position,
        cameraTarget: target ?? state.cameraTarget,
      })),

    navigateAndFocus: (position, target, label = '') => {
      const targetPos = target ?? [0, 0, 0];
      set({
        pendingFocus: { position, target: targetPos, label },
        focusLabel: label || null,
      });
      setTimeout(() => {
        set({ focusLabel: null });
      }, 5000);
    },

    consumePendingFocus: () => {
      const state = get();
      const focus = state.pendingFocus;
      if (focus) {
        set({ pendingFocus: null });
      }
      return focus;
    },

    addPatrolRoute: (name) => {
      const newRoute: PatrolRoute = {
        id: `route-${Date.now()}`,
        name,
        points: [],
        createdAt: Date.now(),
      };
      set((state) => ({
        patrolRoutes: [...state.patrolRoutes, newRoute],
      }));
    },

    deletePatrolRoute: (id) => {
      set((state) => ({
        patrolRoutes: state.patrolRoutes.filter((r) => r.id !== id),
        currentPatrolRouteId: state.currentPatrolRouteId === id ? null : state.currentPatrolRouteId,
      }));
    },

    addPatrolPoint: (routeId, point) => {
      const newPoint: PatrolPoint = {
        ...point,
        id: `pt-${Date.now()}`,
      };
      set((state) => ({
        patrolRoutes: state.patrolRoutes.map((r) =>
          r.id === routeId ? { ...r, points: [...r.points, newPoint] } : r
        ),
      }));
    },

    removePatrolPoint: (routeId, pointId) => {
      set((state) => ({
        patrolRoutes: state.patrolRoutes.map((r) =>
          r.id === routeId ? { ...r, points: r.points.filter((p) => p.id !== pointId) } : r
        ),
      }));
    },

    setCurrentPatrolRoute: (id) => {
      set({ currentPatrolRouteId: id });
    },

    startPatrol: () => {
      const state = get();
      const route = state.patrolRoutes.find((r) => r.id === state.currentPatrolRouteId);
      if (!route || route.points.length === 0) return;
      set({
        patrolPlayStatus: 'flying',
        patrolCurrentPointIndex: 0,
        patrolPaused: false,
        patrolStayRemaining: 0,
      });
      const firstPoint = route.points[0];
      get().queueFlyTo({
        position: firstPoint.position,
        target: firstPoint.target,
        duration: 2000,
      });
    },

    pausePatrol: () => {
      const state = get();
      if (state.patrolPlayStatus === 'flying' || state.patrolPlayStatus === 'staying') {
        set({
          patrolPlayStatus: 'paused',
          patrolPaused: true,
        });
      }
    },

    resumePatrol: () => {
      const state = get();
      if (!state.patrolPaused || state.patrolPlayStatus !== 'paused') return;
      const route = state.patrolRoutes.find((r) => r.id === state.currentPatrolRouteId);
      if (!route) return;
      const currentPoint = route.points[state.patrolCurrentPointIndex];
      if (!currentPoint) return;
      if (state.patrolStayRemaining > 0) {
        set({ patrolPlayStatus: 'staying', patrolPaused: false });
      } else {
        set({ patrolPlayStatus: 'flying', patrolPaused: false });
        get().queueFlyTo({
          position: currentPoint.position,
          target: currentPoint.target,
          duration: 2000,
        });
      }
    },

    stopPatrol: () => {
      set({
        patrolPlayStatus: 'idle',
        patrolCurrentPointIndex: 0,
        patrolPaused: false,
        patrolStayRemaining: 0,
        flyTarget: null,
      });
    },

    advancePatrolToNext: () => {
      const state = get();
      const route = state.patrolRoutes.find((r) => r.id === state.currentPatrolRouteId);
      if (!route) return;
      const nextIndex = state.patrolCurrentPointIndex + 1;
      if (nextIndex >= route.points.length) {
        get().stopPatrol();
        return;
      }
      const nextPoint = route.points[nextIndex];
      set({
        patrolCurrentPointIndex: nextIndex,
        patrolPlayStatus: 'flying',
        patrolStayRemaining: 0,
      });
      get().queueFlyTo({
        position: nextPoint.position,
        target: nextPoint.target,
        duration: 2000,
      });
    },

    setPatrolStayRemaining: (ms) => {
      set({ patrolStayRemaining: ms });
    },
  };

  return initialState;
});

let lastPersisted = '';
useMapStore.subscribe((state) => {
  const toPersist = {
    activeLayers: state.activeLayers,
    visibleDistrict: state.visibleDistrict,
    cameraPosition: state.cameraPosition,
    cameraTarget: state.cameraTarget,
    currentPreset: state.currentPreset,
    playbackSpeed: state.playbackSpeed,
  };
  const serialized = JSON.stringify(toPersist);
  if (serialized !== lastPersisted) {
    lastPersisted = serialized;
    savePersistedConfig(toPersist);
  }
});
