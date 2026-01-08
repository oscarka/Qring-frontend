
import React, { useState, useEffect, useCallback } from 'react';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';
import { healthApi } from './services/api';

interface User {
  user_id: string;
  display_name?: string;
  device_name?: string;
  created_at?: string;
  last_update?: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    setShowUserMenu(false);
    // Dashboard 会通过 useEffect 监听 selectedUserId 变化并重新加载数据
  };

  // 初始化：加载用户列表
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const currentUser = users.find(u => u.user_id === selectedUserId);
  const displayName = currentUser?.display_name || currentUser?.device_name || currentUser?.user_id?.substring(0, 8) || '选择用户';

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
          {/* 用户菜单 */}
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full cursor-pointer transition-all border border-white/10 hover:border-indigo-500/50"
              title={displayName}
            >
              <ICONS.User className="w-4 h-4 text-slate-300" />
            </button>
            {/* 用户下拉菜单 */}
            {showUserMenu && users.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">切换用户</div>
                  <div className="text-xs text-slate-400 truncate">{displayName}</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => handleUserChange(user.user_id)}
                      className={`w-full px-3 py-2.5 text-left text-xs transition-all ${
                        selectedUserId === user.user_id
                          ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-semibold truncate">
                        {user.display_name || user.device_name || user.user_id.substring(0, 8)}
                      </div>
                      {user.last_update && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(user.last_update).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 内容区 */}
      <main className="flex-1 min-h-0 overflow-hidden px-4 py-4">
        <Dashboard selectedUserId={selectedUserId} />
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
