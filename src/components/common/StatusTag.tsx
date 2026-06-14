import React from 'react';
import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';

export type StatusTagStatus = EventStatus | 'pending' | 'processing' | 'dispatched' | 'resolved' | 'closed';

export interface StatusTagProps {
  status: StatusTagStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<StatusTagStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  pending: {
    label: '待派发',
    bgColor: 'bg-slate-500/15',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-500/30',
    dotColor: 'bg-slate-400',
  },
  dispatched: {
    label: '已派发',
    bgColor: 'bg-blue-500/15',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    dotColor: 'bg-blue-500',
  },
  processing: {
    label: '处置中',
    bgColor: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
  },
  resolved: {
    label: '已解决',
    bgColor: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
  },
  closed: {
    label: '已结案',
    bgColor: 'bg-gray-500/15',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    dotColor: 'bg-gray-400',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    textSize: 'text-[11px]',
    dotSize: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    textSize: 'text-xs',
    dotSize: 'w-2 h-2',
    gap: 'gap-1.5',
  },
};

export const StatusTag: React.FC<StatusTagProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const config = statusConfig[status] || statusConfig.pending;
  const sizes = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
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
      <span
        className={cn(
          'flex-shrink-0 rounded-full',
          sizes.dotSize,
          config.dotColor,
          (status === 'processing' || status === 'dispatched') && 'animate-pulse',
        )}
      />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusTag;
