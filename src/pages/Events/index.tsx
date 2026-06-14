import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Clock4,
  AlertOctagon,
  Car,
  Droplets,
  Leaf,
  Shield,
  Wrench,
  Users,
  X
} from 'lucide-react';
import {
  Select,
  DatePicker,
  Tag,
  Dropdown,
  Input,
  Pagination,
  Empty
} from 'antd';
import type { MenuProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import EventCard from '@/components/common/EventCard';
import EventModal from '@/components/business/EventModal';
import { events as mockEvents } from '@/mock/events';
import { districts } from '@/mock/events';
import {
  eventCategoryConfigs,
  alertLevelConfigs,
  eventStatusConfigs,
  formatNumber,
  formatPercent
} from '@/utils/format';
import { useEventStore } from '@/store/useEventStore';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { EventCategory, AlertLevel, EventStatus } from '@/types';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search: SearchInput } = Input;

const categoryIconMap: Record<EventCategory, React.ReactNode> = {
  traffic: <Car className="w-4 h-4" />,
  pipeline: <Droplets className="w-4 h-4" />,
  environment: <Leaf className="w-4 h-4" />,
  safety: <Shield className="w-4 h-4" />,
  facility: <Wrench className="w-4 h-4" />,
  public: <Users className="w-4 h-4" />,
  other: <AlertTriangle className="w-4 h-4" />
};

const Events: React.FC = () => {
  const { events, setFilters, resetFilters, filters } = useEventStore();
  const { currentDuty } = useAppStore();

  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<AlertLevel[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  const allEvents = useMemo(() => mockEvents, []);

  const stats = useMemo(() => {
    const total = allEvents.length;
    const pending = allEvents.filter(e => e.status === 'pending').length;
    const processing = allEvents.filter(e => e.status === 'processing' || e.status === 'dispatched').length;
    const completed = allEvents.filter(e => e.status === 'resolved' || e.status === 'closed').length;
    const now = new Date();
    const timeout = allEvents.filter(e => {
      if (!e.deadline) return false;
      const deadline = new Date(e.deadline);
      return deadline < now && e.status !== 'resolved' && e.status !== 'closed';
    }).length;
    return { total, pending, processing, completed, timeout };
  }, [allEvents]);

  const categoryStats = useMemo(() => {
    const cats: EventCategory[] = ['traffic', 'pipeline', 'environment', 'safety', 'facility', 'public', 'other'];
    return cats.map(cat => {
      const count = allEvents.filter(e => e.category === cat).length;
      return {
        category: cat,
        count,
        percent: allEvents.length > 0 ? (count / allEvents.length) * 100 : 0
      };
    }).filter(s => s.count > 0);
  }, [allEvents]);

  const levelStats = useMemo(() => {
    const levels: AlertLevel[] = ['red', 'orange', 'yellow', 'blue'];
    return levels.map(level => {
      const count = allEvents.filter(e => e.level === level).length;
      return {
        level,
        count,
        percent: allEvents.length > 0 ? (count / allEvents.length) * 100 : 0
      };
    }).filter(s => s.count > 0);
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (selectedDistricts.length > 0 && !selectedDistricts.includes(event.district.id)) {
        return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) {
        return false;
      }
      if (selectedLevels.length > 0 && !selectedLevels.includes(event.level)) {
        return false;
      }
      if (selectedStatus && event.status !== selectedStatus) {
        return false;
      }
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        const inTitle = event.title.toLowerCase().includes(kw);
        const inDesc = event.description.toLowerCase().includes(kw);
        const inAddr = event.location.address.toLowerCase().includes(kw);
        if (!inTitle && !inDesc && !inAddr) {
          return false;
        }
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        const eventTime = new Date(event.reportTime).getTime();
        const startTime = dateRange[0].startOf('day').valueOf();
        const endTime = dateRange[1].endOf('day').valueOf();
        if (eventTime < startTime || eventTime > endTime) {
          return false;
        }
      }
      return true;
    });
  }, [allEvents, selectedDistricts, selectedCategories, selectedLevels, selectedStatus, searchKeyword, dateRange]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistricts, selectedCategories, selectedLevels, selectedStatus, searchKeyword, dateRange]);

  const handleReset = () => {
    setSelectedDistricts([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedStatus(null);
    setSearchKeyword('');
    setDateRange(null);
    resetFilters();
  };

  const handleApplyFilters = () => {
    setFilters({
      districtId: selectedDistricts.length === 1 ? selectedDistricts[0] : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      levels: selectedLevels.length > 0 ? selectedLevels : undefined,
      statuses: selectedStatus ? [selectedStatus] : undefined,
      keyword: searchKeyword || undefined,
      timeRange: dateRange && dateRange[0] && dateRange[1] ? {
        start: dateRange[0].toISOString(),
        end: dateRange[1].toISOString()
      } : undefined
    });
  };

  const statusMenuItems: MenuProps['items'] = ['pending', 'dispatched', 'processing', 'resolved', 'closed'].map(s => ({
    key: s,
    label: (
      <span className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: eventStatusConfigs[s as EventStatus].dotColor }}
        />
        {eventStatusConfigs[s as EventStatus].label}
      </span>
    )
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-tech-400" />
              <span className="text-sm font-medium text-text-primary">筛选条件</span>
            </div>

            <div className="flex-1 flex items-center gap-3 flex-wrap min-w-0">
              <Select
                mode="multiple"
                placeholder="选择街道"
                allowClear
                value={selectedDistricts}
                onChange={setSelectedDistricts}
                className="!min-w-[160px]"
                size="middle"
                style={{ minWidth: 160 }}
                maxTagCount="responsive"
              >
                {districts.map(d => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>

              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                allowClear
                size="middle"
                className="!w-[260px]"
              />

              <Select
                mode="multiple"
                placeholder="事件类型"
                allowClear
                value={selectedCategories}
                onChange={(v) => setSelectedCategories(v as EventCategory[])}
                size="middle"
                style={{ minWidth: 180 }}
                maxTagCount="responsive"
                tagRender={(props) => {
                  const { label, value, closable, onClose } = props;
                  const config = eventCategoryConfigs[value as EventCategory];
                  return (
                    <Tag
                      color={config?.color}
                      style={{
                        backgroundColor: config?.bgColor,
                        borderColor: config?.color + '40',
                        color: config?.color,
                        marginRight: 4
                      }}
                      closable={closable}
                      onClose={(e) => {
                        e.preventDefault();
                        onClose?.(e as any);
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {categoryIconMap[value as EventCategory]}
                        {label}
                      </span>
                    </Tag>
                  );
                }}
              >
                {(Object.keys(eventCategoryConfigs) as EventCategory[]).map(cat => (
                <Option key={cat} value={cat}>
                  <span className="flex items-center gap-2">
                    <span style={{ color: eventCategoryConfigs[cat].color }}>
                      {categoryIconMap[cat]}
                    </span>
                    {eventCategoryConfigs[cat].label}
                  </span>
                </Option>
              ))}
              </Select>

              <Select
                mode="multiple"
                placeholder="优先级"
                allowClear
                value={selectedLevels}
                onChange={(v) => setSelectedLevels(v as AlertLevel[])}
                size="middle"
                style={{ minWidth: 160 }}
                maxTagCount="responsive"
                tagRender={(props) => {
                  const { label, value, closable, onClose } = props;
                  const config = alertLevelConfigs[value as AlertLevel];
                  return (
                    <Tag
                      color={config?.color}
                      style={{
                        backgroundColor: config?.bgColor,
                        borderColor: config?.color + '40',
                        color: config?.color,
                        marginRight: 4
                      }}
                      closable={closable}
                      onClose={(e) => {
                        e.preventDefault();
                        onClose?.(e as any);
                      }}
                    >
                      {label}
                    </Tag>
                  );
                }}
              >
                {(Object.keys(alertLevelConfigs) as AlertLevel[]).map(level => (
                  <Option key={level} value={level}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: alertLevelConfigs[level].color }}
                      />
                      {alertLevelConfigs[level].label}
                    </span>
                  </Option>
                ))}
              </Select>

              <Dropdown
                menu={{
                  items: statusMenuItems,
                  onClick: ({ key }) => {
                    setSelectedStatus(key as EventStatus | null);
                  },
                  selectedKeys: selectedStatus ? [selectedStatus] : []
                }}
                trigger={['click']}
              >
                <div
                  className={cn(
                    '!px-4 !py-2 !rounded-lg !border !cursor-pointer !text-sm !flex !items-center !gap-2 !transition-all',
                    selectedStatus
                      ? '!bg-tech-500/15 !border-tech-500/40 !text-tech-300'
                      : '!bg-space-700/60 !border-tech-500/20 !text-text-secondary !hover:border-tech-400/40'
                  )}
                >
                  {selectedStatus ? eventStatusConfigs[selectedStatus].label : '事件状态'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </Dropdown>

              <SearchInput
                placeholder="搜索关键词..."
                allowClear
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefix={<Search className="w-4 h-4 text-text-tertiary" />}
                size="middle"
                style={{ width: 200 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-tech-500/20 bg-space-700/60 text-text-secondary text-sm hover:text-text-primary hover:border-tech-400/40 transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              重置
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-tech-500 to-tech-600 text-white text-sm font-medium hover:from-tech-400 hover:to-tech-500 transition-all shadow-glow-blue-sm flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              应用筛选
            </button>
          </div>
        </div>

        <div className="h-px my-4 bg-tech-500/15" />

        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-space-700/40 border border-tech-500/10">
            <div className="w-12 h-12 rounded-xl bg-tech-500/15 flex items-center justify-center flex-shrink-0">
              <AlertOctagon className="w-6 h-6 text-tech-400" />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-0.5">事件总数</div>
              <div className="text-2xl font-bold font-mono text-text-primary">{formatNumber(stats.total)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-space-700/40 border border-tech-500/10">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Clock4 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-0.5">待处置</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{formatNumber(stats.pending)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-space-700/40 border border-tech-500/10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-0.5">处置中</div>
              <div className="text-2xl font-bold font-mono text-blue-400">{formatNumber(stats.processing)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-space-700/40 border border-tech-500/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-0.5">已完成</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{formatNumber(stats.completed)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-space-700/40 border border-red-500/20 bg-red-500/5">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-0.5">超时</div>
              <div className="text-2xl font-bold font-mono text-red-400">{formatNumber(stats.timeout)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-3 space-y-5">
          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                事件分类统计
              </h3>
            </div>
            <div className="space-y-3">
              {categoryStats.map(({ category, count, percent }) => {
                const config = eventCategoryConfigs[category];
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary flex items-center gap-2">
                        <span style={{ color: config.color }}>
                          {categoryIconMap[category]}
                        </span>
                        {config.label}
                      </span>
                      <span className="text-sm font-mono text-text-primary">{count} 件</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-space-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-text-tertiary mt-1 text-right">
                      {formatPercent(percent, 1, false)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                优先级分布
              </h3>
            </div>
            <div className="space-y-3">
              {levelStats.map(({ level, count, percent }) => {
                const config = alertLevelConfigs[level];
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        {config.label}
                      </span>
                      <span className="text-sm font-mono text-text-primary">{count} 件</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-space-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-text-tertiary mt-1 text-right">
                      {formatPercent(percent, 1, false)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-9 space-y-5">
          <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <span className="w-1 h-5 bg-tech-400 rounded-full" />
                事件列表
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">
                  共 <span className="text-text-primary font-medium">{filteredEvents.length}</span> 条记录
                </span>
                <button className="p-2 rounded-lg text-text-tertiary hover:text-tech-300 hover:bg-tech-500/10 transition-all" title="刷新">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {paginatedEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                  {paginatedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                <div className="flex justify-center pt-4 border-t border-tech-500/15">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredEvents.length}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条`}
                  />
                </div>
              </>
            ) : (
              <div className="py-16">
                <Empty description="暂无匹配的事件" />
              </div>
            )}
          </div>
        </div>
      </div>

      <EventModal />
    </div>
  );
};

export default Events;
