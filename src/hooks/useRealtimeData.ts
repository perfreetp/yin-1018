import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type RefreshInterval = 'fast' | 'normal' | 'slow' | number;

export type RealtimeStatus = 'idle' | 'loading' | 'ready' | 'error' | 'paused';

export const REFRESH_INTERVALS: Record<'fast' | 'normal' | 'slow', number> = {
  fast: 3000,
  normal: 10000,
  slow: 60000
};

export interface UseRealtimeDataOptions<T> {
  interval?: RefreshInterval;
  enabled?: boolean;
  immediate?: boolean;
  autoStart?: boolean;
  enableDevLogging?: boolean;
  onData?: (data: T, previousData?: T) => void;
  onError?: (error: Error) => void;
  onRefresh?: () => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseRealtimeDataReturn<T> {
  data: T | undefined;
  previousData: T | undefined;
  status: RealtimeStatus;
  error: Error | null;
  isRefreshing: boolean;
  isPaused: boolean;
  lastRefreshTime: Date | null;
  nextRefreshTime: Date | null;
  refreshCount: number;
  intervalMs: number;
  refresh: (force?: boolean) => Promise<void>;
  pause: () => void;
  resume: () => void;
  setData: (data: T | ((prev: T | undefined) => T)) => void;
  setInterval: (interval: RefreshInterval) => void;
  reset: () => void;
}

function resolveInterval(interval: RefreshInterval): number {
  if (typeof interval === 'number') {
    return Math.max(1000, interval);
  }
  return REFRESH_INTERVALS[interval] ?? REFRESH_INTERVALS.normal;
}

function randomOffset(base: number, variance = 0.15): number {
  return base + (Math.random() - 0.5) * base * variance * 2;
}

export function useRealtimeData<T>(
  fetcher: (prev?: T) => T | Promise<T>,
  options: UseRealtimeDataOptions<T> = {}
): UseRealtimeDataReturn<T> {
  const {
    interval = 'normal',
    enabled = true,
    immediate = true,
    autoStart = true,
    enableDevLogging = false,
    onData,
    onError,
    onRefresh,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setDataState] = useState<T | undefined>(undefined);
  const [previousData, setPreviousData] = useState<T | undefined>(undefined);
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [currentInterval, setCurrentIntervalState] = useState<number>(resolveInterval(interval));

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef(0);
  const enabledRef = useRef(enabled);
  const pausedRef = useRef(isPaused);
  const fetcherRef = useRef(fetcher);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNextRefresh = useCallback(() => {
    clearTimer();
    if (!enabledRef.current || pausedRef.current) {
      setNextRefreshTime(null);
      return;
    }
    const delay = randomOffset(currentInterval);
    const nextTime = new Date(Date.now() + delay);
    setNextRefreshTime(nextTime);
    timerRef.current = setTimeout(() => {
      void executeRefresh(false);
    }, delay);
  }, [currentInterval, clearTimer]);

  const executeRefresh = useCallback(
    async (force: boolean) => {
      if (!enabledRef.current && !force) return;
      if (pausedRef.current && !force) return;
      if (enableDevLogging) {
        console.log(`[Realtime] 开始刷新数据...`);
      }
      setIsRefreshing(true);
      setStatus('loading');
      onRefreshRef.current?.();
      try {
        const result = await fetcherRef.current(data);
        setPreviousData(data);
        setDataState(result);
        setStatus('ready');
        setLastRefreshTime(new Date());
        setRefreshCount(c => c + 1);
        setError(null);
        retryRef.current = 0;
        onDataRef.current?.(result, data);
        if (enableDevLogging) {
          console.log(`[Realtime] 数据刷新成功`);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setStatus('error');
        setError(error);
        onErrorRef.current?.(error);
        if (retryRef.current < retryCount) {
          retryRef.current += 1;
          if (enableDevLogging) {
            console.log(`[Realtime] 刷新失败，重试第 ${retryRef.current}/${retryCount}`);
          }
          setTimeout(() => {
            void executeRefresh(force);
          }, retryDelay * retryRef.current);
          return;
        }
        retryRef.current = 0;
      } finally {
        setIsRefreshing(false);
        scheduleNextRefresh();
      }
    },
    [data, enableDevLogging, retryCount, retryDelay, scheduleNextRefresh]
  );

  const refresh = useCallback(
    async (force = false) => {
      await executeRefresh(force);
    },
    [executeRefresh]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
    pausedRef.current = true;
    clearTimer();
    setStatus(s => (s === 'loading' ? s : 'paused'));
    setNextRefreshTime(null);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
    pausedRef.current = false;
    setStatus('idle');
    scheduleNextRefresh();
  }, [scheduleNextRefresh]);

  const setData = useCallback(
    (newData: T | ((prev: T | undefined) => T)) => {
      setDataState(prev => {
        const next =
          typeof newData === 'function' ? (newData as (p: T | undefined) => T)(prev) : newData;
        setPreviousData(prev);
        return next;
      });
    },
    []
  );

  const setInterval = useCallback((newInterval: RefreshInterval) => {
    const resolved = resolveInterval(newInterval);
    setCurrentIntervalState(resolved);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setDataState(undefined);
    setPreviousData(undefined);
    setStatus('idle');
    setError(null);
    setIsRefreshing(false);
    setIsPaused(!autoStart);
    pausedRef.current = !autoStart;
    setLastRefreshTime(null);
    setNextRefreshTime(null);
    setRefreshCount(0);
    retryRef.current = 0;
    if (autoStart && enabled) {
      scheduleNextRefresh();
    }
  }, [autoStart, enabled, clearTimer, scheduleNextRefresh]);

  useEffect(() => {
    if (immediate && autoStart && enabled) {
      void executeRefresh(false);
    } else if (autoStart && enabled) {
      scheduleNextRefresh();
    }
    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaused) {
      clearTimer();
    } else if (enabledRef.current) {
      scheduleNextRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInterval]);

  return useMemo(
    () => ({
      data,
      previousData,
      status,
      error,
      isRefreshing,
      isPaused,
      lastRefreshTime,
      nextRefreshTime,
      refreshCount,
      intervalMs: currentInterval,
      refresh,
      pause,
      resume,
      setData,
      setInterval,
      reset
    }),
    [
      data,
      previousData,
      status,
      error,
      isRefreshing,
      isPaused,
      lastRefreshTime,
      nextRefreshTime,
      refreshCount,
      currentInterval,
      refresh,
      pause,
      resume,
      setData,
      setInterval,
      reset
    ]
  );
}

export interface UseSimulatedMetricsOptions {
  baseValue?: number;
  variance?: number;
  interval?: RefreshInterval;
  minValue?: number;
  maxValue?: number;
  trend?: 'random' | 'up' | 'down' | 'stable';
  decimals?: number;
}

export function useSimulatedMetrics(options: UseSimulatedMetricsOptions = {}) {
  const {
    baseValue = 100,
    variance = 0.1,
    interval = 'normal',
    minValue,
    maxValue,
    trend = 'random',
    decimals = 0
  } = options;

  const currentValueRef = useRef<number>(baseValue);

  const generateNextValue = useCallback(() => {
    let next: number;
    const delta = baseValue * variance;
    switch (trend) {
      case 'up':
        next = currentValueRef.current + Math.abs(delta * Math.random());
        break;
      case 'down':
        next = currentValueRef.current - Math.abs(delta * Math.random());
        break;
      case 'stable':
        next = baseValue + (Math.random() - 0.5) * delta * 0.3;
        break;
      default:
        next = currentValueRef.current + (Math.random() - 0.5) * delta * 2;
    }
    if (minValue !== undefined) next = Math.max(minValue, next);
    if (maxValue !== undefined) next = Math.min(maxValue, next);
    const factor = Math.pow(10, decimals);
    currentValueRef.current = Math.round(next * factor) / factor;
    return currentValueRef.current;
  }, [baseValue, variance, minValue, maxValue, trend, decimals]);

  return useRealtimeData<number>(generateNextValue, {
    interval,
    immediate: true,
    autoStart: true
  });
}

export function useRealtimeList<T>(
  baseList: T[],
  mutate: (list: T[]) => T[],
  options: Omit<UseRealtimeDataOptions<T[]>, 'immediate' | 'autoStart'> = {}
) {
  const listRef = useRef<T[]>(baseList);
  const mutator = useCallback(() => {
    listRef.current = mutate(listRef.current);
    return listRef.current;
  }, [mutate]);

  return useRealtimeData<T[]>(mutator, {
    ...options,
    immediate: true,
    autoStart: true
  });
}

export default useRealtimeData;
