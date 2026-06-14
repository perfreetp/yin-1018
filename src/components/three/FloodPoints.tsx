import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore';

type FloodSeverity = 'low' | 'medium' | 'high' | 'critical';

interface FloodPointData {
  id: string;
  name: string;
  position: [number, number, number];
  baseDepth: number;
  baseSeverity: FloodSeverity;
  color: string;
}

const severityConfig: Record<FloodSeverity, { color: string; label: string }> = {
  low: { color: '#FFA500', label: '轻度积水' },
  medium: { color: '#FF7F00', label: '中度积水' },
  high: { color: '#FF4500', label: '重度积水' },
  critical: { color: '#DC143C', label: '严重积水' },
};

function getTimeSegment(hour: number): 'night' | 'morningRush' | 'day' | 'eveningRush' | 'lateNight' {
  if (hour >= 0 && hour < 6) return 'night';
  if (hour >= 6 && hour < 10) return 'morningRush';
  if (hour >= 10 && hour < 16) return 'day';
  if (hour >= 16 && hour < 20) return 'eveningRush';
  return 'lateNight';
}

function getDepthMultiplier(hour: number): number {
  const segment = getTimeSegment(hour);
  const multipliers: Record<typeof segment, number> = {
    night: 1.4,
    morningRush: 1.3,
    day: 1.0,
    eveningRush: 1.1,
    lateNight: 1.25,
  };
  return multipliers[segment];
}

function adjustSeverity(baseSeverity: FloodSeverity, hour: number, index: number): FloodSeverity {
  const multiplier = getDepthMultiplier(hour);
  const severities: FloodSeverity[] = ['low', 'medium', 'high', 'critical'];
  let baseIdx = severities.indexOf(baseSeverity);
  if (multiplier > 1.2 && index % 3 === 0 && baseIdx < severities.length - 1) {
    baseIdx += 1;
  }
  if (multiplier < 1.1 && index % 4 === 0 && baseIdx > 0) {
    baseIdx -= 1;
  }
  return severities[baseIdx];
}

function generateFloodPoints(): FloodPointData[] {
  const raw: Array<Omit<FloodPointData, 'color' | 'id'>> = [
    { name: '人民路·XX路口', position: [-45, 0, 20], baseDepth: 0.35, baseSeverity: 'low' },
    { name: '中山大道·下穿隧道', position: [25, 0, -40], baseDepth: 1.2, baseSeverity: 'high' },
    { name: '解放路·铁路桥下', position: [-70, 0, -25], baseDepth: 0.65, baseSeverity: 'medium' },
    { name: '建设路·低洼段', position: [60, 0, 50], baseDepth: 1.8, baseSeverity: 'critical' },
    { name: '文化路·地下通道', position: [10, 0, 75], baseDepth: 0.8, baseSeverity: 'medium' },
    { name: '黄河路·立交桥下', position: [-20, 0, -80], baseDepth: 1.5, baseSeverity: 'high' },
    { name: '长江路·小区门口', position: [80, 0, -15], baseDepth: 0.25, baseSeverity: 'low' },
    { name: '和平路·老城区', position: [-85, 0, 55], baseDepth: 2.1, baseSeverity: 'critical' },
  ];
  return raw.map((r, i) => ({
    ...r,
    id: `flood-${i}`,
    color: severityConfig[r.baseSeverity].color,
  }));
}

interface FloodMeshProps {
  point: FloodPointData;
  index: number;
  currentHour: number;
}

function FloodMesh({ point, index, currentHour }: FloodMeshProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const effectiveSeverity = useMemo(
    () => adjustSeverity(point.baseSeverity, currentHour, index),
    [point.baseSeverity, currentHour, index],
  );
  const depthMultiplier = useMemo(() => getDepthMultiplier(currentHour), [currentHour]);
  const effectiveDepth = point.baseDepth * depthMultiplier;
  const waterHeight = Math.max(effectiveDepth * 3, 0.8);
  const config = severityConfig[effectiveSeverity];
  const effectiveColor = config.color;

  const waterTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, effectiveColor);
    gradient.addColorStop(1, '#8B0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 2 + Math.random() * 6;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [effectiveColor]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (waterRef.current) {
      waterRef.current.position.y = waterHeight / 2 + Math.sin(time * 2 + index) * 0.15;
      const geom = waterRef.current.geometry as THREE.CylinderGeometry;
      const pos = geom.attributes.position;
      if (pos) {
        const arr = pos.array as Float32Array;
        for (let i = 0; i < pos.count; i++) {
          const y = arr[i * 3 + 1];
          if (y > 0) {
            const x = arr[i * 3];
            const z = arr[i * 3 + 2];
            arr[i * 3 + 1] = y + Math.sin(x * 0.5 + time * 2 + index) * 0.08
              + Math.cos(z * 0.5 + time * 1.5) * 0.06;
          }
        }
        pos.needsUpdate = true;
        geom.computeVertexNormals();
      }
    }
    if (ring1Ref.current) {
      const s = 1 + Math.sin(time * 2 + index) * 0.15;
      ring1Ref.current.scale.set(s, 1, s);
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 - Math.sin(time * 2 + index) * 0.2;
    }
    if (ring2Ref.current) {
      const s = 1.5 + Math.sin(time * 1.5 + index + 1) * 0.2;
      ring2Ref.current.scale.set(s, 1, s);
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 - Math.sin(time * 1.5 + index + 1) * 0.15;
    }
  });

  return (
    <group position={[point.position[0], 0, point.position[2]]}>
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2, 3, 32]} />
        <meshBasicMaterial color={effectiveColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[3.5, 4.5, 32]} />
        <meshBasicMaterial color={effectiveColor} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color={effectiveColor} transparent opacity={0.4} />
      </mesh>
      <mesh ref={waterRef} position={[0, waterHeight / 2, 0]}>
        <cylinderGeometry args={[1.8, 2, waterHeight, 24, 4, true]} />
        <meshStandardMaterial
          map={waterTexture}
          color={effectiveColor}
          transparent
          opacity={0.75}
          emissive={effectiveColor}
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, waterHeight + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 24]} />
        <meshStandardMaterial
          color={effectiveColor}
          transparent
          opacity={0.6}
          emissive={effectiveColor}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>
      <Billboard position={[0, waterHeight + 5, 0]}>
        <Html
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${effectiveColor}ee, ${effectiveColor}aa)`,
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 18px ${effectiveColor}66`,
              border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ marginBottom: '4px', fontSize: '14px' }}>
              ⚠️ {point.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '12px', opacity: 0.95 }}>
              <span>等级：{config.label}</span>
              <span style={{ color: '#FFFF99', fontWeight: 700 }}>
                水深：{effectiveDepth.toFixed(2)}m
              </span>
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export default function FloodPoints() {
  const { getCurrentPlaybackTime } = useMapStore();
  const [currentHour, setCurrentHour] = useState(() => getCurrentPlaybackTime().getHours());
  const points = useMemo(() => generateFloodPoints(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(getCurrentPlaybackTime().getHours());
    }, 500);
    return () => clearInterval(interval);
  }, [getCurrentPlaybackTime]);

  return (
    <group>
      {points.map((p, i) => (
        <FloodMesh key={p.id} point={p} index={i} currentHour={currentHour} />
      ))}
    </group>
  );
}
