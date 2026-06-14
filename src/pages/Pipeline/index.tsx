import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Droplets,
  CircleAlert,
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  MapPin,
  CircleFadingPlus,
  CircleDot,
  CircleDashed,
  Circle,
  CircleCheck,
  Droplet,
  Waves,
  ArrowUpDown,
  Gauge
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import TechCard from '@/components/common/TechCard';
import MetricCard from '@/components/common/MetricCard';
import AlertBadge from '@/components/common/AlertBadge';
import StatusTag from '@/components/common/StatusTag';
import { useSimulatedMetrics, useRealtimeList } from '@/hooks/useRealtimeData';
import { floodPoints, manholeIssues, pumpStations, type FloodPoint, type ManholeIssue, type PumpStation, type FloodLevel } from '@/mock/pipeline';
import { formatNumber, formatPercent, formatDateTime, getAlertLevelConfig } from '@/utils/format';

const floodLevelColorMap: Record<FloodLevel, string> = {
  light: '#3B82F6',
  moderate: '#FACC15',
  heavy: '#F97316',
  severe: '#EF4444'
};

const floodLevelLabelMap: Record<FloodLevel, string> = {
  light: '轻度积水',
  moderate: '中度积水',
  heavy: '重度积水',
  severe: '严重积水'
};

const manholeTypeLabelMap: Record<string, string> = {
  missing: '井盖丢失',
  damaged: '井盖破损',
  tilted: '井盖倾斜',
  blocked: '井口堵塞',
  overflow: '污水溢出'
};

const dangerLevelBadgeMap: Record<string, 'critical' | 'warning' | 'notice' | 'info'> = {
  critical: 'critical',
  high: 'warning',
  medium: 'notice',
  low: 'info'
};

const repairStatusMap: Record<string, 'pending' | 'processing' | 'processing' | 'resolved'> = {
  pending: 'pending',
  arrived: 'processing',
  repairing: 'processing',
  completed: 'resolved'
};

const repairStatusLabelMap: Record<string, string> = {
  pending: '待派单',
  arrived: '已到达',
  repairing: '修复中',
  completed: '已完成'
};

const RingProgress: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}> = ({ percent, size = 80, strokeWidth = 8, color = '#00D4FF', label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 212, 255, 0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{percent.toFixed(0)}%</span>
        {label && <span className="text-[10px] text-cyan-400/70 mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

const PipelinePage: React.FC = () => {
  const floodCount = useSimulatedMetrics({
    baseValue: floodPoints.length,
    variance: 0.05,
    trend: 'stable',
    interval: 6000,
    minValue: 0
  });
  const manholeIssueCount = useSimulatedMetrics({
    baseValue: manholeIssues.length,
    variance: 0.1,
    trend: 'down',
    interval: 7000,
    minValue: 0
  });
  const runningPumpCount = useSimulatedMetrics({
    baseValue: pumpStations.filter(p => p.status === 'running').length,
    variance: 0.05,
    trend: 'stable',
    interval: 8000,
    minValue: 0,
    maxValue: pumpStations.length
  });
  const pipelineHealth = useSimulatedMetrics({
    baseValue: 86.4,
    variance: 0.02,
    trend: 'up',
    decimals: 1,
    interval: 6000,
    minValue: 70,
    maxValue: 99
  });

  const { data: liveFloodPoints } = useRealtimeList<FloodPoint>(
    floodPoints,
    (items) => items.map(item => ({
      ...item,
      depth: Math.max(0, item.depth + (Math.random() - 0.5) * 0.05)
    })),
    { interval: 10000 }
  );

  const { data: liveManholeIssues } = useRealtimeList<ManholeIssue>(
    manholeIssues,
    (items) => items,
    { interval: 12000 }
  );
  const { data: livePumpStations } = useRealtimeList<PumpStation>(
    pumpStations,
    (items) => items.map(item => ({
      ...item,
      currentFlow: item.status === 'running'
        ? Math.max(0, Math.min(item.capacity, item.currentFlow + (Math.random() - 0.5) * 40))
        : 0,
      waterLevel: Math.max(0.5, Math.min(item.maxWaterLevel, item.waterLevel + (Math.random() - 0.5) * 0.15)),
      runningHours: item.runningHours + Math.random() * 0.002
    })),
    { interval: 5000 }
  );

  const sortedFloodPoints = useMemo(() => {
    const order = { severe: 0, heavy: 1, moderate: 2, light: 3 };
    return [...(liveFloodPoints || [])].sort((a, b) => {
      const oa = order[a.level] ?? 99;
      const ob = order[b.level] ?? 99;
      if (oa !== ob) return oa - ob;
      return b.depth - a.depth;
    });
  }, [liveFloodPoints]);

  const radarOption = useMemo(() => ({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: [
        { name: '压力', max: 100 },
        { name: '流量', max: 100 },
        { name: '水质', max: 100 },
        { name: '老化度', max: 100 },
        { name: '泄漏率', max: 100 },
        { name: '能耗', max: 100 }
      ],
      radius: '68%',
      center: ['50%', '55%'],
      axisName: { color: '#8AE6FF', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.18)' } },
      splitArea: { areaStyle: { color: ['rgba(0, 212, 255, 0.02)', 'rgba(0, 212, 255, 0.05)'] } },
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } }
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        data: [
          {
            value: [92, 85, 78, 88, 94, 72],
            name: '当前健康度',
            lineStyle: { color: '#00D4FF', width: 2 },
            itemStyle: { color: '#00D4FF' },
            areaStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.8,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 212, 255, 0.45)' },
                  { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
                ]
              }
            }
          },
          {
            value: [80, 75, 70, 70, 80, 65],
            name: '行业基准',
            lineStyle: { color: '#FACC15', width: 2, type: 'dashed' },
            itemStyle: { color: '#FACC15' },
            areaStyle: { color: 'rgba(250, 204, 21, 0.08)' }
          }
        ]
      }
    ],
    legend: {
      data: ['当前健康度', '行业基准'],
      bottom: 4,
      textStyle: { color: '#8AE6FF', fontSize: 11 },
      itemWidth: 14,
      itemHeight: 8
    }
  }), []);

  const nodes = useMemo(() => [
    { id: 'N1', x: 100, y: 100, label: '水厂' },
    { id: 'N2', x: 300, y: 70, label: '加压站A' },
    { id: 'N3', x: 520, y: 110, label: '加压站B' },
    { id: 'N4', x: 720, y: 80, label: '工业区节点' },
    { id: 'N5', x: 160, y: 260, label: '中心节点' },
    { id: 'N6', x: 400, y: 240, label: '交换站C' },
    { id: 'N7', x: 620, y: 280, label: '居民区节点' },
    { id: 'N8', x: 780, y: 240, label: '商业节点' },
    { id: 'N9', x: 260, y: 400, label: '南部分支' },
    { id: 'N10', x: 500, y: 420, label: '泵站接入' },
    { id: 'N11', x: 700, y: 400, label: '东南节点' }
  ], []);

  const links = useMemo(() => [
    { from: 'N1', to: 'N2', flow: 'high' },
    { from: 'N2', to: 'N3', flow: 'high' },
    { from: 'N3', to: 'N4', flow: 'medium' },
    { from: 'N1', to: 'N5', flow: 'medium' },
    { from: 'N2', to: 'N5', flow: 'high' },
    { from: 'N5', to: 'N6', flow: 'medium' },
    { from: 'N6', to: 'N7', flow: 'medium' },
    { from: 'N3', to: 'N6', flow: 'low' },
    { from: 'N7', to: 'N8', flow: 'medium' },
    { from: 'N4', to: 'N8', flow: 'low' },
    { from: 'N5', to: 'N9', flow: 'medium' },
    { from: 'N9', to: 'N10', flow: 'low' },
    { from: 'N6', to: 'N10', flow: 'medium' },
    { from: 'N10', to: 'N11', flow: 'medium' },
    { from: 'N7', to: 'N11', flow: 'low' }
  ], []);

  const flowColorMap = { high: '#00D4FF', medium: '#06B6D4', low: '#0891B2' };
  const flowWidthMap = { high: 5, medium: 3.5, low: 2 };

  return (
    <div className="relative w-full h-full overflow-auto p-4 bg-gradient-to-br from-[#030B1A] via-[#041023] to-[#030B1A]">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)' }} />
      <div className="absolute -top-20 -right-40 w-[30rem] h-[30rem] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col gap-4 min-w-[1400px]">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="积水点监测"
            value={floodCount.data ?? floodPoints.length}
            icon={<Droplets size={22} />}
            iconGradient="from-blue-500 to-cyan-500"
            suffix="处"
            yoyChange={12.5}
            qoqTrend={{ values: [7, 8, 7, 9, 8, 8] }}
          />
          <MetricCard
            title="井盖异常"
            value={manholeIssueCount.data ?? manholeIssues.length}
            icon={<CircleAlert size={22} />}
            iconGradient="from-orange-500 to-amber-500"
            suffix="处"
            yoyChange={-8.3}
            qoqTrend={{ values: [14, 13, 13, 12, 12, 12] }}
          />
          <MetricCard
            title="运行泵站"
            value={runningPumpCount.data ?? pumpStations.filter(p => p.status === 'running').length}
            icon={<Zap size={22} />}
            iconGradient="from-emerald-500 to-teal-500"
            suffix={`/${pumpStations.length}座`}
            qoqTrend={{ values: [4, 4, 5, 5, 4, 5] }}
          />
          <MetricCard
            title="管网健康度"
            value={pipelineHealth.data ?? 86.4}
            icon={<Activity size={22} />}
            iconGradient="from-cyan-500 to-sky-500"
            suffix="%"
            decimals={1}
            yoyChange={2.1}
            qoqTrend={{ values: [84, 85, 85, 86, 86, 86] }}
          />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 flex flex-col gap-4">
            <TechCard
              title="积水点监测列表"
              icon={<AlertTriangle size={16} className="text-red-400" />}
              extra={<span className="text-xs text-cyan-400/70">按风险等级排序</span>}
              className="flex-1"
              bodyClassName="p-0"
            >
              <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                {sortedFloodPoints.map((fp, idx) => (
                  <div key={fp.id} className={`px-3 py-3 border-b border-cyan-500/10 last:border-0 hover:bg-cyan-500/5 transition-colors ${idx === 0 ? 'bg-red-500/5' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: floodLevelColorMap[fp.level], boxShadow: `0 0 8px ${floodLevelColorMap[fp.level]}` }}
                        />
                        <span className="text-sm text-white/90 font-medium truncate">{fp.name}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border backdrop-blur-sm ${
                        fp.level === 'severe' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        fp.level === 'heavy' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        fp.level === 'moderate' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {floodLevelLabelMap[fp.level]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-cyan-400/70">
                        <Droplets size={12} />
                        <span>水深: <span className="text-white/90 font-semibold">{(fp.depth * 100).toFixed(0)}cm</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400/70">
                        <MapPin size={12} />
                        <span className="truncate text-white/80">{fp.district}</span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400/70 col-span-2">
                        <Clock size={12} />
                        <span>开始: <span className="text-white/80">{fp.startTime.slice(11)}</span></span>
                        <span className="ml-auto">
                          {fp.isDraining
                            ? <span className="text-emerald-400">● 抽排中</span>
                            : <span className="text-amber-400">● 待处置</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TechCard>

            <TechCard
              title="井盖异常列表"
              icon={<CircleFadingPlus size={16} className="text-orange-400" />}
              className="flex-1"
              bodyClassName="p-0"
            >
              <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                {(liveManholeIssues || []).map((mi, idx) => (
                  <div key={mi.id} className={`px-3 py-2.5 border-b border-cyan-500/10 last:border-0 hover:bg-cyan-500/5 transition-colors`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-cyan-400/60 font-mono">{mi.id}</span>
                        <span className="text-xs text-white/90 font-medium truncate">{mi.location}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border backdrop-blur-sm ${
                        mi.dangerLevel === 'critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        mi.dangerLevel === 'high' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        mi.dangerLevel === 'medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}>
                        {manholeTypeLabelMap[mi.issueType]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1 text-cyan-400/70">
                        <Clock size={11} />
                        <span className="text-white/75">{mi.reportTime.slice(5).replace(' ', ' ')}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-sm ${
                        mi.repairStatus === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        mi.repairStatus === 'repairing' || mi.repairStatus === 'arrived' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-slate-500/15 text-slate-300 border-slate-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          mi.repairStatus === 'completed' ? 'bg-emerald-400' :
                          mi.repairStatus === 'repairing' || mi.repairStatus === 'arrived' ? 'bg-amber-400 animate-pulse' :
                          'bg-slate-400'
                        }`} />
                        {repairStatusLabelMap[mi.repairStatus]}
                      </span>
                    </div>
                    {mi.repairStatus !== 'completed' && (
                      <div className="mt-1 text-[11px] text-cyan-400/50 truncate">
                        责任人: {mi.assignedWorker}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          <div className="col-span-6 flex flex-col gap-4">
            <TechCard
              title="管网拓扑示意图"
              icon={<Waves size={16} className="text-cyan-400" />}
              extra={<span className="text-xs text-cyan-400/70 flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-3 h-[3px] bg-[#00D4FF]" />高负荷</span>
                <span className="flex items-center gap-1"><span className="w-3 h-[3px] bg-[#06B6D4]" />正常</span>
                <span className="flex items-center gap-1"><span className="w-3 h-[3px] bg-[#0891B2]" />低负荷</span>
              </span>}
              bodyClassName="p-4"
            >
              <div className="relative w-full h-[520px] rounded-lg overflow-hidden bg-gradient-to-br from-[#041226] to-[#061a36] border border-cyan-500/10">
                <div className="absolute inset-0 opacity-40" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.06) 0%, transparent 50%)'
                }} />
                <svg viewBox="0 0 880 500" className="w-full h-full relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.2))' }}>
                  <defs>
                    {['high', 'medium', 'low'].map(fk => (
                      <linearGradient key={fk} id={`flow-${fk}`} x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={flowColorMap[fk as keyof typeof flowColorMap]} stopOpacity="0.4" />
                        <stop offset="50%" stopColor={flowColorMap[fk as keyof typeof flowColorMap]} stopOpacity="1" />
                        <stop offset="100%" stopColor={flowColorMap[fk as keyof typeof flowColorMap]} stopOpacity="0.4" />
                      </linearGradient>
                    ))}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {links.map((lk, idx) => {
                    const from = nodes.find(n => n.id === lk.from)!;
                    const to = nodes.find(n => n.id === lk.to)!;
                    return (
                      <g key={`lk-${idx}`}>
                        <line
                          x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                          stroke={`url(#flow-${lk.flow})`}
                          strokeWidth={flowWidthMap[lk.flow as keyof typeof flowWidthMap]}
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />
                      </g>
                    );
                  })}
                  {nodes.map(n => (
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r="14" fill="rgba(3, 16, 35, 0.9)" stroke="#00D4FF" strokeWidth="2" filter="url(#glow)" />
                      <circle cx={n.x} cy={n.y} r="5" fill="#00D4FF" />
                      <text x={n.x} y={n.y + 30} textAnchor="middle" fill="#8AE6FF" fontSize="11" fontWeight="500">{n.label}</text>
                    </g>
                  ))}
                  {[
                    { x: 200, y: 350, label: '人民路积水点' },
                    { x: 560, y: 470, label: '西山路积水点' }
                  ].map((fp, i) => (
                    <g key={`fp-${i}`}>
                      <polygon
                        points={`${fp.x},${fp.y} ${fp.x - 10},${fp.y - 16} ${fp.x + 10},${fp.y - 16}`}
                        fill="#EF4444" stroke="#FCA5A5" strokeWidth="1" filter="url(#glow)"
                      />
                      <text x={fp.x} y={fp.y + 16} textAnchor="middle" fill="#FCA5A5" fontSize="10" fontWeight="600">{fp.label}</text>
                    </g>
                  ))}
                  {[
                    { x: 400, y: 140, label: '东湖排涝站' },
                    { x: 720, y: 350, label: '新城污水泵站' }
                  ].map((ps, i) => (
                    <g key={`ps-${i}`}>
                      <rect x={ps.x - 14} y={ps.y - 14} width="28" height="28" rx="4"
                            fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" filter="url(#glow)" />
                      <text x={ps.x} y={ps.y + 4} textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="700">⚡</text>
                      <text x={ps.x} y={ps.y + 32} textAnchor="middle" fill="#6EE7B7" fontSize="10">{ps.label}</text>
                    </g>
                  ))}
                </svg>
                <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-cyan-400/70">
                  <span className="flex items-center gap-1"><span className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500" />积水点</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/60 border border-emerald-400" />泵站</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-cyan-300" />管网节点</span>
                </div>
              </div>
            </TechCard>
          </div>

          <div className="col-span-3 flex flex-col gap-4">
            <TechCard
              title="泵站运行状态"
              icon={<Zap size={16} className="text-emerald-400" />}
              extra={<span className="text-xs text-cyan-400/70">{(livePumpStations || pumpStations).filter(p => p.status === 'running').length}运行 / {pumpStations.length}总</span>}
              className="flex-1"
              bodyClassName="p-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {(livePumpStations || pumpStations).slice(0, 6).map(ps => {
                  const healthColor = ps.efficiency >= 85 ? '#10B981' : ps.efficiency >= 70 ? '#00D4FF' : ps.efficiency >= 50 ? '#FACC15' : '#EF4444';
                  const levelPercent = (ps.waterLevel / ps.maxWaterLevel) * 100;
                  const levelWarning = levelPercent >= 80;
                  return (
                    <div key={ps.id} className="relative rounded-lg border border-cyan-500/15 p-3 bg-gradient-to-br from-cyan-500/5 to-transparent hover:border-cyan-400/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <RingProgress
                          percent={Math.round(ps.efficiency)}
                          size={64}
                          strokeWidth={6}
                          color={healthColor}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white/90 truncate mb-1">{ps.name}</div>
                          <div className={`text-[11px] px-1.5 py-0.5 rounded inline-block mb-2 ${
                            ps.status === 'running' ? 'bg-emerald-500/15 text-emerald-400' :
                            ps.status === 'stopped' ? 'bg-slate-500/20 text-slate-400' :
                            ps.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {ps.status === 'running' ? '● 运行中' : ps.status === 'stopped' ? '○ 停机' : ps.status === 'maintenance' ? '⚙ 维护' : '✕ 故障'}
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-cyan-400/70">液位</span>
                              <span className={levelWarning ? 'text-red-400 font-semibold' : 'text-white/85'}>
                                {ps.waterLevel.toFixed(1)}/{ps.maxWaterLevel.toFixed(1)}m
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-cyan-400/70">流量</span>
                              <span className="text-white/85">{Math.round(ps.currentFlow)} m³/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-cyan-400/70">运行</span>
                              <span className="text-white/85">{Math.round(ps.runningHours)}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{
                               width: `${levelPercent}%`,
                               background: levelWarning ? 'linear-gradient(90deg, #F97316, #EF4444)' : 'linear-gradient(90deg, #06B6D4, #00D4FF)'
                             }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TechCard>

            <TechCard
              title="管网健康雷达"
              icon={<Gauge size={16} className="text-cyan-400" />}
              extra={<span className="text-xs text-cyan-400/70">六维评估</span>}
              bodyClassName="p-0 h-[300px]"
            >
              <ReactECharts option={radarOption} style={{ width: '100%', height: '100%' }} />
            </TechCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;
