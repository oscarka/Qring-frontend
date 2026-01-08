
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { healthApi, setUseMock } from '../services/api';
import { TimeRange, Stats, UserInfo, TargetInfo, ActivityData, SleepData } from '../types';
import { ICONS, COLORS } from '../constants';
import HeartRateChart from './charts/HeartRateChart';
import HRVChart from './charts/HRVChart';
import StressChart from './charts/StressChart';
import OxygenChart from './charts/OxygenChart';
import SleepDetailChart from './charts/SleepDetailChart';
import ActivityRingsChart from './charts/ActivityRingsChart';
import Sidebar from './Sidebar';
import Modal from './common/Modal';

interface User {
  user_id: string;
  display_name?: string;
  device_name?: string;
  created_at?: string;
  last_update?: string;
}

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Days7);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [useMock, setUseMockState] = useState(false); // Mock数据开关状态

  // 用户相关状态
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [heartRateData, setHeartRateData] = useState([]);
  const [hrvData, setHrvData] = useState([]);
  const [stressData, setStressData] = useState([]);
  const [bloodOxygenData, setBloodOxygenData] = useState([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [targetInfo, setTargetInfo] = useState<TargetInfo | null>(null);
  const [realtimeHeartRate, setRealtimeHeartRate] = useState<number | null>(null); // 实时心率值

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    try {
      const response = await healthApi.getUsers();
      const userList = response.data?.data || [];
      setUsers(userList);
      
      // 如果没有选中的用户，选择第一个或从localStorage恢复
      if (!selectedUserId) {
        const savedUserId = localStorage.getItem('qring_selected_user_id');
        if (savedUserId && userList.find((u: User) => u.user_id === savedUserId)) {
          setSelectedUserId(savedUserId);
        } else if (userList.length > 0) {
          setSelectedUserId(userList[0].user_id);
          localStorage.setItem('qring_selected_user_id', userList[0].user_id);
        }
      }
    } catch (error) {
      console.error('❌ 加载用户列表失败:', error);
    }
  }, [selectedUserId]);

  // 切换用户
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    localStorage.setItem('qring_selected_user_id', userId);
    // 重新加载数据
    fetchData();
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const hours = timeRange * 24;
    const days = timeRange;
    const currentUserId = selectedUserId;
    console.log('📊 开始获取数据, timeRange:', timeRange, 'hours:', hours, 'days:', days, 'user_id:', currentUserId);
    try {
      console.log('📊 [Dashboard] 开始并行获取所有数据...');
      const [hr, hrv, st, bo, stts, usr, tgt, act, slp] = await Promise.all([
        healthApi.getHeartRate(hours, currentUserId),
        healthApi.getHRV(hours, currentUserId),
        healthApi.getStress(hours, currentUserId),
        healthApi.getBloodOxygen(hours, currentUserId),
        healthApi.getStats(currentUserId),
        healthApi.getUserInfo(currentUserId),
        healthApi.getTargetInfo(currentUserId),
        healthApi.getActivity(days, currentUserId),
        healthApi.getSleep(days, currentUserId)
      ]);

      console.log('📊 [Dashboard] 数据获取完成:');
      console.log('  - 心率:', hr.data?.data?.length || 0, '条');
      console.log('  - HRV:', hrv.data?.data?.length || 0, '条');
      console.log('  - 压力:', st.data?.data?.length || 0, '条');
      console.log('  - 血氧:', bo.data?.data?.length || 0, '条');
      console.log('  - 活动:', act.data?.data?.length || 0, '条');
      console.log('  - 睡眠:', slp.data?.data?.length || 0, '条');

      // 详细检查心率数据
      const heartRateDataArray = hr.data?.data || [];
      console.log('📊 [Dashboard] 心率数据详情:');
      console.log('  - 数据总数:', heartRateDataArray.length);
      if (heartRateDataArray.length > 0) {
        console.log('  - 第一条数据:', heartRateDataArray[0]);
        console.log('  - 最后一条数据:', heartRateDataArray[heartRateDataArray.length - 1]);
        console.log('  - 数据示例（前3条）:', heartRateDataArray.slice(0, 3));
        
        // 检查数据字段
        const sample = heartRateDataArray[0];
        console.log('  - 数据字段检查:', {
          hasTimestamp: 'timestamp' in sample,
          hasBpm: 'bpm' in sample,
          timestampType: typeof sample.timestamp,
          bpmType: typeof sample.bpm,
          bpmValue: sample.bpm
        });
        
        // 统计数据
        const zeroCount = heartRateDataArray.filter((d: any) => d.bpm === 0).length;
        const nonZeroCount = heartRateDataArray.filter((d: any) => d.bpm > 0).length;
        console.log('  - 数据统计: 非0值=' + nonZeroCount + '条, 0值=' + zeroCount + '条');
      } else {
        console.warn('  ⚠️ [Dashboard] 心率数据为空！');
      }

      setHeartRateData(heartRateDataArray);
      setHrvData(hrv.data?.data || []);
      setStressData(st.data?.data || []);
      setBloodOxygenData(bo.data?.data || []);
      setStats(stts.data?.data || null);
      setUserInfo(usr.data?.data || null);
      setTargetInfo(tgt.data?.data || null);
      setActivityData(act.data?.data || []);
      setSleepData(slp.data?.data || []);
    } catch (error: any) {
      console.error("❌ 同步异常:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedUserId]);

  // 初始化：加载用户列表
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 当 useMock 改变时，同步到 API 服务并重新获取数据
  useEffect(() => {
    setUseMock(useMock);
    // 延迟一下再获取数据，确保状态已同步
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [useMock]);

  useEffect(() => {
    fetchData();
    
    // 自动刷新：每30秒刷新一次数据
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000); // 30秒
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchData]);

  // 获取实时心率数据（更频繁的刷新，每5秒）
  useEffect(() => {
    const fetchRealtimeHeartRate = async () => {
      try {
        // 注意：后端过滤时用的是measurementType字段，iOS上传时measurementType是"realtime"
        const response = await healthApi.getManualMeasurements(1, 'realtime'); // 获取最近1小时的实时心率数据
        console.log('📊 实时心率API响应:', response.data);
        if (response.data?.success && response.data?.data && response.data.data.length > 0) {
          // 过滤出type为"realtime_heartrate"的数据
          const realtimeHeartRateData = response.data.data.filter((item: any) => 
            item.type === 'realtime_heartrate'
          );
          
          if (realtimeHeartRateData.length > 0) {
            // 获取最新的实时心率值（按时间戳排序，取最新的）
            const sorted = realtimeHeartRateData.sort((a: any, b: any) => {
              const timeA = new Date(a.timestamp || a.received_at || 0).getTime();
              const timeB = new Date(b.timestamp || b.received_at || 0).getTime();
              return timeB - timeA; // 降序，最新的在前
            });
            const latest = sorted[0];
            console.log('📊 最新实时心率数据:', latest);
            // 尝试多个可能的字段名
            const heartRateValue = latest.heartRate || latest.heartrate || latest.bpm || latest.hr;
            if (heartRateValue !== undefined && heartRateValue !== null) {
              setRealtimeHeartRate(heartRateValue);
              console.log('📊 实时心率更新:', heartRateValue, 'BPM');
            } else {
              console.warn('⚠️ 实时心率数据中没有找到心率值字段:', latest);
            }
          } else {
            console.log('ℹ️ 没有找到实时心率数据');
          }
        } else {
          console.log('ℹ️ API返回数据为空或失败');
        }
      } catch (error: any) {
        console.error('❌ 获取实时心率失败:', error.message);
      }
    };

    // 立即获取一次
    fetchRealtimeHeartRate();

    // 每5秒刷新一次实时心率
    const realtimeInterval = setInterval(() => {
      fetchRealtimeHeartRate();
    }, 5000); // 5秒

    return () => {
      clearInterval(realtimeInterval);
    };
  }, []);

  const summaryMetrics = useMemo(() => {
    const totalSteps = activityData.reduce((acc, curr) => acc + (curr.totalStepCount || 0), 0);
    // 后端返回的是卡路里(cal)，需要转换为千卡(kcal)，除以1000
    const totalCalories = activityData.reduce((acc, curr) => acc + (curr.calories || 0), 0) / 1000;
    const totalActiveTime = activityData.reduce((acc, curr) => acc + (curr.activeTime || 0), 0);
    const totalDistance = activityData.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    
    // 后端返回的duration是分钟，需要转换为秒
    const avgSleep = sleepData.length > 0 
      ? sleepData.reduce((acc, curr) => acc + ((curr.duration || 0) * 60), 0) / sleepData.length 
      : 0;
    const sleepHrs = Math.floor(avgSleep / 3600);
    const sleepMins = Math.round((avgSleep % 3600) / 60);

    const restingHR = heartRateData.length > 0 
      ? Math.round(Math.min(...heartRateData.filter(d => d.bpm > 0).map(d => d.bpm)))
      : 50;

    return [
      { icon: <ICONS.Activity />, label: '累计步数', val: totalSteps.toLocaleString(), color: 'text-sky-400' },
      { icon: <ICONS.Zap />, label: '活跃时长', val: `${Math.round(totalActiveTime / 60)} 分钟`, color: 'text-amber-400' },
      { icon: <ICONS.Droplet />, label: '能量消耗', val: `${Math.round(totalCalories)} kcal`, color: 'text-orange-400' },
      { icon: <ICONS.Moon />, label: '平均睡眠', val: `${sleepHrs}h ${sleepMins}m`, color: 'text-indigo-400' },
      { icon: <ICONS.Target />, label: '累计距离', val: `${(totalDistance / 1000).toFixed(1)} km`, color: 'text-emerald-400' },
      { icon: <ICONS.Heart />, label: '静息心率', val: `${restingHR} bpm`, color: 'text-rose-400' },
    ];
  }, [activityData, sleepData, heartRateData, timeRange]);

  const renderExpandedContent = () => {
    switch(expandedChart) {
      case 'hr': return <HeartRateChart data={heartRateData} isLoading={isLoading} timeRange={timeRange} isExpanded />;
      case 'hrv': return <HRVChart data={hrvData} isLoading={isLoading} timeRange={timeRange} isExpanded />;
      case 'stress': return <StressChart data={stressData} isLoading={isLoading} timeRange={timeRange} isExpanded />;
      case 'oxygen': return <OxygenChart data={bloodOxygenData} isLoading={isLoading} timeRange={timeRange} isExpanded />;
      case 'sleep': return <SleepDetailChart data={sleepData} isLoading={isLoading} timeRange={timeRange} isExpanded />;
      case 'activity': return <ActivityRingsChart data={activityData} target={targetInfo} isLoading={isLoading} timeRange={timeRange} isExpanded />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* 用户选择器 */}
      {users.length > 0 && (
        <div className="shrink-0 flex items-center justify-between glass-card px-4 py-2 rounded-xl border-white/10 bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">用户:</span>
            <select
              value={selectedUserId || ''}
              onChange={(e) => handleUserChange(e.target.value)}
              className="bg-slate-700/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.display_name || user.device_name || user.user_id.substring(0, 8)}
                </option>
              ))}
            </select>
          </div>
          {selectedUserId && (
            <div className="text-xs text-slate-500">
              {users.find(u => u.user_id === selectedUserId)?.last_update 
                ? `最后更新: ${new Date(users.find(u => u.user_id === selectedUserId)!.last_update!).toLocaleString()}`
                : ''}
            </div>
          )}
        </div>
      )}
      
      {/* 顶部指标总结 */}
      <div className="shrink-0 flex items-center space-x-3 overflow-x-auto no-scrollbar pb-1">
        {summaryMetrics.map((m, i) => (
          <div key={i} className="flex-1 min-w-[140px] glass-card px-4 py-3 rounded-xl flex items-center space-x-3 border-white/10 bg-slate-800/40 hover:bg-slate-700/60 transition-all cursor-default group">
            <div className={`p-1.5 rounded-lg bg-white/5 ${m.color} group-hover:scale-110 transition-transform`}>{React.cloneElement(m.icon as React.ReactElement, { className: 'w-4 h-4' })}</div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate mb-0.5">{m.label}</span>
              <span className="text-[13px] font-black text-white truncate tracking-tight">{m.val}</span>
            </div>
          </div>
        ))}
        
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-white/10 shrink-0">
          {[
            { v: 1, l: '24时' },
            { v: 7, l: '7天' },
            { v: 30, l: '30天' }
          ].map(d => (
            <button 
              key={d.v} 
              onClick={() => setTimeRange(d.v)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${timeRange === d.v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
            >
              {d.l}
            </button>
          ))}
          <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-sky-400">
            <ICONS.RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {/* 数据源切换按钮 */}
          <button
            onClick={() => {
              setUseMockState(!useMock);
            }}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all border ml-1 ${
              useMock 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
            title={useMock ? '当前使用Mock数据，点击切换到实时数据' : '当前使用实时数据，点击切换到Mock数据'}
          >
            {useMock ? '📊 Mock' : '🔌 实时'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">
        {/* 左侧边栏 */}
        <div className="col-span-2 flex flex-col min-h-0">
          <Sidebar 
            userInfo={userInfo} 
            targetInfo={targetInfo} 
            stats={stats} 
            activityData={activityData} 
            sleepData={sleepData} 
            hrvData={hrvData}
            timeRange={timeRange} 
          />
        </div>

        {/* 主看板区域 */}
        <div className="col-span-10 flex flex-col min-h-0">
          {/* 第一排：心率趋势 + 睡眠详情 */}
          <div className="flex-[3] min-h-0 grid grid-cols-10 gap-3 mb-3">
            <div className="col-span-6 h-full min-h-[400px]">
              <HeartRateChart data={heartRateData} isLoading={isLoading} timeRange={timeRange} onExpand={() => setExpandedChart('hr')} />
            </div>
            <div className="col-span-4 h-full">
              <SleepDetailChart data={sleepData} isLoading={isLoading} timeRange={timeRange} onExpand={() => setExpandedChart('sleep')} />
            </div>
          </div>

          {/* 第二排：四个小指标展示（包含运动环） */}
          <div className="flex-[2] min-h-0 max-h-[350px] grid grid-cols-4 gap-3">
            <div className="h-full max-h-[350px]">
              <HRVChart data={hrvData} isLoading={isLoading} timeRange={timeRange} onExpand={() => setExpandedChart('hrv')} />
            </div>
            <div className="h-full max-h-[350px]">
              <StressChart data={stressData} isLoading={isLoading} timeRange={timeRange} onExpand={() => setExpandedChart('stress')} />
            </div>
            <div className="h-full max-h-[350px]">
              <OxygenChart data={bloodOxygenData} isLoading={isLoading} timeRange={timeRange} onExpand={() => setExpandedChart('oxygen')} />
            </div>
            <div className="h-full max-h-[350px]">
              <ActivityRingsChart data={activityData} target={targetInfo} isLoading={isLoading} timeRange={timeRange} onExpand={() => setExpandedChart('activity')} />
            </div>
          </div>

          {/* 底部状态条 */}
          <div className="h-10 shrink-0 mt-12 glass-card rounded-xl flex items-center justify-between px-6 border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center space-x-12">
               <span className="flex items-center space-x-2 text-slate-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                 <span>实时心率: {realtimeHeartRate !== null ? `${realtimeHeartRate} BPM` : '-- BPM'}</span>
               </span>
               <span className="flex items-center space-x-2 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span>血氧饱和度: 稳定状态</span></span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-slate-600 font-mono tracking-tighter">周期: {timeRange}天数据聚合可视化</span>
              <span className="text-indigo-400/90 tracking-widest px-3 py-1 bg-indigo-500/5 rounded-md border border-indigo-500/10">QRING 安全链路已加密</span>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={!!expandedChart} 
        onClose={() => setExpandedChart(null)} 
        title={
          expandedChart === 'hr' ? '心率深度报告' : 
          expandedChart === 'hrv' ? 'HRV 离散度分析' : 
          expandedChart === 'stress' ? '压力负荷与恢复建议' : 
          expandedChart === 'oxygen' ? '血氧饱和度监测详情' :
          expandedChart === 'sleep' ? '睡眠结构深度报告' : '活动达成详情分析'
        }
      >
        {renderExpandedContent()}
      </Modal>
    </div>
  );
};

export default Dashboard;
