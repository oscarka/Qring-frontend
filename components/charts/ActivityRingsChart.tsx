
import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { ICONS, COLORS } from '../../constants';
import { ActivityData, TargetInfo, TimeRange } from '../../types';

interface ActivityRingsChartProps {
  data: ActivityData[];
  target: TargetInfo | null;
  isLoading: boolean;
  timeRange: TimeRange;
  onExpand?: () => void;
  isExpanded?: boolean;
}

const ActivityRingsChart: React.FC<ActivityRingsChartProps> = ({ data, target, isLoading, timeRange, onExpand, isExpanded = false }) => {
  const rings = useMemo(() => {
    if (!target || !data || data.length === 0) return null;
    
    // 聚合当前选定周期内的所有数据
    const totalSteps = data.reduce((acc, curr) => acc + (curr.totalStepCount || 0), 0);
    // 后端返回的是卡路里(cal)，需要转换为千卡(kcal)，除以1000
    const totalCals = data.reduce((acc, curr) => acc + (curr.calories || 0), 0) / 1000;
    const totalDist = data.reduce((acc, curr) => acc + (curr.distance || 0), 0);

    // 目标也需要乘以周期天数 (24h 视为 1天)
    const days = Math.max(1, timeRange);
    const stepTarget = target.stepTarget * days;
    // 目标也是千卡(kcal)，所以不需要转换
    const calTarget = target.calorieTarget * days;
    const distTarget = (target.distanceTarget || 8000) * days;

    return [
      { label: '步数目标', val: totalSteps, target: stepTarget, color: COLORS.activity, unit: '步' },
      { label: '距离目标', val: totalDist / 1000, target: distTarget / 1000, color: COLORS.bloodOxygen, unit: 'KM' },
      { label: '热量目标', val: totalCals, target: calTarget, color: COLORS.stress, unit: 'KCAL' }
    ];
  }, [data, target, timeRange]);

  const Ring: React.FC<{ progress: number, color: string, radius: number, stroke: number }> = ({ progress, color, radius, stroke }) => {
    const circumference = 2 * Math.PI * radius;
    // 允许环形稍微超过一圈来表达超越目标，但在 UI 上截断展示
    const p = Math.min(progress, 0.999);
    const offset = circumference - p * circumference;
    
    return (
      <svg width={(radius + stroke) * 2} height={(radius + stroke) * 2} className="absolute transform -rotate-90">
        <defs>
          <filter id={`glow-${color.replace('#', '')}-${isExpanded ? 'exp' : 'std'}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isExpanded ? "4" : "2"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} fill="transparent" />
        <circle
          cx={radius + stroke} cy={radius + stroke} r={radius} 
          stroke={color} strokeWidth={stroke} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          filter={`url(#glow-${color.replace('#', '')}-${isExpanded ? 'exp' : 'std'})`}
          className="transition-all duration-1000 ease-[cubic-bezier(0.34, 1.56, 0.64, 1)]"
        />
      </svg>
    );
  };

  const ringRadius = isExpanded ? 80 : 50;
  const ringStroke = isExpanded ? 12 : 7;
  const ringGap = isExpanded ? 18 : 11;

  return (
    <BaseChart
      title={timeRange > 1 ? `${timeRange}日达成率` : "活动达成进度"}
      icon={<ICONS.Target className="text-emerald-400" />}
      data={data}
      isLoading={isLoading}
      onExpand={onExpand}
      isExpanded={isExpanded}
      tableColumns={[
        { key: 'day', label: '日期' },
        { key: 'totalStepCount', label: '步数' },
        { key: 'calories', label: '热数 (KCAL)' },
        { key: 'distance', label: '距离 (M)', format: (v) => `${(v/1000).toFixed(2)} km` }
      ]}
    >
      {rings ? (
        <div className={`h-full flex items-center justify-between ${isExpanded ? 'max-w-4xl mx-auto px-8 py-4' : 'px-1'}`}>
          <div className={`relative ${isExpanded ? 'w-56 h-56' : 'w-28 h-28'} flex items-center justify-center shrink-0`}>
             <Ring progress={rings[0].val / (rings[0].target || 1)} color={rings[0].color} radius={ringRadius} stroke={ringStroke} />
             <Ring progress={rings[1].val / (rings[1].target || 1)} color={rings[1].color} radius={ringRadius - ringGap} stroke={ringStroke} />
             <Ring progress={rings[2].val / (rings[2].target || 1)} color={rings[2].color} radius={ringRadius - ringGap * 2} stroke={ringStroke} />
             <div className={`${isExpanded ? 'p-4' : 'bg-slate-900/50 p-2'} rounded-full border border-white/5`}>
                <ICONS.Zap className={`${isExpanded ? 'w-8 h-8' : 'w-4 h-4'} text-white/20`} />
             </div>
          </div>
          
          <div className={`flex-1 ${isExpanded ? 'ml-24' : 'ml-8'} space-y-6`}>
            {rings.map((r, i) => (
              <div key={i} className="flex flex-col group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`${isExpanded ? 'text-[11px]' : 'text-[9px]'} font-black text-slate-500 uppercase tracking-widest leading-none group-hover:text-slate-400 transition-colors`}>{r.label}</span>
                  <span className={`${isExpanded ? 'text-[11px]' : 'text-[8px]'} font-black text-slate-600 tabular-nums leading-none`}>{Math.round((r.val/(r.target || 1))*100)}%</span>
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className={`${isExpanded ? 'text-[28px]' : 'text-[16px]'} font-black text-white tabular-nums tracking-tighter leading-none`}>
                    {r.val.toLocaleString(undefined, { maximumFractionDigits: i === 1 ? 1 : 0 })}
                  </span>
                  <span className={`${isExpanded ? 'text-[10px]' : 'text-[8px]'} text-slate-600 font-black uppercase leading-none`}>{r.unit}</span>
                </div>
                <div className="h-[1px] w-full bg-white/[0.03] mt-3 group-last:hidden"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center opacity-20">
          <ICONS.Activity className="w-8 h-8" />
        </div>
      )}
    </BaseChart>
  );
};

export default ActivityRingsChart;
