import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterBody {
  position: [number, number, number];
  size: [number, number];
  rotation?: [number, number, number];
  type: 'river' | 'lake';
}

function generateWaterBodies(): WaterBody[] {
  return [
    {
      position: [-15, 0.2, 0],
      size: [260, 14],
      rotation: [0, Math.PI / 6, 0],
      type: 'river',
    },
    {
      position: [50, 0.2, -55],
      size: [35, 28],
      type: 'lake',
    },
    {
      position: [-60, 0.2, 60],
      size: [28, 22],
      type: 'lake',
    },
  ];
}

interface WaterMeshProps {
  body: WaterBody;
}

function WaterMesh({ body }: WaterMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  const originalPositions = useRef<Float32Array | null>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, 'rgba(30, 144, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(65, 105, 225, 0.85)');
    gradient.addColorStop(1, 'rgba(0, 191, 255, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 8;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(body.size[0] / 40, body.size[1] / 40);
    return tex;
  }, [body.size]);

  useFrame(({ clock }) => {
    if (!geometryRef.current || !meshRef.current) return;
    const positions = geometryRef.current.attributes.position;
    if (!originalPositions.current) {
      originalPositions.current = new Float32Array(positions.array as Float32Array);
    }

    const time = clock.getElapsedTime();
    const pos = positions.array as Float32Array;
    const orig = originalPositions.current;

    for (let i = 0; i < positions.count; i++) {
      const x = orig[i * 3];
      const z = orig[i * 3 + 2];
      const wave1 = Math.sin(x * 0.08 + time * 1.5) * 0.15;
      const wave2 = Math.cos(z * 0.1 + time * 1.2) * 0.12;
      const wave3 = Math.sin((x + z) * 0.05 + time * 0.8) * 0.1;
      pos[i * 3 + 1] = orig[i * 3 + 1] + wave1 + wave2 + wave3;
    }

    positions.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
    texture.offset.x = time * 0.02;
    texture.offset.y = time * 0.015;
  });

  return (
    <group position={body.position} rotation={body.rotation}>
      <mesh ref={meshRef} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry
          ref={geometryRef}
          args={[body.size[0], body.size[1], 64, 64]}
        />
        <meshStandardMaterial
          map={texture}
          color="#1E90FF"
          transparent
          opacity={0.75}
          emissive="#4169E1"
          emissiveIntensity={0.25}
          metalness={0.45}
          roughness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[body.size[0] + 2, body.size[1] + 2]} />
        <meshBasicMaterial
          color="#00CED1"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function WaterSystem() {
  const waterBodies = useMemo(() => generateWaterBodies(), []);

  return (
    <group>
      {waterBodies.map((body, i) => (
        <WaterMesh key={`water-${i}`} body={body} />
      ))}
    </group>
  );
}
