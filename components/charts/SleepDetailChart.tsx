
import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { ICONS, COLORS } from '../../constants';
import { SleepData, TimeRange } from '../../types';

interface SleepDetailChartProps {
  data: SleepData[];
  isLoading: boolean;
  timeRange: TimeRange;
  onExpand?: () => void;
  isExpanded?: boolean;
}

const SleepDetailChart: React.FC<SleepDetailChartProps> = ({ data, isLoading, timeRange, onExpand, isExpanded = false }) => {
  const sleepMetrics = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // 计算平均值或取最新值
    const isMultiDay = timeRange > 1;
    const count = data.length;
    
    // 后端返回的是分钟，需要转换为秒用于计算
    const totalDurMinutes = data.reduce((acc, curr) => acc + (curr.duration || 0), 0) / count;
    const deepDurMinutes = data.reduce((acc, curr) => acc + (curr.deep || 0), 0) / count;
    const lightDurMinutes = data.reduce((acc, curr) => acc + (curr.light || 0), 0) / count;
    const remDurMinutes = data.reduce((acc, curr) => acc + (curr.rem || 0), 0) / count;
    const awakeDurMinutes = data.reduce((acc, curr) => acc + (curr.awake || 0), 0) / count;
    
    // 转换为秒（用于计算）
    const totalDur = totalDurMinutes * 60;
    const deepDur = deepDurMinutes * 60;
    const lightDur = lightDurMinutes * 60;
    const remDur = remDurMinutes * 60;
    const awakeDur = awakeDurMinutes * 60;

    const efficiency = Math.round(((totalDur - awakeDur) / (totalDur || 1)) * 100);
    const score = Math.round(efficiency * 0.7 + 25);
    
    const stages = [
      { label: '深睡', val: deepDur, color: '#9575CD', p: (deepDur / (totalDur || 1)) * 100 },
      { label: '浅睡', val: lightDur, color: '#7986CB', p: (lightDur / (totalDur || 1)) * 100 },
      { label: 'REM', val: remDur, color: '#B39DDB', p: (remDur / (totalDur || 1)) * 100 },
      { label: '清醒', val: awakeDur, color: '#FFB74D', p: (awakeDur / (totalDur || 1)) * 100 },
    ];

    return { 
      stages, 
      hrs: Math.floor(totalDur / 3600), 
      mins: Math.round((totalDur % 3600) / 60), 
      score: Math.min(100, score),
      isMultiDay
    };
  }, [data, timeRange]);

  return (
    <BaseChart
      title={sleepMetrics?.isMultiDay ? `${timeRange}日睡眠趋势` : "睡眠结构分析"}
      icon={<ICONS.Moon className="text-indigo-400" />}
      data={data}
      isLoading={isLoading}
      onExpand={onExpand}
      isExpanded={isExpanded}
      tableColumns={[
        { key: 'day', label: '日期' },
        { key: 'duration', label: '总时长', format: (v) => `${Math.floor((v || 0)/60)}h ${Math.round((v || 0)%60)}m` },
        { key: 'deep', label: '深睡', format: (v) => `${Math.round(v || 0)}m` },
        { key: 'rem', label: 'REM', format: (v) => `${Math.round(v || 0)}m` },
        { key: 'awake', label: '清醒', format: (v) => `${Math.round(v || 0)}m` }
      ]}
    >
      {sleepMetrics ? (
        <div className={`h-full flex flex-col justify-between ${isExpanded ? 'max-w-4xl mx-auto py-4' : ''}`}>
          <div className="flex justify-between items-start mb-4 px-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none">
                {sleepMetrics.isMultiDay ? `日均睡眠时长` : '昨日总时长'}
              </span>
              <div className="flex items-baseline space-x-1">
                <span className={`${isExpanded ? 'text-[32px]' : 'text-[18px]'} font-black text-white tabular-nums leading-none`}>{sleepMetrics.hrs}</span>
                <span className={`${isExpanded ? 'text-[12px]' : 'text-[9px]'} text-slate-600 font-black uppercase mr-1.5 leading-none`}>H</span>
                <span className={`${isExpanded ? 'text-[32px]' : 'text-[18px]'} font-black text-white tabular-nums leading-none`}>{sleepMetrics.mins}</span>
                <span className={`${isExpanded ? 'text-[12px]' : 'text-[9px]'} text-slate-600 font-black uppercase leading-none`}>M</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none">
                {sleepMetrics.isMultiDay ? '平均评分' : '睡眠评分'}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`${isExpanded ? 'text-[32px]' : 'text-[18px]'} font-black text-indigo-400 tabular-nums leading-none`}>{sleepMetrics.score}</span>
                <div className={`${isExpanded ? 'w-3 h-3' : 'w-1.5 h-1.5'} rounded-full ${sleepMetrics.score > 80 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]'}`}></div>
              </div>
            </div>
          </div>

          <div className={`${isExpanded ? 'h-4' : 'h-2'} w-full flex rounded-full overflow-hidden bg-white/5 border border-white/5 mb-6 relative shadow-inner`}>
            {sleepMetrics.stages.map((s, i) => (
              <div 
                key={i} 
                className="h-full transition-all duration-1000 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                style={{ width: `${s.p}%`, backgroundColor: s.color }} 
              />
            ))}
          </div>
          
          <div className={`grid ${isExpanded ? 'grid-cols-4' : 'grid-cols-2'} gap-2.5`}>
            {sleepMetrics.stages.map((s, i) => (
              <div key={i} className="flex items-center space-x-3 bg-white/[0.02] px-3 py-3 rounded-lg border border-white/5 group hover:bg-white/[0.04] transition-all">
                <div className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: s.color }}></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest truncate leading-none mb-1 group-hover:text-slate-400">{s.label}</span>
                  <div className="flex items-baseline space-x-0.5">
                    <span className={`${isExpanded ? 'text-[16px]' : 'text-[12px]'} font-black text-white tabular-nums leading-none`}>{Math.round(s.p)}</span>
                    <span className="text-[7px] text-slate-600 font-black uppercase tracking-tighter leading-none">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center opacity-10">
          <ICONS.Moon className="w-10 h-10" />
        </div>
      )}
    </BaseChart>
  );
};

export default SleepDetailChart;
