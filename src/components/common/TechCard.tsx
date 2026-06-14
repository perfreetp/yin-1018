import React from 'react';
import { cn } from '@/lib/utils';

export interface TechCardProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
  hoverable?: boolean;
  glow?: boolean;
}

export const TechCard: React.FC<TechCardProps> = ({
  title,
  icon,
  extra,
  children,
  className,
  headerClassName,
  bodyClassName,
  contentClassName,
  hoverable = true,
  glow = false,
}) => {
  const hasHeader = title || icon || extra;

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-space-800/50 backdrop-blur-md',
        'border border-tech-500/20',
        'shadow-card',
        hoverable && 'transition-all duration-300 hover:shadow-card-hover hover:border-tech-400/30',
        glow && 'shadow-glow-blue-sm',
        className,
      )}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tech-400/60 rounded-tl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-tech-400/60 rounded-tr z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-tech-400/60 rounded-bl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-tech-400/60 rounded-br z-10 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-400/40 to-transparent animate-flow-light" />
      </div>

      {hasHeader && (
        <div
          className={cn(
            'flex items-center justify-between px-5 py-3',
            'border-b border-tech-500/15',
            'bg-gradient-to-r from-space-700/60 to-transparent',
            headerClassName,
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-tech-500/20 to-tech-600/20 flex items-center justify-center text-tech-300 border border-tech-400/20">
                {icon}
              </div>
            )}
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-text-primary truncate">
                {title}
              </h3>
            ) : (
              title
            )}
          </div>
          {extra && <div className="flex-shrink-0 ml-4">{extra}</div>}
        </div>
      )}

      <div
        className={cn(
          'relative',
          bodyClassName,
        )}
      >
        <div
          className={cn(
            hasHeader ? 'p-5' : 'p-5',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default TechCard;
