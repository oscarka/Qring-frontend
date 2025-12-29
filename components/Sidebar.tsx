
import React, { useMemo } from 'react';
import { UserInfo, TargetInfo, Stats, ActivityData, SleepData, TimeRange, HRVData } from '../types';
import { ICONS, COLORS } from '../constants';
import Card from './common/Card';

interface SidebarProps {
  userInfo: UserInfo | null;
  targetInfo: TargetInfo | null;
  stats: Stats | null;
  activityData: ActivityData[];
  sleepData: SleepData[];
  hrvData: HRVData[];
  timeRange: TimeRange;
}

const ReadinessGauge: React.FC<{ score: number }> = ({ score }) => {
  const radius = 32; 
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const status = useMemo(() => {
    if (score >= 85) return { text: '身心恢复极佳', color: 'text-emerald-400' };
    if (score >= 70) return { text: '状态良好', color: 'text-sky-400' };
    if (score >= 50) return { text: '适度疲劳', color: 'text-amber-400' };
    return { text: '建议休息', color: 'text-rose-400' };
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center py-1">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            className={`${score >= 80 ? 'text-indigo-500' : score >= 60 ? 'text-sky-500' : 'text-amber-500'} drop-shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{Math.round(score)}</span>
          <span className="text-[9px] text-slate-500 font-black mt-1">READY</span>
        </div>
      </div>
      <p className={`text-[10px] font-black ${status.color} mt-2 uppercase tracking-widest animate-pulse`}>
        {status.text}
      </p>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ userInfo, targetInfo, stats, activityData, sleepData, hrvData, timeRange }) => {
  
  // 动态计算身心准备度 (基于HRV和睡眠)
  const readinessScore = useMemo(() => {
    if (hrvData.length === 0 || sleepData.length === 0) return 88;
    
    // 算法逻辑：HRV贡献50%，睡眠时长贡献50%
    const avgHrv = hrvData.reduce((acc, curr) => acc + curr.hrv, 0) / hrvData.length;
    // 后端返回的duration是分钟，需要转换为小时
    const avgSleep = sleepData.reduce((acc, curr) => acc + (curr.duration || 0), 0) / (sleepData.length * 60);
    
    // 归一化：假设 HRV 70ms 为满分，睡眠 8h 为满分
    const hrvScore = Math.min(100, (avgHrv / 70) * 100);
    const sleepScore = Math.min(100, (avgSleep / 8) * 100);
    
    return Math.round((hrvScore + sleepScore) / 2);
  }, [hrvData, sleepData]);

  const targets = useMemo(() => {
    if (!targetInfo) return [];
    
    const totalSteps = activityData.reduce((acc, curr) => acc + curr.totalStepCount, 0);
    // 后端返回的是卡路里(cal)，需要转换为千卡(kcal)，除以1000
    const totalCals = activityData.reduce((acc, curr) => acc + curr.calories, 0) / 1000;
    // 后端返回的duration是分钟，需要转换为小时
    const avgSleep = sleepData.length > 0 
      ? sleepData.reduce((acc, curr) => acc + (curr.duration || 0), 0) / (sleepData.length * 60)
      : 0;

    const stepTarget = targetInfo.stepTarget * timeRange;
    // 目标也是千卡(kcal)，所以不需要转换
    const calTarget = targetInfo.calorieTarget * timeRange;
    const sleepTarget = 8; 

    return [
      { label: '步数达成', val: totalSteps.toLocaleString(), p: Math.min(100, (totalSteps/stepTarget)*100), color: 'from-sky-400 to-indigo-600' },
      { label: '热量消耗', val: `${Math.round(totalCals)} kcal`, p: Math.min(100, (totalCals/calTarget)*100), color: 'from-orange-400 to-rose-600' },
      { label: '睡眠质量', val: `${avgSleep.toFixed(1)}h`, p: Math.min(100, (avgSleep/sleepTarget)*100), color: 'from-purple-400 to-indigo-600' }
    ];
  }, [targetInfo, activityData, sleepData, timeRange]);

  return (
    <div className="h-full flex flex-col space-y-3 overflow-hidden">
      <Card title="健康档案" icon={<ICONS.User className="w-3.5 h-3.5" />}>
        {userInfo ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '年龄', val: Math.round(userInfo.age) + '岁' },
              { label: '体重', val: Math.round(userInfo.weight) + 'kg' },
              { label: '身高', val: Math.round(userInfo.height) + 'cm' },
              { label: 'BMI', val: '22.4', color: 'text-emerald-400' }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/60 p-2 rounded-lg border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 font-bold mb-0.5">{item.label}</span>
                <span className={`text-[11px] font-black ${item.color || 'text-white'}`}>{item.val}</span>
              </div>
            ))}
          </div>
        ) : <div className="h-16 animate-pulse bg-white/5 rounded-lg" />}
      </Card>

      <Card title={`${timeRange}日进度`} icon={<ICONS.Target className="w-3.5 h-3.5" />}>
        <div className="space-y-3 px-1">
          {targets.map((g, i) => (
            <div key={i}>
              <div className="flex justify-between text-[9px] mb-1 font-black text-slate-400 uppercase tracking-tighter">
                <span>{g.label}</span>
                <span className="text-slate-200">{g.val}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full bg-gradient-to-r ${g.color} transition-all duration-700`} style={{ width: `${g.p}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="样本规模" icon={<ICONS.Calendar className="w-3.5 h-3.5" />}>
        {stats ? (
          <div className="space-y-1.5 px-1">
            {[
              { label: '心率样本', count: Math.round(stats.heartrate_count * (timeRange/7)), c: 'text-rose-400' },
              { label: 'HRV日志', count: Math.round(stats.hrv_count * (timeRange/7)), c: 'text-emerald-400' },
              { label: '压力快照', count: Math.round(stats.stress_count * (timeRange/7)), c: 'text-amber-400' },
              { label: '手动测量', count: Math.round(stats.manual_measurements_count), c: 'text-slate-200' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-0.5 group border-b border-white/5 last:border-0">
                <span className="text-[10px] text-slate-500 font-bold">{item.label}</span>
                <span className={`text-[10px] font-mono font-black ${item.c}`}>{item.count}</span>
              </div>
            ))}
          </div>
        ) : <div className="h-24 animate-pulse bg-white/5 rounded-lg" />}
      </Card>

      <Card title="身心准备度" icon={<ICONS.Zap className="w-3.5 h-3.5 text-indigo-400" />} className="flex-1">
        <ReadinessGauge score={readinessScore} />
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2 px-1 text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
           <div className="flex justify-between"><span>体表温度</span><span className="text-white not-italic">36.4°C</span></div>
           <div className="flex justify-between"><span>趋势分析</span><span className="text-emerald-400 not-italic">稳步回升</span></div>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
