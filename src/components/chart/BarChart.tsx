import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

export interface BarChartData {
  name: string;
  data: number[];
  color?: string;
  stack?: string;
}

export interface BarChartProps {
  xAxisData: string[];
  series: BarChartData[];
  height?: number | string;
  yAxisName?: string;
  horizontal?: boolean;
  showLegend?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
  barWidth?: number | string;
}

const defaultColors = [
  '#00d4ff',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
];

export const BarChart: React.FC<BarChartProps> = ({
  xAxisData,
  series,
  height = 300,
  yAxisName,
  horizontal = false,
  showLegend = true,
  className,
  theme = 'dark',
  barWidth = '50%',
}) => {
  const option: EChartsOption = useMemo(() => {
    const isDark = theme === 'dark';
    const axisLineColor = isDark ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    const axisLabelColor = isDark ? '#94a3b8' : '#64748b';
    const splitLineColor = isDark ? 'rgba(0, 212, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? 'rgba(15, 31, 56, 0.95)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipText = isDark ? '#e2e8f0' : '#1e293b';
    const tooltipBorder = isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)';

    const categoryAxis = horizontal ? 'yAxis' : 'xAxis';
    const valueAxis = horizontal ? 'xAxis' : 'yAxis';

    const baseAxis = {
      axisLine: {
        show: true,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: axisLabelColor,
        fontSize: 11,
      },
    };

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 212, 255, 0.08)',
          },
        },
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: tooltipText,
          fontSize: 12,
        },
        padding: [12, 16],
        extraCssText: 'border-radius: 8px; backdrop-filter: blur(10px); box-shadow: 0 4px 24px rgba(0,0,0,0.3);',
      },
      legend: showLegend
        ? {
            show: true,
            top: 0,
            right: 0,
            textStyle: {
              color: axisLabelColor,
              fontSize: 12,
            },
            itemWidth: 16,
            itemHeight: 8,
            itemGap: 20,
          }
        : undefined,
      grid: {
        left: '3%',
        right: '4%',
        top: showLegend ? 40 : 20,
        bottom: '3%',
        containLabel: true,
      },
      [categoryAxis]: {
        type: 'category',
        data: xAxisData,
        ...baseAxis,
      },
      [valueAxis]: {
        type: 'value',
        name: !horizontal ? yAxisName : undefined,
        nameTextStyle: {
          color: axisLabelColor,
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: axisLabelColor,
          fontSize: 11,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: splitLineColor,
            type: 'dashed',
          },
        },
      },
      series: series.map((s, idx) => {
        const color = s.color || defaultColors[idx % defaultColors.length];
        return {
          name: s.name,
          type: 'bar',
          data: s.data,
          stack: s.stack,
          barWidth: barWidth,
          itemStyle: {
            borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
            color: {
              type: 'linear',
              x: horizontal ? 0 : 0,
              y: horizontal ? 0 : 0,
              x2: horizontal ? 1 : 0,
              y2: horizontal ? 0 : 1,
              colorStops: [
                { offset: 0, color: color },
                { offset: 1, color: color + '66' },
              ],
            },
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: {
                type: 'linear',
                x: horizontal ? 0 : 0,
                y: horizontal ? 0 : 0,
                x2: horizontal ? 1 : 0,
                y2: horizontal ? 0 : 1,
                colorStops: [
                  { offset: 0, color: color },
                  { offset: 1, color: color + 'aa' },
                ],
              },
              shadowColor: color,
              shadowBlur: 16,
            },
          },
        };
      }),
    };
  }, [xAxisData, series, yAxisName, horizontal, showLegend, theme, barWidth]);

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

export default BarChart;
