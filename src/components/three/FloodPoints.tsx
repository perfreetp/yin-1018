import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';

interface FloodPointData {
  id: string;
  name: string;
  position: [number, number, number];
  depth: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

const severityConfig = {
  low: { color: '#FFA500', label: '轻度积水' },
  medium: { color: '#FF7F00', label: '中度积水' },
  high: { color: '#FF4500', label: '重度积水' },
  critical: { color: '#DC143C', label: '严重积水' },
};

function generateFloodPoints(): FloodPointData[] {
  const raw: Array<Omit<FloodPointData, 'color' | 'id'>> = [
    { name: '人民路·XX路口', position: [-45, 0, 20], depth: 0.35, severity: 'low' },
    { name: '中山大道·下穿隧道', position: [25, 0, -40], depth: 1.2, severity: 'high' },
    { name: '解放路·铁路桥下', position: [-70, 0, -25], depth: 0.65, severity: 'medium' },
    { name: '建设路·低洼段', position: [60, 0, 50], depth: 1.8, severity: 'critical' },
    { name: '文化路·地下通道', position: [10, 0, 75], depth: 0.8, severity: 'medium' },
    { name: '黄河路·立交桥下', position: [-20, 0, -80], depth: 1.5, severity: 'high' },
    { name: '长江路·小区门口', position: [80, 0, -15], depth: 0.25, severity: 'low' },
    { name: '和平路·老城区', position: [-85, 0, 55], depth: 2.1, severity: 'critical' },
  ];
  return raw.map((r, i) => ({
    ...r,
    id: `flood-${i}`,
    color: severityConfig[r.severity].color,
  }));
}

interface FloodMeshProps {
  point: FloodPointData;
  index: number;
}

function FloodMesh({ point, index }: FloodMeshProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const waterHeight = Math.max(point.depth * 3, 0.8);
  const config = severityConfig[point.severity];

  const waterTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, point.color);
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
  }, [point.color]);

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
        <meshBasicMaterial color={point.color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[3.5, 4.5, 32]} />
        <meshBasicMaterial color={point.color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color={point.color} transparent opacity={0.4} />
      </mesh>
      <mesh ref={waterRef} position={[0, waterHeight / 2, 0]}>
        <cylinderGeometry args={[1.8, 2, waterHeight, 24, 4, true]} />
        <meshStandardMaterial
          map={waterTexture}
          color={point.color}
          transparent
          opacity={0.75}
          emissive={point.color}
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, waterHeight + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 24]} />
        <meshStandardMaterial
          color={point.color}
          transparent
          opacity={0.6}
          emissive={point.color}
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
              background: `linear-gradient(135deg, ${point.color}ee, ${point.color}aa)`,
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 18px ${point.color}66`,
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
                水深：{point.depth.toFixed(2)}m
              </span>
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export default function FloodPoints() {
  const points = useMemo(() => generateFloodPoints(), []);

  return (
    <group>
      {points.map((p, i) => (
        <FloodMesh key={p.id} point={p} index={i} />
      ))}
    </group>
  );
}
