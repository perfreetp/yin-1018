import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  CalendarDays,
  Handshake,
  BookOpen,
  Download,
  Printer,
  Archive,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  User,
  Phone,
  ChevronRight,
  Plus,
  ListChecks,
  Users,
  X
} from 'lucide-react';
import {
  Tabs,
  Table,
  Button,
  Input,
  DatePicker,
  Select,
  Steps,
  Checkbox,
  Modal,
  Tag,
  Space,
  Empty,
  Divider,
  Progress,
  List,
  Card,
  Tooltip,
  Radio
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import PieChart from '@/components/chart/PieChart';
import MetricCard from '@/components/common/MetricCard';
import { events as mockEvents } from '@/mock/events';
import { districts } from '@/mock/events';
import {
  formatNumber,
  formatPercent,
  formatDate,
  formatDateTime,
  alertLevelConfigs,
  eventCategoryConfigs,
  eventStatusConfigs,
  getAlertLevelLabel
} from '@/utils/format';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import type { AlertLevel, EventCategory } from '@/types';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

const Reports: React.FC = () => {
  const { currentDuty, setCurrentDuty } = useAppStore();
  const [activeTab, setActiveTab] = useState('daily');

  const [dailyAnnotation, setDailyAnnotation] = useState('今日城市运行整体平稳，交通早高峰期间中心区域出现短时拥堵，已通过交警疏导恢复正常。气象条件良好，空气质量达到良级。');

  const [handoverStep, setHandoverStep] = useState(0);
  const [selectedSuccessor, setSelectedSuccessor] = useState<string>('');
  const [unfinishedItems, setUnfinishedItems] = useState<Record<string, boolean>>({
    'item1': true,
    'item2': true,
    'item3': false,
    'item4': false
  });
  const [handoverRemark, setHandoverRemark] = useState('');

  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planSearchKeyword, setPlanSearchKeyword] = useState('');
  const [planCategory, setPlanCategory] = useState<string>('all');

  const reportStats = useMemo(() => {
    const total = mockEvents.length;
    const completed = mockEvents.filter(e => e.status === 'resolved' || e.status === 'closed').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const avgResponseTime = 15.6;
    const avgResolveTime = 128.4;
    return { total, completed, completionRate, avgResponseTime, avgResolveTime };
  }, []);

  const alertDistribution = useMemo(() => {
    const levels: AlertLevel[] = ['red', 'orange', 'yellow', 'blue'];
    return levels.map(level => {
      const count = mockEvents.filter(e => e.level === level).length;
      if (count === 0) return null;
      const config = alertLevelConfigs[level];
      return {
        name: config.label,
        value: count,
        color: config.color
      };
    }).filter(Boolean) as { name: string; value: number; color: string }[];
  }, []);

  const topEvents = useMemo(() => {
    return [...mockEvents]
      .sort((a, b) => alertLevelConfigs[b.level].severity - alertLevelConfigs[a.level].severity)
      .slice(0, 5);
  }, []);

  const historyReports = useMemo(() => {
    const types = ['日报', '周报', '月报', '专题报告'];
    const statuses = ['已归档', '待审核', '编制中'];
    return Array.from({ length: 12 }, (_, i) => {
      const date = dayjs().subtract(i, 'day');
      const type = types[i % types.length];
      const statusIdx = i < 3 ? 0 : i < 6 ? 1 : 2;
      return {
        key: i + 1,
        id: `RPT${String(20260615 - i).padStart(8, '0')}`,
        title: `${date.format('YYYY年MM月DD日')}${type}`,
        type,
        date: date.format('YYYY-MM-DD'),
        author: ['张伟', '李娜', '王强', '赵敏', '陈刚'][i % 5],
        status: statuses[statusIdx],
        createdAt: date.format('YYYY-MM-DD HH:mm')
      };
    });
  }, []);

  const handoverLogs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const date = dayjs().subtract(i, 'day');
      return {
        key: i + 1,
        id: `HO${String(20260615 - i).padStart(8, '0')}`,
        date: date.format('YYYY-MM-DD'),
        shift: ['早班', '中班', '晚班'][i % 3],
        handoverPerson: ['张伟', '李娜', '王强', '赵敏', '陈刚'][i % 5],
        successor: ['李娜', '王强', '赵敏', '陈刚', '张伟'][(i + 1) % 5],
        unfinishedCount: Math.floor(Math.random() * 5),
        status: '已完成',
        completedAt: date.format('YYYY-MM-DD HH:mm')
      };
    });
  }, []);

  const emergencyPlans = useMemo(() => {
    const plans = [
      { id: 'EP001', title: '城市道路交通事故应急预案', level: 'red', category: 'traffic', applicable: '交通事故、道路拥堵、车辆故障', steps: 8, contacts: 5, resources: 12 },
      { id: 'EP002', title: '供水管网爆管应急处置预案', level: 'orange', category: 'pipeline', applicable: '管网破裂、大面积停水、水质异常', steps: 6, contacts: 4, resources: 8 },
      { id: 'EP003', title: '突发环境污染事件应急预案', level: 'red', category: 'environment', applicable: '废气超标、废水排放、危险化学品泄漏', steps: 10, contacts: 7, resources: 15 },
      { id: 'EP004', title: '城市内涝防汛应急预案', level: 'orange', category: 'pipeline', applicable: '暴雨内涝、低洼积水、排水设施故障', steps: 7, contacts: 6, resources: 18 },
      { id: 'EP005', title: '公共聚集场所安全预案', level: 'yellow', category: 'public', applicable: '人群踩踏、公共活动秩序、大型赛事', steps: 9, contacts: 8, resources: 20 },
      { id: 'EP006', title: '市政设施突发故障预案', level: 'blue', category: 'facility', applicable: '路灯故障、井盖破损、公交站牌损坏', steps: 5, contacts: 3, resources: 10 },
      { id: 'EP007', title: '消防安全应急预案', level: 'red', category: 'safety', applicable: '火灾事故、燃气泄漏、爆炸风险', steps: 11, contacts: 9, resources: 25 },
      { id: 'EP008', title: '重污染天气应对预案', level: 'orange', category: 'environment', applicable: '雾霾天气、AQI持续超标、沙尘天气', steps: 6, contacts: 5, resources: 9 }
    ];
    return plans;
  }, []);

  const filteredPlans = useMemo(() => {
    return emergencyPlans.filter(plan => {
      if (planCategory !== 'all' && plan.category !== planCategory) return false;
      if (planSearchKeyword) {
        const kw = planSearchKeyword.toLowerCase();
        return plan.title.toLowerCase().includes(kw) || plan.applicable.toLowerCase().includes(kw);
      }
      return true;
    });
  }, [emergencyPlans, planCategory, planSearchKeyword]);

  const historyColumns: ColumnsType<any> = [
    {
      title: '报表编号',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (v) => <span className="font-mono text-tech-400">{v}</span>
    },
    {
      title: '报表名称',
      dataIndex: 'title',
      key: 'title',
      render: (v, r) => (
        <div>
          <div className="text-text-primary font-medium">{v}</div>
          <div className="text-xs text-text-tertiary mt-0.5">
            编制人：{r.author} · {r.createdAt}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v) => (
        <Tag color={v === '日报' ? 'blue' : v === '周报' ? 'cyan' : v === '月报' ? 'purple' : 'orange'}>
          {v}
        </Tag>
      )
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => {
        const color = v === '已归档' ? 'green' : v === '待审核' ? 'orange' : 'blue';
        return <Tag color={color}>{v}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye className="w-3.5 h-3.5" />}>
            在线预览
          </Button>
          <Button type="link" size="small" icon={<Download className="w-3.5 h-3.5" />}>
            下载
          </Button>
        </Space>
      )
    }
  ];

  const handoverColumns: ColumnsType<any> = [
    { title: '日志编号', dataIndex: 'id', key: 'id', width: 140, render: (v) => <span className="font-mono text-tech-400">{v}</span> },
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    { title: '班次', dataIndex: 'shift', key: 'shift', width: 80, render: (v) => <Tag color={v === '早班' ? 'blue' : v === '中班' ? 'orange' : 'purple'}>{v}</Tag> },
    { title: '交班人', dataIndex: 'handoverPerson', key: 'handoverPerson', width: 100 },
    { title: '接班人', dataIndex: 'successor', key: 'successor', width: 100 },
    { title: '未完成事项', dataIndex: 'unfinishedCount', key: 'unfinishedCount', width: 110, render: (v) => v > 0 ? <span className="text-data-bad font-medium">{v} 项</span> : <span className="text-data-good">无</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => <Tag color="green">{v}</Tag> },
    { title: '完成时间', dataIndex: 'completedAt', key: 'completedAt', width: 160 }
  ];

  const handleOpenPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPlanModalVisible(true);
  };

  const handleConfirmHandover = () => {
    if (!selectedSuccessor) return;
    setHandoverStep(prev => Math.min(prev + 1, 3));
  };

  return (
    <div className="space-y-5">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: 'daily',
            label: (
              <span className="flex items-center gap-2 py-1">
                <FileText className="w-4 h-4" />
                日报
              </span>
            ),
            children: (
              <div className="space-y-5">
                <div className="grid grid-cols-5 gap-5">
                  <MetricCard
                    title="今日事件总数"
                    value={reportStats.total + 8}
                    icon={<AlertOctagon className="w-6 h-6" />}
                    iconGradient="from-cyan-500 to-blue-600"
                  />
                  <MetricCard
                    title="已完成处置"
                    value={reportStats.completed + 5}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    iconGradient="from-emerald-500 to-teal-600"
                  />
                  <MetricCard
                    title="平均响应时间"
                    value={reportStats.avgResponseTime}
                    suffix="分钟"
                    decimals={1}
                    icon={<Clock className="w-6 h-6" />}
                    iconGradient="from-amber-500 to-orange-600"
                  />
                  <MetricCard
                    title="平均处置时长"
                    value={reportStats.avgResolveTime}
                    suffix="分钟"
                    decimals={1}
                    icon={<ListChecks className="w-6 h-6" />}
                    iconGradient="from-violet-500 to-purple-600"
                  />
                  <MetricCard
                    title="市民满意度"
                    value={94.2}
                    suffix="%"
                    decimals={1}
                    icon={<Users className="w-6 h-6" />}
                    iconGradient="from-pink-500 to-rose-600"
                  />
                </div>

                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-8 space-y-5">
                    <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-1 h-5 bg-tech-400 rounded-full" />
                          核心运行指标
                        </h3>
                        <Tag color="blue">{formatDate(new Date(), 'YYYY年MM月DD日 WW')}</Tag>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-tech-500/20">
                              <th className="text-left py-3 px-4 text-text-tertiary font-medium">指标名称</th>
                              <th className="text-right py-3 px-4 text-text-tertiary font-medium">今日值</th>
                              <th className="text-right py-3 px-4 text-text-tertiary font-medium">昨日值</th>
                              <th className="text-right py-3 px-4 text-text-tertiary font-medium">周均值</th>
                              <th className="text-right py-3 px-4 text-text-tertiary font-medium">同比</th>
                              <th className="text-center py-3 px-4 text-text-tertiary font-medium">状态</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: '平均AQI指数', today: 78, yesterday: 85, weekAvg: 82, delta: -8.2, good: true },
                              { name: '道路平均车速(km/h)', today: 32.5, yesterday: 30.2, weekAvg: 31.8, delta: 7.6, good: true },
                              { name: '供水管网压力(MPa)', today: 0.32, yesterday: 0.31, weekAvg: 0.315, delta: 3.2, good: true },
                              { name: '噪声达标率(%)', today: 88.5, yesterday: 86.2, weekAvg: 87.1, delta: 2.7, good: true },
                              { name: '垃圾清运完成率(%)', today: 96.8, yesterday: 97.2, weekAvg: 96.5, delta: -0.4, good: true },
                              { name: '视频在线率(%)', today: 98.9, yesterday: 99.1, weekAvg: 98.8, delta: -0.2, good: true }
                            ].map((row, idx) => (
                              <tr key={idx} className="border-b border-tech-500/10 hover:bg-space-700/30 transition-colors">
                                <td className="py-3 px-4 text-text-secondary">{row.name}</td>
                                <td className="py-3 px-4 text-right font-mono text-text-primary font-medium">{row.today}</td>
                                <td className="py-3 px-4 text-right font-mono text-text-tertiary">{row.yesterday}</td>
                                <td className="py-3 px-4 text-right font-mono text-text-tertiary">{row.weekAvg}</td>
                                <td className={cn(
                                  'py-3 px-4 text-right font-mono font-medium',
                                  row.delta > 0 && row.good ? 'text-data-good' : row.delta > 0 ? 'text-data-bad' : row.good ? 'text-data-bad' : 'text-data-good'
                                )}>
                                  {row.delta > 0 ? '+' : ''}{row.delta}%
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Tag color={Math.abs(row.delta) > 5 ? 'orange' : 'green'}>
                                    {Math.abs(row.delta) > 5 ? '需关注' : '正常'}
                                  </Tag>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <span className="w-1 h-5 bg-tech-400 rounded-full" />
                            预警分级统计
                          </h3>
                        </div>
                        <PieChart
                          data={alertDistribution}
                          height={220}
                          type="donut"
                          legendPosition="right"
                        />
                      </div>

                      <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <span className="w-1 h-5 bg-tech-400 rounded-full" />
                            处置完成率
                          </h3>
                        </div>
                        <div className="flex items-center justify-center h-[220px]">
                          <div className="relative">
                            <Progress
                              type="circle"
                              percent={Math.round(reportStats.completionRate)}
                              size={200}
                              strokeColor={{
                                '0%': '#10b981',
                                '100%': '#00d4ff'
                              }}
                              trailColor="rgba(0, 212, 255, 0.1)"
                              format={(p) => (
                                <div className="text-center">
                                  <div className="text-4xl font-bold font-mono text-text-primary">{p}%</div>
                                  <div className="text-xs text-text-tertiary mt-1">处置完成率</div>
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-1 h-5 bg-tech-400 rounded-full" />
                          Top 重点事件
                        </h3>
                        <span className="text-xs text-text-tertiary">按优先级排序</span>
                      </div>
                      <div className="space-y-2">
                        {topEvents.map((event, idx) => {
                          const levelConfig = alertLevelConfigs[event.level];
                          const catConfig = eventCategoryConfigs[event.category];
                          return (
                            <div
                              key={event.id}
                              className="flex items-center gap-4 p-3 rounded-lg bg-space-700/40 border border-tech-500/10 hover:border-tech-400/30 transition-all cursor-pointer"
                            >
                              <span
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                                style={{ backgroundColor: levelConfig.bgColor, color: levelConfig.color }}
                              >
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-text-primary line-clamp-1 mb-1">
                                  {event.title}
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <Tag color={catConfig.color} style={{ backgroundColor: catConfig.bgColor, borderColor: catConfig.color + '30' }}>
                                    {catConfig.label}
                                  </Tag>
                                  <Tag color={levelConfig.color} style={{ backgroundColor: levelConfig.bgColor, borderColor: levelConfig.color + '30' }}>
                                    {levelConfig.label}
                                  </Tag>
                                  <span className="text-text-tertiary">{event.district.name}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className={cn(
                                  'text-sm font-medium',
                                  event.status === 'resolved' || event.status === 'closed' ? 'text-data-good' :
                                  event.status === 'pending' ? 'text-amber-400' : 'text-blue-400'
                                )}>
                                  {eventStatusConfigs[event.status].label}
                                </div>
                                <div className="text-xs text-text-tertiary mt-0.5">
                                  {formatDate(event.reportTime, 'MM-DD HH:mm')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 space-y-5">
                    <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-1 h-5 bg-tech-400 rounded-full" />
                          值班信息
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-space-700/40 border border-tech-500/10">
                          <div className="w-10 h-10 rounded-xl bg-tech-500/15 flex items-center justify-center">
                            <User className="w-5 h-5 text-tech-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-text-tertiary">值班人员</div>
                            <div className="text-sm font-medium text-text-primary">{currentDuty.personName}</div>
                          </div>
                          <Tag color="blue">
                            {currentDuty.shift === 'morning' ? '早班' : currentDuty.shift === 'afternoon' ? '中班' : '晚班'}
                          </Tag>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-space-700/40 border border-tech-500/10">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-text-tertiary">联系电话</div>
                            <div className="text-sm font-medium text-text-primary font-mono">{currentDuty.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-space-700/40 border border-tech-500/10">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-text-tertiary">值班开始时间</div>
                            <div className="text-sm font-medium text-text-primary">{formatDate(currentDuty.startTime, 'YYYY-MM-DD HH:mm')}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-1 h-5 bg-tech-400 rounded-full" />
                          编辑批注
                        </h3>
                        <span className="text-xs text-text-tertiary">{dailyAnnotation.length} 字</span>
                      </div>
                      <TextArea
                        value={dailyAnnotation}
                        onChange={(e) => setDailyAnnotation(e.target.value)}
                        placeholder="请输入今日值班批注内容..."
                        rows={8}
                        className="!bg-space-700/60 !border-tech-500/20 !text-text-primary"
                      />
                      <div className="flex items-center gap-3 mt-4">
                        <Button
                          type="primary"
                          icon={<Archive className="w-4 h-4" />}
                          className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none hover:!from-tech-400 hover:!to-tech-500 !shadow-glow-blue-sm"
                        >
                          提交归档
                        </Button>
                        <Button icon={<Download className="w-4 h-4" />}>导出PDF</Button>
                        <Button icon={<FileSpreadsheet className="w-4 h-4" />}>导出Word</Button>
                        <Button icon={<Printer className="w-4 h-4" />}>打印</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'history',
            label: (
              <span className="flex items-center gap-2 py-1">
                <CalendarDays className="w-4 h-4" />
                历史报表
              </span>
            ),
            children: (
              <div className="space-y-5">
                <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Select
                        placeholder="报表类型"
                        allowClear
                        style={{ width: 140 }}
                      >
                        <Option value="daily">日报</Option>
                        <Option value="weekly">周报</Option>
                        <Option value="monthly">月报</Option>
                        <Option value="special">专题报告</Option>
                      </Select>
                      <RangePicker style={{ width: 260 }} />
                      <Select
                        placeholder="编制状态"
                        allowClear
                        style={{ width: 140 }}
                      >
                        <Option value="archived">已归档</Option>
                        <Option value="pending">待审核</Option>
                        <Option value="draft">编制中</Option>
                      </Select>
                      <Input
                        placeholder="搜索报表..."
                        prefix={<Search className="w-4 h-4 text-text-tertiary" />}
                        style={{ width: 220 }}
                        allowClear
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button icon={<Download className="w-4 h-4" />}>批量下载</Button>
                      <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none"
                      >
                        新建报表
                      </Button>
                    </div>
                  </div>

                  <Checkbox.Group
                    defaultValue={['column1']}
                    style={{ marginBottom: 16 }}
                  >
                    <Checkbox value="selectAll">全选当前页</Checkbox>
                  </Checkbox.Group>

                  <Table
                    columns={historyColumns}
                    dataSource={historyReports}
                    pagination={{
                      pageSize: 10,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条报表`
                    }}
                    rowSelection={{
                      type: 'checkbox'
                    }}
                  />
                </div>
              </div>
            )
          },
          {
            key: 'handover',
            label: (
              <span className="flex items-center gap-2 py-1">
                <Handshake className="w-4 h-4" />
                值班交接
              </span>
            ),
            children: (
              <div className="space-y-5">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-7 space-y-5">
                    <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-1 h-5 bg-tech-400 rounded-full" />
                          交接班流程
                        </h3>
                      </div>

                      <div className="mb-8 px-4">
                        <Steps
                          current={handoverStep}
                          size="small"
                          items={[
                            { title: '信息确认', icon: <User className="w-4 h-4" /> },
                            { title: '事项交接', icon: <ListChecks className="w-4 h-4" /> },
                            { title: '签名确认', icon: <CheckCircle2 className="w-4 h-4" /> },
                            { title: '交接完成', icon: <Handshake className="w-4 h-4" /> }
                          ]}
                        />
                      </div>

                      {handoverStep === 0 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-space-700/40 border border-tech-500/15">
                              <div className="text-xs text-text-tertiary mb-2">交班人信息</div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-text-secondary">姓名</span>
                                  <span className="text-sm font-medium text-text-primary">{currentDuty.personName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-text-secondary">班次</span>
                                  <span className="text-sm font-medium text-text-primary">
                                    {currentDuty.shift === 'morning' ? '早班' : currentDuty.shift === 'afternoon' ? '中班' : '晚班'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-text-secondary">联系电话</span>
                                  <span className="text-sm font-medium text-text-primary font-mono">{currentDuty.phone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl bg-space-700/40 border border-tech-500/15">
                              <div className="text-xs text-text-tertiary mb-2">接班人选择</div>
                              <Select
                                value={selectedSuccessor}
                                onChange={setSelectedSuccessor}
                                placeholder="请选择接班人"
                                className="!w-full !mb-3"
                                size="large"
                              >
                                <Option value="lina">李娜 · 139****6666</Option>
                                <Option value="wangqiang">王强 · 137****5555</Option>
                                <Option value="zhaomin">赵敏 · 136****4444</Option>
                                <Option value="chengang">陈刚 · 135****3333</Option>
                              </Select>
                              {selectedSuccessor && (
                                <div className="text-xs text-text-tertiary">
                                  接班班次：{currentDuty.shift === 'morning' ? '中班' : currentDuty.shift === 'afternoon' ? '晚班' : '早班（次日）'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="primary"
                              size="large"
                              disabled={!selectedSuccessor}
                              onClick={handleConfirmHandover}
                              icon={<ChevronRight className="w-4 h-4" />}
                              className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none"
                            >
                              下一步
                            </Button>
                          </div>
                        </div>
                      )}

                      {handoverStep === 1 && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                              未完成事项（勾选需交接）
                            </div>
                            <div className="space-y-2">
                              {[
                                { id: 'item1', title: '交通拥堵事件 e001 仍在处置中', desc: '交警一大队正在现场处置' },
                                { id: 'item2', title: '井盖破损事件 e002 待更换', desc: '市政维护处已派单，预计17:00前完成' },
                                { id: 'item3', title: '废气排放超标举报 e003', desc: '环保局已受理，待采样检测' },
                                { id: 'item4', title: '低洼路段防汛值守中', desc: '暴雨预警持续生效中，巡查队待命' }
                              ].map(item => (
                                <Checkbox
                                  key={item.id}
                                  checked={unfinishedItems[item.id]}
                                  onChange={(e) => setUnfinishedItems(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                >
                                  <div className="inline-flex flex-col ml-1">
                                    <span className="text-sm text-text-primary">{item.title}</span>
                                    <span className="text-xs text-text-tertiary">{item.desc}</span>
                                  </div>
                                </Checkbox>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-text-primary mb-3">重要事项备注</div>
                            <TextArea
                              value={handoverRemark}
                              onChange={(e) => setHandoverRemark(e.target.value)}
                              placeholder="请输入重要事项备注信息..."
                              rows={4}
                              className="!bg-space-700/60 !border-tech-500/20"
                            />
                          </div>

                          <div className="flex justify-between">
                            <Button
                              size="large"
                              onClick={() => setHandoverStep(0)}
                            >
                              上一步
                            </Button>
                            <Button
                              type="primary"
                              size="large"
                              onClick={handleConfirmHandover}
                              icon={<ChevronRight className="w-4 h-4" />}
                              className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none"
                            >
                              下一步
                            </Button>
                          </div>
                        </div>
                      )}

                      {(handoverStep === 2 || handoverStep === 3) && (
                        <div className="space-y-4">
                          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Handshake className="w-6 h-6 text-emerald-400" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-text-primary">
                                  {handoverStep === 3 ? '交接班已完成！' : '请确认并签名'}
                                </div>
                                <div className="text-sm text-text-secondary">
                                  {handoverStep === 3 ? `交接时间：${formatDateTime(new Date())}` : '确认无误后点击完成交接'}
                                </div>
                              </div>
                            </div>
                            <Divider className="!border-tech-500/20 !my-4" />
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div className="text-xs text-text-tertiary mb-1">交班人签名</div>
                                <div className="h-12 rounded-lg bg-space-800/80 border border-tech-500/20 flex items-center px-4">
                                  <span className="text-tech-400 font-medium">{currentDuty.personName}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-text-tertiary mb-1">接班人签名</div>
                                <div className="h-12 rounded-lg bg-space-800/80 border border-tech-500/20 flex items-center px-4">
                                  <span className="text-emerald-400 font-medium">
                                    {selectedSuccessor === 'lina' ? '李娜' : selectedSuccessor === 'wangqiang' ? '王强' : selectedSuccessor === 'zhaomin' ? '赵敏' : '陈刚'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between">
                            {handoverStep === 2 ? (
                              <>
                                <Button size="large" onClick={() => setHandoverStep(1)}>上一步</Button>
                                <Button
                                  type="primary"
                                  size="large"
                                  onClick={handleConfirmHandover}
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  className="!bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none"
                                >
                                  确认完成交接
                                </Button>
                              </>
                            ) : (
                              <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                  setHandoverStep(0);
                                  setSelectedSuccessor('');
                                  setHandoverRemark('');
                                }}
                                icon={<Plus className="w-4 h-4" />}
                              >
                                开始新交接
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-5 space-y-5">
                    <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-1 h-5 bg-tech-400 rounded-full" />
                          历史交接日志
                        </h3>
                      </div>
                      <Table
                        columns={handoverColumns}
                        dataSource={handoverLogs}
                        pagination={{
                          pageSize: 6,
                          size: 'small'
                        }}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'plans',
            label: (
              <span className="flex items-center gap-2 py-1">
                <BookOpen className="w-4 h-4" />
                预案库
              </span>
            ),
            children: (
              <div className="space-y-5">
                <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Input
                        placeholder="搜索预案..."
                        value={planSearchKeyword}
                        onChange={(e) => setPlanSearchKeyword(e.target.value)}
                        prefix={<Search className="w-4 h-4 text-text-tertiary" />}
                        allowClear
                        style={{ width: 280 }}
                      />
                      <Radio.Group
                        value={planCategory}
                        onChange={(e) => setPlanCategory(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                      >
                        <Radio.Button value="all">全部</Radio.Button>
                        <Radio.Button value="traffic">交通</Radio.Button>
                        <Radio.Button value="pipeline">管线</Radio.Button>
                        <Radio.Button value="environment">环境</Radio.Button>
                        <Radio.Button value="safety">安全</Radio.Button>
                        <Radio.Button value="public">公共</Radio.Button>
                        <Radio.Button value="facility">设施</Radio.Button>
                      </Radio.Group>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-tertiary">共 {filteredPlans.length} 个预案</span>
                      <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        className="!bg-gradient-to-r !from-tech-500 !to-tech-600 !border-none"
                      >
                        新建预案
                      </Button>
                    </div>
                  </div>

                  {filteredPlans.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredPlans.map((plan) => {
                        const levelConfig = alertLevelConfigs[plan.level as AlertLevel];
                        const catConfig = eventCategoryConfigs[plan.category as EventCategory];
                        return (
                          <div
                            key={plan.id}
                            className="rounded-xl p-4 bg-space-700/40 border border-tech-500/15 hover:border-tech-400/40 transition-all cursor-pointer group"
                            onClick={() => handleOpenPlan(plan)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span
                                className="text-xs font-mono px-2 py-1 rounded"
                                style={{ backgroundColor: `${levelConfig.color}20`, color: levelConfig.color }}
                              >
                                {plan.id}
                              </span>
                              <Tag
                                color={levelConfig.color}
                                style={{ backgroundColor: levelConfig.bgColor, borderColor: `${levelConfig.color}30` }}
                              >
                                {levelConfig.label}级
                              </Tag>
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 min-h-[40px] group-hover:text-tech-300 transition-colors">
                              {plan.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: catConfig.bgColor, color: catConfig.color }}
                              >
                                {catConfig.label}
                              </span>
                            </div>
                            <p className="text-xs text-text-tertiary line-clamp-2 mb-4 min-h-[32px]">
                              适用：{plan.applicable}
                            </p>
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-tech-500/10">
                              <div className="text-center">
                                <div className="text-sm font-mono font-semibold text-tech-400">{plan.steps}</div>
                                <div className="text-[10px] text-text-tertiary">处置步骤</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-mono font-semibold text-blue-400">{plan.contacts}</div>
                                <div className="text-[10px] text-text-tertiary">联系人</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-mono font-semibold text-emerald-400">{plan.resources}</div>
                                <div className="text-[10px] text-text-tertiary">资源</div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-tech-500/10 flex items-center gap-2">
                              <Button
                                type="primary"
                                ghost
                                size="small"
                                block
                                icon={<Eye className="w-3.5 h-3.5" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPlan(plan);
                                }}
                              >
                                查看详情
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16">
                      <Empty description="暂无匹配的预案" />
                    </div>
                  )}
                </div>

                <Modal
                  open={planModalVisible}
                  onCancel={() => setPlanModalVisible(false)}
                  footer={[
                    <Button key="close" onClick={() => setPlanModalVisible(false)}>关闭</Button>,
                    <Button key="download" icon={<Download className="w-4 h-4" />}>下载预案</Button>,
                    <Button
                      key="start"
                      type="primary"
                      className="!bg-gradient-to-r !from-red-500 !to-orange-600 !border-none"
                    >
                      启动预案
                    </Button>
                  ]}
                  width={900}
                  destroyOnClose
                  title={selectedPlan ? (
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-tech-400" />
                      <span>{selectedPlan.title}</span>
                      <Tag color={alertLevelConfigs[selectedPlan.level as AlertLevel].color}>
                        {alertLevelConfigs[selectedPlan.level as AlertLevel].label}级预案
                      </Tag>
                    </div>
                  ) : '预案详情'}
                >
                  {selectedPlan && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-space-700/40 border border-tech-500/10 text-center">
                          <div className="text-xs text-text-tertiary mb-1">预案编号</div>
                          <div className="text-sm font-mono font-semibold text-tech-400">{selectedPlan.id}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-space-700/40 border border-tech-500/10 text-center">
                          <div className="text-xs text-text-tertiary mb-1">处置步骤</div>
                          <div className="text-sm font-mono font-semibold text-text-primary">{selectedPlan.steps} 步</div>
                        </div>
                        <div className="p-3 rounded-lg bg-space-700/40 border border-tech-500/10 text-center">
                          <div className="text-xs text-text-tertiary mb-1">联系人</div>
                          <div className="text-sm font-mono font-semibold text-blue-400">{selectedPlan.contacts} 人</div>
                        </div>
                        <div className="p-3 rounded-lg bg-space-700/40 border border-tech-500/10 text-center">
                          <div className="text-xs text-text-tertiary mb-1">配置资源</div>
                          <div className="text-sm font-mono font-semibold text-emerald-400">{selectedPlan.resources} 项</div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-4">
                        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-tech-400" />
                          处置步骤
                        </h4>
                        <Steps
                          direction="vertical"
                          size="small"
                          current={-1}
                          items={Array.from({ length: selectedPlan.steps }, (_, i) => ({
                            title: `第 ${i + 1} 步：${[
                              '事件上报与信息核实',
                              '启动预警与信息通报',
                              '调集应急处置力量',
                              '现场控制与人员疏散',
                              '专业处置与抢险救援',
                              '医疗救护与卫生防疫',
                              '环境监测与影响评估',
                              '舆情引导与信息发布',
                              '善后处置与恢复重建',
                              '事件总结与改进优化'
                            ][i] || '处置步骤'}`,
                            description: '按照标准操作流程执行，确保每个环节有据可查。'
                          }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-4">
                          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-tech-400" />
                            联系人清单
                          </h4>
                          <div className="space-y-2">
                            {Array.from({ length: Math.min(selectedPlan.contacts, 5) }, (_, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-space-700/40">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-tech-500/15 flex items-center justify-center">
                                    <User className="w-4 h-4 text-tech-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-text-primary">{['张明（应急办）', '李强（交警）', '王芳（环保局）', '赵磊（消防）', '刘敏（医疗）'][i]}</div>
                                    <div className="text-xs text-text-tertiary">{['主任', '支队长', '监察科长', '中队长', '急诊科主任'][i]}</div>
                                  </div>
                                </div>
                                <span className="text-xs font-mono text-text-secondary">{['138****0001', '138****0002', '138****0003', '138****0004', '138****0005'][i]}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl bg-space-800/50 border border-tech-500/20 p-4">
                          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-tech-400" />
                            资源清单
                          </h4>
                          <div className="space-y-2">
                            {Array.from({ length: Math.min(selectedPlan.resources, 6) }, (_, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-space-700/40">
                                <span className="text-sm text-text-primary">
                                  {['应急指挥车', '抢险救援车', '医疗救护车', '无人机巡查组', '消防水炮车', '应急发电设备'][i]}
                                </span>
                                <Tag color={['blue', 'orange', 'red', 'purple', 'cyan', 'green'][i]}>
                                  {[3, 8, 5, 4, 6, 2][i]} 台/组
                                </Tag>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Modal>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default Reports;
