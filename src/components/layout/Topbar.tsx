import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  Maximize,
  Minimize,
  Camera,
  PlaySquare,
  User,
  LogOut,
  Settings,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudSun,
  Home,
} from 'lucide-react';
import { Select, Dropdown, Avatar, Badge, Popover } from 'antd';
import { useAppStore } from '@/store/useAppStore';
import { useEventStore } from '@/store/useEventStore';
import { districts } from '@/mock/events';
import { cn } from '@/lib/utils';

const routeTitleMap: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: '运行总览', breadcrumb: ['首页', '总览'] },
  '/overview': { title: '运行总览', breadcrumb: ['首页', '总览'] },
  '/map': { title: '数字孪生地图', breadcrumb: ['首页', '地图'] },
  '/traffic': { title: '交通态势监测', breadcrumb: ['首页', '交通'] },
  '/pipeline': { title: '管网运行监测', breadcrumb: ['首页', '管网'] },
  '/environment': { title: '环境质量监测', breadcrumb: ['首页', '环境'] },
  '/events': { title: '事件处置中心', breadcrumb: ['首页', '事件'] },
  '/reports': { title: '数据报表分析', breadcrumb: ['首页', '报表'] },
};

const weatherIcons: Record<string, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
  partlyCloudy: CloudSun,
};

export const Topbar: React.FC = () => {
  const {
    currentRoute,
    selectedDistrict,
    setSelectedDistrict,
    currentDuty,
    bigScreenMode,
    carouselMode,
    startCarousel,
    stopCarousel,
  } = useAppStore();

  const { events } = useEventStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const routeInfo = routeTitleMap[currentRoute] || {
    title: '运行总览',
    breadcrumb: ['首页', '总览'],
  };

  const pendingEvents = events.filter(
    (e) => e.status === 'pending' || e.status === 'processing',
  ).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const formatTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return {
      date: `${year}年${month}月${day}日 星期${weekDay}`,
      time: `${hours}:${minutes}:${seconds}`,
    };
  };

  const { date, time } = formatTime(currentTime);
  const WeatherIcon = weatherIcons.partlyCloudy;

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User className="w-4 h-4" />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: '系统设置',
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: '退出登录',
      danger: true,
    },
  ];

  const notifications = [
    {
      id: 1,
      title: '新的告警事件',
      content: '中央商务区发生交通拥堵',
      time: '2分钟前',
      level: 'warning',
    },
    {
      id: 2,
      title: '管网异常',
      content: '东区管网压力异常升高',
      time: '5分钟前',
      level: 'critical',
    },
    {
      id: 3,
      title: '环境监测提醒',
      content: '工业园区PM2.5超过阈值',
      time: '12分钟前',
      level: 'notice',
    },
  ];

  return (
    <header
      className={cn(
        'h-16 flex items-center justify-between px-6 z-30',
        'bg-space-900/80 backdrop-blur-xl border-b border-tech-500/20',
        bigScreenMode && 'h-12 px-4',
      )}
    >
      <div className="flex items-center gap-6 min-w-0">
        <div className="flex items-center gap-2 text-text-secondary min-w-0">
          <Home className="w-4 h-4 flex-shrink-0" />
          {routeInfo.breadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="text-tech-400">/</span>
              <span
                className={cn(
                  'text-sm whitespace-nowrap',
                  idx === routeInfo.breadcrumb.length - 1
                    ? 'text-tech-300 font-medium'
                    : 'text-text-secondary',
                )}
              >
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-lg font-semibold text-text-primary whitespace-nowrap flex-shrink-0">
          {routeInfo.title}
        </h1>
      </div>

      {!bigScreenMode && (
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="搜索事件、区域、设备..."
              className="w-full h-9 pl-10 pr-4 rounded-lg bg-space-800/60 border border-tech-500/20 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-tech-400/50 focus:shadow-glow-blue-sm transition-all duration-200"
            />
          </div>
          <Select
            value={selectedDistrict?.id}
            onChange={(val) => {
              const dist = districts.find((d) => d.id === val);
              setSelectedDistrict(dist || null);
            }}
            style={{ width: 160 }}
            options={districts.map((d) => ({
              value: d.id,
              label: d.name,
            }))}
            placeholder="选择区域"
            variant="borderless"
            className="!bg-space-800/60 !rounded-lg !border !border-tech-500/20"
            suffixIcon={
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            }
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {!bigScreenMode && (
          <>
            <div className="flex items-center gap-4 pr-4 border-r border-tech-500/20">
              <div className="flex items-center gap-2">
                <WeatherIcon className="w-5 h-5 text-amber-400" />
                <span className="text-lg font-semibold text-text-primary font-mono">
                  26°C
                </span>
              </div>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-text-primary font-mono">
                  {time}
                </span>
                <span className="text-xs text-text-secondary">{date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-text-secondary hover:text-tech-300 hover:bg-tech-500/10 transition-all duration-200"
                title="全屏"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
              <button
                className="p-2 rounded-lg text-text-secondary hover:text-tech-300 hover:bg-tech-500/10 transition-all duration-200"
                title="截图"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  carouselMode.enabled ? stopCarousel() : startCarousel()
                }
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  carouselMode.enabled
                    ? 'text-tech-300 bg-tech-500/20 shadow-glow-blue-sm'
                    : 'text-text-secondary hover:text-tech-300 hover:bg-tech-500/10',
                )}
                title={carouselMode.enabled ? '停止轮播' : '大屏轮播'}
              >
                <PlaySquare className="w-4 h-4" />
              </button>

              <Popover
                content={
                  <div className="w-80">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-tech-500/20">
                      <span className="font-medium text-text-primary">
                        消息通知
                      </span>
                      <span className="text-xs text-tech-400 cursor-pointer hover:text-tech-300">
                        全部已读
                      </span>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 rounded-lg bg-space-800/60 hover:bg-space-700/60 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">
                              {n.title}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-1">
                            {n.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                }
                trigger="click"
                placement="bottomRight"
              >
                <button className="p-2 rounded-lg text-text-secondary hover:text-tech-300 hover:bg-tech-500/10 transition-all duration-200 relative">
                  <Badge count={pendingEvents} size="small" offset={[-2, 2]}>
                    <Bell className="w-4 h-4" />
                  </Badge>
                </button>
              </Popover>
            </div>
          </>
        )}

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="flex items-center gap-2 pl-2 cursor-pointer hover:bg-tech-500/10 rounded-lg p-1 pr-3 transition-all duration-200">
            <Avatar
              size={bigScreenMode ? 28 : 32}
              className="bg-gradient-to-br from-tech-400 to-tech-600 flex items-center justify-center"
              icon={<User className="w-4 h-4" />}
            />
            {!bigScreenMode && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-text-primary">
                  {currentDuty.personName}
                </span>
                <span className="text-xs text-text-tertiary">
                  {currentDuty.phone}
                </span>
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;
