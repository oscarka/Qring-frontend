
import React from 'react';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white flex flex-col selection:bg-indigo-500/30">
      {/* 环境光效优化 */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      {/* 标题栏 */}
      <header className="h-12 shrink-0 px-4 border-b border-white/5 backdrop-blur-2xl bg-slate-950/60 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ICONS.Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-sm font-black tracking-tighter uppercase italic">
            Qring<span className="text-indigo-400">OS</span> <span className="text-[10px] not-italic text-slate-500 font-bold ml-1 opacity-70">健康中枢</span>
          </h1>
          <div className="h-4 w-px bg-white/10 mx-1"></div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">实时同步中</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-500">
             <span className="flex items-center space-x-1"><ICONS.Zap className="w-3.5 h-3.5 text-amber-400" /><span>84% 电量</span></span>
             <span className="flex items-center space-x-1"><ICONS.RefreshCw className="w-3.5 h-3.5 text-emerald-400" /><span>设备已连接</span></span>
          </div>
          <div className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full cursor-pointer transition-all border border-white/10 hover:border-indigo-500/50">
            <ICONS.User className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </header>

      {/* 内容区 */}
      <main className="flex-1 min-h-0 overflow-hidden px-4 py-4">
        <Dashboard />
      </main>

      {/* 页脚 */}
      <footer className="h-6 shrink-0 bg-black/40 px-6 flex items-center justify-between text-[9px] text-slate-600 border-t border-white/5 uppercase font-bold tracking-[0.2em]">
        <span>© 2025 QRING LABORATORY · 智能传感交互系统</span>
        <span className="font-mono text-slate-500 opacity-50 tracking-normal">KERNEL_STATUS: NOMINAL // MEMORY_SYNC: OK</span>
      </footer>
    </div>
  );
};

export default App;
