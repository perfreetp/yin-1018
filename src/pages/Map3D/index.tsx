import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Compass,
  Eye,
  Mountain,
  MapPin,
  Ruler,
  Navigation,
  X,
  ChevronRight,
  Building,
  Info,
  Phone,
  Clock,
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { Button, Modal, Tag } from 'antd';
import { useMapStore } from '@/store/useMapStore';
import { cn } from '@/lib/utils';
import { formatCoordinate } from '@/utils/format';
import type { POI } from '@/types';
import LayerPanel from '@/components/three/LayerPanel';
import FavoritePanel from '@/components/three/FavoritePanel';
import PatrolPanel from '@/components/three/PatrolPanel';
import PlaybackTimeline from '@/components/three/PlaybackTimeline';
import CameraController from '@/components/three/CameraController';
import Buildings from '@/components/three/Buildings';
import RoadNetwork from '@/components/three/RoadNetwork';
import WaterSystem from '@/components/three/WaterSystem';
import POIPoints from '@/components/three/POIPoints';
import VideoPoints from '@/components/three/VideoPoints';
import FloodPoints from '@/components/three/FloodPoints';
import TrafficHeatLayer from '@/components/three/TrafficHeatLayer';
import MapToolbar from '@/components/three/MapToolbar';

interface ViewPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  position: [number, number, number];
  target: [number, number, number];
}

const viewPresets: ViewPreset[] = [
  {
    id: 'reset',
    name: '重置视角',
    icon: <RotateCcw className="w-4 h-4" />,
    position: [120, 100, 120],
    target: [0, 0, 0],
  },
  {
    id: 'north',
    name: '正北视角',
    icon: <Compass className="w-4 h-4" />,
    position: [0, 120, 180],
    target: [0, 0, 0],
  },
  {
    id: 'top',
    name: '顶视图',
    icon: <Eye className="w-4 h-4" />,
    position: [0, 250, 0.01],
    target: [0, 0, 0],
  },
  {
    id: 'tilt',
    name: '倾斜视图',
    icon: <Mountain className="w-4 h-4" />,
    position: [80, 60, 140],
    target: [0, 0, 0],
  },
];

const POIDetailModal: React.FC<{
  poi: POI | null;
  open: boolean;
  onClose: () => void;
}> = ({ poi, open, onClose }) => {
  if (!poi) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      closable={false}
      styles={{
        content: {
          background: 'rgba(10, 22, 40, 0.98)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.1) inset',
        },
        mask: {
          background: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <div className="relative">
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-tech-400/60 rounded-tl pointer-events-none" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-tech-400/60 rounded-tr pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-tech-400/60 rounded-bl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-tech-400/60 rounded-br pointer-events-none" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tech-500/20 to-purple-500/20 border border-tech-400/30 flex items-center justify-center flex-shrink-0">
              <Building className="w-7 h-7 text-tech-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-text-primary mb-2">{poi.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color="cyan" className="border-cyan-500/30 bg-cyan-500/10 m-0">
                  {(poi.info?.category as string) || '基础设施'}
                </Tag>
                <Tag color="purple" className="border-purple-500/30 bg-purple-500/10 m-0">
                  ID: {poi.id}
                </Tag>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-tech-300 hover:bg-tech-500/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-space-800/60 border border-tech-500/10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-tech-400" />
                <span className="text-xs text-text-tertiary">空间坐标</span>
              </div>
              <div className="text-sm font-mono text-text-primary">
                X: {poi.position.x.toFixed(1)}
                <br />
                Y: {poi.position.y.toFixed(1)}
                <br />
                Z: {poi.position.z.toFixed(1)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-space-800/60 border border-tech-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-tech-400" />
                <span className="text-xs text-text-tertiary">类型标签</span>
              </div>
              <div className="text-sm text-text-primary">
                {poi.type}
                <br />
                <span className="text-text-secondary">
                  {String(poi.info?.description ?? '城市重要公共设施')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-tech-500/8 to-purple-500/8 border border-tech-500/15">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-tech-400" />
              <span className="text-xs text-text-tertiary">运营时间</span>
            </div>
            <div className="text-sm text-text-primary">
              工作日：08:00 - 20:00
              <br />
              周末及节假日：09:00 - 18:00
            </div>
          </div>

          <div className="p-4 rounded-xl bg-space-800/60 border border-tech-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-tech-400" />
              <span className="text-xs text-text-tertiary">联系方式</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-text-tertiary text-xs mb-1">服务热线</div>
                <div className="text-text-primary font-mono">400-888-0000</div>
              </div>
              <div>
                <div className="text-text-tertiary text-xs mb-1">值班电话</div>
                <div className="text-text-primary font-mono">010-88888888</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            size="large"
            className="flex-1 h-11 !bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none hover:!from-tech-400 hover:!to-tech-500 !shadow-glow-blue-sm"
            icon={<ChevronRight className="w-4 h-4" />}
          >
            查看完整详情
          </Button>
          <Button
            size="large"
            className="h-11 !bg-space-700/60 !border-tech-500/20 !text-text-secondary hover:!text-text-primary hover:!border-tech-400/40"
          >
            周边分析
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const Map3DPage: React.FC = () => {
  const {
    clickedPOI,
    setClickedPOI,
    flyToPosition,
    activeLayers,
    queueFlyTo,
    setAllLayers,
    applyPreset,
  } = useMapStore();
  const controlsRef = useRef<any>(null);
  const [poiModalOpen, setPoiModalOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [coordinate, setCoordinate] = useState({ lng: 116.4074, lat: 39.9042 });
  const [scale, setScale] = useState(500);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (clickedPOI) {
      setSelectedPOI(clickedPOI);
      setPoiModalOpen(true);
    }
  }, [clickedPOI]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const layerParam = params.get('layer');
    if (layerParam) {
      try {
        const decoded = atob(layerParam);
        const parsed = JSON.parse(decoded);
        setAllLayers(parsed);
      } catch {
        const layerNames = layerParam.split(',').map((s) => s.trim());
        const layers: Record<string, boolean> = {};
        layerNames.forEach((name) => {
          layers[name] = true;
        });
        setAllLayers(layers);
      }
    } else {
      const presetParam = params.get('preset');
      if (presetParam) {
        applyPreset(presetParam as any);
      }
    }

    const posParam = params.get('pos');
    const tgtParam = params.get('tgt');
    if (posParam && tgtParam) {
      const parseVec = (s: string): [number, number, number] | null => {
        const parts = s.split(',').map(Number);
        if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
          return [parts[0], parts[1], parts[2]];
        }
        return null;
      };
      const pos = parseVec(posParam);
      const tgt = parseVec(tgtParam);
      if (pos && tgt) {
        queueFlyTo({
          position: { x: pos[0], y: pos[1], z: pos[2] },
          target: { x: tgt[0], y: tgt[1], z: tgt[2] },
          duration: 2000,
        });
      }
    }
  }, [queueFlyTo, setAllLayers, applyPreset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinate((prev) => ({
        lng: prev.lng + (Math.random() - 0.5) * 0.0002,
        lat: prev.lat + (Math.random() - 0.5) * 0.0002,
      }));
      setRotation(Math.random() * 360);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleViewChange = (preset: ViewPreset) => {
    flyToPosition({
      position: { x: preset.position[0], y: preset.position[1], z: preset.position[2] },
      target: { x: preset.target[0], y: preset.target[1], z: preset.target[2] },
      duration: 1500,
    });
  };

  const handleClosePOIModal = () => {
    setPoiModalOpen(false);
    setClickedPOI(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A1628]">
      <Canvas
        shadows
        camera={{ position: [120, 100, 120], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0A1628']} />
        <fog attach="fog" args={['#0A1628', 100, 500]} />
        <ambientLight intensity={0.4} color="#B0C4DE" />
        <directionalLight
          position={[100, 150, 80]}
          intensity={1.2}
          color="#FFF8E7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
        />
        <hemisphereLight args={['#87CEEB', '#1a3a5c', 0.5]} />
        <Sky distance={450000} sunPosition={[100, 50, 80]} inclination={0.52} azimuth={0.25} />

        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#0A1628" metalness={0.3} roughness={0.8} />
          </mesh>
          <gridHelper args={[500, 100, '#1E90FF', '#0D2137']} position={[0, 0.01, 0]} />
          <gridHelper args={[500, 20, '#4169E1', '#0D2137']} position={[0, 0.02, 0]} />
        </group>

        {activeLayers.buildings && <Buildings />}
        {activeLayers.roads && <RoadNetwork />}
        {activeLayers.water && <WaterSystem />}
        {activeLayers.poi && <POIPoints />}
        {activeLayers.video && <VideoPoints />}
        {activeLayers.traffic && <TrafficHeatLayer />}
        {activeLayers.pipeline && <FloodPoints />}

        <OrbitControls
          makeDefault
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={20}
          maxDistance={400}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0, 0]}
        />

        <CameraController controlsRef={controlsRef} />
      </Canvas>

      <div className="absolute top-5 left-5 z-40 flex gap-3 items-start">
        <div className="flex flex-col gap-2">
          <div className="bg-space-800/85 backdrop-blur-xl rounded-2xl p-2 border border-tech-500/20 shadow-2xl">
            <div className="space-y-1">
              {viewPresets.map((preset) => (
                <Button
                  key={preset.id}
                  type="text"
                  icon={preset.icon}
                  onClick={() => handleViewChange(preset)}
                  className={cn(
                    '!w-12 !h-12 !flex !flex-col !items-center !justify-center !gap-1 !rounded-xl !text-text-secondary',
                    'hover:!bg-tech-500/15 hover:!text-tech-300 !transition-all !duration-200',
                    '!border-none !p-0',
                  )}
                >
                  <span className="text-[9px] mt-0.5 leading-tight">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-space-800/85 backdrop-blur-xl rounded-xl px-4 py-3 border border-tech-500/20 shadow-xl">
            <div className="text-[10px] text-text-tertiary mb-1 uppercase tracking-wider">当前图层</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(activeLayers)
                .filter(([_, v]) => v)
                .slice(0, 4)
                .map(([key]) => (
                  <Tag
                    key={key}
                    color="cyan"
                    className="!m-0 !border-cyan-500/30 !bg-cyan-500/10 !text-[10px] !px-2 !py-0.5"
                  >
                    {key === 'buildings' && '建筑'}
                    {key === 'roads' && '道路'}
                    {key === 'water' && '水系'}
                    {key === 'poi' && 'POI'}
                    {key === 'video' && '视频'}
                    {key === 'traffic' && '交通'}
                    {key === 'pipeline' && '管网'}
                    {key === 'environment' && '环境'}
                    {key === 'vegetation' && '植被'}
                  </Tag>
                ))}
              {Object.values(activeLayers).filter(Boolean).length > 4 && (
                <Tag className="!m-0 !text-[10px] !px-2 !py-0.5">+{Object.values(activeLayers).filter(Boolean).length - 4}</Tag>
              )}
            </div>
          </div>
        </div>

        <MapToolbar />
      </div>

      <div className="absolute top-5 right-24 z-40">
        <LayerPanel />
      </div>
      <div className="absolute top-24 right-24 z-40">
        <FavoritePanel />
      </div>
      <PatrolPanel />

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-80px)] max-w-5xl">
        <PlaybackTimeline />
      </div>

      <div className="absolute bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-space-800/85 backdrop-blur-xl rounded-xl px-4 py-3 border border-tech-500/20 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-tech-500/30 flex items-center justify-center">
                  <Navigation
                    className="w-6 h-6 text-red-500 transition-transform duration-1000"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 text-[10px] font-bold text-red-400">N</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 text-[10px] text-text-tertiary">S</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 text-[10px] text-text-tertiary">W</div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5 text-[10px] text-text-tertiary">E</div>
              </div>
              <div>
                <div className="text-[10px] text-text-tertiary mb-0.5 uppercase tracking-wider">指北针</div>
                <div className="text-sm font-mono text-text-primary">
                  {Math.round(rotation)}°
                </div>
              </div>
            </div>
          </div>

          <div className="bg-space-800/85 backdrop-blur-xl rounded-xl px-4 py-3 border border-tech-500/20 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-24 h-2 relative bg-gradient-to-r from-tech-500 via-tech-400 to-tech-500 rounded-full">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-tech-300 border-r-[6px] border-r-transparent" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-tech-300 border-r-[6px] border-r-transparent" />
                </div>
                <div className="flex items-center justify-between w-full text-[9px] font-mono text-text-tertiary">
                  <span>0</span>
                  <span>{scale}m</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-text-tertiary mb-0.5 uppercase tracking-wider flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  比例尺
                </div>
                <div className="text-sm font-mono text-text-primary">1 : {scale * 200}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-space-800/85 backdrop-blur-xl rounded-xl px-4 py-3 border border-tech-500/20 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tech-500/15 border border-tech-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-tech-400" />
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary mb-0.5 uppercase tracking-wider">当前坐标</div>
              <div className="text-sm font-mono text-tech-300">
                {formatCoordinate(coordinate.lng, coordinate.lat, 6)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 z-40">
        <div className="bg-space-800/85 backdrop-blur-xl rounded-xl px-4 py-3 border border-tech-500/20 shadow-xl">
          <div className="text-[10px] text-text-tertiary mb-1 uppercase tracking-wider">场景状态</div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-text-secondary">引擎正常</span>
            </div>
            <div className="text-text-tertiary">|</div>
            <div className="text-text-secondary">
              FPS: <span className="text-data-good font-mono">60</span>
            </div>
            <div className="text-text-tertiary">|</div>
            <div className="text-text-secondary">
              模型: <span className="text-tech-300 font-mono">2.8k</span>
            </div>
          </div>
        </div>
      </div>

      <POIDetailModal
        poi={selectedPOI}
        open={poiModalOpen}
        onClose={handleClosePOIModal}
      />
    </div>
  );
};

export default Map3DPage;
