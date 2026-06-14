import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Settings,
  RefreshCw,
  Camera,
  Wifi,
  WifiOff,
  Grid2X2,
  Square,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type VideoPlayerMode = '1x1' | '2x2';

export interface VideoPlayerProps {
  mode?: VideoPlayerMode;
  cameraIds?: string[];
  className?: string;
  showControls?: boolean;
}

interface CameraInfo {
  id: string;
  name: string;
  location: string;
  online: boolean;
  hasSignal: boolean;
}

const defaultCameras: CameraInfo[] = [
  {
    id: 'CAM001',
    name: 'CBD中心路口',
    location: '中央商务区-A1栋',
    online: true,
    hasSignal: true,
  },
  {
    id: 'CAM002',
    name: '火车站广场',
    location: '交通枢纽-南广场',
    online: true,
    hasSignal: true,
  },
  {
    id: 'CAM003',
    name: '工业园区东门',
    location: '经济开发区-1号门',
    online: true,
    hasSignal: true,
  },
  {
    id: 'CAM004',
    name: '地铁换乘站',
    location: '地铁1号线-人民广场站',
    online: false,
    hasSignal: false,
  },
];

const SingleVideoPanel: React.FC<{
  camera: CameraInfo;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ camera, index, isSelected, onClick }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const hueRotate = (index * 47) % 360;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-lg overflow-hidden cursor-pointer group',
        'bg-space-900 border transition-all duration-200',
        isSelected
          ? 'border-tech-400/60 ring-2 ring-tech-400/30 shadow-glow-blue-sm'
          : 'border-tech-500/20 hover:border-tech-400/40',
      )}
      style={{ aspectRatio: '16/9' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(${hueRotate}, 60%, 15%) 0%, hsl(${(hueRotate + 60) % 360}, 60%, 10%) 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {camera.hasSignal ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="relative w-20 h-20 rounded-full bg-tech-500/10 flex items-center justify-center border border-tech-500/30 backdrop-blur-sm">
                <Camera className="w-10 h-10 text-tech-400/60" />
                <div className="absolute inset-0 rounded-full border-2 border-tech-400/20 animate-ping" />
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-tech-400/60 rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 24}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-tertiary">
              <WifiOff className="w-10 h-10" />
              <span className="text-sm">无视频信号</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2.5 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          {camera.hasSignal && camera.online ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/90">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-bold text-white">REC</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-500/80">
              <WifiOff className="w-3 h-3 text-white" />
              <span className="text-[10px] font-medium text-white">离线</span>
            </span>
          )}
          <span className="text-xs font-mono text-white/90">{camera.id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {camera.online ? (
            <Wifi className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-gray-500" />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="p-2.5">
          <div className="text-sm font-medium text-white mb-0.5 truncate">
            {camera.name}
          </div>
          <div className="text-[11px] text-white/60 truncate mb-2">
            {camera.location}
          </div>
          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mode = '1x1',
  cameraIds,
  className,
  showControls = true,
}) => {
  const [currentMode, setCurrentMode] = useState<VideoPlayerMode>(mode);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showPTZ, setShowPTZ] = useState(true);

  const cameras: CameraInfo[] = cameraIds
    ? cameraIds.map((id, idx) => {
        const existing = defaultCameras.find((c) => c.id === id);
        return (
          existing || {
            id,
            name: `摄像头 ${id}`,
            location: '未知位置',
            online: true,
            hasSignal: true,
          }
        );
      })
    : defaultCameras.slice(0, currentMode === '1x1' ? 1 : 4);

  const displayCameras = currentMode === '1x1' ? [cameras[selectedIndex] || cameras[0]] : cameras.slice(0, 4);

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'grid gap-3',
          currentMode === '1x1' ? 'grid-cols-1' : 'grid-cols-2',
        )}
      >
        {displayCameras.map((camera, idx) => (
          <SingleVideoPanel
            key={camera.id + idx}
            camera={camera}
            index={idx}
            isSelected={currentMode === '1x1' ? true : selectedIndex === idx}
            onClick={() => setSelectedIndex(idx)}
          />
        ))}
      </div>

      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-space-800/60 border border-tech-500/15">
            <button
              onClick={() => setCurrentMode('1x1')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                currentMode === '1x1'
                  ? 'bg-tech-500/20 text-tech-300'
                  : 'text-text-secondary hover:text-text-primary hover:bg-tech-500/10',
              )}
            >
              <Square className="w-3.5 h-3.5" />
              单画面
            </button>
            <button
              onClick={() => setCurrentMode('2x2')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                currentMode === '2x2'
                  ? 'bg-tech-500/20 text-tech-300'
                  : 'text-text-secondary hover:text-text-primary hover:bg-tech-500/10',
              )}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              四画面
            </button>
          </div>

          {showPTZ && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-space-800/60 border border-tech-500/15">
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  <div />
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="上"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div />
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="左"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="居中"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="右"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div />
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="下"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div />
                </div>
                <div className="w-px h-8 bg-tech-500/20 mx-1" />
                <div className="flex flex-col gap-0.5 p-0.5">
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="放大"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-tech-500/20 text-text-secondary hover:text-tech-300 transition-all"
                    title="缩小"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowPTZ(!showPTZ)}
                className="p-2 rounded-lg bg-space-800/60 border border-tech-500/15 text-text-secondary hover:text-tech-300 hover:bg-tech-500/10 transition-all"
                title="云台设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
