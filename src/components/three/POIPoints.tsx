import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import { useMapStore } from '@/store/useMapStore';
import type { POI } from '@/types';

type POICategory = 'mall' | 'school' | 'hospital' | 'government' | 'park' | 'subway' | 'hotel';

interface POIData {
  id: string;
  name: string;
  type: POICategory;
  position: [number, number, number];
  color: string;
  icon: string;
}

const poiConfig: Record<POICategory, { color: string; icon: string; label: string }> = {
  mall: { color: '#FF69B4', icon: '🏬', label: '商场' },
  school: { color: '#FFD700', icon: '🏫', label: '学校' },
  hospital: { color: '#FF4444', icon: '🏥', label: '医院' },
  government: { color: '#4169E1', icon: '🏛️', label: '政府' },
  park: { color: '#32CD32', icon: '🌳', label: '公园' },
  subway: { color: '#9370DB', icon: '🚇', label: '地铁' },
  hotel: { color: '#FF8C00', icon: '🏨', label: '酒店' },
};

function generatePOIs(): POIData[] {
  const categories: POICategory[] = ['mall', 'school', 'hospital', 'government', 'park', 'subway', 'hotel'];
  const pois: POIData[] = [];
  const names: Record<POICategory, string[]> = {
    mall: ['万象城购物中心', '万达广场', '银泰百货', '恒隆广场', '大悦城'],
    school: ['第一中学', '实验小学', 'XX大学', '阳光小学', '育才中学'],
    hospital: ['市中心医院', '人民医院', '第一医院', '中医院', '妇幼保健院'],
    government: ['市政府', '区政府', '行政服务中心', '公安局', '税务局'],
    park: ['城市中央公园', '人民公园', '滨江公园', '文化公园', '体育公园'],
    subway: ['地铁1号线·中心站', '地铁2号线·东站', '地铁3号线·南站', '地铁4号线·西站', '地铁5号线·北站'],
    hotel: ['五星大酒店', '希尔顿酒店', '万豪酒店', '洲际酒店', '喜来登酒店'],
  };

  const preset: Array<{ type: POICategory; pos: [number, number, number] }> = [
    { type: 'mall', pos: [-30, 12, -20] },
    { type: 'school', pos: [40, 10, 35] },
    { type: 'hospital', pos: [-50, 8, 45] },
    { type: 'government', pos: [10, 25, 10] },
    { type: 'park', pos: [70, 5, -30] },
    { type: 'subway', pos: [-15, 5, 50] },
    { type: 'hotel', pos: [25, 18, -55] },
    { type: 'mall', pos: [-70, 8, -10] },
    { type: 'school', pos: [55, 6, 65] },
    { type: 'hospital', pos: [80, 7, 20] },
    { type: 'government', pos: [-40, 15, -60] },
    { type: 'park', pos: [-80, 4, 30] },
    { type: 'subway', pos: [35, 4, -75] },
    { type: 'hotel', pos: [-60, 12, -80] },
    { type: 'mall', pos: [60, 10, -50] },
    { type: 'school', pos: [-20, 7, 80] },
  ];

  preset.forEach((p, i) => {
    const config = poiConfig[p.type];
    pois.push({
      id: `poi-${i}`,
      name: names[p.type][i % names[p.type].length],
      type: p.type,
      position: p.pos,
      color: config.color,
      icon: config.icon,
    });
  });

  return pois;
}

interface POIMarkerProps {
  poi: POIData;
}

function POIMarker({ poi }: POIMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const { setClickedPOI } = useMapStore();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = poi.position[1] + Math.sin(time * 2 + poi.position[0]) * 0.8;
    }
    if (pulseRef.current) {
      const scale = 1 + Math.sin(time * 3) * 0.3;
      pulseRef.current.scale.set(scale, scale, scale);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 - Math.sin(time * 3) * 0.25;
    }
  });

  const handleClick = () => {
    const poiData: POI = {
      id: poi.id,
      name: poi.name,
      type: poi.type,
      position: { x: poi.position[0], y: poi.position[1], z: poi.position[2] },
      info: { category: poiConfig[poi.type].label },
    };
    setClickedPOI(poiData);
  };

  return (
    <group position={[poi.position[0], 0, poi.position[2]]}>
      <group ref={groupRef}>
        <mesh ref={pulseRef} position={[0, 0, 0]}>
          <sphereGeometry args={[2.2, 24, 24]} />
          <meshBasicMaterial color={poi.color} transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshStandardMaterial
            color={poi.color}
            emissive={poi.color}
            emissiveIntensity={0.8}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
          <meshBasicMaterial color={poi.color} />
        </mesh>
        <Billboard position={[0, 7, 0]}>
          <Html
            center
            distanceFactor={10}
            zIndexRange={[100, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              onClick={handleClick}
              style={{
                background: `linear-gradient(135deg, ${poi.color}dd, ${poi.color}99)`,
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: `0 4px 16px ${poi.color}66`,
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              <span style={{ marginRight: '6px' }}>{poi.icon}</span>
              {poi.name}
            </div>
          </Html>
        </Billboard>
      </group>
    </group>
  );
}

export default function POIPoints() {
  const pois = useMemo(() => generatePOIs(), []);

  return (
    <group>
      {pois.map((poi) => (
        <POIMarker key={poi.id} poi={poi} />
      ))}
    </group>
  );
}
