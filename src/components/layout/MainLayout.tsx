import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { RefreshCw, AlertCircle, Activity } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '@/store/useAppStore';
import { useEventStore } from '@/store/useEventStore';
import { cn } from '@/lib/utils';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed, bigScreenMode } = useAppStore();
  const { events } = useEventStore();

  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [fps, setFps] = useState(60);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFpsTime, setLastFpsTime] = useState(performance.now());

  const activeEvents = events.filter(
    (e) => e.status === 'pending' || e.status === 'processing' || e.status === 'dispatched',
  ).length;

  useEffect(() => {
    let rafId: number;

    const countFrame = () => {
      setFrameCount((prev) => prev + 1);
      rafId = requestAnimationFrame(countFrame);
    };

    rafId = requestAnimationFrame(countFrame);

    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - lastFpsTime) / 1000;
      if (elapsed > 0) {
        const currentFps = Math.round(frameCount / elapsed);
        setFps(Math.min(currentFps, 120));
      }
      setFrameCount(0);
      setLastFpsTime(now);
      setLastRefresh(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [frameCount, lastFpsTime]);

  const formatRefreshTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getFpsColor = (value: number) => {
    if (value >= 50) return 'text-data-good';
    if (value >= 30) return 'text-data-warn';
    return 'text-data-bad';
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-space-900 text-text-primary',
        'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-space-800 via-space-900 to-space-900',
        bigScreenMode && 'overflow-hidden',
      )}
    >
      <div className="fixed inset-0 bg-grid-pattern bg-grid-40 opacity-30 pointer-events-none" />

      <Sidebar />

      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          bigScreenMode ? 'ml-0' : sidebarCollapsed ? 'ml-[72px]' : 'ml-[220px]',
        )}
      >
        <Topbar />

        <main className="flex-1 relative overflow-auto">
          <div className="relative z-10 p-6 min-h-full">
            <Outlet />
          </div>
        </main>

        <footer
          className={cn(
            'flex items-center justify-between px-6 py-2',
            'bg-space-900/80 backdrop-blur-xl border-t border-tech-500/20',
            'text-xs text-text-secondary',
            bigScreenMode && 'h-8 px-4',
          )}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-tech-400 animate-spin-slow" />
              <span>数据刷新：{formatRefreshTime(lastRefresh)}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-alert-warning" />
              <span>
                待处置事件：
                <span className="text-alert-warning font-semibold ml-1">
                  {activeEvents}
                </span>
                {' / '}
                <span className="text-text-primary font-semibold">
                  {events.length}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className={cn('w-3.5 h-3.5', getFpsColor(fps))} />
              <span>
                FPS：
                <span className={cn('font-semibold font-mono ml-1', getFpsColor(fps))}>
                  {fps}
                </span>
              </span>
            </div>
            <div className="text-text-tertiary">
              © 2025 数字孪生城市运行驾驶舱 v1.0.0
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
