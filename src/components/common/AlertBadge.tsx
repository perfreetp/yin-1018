import React from 'react';
import { cn } from '@/lib/utils';

export type AlertBadgeLevel = 'critical' | 'warning' | 'notice' | 'info';

export interface AlertBadgeProps {
  level: AlertBadgeLevel;
  showDot?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelConfig: Record<AlertBadgeLevel, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  glowClass: string;
}> = {
  critical: {
    label: '严重',
    bgColor: 'bg-red-500/15',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    dotColor: 'bg-red-500',
    glowClass: 'shadow-glow-red',
  },
  warning: {
    label: '警告',
    bgColor: 'bg-orange-500/15',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    dotColor: 'bg-orange-500',
    glowClass: 'shadow-glow-orange',
  },
  notice: {
    label: '提醒',
    bgColor: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    glowClass: '',
  },
  info: {
    label: '信息',
    bgColor: 'bg-purple-500/15',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    glowClass: 'shadow-glow-purple',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    textSize: 'text-xs',
    dotSize: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    textSize: 'text-xs',
    dotSize: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    textSize: 'text-sm',
    dotSize: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  level,
  showDot = true,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        'backdrop-blur-sm',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizes.padding,
        sizes.textSize,
        sizes.gap,
        className,
      )}
    >
      {showDot && (
        <span className="relative flex-shrink-0">
          <span
            className={cn(
              'block rounded-full animate-pulse-breath',
              sizes.dotSize,
              config.dotColor,
            )}
          />
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-pulse-ring',
              config.dotColor,
              'opacity-40',
            )}
          />
        </span>
      )}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export const AlertBadgeLevelMap: Record<string, AlertBadgeLevel> = {
  red: 'critical',
  orange: 'warning',
  yellow: 'notice',
  blue: 'info',
};

export default AlertBadge;
