import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import Environment from '@/pages/Environment';
import Events from '@/pages/Events';
import Reports from '@/pages/Reports';
import { useAppStore } from '@/store/useAppStore';

const OverviewPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🏙️</div>
        <h1 className="text-3xl font-bold text-text-primary">总览驾驶舱</h1>
        <p className="text-text-secondary max-w-md">
          欢迎来到数字孪生城市运行驾驶舱。总览页面正在规划中，将提供城市运行的全局态势感知。
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="px-4 py-2 rounded-lg bg-space-800/60 border border-tech-500/20 text-sm text-text-secondary">
            请从左侧菜单进入各功能模块
          </div>
        </div>
      </div>
    </div>
  );
};

const MapPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-3xl font-bold text-text-primary">三维地图</h1>
        <p className="text-text-secondary max-w-md">
          基于 Three.js 的数字孪生三维场景，可展示建筑、道路、水系、管网等城市要素。
        </p>
      </div>
    </div>
  );
};

const TrafficPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🚦</div>
        <h1 className="text-3xl font-bold text-text-primary">交通态势</h1>
        <p className="text-text-secondary max-w-md">
          实时交通流量监测、拥堵路段预警、路口信号灯联动管理。
        </p>
      </div>
    </div>
  );
};

const PipelinePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-text-primary">管线管理</h1>
        <p className="text-text-secondary max-w-md">
          地下管网可视化监测，供水、排水、燃气、电力管线的运行状态与预警。
        </p>
      </div>
    </div>
  );
};

const RouteTracker: React.FC = () => {
  const location = useLocation();
  const { setCurrentRoute } = useAppStore();

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname, setCurrentRoute]);

  return null;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d4ff',
          colorInfo: '#00d4ff',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorBgBase: '#0a0f1c',
          colorBgContainer: '#111827',
          colorBgElevated: '#1e293b',
          colorBgLayout: '#0a0f1c',
          colorBorder: 'rgba(0, 212, 255, 0.15)',
          colorBorderSecondary: 'rgba(0, 212, 255, 0.08)',
          colorText: '#e2e8f0',
          colorTextSecondary: '#94a3b8',
          colorTextTertiary: '#64748b',
          colorTextQuaternary: '#475569',
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          fontSize: 14,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
          controlHeight: 36,
          controlHeightLG: 40,
          controlHeightSM: 28,
        },
        components: {
          Button: {
            colorPrimary: '#00d4ff',
            colorPrimaryHover: '#40e0ff',
            colorPrimaryActive: '#00b8db',
            algorithm: true,
          },
          Select: {
            colorBgContainer: '#1e293b',
            colorBorder: 'rgba(0, 212, 255, 0.2)',
            algorithm: true,
          },
          Input: {
            colorBgContainer: '#1e293b',
            colorBorder: 'rgba(0, 212, 255, 0.2)',
            colorBgContainerDisabled: '#1e293b',
            algorithm: true,
          },
          Table: {
            colorBgContainer: 'transparent',
            colorBorderSecondary: 'rgba(0, 212, 255, 0.08)',
            headerBg: 'rgba(0, 212, 255, 0.05)',
            algorithm: true,
          },
          Tabs: {
            colorBorderSecondary: 'rgba(0, 212, 255, 0.1)',
            itemSelectedColor: '#00d4ff',
            inkBarColor: '#00d4ff',
            algorithm: true,
          },
          Modal: {
            colorBgElevated: '#0f1f38',
            colorBorder: 'rgba(0, 212, 255, 0.2)',
            algorithm: true,
          },
          Card: {
            colorBgContainer: '#111827',
            colorBorderSecondary: 'rgba(0, 212, 255, 0.1)',
            algorithm: true,
          },
          Pagination: {
            colorPrimary: '#00d4ff',
            colorBgContainer: '#1e293b',
            algorithm: true,
          },
          DatePicker: {
            colorBgContainer: '#1e293b',
            colorBorder: 'rgba(0, 212, 255, 0.2)',
            algorithm: true,
          },
          Tag: {
            colorBorder: 'rgba(0, 212, 255, 0.2)',
            algorithm: true,
          },
          Steps: {
            colorPrimary: '#00d4ff',
            colorSplit: 'rgba(0, 212, 255, 0.15)',
            algorithm: true,
          },
          Checkbox: {
            colorPrimary: '#00d4ff',
            colorBgContainer: '#1e293b',
            algorithm: true,
          },
          Radio: {
            colorPrimary: '#00d4ff',
            colorBgContainer: '#1e293b',
            algorithm: true,
          },
          Dropdown: {
            colorBgElevated: '#1e293b',
            colorBorderSecondary: 'rgba(0, 212, 255, 0.15)',
            algorithm: true,
          },
          Progress: {
            colorPrimary: '#00d4ff',
            algorithm: true,
          },
          Divider: {
            colorSplit: 'rgba(0, 212, 255, 0.1)',
            algorithm: true,
          },
        },
      }}
    >
      <BrowserRouter>
        <RouteTracker />
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route element={<MainLayout />}>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/traffic" element={<TrafficPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/environment" element={<Environment />} />
            <Route path="/events" element={<Events />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
