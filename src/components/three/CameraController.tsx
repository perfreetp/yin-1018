import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useMapStore } from '@/store/useMapStore';
import type { CameraPosition, CameraTarget } from '@/types';

let stayTimer: number | null = null;
let stayStartTimestamp: number = 0;
let stayDurationMs: number = 0;

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
  const prevFlyTargetRef = useRef<any>(null);
  const ctrl = (controlsRef?.current ?? controls) as any;
  const {
    flyTarget,
    clearFlyTarget,
    updateCamera,
    consumePendingFocus,
    queueFlyTo,
    patrolPlayStatus,
    patrolPaused,
    patrolCurrentPointIndex,
    patrolRoutes,
    currentPatrolRouteId,
    patrolStayRemaining,
    setPatrolStayRemaining,
    advancePatrolToNext,
    stopPatrol,
  } = useMapStore();

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

  useEffect(() => {
    if (stayTimer) {
      window.clearTimeout(stayTimer);
      stayTimer = null;
    }

    if (patrolPlayStatus === 'staying' && !patrolPaused) {
      const route = patrolRoutes.find((r) => r.id === currentPatrolRouteId);
      if (!route) return;
      const point = route.points[patrolCurrentPointIndex];
      if (!point) return;

      const remaining = patrolStayRemaining > 0 ? patrolStayRemaining : point.stayDuration;
      stayDurationMs = remaining;
      stayStartTimestamp = Date.now();
      setPatrolStayRemaining(remaining);

      stayTimer = window.setTimeout(() => {
        advancePatrolToNext();
        stayTimer = null;
      }, remaining);
    } else if (patrolPaused && patrolPlayStatus === 'paused') {
      if (stayTimer) {
        const elapsed = Date.now() - stayStartTimestamp;
        const newRemaining = Math.max(0, stayDurationMs - elapsed);
        setPatrolStayRemaining(newRemaining);
        window.clearTimeout(stayTimer);
        stayTimer = null;
      }
    } else if (patrolPlayStatus === 'idle') {
      if (stayTimer) {
        window.clearTimeout(stayTimer);
        stayTimer = null;
      }
    }

    return () => {
      if (stayTimer) {
        window.clearTimeout(stayTimer);
        stayTimer = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrolPlayStatus, patrolPaused, patrolCurrentPointIndex]);

  useEffect(() => {
    if (
      prevFlyTargetRef.current &&
      !flyTarget &&
      patrolPlayStatus === 'flying' &&
      !patrolPaused
    ) {
      const route = patrolRoutes.find((r) => r.id === currentPatrolRouteId);
      if (!route) return;
      const point = route.points[patrolCurrentPointIndex];
      if (!point) return;

      const state = useMapStore.getState();
      const nextIndex = state.patrolCurrentPointIndex + 1;
      if (nextIndex >= route.points.length) {
        stopPatrol();
        return;
      }

      useMapStore.setState({
        patrolPlayStatus: 'staying',
      });
    }
    prevFlyTargetRef.current = flyTarget;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget]);

  useFrame(() => {
    const now = Date.now();

    if (flyTarget) {
      const dx = flyTarget.startPosition.x - camera.position.x;
      const dy = flyTarget.startPosition.y - camera.position.y;
      const dz = flyTarget.startPosition.z - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > 5) {
        useMapStore.setState({
          flyTarget: {
            ...flyTarget,
            startPosition: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            startTarget: ctrl?.target
              ? { x: ctrl.target.x, y: ctrl.target.y, z: ctrl.target.z }
              : flyTarget.startTarget,
            startTime: now,
          },
        });
        return;
      }

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
