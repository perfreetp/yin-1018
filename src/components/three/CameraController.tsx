import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useMapStore } from '@/store/useMapStore';
import type { PatrolPlayStatus } from '@/store/useMapStore';
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
  const stayStartRef = useRef<number>(0);
  const stayRemainingRef = useRef<number>(0);
  const prevStatusRef = useRef<PatrolPlayStatus | null>(null);
  const ctrl = (controlsRef?.current ?? controls) as any;
  const {
    flyTarget,
    clearFlyTarget,
    updateCamera,
    consumePendingFocus,
    queueFlyTo,
    patrolPlayStatus,
    patrolCurrentPointIndex,
    patrolRoutes,
    currentPatrolRouteId,
    setPatrolStayRemaining,
    onPatrolFlyComplete,
    onPatrolStayComplete,
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
    const prevStatus = prevStatusRef.current;

    if (patrolPlayStatus === 'staying' && prevStatus !== 'staying') {
      const route = patrolRoutes.find((r) => r.id === currentPatrolRouteId);
      if (!route) return;
      const point = route.points[patrolCurrentPointIndex];
      if (!point) return;
      if (prevStatus === 'paused') {
        stayStartRef.current = Date.now();
        setPatrolStayRemaining(stayRemainingRef.current);
      } else {
        stayStartRef.current = Date.now();
        stayRemainingRef.current = point.stayDuration;
        setPatrolStayRemaining(point.stayDuration);
      }
    }

    if (patrolPlayStatus === 'paused' && prevStatus === 'staying') {
      const elapsed = Date.now() - stayStartRef.current;
      stayRemainingRef.current = Math.max(0, stayRemainingRef.current - elapsed);
      setPatrolStayRemaining(stayRemainingRef.current);
    }

    prevStatusRef.current = patrolPlayStatus;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrolPlayStatus, patrolCurrentPointIndex]);

  useFrame(() => {
    const now = Date.now();

    if (patrolPlayStatus === 'paused' && flyTarget) {
      clearFlyTarget();
      return;
    }

    if (patrolPlayStatus === 'flying' && !flyTarget) {
      const route = patrolRoutes.find((r) => r.id === currentPatrolRouteId);
      if (!route) return;
      const point = route.points[patrolCurrentPointIndex];
      if (!point) return;
      queueFlyTo({
        position: point.position,
        target: point.target,
        duration: 2000,
      });
      return;
    }

    if (patrolPlayStatus === 'staying') {
      const elapsed = now - stayStartRef.current;
      const remaining = Math.max(0, stayRemainingRef.current - elapsed);
      setPatrolStayRemaining(remaining);
      if (remaining <= 0) {
        onPatrolStayComplete();
      }
    }

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
        if (useMapStore.getState().patrolPlayStatus === 'flying') {
          useMapStore.getState().onPatrolFlyComplete();
        }
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
