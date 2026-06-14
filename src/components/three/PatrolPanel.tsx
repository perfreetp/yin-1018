import { useState, useEffect, useRef } from 'react';
import {
  BranchesOutlined,
  PlusOutlined,
  DeleteOutlined,
  AimOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  CameraOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Drawer, Button, Select, List, Avatar, Tooltip, Modal, Form, Input, message, Space, Tag, InputNumber } from 'antd';
import { useMapStore, type PatrolPoint, type PatrolRoute } from '@/store/useMapStore';
import type { CameraPosition, CameraTarget } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { Option } = Select;

function getColorForIndex(index: number): string {
  const colors = ['#4FC3F7', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65', '#4DD0E1'];
  return colors[index % colors.length];
}

export default function PatrolPanel() {
  const [open, setOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [routeForm] = Form.useForm();
  const [pointForm] = Form.useForm();
  const stayTimerRef = useRef<number | null>(null);
  const stayStartRef = useRef<number>(0);

  const {
    patrolRoutes,
    currentPatrolRouteId,
    patrolPlayStatus,
    patrolCurrentPointIndex,
    patrolPaused,
    patrolStayRemaining,
    cameraPosition,
    cameraTarget,
    addPatrolRoute,
    deletePatrolRoute,
    addPatrolPoint,
    removePatrolPoint,
    setCurrentPatrolRoute,
    startPatrol,
    pausePatrol,
    resumePatrol,
    stopPatrol,
    advancePatrolToNext,
    setPatrolStayRemaining,
    flyToPosition,
  } = useMapStore();

  const currentRoute = patrolRoutes.find((r) => r.id === currentPatrolRouteId) || null;
  const totalPoints = currentRoute?.points.length || 0;
  const displayIndex = patrolPlayStatus === 'idle' ? 0 : patrolCurrentPointIndex + 1;

  useEffect(() => {
    return () => {
      if (stayTimerRef.current) {
        window.clearTimeout(stayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (patrolPlayStatus === 'staying' && !patrolPaused && currentRoute) {
      const currentPoint = currentRoute.points[patrolCurrentPointIndex];
      if (currentPoint) {
        stayStartRef.current = Date.now();
        const remaining = patrolStayRemaining > 0 ? patrolStayRemaining : currentPoint.stayDuration;
        setPatrolStayRemaining(remaining);
        if (stayTimerRef.current) {
          window.clearTimeout(stayTimerRef.current);
        }
        stayTimerRef.current = window.setTimeout(() => {
          advancePatrolToNext();
        }, remaining);
      }
    } else if (patrolPaused && patrolPlayStatus === 'paused') {
      if (stayTimerRef.current) {
        window.clearTimeout(stayTimerRef.current);
        const elapsed = Date.now() - stayStartRef.current;
        const newRemaining = Math.max(0, patrolStayRemaining - elapsed);
        setPatrolStayRemaining(newRemaining);
      }
    } else if (patrolPlayStatus === 'idle') {
      if (stayTimerRef.current) {
        window.clearTimeout(stayTimerRef.current);
        stayTimerRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrolPlayStatus, patrolPaused, patrolCurrentPointIndex]);

  const handleCreateRoute = async () => {
    try {
      const values = await routeForm.validateFields();
      addPatrolRoute(values.name);
      message.success(`已创建路线「${values.name}」`);
      setRouteModalOpen(false);
      routeForm.resetFields();
    } catch {
      // validation error
    }
  };

  const handleAddCurrentView = () => {
    if (!currentPatrolRouteId) {
      message.warning('请先选择一条路线');
      return;
    }
    pointForm.resetFields();
    pointForm.setFieldsValue({
      name: `巡检点${(currentRoute?.points.length || 0) + 1}`,
      stayDuration: 3000,
    });
    setPointModalOpen(true);
  };

  const handleConfirmAddPoint = async () => {
    try {
      const values = await pointForm.validateFields();
      const point: Omit<PatrolPoint, 'id'> = {
        name: values.name,
        position: { ...cameraPosition } as CameraPosition,
        target: { ...cameraTarget } as CameraTarget,
        stayDuration: values.stayDuration,
      };
      addPatrolPoint(currentPatrolRouteId!, point);
      message.success(`已添加巡检点「${values.name}」`);
      setPointModalOpen(false);
    } catch {
      // validation error
    }
  };

  const handleFlyToPoint = (point: PatrolPoint) => {
    flyToPosition({
      position: point.position,
      target: point.target,
      duration: 1500,
    });
    message.success(`已飞行至「${point.name}」`);
  };

  const handleDeletePoint = (point: PatrolPoint) => {
    if (!currentPatrolRouteId) return;
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除巡检点「${point.name}」吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        removePatrolPoint(currentPatrolRouteId, point.id);
        message.success(`已删除「${point.name}」`);
      },
    });
  };

  const handleDeleteRoute = (route: PatrolRoute) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除路线「${route.name}」吗？此操作无法撤销。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deletePatrolRoute(route.id);
        message.success(`已删除「${route.name}」`);
      },
    });
  };

  const handlePrevPoint = () => {
    if (!currentRoute || patrolCurrentPointIndex <= 0) return;
    const prevIndex = patrolCurrentPointIndex - 1;
    const prevPoint = currentRoute.points[prevIndex];
    if (prevPoint) {
      flyToPosition({
        position: prevPoint.position,
        target: prevPoint.target,
        duration: 1500,
      });
    }
  };

  const handleNextPoint = () => {
    advancePatrolToNext();
  };

  const getStatusText = () => {
    switch (patrolPlayStatus) {
      case 'flying':
        return `正在飞行到第 ${patrolCurrentPointIndex + 1} 点`;
      case 'staying':
        const remainingSec = Math.ceil(patrolStayRemaining / 1000);
        return `正在停留观察（${remainingSec}s）`;
      case 'paused':
        return '已暂停';
      case 'idle':
      default:
        return '待机中';
    }
  };

  const getStatusColor = () => {
    switch (patrolPlayStatus) {
      case 'flying':
        return '#4FC3F7';
      case 'staying':
        return '#81C784';
      case 'paused':
        return '#FFB74D';
      case 'idle':
      default:
        return '#A1887F';
    }
  };

  return (
    <>
      <Tooltip title="值班巡检" placement="left">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<BranchesOutlined style={{ fontSize: '18px' }} />}
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            right: '20px',
            top: '140px',
            zIndex: 50,
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #0288D1, #4FC3F7)',
            boxShadow: '0 4px 20px rgba(2, 136, 209, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E1F5FE' }}>
            <BranchesOutlined style={{ color: '#4FC3F7', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>值班巡检路线</span>
            <Tag color="blue" style={{ marginLeft: '8px', borderRadius: '10px' }}>
              {patrolRoutes.length} 条路线
            </Tag>
          </div>
        }
        placement="right"
        width={380}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          header: {
            background: 'linear-gradient(135deg, #01579B, #0288D1)',
            borderBottom: '1px solid rgba(79, 195, 247, 0.2)',
          },
          body: {
            background: 'linear-gradient(180deg, #0A1929 0%, #0D2137 100%)',
            padding: '12px 16px 20px',
          },
          content: {
            background: 'transparent',
          },
          mask: {
            background: 'rgba(0,0,0,0.3)',
          },
        }}
        extra={
          <Tooltip title="新建路线">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                routeForm.resetFields();
                setRouteModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #0288D1, #4FC3F7)',
                border: 'none',
                boxShadow: '0 2px 8px rgba(2, 136, 209, 0.3)',
              }}
            >
              <span style={{ fontSize: '12px' }}>新建路线</span>
            </Button>
          </Tooltip>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <SafetyOutlined style={{ color: '#4FC3F7' }} />
            <span style={{ fontSize: '12px', color: '#81D4FA', fontWeight: 600 }}>选择巡检路线</span>
          </div>
          <Select
            value={currentPatrolRouteId}
            onChange={(value) => setCurrentPatrolRoute(value)}
            placeholder="请选择巡检路线"
            style={{ width: '100%' }}
            size="large"
            allowClear
            options={patrolRoutes.map((r) => ({
              value: r.id,
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{r.name}</span>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {r.points.length} 点
                  </Tag>
                </div>
              ),
            }))}
          />
        </div>

        {currentRoute && (
          <>
            <div
              style={{
                marginBottom: '16px',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.1), rgba(79, 195, 247, 0.05))',
                border: '1px solid rgba(79, 195, 247, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: '#E1F5FE', fontWeight: 600, fontSize: '14px' }}>{currentRoute.name}</span>
                    <Tag color="blue" style={{ margin: 0 }}>{currentRoute.points.length} 巡检点</Tag>
                  </div>
                  <div style={{ color: '#4FC3F7', fontSize: '11px' }}>
                    创建于 {format(new Date(currentRoute.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteRoute(currentRoute)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getStatusColor(),
                    boxShadow: `0 0 8px ${getStatusColor()}`,
                  }}
                />
                <span style={{ color: getStatusColor(), fontSize: '13px', fontWeight: 500 }}>
                  {getStatusText()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                <Button
                  type="text"
                  icon={<StepBackwardOutlined />}
                  onClick={handlePrevPoint}
                  disabled={patrolCurrentPointIndex <= 0 || patrolPlayStatus === 'idle'}
                  style={{ color: '#4FC3F7' }}
                />
                {patrolPlayStatus === 'idle' || patrolPlayStatus === 'paused' ? (
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<PlayCircleOutlined style={{ fontSize: '24px' }} />}
                    onClick={patrolPaused ? resumePatrol : startPatrol}
                    disabled={!currentRoute || currentRoute.points.length === 0}
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #0288D1, #4FC3F7)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(2, 136, 209, 0.4)',
                    }}
                  />
                ) : (
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<PauseCircleOutlined style={{ fontSize: '24px' }} />}
                    onClick={pausePatrol}
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #F57C00, #FFB74D)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(245, 124, 0, 0.4)',
                    }}
                  />
                )}
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={<StopOutlined />}
                  onClick={stopPatrol}
                  disabled={patrolPlayStatus === 'idle'}
                  style={{ color: '#EF5350' }}
                />
                <Button
                  type="text"
                  icon={<StepForwardOutlined />}
                  onClick={handleNextPoint}
                  disabled={patrolCurrentPointIndex >= totalPoints - 1 || patrolPlayStatus === 'idle'}
                  style={{ color: '#4FC3F7' }}
                />
              </div>

              <div style={{ textAlign: 'center', color: '#81D4FA', fontSize: '13px', fontFamily: 'monospace' }}>
                {displayIndex} / {totalPoints || 0}
                {patrolPlayStatus === 'staying' && (
                  <span style={{ marginLeft: '8px', color: '#81C784' }}>
                    <ClockCircleOutlined /> {(patrolStayRemaining / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BranchesOutlined style={{ color: '#4FC3F7' }} />
                <span style={{ fontSize: '12px', color: '#81D4FA', fontWeight: 600 }}>
                  巡检点列表 ({currentRoute.points.length})
                </span>
              </div>
              <Button
                type="primary"
                size="small"
                icon={<CameraOutlined />}
                onClick={handleAddCurrentView}
                style={{
                  background: 'linear-gradient(135deg, #0288D1, #4FC3F7)',
                  border: 'none',
                  fontSize: '12px',
                }}
              >
                添加当前视角
              </Button>
            </div>

            <List
              dataSource={currentRoute.points}
              locale={{ emptyText: '暂无巡检点，点击上方「添加当前视角」按钮' }}
              renderItem={(point, index) => {
                const isActive = patrolCurrentPointIndex === index && patrolPlayStatus !== 'idle';
                const color = getColorForIndex(index);
                return (
                  <List.Item
                    key={point.id}
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(79, 195, 247, 0.08)',
                      marginBottom: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(79, 195, 247, 0.1)' : 'transparent',
                        border: isActive ? `1px solid ${color}44` : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Avatar
                        size={36}
                        style={{
                          background: `${color}22`,
                          color: color,
                          border: `1px solid ${color}44`,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              color: isActive ? color : '#E1F5FE',
                              fontWeight: isActive ? 600 : 500,
                              fontSize: '14px',
                            }}
                          >
                            {point.name}
                          </span>
                          <Space size={4}>
                            <Tooltip title="飞行到此">
                              <Button
                                type="text"
                                size="small"
                                icon={<AimOutlined />}
                                onClick={() => handleFlyToPoint(point)}
                                style={{ color: '#81C784' }}
                              />
                            </Tooltip>
                            <Tooltip title="删除">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeletePoint(point)}
                              />
                            </Tooltip>
                          </Space>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#4FC3F7',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                          }}
                        >
                          <span>
                            ({point.position.x.toFixed(0)}, {point.position.y.toFixed(0)}, {point.position.z.toFixed(0)})
                          </span>
                          <Tag color="blue" style={{ margin: 0, fontSize: '10px' }}>
                            停留 {(point.stayDuration / 1000).toFixed(0)}s
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </>
        )}
      </Drawer>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E1F5FE' }}>
            <PlusOutlined style={{ color: '#4FC3F7' }} />
            新建巡检路线
          </div>
        }
        open={routeModalOpen}
        onCancel={() => setRouteModalOpen(false)}
        onOk={handleCreateRoute}
        okText="创建"
        cancelText="取消"
        styles={{
          header: {
            background: 'linear-gradient(135deg, #01579B, #0288D1)',
            borderBottom: '1px solid rgba(79, 195, 247, 0.15)',
          },
          content: {
            background: 'linear-gradient(180deg, #0A1929 0%, #0D2137 100%)',
            border: '1px solid rgba(79, 195, 247, 0.15)',
          },
          body: {
            padding: '20px 24px',
          },
          mask: {
            background: 'rgba(0,0,0,0.5)',
          },
        }}
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #0288D1, #4FC3F7)',
            border: 'none',
          },
        }}
      >
        <Form form={routeForm} layout="vertical">
          <Form.Item
            name="name"
            label={<span style={{ color: '#81D4FA' }}>路线名称</span>}
            rules={[{ required: true, message: '请输入路线名称' }]}
          >
            <Input
              placeholder="请输入路线名称，例如：日常巡检路线"
              style={{
                background: 'rgba(79, 195, 247, 0.05)',
                border: '1px solid rgba(79, 195, 247, 0.2)',
                color: '#E1F5FE',
                borderRadius: '8px',
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E1F5FE' }}>
            <CameraOutlined style={{ color: '#4FC3F7' }} />
            添加当前视角为巡检点
          </div>
        }
        open={pointModalOpen}
        onCancel={() => setPointModalOpen(false)}
        onOk={handleConfirmAddPoint}
        okText="保存"
        cancelText="取消"
        styles={{
          header: {
            background: 'linear-gradient(135deg, #01579B, #0288D1)',
            borderBottom: '1px solid rgba(79, 195, 247, 0.15)',
          },
          content: {
            background: 'linear-gradient(180deg, #0A1929 0%, #0D2137 100%)',
            border: '1px solid rgba(79, 195, 247, 0.15)',
          },
          body: {
            padding: '20px 24px',
          },
          mask: {
            background: 'rgba(0,0,0,0.5)',
          },
        }}
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #0288D1, #4FC3F7)',
            border: 'none',
          },
        }}
      >
        <Form form={pointForm} layout="vertical">
          <Form.Item
            name="name"
            label={<span style={{ color: '#81D4FA' }}>巡检点名称</span>}
            rules={[{ required: true, message: '请输入巡检点名称' }]}
          >
            <Input
              placeholder="请输入巡检点名称"
              style={{
                background: 'rgba(79, 195, 247, 0.05)',
                border: '1px solid rgba(79, 195, 247, 0.2)',
                color: '#E1F5FE',
                borderRadius: '8px',
              }}
            />
          </Form.Item>
          <Form.Item
            name="stayDuration"
            label={<span style={{ color: '#81D4FA' }}>停留时长（毫秒）</span>}
            rules={[{ required: true, message: '请输入停留时长' }]}
          >
            <InputNumber
              min={1000}
              step={500}
              style={{
                width: '100%',
                background: 'rgba(79, 195, 247, 0.05)',
                borderRadius: '8px',
              }}
              placeholder="3000"
            />
          </Form.Item>
          <Form.Item label={<span style={{ color: '#81D4FA' }}>视角信息</span>}>
            <div
              style={{
                background: 'rgba(79, 195, 247, 0.05)',
                border: '1px solid rgba(79, 195, 247, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#81D4FA', fontSize: '12px' }}>相机位置：</span>
                <span style={{ color: '#81C784', fontFamily: 'monospace', fontSize: '12px' }}>
                  ({cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#81D4FA', fontSize: '12px' }}>目标点：</span>
                <span style={{ color: '#4FC3F7', fontFamily: 'monospace', fontSize: '12px' }}>
                  ({cameraTarget.x.toFixed(1)}, {cameraTarget.y.toFixed(1)}, {cameraTarget.z.toFixed(1)})
                </span>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
