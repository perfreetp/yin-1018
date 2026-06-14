import { useMemo } from 'react';
import * as THREE from 'three';

type CongestionLevel = 1 | 2 | 3 | 4 | 5;

interface MainRoad {
  points: THREE.Vector3[];
  level: CongestionLevel;
}

interface BranchRoad {
  start: [number, number];
  end: [number, number];
  width: number;
}

function getCongestionColor(level: CongestionLevel): string {
  switch (level) {
    case 1: return '#32CD32';
    case 2: return '#9ACD32';
    case 3: return '#FFD700';
    case 4: return '#FF8C00';
    case 5: return '#FF4500';
  }
}

function generateMainRoads(): MainRoad[] {
  return [
    {
      points: [
        new THREE.Vector3(-120, 0.15, 0),
        new THREE.Vector3(-60, 0.15, 0),
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(60, 0.15, 0),
        new THREE.Vector3(120, 0.15, 0),
      ],
      level: 4,
    },
    {
      points: [
        new THREE.Vector3(0, 0.15, -120),
        new THREE.Vector3(0, 0.15, -60),
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(0, 0.15, 60),
        new THREE.Vector3(0, 0.15, 120),
      ],
      level: 3,
    },
    {
      points: [
        new THREE.Vector3(-100, 0.15, -100),
        new THREE.Vector3(-50, 0.15, -50),
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(50, 0.15, 50),
        new THREE.Vector3(100, 0.15, 100),
      ],
      level: 5,
    },
    {
      points: [
        new THREE.Vector3(-100, 0.15, 100),
        new THREE.Vector3(-50, 0.15, 50),
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(50, 0.15, -50),
        new THREE.Vector3(100, 0.15, -100),
      ],
      level: 2,
    },
  ];
}

function generateBranchRoads(): BranchRoad[] {
  const roads: BranchRoad[] = [];
  const spacing = 15;

  for (let x = -105; x <= 105; x += spacing) {
    if (Math.abs(x) < 3) continue;
    roads.push({
      start: [x, -110],
      end: [x, 110],
      width: 1.5,
    });
  }

  for (let z = -105; z <= 105; z += spacing) {
    if (Math.abs(z) < 3) continue;
    roads.push({
      start: [-110, z],
      end: [110, z],
      width: 1.5,
    });
  }

  return roads;
}

interface MainRoadMeshProps {
  road: MainRoad;
}

function MainRoadMesh({ road }: MainRoadMeshProps) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(road.points, false, 'catmullrom', 0.5),
    [road.points]
  );

  const color = getCongestionColor(road.level);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 300, 3.5, 8, false]} />
        <meshStandardMaterial
          color="#1a2a3a"
          metalness={0.2}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <tubeGeometry args={[curve, 300, 1.8, 6, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <tubeGeometry args={[curve, 300, 0.8, 4, false]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

interface BranchRoadMeshProps {
  road: BranchRoad;
}

function BranchRoadMesh({ road }: BranchRoadMeshProps) {
  const dx = road.end[0] - road.start[0];
  const dz = road.end[1] - road.start[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const midX = (road.start[0] + road.end[0]) / 2;
  const midZ = (road.start[1] + road.end[1]) / 2;

  return (
    <group position={[midX, 0.08, midZ]} rotation={[-Math.PI / 2, -angle, 0]}>
      <mesh>
        <planeGeometry args={[length, road.width]} />
        <meshStandardMaterial color="#1e2e3e" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <planeGeometry args={[length, road.width * 0.3]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default function RoadNetwork() {
  const mainRoads = useMemo(() => generateMainRoads(), []);
  const branchRoads = useMemo(() => generateBranchRoads(), []);

  return (
    <group>
      {mainRoads.map((road, i) => (
        <MainRoadMesh key={`main-${i}`} road={road} />
      ))}
      {branchRoads.map((road, i) => (
        <BranchRoadMesh key={`branch-${i}`} road={road} />
      ))}
    </group>
  );
}
