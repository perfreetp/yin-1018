import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Timeline,
  InputNumber,
  Divider,
  Tag,
} from 'antd';
import {
  X,
  Maximize2,
  Minimize2,
  MapPin,
  Clock,
  User,
  Phone,
  FileText,
  Send,
  ShieldAlert,
  Calendar,
  Building,
  Video,
} from 'lucide-react';
import type { EventItem } from '@/types';
import { useEventStore } from '@/store/useEventStore';
import { useAppStore } from '@/store/useAppStore';
import { AlertBadge, AlertBadgeLevelMap } from '@/components/common/AlertBadge';
import { StatusTag } from '@/components/common/StatusTag';
import { VideoPlayer } from './VideoPlayer';
import { cn } from '@/lib/utils';

const { TextArea } = Input;
const { Option } = Select;

const departments = [
  '交通管理局',
  '市政管理局',
  '环境保护局',
  '公安局',
  '消防局',
  '城市管理局',
  '水务局',
  '应急管理局',
];

const categoryMap: Record<string, string> = {
  traffic: '交通事件',
  pipeline: '管网事件',
  environment: '环境事件',
  safety: '安全事件',
  public: '公共事件',
  other: '其他事件',
};

export const EventModal: React.FC = () => {
  const {
    selectedEvent,
    eventModalVisible,
    closeEventModal,
    dispatchEvent,
    updateEventProgress,
  } = useEventStore();
  const { currentDuty } = useAppStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dispatchForm] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<'detail' | 'progress'>('detail');

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleDispatch = async () => {
    try {
      const values = await dispatchForm.validateFields();
      if (selectedEvent) {
        dispatchEvent(selectedEvent.id, values.department, currentDuty?.personName || '系统');
        dispatchForm.resetFields();
      }
    } catch {
      // ignore
    }
  };

  const handleAddProgress = async () => {
    try {
      const values = await progressForm.validateFields();
      if (selectedEvent) {
        updateEventProgress(
          selectedEvent.id,
          {
            title: values.title,
            description: values.description,
            operator: currentDuty?.personName || '系统',
          },
          values.status,
        );
        progressForm.resetFields();
      }
    } catch {
      // ignore
    }
  };

  if (!selectedEvent) return null;

  const alertLevel = AlertBadgeLevelMap[selectedEvent.level] || 'info';

  return (
    <Modal
      open={eventModalVisible}
      onCancel={closeEventModal}
      footer={null}
      closable={false}
      width={isFullscreen ? '100vw' : 1100}
      style={isFullscreen ? { top: 0, padding: 0, margin: 0, maxWidth: '100vw', height: '100vh' } : { top: 40 }}
      wrapClassName={isFullscreen ? 'event-modal-fullscreen' : ''}
      destroyOnClose
      modalRender={(node) => (
        <div className="h-full">
          {node}
        </div>
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg',
          'bg-space-900/95 backdrop-blur-xl',
          'border border-tech-500/30',
          isFullscreen && 'h-screen rounded-none border-none',
        )}
        style={isFullscreen ? { margin: -24, height: '100vh' } : { margin: -24, padding: 24 }}
      >
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-tech-400/60 rounded-tl pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-tech-400/60 rounded-tr pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-tech-400/60 rounded-bl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-tech-400/60 rounded-br pointer-events-none" />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-tech-500/20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-text-primary truncate">
                {selectedEvent.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <AlertBadge level={alertLevel} />
                <StatusTag status={selectedEvent.status} />
                <Tag color="blue" className="border border-blue-500/30 bg-blue-500/10">
                  {categoryMap[selectedEvent.category] || '未分类'}
                </Tag>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-text-secondary hover:text-tech-300 hover:bg-tech-500/10 transition-all"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={closeEventModal}
              className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={cn('grid gap-4', isFullscreen ? 'grid-cols-5 h-[calc(100vh-140px)]' : 'grid-cols-5 max-h-[70vh]')}>
          <div className={cn('col-span-2 space-y-4 overflow-y-auto pr-2', 'scrollbar-thin scrollbar-track-space-800 scrollbar-thumb-tech-500/30')}>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('detail')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'detail'
                    ? 'bg-tech-500/20 text-tech-300 border border-tech-500/30'
                    : 'bg-space-800/50 text-text-secondary hover:text-text-primary border border-tech-500/10',
                )}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                事件信息
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'progress'
                    ? 'bg-tech-500/20 text-tech-300 border border-tech-500/30'
                    : 'bg-space-800/50 text-text-secondary hover:text-text-primary border border-tech-500/10',
                )}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                处置时间线
              </button>
            </div>

            {activeTab === 'detail' ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-space-800/50 border border-tech-500/15 p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-tech-400 rounded-full" />
                    基本信息
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-tech-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-text-tertiary text-xs mb-0.5">事件位置</div>
                        <div className="text-text-primary">{selectedEvent.location.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-tech-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-text-tertiary text-xs mb-0.5">上报时间</div>
                        <div className="text-text-primary">{formatDateTime(selectedEvent.reportTime)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-tech-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-text-tertiary text-xs mb-0.5">所属区域</div>
                        <div className="text-text-primary">{selectedEvent.district.name}</div>
                      </div>
                    </div>
                    {selectedEvent.reporter && (
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-tech-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-text-tertiary text-xs mb-0.5">上报人</div>
                          <div className="text-text-primary">{selectedEvent.reporter}</div>
                        </div>
                      </div>
                    )}
                    {selectedEvent.dispatchedTo && (
                      <div className="flex items-start gap-3">
                        <Send className="w-4 h-4 text-tech-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-text-tertiary text-xs mb-0.5">派发部门</div>
                          <div className="text-text-primary">{selectedEvent.dispatchedTo}</div>
                          {selectedEvent.dispatchedTime && (
                            <div className="text-text-tertiary text-xs mt-0.5">
                              派发时间：{formatDateTime(selectedEvent.dispatchedTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-space-800/50 border border-tech-500/15 p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-tech-400 rounded-full" />
                    事件描述
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.status === 'pending' || selectedEvent.status === 'dispatched' ? (
                  <div className="rounded-xl bg-space-800/50 border border-tech-500/15 p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-tech-400 rounded-full" />
                      {selectedEvent.status === 'pending' ? '派发处置' : '追加进度'}
                    </h3>
                    {selectedEvent.status === 'pending' ? (
                      <Form form={dispatchForm} layout="vertical" size="small">
                        <Form.Item
                          name="department"
                          label={<span className="text-xs text-text-secondary">派发部门</span>}
                          rules={[{ required: true, message: '请选择派发部门' }]}
                          className="mb-3"
                        >
                          <Select
                            placeholder="请选择责任部门"
                            style={{ width: '100%' }}
                            className="!bg-space-700/60"
                            options={departments.map((d) => ({ value: d, label: d }))}
                          />
                        </Form.Item>
                        <Form.Item
                          name="remark"
                          label={<span className="text-xs text-text-secondary">备注说明</span>}
                          className="mb-4"
                        >
                          <TextArea rows={2} placeholder="可选填写备注信息" />
                        </Form.Item>
                        <Button
                          type="primary"
                          block
                          onClick={handleDispatch}
                          icon={<Send className="w-4 h-4" />}
                          className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none !h-9 hover:!from-tech-400 hover:!to-tech-500 !shadow-glow-blue-sm"
                        >
                          确认派发
                        </Button>
                      </Form>
                    ) : (
                      <Form form={progressForm} layout="vertical" size="small">
                        <Form.Item
                          name="title"
                          label={<span className="text-xs text-text-secondary">进度标题</span>}
                          rules={[{ required: true, message: '请输入进度标题' }]}
                          className="mb-3"
                        >
                          <Input placeholder="如：现场勘察中" />
                        </Form.Item>
                        <Form.Item
                          name="description"
                          label={<span className="text-xs text-text-secondary">详细描述</span>}
                          className="mb-3"
                        >
                          <TextArea rows={2} placeholder="详细描述处置进展" />
                        </Form.Item>
                        <Form.Item
                          name="status"
                          label={<span className="text-xs text-text-secondary">更新状态</span>}
                          className="mb-4"
                        >
                          <Select placeholder="不更新则留空" allowClear>
                            <Option value="processing">处置中</Option>
                            <Option value="resolved">已解决</Option>
                            <Option value="closed">已结案</Option>
                          </Select>
                        </Form.Item>
                        <Button
                          type="primary"
                          block
                          onClick={handleAddProgress}
                          className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none !h-9 hover:!from-tech-400 hover:!to-tech-500 !shadow-glow-blue-sm"
                        >
                          添加进度
                        </Button>
                      </Form>
                    )}
                  </div>
                ) : null}

                <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      应急预案
                    </h3>
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      className="!border-purple-500/50 !text-purple-300 hover:!bg-purple-500/20"
                    >
                      调用预案
                    </Button>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    检测到匹配的应急预案：
                    <span className="text-purple-300 mx-1">#EP-{selectedEvent.category.toUpperCase()}-001</span>
                    ，可一键启动标准处置流程。
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-space-800/50 border border-tech-500/15 p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-tech-400 rounded-full" />
                  处置时间线
                </h3>
                <Timeline
                  items={[
                    {
                      color: '#00d4ff',
                      dot: <Clock className="w-3.5 h-3.5" />,
                      children: (
                        <div>
                          <div className="text-sm font-medium text-text-primary">事件上报</div>
                          <div className="text-xs text-text-tertiary mt-0.5">
                            {formatDateTime(selectedEvent.reportTime)}
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            事件已登记，等待派发处置
                          </div>
                        </div>
                      ),
                    },
                    ...selectedEvent.progress.map((p) => ({
                      color: p.completed ? '#10b981' : '#f59e0b',
                      dot: p.completed ? null : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />,
                      children: (
                        <div>
                          <div className="text-sm font-medium text-text-primary">{p.title}</div>
                          <div className="text-xs text-text-tertiary mt-0.5">
                            {formatDateTime(p.timestamp)} · {p.operator}
                          </div>
                          {p.description && (
                            <div className="text-xs text-text-secondary mt-1">{p.description}</div>
                          )}
                        </div>
                      ),
                    })),
                  ]}
                />
              </div>
            )}
          </div>

          <div className={cn('col-span-3 space-y-4 overflow-y-auto pl-2', 'scrollbar-thin scrollbar-track-space-800 scrollbar-thumb-tech-500/30')}>
            <div className="rounded-xl bg-space-800/50 border border-tech-500/15 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-tech-500/15 bg-space-700/40">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-tech-400" />
                  <span className="text-sm font-semibold text-text-primary">视频联动</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    在线 {selectedEvent.relatedVideoIds?.length || 2} 路
                  </span>
                </div>
              </div>
              <div className="p-3">
                <VideoPlayer
                  mode={isFullscreen ? '2x2' : '1x1'}
                  cameraIds={selectedEvent.relatedVideoIds || ['CAM001', 'CAM002']}
                />
              </div>
            </div>

            <div className="rounded-xl bg-space-800/50 border border-tech-500/15 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-tech-400" />
                  联系信息
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-space-700/40 border border-tech-500/10">
                  <div className="w-8 h-8 rounded-lg bg-tech-500/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-tech-400" />
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary">值班人员</div>
                    <div className="text-sm text-text-primary font-medium">{currentDuty?.personName || '张伟'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-space-700/40 border border-tech-500/10">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary">联系电话</div>
                    <div className="text-sm text-text-primary font-medium font-mono">{currentDuty?.phone || '138****8888'}</div>
                  </div>
                </div>
              </div>
            </div>

            {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
              <div className="rounded-xl bg-space-800/50 border border-tech-500/15 p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-tech-400" />
                  附件资料
                </h3>
                <div className="space-y-2">
                  {selectedEvent.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-space-700/40 border border-tech-500/10 hover:border-tech-400/30 cursor-pointer transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-space-600/60 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-tech-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary truncate">{att.name}</div>
                        <div className="text-xs text-text-tertiary">{att.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Divider className="!border-tech-500/20 !my-4" />

        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={closeEventModal}
            className="!bg-space-700/60 !border-tech-500/20 !text-text-secondary hover:!text-text-primary hover:!border-tech-400/40"
          >
            关闭
          </Button>
          <Button
            className="!bg-space-700/60 !border-tech-500/20 !text-text-secondary hover:!text-text-primary hover:!border-tech-400/40"
          >
            导出详情
          </Button>
          {selectedEvent.status !== 'closed' && selectedEvent.status !== 'resolved' && (
            <Button
              type="primary"
              icon={<Send className="w-4 h-4" />}
              className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none hover:!from-tech-400 hover:!to-tech-500 !shadow-glow-blue-sm"
            >
              派发处置
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
