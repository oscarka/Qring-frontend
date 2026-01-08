
import axios from 'axios';
import { API_BASE } from '../constants';
import * as mock from './mockData';

console.log('🔧 API配置:', {
  API_BASE,
  USE_MOCK: false,
  '当前环境': (import.meta as any).env?.MODE || 'unknown'
});

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 增加到30秒（适配中国大陆网络环境）
});

// 添加请求拦截器，记录请求
api.interceptors.request.use(
  (config) => {
    console.log(`📡 [API] 请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [API] 请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器，处理错误和超时
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(`⏱️ [API] 请求超时: ${error.config?.url}`);
      console.error(`   超时时间: ${error.config?.timeout}ms`);
    } else if (error.response) {
      console.error(`❌ [API] 服务器错误: ${error.config?.url} - ${error.response.status}`);
    } else if (error.request) {
      console.error(`❌ [API] 网络错误: ${error.config?.url} - 无法连接到服务器`);
    } else {
      console.error(`❌ [API] 错误: ${error.config?.url} - ${error.message}`);
    }
    return Promise.reject(error);
  }
);

// 动态切换 Mock 数据的状态
let USE_MOCK = false;

// 导出函数用于切换 Mock 数据
export const setUseMock = (value: boolean) => {
  USE_MOCK = value;
  console.log('🔄 Mock数据模式:', value ? '开启' : '关闭');
};

const wrapResponse = (data: any) => ({
  data: { success: true, data: data }
});

// 获取当前选择的用户ID（从localStorage）
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('qring_selected_user_id');
  }
  return null;
};

export const healthApi = {
  // 获取用户列表
  getUsers: async () => {
    try {
      const response = await api.get(`/users`);
      console.log('✅ 用户列表获取成功:', response.data?.data?.length || 0, '个用户');
      return response;
    } catch (error: any) {
      console.error('❌ 用户列表获取失败:', error.message);
      return wrapResponse([]);
    }
  },

  getHeartRate: async (hours: number = 168, userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockHeartRate(hours));
    try { 
      console.log('📡 [前端API] 开始请求心率数据, hours:', hours);
      const url = `${API_BASE}/heartrate`;
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = { hours, include_zero: "true" };
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      console.log('📡 [前端API] 开始请求心率数据, hours:', hours, 'user_id:', currentUserId);
      console.log('📡 [前端API] 请求URL:', url, '参数:', params);
      
      const response = await api.get(`/heartrate`, { params });
      
      console.log('✅ [前端API] 心率数据获取成功');
      console.log('   - 响应状态:', response.status);
      console.log('   - 数据条数:', response.data?.data?.length || 0);
      console.log('   - 有效数据(bpm>0):', response.data?.valid_count || 0);
      console.log('   - 响应时间戳:', response.data?.timestamp || 'N/A');
      
      if (response.data?.data && response.data.data.length > 0) {
        console.log('   - 第一条数据:', response.data.data[0]);
        console.log('   - 最后一条数据:', response.data.data[response.data.data.length - 1]);
        const sample = response.data.data.slice(0, 3);
        console.log('   - 数据示例（前3条）:', sample);
        
        // 统计数据
        const zeroCount = response.data.data.filter((d: any) => d.bpm === 0).length;
        const nonZeroCount = response.data.data.filter((d: any) => d.bpm > 0).length;
        console.log('   - 数据统计: 非0值=' + nonZeroCount + '条, 0值=' + zeroCount + '条');
      } else {
        console.warn('   ⚠️ [前端API] 响应数据为空！');
      }
      
      return response;
    }
    catch (error: any) { 
      console.error('❌ [前端API] 心率数据获取失败');
      console.error('   - 错误信息:', error.message);
      console.error('   - 请求URL:', `${API_BASE}/heartrate`);
      console.error('   - 错误详情:', error.response?.data || error);
      return wrapResponse([]);
    }
  },
  
  getHRV: async (hours: number = 168, userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockHRV(hours));
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = { hours };
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/hrv`, { params });
      console.log('✅ HRV数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ HRV数据获取失败:', error.message, 'URL:', `${API_BASE}/hrv`);
      return wrapResponse([]);
    }
  },
  
  getStress: async (hours: number = 168, userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockStress(hours));
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = { hours };
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/stress`, { params });
      console.log('✅ 压力数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 压力数据获取失败:', error.message, 'URL:', `${API_BASE}/stress`);
      return wrapResponse([]);
    }
  },
  
  getBloodOxygen: async (hours: number = 168, userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockBloodOxygen(hours));
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = { hours };
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/blood-oxygen`, { params });
      console.log('✅ 血氧数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 血氧数据获取失败:', error.message, 'URL:', `${API_BASE}/blood-oxygen`);
      return wrapResponse([]);
    }
  },
  
  getActivity: async (days: number = 30, userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockActivity(days));
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = { days };
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/daily-activity`, { params });
      console.log('✅ 活动数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 活动数据获取失败:', error.message, 'URL:', `${API_BASE}/daily-activity`);
      return wrapResponse([]);
    }
  },

  getSleep: async (days: number = 30, userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockSleep(days));
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = { days };
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/sleep`, { params });
      console.log('✅ 睡眠数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 睡眠数据获取失败:', error.message, 'URL:', `${API_BASE}/sleep`);
      return wrapResponse([]);
    }
  },
  
  getStats: async (userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockStats);
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = {};
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/stats`, { params, timeout: 30000 }); // 单独设置30秒超时
      console.log('✅ 统计数据获取成功');
      return response;
    }
    catch (error: any) { 
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('⏱️ 统计数据获取超时，可能是网络问题或服务器响应慢');
        console.error('   建议：检查网络连接，或稍后重试');
      } else {
        console.error('❌ 统计数据获取失败:', error.message, 'URL:', `${API_BASE}/stats`);
      }
      return wrapResponse(null);
    }
  },
  
  getUserInfo: async (userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockUserInfo);
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = {};
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/user-info`, { params });
      console.log('✅ 用户信息获取成功');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 用户信息获取失败:', error.message, 'URL:', `${API_BASE}/user-info`);
      return wrapResponse(null);
    }
  },
  
  getTargetInfo: async (userId?: string | null) => {
    if (USE_MOCK) return wrapResponse(mock.mockTargetInfo);
    try {
      const currentUserId = userId !== undefined ? userId : getCurrentUserId();
      const params: any = {};
      if (currentUserId) {
        params.user_id = currentUserId;
      }
      const response = await api.get(`/target-info`, { params });
      console.log('✅ 目标设置获取成功');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 目标设置获取失败:', error.message, 'URL:', `${API_BASE}/target-info`);
      return wrapResponse(null);
    }
  },
  
  getManualMeasurements: (hours: number = 24, type?: string) => 
    api.get(`/manual-measurements`, { params: { hours, type } }),
};
