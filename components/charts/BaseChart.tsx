
import React, { useState } from 'react';
import { ICONS } from '../../constants';
import Card from '../common/Card';

interface BaseChartProps {
  title: string;
  icon: React.ReactNode;
  data: any[];
  isLoading: boolean;
  children: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    colorClass?: string;
  }[];
  tableColumns: { key: string; label: string; format?: (v: any) => string }[];
  countLabel?: string;
  onExpand?: () => void;
  isExpanded?: boolean;
}

const BaseChart: React.FC<BaseChartProps> = ({ 
  title, 
  icon, 
  data, 
  isLoading, 
  children, 
  stats, 
  tableColumns,
  countLabel = "条记录",
  onExpand,
  isExpanded = false
}) => {
  if (isLoading) {
    return (
      <Card title={title} icon={icon} className="h-full flex flex-col justify-center items-center">
        <ICONS.RefreshCw className="w-5 h-5 animate-spin text-indigo-500/50 mb-3" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">数据处理中...</p>
      </Card>
    );
  }

  const headerExtra = (
    <div className="flex items-center space-x-2">
      {onExpand && (
        <button 
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-slate-500 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
          title="展开全屏"
        >
          <ICONS.TrendingUp className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <Card 
      title={title} 
      icon={icon} 
      extra={headerExtra}
      className={`h-full ${isExpanded ? 'p-0 border-none bg-transparent shadow-none' : ''}`}
    >
      <div className="h-full flex flex-col">
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                <span className="text-[9px] text-slate-500 uppercase font-black truncate leading-tight mb-1">{stat.label}</span>
                <span className={`text-[12px] font-mono font-black truncate ${stat.colorClass || 'text-white'}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 w-full relative" style={{ minHeight: isExpanded ? '400px' : '200px', maxHeight: isExpanded ? 'none' : '250px' }}>
          {children}
        </div>

        {isExpanded && (
          <div className="mt-8 border-t border-white/10 pt-6 overflow-hidden flex flex-col min-h-0">
             <div className="flex justify-between items-center mb-5 px-3">
                <div className="flex flex-col">
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest">原始数据报表</h4>
                  <span className="text-[10px] text-slate-500 mt-1 font-bold">精准采样记录清单</span>
                </div>
                <div className="bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                   <span className="text-[10px] text-indigo-400 font-mono font-bold">采样点总数: {data.length}</span>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl border border-white/10 bg-black/40 shadow-inner">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 text-slate-400 z-10">
                    <tr>
                      {tableColumns.map(col => (
                        <th key={col.key} className="px-6 py-4 font-black uppercase tracking-wider">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {[...data].reverse().slice(0, 100).map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.04] transition-colors group">
                        {tableColumns.map(col => (
                          <td key={col.key} className="px-6 py-3.5 font-mono text-slate-300 group-hover:text-white transition-colors">
                            {col.format ? col.format(row[col.key]) : row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BaseChart;
