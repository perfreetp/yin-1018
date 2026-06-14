import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import { useMapStore } from '@/store/useMapStore';
import { cameraPoints } from '@/mock/maps';
import type { POI } from '@/types';

const statusConfig = {
  online: { color: '#00FF88', label: '在线', dot: '🟢' },
  offline: { color: '#888888', label: '离线', dot: '⚪' },
  maintenance: { color: '#FFAA00', label: '维护', dot: '🟡' },
};

interface VideoPointMeshProps {
  point: typeof cameraPoints[number];
  index: number;
}

function VideoPointMesh({ point, index }: VideoPointMeshProps) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const rotateRef = useRef<THREE.Group>(null);
  const { setClickedPOI } = useMapStore();
  const status = statusConfig[point.status];

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (pulseRef.current && point.status === 'online') {
      const scale = 1 + Math.sin(time * 3 + index) * 0.25;
      pulseRef.current.scale.set(scale, scale, scale);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(time * 3 + index) * 0.2;
    }
    if (rotateRef.current) {
      rotateRef.current.rotation.y = time * 0.8 + index;
    }
  });

  const handleClick = () => {
    const poiData: POI = {
      id: point.id,
      name: point.name,
      type: 'video_camera',
      position: { x: point.position.x, y: point.position.y, z: point.position.z },
      info: {
        status: point.status,
        statusLabel: status.label,
        address: point.address,
        manufacturer: point.manufacturer,
        model: point.model,
        installedDate: point.installedDate,
        streamUrl: point.streamUrl,
      },
    };
    setClickedPOI(poiData);
  };

  return (
    <group position={[point.position.x, point.position.y, point.position.z]}>
      {point.status === 'online' && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[1.6, 20, 20]} />
          <meshBasicMaterial color={status.color} transparent opacity={0.4} />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[0.9, 20, 20]} />
        <meshStandardMaterial
          color={status.color}
          emissive={status.color}
          emissiveIntensity={point.status === 'online' ? 0.7 : 0.2}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      <group ref={rotateRef}>
        <mesh position={[0, 0, 0.7]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.5, 12]} />
          <meshStandardMaterial color="#2a3a4a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color="#0a1628"
            emissive={point.status === 'online' ? '#00FF88' : '#333333'}
            emissiveIntensity={point.status === 'online' ? 0.5 : 0}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>
      <mesh position={[0, -point.position.y + 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.05, point.position.y, 6]} />
        <meshStandardMaterial color="#3a4a5a" metalness={0.5} roughness={0.6} />
      </mesh>
      <Billboard position={[0, 3, 0]}>
        <Html
          center
          distanceFactor={12}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            onClick={handleClick}
            style={{
              background: `linear-gradient(135deg, ${status.color}ee, ${status.color}99)`,
              color: point.status === 'offline' ? '#fff' : '#0a1628',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 14px ${status.color}55`,
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <span style={{ marginRight: '5px' }}>{status.dot}</span>
            {point.name}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export default function VideoPoints() {
  return (
    <group>
      {cameraPoints.map((point, i) => (
        <VideoPointMesh key={point.id} point={point} index={i} />
      ))}
    </group>
  );
}
