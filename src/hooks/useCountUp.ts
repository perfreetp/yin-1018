import { useState, useEffect, useRef, useCallback } from 'react';

export type CountUpEasing = 'linear' | 'easeOut' | 'easeIn' | 'easeInOut' | 'bounce';

export interface UseCountUpOptions {
  start?: number;
  duration?: number;
  decimals?: number;
  easing?: CountUpEasing;
  autoStart?: boolean;
  prefix?: string;
  suffix?: string;
  separator?: boolean | string;
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: (currentValue: number) => void;
}

export interface CountUpReturn {
  value: string;
  rawValue: number;
  isAnimating: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  update: (newEnd: number) => void;
}

const easingFunctions: Record<CountUpEasing, (t: number) => number> = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => Math.pow(t, 3),
  easeInOut: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    }
    if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    }
    if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    }
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

function formatNumber(value: number, decimals: number, separator: boolean | string): string {
  const factor = Math.pow(10, decimals);
  const fixed = (Math.round(value * factor) / factor).toFixed(decimals);
  if (!separator) return fixed;
  const sep = typeof separator === 'string' ? separator : ',';
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return parts.join('.');
}

export function useCountUp(end: number, options: UseCountUpOptions = {}): CountUpReturn {
  const {
    start: startValue = 0,
    duration = 2000,
    decimals = 0,
    easing = 'easeOut',
    autoStart = true,
    prefix = '',
    suffix = '',
    separator = true,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const [currentValue, setCurrentValue] = useState<number>(startValue);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedRef = useRef<{ progress: number; pausedAt: number } | null>(null);
  const startValueRef = useRef<number>(startValue);
  const endValueRef = useRef<number>(end);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      let progress: number;
      if (pausedRef.current) {
        progress = pausedRef.current.progress;
        pausedRef.current = null;
      } else {
        const elapsed = timestamp - startTimeRef.current;
        progress = Math.min(elapsed / duration, 1);
      }
      const easedProgress = easingFunctions[easing](progress);
      const current = startValueRef.current + (endValueRef.current - startValueRef.current) * easedProgress;
      setCurrentValue(current);
      onUpdate?.(current);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValueRef.current);
        setIsAnimating(false);
        onComplete?.();
      }
    },
    [duration, easing, onComplete, onUpdate]
  );

  const start = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startValueRef.current = startValue;
    endValueRef.current = end;
    startTimeRef.current = 0;
    pausedRef.current = null;
    setCurrentValue(startValue);
    setIsAnimating(true);
    onStart?.();
    animationRef.current = requestAnimationFrame(animate);
  }, [startValue, end, animate, onStart]);

  const pause = useCallback(() => {
    if (!animationRef.current || !startTimeRef.current) return;
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    pausedRef.current = { progress, pausedAt: performance.now() };
    setIsAnimating(false);
  }, [duration]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    const { progress } = pausedRef.current;
    const pausedDuration = performance.now() - pausedRef.current.pausedAt;
    startTimeRef.current = performance.now() - progress * duration;
    setIsAnimating(true);
    void pausedDuration;
    animationRef.current = requestAnimationFrame(animate);
  }, [duration, animate]);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    startTimeRef.current = 0;
    pausedRef.current = null;
    setCurrentValue(startValue);
    setIsAnimating(false);
  }, [startValue]);

  const update = useCallback(
    (newEnd: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      startValueRef.current = currentValue;
      endValueRef.current = newEnd;
      startTimeRef.current = 0;
      pausedRef.current = null;
      setIsAnimating(true);
      onStart?.();
      animationRef.current = requestAnimationFrame(animate);
    },
    [currentValue, animate, onStart]
  );

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  const formatted = `${prefix}${formatNumber(currentValue, decimals, separator)}${suffix}`;

  return {
    value: formatted,
    rawValue: currentValue,
    isAnimating,
    start,
    pause,
    resume,
    reset,
    update
  };
}

export default useCountUp;
