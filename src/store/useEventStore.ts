import { create } from 'zustand';
import type { EventItem, EventFilters, ProgressNode } from '../types';
import { events } from '../mock/events';

// 事件状态接口
interface EventState {
  // ===== 状态 =====

  /** 事件列表 */
  events: EventItem[];

  /** 当前选中的事件 */
  selectedEvent: EventItem | null;

  /** 事件详情弹窗是否可见 */
  eventModalVisible: boolean;

  /** 当前筛选条件 */
  filters: EventFilters;

  /** 是否正在加载数据 */
  loading: boolean;

  // ===== Actions =====

  /**
   * 拉取事件列表（支持筛选）
   * @param filters 可选的筛选条件，不传则使用当前 filters
   */
  fetchEvents: (filters?: EventFilters) => Promise<void>;

  /** 选中指定事件 */
  selectEvent: (event: EventItem | null) => void;

  /** 打开事件详情弹窗 */
  openEventModal: (event?: EventItem) => void;

  /** 关闭事件详情弹窗 */
  closeEventModal: () => void;

  /**
   * 派发/分派事件给责任部门
   * @param eventId 事件ID
   * @param targetDept 目标部门
   * @param operator 操作人
   */
  dispatchEvent: (
    eventId: string,
    targetDept: string,
    operator: string,
  ) => void;

  /**
   * 更新事件处置进度
   * @param eventId 事件ID
   * @param progressNode 新增的进度节点
   * @param newStatus 可选的新状态
   */
  updateEventProgress: (
    eventId: string,
    progressNode: Omit<ProgressNode, 'id' | 'timestamp' | 'completed'> & {
      completed?: boolean;
    },
    newStatus?: EventItem['status'],
  ) => void;

  /** 设置筛选条件 */
  setFilters: (filters: Partial<EventFilters>) => void;

  /** 重置筛选条件 */
  resetFilters: () => void;
}

// 默认筛选条件
const defaultFilters: EventFilters = {
  districtId: undefined,
  timeRange: undefined,
  categories: undefined,
  levels: undefined,
  statuses: undefined,
  keyword: undefined,
};

// 本地筛选函数（模拟后端接口筛选）
function applyFilters(events: EventItem[], filters: EventFilters): EventItem[] {
  return events.filter((event) => {
    // 按区域筛选
    if (filters.districtId && event.district.id !== filters.districtId) {
      return false;
    }
    // 按事件类型筛选
    if (
      filters.categories &&
      filters.categories.length > 0 &&
      !filters.categories.includes(event.category)
    ) {
      return false;
    }
    // 按预警级别筛选
    if (
      filters.levels &&
      filters.levels.length > 0 &&
      !filters.levels.includes(event.level)
    ) {
      return false;
    }
    // 按状态筛选
    if (
      filters.statuses &&
      filters.statuses.length > 0 &&
      !filters.statuses.includes(event.status)
    ) {
      return false;
    }
    // 按时间范围筛选
    if (filters.timeRange) {
      const eventTime = new Date(event.reportTime).getTime();
      const startTime = new Date(filters.timeRange.start).getTime();
      const endTime = new Date(filters.timeRange.end).getTime();
      if (eventTime < startTime || eventTime > endTime) {
        return false;
      }
    }
    // 关键词搜索
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const inTitle = event.title.toLowerCase().includes(kw);
      const inDesc = event.description.toLowerCase().includes(kw);
      const inAddr = event.location.address.toLowerCase().includes(kw);
      if (!inTitle && !inDesc && !inAddr) {
        return false;
      }
    }
    return true;
  });
}

export const useEventStore = create<EventState>((set, get) => ({
  // ===== 初始状态 =====
  events: events,
  selectedEvent: null,
  eventModalVisible: false,
  filters: defaultFilters,
  loading: false,

  // ===== Actions =====

  fetchEvents: async (filters) => {
    set({ loading: true });

    // 合并筛选条件
    const mergedFilters = { ...get().filters, ...(filters || {}) };

    // 模拟接口延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 使用 mock 数据并应用筛选
    const filtered = applyFilters(events, mergedFilters);

    set({
      events: filtered,
      filters: mergedFilters,
      loading: false,
    });
  },

  selectEvent: (event) => set({ selectedEvent: event }),

  openEventModal: (event) => {
    if (event) {
      set({ selectedEvent: event, eventModalVisible: true });
    } else {
      set({ eventModalVisible: true });
    }
  },

  closeEventModal: () => set({ eventModalVisible: false }),

  dispatchEvent: (eventId, targetDept, operator) => {
    const newProgress: ProgressNode = {
      id: 'p' + Date.now(),
      title: '派发处置',
      description: `已派发至${targetDept}`,
      operator,
      timestamp: new Date().toISOString(),
      completed: true,
    };

    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: 'dispatched',
              dispatchedTo: targetDept,
              dispatchedTime: new Date().toISOString(),
              progress: [...e.progress, newProgress],
            }
          : e,
      ),
      selectedEvent:
        state.selectedEvent?.id === eventId
          ? {
              ...state.selectedEvent,
              status: 'dispatched',
              dispatchedTo: targetDept,
              dispatchedTime: new Date().toISOString(),
              progress: [...state.selectedEvent.progress, newProgress],
            }
          : state.selectedEvent,
    }));
  },

  updateEventProgress: (eventId, progressNode, newStatus) => {
    const node: ProgressNode = {
      id: 'p' + Date.now(),
      title: progressNode.title,
      description: progressNode.description,
      operator: progressNode.operator,
      timestamp: new Date().toISOString(),
      completed: progressNode.completed ?? true,
    };

    // 计算最终状态
    const finalStatus =
      newStatus ||
      (node.title.includes('完成') || node.title.includes('解决')
        ? 'resolved'
        : undefined);

    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: finalStatus || e.status,
              resolvedTime: finalStatus === 'resolved' ? new Date().toISOString() : e.resolvedTime,
              progress: [...e.progress, node],
            }
          : e,
      ),
      selectedEvent:
        state.selectedEvent?.id === eventId
          ? {
              ...state.selectedEvent,
              status: finalStatus || state.selectedEvent.status,
              resolvedTime: finalStatus === 'resolved' ? new Date().toISOString() : state.selectedEvent.resolvedTime,
              progress: [...state.selectedEvent.progress, node],
            }
          : state.selectedEvent,
    }));
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
