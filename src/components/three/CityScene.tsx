import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useMapStore } from '@/store/useMapStore';
import Buildings from './Buildings';
import RoadNetwork from './RoadNetwork';
import WaterSystem from './WaterSystem';
import POIPoints from './POIPoints';
import VideoPoints from './VideoPoints';
import FloodPoints from './FloodPoints';
import TrafficHeatLayer from './TrafficHeatLayer';
import LayerPanel from './LayerPanel';
import PlaybackTimeline from './PlaybackTimeline';
import FavoritePanel from './FavoritePanel';

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#0A1628" metalness={0.3} roughness={0.8} />
      </mesh>
      <gridHelper
        args={[500, 100, '#1E90FF', '#0D2137']}
        position={[0, 0.01, 0]}
      />
      <gridHelper
        args={[500, 20, '#4169E1', '#0D2137']}
        position={[0, 0.02, 0]}
      />
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} color="#B0C4DE" />
      <directionalLight
        position={[100, 150, 80]}
        intensity={1.2}
        color="#FFF8E7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <hemisphereLight args={['#87CEEB', '#1a3a5c', 0.5]} />
    </>
  );
}

function CityCanvas() {
  const { activeLayers } = useMapStore();

  return (
    <>
      <color attach="background" args={['#0A1628']} />
      <fog attach="fog" args={['#0A1628', 100, 500]} />
      <Lights />
      <Sky
        distance={450000}
        sunPosition={[100, 50, 80]}
        inclination={0.52}
        azimuth={0.25}
      />
      <Floor />
      {activeLayers.buildings && <Buildings />}
      {activeLayers.roads && <RoadNetwork />}
      {activeLayers.water && <WaterSystem />}
      {activeLayers.poi && <POIPoints />}
      {activeLayers.video && <VideoPoints />}
      {activeLayers.traffic && <TrafficHeatLayer />}
      {activeLayers.pipeline && <FloodPoints />}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={20}
        maxDistance={400}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function CityScene() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [120, 100, 120], fov: 50, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
      >
        <CityCanvas />
      </Canvas>
      <LayerPanel />
      <PlaybackTimeline />
      <FavoritePanel />
    </div>
  );
}
