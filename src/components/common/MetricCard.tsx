import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

export interface SparklineData {
  values: number[];
}

export interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconGradient?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  yoyChange?: number;
  qoqTrend?: SparklineData;
  trendColor?: string;
  className?: string;
}

const MiniSparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#00d4ff', height = 32 }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const pointGap = width / (data.length - 1);

  const points = data.map((val, i) => {
    const x = i * pointGap;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const areaPoints = [
    `0,${height}`,
    ...points,
    `${width},${height}`,
  ].join(' ');

  const linePoints = points.join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparklineGradient)" />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconGradient = 'from-tech-400 to-tech-600',
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1500,
  yoyChange,
  qoqTrend,
  trendColor,
  className,
}) => {
  const { value: displayValue } = useCountUp(value, {
    duration,
    decimals,
    prefix,
    suffix,
  });

  const yoyPositive = (yoyChange ?? 0) > 0;
  const yoyNegative = (yoyChange ?? 0) < 0;
  const yoyZero = (yoyChange ?? 0) === 0;

  const defaultTrendColor = yoyPositive
    ? '#00e68a'
    : yoyNegative
    ? '#ff4d4f'
    : '#00d4ff';

  const actualTrendColor = trendColor || defaultTrendColor;

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 overflow-hidden',
        'bg-space-800/50 backdrop-blur-md',
        'border border-tech-500/20',
        'shadow-card hover:shadow-card-hover',
        'transition-all duration-300 hover:border-tech-400/30',
        'group',
        className,
      )}
    >
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-tech-400/50 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-tech-400/50 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-tech-400/50 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-tech-400/50 rounded-br pointer-events-none" />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-400/30 to-transparent" />
      </div>

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'relative flex-shrink-0 w-14 h-14 rounded-2xl',
            'bg-gradient-to-br flex items-center justify-center',
            iconGradient,
            'shadow-lg',
          )}
        >
          <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm" />
          <div className="relative text-white w-7 h-7">{icon}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-secondary mb-1">{title}</div>
          <div
            className="text-3xl font-bold font-mono text-text-primary mb-2 animate-count-up tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #ffffff 0%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {displayValue}
          </div>

          <div className="flex items-center justify-between gap-2">
            {yoyChange !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  yoyPositive && 'text-data-good',
                  yoyNegative && 'text-data-bad',
                  yoyZero && 'text-text-tertiary',
                )}
              >
                {yoyPositive && <TrendingUp className="w-3 h-3" />}
                {yoyNegative && <TrendingDown className="w-3 h-3" />}
                {yoyZero && <Minus className="w-3 h-3" />}
                <span>
                  同比 {yoyChange > 0 ? '+' : ''}
                  {yoyChange}%
                </span>
              </div>
            )}

            {qoqTrend && (
              <div className="flex-1 max-w-[80px] opacity-80">
                <MiniSparkline
                  data={qoqTrend.values}
                  color={actualTrendColor}
                  height={24}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
