import { useState } from 'react';
import {
  StarOutlined,
  PlusOutlined,
  DeleteOutlined,
  AimOutlined,
  GlobalOutlined,
  BankOutlined,
  RocketOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import { Drawer, Button, List, Avatar, Tooltip, Modal, Form, Input, message, Space, Tag } from 'antd';
import { useMapStore } from '@/store/useMapStore';
import type { FavoriteArea, CameraPosition, CameraTarget } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const defaultBookmarks: FavoriteArea[] = [
  {
    id: 'bm-1',
    name: '城市全景视角',
    description: '俯瞰整座数字孪生城市',
    cameraPosition: { x: 120, y: 100, z: 120 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    createdAt: new Date('2025-06-01T09:00:00'),
  },
  {
    id: 'bm-2',
    name: '中央商务区',
    description: '市中心高楼群核心区域',
    cameraPosition: { x: 40, y: 50, z: 40 },
    cameraTarget: { x: 0, y: 10, z: 0 },
    createdAt: new Date('2025-06-02T14:30:00'),
  },
  {
    id: 'bm-3',
    name: '滨水景观带',
    description: '河流与湖泊生态区域',
    cameraPosition: { x: -30, y: 35, z: 30 },
    cameraTarget: { x: -15, y: 0, z: 0 },
    createdAt: new Date('2025-06-03T10:15:00'),
  },
  {
    id: 'bm-4',
    name: '交通枢纽区',
    description: '主干道交叉路口监测',
    cameraPosition: { x: 0, y: 60, z: 80 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    createdAt: new Date('2025-06-04T16:45:00'),
  },
  {
    id: 'bm-5',
    name: '产业园区',
    description: '东部工业与仓储片区',
    cameraPosition: { x: -80, y: 45, z: -60 },
    cameraTarget: { x: -60, y: 5, z: -40 },
    createdAt: new Date('2025-06-05T11:20:00'),
  },
];

const iconMap: Record<string, React.ReactNode> = {
  city: <GlobalOutlined />,
  business: <BankOutlined />,
  water: <EnvironmentOutlined />,
  traffic: <RocketOutlined />,
  industry: <HomeOutlined />,
  default: <PushpinOutlined />,
};

function getIconForName(name: string): React.ReactNode {
  if (name.includes('全景') || name.includes('城市')) return iconMap.city;
  if (name.includes('商务') || name.includes('中心') || name.includes('CBD')) return iconMap.business;
  if (name.includes('水') || name.includes('滨') || name.includes('湖') || name.includes('河')) return iconMap.water;
  if (name.includes('交通') || name.includes('枢纽') || name.includes('路口')) return iconMap.traffic;
  if (name.includes('产业') || name.includes('工业') || name.includes('园区')) return iconMap.industry;
  return iconMap.default;
}

function getColorForName(name: string): string {
  if (name.includes('全景') || name.includes('城市')) return '#4FC3F7';
  if (name.includes('商务') || name.includes('中心')) return '#FFB74D';
  if (name.includes('水') || name.includes('滨')) return '#4DD0E1';
  if (name.includes('交通') || name.includes('枢纽')) return '#FF8A65';
  if (name.includes('产业') || name.includes('工业')) return '#AED581';
  return '#BA68C8';
}

export default function FavoritePanel() {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<FavoriteArea[]>(defaultBookmarks);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { flyToPosition, cameraPosition, cameraTarget } = useMapStore();

  const handleFlyTo = (bm: FavoriteArea) => {
    flyToPosition({
      position: bm.cameraPosition,
      target: bm.cameraTarget,
      duration: 1500,
    });
    message.success(`已飞行定位至「${bm.name}」`);
  };

  const handleAddCurrent = () => {
    form.resetFields();
    form.setFieldsValue({
      cameraPosition: `(${cameraPosition.x.toFixed(1)}, ${cameraPosition.y.toFixed(1)}, ${cameraPosition.z.toFixed(1)})`,
      cameraTarget: `(${cameraTarget.x.toFixed(1)}, ${cameraTarget.y.toFixed(1)}, ${cameraTarget.z.toFixed(1)})`,
    });
    setModalOpen(true);
  };

  const handleConfirmAdd = async () => {
    try {
      const values = await form.validateFields();
      const newBookmark: FavoriteArea = {
        id: `bm-${Date.now()}`,
        name: values.name,
        description: values.description || '用户自定义视角',
        cameraPosition: { ...cameraPosition } as CameraPosition,
        cameraTarget: { ...cameraTarget } as CameraTarget,
        createdAt: new Date(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      message.success(`已添加收藏「${values.name}」`);
      setModalOpen(false);
    } catch {
      // validation error
    }
  };

  const handleDelete = (bm: FavoriteArea) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除收藏「${bm.name}」吗？此操作无法撤销。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
        message.success(`已删除「${bm.name}」`);
      },
    });
  };

  return (
    <>
      <Tooltip title="视角收藏" placement="left">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<StarOutlined style={{ fontSize: '18px' }} />}
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            right: '20px',
            top: '80px',
            zIndex: 50,
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #F57C00, #FFB74D)',
            boxShadow: '0 4px 20px rgba(245, 124, 0, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF8E1' }}>
            <StarOutlined style={{ color: '#FFB74D', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>视角收藏</span>
            <Tag color="#FFB74D" style={{ marginLeft: '8px', borderRadius: '10px' }}>
              {bookmarks.length}
            </Tag>
          </div>
        }
        placement="right"
        width={360}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          header: {
            background: 'linear-gradient(135deg, #3E2723, #5D4037)',
            borderBottom: '1px solid rgba(255, 183, 77, 0.2)',
          },
          body: {
            background: 'linear-gradient(180deg, #1A120A 0%, #2D1F14 100%)',
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
          <Tooltip title="添加当前视角">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddCurrent}
              style={{
                background: 'linear-gradient(135deg, #F57C00, #FFB74D)',
                border: 'none',
                boxShadow: '0 2px 8px rgba(245, 124, 0, 0.3)',
              }}
            >
              <span style={{ fontSize: '12px' }}>添加视角</span>
            </Button>
          </Tooltip>
        }
      >
        <List
          dataSource={bookmarks}
          locale={{ emptyText: '暂无收藏视角，点击右上角「添加视角」按钮保存当前视角' }}
          renderItem={(bm) => {
            const color = getColorForName(bm.name);
            return (
              <List.Item
                key={bm.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255, 183, 77, 0.08)',
                  marginBottom: 0,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '4px',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 183, 77, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Avatar
                    size={44}
                    icon={getIconForName(bm.name)}
                    style={{
                      background: `${color}22`,
                      color: color,
                      border: `1px solid ${color}44`,
                      flexShrink: 0,
                    }}
                  />
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
                          color: '#FFF8E1',
                          fontWeight: 600,
                          fontSize: '14px',
                        }}
                      >
                        {bm.name}
                      </span>
                      <Space size={4}>
                        <Tooltip title="飞行定位">
                          <Button
                            type="text"
                            size="small"
                            icon={<AimOutlined />}
                            onClick={() => handleFlyTo(bm)}
                            style={{ color: '#81C784' }}
                          />
                        </Tooltip>
                        <Tooltip title="删除收藏">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(bm)}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    {bm.description && (
                      <div
                        style={{
                          color: '#A1887F',
                          fontSize: '12px',
                          marginBottom: '6px',
                        }}
                      >
                        {bm.description}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#8D6E63',
                        fontSize: '11px',
                      }}
                    >
                      <CameraOutlined />
                      <span>
                        ({bm.cameraPosition.x.toFixed(0)}, {bm.cameraPosition.y.toFixed(0)},{' '}
                        {bm.cameraPosition.z.toFixed(0)})
                      </span>
                      <span style={{ opacity: 0.6 }}>·</span>
                      <span>
                        {format(new Date(bm.createdAt), 'MM月dd日 HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </Drawer>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF8E1' }}>
            <PlusOutlined style={{ color: '#FFB74D' }} />
            添加当前视角
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleConfirmAdd}
        okText="保存"
        cancelText="取消"
        styles={{
          header: {
            background: 'linear-gradient(135deg, #3E2723, #5D4037)',
            borderBottom: '1px solid rgba(255, 183, 77, 0.15)',
          },
          content: {
            background: 'linear-gradient(180deg, #1A120A 0%, #2D1F14 100%)',
            border: '1px solid rgba(255, 183, 77, 0.15)',
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
            background: 'linear-gradient(135deg, #F57C00, #FFB74D)',
            border: 'none',
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ color: '#FFF8E1' }}
        >
          <Form.Item
            name="name"
            label={<span style={{ color: '#FFCC80' }}>收藏名称</span>}
            rules={[{ required: true, message: '请输入收藏名称' }]}
          >
            <Input
              placeholder="请输入视角名称，例如：我的工作视角"
              style={{
                background: 'rgba(255, 183, 77, 0.05)',
                border: '1px solid rgba(255, 183, 77, 0.2)',
                color: '#FFF8E1',
                borderRadius: '8px',
              }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span style={{ color: '#FFCC80' }}>描述（可选）</span>}
          >
            <Input.TextArea
              rows={2}
              placeholder="添加描述备注..."
              style={{
                background: 'rgba(255, 183, 77, 0.05)',
                border: '1px solid rgba(255, 183, 77, 0.2)',
                color: '#FFF8E1',
                borderRadius: '8px',
                resize: 'none',
              }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#FFCC80' }}>视角信息</span>}
          >
            <div
              style={{
                background: 'rgba(255, 183, 77, 0.05)',
                border: '1px solid rgba(255, 183, 77, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#A1887F', fontSize: '12px' }}>相机位置：</span>
                <span style={{ color: '#81C784', fontFamily: 'monospace', fontSize: '12px' }}>
                  ({cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#A1887F', fontSize: '12px' }}>目标点：</span>
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
