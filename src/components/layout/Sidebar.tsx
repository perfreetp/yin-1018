import React from 'react';
import {
  LayoutDashboard,
  Map,
  Car,
  Workflow,
  Leaf,
  AlertTriangle,
  FileBarChart,
  Monitor,
  User,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/overview', icon: LayoutDashboard, label: '总览' },
  { path: '/map', icon: Map, label: '地图' },
  { path: '/traffic', icon: Car, label: '交通' },
  { path: '/pipeline', icon: Workflow, label: '管网' },
  { path: '/environment', icon: Leaf, label: '环境' },
  { path: '/events', icon: AlertTriangle, label: '事件' },
  { path: '/reports', icon: FileBarChart, label: '报表' },
];

const shiftMap: Record<string, { label: string; color: string }> = {
  morning: { label: '早班', color: 'text-amber-400' },
  afternoon: { label: '中班', color: 'text-blue-400' },
  night: { label: '晚班', color: 'text-purple-400' },
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentRoute,
    sidebarCollapsed,
    bigScreenMode,
    currentDuty,
    toggleSidebar,
    toggleBigScreen,
    setCurrentRoute,
  } = useAppStore();

  const handleNavClick = (path: string) => {
    setCurrentRoute(path);
    navigate(path);
  };

  if (bigScreenMode) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-gradient-to-b from-space-900 via-space-800 to-space-900',
        'border-r border-tech-500/20 backdrop-blur-xl',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-[220px]',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-4 border-b border-tech-500/20',
          sidebarCollapsed ? 'justify-center px-2' : 'justify-start',
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tech-400 to-tech-600 flex items-center justify-center shadow-glow-blue">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-1 bg-tech-400/20 rounded-xl blur-md -z-10" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-base font-bold bg-gradient-to-r from-tech-300 to-tech-500 bg-clip-text text-transparent whitespace-nowrap">
              数字孪生城市
            </span>
            <span className="text-xs text-text-secondary mt-0.5 whitespace-nowrap">
              运行驾驶舱
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentRoute === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                'w-full group relative flex items-center gap-3 rounded-lg transition-all duration-200',
                'px-3 py-2.5',
                isActive
                  ? 'bg-gradient-to-r from-tech-500/20 to-tech-500/5 text-tech-300 shadow-glow-blue-sm'
                  : 'text-text-secondary hover:bg-tech-500/10 hover:text-tech-200',
                sidebarCollapsed && 'justify-center px-0',
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-tech-300 to-tech-500 shadow-glow-blue-sm" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  'group-hover:scale-110',
                  isActive && 'text-tech-300',
                )}
              />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-tech-500/20 p-3 space-y-2">
        <button
          onClick={toggleBigScreen}
          className={cn(
            'w-full flex items-center gap-2 rounded-lg px-3 py-2',
            'bg-tech-500/10 text-tech-300 hover:bg-tech-500/20 transition-all duration-200',
            'hover:shadow-glow-blue-sm',
            sidebarCollapsed && 'justify-center px-0',
          )}
        >
          <Monitor className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-xs font-medium">大屏模式</span>
          )}
        </button>

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 bg-space-700/50',
            sidebarCollapsed && 'justify-center px-0',
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tech-400 to-tech-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-text-primary truncate">
                {currentDuty.personName}
              </span>
              <span className={cn('text-xs', shiftMap[currentDuty.shift]?.color || 'text-text-secondary')}>
                {shiftMap[currentDuty.shift]?.label || '值班中'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-text-tertiary hover:text-tech-300 hover:bg-tech-500/10 transition-all duration-200"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <span className="text-xs">收起</span>
              <ChevronLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
