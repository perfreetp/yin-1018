import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from '@/components/layout/MainLayout';
import Overview from '@/pages/Overview';
import Map3D from '@/pages/Map3D';
import Traffic from '@/pages/Traffic';
import Pipeline from '@/pages/Pipeline';
import Environment from '@/pages/Environment';
import Events from '@/pages/Events';
import Reports from '@/pages/Reports';
import { useAppStore } from '@/store/useAppStore';

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
            <Route path="/overview" element={<Overview />} />
            <Route path="/map" element={<Map3D />} />
            <Route path="/traffic" element={<Traffic />} />
            <Route path="/pipeline" element={<Pipeline />} />
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
