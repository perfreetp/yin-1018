import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore';

interface BaseHeatPoint {
  position: [number, number, number];
  baseIntensity: number;
  radius: number;
}

interface HeatPoint extends BaseHeatPoint {
  intensity: number;
}

function generateBaseHeatPoints(): BaseHeatPoint[] {
  const points: BaseHeatPoint[] = [];
  const preset: Array<[number, number, number, number]> = [
    [0, 0, 0.95, 22],
    [-45, 20, 0.85, 18],
    [40, -35, 0.9, 20],
    [-25, -60, 0.7, 15],
    [55, 50, 0.78, 16],
    [-70, -25, 0.6, 14],
    [65, -10, 0.82, 17],
    [-60, 55, 0.5, 12],
    [25, 70, 0.65, 13],
    [-10, 45, 0.72, 15],
    [80, 25, 0.45, 10],
    [-85, -10, 0.55, 11],
    [15, -75, 0.58, 12],
    [-35, 80, 0.4, 9],
    [70, -65, 0.52, 11],
  ];

  preset.forEach(([x, z, intensity, radius]) => {
    points.push({
      position: [x, 0.12, z],
      baseIntensity: intensity,
      radius,
    });
  });

  return points;
}

function getTimeSegment(hour: number): 'night' | 'morningRush' | 'day' | 'eveningRush' | 'lateNight' {
  if (hour >= 0 && hour < 6) return 'night';
  if (hour >= 6 && hour < 10) return 'morningRush';
  if (hour >= 10 && hour < 16) return 'day';
  if (hour >= 16 && hour < 20) return 'eveningRush';
  return 'lateNight';
}

function getIntensityMultiplier(hour: number): number {
  const segment = getTimeSegment(hour);
  const multipliers: Record<typeof segment, number> = {
    night: 0.5,
    morningRush: 1.4,
    day: 1.0,
    eveningRush: 1.35,
    lateNight: 0.7,
  };
  return multipliers[segment];
}

function getAdjustedIntensity(baseIntensity: number, hour: number, index: number): number {
  const multiplier = getIntensityMultiplier(hour);
  const variance = ((index * 7 + hour * 3) % 20 - 10) / 100;
  let adjusted = baseIntensity * multiplier + variance;
  adjusted = Math.max(0.1, Math.min(1.0, adjusted));
  return adjusted;
}

function getHeatColor(intensity: number): string {
  if (intensity > 0.85) return '#FF0000';
  if (intensity > 0.7) return '#FF4500';
  if (intensity > 0.55) return '#FF8C00';
  if (intensity > 0.4) return '#FFD700';
  return '#32CD32';
}

interface HeatCellProps {
  point: HeatPoint;
  index: number;
}

function HeatCell({ point, index }: HeatCellProps) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const color = getHeatColor(point.intensity);

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, `${color}ee`);
    grad.addColorStop(0.3, `${color}aa`);
    grad.addColorStop(0.6, `${color}55`);
    grad.addColorStop(1, `${color}00`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (pulseRef.current) {
      const s = 1 + Math.sin(time * 1.8 + index) * 0.08;
      pulseRef.current.scale.set(s, 1, s);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = point.intensity * (0.75 + Math.sin(time * 1.8 + index) * 0.15);
    }
  });

  return (
    <group position={point.position}>
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[point.radius, 48]} />
        <meshBasicMaterial
          map={gradientTexture}
          transparent
          opacity={point.intensity * 0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[point.radius * 0.95, point.radius, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={point.intensity * 0.6}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[point.radius * 0.6, point.radius * 0.62, 48]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={point.intensity * 0.3}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Legend() {
  const items = [
    { label: '畅通', color: '#32CD32', range: '< 40%' },
    { label: '缓行', color: '#FFD700', range: '40-55%' },
    { label: '拥堵', color: '#FF8C00', range: '55-70%' },
    { label: '严重拥堵', color: '#FF4500', range: '70-85%' },
    { label: '极度拥堵', color: '#FF0000', range: '> 85%' },
  ];

  return (
    <group position={[-95, 0.2, 95]}>
      {items.map((item, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -i * 2.5]}>
          <planeGeometry args={[14, 2]} />
          <meshBasicMaterial color="#0a1628" transparent opacity={0.85} />
        </mesh>
      ))}
      {items.map((item, i) => (
        <mesh key={`dot-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.01, -i * 2.5]}>
          <circleGeometry args={[0.6, 20]} />
          <meshBasicMaterial color={item.color} />
        </mesh>
      ))}
    </group>
  );
}

export default function TrafficHeatLayer() {
  const { getCurrentPlaybackTime } = useMapStore();
  const [currentHour, setCurrentHour] = useState(() => getCurrentPlaybackTime().getHours());
  const basePoints = useMemo(() => generateBaseHeatPoints(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(getCurrentPlaybackTime().getHours());
    }, 500);
    return () => clearInterval(interval);
  }, [getCurrentPlaybackTime]);

  const points = useMemo(() => {
    return basePoints.map((bp, i) => ({
      ...bp,
      intensity: getAdjustedIntensity(bp.baseIntensity, currentHour, i),
    }));
  }, [basePoints, currentHour]);

  return (
    <group>
      {points.map((p, i) => (
        <HeatCell key={i} point={p} index={i} />
      ))}
      <Legend />
    </group>
  );
}
