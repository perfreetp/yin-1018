import { create } from 'zustand';
import type { LayerType, District, POI, CameraPosition, CameraTarget } from '@/types';
import { districts } from '@/mock/events';

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
}

const persisted = loadPersistedConfig();

export const useMapStore = create<MapState>((set, get) => {
  const initialState: MapState = {
    activeLayers: persisted.activeLayers ?? defaultLayers,
    visibleDistrict: persisted.visibleDistrict ?? districts[0] ?? null,
    currentPreset: null,
    currentTime: new Date(),
    playbackSpeed: 1,
    playhead: null,
    hoveredBuildingId: null,
    clickedPOI: null,
    cameraPosition: persisted.cameraPosition ?? { x: 0, y: 150, z: 200 },
    cameraTarget: persisted.cameraTarget ?? { x: 0, y: 0, z: 0 },
    focusLabel: null,
    flyTarget: null,
    pendingFocus: null,

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
        cameraPosition: { x: position[0], y: position[1], z: position[2] },
        cameraTarget: { x: targetPos[0], y: targetPos[1], z: targetPos[2] },
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
  };
  const serialized = JSON.stringify(toPersist);
  if (serialized !== lastPersisted) {
    lastPersisted = serialized;
    savePersistedConfig(toPersist);
  }
});
