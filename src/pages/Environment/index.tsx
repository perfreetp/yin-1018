import React, { useMemo } from 'react';
import {
  Wind,
  Volume2,
  Sun,
  CloudRain,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  Sunrise,
  Sunset,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import MetricCard from '@/components/common/MetricCard';
import LineChart from '@/components/chart/LineChart';
import PieChart from '@/components/chart/PieChart';
import {
  airQualityStations,
  noiseMonitorPoints,
  weatherData,
  getAverageAQI
} from '@/mock/environment';
import {
  formatNumber,
  formatPercent,
  formatTemperature,
  formatHumidity,
  formatDB,
  formatDateTime
} from '@/utils/format';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const aqiLevelColors: Record<string, { color: string; bgColor: string; label: string }> = {
  excellent: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', label: '优' },
  good: { color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.15)', label: '良' },
  mild: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)', label: '轻度污染' },
  moderate: { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', label: '中度污染' },
  heavy: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', label: '重度污染' },
  severe: { color: '#991b1b', bgColor: 'rgba(153, 27, 27, 0.15)', label: '严重污染' }
};

const Environment: React.FC = () => {
  const { currentDuty } = useAppStore();

  const avgAQI = useMemo(() => getAverageAQI(), []);

  const noiseComplianceRate = useMemo(() => {
    const total = noiseMonitorPoints.length;
    const compliant = noiseMonitorPoints.filter(n => !n.isOverLimit).length;
    return total > 0 ? Math.round((compliant / total) * 100) : 0;
  }, []);

  const excellentDays = 285;

  const hourlyAQI = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const params = ['AQI', 'PM2.5', 'PM10', 'O3', 'NO2', 'CO'];
    const colors = ['#00d4ff', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4'];
    const series = params.map((name, idx) => ({
      name,
      data: Array.from({ length: 24 }, () => Math.floor(Math.random() * (idx === 5 ? 3 : idx === 0 ? 120 : 180)) + (idx === 5 ? 0.3 : idx === 0 ? 30 : 15)),
      color: colors[idx],
      smooth: true,
      areaStyle: idx === 0
    }));
    return { hours, series };
  }, []);

  const aqiDistribution = useMemo(() => {
    const levels = ['excellent', 'good', 'mild', 'moderate', 'heavy', 'severe'];
    return levels.map(level => {
      const count = airQualityStations.filter(s => s.aqiLevel === level).length;
      return {
        name: aqiLevelColors[level].label,
        value: count,
        color: aqiLevelColors[level].color
      };
    }).filter(d => d.value > 0);
  }, []);

  const GaugeDisplay: React.FC<{
    value: number;
    max: number;
    label: string;
    unit: string;
    color?: string;
    icon?: React.ReactNode;
  }> = ({ value, max, label, unit, color = '#00d4ff', icon }) => {
    const percent = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const dashOffset = circumference * (1 - percent / 100);

    return (
      <div className="rounded-xl p-4 bg-space-800/50 border border-tech-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <span className="text-sm text-text-secondary">{label}</span>
        </div>
        <div className="relative w-28 h-28 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(0, 212, 255, 0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text-primary font-mono">{formatNumber(value)}</span>
            <span className="text-xs text-text-tertiary">{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-5">
        <MetricCard
          title="AQI 平均指数"
          value={avgAQI}
          icon={<Wind className="w-6 h-6" />}
          iconGradient="from-cyan-500 to-blue-600"
          yoyChange={-5.2}
          qoqTrend={{ values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 60) }}
        />
        <MetricCard
          title="噪声达标率"
          value={noiseComplianceRate}
          suffix="%"
          icon={<Volume2 className="w-6 h-6" />}
          iconGradient="from-emerald-500 to-teal-600"
          yoyChange={2.8}
          qoqTrend={{ values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 15) + 75) }}
          trendColor="#10b981"
        />
        <MetricCard
          title="优良天数"
          value={excellentDays}
          suffix="天"
          icon={<Sun className="w-6 h-6" />}
          iconGradient="from-amber-500 to-orange-600"
          yoyChange={12}
          qoqTrend={{ values: Array.from({ length: 12 }, (_, i) => 20 + i * 5 + Math.floor(Math.random() * 10)) }}
          trendColor="#f59e0b"
        />
        <MetricCard
          title="当前气象状况"
          value={weatherData.temperature}
          suffix="°C"
          decimals={1}
          icon={<CloudRain className="w-6 h-6" />}
          iconGradient="from-violet-500 to-purple-600"
          qoqTrend={{ values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 25) }}
        />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4 space-y-5">
          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                空气质量监测站点
              </h3>
              <span className="text-xs text-text-tertiary">共 {airQualityStations.length} 个站点</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {airQualityStations.map((station) => {
                const levelInfo = aqiLevelColors[station.aqiLevel];
                return (
                  <div
                    key={station.id}
                    className="rounded-lg p-4 bg-space-700/40 border border-tech-500/10 hover:border-tech-400/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-text-primary group-hover:text-tech-300 transition-colors line-clamp-1">
                        {station.stationName}
                      </h4>
                      <span className="text-[10px] text-text-tertiary whitespace-nowrap ml-2">
                        {station.district}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle, ${levelInfo.color}20 0%, transparent 70%)`,
                          border: `2px solid ${levelInfo.color}50`
                        }}
                      >
                        <div
                          className="absolute inset-2 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: levelInfo.bgColor }}
                        >
                          <span
                            className="text-xl font-bold font-mono"
                            style={{ color: levelInfo.color }}
                          >
                            {station.aqi}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium px-2 py-0.5 rounded inline-block mb-1"
                          style={{ backgroundColor: levelInfo.bgColor, color: levelInfo.color }}
                        >
                          {levelInfo.label}
                        </div>
                        {station.primaryPollutant && (
                          <div className="text-[10px] text-text-tertiary">
                            首要污染物: <span className="text-text-secondary">{station.primaryPollutant}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 mb-3">
                      {[
                        { key: 'PM2.5', value: station.pm25 },
                        { key: 'PM10', value: station.pm10 },
                        { key: 'O₃', value: station.o3 },
                        { key: 'NO₂', value: station.no2 }
                      ].map((item) => (
                        <div key={item.key} className="text-center">
                          <div className="text-sm font-mono text-text-primary">{formatNumber(item.value)}</div>
                          <div className="text-[9px] text-text-tertiary">{item.key}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-text-tertiary pt-2 border-t border-tech-500/10">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5" />
                        {formatDateTime(station.updateTime).slice(11, 16)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-5 space-y-5">
          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                24小时AQI变化趋势
              </h3>
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-data-good" />
                  正常范围
                </span>
              </div>
            </div>
            <LineChart
              xAxisData={hourlyAQI.hours}
              series={hourlyAQI.series}
              height={260}
              showLegend={true}
              showGrid={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="w-1 h-4 bg-tech-400 rounded-full" />
                  AQI等级分布
                </h3>
              </div>
              <PieChart
                data={aqiDistribution}
                height={200}
                type="donut"
                showLegend={true}
                legendPosition="bottom"
              />
            </div>

            <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="w-1 h-4 bg-tech-400 rounded-full" />
                  噪声监测站点
                </h3>
                <span className="text-xs text-text-tertiary">共 {noiseMonitorPoints.length} 个</span>
              </div>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {noiseMonitorPoints.map((noise) => (
                  <div
                    key={noise.id}
                    className={cn(
                      'rounded-lg p-3 border transition-all',
                      noise.isOverLimit
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-space-700/40 border-tech-500/10'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary truncate max-w-[120px]">
                        {noise.monitorName}
                      </span>
                      {noise.isOverLimit ? (
                        <span className="flex items-center gap-1 text-xs text-data-bad">
                          <AlertTriangle className="w-3 h-3" />
                          超标 {noise.overLimitCount}次
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-data-good">
                          <CheckCircle2 className="w-3 h-3" />
                          达标
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-base font-mono font-semibold text-text-primary">
                          {formatDB(noise.dayAverage)}
                        </div>
                        <div className="text-[10px] text-text-tertiary">昼间</div>
                      </div>
                      <div>
                        <div className="text-base font-mono font-semibold text-text-primary">
                          {formatDB(noise.nightAverage)}
                        </div>
                        <div className="text-[10px] text-text-tertiary">夜间</div>
                      </div>
                      <div>
                        <div className={cn(
                          'text-base font-mono font-semibold',
                          noise.currentDb > noise.standardLimit ? 'text-data-bad' : 'text-text-primary'
                        )}>
                          {formatDB(noise.currentDb)}
                        </div>
                        <div className="text-[10px] text-text-tertiary">当前</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-5">
          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                实时气象数据
              </h3>
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                {weatherData.updateTime.slice(11, 16)}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
              <div>
                <div className="text-5xl font-bold font-mono text-text-primary mb-1">
                  {formatTemperature(weatherData.temperature)}
                </div>
                <div className="text-sm text-text-secondary">
                  体感 {formatTemperature(weatherData.feelsLike)} · {weatherData.weather}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Sunrise className="w-3 h-3 text-amber-400" />
                    {weatherData.sunrise}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sunset className="w-3 h-3 text-orange-400" />
                    {weatherData.sunset}
                  </span>
                </div>
              </div>
              <div className="text-6xl">
                <Cloud className="w-20 h-20 text-tech-400 opacity-80" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GaugeDisplay
                label="湿度"
                value={weatherData.humidity}
                max={100}
                unit="%"
                color="#06b6d4"
                icon={<Droplets className="w-4 h-4" />}
              />
              <GaugeDisplay
                label="风速"
                value={weatherData.windSpeed}
                max={15}
                unit="m/s"
                color="#8b5cf6"
                icon={<Wind className="w-4 h-4" />}
              />
              <GaugeDisplay
                label="气压"
                value={weatherData.pressure}
                max={1050}
                unit="hPa"
                color="#10b981"
                icon={<Gauge className="w-4 h-4" />}
              />
              <GaugeDisplay
                label="能见度"
                value={weatherData.visibility}
                max={30}
                unit="km"
                color="#f59e0b"
                icon={<Eye className="w-4 h-4" />}
              />
            </div>

            <div className="mt-4 p-3 rounded-lg bg-space-700/40 border border-tech-500/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">风向风力</span>
                <span className="text-text-primary font-medium">
                  {weatherData.windDirection} {weatherData.windLevel}级
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                未来7日预报
              </h3>
            </div>
            <div className="space-y-2">
              {weatherData.forecast.map((day, idx) => {
                const aqiColor = day.aqi <= 50 ? '#10b981' : day.aqi <= 100 ? '#84cc16' : day.aqi <= 150 ? '#f59e0b' : '#ef4444';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-space-700/40 border border-tech-500/10 hover:border-tech-400/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary w-14">{day.date}</span>
                      <div className="text-2xl">
                        {idx === 0 || day.dayWeather.includes('晴') ? (
                          <Sun className="w-5 h-5 text-amber-400" />
                        ) : day.dayWeather.includes('雨') ? (
                          <CloudRain className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Cloud className="w-5 h-5 text-tech-400" />
                        )}
                      </div>
                      <span className="text-sm text-text-secondary w-16">{day.dayWeather}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-text-primary">
                        {day.lowTemp}°~{day.highTemp}°
                      </span>
                      <span className="text-xs text-text-tertiary w-14 text-right">
                        {day.windDirection}{day.windLevel}级
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${aqiColor}20`, color: aqiColor }}
                      >
                        AQI {day.aqi}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Environment;
