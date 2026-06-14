import React from 'react';
import {
  MapPin,
  Clock,
  Eye,
  Send,
  MoreHorizontal,
} from 'lucide-react';
import type { EventItem } from '@/types';
import { AlertBadge, AlertBadgeLevelMap } from './AlertBadge';
import { StatusTag } from './StatusTag';
import { cn } from '@/lib/utils';
import { useEventStore } from '@/store/useEventStore';

export interface EventCardProps {
  event: EventItem;
  compact?: boolean;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  compact = false,
  className,
}) => {
  const { openEventModal, dispatchEvent } = useEventStore();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEventModal(event);
  };

  const handleDispatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchEvent(event.id, '默认处置部门', '系统');
  };

  const formatTime = (time: Date | string) => {
    const date = new Date(time);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  const getProgressPercent = () => {
    const totalSteps = 4;
    const completedSteps = event.progress.filter((p) => p.completed).length;
    return Math.min((completedSteps / totalSteps) * 100, 100);
  };

  const progressPercent = getProgressPercent();
  const alertLevel = AlertBadgeLevelMap[event.level] || 'info';

  if (compact) {
    return (
      <div
        onClick={() => openEventModal(event)}
        className={cn(
          'group relative rounded-lg p-3 cursor-pointer',
          'bg-space-800/40 backdrop-blur-sm border border-tech-500/15',
          'hover:border-tech-400/40 hover:bg-space-700/50',
          'transition-all duration-200',
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <AlertBadge level={alertLevel} size="sm" showLabel={false} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-text-primary truncate mb-1">
              {event.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(event.reportTime)}
              </span>
              <StatusTag status={event.status} size="sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => openEventModal(event)}
      className={cn(
        'group relative rounded-xl overflow-hidden cursor-pointer',
        'bg-space-800/50 backdrop-blur-md border border-tech-500/20',
        'hover:shadow-card-hover hover:border-tech-400/30',
        'transition-all duration-300',
        className,
      )}
    >
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-tech-400/40 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-tech-400/40 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-tech-400/40 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-tech-400/40 rounded-br pointer-events-none" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertBadge level={alertLevel} />
            <StatusTag status={event.status} />
          </div>
          <button
            className="p-1 rounded text-text-tertiary hover:text-tech-300 hover:bg-tech-500/10 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <h4 className="text-base font-semibold text-text-primary mb-2 group-hover:text-tech-300 transition-colors line-clamp-1">
          {event.title}
        </h4>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-tech-400" />
            <span className="truncate max-w-[180px]">{event.location.address}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-tech-400" />
            {formatTime(event.reportTime)}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">处置进度</span>
            <span className="text-tech-300 font-mono font-medium">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-space-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tech-500 to-tech-300 transition-all duration-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 animate-flow-light bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-tech-500/15 text-tech-300 text-sm font-medium hover:bg-tech-500/25 transition-all border border-tech-500/20 hover:border-tech-400/40"
          >
            <Eye className="w-4 h-4" />
            查看详情
          </button>
          {event.status === 'pending' && (
            <button
              onClick={handleDispatch}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-tech-500 to-tech-600 text-white text-sm font-medium hover:from-tech-400 hover:to-tech-500 transition-all shadow-glow-blue-sm"
            >
              <Send className="w-4 h-4" />
              立即派发
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
