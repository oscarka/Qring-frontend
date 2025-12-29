
import React from 'react';
import { 
  Heart, 
  Activity, 
  Moon, 
  Zap, 
  Droplet, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Target, 
  User, 
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const COLORS = {
  heartRate: '#FF5252', // 鲜亮的活力红
  hrv: '#00E676',      // 现代感翡翠绿
  stress: '#FF9100',   // 警告橙
  bloodOxygen: '#00B0FF', // 纯净天空蓝
  activity: '#448AFF', // 经典科技蓝
  sleep: '#B388FF',    // 柔和梦幻紫
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  cardBg: 'rgba(15, 23, 42, 0.8)',
  glassBg: 'rgba(30, 41, 59, 0.5)'
};

export const ICONS = {
  Heart,
  Activity,
  Moon,
  Zap,
  Droplet,
  AlertCircle,
  RefreshCw,
  Clock,
  Target,
  User,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp
};
