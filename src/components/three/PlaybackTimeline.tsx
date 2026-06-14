import { useState, useMemo } from 'react';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ForwardOutlined,
  BackwardOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Button, Slider, Dropdown, Tooltip, Badge, Space, Popover } from 'antd';
import { useMapStore } from '@/store/useMapStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const SPEED_OPTIONS = [0.5, 1, 2, 4, 8];

const SNAPSHOTS = [
  { id: 1, time: '08:00', label: '早高峰前' },
  { id: 2, time: '09:30', label: '早高峰' },
  { id: 3, time: '12:00', label: '午间' },
  { id: 4, time: '18:00', label: '晚高峰' },
  { id: 5, time: '21:00', label: '夜间' },
  { id: 6, time: '23:00', label: '深夜' },
];

export default function PlaybackTimeline() {
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    setTime,
    togglePlayback,
    setPlaybackSpeed,
  } = useMapStore();

  const [showHistory, setShowHistory] = useState(false);

  const startTime = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentTime]);

  const endTime = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [currentTime]);

  const currentMinutes = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  const totalMinutes = 24 * 60;

  const handleSliderChange = (value: number) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    const newTime = new Date(currentTime);
    newTime.setHours(hours, minutes, 0, 0);
    setTime(newTime);
  };

  const handleSnapshotClick = (snapshot: typeof SNAPSHOTS[number]) => {
    const [h, m] = snapshot.time.split(':').map(Number);
    const newTime = new Date(currentTime);
    newTime.setHours(h, m, 0, 0);
    setTime(newTime);
  };

  const handleStep = (direction: 'forward' | 'backward') => {
    const step = 10 * 60 * 1000;
    const newTime = new Date(currentTime.getTime() + (direction === 'forward' ? step : -step));
    setTime(newTime);
  };

  const marks = useMemo(() => {
    const result: Record<number, { style: React.CSSProperties; label: React.ReactNode }> = {};
    for (let h = 0; h <= 24; h += 4) {
      result[h * 60] = {
        style: { color: '#4FC3F7' },
        label: (
          <span style={{ color: '#78909C', fontSize: '11px' }}>
            {String(h).padStart(2, '0')}:00
          </span>
        ),
      };
    }
    return result;
  }, []);

  const speedMenu = {
    items: SPEED_OPTIONS.map((speed) => ({
      key: String(speed),
      label: (
        <span style={{ color: playbackSpeed === speed ? '#4FC3F7' : '#E0F7FA' }}>
          {speed}x
        </span>
      ),
      onClick: () => setPlaybackSpeed(speed),
    })),
  };

  const historyContent = (
    <div style={{ width: '280px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#4FC3F7',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <CameraOutlined /> 历史快照
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {SNAPSHOTS.map((snap) => (
          <div
            key={snap.id}
            onClick={() => handleSnapshotClick(snap)}
            style={{
              background: 'rgba(13, 33, 55, 0.8)',
              borderRadius: '8px',
              padding: '10px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid rgba(79, 195, 247, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(79, 195, 247, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(79, 195, 247, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(13, 33, 55, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(79, 195, 247, 0.15)';
            }}
          >
            <div style={{ color: '#4FC3F7', fontSize: '16px', fontWeight: 700 }}>
              {snap.time}
            </div>
            <div style={{ color: '#90A4AE', fontSize: '12px', marginTop: '2px' }}>
              {snap.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '20px',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'calc(100% - 80px)',
        maxWidth: '1000px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(10, 22, 40, 0.9) 0%, rgba(13, 33, 55, 0.95) 100%)',
          borderRadius: '16px',
          padding: '16px 24px',
          border: '1px solid rgba(79, 195, 247, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(79, 195, 247, 0.1) inset',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(79, 195, 247, 0.1)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(79, 195, 247, 0.2)',
              }}
            >
              <ClockCircleOutlined style={{ color: '#4FC3F7', fontSize: '16px' }} />
              <span style={{ color: '#E0F7FA', fontSize: '18px', fontWeight: 700, fontFamily: 'monospace' }}>
                {format(currentTime, 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}
              </span>
              {isPlaying && (
                <Badge status="processing" text={<span style={{ color: '#81C784', fontSize: '12px' }}>回放中</span>} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Popover
              content={historyContent}
              title={null}
              trigger="click"
              open={showHistory}
              onOpenChange={setShowHistory}
              placement="topRight"
              overlayInnerStyle={{
                background: 'linear-gradient(180deg, #0A1628 0%, #0D2137 100%)',
                border: '1px solid rgba(79, 195, 247, 0.2)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <Tooltip title="历史快照">
                <Button
                  type="text"
                  icon={<HistoryOutlined />}
                  style={{ color: '#FFB74D' }}
                >
                  <span style={{ fontSize: '13px' }}>快照</span>
                </Button>
              </Tooltip>
            </Popover>

            <Dropdown menu={speedMenu} placement="topRight" trigger={['click']}>
              <Tooltip title="回放倍速">
                <Button
                  type="text"
                  icon={<ForwardOutlined />}
                  style={{ color: '#BA68C8' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{playbackSpeed}x</span>
                </Button>
              </Tooltip>
            </Dropdown>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Space size={4}>
            <Tooltip title="后退10分钟">
              <Button
                type="text"
                shape="circle"
                icon={<BackwardOutlined />}
                onClick={() => handleStep('backward')}
                style={{
                  color: '#78909C',
                  width: '36px',
                  height: '36px',
                  fontSize: '16px',
                }}
              />
            </Tooltip>

            <Tooltip title={isPlaying ? '暂停' : '播放'}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={
                  isPlaying ? (
                    <PauseCircleOutlined style={{ fontSize: '24px' }} />
                  ) : (
                    <PlayCircleOutlined style={{ fontSize: '24px' }} />
                  )
                }
                onClick={togglePlayback}
                style={{
                  width: '48px',
                  height: '48px',
                  background: isPlaying
                    ? 'linear-gradient(135deg, #FF7043, #FF8A65)'
                    : 'linear-gradient(135deg, #1976D2, #42A5F5)',
                  boxShadow: isPlaying
                    ? '0 4px 20px rgba(255, 112, 67, 0.4)'
                    : '0 4px 20px rgba(25, 118, 210, 0.4)',
                  border: 'none',
                }}
              />
            </Tooltip>

            <Tooltip title="前进10分钟">
              <Button
                type="text"
                shape="circle"
                icon={<ForwardOutlined />}
                onClick={() => handleStep('forward')}
                style={{
                  color: '#78909C',
                  width: '36px',
                  height: '36px',
                  fontSize: '16px',
                }}
              />
            </Tooltip>
          </Space>

          <div style={{ flex: 1, padding: '0 8px' }}>
            <Slider
              min={0}
              max={totalMinutes}
              step={1}
              value={currentMinutes}
              onChange={handleSliderChange}
              marks={marks}
              tooltip={{
                formatter: (value) => {
                  if (value === undefined) return '';
                  const h = Math.floor(value / 60);
                  const m = value % 60;
                  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                },
              }}
              styles={{
                track: {
                  background: 'linear-gradient(90deg, #1976D2, #4FC3F7)',
                  height: '6px',
                },
                rail: {
                  background: 'rgba(79, 195, 247, 0.15)',
                  height: '6px',
                },
                handle: {
                  width: '18px',
                  height: '18px',
                  background: '#4FC3F7',
                  borderColor: '#fff',
                  borderWidth: '3px',
                  boxShadow: '0 2px 12px rgba(79, 195, 247, 0.5)',
                  insetInlineStart: '-2px',
                },
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            padding: '0 60px',
          }}
        >
          {SNAPSHOTS.map((snap) => (
            <Tooltip key={snap.id} title={`${snap.time} ${snap.label}`}>
              <div
                onClick={() => handleSnapshotClick(snap)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(79, 195, 247, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4FC3F7', margin: '0 auto 3px' }} />
                <span style={{ color: '#78909C', fontSize: '10px' }}>{snap.time}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
