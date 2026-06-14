import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useMapStore } from '@/store/useMapStore';
import type { CameraPosition, CameraTarget } from '@/types';

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpCameraPosition(
  a: CameraPosition,
  b: CameraPosition,
  t: number,
): CameraPosition {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

function lerpCameraTarget(
  a: CameraTarget,
  b: CameraTarget,
  t: number,
): CameraTarget {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface CameraControllerProps {
  controlsRef?: React.MutableRefObject<any>;
}

export default function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera, controls } = useThree();
  const lastSyncRef = useRef(0);
  const ctrl = (controlsRef?.current ?? controls) as any;
  const { flyTarget, clearFlyTarget, updateCamera, consumePendingFocus, queueFlyTo } =
    useMapStore();

  useEffect(() => {
    const pending = consumePendingFocus();
    if (pending) {
      queueFlyTo({
        position: { x: pending.position[0], y: pending.position[1], z: pending.position[2] },
        target: pending.target
          ? { x: pending.target[0], y: pending.target[1], z: pending.target[2] }
          : undefined,
        duration: 2000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    const now = Date.now();

    if (flyTarget) {
      const elapsed = now - flyTarget.startTime;
      const rawT = flyTarget.duration > 0 ? elapsed / flyTarget.duration : 1;
      const t = clamp(rawT, 0, 1);
      const easedT = easeInOutCubic(t);

      const position = lerpCameraPosition(flyTarget.startPosition, flyTarget.position, easedT);
      const target = lerpCameraTarget(flyTarget.startTarget, flyTarget.target, easedT);

      camera.position.set(position.x, position.y, position.z);
      if (ctrl?.target) {
        ctrl.target.set(target.x, target.y, target.z);
        ctrl.update?.();
      }

      updateCamera(position, target);

      if (t >= 1) {
        clearFlyTarget();
      }
    } else {
      if (now - lastSyncRef.current >= 100) {
        lastSyncRef.current = now;
        updateCamera(
          { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          ctrl?.target
            ? { x: ctrl.target.x, y: ctrl.target.y, z: ctrl.target.z }
            : undefined,
        );
      }
    }
  });

  return null;
}
