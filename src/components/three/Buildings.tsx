import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore';

interface BuildingData {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  emissiveColor: string;
  emissiveIntensity: number;
  floors: number;
}

function generateBuildings(): BuildingData[] {
  const buildings: BuildingData[] = [];
  const buildingColors = [
    '#3A5F8B',
    '#4A6F9B',
    '#2E4A6B',
    '#5078A0',
    '#3B5A84',
    '#6B8DB5',
    '#2C4A72',
    '#5C7FA3',
  ];
  const emissiveColors = [
    '#FFD700',
    '#FFA500',
    '#FFFF99',
    '#FFE4B5',
    '#87CEEB',
  ];

  function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const centerAreaCount = 50;
  const midAreaCount = 40;
  const outerAreaCount = 30;
  let id = 0;

  for (let i = 0; i < centerAreaCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = rand(3, 30);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const w = rand(4, 8);
    const d = rand(4, 8);
    const h = rand(25, 60);

    buildings.push({
      id: `bld-${id++}`,
      position: [x, h / 2, z],
      size: [w, h, d],
      color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
      emissiveColor: emissiveColors[Math.floor(Math.random() * emissiveColors.length)],
      emissiveIntensity: rand(0.15, 0.35),
      floors: Math.floor(h / 3),
    });
  }

  for (let i = 0; i < midAreaCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = rand(32, 65);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const w = rand(5, 10);
    const d = rand(5, 10);
    const h = rand(15, 35);

    buildings.push({
      id: `bld-${id++}`,
      position: [x, h / 2, z],
      size: [w, h, d],
      color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
      emissiveColor: emissiveColors[Math.floor(Math.random() * emissiveColors.length)],
      emissiveIntensity: rand(0.1, 0.28),
      floors: Math.floor(h / 3),
    });
  }

  for (let i = 0; i < outerAreaCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = rand(68, 100);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const w = rand(6, 14);
    const d = rand(6, 14);
    const h = rand(8, 22);

    buildings.push({
      id: `bld-${id++}`,
      position: [x, h / 2, z],
      size: [w, h, d],
      color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
      emissiveColor: emissiveColors[Math.floor(Math.random() * emissiveColors.length)],
      emissiveIntensity: rand(0.08, 0.22),
      floors: Math.floor(h / 3),
    });
  }

  return buildings;
}

interface BuildingMeshProps {
  data: BuildingData;
}

function BuildingMesh({ data }: BuildingMeshProps) {
  const [hovered, setHovered] = useState(false);
  const { setHoveredBuilding, hoveredBuildingId } = useMapStore();
  const isHighlighted = hovered || hoveredBuildingId === data.id;

  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 256, 256);

    const cols = 8;
    const rows = Math.floor(data.floors * 1.2);
    const cellW = 256 / cols;
    const cellH = 256 / Math.max(rows, 4);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.35) {
          const brightness = Math.random();
          const rVal = Math.floor(255 * (0.8 + brightness * 0.2));
          const gVal = Math.floor(220 + brightness * 35);
          const bVal = Math.floor(120 + brightness * 80);
          ctx.fillStyle = `rgb(${rVal},${gVal},${bVal})`;
          const wW = cellW * 0.55;
          const wH = cellH * 0.5;
          ctx.fillRect(
            c * cellW + (cellW - wW) / 2,
            r * cellH + (cellH - wH) / 2,
            wW,
            wH
          );
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, data.floors / 8);
    return texture;
  }, [data.floors]);

  return (
    <mesh
      position={data.position}
      castShadow
      receiveShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setHoveredBuilding(isHighlighted && hoveredBuildingId === data.id ? null : data.id);
      }}
    >
      <boxGeometry args={data.size} />
      <meshStandardMaterial
        color={isHighlighted ? '#00FFFF' : data.color}
        emissive={isHighlighted ? '#00FFFF' : data.emissiveColor}
        emissiveIntensity={isHighlighted ? 0.6 : data.emissiveIntensity}
        metalness={0.35}
        roughness={0.55}
      />
      <mesh position={[0, 0, data.size[2] / 2 + 0.001]}>
        <planeGeometry args={[data.size[0] * 0.98, data.size[1] * 0.98]} />
        <meshBasicMaterial map={windowTexture} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0, -(data.size[2] / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[data.size[0] * 0.98, data.size[1] * 0.98]} />
        <meshBasicMaterial map={windowTexture} transparent opacity={0.85} />
      </mesh>
      <mesh position={[data.size[0] / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[data.size[2] * 0.98, data.size[1] * 0.98]} />
        <meshBasicMaterial map={windowTexture} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-(data.size[0] / 2 + 0.001), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[data.size[2] * 0.98, data.size[1] * 0.98]} />
        <meshBasicMaterial map={windowTexture} transparent opacity={0.85} />
      </mesh>
      {isHighlighted && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...data.size.map(v => v + 0.4) as [number, number, number])]} />
          <lineBasicMaterial color="#00FFFF" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

export default function Buildings() {
  const buildings = useMemo(() => generateBuildings(), []);

  return (
    <group>
      {buildings.map((b) => (
        <BuildingMesh key={b.id} data={b} />
      ))}
    </group>
  );
}
