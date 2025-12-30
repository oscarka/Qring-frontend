
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BaseChart from './BaseChart';
import { ICONS, COLORS } from '../../constants';
import { StressData, TimeRange } from '../../types';
import { getChartXAxisConfig, parseISODate, formatFullTime, aggregateData, processGaps } from '../../utils';

interface StressChartProps {
  data: StressData[];
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
    const color = isInterpolated ? COLORS.textMuted : COLORS.stress;
    
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl min-w-[120px]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
          {data.fullTime || label}
        </p>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isInterpolated ? 'bg-slate-500' : 'bg-orange-500'}`}></div>
            <span className="text-[10px] font-bold text-slate-400">{isInterpolated ? '推断压力' : '实测压力'}</span>
          </div>
          <span className="text-xs font-black tabular-nums" style={{ color }}>
            {val ? Math.round(val) : '--'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const StressChart: React.FC<StressChartProps> = ({ data, isLoading, timeRange, onExpand, isExpanded = false }) => {
  const processedData = useMemo(() => {
    const aggregated = aggregateData(data, 'date', 'stress', timeRange);
    const withGaps = processGaps(aggregated, 'date', 'stress', 10800000); // 3h
    
    return withGaps.map(d => {
      let date = parseISODate(d.date);
      return {
        value: d.stress,
        dashedValue: d.dashedValue,
        time: date ? date.getTime() : 0,
        displayTime: date ? date.toLocaleTimeString('zh-CN', { 
          month: timeRange > 1 ? '2-digit' : undefined,
          day: timeRange > 1 ? '2-digit' : undefined,
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '',
        fullTime: date ? formatFullTime(date) : d.date,
      };
    }).sort((a, b) => a.time - b.time);
  }, [data, timeRange]);

  const stats = useMemo(() => {
    const valid = processedData.filter(d => d.value !== null);
    if (valid.length === 0) return null;
    const values = valid.map(d => d.value as number);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return [
      { label: '压力均值', value: avg, colorClass: 'text-orange-400' },
      { label: '身心状态', value: avg < 30 ? '放松' : avg < 60 ? '平衡' : '负荷' },
    ];
  }, [processedData]);

  return (
    <BaseChart
      title="压力负荷"
      icon={<ICONS.Activity className="w-4 h-4 text-orange-400" />}
      data={processedData}
      isLoading={isLoading}
      stats={stats || undefined}
      onExpand={onExpand}
      isExpanded={isExpanded}
      tableColumns={[
        { key: 'fullTime', label: '监测时间' },
        { key: 'value', label: '指数', format: (v) => v ? v : '--' }
      ]}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={200} maxHeight={250}>
        <AreaChart data={processedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.stress} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={COLORS.stress} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="displayTime" 
            hide={!isExpanded} 
            minTickGap={30}
            tick={{ fill: COLORS.textMuted, fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            dataKey="value"
            domain={[0, 100]} 
            tick={{ fill: COLORS.textMuted, fontSize: 9, fontWeight: 700 }} 
            axisLine={false}
            tickLine={false}
            width={25}
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
            connectNulls={true}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={COLORS.stress} 
            fill="url(#colorStress)" 
            strokeWidth={timeRange > 7 ? 1 : 2} 
            connectNulls={false} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default StressChart;
