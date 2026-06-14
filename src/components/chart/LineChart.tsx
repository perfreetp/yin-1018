import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

export interface LineChartData {
  name: string;
  data: (number | string | null)[];
  color?: string;
  smooth?: boolean;
  areaStyle?: boolean;
}

export interface LineChartProps {
  xAxisData: string[];
  series: LineChartData[];
  height?: number | string;
  yAxisName?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
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

export const LineChart: React.FC<LineChartProps> = ({
  xAxisData,
  series,
  height = 300,
  yAxisName,
  showLegend = true,
  showGrid = true,
  className,
  theme = 'dark',
}) => {
  const option: EChartsOption = useMemo(() => {
    const isDark = theme === 'dark';
    const axisLineColor = isDark ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    const axisLabelColor = isDark ? '#94a3b8' : '#64748b';
    const splitLineColor = isDark ? 'rgba(0, 212, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? 'rgba(15, 31, 56, 0.95)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipText = isDark ? '#e2e8f0' : '#1e293b';
    const tooltipBorder = isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: tooltipText,
          fontSize: 12,
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.4)',
            type: 'dashed',
          },
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
      grid: showGrid
        ? {
            left: '3%',
            right: '4%',
            top: showLegend ? 40 : 20,
            bottom: '3%',
            containLabel: true,
          }
        : undefined,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
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
          margin: 12,
        },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: axisLabelColor,
          fontSize: 11,
          padding: [0, 0, 10, 0],
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
          type: 'line',
          data: s.data,
          smooth: s.smooth ?? true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            color: color,
            width: 2,
            shadowColor: color,
            shadowBlur: 8,
            shadowOffsetY: 4,
          },
          itemStyle: {
            color: color,
            borderColor: isDark ? '#0F1F38' : '#ffffff',
            borderWidth: 2,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: color,
              borderColor: color,
              borderWidth: 3,
              shadowColor: color,
              shadowBlur: 16,
            },
          },
          areaStyle: s.areaStyle
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: color + '40' },
                    { offset: 1, color: color + '00' },
                  ],
                },
              }
            : undefined,
        };
      }),
    };
  }, [xAxisData, series, yAxisName, showLegend, showGrid, theme]);

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

export default LineChart;
