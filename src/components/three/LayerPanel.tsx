import { useState } from 'react';
import { Drawer, Switch, Divider, Button, Space, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BuildOutlined,
  CarOutlined,
  NodeIndexOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  FireOutlined,
  DashboardOutlined,
  RadarChartOutlined,
  VideoCameraOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
} from '@ant-design/icons';
import { useMapStore } from '@/store/useMapStore';
import type { LayerType } from '@/types';

interface LayerItem {
  key: LayerType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const baseLayers: LayerItem[] = [
  { key: 'buildings', label: '建筑图层', icon: <BuildOutlined />, color: '#4A90D9' },
  { key: 'roads', label: '道路图层', icon: <CarOutlined />, color: '#FFB74D' },
  { key: 'water', label: '水系图层', icon: <NodeIndexOutlined />, color: '#4FC3F7' },
  { key: 'vegetation', label: '植被图层', icon: <EnvironmentOutlined />, color: '#81C784' },
  { key: 'poi', label: 'POI图层', icon: <ShopOutlined />, color: '#BA68C8' },
];

const themeLayers: LayerItem[] = [
  { key: 'traffic', label: '交通热力', icon: <FireOutlined />, color: '#FF7043' },
  { key: 'pipeline', label: '管网监测', icon: <DashboardOutlined />, color: '#26C6DA' },
  { key: 'environment', label: '环境站点', icon: <RadarChartOutlined />, color: '#AED581' },
  { key: 'video', label: '视频点位', icon: <VideoCameraOutlined />, color: '#7986CB' },
];

export default function LayerPanel() {
  const [open, setOpen] = useState(false);
  const { activeLayers, toggleLayer, enableAllLayers, disableAllLayers } = useMapStore();

  const renderLayerItem = (item: LayerItem) => (
    <div
      key={item.key}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 4px',
        borderRadius: '6px',
        transition: 'background 0.2s',
        background: activeLayers[item.key] ? 'rgba(79, 195, 247, 0.08)' : 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${item.color}22`,
            color: item.color,
            fontSize: '16px',
          }}
        >
          {item.icon}
        </span>
        <span
          style={{
            color: activeLayers[item.key] ? '#E0F7FA' : '#90A4AE',
            fontWeight: 500,
            fontSize: '14px',
          }}
        >
          {item.label}
        </span>
      </div>
      <Switch
        size="small"
        checked={activeLayers[item.key]}
        onChange={() => toggleLayer(item.key)}
        style={{
          background: activeLayers[item.key] ? item.color : undefined,
        }}
      />
    </div>
  );

  return (
    <>
      <Tooltip title="图层控制" placement="left">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<AppstoreOutlined style={{ fontSize: '18px' }} />}
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            zIndex: 50,
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
            boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E0F7FA' }}>
            <AppstoreOutlined style={{ color: '#4FC3F7', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>图层控制面板</span>
          </div>
        }
        placement="right"
        width={340}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          header: {
            background: 'linear-gradient(135deg, #0D2137, #1A3A5C)',
            borderBottom: '1px solid rgba(79, 195, 247, 0.2)',
          },
          body: {
            background: 'linear-gradient(180deg, #0A1628 0%, #0D2137 100%)',
            padding: '16px 20px',
          },
          content: {
            background: 'transparent',
          },
          mask: {
            background: 'rgba(0,0,0,0.3)',
          },
        }}
        extra={
          <Space size="small">
            <Tooltip title="全部开启">
              <Button
                type="text"
                size="small"
                icon={<CheckSquareOutlined />}
                onClick={enableAllLayers}
                style={{ color: '#81C784' }}
              />
            </Tooltip>
            <Tooltip title="全部关闭">
              <Button
                type="text"
                size="small"
                icon={<CloseSquareOutlined />}
                onClick={disableAllLayers}
                style={{ color: '#E57373' }}
              />
            </Tooltip>
          </Space>
        }
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: '#4FC3F7',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span
              style={{
                width: '3px',
                height: '14px',
                borderRadius: '2px',
                background: '#4FC3F7',
              }}
            />
            基础图层
          </div>
          <div
            style={{
              background: 'rgba(13, 33, 55, 0.6)',
              borderRadius: '10px',
              padding: '8px 12px',
              border: '1px solid rgba(79, 195, 247, 0.1)',
            }}
          >
            {baseLayers.map(renderLayerItem)}
          </div>
        </div>

        <Divider style={{ borderColor: 'rgba(79, 195, 247, 0.15)', margin: '20px 0 12px' }} />

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: '#FFB74D',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <span
              style={{
                width: '3px',
                height: '14px',
                borderRadius: '2px',
                background: '#FFB74D',
              }}
            />
            专题图层
          </div>
          <div
            style={{
              background: 'rgba(13, 33, 55, 0.6)',
              borderRadius: '10px',
              padding: '8px 12px',
              border: '1px solid rgba(255, 183, 77, 0.1)',
            }}
          >
            {themeLayers.map(renderLayerItem)}
          </div>
        </div>

        <Divider style={{ borderColor: 'rgba(79, 195, 247, 0.15)', margin: '20px 0 12px' }} />

        <div
          style={{
            background: 'rgba(79, 195, 247, 0.06)',
            borderRadius: '8px',
            padding: '12px 14px',
            border: '1px solid rgba(79, 195, 247, 0.15)',
          }}
        >
          <div style={{ color: '#90A4AE', fontSize: '12px', marginBottom: '8px' }}>
            图层统计
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#4FC3F7', fontSize: '20px', fontWeight: 700 }}>
                {Object.values(activeLayers).filter(Boolean).length}
              </div>
              <div style={{ color: '#78909C', fontSize: '11px', marginTop: '2px' }}>
                已开启
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#78909C', fontSize: '20px', fontWeight: 700 }}>
                {Object.keys(activeLayers).length - Object.values(activeLayers).filter(Boolean).length}
              </div>
              <div style={{ color: '#78909C', fontSize: '11px', marginTop: '2px' }}>
                已关闭
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#81C784', fontSize: '20px', fontWeight: 700 }}>
                {Object.keys(activeLayers).length}
              </div>
              <div style={{ color: '#78909C', fontSize: '11px', marginTop: '2px' }}>
                总图层
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
