
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BaseChart from './BaseChart';
import { ICONS, COLORS } from '../../constants';
import { HeartRateData, TimeRange } from '../../types';
import { getChartXAxisConfig, parseISODate, formatFullTime, aggregateData, processGaps } from '../../utils';

interface HeartRateChartProps {
  data: HeartRateData[];
  isLoading: boolean;
  timeRange: TimeRange;
  onExpand?: () => void;
  isExpanded?: boolean;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isInterpolated = data.value === null;
    const val = isInterpolated ? data.dashedValue : data.value;
    const color = isInterpolated ? COLORS.textMuted : COLORS.heartRate;
    
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl min-w-[120px]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
          {data.fullTime || label}
        </p>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isInterpolated ? 'bg-slate-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`}></div>
            <span className="text-[10px] font-bold text-slate-400">{isInterpolated ? '推断心率' : '实测心率'}</span>
          </div>
          <span className="text-xs font-black tabular-nums" style={{ color }}>
            {val ? Math.round(val) : '--'} <span className="text-[9px] opacity-70">BPM</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const HeartRateChart: React.FC<HeartRateChartProps> = ({ data, isLoading, timeRange, onExpand, isExpanded = false }) => {
  const { processedData, yDomain } = useMemo(() => {
    const aggregated = aggregateData(data, 'timestamp', 'bpm', timeRange);
    const withGaps = processGaps(aggregated, 'timestamp', 'bpm', 3600000);
    
    const mapped = withGaps.map(d => {
      const date = parseISODate(d.timestamp);
      return {
        value: d.bpm,
        dashedValue: d.dashedValue,
        _sortTime: date ? date.getTime() : 0, // 使用下划线前缀标记非绘图字段
        displayTime: date ? date.toLocaleTimeString('zh-CN', { 
          month: timeRange > 1 ? '2-digit' : undefined,
          day: timeRange > 1 ? '2-digit' : undefined,
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }) : '',
        fullTime: date ? formatFullTime(date) : d.timestamp,
      };
    }).sort((a, b) => a._sortTime - b._sortTime);

    // 手动计算 Domain，彻底解决 Y 轴数字异常
    const allVals = mapped.flatMap(d => [d.value, d.dashedValue]).filter(v => v !== null && v !== undefined) as number[];
    const min = allVals.length > 0 ? Math.min(...allVals) : 60;
    const max = allVals.length > 0 ? Math.max(...allVals) : 100;
    
    return { 
      processedData: mapped, 
      yDomain: [Math.max(0, Math.floor(min - 10)), Math.ceil(max + 10)] 
    };
  }, [data, timeRange]);

  const stats = useMemo(() => {
    const valid = processedData.filter(d => d.value !== null);
    if (valid.length === 0) return null;
    const values = valid.map(d => d.value as number);
    return [
      { label: '峰值心率', value: Math.round(Math.max(...values)), colorClass: 'text-rose-400' },
      { label: '平均心率', value: Math.round(values.reduce((a, b) => a + b, 0) / values.length), colorClass: 'text-white' },
      { label: '静息心率', value: Math.round(Math.min(...values)), colorClass: 'text-sky-400' },
    ];
  }, [processedData]);

  return (
    <BaseChart
      title="心率分析"
      icon={<ICONS.Heart className="w-4 h-4 text-rose-500" />}
      data={processedData}
      isLoading={isLoading}
      stats={stats || undefined}
      onExpand={onExpand}
      isExpanded={isExpanded}
      tableColumns={[
        { key: 'fullTime', label: '采样时间' },
        { key: 'value', label: '心率 (BPM)', format: (v) => v ? `${v} BPM` : '--' }
      ]}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.heartRate} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.heartRate} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="displayTime" 
            tick={{ fill: COLORS.textMuted, fontSize: 10, fontWeight: 700 }}
            interval="preserveStartEnd"
            minTickGap={50}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            dataKey="value"
            domain={yDomain} 
            tick={{ fill: COLORS.textMuted, fontSize: 10, fontWeight: 700 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          <Area 
            type="monotone" 
            dataKey="dashedValue" 
            stroke={COLORS.textMuted} 
            strokeWidth={1} 
            strokeDasharray="4 4"
            fill="none"
            dot={false}
            activeDot={false}
            connectNulls={true}
            animationDuration={0}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={COLORS.heartRate} 
            strokeWidth={timeRange > 7 ? 1.5 : 2.5} 
            fill="url(#hrGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#fff' }}
            connectNulls={false}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default HeartRateChart;
