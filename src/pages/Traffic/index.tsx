import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gauge,
  Car,
  AlertTriangle,
  Users,
  Bus,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ThermometerSun,
  Activity,
  Navigation,
  CircleDot,
  Locate,
} from 'lucide-react';
import TechCard from '@/components/common/TechCard';
import MetricCard from '@/components/common/MetricCard';
import AlertBadge, { AlertBadgeLevelMap } from '@/components/common/AlertBadge';
import StatusTag from '@/components/common/StatusTag';
import LineChart from '@/components/chart/LineChart';
import BarChart from '@/components/chart/BarChart';
import PieChart from '@/components/chart/PieChart';
import {
  trafficMetrics,
  trafficRoads,
  busInfos,
  type TrafficRoad,
  type BusInfo,
  type TrafficStatus,
  type RoadLevel,
} from '@/mock';
import { events, districts } from '@/mock/events';
import {
  formatNumber,
  formatPercent,
  formatSpeed,
  getAlertLevelColor,
  getAlertLevelConfig,
} from '@/utils/format';
import { useSimulatedMetrics, useRealtimeList } from '@/hooks/useRealtimeData';
import { useAppStore } from '@/store/useAppStore';
import { useMapStore } from '@/store/useMapStore';
import type { AlertLevel } from '@/types';

const roadLevelLabels: Record<RoadLevel, string> = {
  expressway: '快速路',
  main_road: '主干道',
  secondary_road: '次干道',
};

const trafficStatusLabels: Record<TrafficStatus, { label: string; color: string; bgColor: string }> = {
  smooth: { label: '畅通', color: '#22c55e', bgColor: 'bg-emerald-500' },
  slow: { label: '缓行', color: '#eab308', bgColor: 'bg-yellow-500' },
  congested: { label: '拥堵', color: '#f97316', bgColor: 'bg-orange-500' },
  blocked: { label: '堵塞', color: '#ef4444', bgColor: 'bg-red-500' },
};

const districtViewMap: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  '中心街道': { position: [0, 60, 80], target: [0, 0, 0] },
  '东湖街道': { position: [60, 50, 60], target: [50, 0, 0] },
  '西湖街道': { position: [-60, 50, 60], target: [-50, 0, 0] },
  '南山街道': { position: [40, 50, -70], target: [30, 0, -60] },
  '北岭街道': { position: [0, 50, 80], target: [0, 0, 70] },
  '新城街道': { position: [80, 50, -40], target: [70, 0, -30] },
};

const TrafficPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentRoute } = useAppStore();
  const { navigateAndFocus, applyPreset } = useMapStore();

  const goToMap = (districtName?: string, label?: string, position?: [number, number, number], target?: [number, number, number], useTrafficPreset = true) => {
    setCurrentRoute('/map');
    let pos: [number, number, number] = [120, 100, 120];
    let tgt: [number, number, number] = [0, 0, 0];
    if (position && target) {
      pos = position;
      tgt = target;
    } else if (districtName && districtViewMap[districtName]) {
      pos = districtViewMap[districtName].position;
      tgt = districtViewMap[districtName].target;
    }
    if (useTrafficPreset) {
      applyPreset('rush');
    }
    navigateAndFocus(pos, tgt, label);
    navigate('/map');
  };

  const avgSpeed = useSimulatedMetrics({
    baseValue: trafficMetrics.averageSpeed,
    variance: 0.1,
    trend: 'random',
    decimals: 1,
    minValue: 15,
    maxValue: 60,
  });
  const congestionIndex = useSimulatedMetrics({
    baseValue: trafficMetrics.congestionIndex,
    variance: 0.15,
    trend: 'random',
    decimals: 2,
    minValue: 0.1,
    maxValue: 0.95,
  });
  const totalVehicles = useSimulatedMetrics({
    baseValue: trafficMetrics.totalVehicles,
    variance: 0.05,
    trend: 'random',
    minValue: 50000,
    maxValue: 200000,
  });
  const accidentCount = useSimulatedMetrics({
    baseValue: 12,
    variance: 0.2,
    trend: 'random',
    minValue: 2,
    maxValue: 30,
  });

  const [vehiclePositions, setVehiclePositions] = useState<
    Array<{ id: number; x: number; y: number; color: string; path: number }>
  >([]);

  useEffect(() => {
    const initial = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i % 5],
      path: i % 4,
    }));
    setVehiclePositions(initial);

    const timer = setInterval(() => {
      setVehiclePositions((prev) =>
        prev.map((v) => ({
          ...v,
          x: (v.x + (Math.random() - 0.3) * 2 + 100) % 100,
          y: (v.y + (Math.random() - 0.5) * 1.5 + 100) % 100,
        })),
      );
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const hourlyFlowXAxis = useMemo(
    () => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    [],
  );

  const hourlyFlowData = useMemo(() => {
    const flow = [
      1200, 800, 500, 300, 250, 400, 1800, 5500, 8500, 6200, 4800, 5200,
      5800, 5000, 4600, 4900, 5500, 7800, 9200, 6800, 4200, 3000, 2200, 1500,
    ];
    const truckFlow = flow.map((v) => Math.floor(v * 0.15));
    const busFlow = flow.map((v) => Math.floor(v * 0.08));
    return { flow, truckFlow, busFlow };
  }, []);

  const heatmapData = useMemo(() => {
    const data: Array<{ road: string; hour: string; value: number }> = [];
    trafficRoads.slice(0, 8).forEach((road, ri) => {
      hourlyFlowXAxis.forEach((hour, hi) => {
        const baseCongestion = road.congestionIndex;
        const timeFactor = hi >= 7 && hi <= 9 ? 1.5 : hi >= 17 && hi <= 19 ? 1.4 : 1;
        data.push({
          road: road.name,
          hour,
          value: Math.min(1, baseCongestion * timeFactor * (0.7 + Math.random() * 0.6)),
        });
      });
    });
    return data;
  }, [trafficRoads, hourlyFlowXAxis]);

  const sortedRoads = useMemo(
    () =>
      [...trafficRoads].sort(
        (a, b) => b.congestionIndex - a.congestionIndex,
      ),
    [trafficRoads],
  );

  const busArrivals = useMemo(() => {
    return busInfos.slice(0, 6).map((bus) => ({
      ...bus,
      nextStation: bus.stations[Math.floor(Math.random() * Math.max(1, bus.stations.length - 2))]?.name || '未知站点',
      arrivalMinutes: Math.floor(Math.random() * 15) + 1,
      passengerLoad: Math.floor(Math.random() * 40) + 50,
    }));
  }, [busInfos]);

  const trafficEvents = useMemo(() => {
    const trafficEventList = events.filter((e) => e.category === 'traffic' || Math.random() > 0.6);
    return trafficEventList.map((e) => ({
      ...e,
      eventType: (['交通事故', '道路拥堵', '道路施工', '交通管制', '车辆故障'] as const)[
        Math.floor(Math.random() * 5)
      ],
    }));
  }, [events]);

  const { data: realtimeRoads } = useRealtimeList<TrafficRoad>(trafficRoads, (list) => {
    return list.map((r) => ({
      ...r,
      speed: Math.max(0, r.speed + (Math.random() - 0.5) * 10),
      congestionIndex: Math.max(0, Math.min(1, r.congestionIndex + (Math.random() - 0.5) * 0.1)),
      vehicleCount: Math.max(0, r.vehicleCount + Math.floor((Math.random() - 0.5) * 50)),
    }));
  }, { interval: 5000 });

  const HeatmapCell: React.FC<{ value: number }> = ({ value }) => {
    const intensity = Math.max(0, Math.min(1, value));
    let color: string;
    if (intensity < 0.3) color = `rgba(34, 197, 94, ${0.2 + intensity * 1.5})`;
    else if (intensity < 0.6) color = `rgba(234, 179, 8, ${0.3 + intensity})`;
    else if (intensity < 0.85) color = `rgba(249, 115, 22, ${0.4 + intensity * 0.6})`;
    else color = `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`;

    return (
      <div
        className="w-full h-full rounded-sm transition-all duration-300 hover:scale-110 hover:z-10 relative"
        style={{ background: color }}
        title={`拥堵指数: ${(intensity * 100).toFixed(0)}%`}
      />
    );
  };

  return (
    <div className="relative w-full h-full overflow-auto p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="平均车速"
            value={avgSpeed.data || trafficMetrics.averageSpeed}
            icon={<Gauge className="w-6 h-6" />}
            iconGradient="from-emerald-500 to-teal-500"
            suffix=" km/h"
            decimals={1}
            yoyChange={3.2}
            qoqTrend={{ values: [32, 34, 35, 33, 36, Math.floor((avgSpeed.data || 35) * 10) / 10] }}
          />
          <MetricCard
            title="拥堵指数"
            value={congestionIndex.data || trafficMetrics.congestionIndex}
            icon={<ThermometerSun className="w-6 h-6" />}
            iconGradient="from-orange-500 to-red-500"
            decimals={2}
            yoyChange={-8.5}
            trendColor="#22c55e"
            qoqTrend={{ values: [0.52, 0.48, 0.50, 0.47, 0.46, congestionIndex.data || 0.45] }}
          />
          <MetricCard
            title="在途车辆"
            value={Math.floor(totalVehicles.data || trafficMetrics.totalVehicles)}
            icon={<Car className="w-6 h-6" />}
            iconGradient="from-blue-500 to-indigo-500"
            suffix="辆"
            yoyChange={trafficMetrics.comparedYesterday}
            qoqTrend={{ values: [95000, 98000, 102000, 105000, 108000, Math.floor(totalVehicles.data || 105000)] }}
          />
          <MetricCard
            title="交通事故"
            value={Math.floor(accidentCount.data || 12)}
            icon={<AlertTriangle className="w-6 h-6" />}
            iconGradient="from-red-500 to-rose-600"
            suffix="起"
            yoyChange={-15.3}
            trendColor="#22c55e"
            qoqTrend={{ values: [18, 16, 15, 14, 13, Math.floor(accidentCount.data || 12)] }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <ThermometerSun className="w-5 h-5 text-tech-400" />
                  <span>交通热力图</span>
                </div>
              }
              extra={<span className="text-xs text-text-tertiary">路段×时段</span>}
            >
              <div className="overflow-auto">
                <div className="inline-block min-w-full">
                  <div className="flex mb-2">
                    <div className="w-20 flex-shrink-0" />
                    {hourlyFlowXAxis.filter((_, i) => i % 4 === 0).map((h) => (
                      <div key={h} className="flex-1 text-[9px] text-text-tertiary text-center min-w-[24px]">
                        {h}
                      </div>
                    ))}
                  </div>
                  {trafficRoads.slice(0, 8).map((road) => (
                    <div key={road.id} className="flex items-center gap-1 mb-1">
                      <div className="w-20 flex-shrink-0 text-[10px] text-text-secondary truncate pr-2">
                        {road.name}
                      </div>
                      {hourlyFlowXAxis.filter((_, i) => i % 4 === 0).map((_, i) => {
                        const dataPoint = heatmapData.find(
                          (d) => d.road === road.name && d.hour === hourlyFlowXAxis[i * 4],
                        );
                        return (
                          <div key={`${road.id}-${i}`} className="flex-1 h-4 min-w-[24px] p-0.5">
                            <HeatmapCell value={dataPoint?.value || 0.2} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-tech-500/10">
                    <span className="text-[10px] text-text-tertiary">畅通</span>
                    <div className="flex h-2 rounded overflow-hidden">
                      <div className="w-4 bg-emerald-500/60" />
                      <div className="w-4 bg-yellow-500/70" />
                      <div className="w-4 bg-orange-500/75" />
                      <div className="w-4 bg-red-500/80" />
                    </div>
                    <span className="text-[10px] text-text-tertiary">拥堵</span>
                  </div>
                </div>
              </div>
            </TechCard>

            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-tech-400" />
                  <span>关键路段路况</span>
                </div>
              }
              extra={<span className="text-xs text-text-tertiary">共 {trafficRoads.length} 条</span>}
            >
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {(realtimeRoads || sortedRoads).slice(0, 10).map((road, idx) => {
                  const status = trafficStatusLabels[road.status];
                  const offsetX = (idx % 5 - 2) * 15;
                  const offsetZ = (idx % 4 - 2) * 10;
                  return (
                    <div
                      key={road.id}
                      onClick={() => goToMap(
                        road.district,
                        road.name,
                        [districtViewMap[road.district]?.position[0] + offsetX || offsetX, 50, districtViewMap[road.district]?.position[2] + offsetZ || offsetZ],
                        [districtViewMap[road.district]?.target[0] + offsetX || offsetX, 0, districtViewMap[road.district]?.target[2] + offsetZ || offsetZ],
                      )}
                      className="p-3 rounded-xl bg-space-700/30 border border-tech-500/10 hover:border-tech-400/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${status.bgColor}`}
                          />
                          <span className="font-medium text-text-primary text-sm truncate group-hover:text-tech-300 transition-colors">
                            {road.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Locate className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:text-tech-400 transition-all" />
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ color: status.color, background: `${status.color}15` }}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <div className="text-text-tertiary">等级</div>
                          <div className="text-text-secondary font-medium">
                            {roadLevelLabels[road.level]}
                          </div>
                        </div>
                        <div>
                          <div className="text-text-tertiary">车速</div>
                          <div className="text-text-secondary font-mono font-medium">
                            {Math.round(road.speed)}km/h
                          </div>
                        </div>
                        <div>
                          <div className="text-text-tertiary">车辆</div>
                          <div className="text-text-secondary font-mono font-medium">
                            {formatNumber(road.vehicleCount)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-space-600/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${road.congestionIndex * 100}%`,
                            background: `linear-gradient(90deg, ${status.color}, ${status.color}cc)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TechCard>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-tech-400" />
                  <span>交通态势图</span>
                </div>
              }
              extra={
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />畅通
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />缓行
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />拥堵
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />堵塞
                  </span>
                </div>
              }
              bodyClassName="!p-3"
            >
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-space-900/60 border border-tech-500/10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 212, 255, 0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }} />

                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="roadSmooth" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="roadSlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="roadCongested" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.7" />
                    </linearGradient>
                    <linearGradient id="roadBlocked" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <line x1="5" y1="50" x2="95" y2="50" stroke="url(#roadCongested)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="url(#roadSlow)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
                  <line x1="15" y1="20" x2="85" y2="80" stroke="url(#roadSmooth)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                  <line x1="85" y1="20" x2="15" y2="80" stroke="url(#roadSmooth)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                  <line x1="5" y1="25" x2="45" y2="25" stroke="url(#roadSmooth)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  <line x1="55" y1="25" x2="95" y2="25" stroke="url(#roadSlow)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  <line x1="5" y1="75" x2="35" y2="75" stroke="url(#roadSlow)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  <line x1="65" y1="75" x2="95" y2="75" stroke="url(#roadBlocked)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                  <line x1="25" y1="5" x2="25" y2="95" stroke="url(#roadSmooth)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  <line x1="75" y1="5" x2="75" y2="45" stroke="url(#roadSmooth)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  <line x1="75" y1="55" x2="75" y2="95" stroke="url(#roadCongested)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

                  <circle cx="50" cy="50" r="3.5" fill="#0F1F38" stroke="#00d4ff" strokeWidth="1.5" filter="url(#glow)" />
                  <circle cx="25" cy="50" r="2" fill="#0F1F38" stroke="#00d4ff" strokeWidth="1" opacity="0.8" />
                  <circle cx="75" cy="50" r="2" fill="#0F1F38" stroke="#00d4ff" strokeWidth="1" opacity="0.8" />
                  <circle cx="50" cy="25" r="2" fill="#0F1F38" stroke="#00d4ff" strokeWidth="1" opacity="0.8" />
                  <circle cx="50" cy="75" r="2" fill="#0F1F38" stroke="#00d4ff" strokeWidth="1" opacity="0.8" />
                </svg>

                {vehiclePositions.map((v) => (
                  <div
                    key={v.id}
                    className="absolute w-2.5 h-2.5 rounded-full transition-all duration-200 pointer-events-none"
                    style={{
                      left: `${v.x}%`,
                      top: `${v.y}%`,
                      background: v.color,
                      boxShadow: `0 0 8px ${v.color}, 0 0 16px ${v.color}80`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}

                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-space-900/80 backdrop-blur-sm border border-tech-500/20">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-text-secondary">实时车辆: <span className="text-tech-300 font-mono">{formatNumber(Math.floor(totalVehicles.data || 105000))}</span></span>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-space-900/80 backdrop-blur-sm border border-tech-500/20">
                  <div className="flex items-center gap-1 text-[10px]">
                    <CircleDot className="w-3 h-3 text-red-400 animate-pulse" />
                    <span className="text-text-tertiary">事故点: </span>
                    <span className="text-red-400 font-medium">{Math.floor(accidentCount.data || 12)}</span>
                  </div>
                </div>
              </div>
            </TechCard>

            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-tech-400" />
                  <span>24小时车流量趋势</span>
                </div>
              }
              extra={<span className="text-xs text-text-tertiary">单位：辆/小时</span>}
            >
              <LineChart
                xAxisData={hourlyFlowXAxis}
                series={[
                  {
                    name: '总车流量',
                    data: hourlyFlowData.flow,
                    color: '#00d4ff',
                    smooth: true,
                    areaStyle: true,
                  },
                  {
                    name: '货车流量',
                    data: hourlyFlowData.truckFlow,
                    color: '#f59e0b',
                    smooth: true,
                    areaStyle: true,
                  },
                  {
                    name: '公交流量',
                    data: hourlyFlowData.busFlow,
                    color: '#8b5cf6',
                    smooth: true,
                    areaStyle: true,
                  },
                ]}
                height={240}
                showLegend={true}
              />
            </TechCard>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <Bus className="w-5 h-5 text-tech-400" />
                  <span>实时公交到站</span>
                </div>
              }
              extra={<span className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />实时</span>}
            >
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {busArrivals.map((bus, idx) => {
                  const districtName = districts[idx % districts.length]?.name || '中心街道';
                  const view = districtViewMap[districtName];
                  const offsetX = (idx % 3 - 1) * 10;
                  const offsetZ = (idx % 3 - 1) * 8;
                  return (
                    <div
                      key={bus.id}
                      className="p-3.5 rounded-xl bg-space-700/30 border border-tech-500/10 hover:border-tech-400/25 hover:bg-space-700/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <Bus className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">{bus.lineNumber}</span>
                              {bus.status === 'delayed' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">晚点</span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-tertiary truncate mt-0.5">{bus.lineName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goToMap(
                                districtName,
                                `${bus.lineNumber} ${bus.lineName}`,
                                [view?.position[0] + offsetX || offsetX, 50, view?.position[2] + offsetZ || offsetZ],
                                [view?.target[0] + offsetX || offsetX, 0, view?.target[2] + offsetZ || offsetZ],
                              );
                            }}
                            className="p-1.5 rounded-lg text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-tech-300 hover:bg-tech-500/10 transition-all"
                            title="查看位置"
                          >
                            <Locate className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-bold font-mono text-tech-400">
                              {bus.arrivalMinutes}
                              <span className="text-xs font-normal text-text-tertiary ml-0.5">分</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-text-secondary min-w-0 flex-1">
                          <MapPin className="w-3 h-3 text-tech-400 flex-shrink-0" />
                          <span className="truncate">下一站: {bus.nextStation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <Users className="w-3 h-3 text-purple-400" />
                          <div className="w-14 h-1.5 rounded-full bg-space-600/60 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${bus.passengerLoad}%`,
                                background: bus.passengerLoad > 85
                                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                  : bus.passengerLoad > 65
                                  ? 'linear-gradient(90deg, #eab308, #f97316)'
                                  : 'linear-gradient(90deg, #22c55e, #00d4ff)',
                              }}
                            />
                          </div>
                          <span className="text-text-secondary font-mono w-8 text-right">{bus.passengerLoad}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TechCard>

            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-tech-400" />
                  <span>交通事件</span>
                </div>
              }
              extra={<span className="text-xs text-text-tertiary">{trafficEvents.length} 条</span>}
            >
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {trafficEvents.map((event, idx) => {
                  const level = AlertBadgeLevelMap[event.level as AlertLevel] || 'info';
                  const config = getAlertLevelConfig(event.level as AlertLevel);
                  const districtName = event.district?.name || '中心街道';
                  const view = districtViewMap[districtName];
                  const offsetX = (idx % 5 - 2) * 12;
                  const offsetZ = (idx % 4 - 2) * 8;
                  return (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-xl bg-space-700/30 border-l-2 hover:bg-space-700/50 transition-all cursor-pointer group"
                      style={{ borderLeftColor: config.color }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${config.color}20` }}
                          >
                            <AlertTriangle className="w-4 h-4" style={{ color: config.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-text-primary text-sm line-clamp-1 mb-1 group-hover:text-tech-300 transition-colors">
                              {event.eventType || event.title}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <AlertBadge level={level} size="sm" />
                              <StatusTag status={event.status} size="sm" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goToMap(
                                districtName,
                                event.eventType || event.title,
                                [view?.position[0] + offsetX || offsetX, 50, view?.position[2] + offsetZ || offsetZ],
                                [view?.target[0] + offsetX || offsetX, 0, view?.target[2] + offsetZ || offsetZ],
                              );
                            }}
                            className="p-1.5 rounded-lg text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-tech-300 hover:bg-tech-500/10 transition-all"
                            title="定位查看"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:text-tech-400 transition-all" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-text-tertiary pl-10.5 ml-10.5 -mt-0">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(event.reportTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{event.location.address}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TechCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficPage;
