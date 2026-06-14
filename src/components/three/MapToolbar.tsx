import React, { useMemo } from 'react';
import { Select, Button, message } from 'antd';
import {
  MapPin,
  Navigation,
  Share2,
  RotateCcw,
  Shield,
  Car,
  AlertTriangle,
  Moon,
  Layers,
} from 'lucide-react';
import { useMapStore, type PresetName } from '@/store/useMapStore';
import { districts } from '@/mock/events';

interface DistrictView {
  position: [number, number, number];
  target: [number, number, number];
}

const districtViews: Record<string, DistrictView> = {
  d001: { position: [0, 60, 80], target: [0, 0, 0] },
  d002: { position: [60, 50, 60], target: [50, 0, 0] },
  d003: { position: [-60, 50, 60], target: [-50, 0, 0] },
  d004: { position: [40, 50, -70], target: [30, 0, -60] },
  d005: { position: [0, 50, 80], target: [0, 0, 70] },
  d006: { position: [80, 50, -40], target: [70, 0, -30] },
};

interface PresetButtonConfig {
  name: PresetName;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
}

const presetButtons: PresetButtonConfig[] = [
  {
    name: 'daily',
    label: '日常巡检',
    icon: <Shield className="w-4 h-4" />,
    colorClass: 'from-blue-500/80 to-blue-600/80 text-blue-300 border-blue-500/40',
    glowClass: 'shadow-glow-blue',
  },
  {
    name: 'rush',
    label: '交通高峰',
    icon: <Car className="w-4 h-4" />,
    colorClass: 'from-orange-500/80 to-orange-600/80 text-orange-300 border-orange-500/40',
    glowClass: 'shadow-glow-orange',
  },
  {
    name: 'emergency',
    label: '应急模式',
    icon: <AlertTriangle className="w-4 h-4" />,
    colorClass: 'from-red-500/80 to-red-600/80 text-red-300 border-red-500/40',
    glowClass: 'shadow-glow-red',
  },
  {
    name: 'night',
    label: '夜间监控',
    icon: <Moon className="w-4 h-4" />,
    colorClass: 'from-purple-500/80 to-purple-600/80 text-purple-300 border-purple-500/40',
    glowClass: 'shadow-glow-purple',
  },
];

const MapToolbar: React.FC = () => {
  const {
    visibleDistrict,
    setVisibleDistrict,
    currentPreset,
    applyPreset,
    flyToPosition,
    cameraPosition,
    cameraTarget,
    activeLayers,
  } = useMapStore();

  const districtOptions = useMemo(() => {
    const options = [
      { value: 'all', label: '全部' },
      ...districts.map((d) => ({ value: d.id, label: d.name })),
    ];
    return options;
  }, []);

  const handleDistrictChange = (value: string) => {
    if (value === 'all') {
      setVisibleDistrict(null);
      flyToPosition({
        position: { x: 120, y: 100, z: 120 },
        target: { x: 0, y: 0, z: 0 },
        duration: 1500,
      });
    } else {
      const district = districts.find((d) => d.id === value);
      if (district) {
        setVisibleDistrict(district);
        const view = districtViews[value];
        if (view) {
          flyToPosition({
            position: { x: view.position[0], y: view.position[1], z: view.position[2] },
            target: { x: view.target[0], y: view.target[1], z: view.target[2] },
            duration: 1500,
          });
        }
      }
    }
  };

  const handleCopyViewLink = async () => {
    try {
      const pos = `${cameraPosition.x.toFixed(2)},${cameraPosition.y.toFixed(2)},${cameraPosition.z.toFixed(2)}`;
      const tgt = `${cameraTarget.x.toFixed(2)},${cameraTarget.y.toFixed(2)},${cameraTarget.z.toFixed(2)}`;
      const activeLayerNames = Object.entries(activeLayers)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(',');
      const url = `${window.location.origin}/map?pos=${pos}&tgt=${tgt}&layer=${activeLayerNames}`;
      await navigator.clipboard.writeText(url);
      message.success('视角链接已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动复制');
    }
  };

  const handleResetView = () => {
    flyToPosition({
      position: { x: 120, y: 100, z: 120 },
      target: { x: 0, y: 0, z: 0 },
      duration: 1500,
    });
  };

  return (
    <div className="bg-space-800/85 backdrop-blur-xl rounded-2xl p-4 border border-tech-500/20 shadow-2xl w-72">
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-tech-400" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              区域筛选
            </span>
          </div>
          <Select
            value={visibleDistrict?.id || 'all'}
            onChange={handleDistrictChange}
            options={districtOptions}
            className="w-full"
            size="large"
            style={{
              background: 'rgba(15, 31, 56, 0.8)',
            }}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-tech-400" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              图层预设
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presetButtons.map((preset) => {
              const isActive = currentPreset === preset.name;
              return (
                <Button
                  key={preset.name}
                  type={isActive ? 'primary' : 'default'}
                  icon={preset.icon}
                  onClick={() => applyPreset(preset.name)}
                  className={
                    isActive
                      ? `!bg-gradient-to-r ${preset.colorClass} !border-2 ${preset.glowClass} !text-white !font-medium !h-auto !py-2 !px-2 !rounded-xl`
                      : '!bg-space-700/50 !border-tech-500/20 !text-text-secondary hover:!border-tech-400/40 hover:!text-text-primary !h-auto !py-2 !px-2 !rounded-xl'
                  }
                >
                  <span className="text-xs">{preset.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-4 h-4 text-tech-400" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              视角分享
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="default"
              icon={<Share2 className="w-4 h-4" />}
              onClick={handleCopyViewLink}
              className="!flex-1 !bg-space-700/50 !border-tech-500/20 !text-text-secondary hover:!border-tech-400/40 hover:!text-tech-300 !h-10 !rounded-xl"
            >
              <span className="text-xs">复制视角链接</span>
            </Button>
            <Button
              type="default"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleResetView}
              className="!bg-space-700/50 !border-tech-500/20 !text-text-secondary hover:!border-tech-400/40 hover:!text-tech-300 !h-10 !w-10 !rounded-xl !p-0"
              title="重置到默认视角"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;
