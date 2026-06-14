import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

export interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: number | string;
  title?: string;
  subtitle?: string;
  type?: 'pie' | 'donut' | 'rose';
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
  theme?: 'dark' | 'light';
  innerRadius?: string | number;
  outerRadius?: string | number;
  center?: (string | number)[];
}

const defaultColors = [
  '#00d4ff',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  title,
  subtitle,
  type = 'donut',
  showLegend = true,
  legendPosition = 'right',
  className,
  theme = 'dark',
  innerRadius,
  outerRadius,
  center = ['50%', '50%'],
}) => {
  const option: EChartsOption = useMemo(() => {
    const isDark = theme === 'dark';
    const tooltipBg = isDark ? 'rgba(15, 31, 56, 0.95)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipText = isDark ? '#e2e8f0' : '#1e293b';
    const tooltipBorder = isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)';
    const legendTextColor = isDark ? '#94a3b8' : '#64748b';

    let actualInnerRadius: string | number = '0%';
    let actualOuterRadius: string | number = '70%';

    if (type === 'donut') {
      actualInnerRadius = innerRadius || '55%';
      actualOuterRadius = outerRadius || '75%';
    } else if (type === 'pie') {
      actualInnerRadius = innerRadius || '0%';
      actualOuterRadius = outerRadius || '70%';
    } else if (type === 'rose') {
      actualInnerRadius = innerRadius || '20%';
      actualOuterRadius = outerRadius || '70%';
    }

    const legendOrient = legendPosition === 'top' || legendPosition === 'bottom' ? 'horizontal' : 'vertical';
    const legendTop = legendPosition === 'top' ? 0 : legendPosition === 'bottom' ? undefined : 'middle';
    const legendBottom = legendPosition === 'bottom' ? 0 : undefined;
    const legendLeft = legendPosition === 'left' ? 0 : undefined;
    const legendRight = legendPosition === 'right' ? 0 : undefined;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return {
      backgroundColor: 'transparent',
      title: title || subtitle
        ? {
            text: title,
            subtext: subtitle,
            left: 'center',
            top: 'center',
            textStyle: {
              color: isDark ? '#e2e8f0' : '#1e293b',
              fontSize: 24,
              fontWeight: 'bold',
            },
            subtextStyle: {
              color: isDark ? '#64748b' : '#94a3b8',
              fontSize: 12,
            },
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: tooltipText,
          fontSize: 12,
        },
        padding: [12, 16],
        extraCssText: 'border-radius: 8px; backdrop-filter: blur(10px); box-shadow: 0 4px 24px rgba(0,0,0,0.3);',
        formatter: (params: any) => {
          const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0';
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${params.color};"></div>
              <span>${params.value.toLocaleString()} (${percent}%)</span>
            </div>
          `;
        },
      },
      legend: showLegend
        ? {
            show: true,
            orient: legendOrient,
            top: legendTop,
            bottom: legendBottom,
            left: legendLeft,
            right: legendRight,
            textStyle: {
              color: legendTextColor,
              fontSize: 12,
            },
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 12,
            icon: 'circle',
            formatter: (name: string) => {
              const item = data.find((d) => d.name === name);
              if (item) {
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                return `${name}  ${percent}%`;
              }
              return name;
            },
          }
        : undefined,
      series: [
        {
          name: title || '数据',
          type: 'pie',
          radius: type === 'rose' ? [actualInnerRadius, actualOuterRadius] : [actualInnerRadius, actualOuterRadius],
          roseType: type === 'rose' ? 'area' : undefined,
          center: center,
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: type === 'donut' ? 6 : 4,
            borderColor: isDark ? '#0F1F38' : '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: type !== 'donut',
            color: isDark ? '#e2e8f0' : '#1e293b',
            fontSize: 11,
            formatter: '{b}\n{d}%',
          },
          labelLine: {
            show: type !== 'donut',
            length: 12,
            length2: 8,
            lineStyle: {
              color: isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
            },
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.4)',
            },
          },
          data: data.map((item, idx) => ({
            ...item,
            itemStyle: {
              color: item.color || defaultColors[idx % defaultColors.length],
            },
          })),
        },
      ],
    };
  }, [data, title, subtitle, type, showLegend, legendPosition, theme, innerRadius, outerRadius, center]);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default PieChart;
