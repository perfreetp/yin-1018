import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Clock,
  Video,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Siren,
  Gauge,
  Info,
  ChevronRight,
} from 'lucide-react';
import TechCard from '@/components/common/TechCard';
import MetricCard from '@/components/common/MetricCard';
import AlertBadge, { AlertBadgeLevel, AlertBadgeLevelMap } from '@/components/common/AlertBadge';
import StatusTag from '@/components/common/StatusTag';
import LineChart from '@/components/chart/LineChart';
import BarChart from '@/components/chart/BarChart';
import PieChart from '@/components/chart/PieChart';
import {
  overviewMetrics,
  alertStatistics,
  events as mockEvents,
  districts,
  cameraPoints,
  type RealtimeFeed,
} from '@/mock';
import { formatNumber, formatPercent, formatTime, getAlertLevelConfig, getEventCategoryLabel, getEventCategoryColor } from '@/utils/format';
import { useEventStore } from '@/store/useEventStore';
import type { AlertLevel, EventCategory, EventStatus } from '@/types';
import { useSimulatedMetrics, useRealtimeList } from '@/hooks/useRealtimeData';

const levelGradientMap: Record<AlertBadgeLevel, string> = {
  critical: 'from-red-500 to-rose-600',
  warning: 'from-orange-500 to-amber-600',
  notice: 'from-amber-500 to-yellow-600',
  info: 'from-purple-500 to-violet-600',
};

const levelBorderMap: Record<AlertBadgeLevel, string> = {
  critical: 'border-red-500/40 hover:border-red-400/60',
  warning: 'border-orange-500/40 hover:border-orange-400/60',
  notice: 'border-amber-500/40 hover:border-amber-400/60',
  info: 'border-purple-500/40 hover:border-purple-400/60',
};

const levelGlowMap: Record<AlertBadgeLevel, string> = {
  critical: 'hover:shadow-glow-red',
  warning: 'hover:shadow-glow-orange',
  notice: '',
  info: 'hover:shadow-glow-purple',
};

const OverviewPage: React.FC = () => {
  const { events, setFilters } = useEventStore();
  const [scrollIndex, setScrollIndex] = useState(0);

  const population = useSimulatedMetrics({ baseValue: 1258600, variance: 0.001, trend: 'stable', interval: 10000 });
  const todayEvents = useSimulatedMetrics({ baseValue: 47, variance: 0.1, trend: 'random', minValue: 10, maxValue: 100 });
  const resolutionRate = useSimulatedMetrics({ baseValue: 89.4, variance: 0.02, trend: 'up', decimals: 1, minValue: 80, maxValue: 99 });
  const healthIndex = useSimulatedMetrics({ baseValue: 92.6, variance: 0.01, trend: 'stable', decimals: 1, minValue: 85, maxValue: 99 });
  const avgResponseTime = useSimulatedMetrics({ baseValue: 8.5, variance: 0.15, trend: 'down', decimals: 1, minValue: 3, maxValue: 20 });
  const onlineCameras = useSimulatedMetrics({ baseValue: 1247, variance: 0.02, trend: 'stable', minValue: 1100, maxValue: 1400 });

  const levelCounts = useMemo(() => {
    const counts = { red: 0, orange: 0, yellow: 0, blue: 0 };
    events.forEach((e) => {
      if (counts[e.level as AlertLevel] !== undefined) {
        counts[e.level as AlertLevel]++;
      }
    });
    return {
      critical: alertStatistics.red + counts.red,
      warning: alertStatistics.orange + counts.orange,
      notice: alertStatistics.yellow + counts.yellow,
      info: alertStatistics.blue + counts.blue,
    };
  }, [events, alertStatistics]);

  const levelTrends = useMemo(() => ({
    critical: -8.5,
    warning: 12.3,
    notice: 5.7,
    info: -2.1,
  }), []);

  const hourlyXAxis = useMemo(
    () => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    [],
  );

  const hourlyTrendData = useMemo(() => {
    const base = [12, 8, 5, 3, 2, 3, 5, 8, 15, 22, 18, 16, 14, 12, 15, 18, 25, 28, 24, 20, 18, 15, 12, 10];
    const resolved = base.map((v) => Math.floor(v * (0.7 + Math.random() * 0.25)));
    return { base, resolved };
  }, []);

  const eventCategories: EventCategory[] = ['traffic', 'pipeline', 'environment', 'safety', 'facility', 'public', 'other'];
  const categoryColors: Record<EventCategory, string> = {
    traffic: '#3b82f6',
    pipeline: '#06b6d4',
    environment: '#22c55e',
    safety: '#ef4444',
    facility: '#f97316',
    public: '#a855f7',
    other: '#64748b',
  };

  const categoryStackData = useMemo(() => {
    return eventCategories.map((cat) => ({
      name: getEventCategoryLabel(cat),
      data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 8) + 1),
      color: categoryColors[cat],
      stack: 'total',
    }));
  }, []);

  const top10Districts = useMemo(() => {
    return districts
      .map((d) => ({
        name: d.name,
        value: Math.floor(Math.random() * 50) + 5,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [districts]);

  const eventStatusData = useMemo(() => {
    const statuses: EventStatus[] = ['pending', 'dispatched', 'processing', 'resolved', 'closed'];
    const statusLabels: Record<EventStatus, string> = {
      pending: '待派发',
      dispatched: '已派发',
      processing: '处置中',
      resolved: '已解决',
      closed: '已结案',
    };
    const statusColors: Record<EventStatus, string> = {
      pending: '#94a3b8',
      dispatched: '#3b82f6',
      processing: '#f59e0b',
      resolved: '#22c55e',
      closed: '#64748b',
    };
    return statuses.map((s) => ({
      name: statusLabels[s],
      value: Math.floor(Math.random() * 30) + 5,
      color: statusColors[s],
    }));
  }, []);

  const generateFeeds = (): RealtimeFeed[] => {
    const templates: Omit<RealtimeFeed, 'id' | 'timestamp'>[] = [
      { type: 'event', title: '交通拥堵告警', content: '人民大道与中山路交叉口车流激增，拥堵指数达0.82', level: 'orange' },
      { type: 'alert', title: '管网压力异常', content: '东湖片区B3管段压力低于阈值，已启动应急预案', level: 'yellow' },
      { type: 'event', title: '事故处置完成', content: '南山路段交通事故已清理，交通恢复正常', level: 'blue' },
      { type: 'system', title: '摄像头离线告警', content: 'CAM-0287号监控点位离线超过5分钟', level: 'yellow' },
      { type: 'weather', title: '气象预警', content: '未来2小时局部地区有雷阵雨，请注意防范', level: 'blue' },
      { type: 'event', title: '群众求助', content: '中心广场发现走失老人，已联系辖区派出所', level: 'info' },
      { type: 'alert', title: '积水点预警', content: '北岭下穿隧道积水深度达15cm，请注意通行安全', level: 'red' },
      { type: 'event', title: '设施修复', content: '东湖南路破损井盖已更换完毕', level: 'blue' },
      { type: 'system', title: '泵站运行告警', content: '3号排水泵站液位接近警戒线', level: 'orange' },
      { type: 'event', title: '环境监测', content: '工业园区PM2.5浓度短时升高，正在排查', level: 'yellow' },
    ];
    const now = new Date();
    return templates.map((t, i) => ({
      ...t,
      id: `feed-${i}`,
      timestamp: new Date(now.getTime() - i * Math.floor(Math.random() * 300000 + 60000)).toISOString(),
    }));
  };

  const { data: feeds } = useRealtimeList<RealtimeFeed>(generateFeeds(), (list) => {
    if (Math.random() > 0.7 && list.length > 0) {
      const now = new Date();
      const newItem: RealtimeFeed = {
        id: `feed-${Date.now()}`,
        type: list[0]?.type === 'event' ? 'alert' : 'event',
        title: '新动态更新',
        content: `实时监测发现新的${list[0]?.type === 'event' ? '告警' : '事件'}信息`,
        timestamp: now.toISOString(),
        level: (['orange', 'yellow', 'blue', 'info'] as const)[Math.floor(Math.random() * 4)],
      };
      return [newItem, ...list.slice(0, 9)];
    }
    return list;
  }, { interval: 8000 });

  useEffect(() => {
    const timer = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % (feeds?.length || 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [feeds?.length]);

  const handleLevelClick = (level: AlertBadgeLevel) => {
    const levelMap: Record<AlertBadgeLevel, AlertLevel[]> = {
      critical: ['red'],
      warning: ['orange'],
      notice: ['yellow'],
      info: ['blue'],
    };
    setFilters({ levels: levelMap[level] });
  };

  return (
    <div className="relative w-full h-full overflow-auto p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-tech-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="城区人口"
            value={population.data || overviewMetrics.totalPopulation}
            icon={<Users className="w-6 h-6" />}
            iconGradient="from-blue-500 to-cyan-500"
            suffix="人"
            yoyChange={2.3}
            qoqTrend={{ values: [1256000, 1256500, 1257000, 1257500, 1258000, 1258600] }}
          />
          <MetricCard
            title="今日事件"
            value={Math.floor(todayEvents.data || overviewMetrics.todayEvents)}
            icon={<AlertTriangle className="w-6 h-6" />}
            iconGradient="from-orange-500 to-red-500"
            suffix="件"
            yoyChange={overviewMetrics.comparedYesterday.events}
            qoqTrend={{ values: [42, 38, 45, 50, 48, Math.floor(todayEvents.data || 47)] }}
          />
          <MetricCard
            title="处置率"
            value={resolutionRate.data || overviewMetrics.eventResolutionRate}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconGradient="from-emerald-500 to-teal-500"
            suffix="%"
            decimals={1}
            yoyChange={overviewMetrics.comparedYesterday.resolutionRate}
            qoqTrend={{ values: [87.2, 88.1, 88.5, 89.0, 89.2, resolutionRate.data || 89.4] }}
          />
          <MetricCard
            title="健康指数"
            value={healthIndex.data || overviewMetrics.cityHealthIndex}
            icon={<Heart className="w-6 h-6" />}
            iconGradient="from-pink-500 to-rose-500"
            decimals={1}
            yoyChange={overviewMetrics.comparedYesterday.healthIndex}
            qoqTrend={{ values: [91.8, 92.0, 92.2, 92.4, 92.5, healthIndex.data || 92.6] }}
          />
          <MetricCard
            title="平均响应时间"
            value={avgResponseTime.data || overviewMetrics.averageResponseTime}
            icon={<Clock className="w-6 h-6" />}
            iconGradient="from-amber-500 to-yellow-500"
            suffix="分钟"
            decimals={1}
            yoyChange={overviewMetrics.comparedYesterday.responseTime}
            trendColor="#22c55e"
            qoqTrend={{ values: [10.2, 9.8, 9.2, 8.9, 8.7, avgResponseTime.data || 8.5] }}
          />
          <MetricCard
            title="在线摄像头"
            value={Math.floor(onlineCameras.data || 1247)}
            icon={<Video className="w-6 h-6" />}
            iconGradient="from-violet-500 to-purple-500"
            suffix="路"
            yoyChange={5.8}
            qoqTrend={{ values: [1220, 1230, 1235, 1240, 1245, Math.floor(onlineCameras.data || 1247)] }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <Siren className="w-5 h-5 text-tech-400" />
                  <span>分级预警概览</span>
                </div>
              }
              icon={<Activity className="w-5 h-5" />}
              extra={<span className="text-xs text-text-tertiary">点击卡片查看详情</span>}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['critical', 'warning', 'notice', 'info'] as AlertBadgeLevel[]).map((level) => {
                  const trend = levelTrends[level];
                  const count = levelCounts[level];
                  const trendPositive = trend > 0;
                  const trendNegative = trend < 0;
                  return (
                    <div
                      key={level}
                      onClick={() => handleLevelClick(level)}
                      className={`
                        relative rounded-xl p-5 cursor-pointer
                        bg-space-800/60 backdrop-blur-sm
                        border-2 transition-all duration-300
                        ${levelBorderMap[level]}
                        ${levelGlowMap[level]}
                        hover:scale-[1.02] hover:bg-space-700/60
                      `}
                    >
                      <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r ${levelGradientMap[level]}`} />
                      <div className="flex items-center justify-between mb-3">
                        <AlertBadge level={level} size="lg" />
                      </div>
                      <div className="text-4xl font-bold font-mono text-text-primary mb-2">
                        {formatNumber(count)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">较昨日</span>
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          trendPositive ? 'text-data-bad' : trendNegative ? 'text-data-good' : 'text-text-tertiary'
                        }`}>
                          {trendPositive && <TrendingUp className="w-3 h-3" />}
                          {trendNegative && <TrendingDown className="w-3 h-3" />}
                          {!trendPositive && !trendNegative && <Minus className="w-3 h-3" />}
                          <span>{trend > 0 ? '+' : ''}{trend}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TechCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TechCard
                title={
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-tech-400" />
                    <span>24小时事件趋势</span>
                  </div>
                }
              >
                <LineChart
                  xAxisData={hourlyXAxis}
                  series={[
                    {
                      name: '事件总数',
                      data: hourlyTrendData.base,
                      color: '#00d4ff',
                      smooth: true,
                      areaStyle: true,
                    },
                    {
                      name: '已处置',
                      data: hourlyTrendData.resolved,
                      color: '#10b981',
                      smooth: true,
                      areaStyle: true,
                    },
                  ]}
                  height={260}
                  showLegend={true}
                />
              </TechCard>

              <TechCard
                title={
                  <div className="flex items-center gap-3">
                    <Gauge className="w-5 h-5 text-tech-400" />
                    <span>事件分类统计</span>
                  </div>
                }
              >
                <BarChart
                  xAxisData={hourlyXAxis.filter((_, i) => i % 3 === 0)}
                  series={categoryStackData.map((s) => ({
                    ...s,
                    data: s.data.filter((_, i) => i % 3 === 0),
                  }))}
                  height={260}
                  showLegend={true}
                />
              </TechCard>
            </div>
          </div>

          <div className="space-y-6">
            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-tech-400" />
                  <span>预警街道TOP10</span>
                </div>
              }
            >
              <BarChart
                xAxisData={top10Districts.map((d) => d.name)}
                series={[
                  {
                    name: '预警数',
                    data: top10Districts.map((d) => d.value),
                    color: '#f59e0b',
                  },
                ]}
                horizontal={true}
                height={280}
                showLegend={false}
                barWidth="60%"
              />
            </TechCard>

            <TechCard
              title={
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-tech-400" />
                  <span>事件状态分布</span>
                </div>
              }
            >
              <PieChart
                data={eventStatusData}
                type="donut"
                height={220}
                showLegend={true}
                legendPosition="bottom"
                center={['50%', '45%']}
              />
            </TechCard>
          </div>
        </div>

        <TechCard
          title={
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-tech-400" />
              <span>实时动态</span>
            </div>
          }
          extra={<span className="text-xs text-data-good flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />实时更新中</span>}
        >
          <div className="relative overflow-hidden h-72">
            <div
              className="space-y-3 transition-transform duration-700 ease-in-out"
              style={{ transform: `translateY(-${scrollIndex * 76}px)` }}
            >
              {(feeds || []).concat(feeds?.slice(0, 3) || []).map((feed, index) => {
                const actualIndex = index % (feeds?.length || 1);
                const actualFeed = feeds?.[actualIndex] || feed;
                const level = actualFeed.level === 'info' ? 'info' : AlertBadgeLevelMap[actualFeed.level as AlertLevel] || 'info';
                const config = getAlertLevelConfig((actualFeed.level === 'info' ? 'blue' : actualFeed.level) as AlertLevel);
                return (
                  <div
                    key={`${actualFeed.id}-${index}`}
                    className="flex items-start gap-4 p-4 rounded-lg bg-space-700/30 border border-tech-500/10 hover:bg-space-700/50 hover:border-tech-400/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: `${config.color}22`, color: config.color }}
                      >
                        {actualFeed.type === 'event' && <AlertTriangle className="w-5 h-5" />}
                        {actualFeed.type === 'alert' && <Siren className="w-5 h-5" />}
                        {actualFeed.type === 'system' && <Gauge className="w-5 h-5" />}
                        {actualFeed.type === 'weather' && <Info className="w-5 h-5" />}
                      </div>
                      <div className="text-[10px] text-text-tertiary mt-1 font-mono">
                        {formatTime(actualFeed.timestamp)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertBadge level={level} size="sm" />
                        <span className="font-medium text-text-primary text-sm truncate">{actualFeed.title}</span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2">{actualFeed.content}</p>
                    </div>
                    <ChevronRight className="flex-shrink-0 w-5 h-5 text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:text-tech-400 transition-all duration-200" />
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-space-800/90 to-transparent pointer-events-none" />
          </div>
        </TechCard>
      </div>
    </div>
  );
};

export default OverviewPage;
