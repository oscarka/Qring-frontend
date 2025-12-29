
import { TimeRange } from './types';

export const parseISODate = (dateStr: string) => {
  if (!dateStr) return null;
  let formatted = dateStr.replace(' ', 'T');
  if (formatted.split(':').length > 3) {
      const parts = formatted.split(':');
      formatted = parts.slice(0, 3).join(':');
  }
  if (formatted.includes('T') && formatted.split(':').length === 2) {
      formatted += ':00';
  }
  const date = new Date(formatted);
  return isNaN(date.getTime()) ? null : date;
};

export const formatFullTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * 数据降采样/聚合工具
 */
export function aggregateData(data: any[], timeField: string, valueField: string, timeRange: TimeRange) {
  if (!data || data.length === 0) return [];
  
  const now = new Date();
  const nowTime = now.getTime();
  
  // 过滤掉未来时间的数据
  const filteredData = data.filter(item => {
    const date = parseISODate(item[timeField] as string);
    if (!date) return false;
    const itemTime = date.getTime();
    return itemTime <= nowTime; // 只保留当前时间之前的数据
  });
  
  // 如果是 24 小时且数据量不大，返回精简后的原始数据
  if (timeRange <= 1 && filteredData.length < 500) {
    return filteredData.map(d => ({
      [timeField]: d[timeField],
      [valueField]: Number(d[valueField]) > 0 ? Number(d[valueField]) : null
    }));
  }

  // 对于7天和30天视图，使用更小的聚合步长，确保数据点连续
  let step = 3600000; // 默认1小时
  if (timeRange > 1 && timeRange <= 7) step = 3600000; // 7天视图：1小时聚合
  else if (timeRange > 7) step = 3600000 * 2; // 30天视图：2小时聚合
  
  // 计算时间范围
  const timeRangeMs = timeRange * 24 * 3600000; // 时间范围（毫秒）
  const startTime = nowTime - timeRangeMs;
  
  const groups: Record<number, { sum: number, count: number, hasData: boolean }> = {};
  
  // 先处理所有数据
  filteredData.forEach(item => {
    const date = parseISODate(item[timeField] as string);
    if (!date) return;
    const itemTime = date.getTime();
    if (itemTime < startTime) return; // 超出时间范围的数据
    
    const bucket = Math.floor(itemTime / step) * step;
    
    if (!groups[bucket]) {
      groups[bucket] = { sum: 0, count: 0, hasData: false };
    }
    const val = Number(item[valueField]);
    if (val > 0) {
      groups[bucket].sum += val;
      groups[bucket].count += 1;
      groups[bucket].hasData = true;
    }
  });

  // 生成连续的时间序列，确保所有时间段都有数据点
  const result: any[] = [];
  for (let t = Math.floor(startTime / step) * step; t <= nowTime; t += step) {
    const bucket = t;
    if (groups[bucket]) {
      const g = groups[bucket];
      const avg = g.count > 0 ? Math.round(g.sum / g.count) : null;
      result.push({
        [timeField]: new Date(bucket).toISOString(),
        [valueField]: avg,
        isAggregated: true
      });
    } else {
      // 即使这个时间段没有数据，也创建一个null值的数据点，确保时间序列连续
      result.push({
        [timeField]: new Date(bucket).toISOString(),
        [valueField]: null,
        isAggregated: true
      });
    }
  }

  return result.sort((a, b) => new Date(a[timeField] as string).getTime() - new Date(b[timeField] as string).getTime());
}

/**
 * 间隙连接处理逻辑
 * 对于null值的数据点，如果前后有有效数据点且时间间隔在maxGapMs内，则用虚线连接
 */
export function processGaps(data: any[], timeKey: string, valKey: string, maxGapMs: number) {
  if (data.length < 2) return data;

  const result = data.map(d => ({ ...d, dashedValue: null }));
  
  // 先设置所有有效数据点的dashedValue
  for (let i = 0; i < result.length; i++) {
    if (result[i][valKey] !== null) {
      result[i].dashedValue = result[i][valKey];
    }
  }
  
  // 然后处理null值的数据点，计算连接线的值
  for (let i = 0; i < result.length; i++) {
    if (result[i][valKey] === null) {
      let prevIdx = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (result[j][valKey] !== null && result[j][valKey] !== undefined) {
          prevIdx = j;
          break;
        }
      }

      let nextIdx = -1;
      for (let j = i + 1; j < result.length; j++) {
        if (result[j][valKey] !== null && result[j][valKey] !== undefined) {
          nextIdx = j;
          break;
        }
      }

      if (prevIdx !== -1 && nextIdx !== -1) {
        // 计算时间差
        const t0 = new Date(result[prevIdx][timeKey] as string).getTime();
        const t1 = new Date(result[nextIdx][timeKey] as string).getTime();
        const dt = t1 - t0;

        if (dt > 0 && dt <= maxGapMs) {
          // 检查中间是否有其他有效数据点
          let hasValidBetween = false;
          for (let k = prevIdx + 1; k < nextIdx; k++) {
            if (result[k][valKey] !== null && result[k][valKey] !== undefined) {
              hasValidBetween = true;
              break;
            }
          }
          
          if (!hasValidBetween) {
            // 线性插值计算连接线的值
            const v0 = result[prevIdx][valKey] as number;
            const v1 = result[nextIdx][valKey] as number;
            const curT = new Date(result[i][timeKey] as string).getTime();
            const ratio = (curT - t0) / dt;
            result[i].dashedValue = v0 + (v1 - v0) * ratio;
          }
        }
      }
    }
  }
  
  return result;
}

export const getChartXAxisConfig = (range: TimeRange) => {
  switch (range) {
    case TimeRange.Day1: return { interval: 60, angle: 0, format: 'HH:mm' };
    case TimeRange.Days3: return { interval: 2, angle: 0, format: 'MM/DD' };
    case TimeRange.Days7:
    case TimeRange.Days10: return { interval: 1, angle: 0, format: 'MM/DD' };
    case TimeRange.Days30: return { interval: 5, angle: 0, format: 'MM/DD' };
    default: return { interval: 2, angle: 0, format: 'MM/DD' };
  }
};
