
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
  timeout: 10000, // 增加到10秒
});

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

export const healthApi = {
  getHeartRate: async (hours: number = 168) => {
    if (USE_MOCK) return wrapResponse(mock.mockHeartRate(hours));
    try { 
      console.log('📡 [前端API] 开始请求心率数据, hours:', hours);
      const url = `${API_BASE}/heartrate`;
      const params = { hours, include_zero: "true" };
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
  
  getHRV: async (hours: number = 168) => {
    if (USE_MOCK) return wrapResponse(mock.mockHRV(hours));
    try { 
      const response = await api.get(`/hrv`, { params: { hours } });
      console.log('✅ HRV数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ HRV数据获取失败:', error.message, 'URL:', `${API_BASE}/hrv`);
      return wrapResponse([]);
    }
  },
  
  getStress: async (hours: number = 168) => {
    if (USE_MOCK) return wrapResponse(mock.mockStress(hours));
    try { 
      const response = await api.get(`/stress`, { params: { hours } });
      console.log('✅ 压力数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 压力数据获取失败:', error.message, 'URL:', `${API_BASE}/stress`);
      return wrapResponse([]);
    }
  },
  
  getBloodOxygen: async (hours: number = 168) => {
    if (USE_MOCK) return wrapResponse(mock.mockBloodOxygen(hours));
    try { 
      const response = await api.get(`/blood-oxygen`, { params: { hours } });
      console.log('✅ 血氧数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 血氧数据获取失败:', error.message, 'URL:', `${API_BASE}/blood-oxygen`);
      return wrapResponse([]);
    }
  },
  
  getActivity: async (days: number = 30) => {
    if (USE_MOCK) return wrapResponse(mock.mockActivity(days));
    try { 
      const response = await api.get(`/daily-activity`, { params: { days } });
      console.log('✅ 活动数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 活动数据获取失败:', error.message, 'URL:', `${API_BASE}/daily-activity`);
      return wrapResponse([]);
    }
  },

  getSleep: async (days: number = 30) => {
    if (USE_MOCK) return wrapResponse(mock.mockSleep(days));
    try { 
      const response = await api.get(`/sleep`, { params: { days } });
      console.log('✅ 睡眠数据获取成功:', response.data?.data?.length || 0, '条');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 睡眠数据获取失败:', error.message, 'URL:', `${API_BASE}/sleep`);
      return wrapResponse([]);
    }
  },
  
  getStats: async () => {
    if (USE_MOCK) return wrapResponse(mock.mockStats);
    try { 
      const response = await api.get(`/stats`);
      console.log('✅ 统计数据获取成功');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 统计数据获取失败:', error.message, 'URL:', `${API_BASE}/stats`);
      return wrapResponse(null);
    }
  },
  
  getUserInfo: async () => {
    if (USE_MOCK) return wrapResponse(mock.mockUserInfo);
    try { 
      const response = await api.get(`/user-info`);
      console.log('✅ 用户信息获取成功');
      return response;
    }
    catch (error: any) { 
      console.error('❌ 用户信息获取失败:', error.message, 'URL:', `${API_BASE}/user-info`);
      return wrapResponse(null);
    }
  },
  
  getTargetInfo: async () => {
    if (USE_MOCK) return wrapResponse(mock.mockTargetInfo);
    try { 
      const response = await api.get(`/target-info`);
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
