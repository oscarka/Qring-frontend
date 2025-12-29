
import { HeartRateData, HRVData, StressData, BloodOxygenData, ActivityData, SleepData, Stats, UserInfo, TargetInfo } from '../types';

const generateTimePoints = (hours: number, intervalMinutes: number) => {
  const points = [];
  const now = new Date();
  for (let i = 0; i < (hours * 60) / intervalMinutes; i++) {
    const date = new Date(now.getTime() - i * intervalMinutes * 60000);
    points.push(date.toISOString().replace('T', ' ').split('.')[0]);
  }
  return points.reverse();
};

export const mockHeartRate = (hours: number): HeartRateData[] => {
  const times = generateTimePoints(hours, 5);
  return times.map((t, i) => {
    // 模拟 15% 的概率出现短时间断流，或者 5% 概率出现长时间断流
    const isMissing = Math.random() > 0.85;
    return {
      timestamp: t,
      bpm: isMissing ? 0 : 60 + Math.floor(Math.random() * 40) + (Math.sin(i / 10) * 10),
      hrId: i
    };
  });
};

export const mockHRV = (hours: number): HRVData[] => {
  const times = generateTimePoints(hours, 15);
  return times.map((t, i) => {
    const isMissing = Math.random() > 0.9;
    return {
      date: t,
      hrv: isMissing ? 0 : 40 + Math.floor(Math.random() * 30) + (Math.cos(i / 5) * 5),
      hrvId: i,
      secondInterval: 900
    };
  });
};

export const mockStress = (hours: number): StressData[] => {
  const times = generateTimePoints(hours, 20);
  return times.map((t, i) => {
    const isMissing = Math.random() > 0.88;
    return {
      date: t,
      stress: isMissing ? 0 : 20 + Math.floor(Math.random() * 40),
      stressId: i,
      secondInterval: 1200
    };
  });
};

export const mockBloodOxygen = (hours: number): BloodOxygenData[] => {
  const times = generateTimePoints(hours, 60);
  return times.map((t, i) => {
    const isMissing = Math.random() > 0.95;
    return {
      date: t,
      soa2: isMissing ? 0 : 95 + Math.floor(Math.random() * 5),
      maxSoa2: 100,
      minSoa2: 94,
      soa2Type: 1,
      sourceType: 1,
      device: "Qring-X1"
    };
  });
};

export const mockActivity = (days: number): ActivityData[] => {
  const data: ActivityData[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    data.push({
      day: d.toISOString().split('T')[0],
      totalStepCount: 5000 + Math.floor(Math.random() * 8000),
      runStepCount: 500 + Math.floor(Math.random() * 2000),
      calories: 300 + Math.floor(Math.random() * 400),
      distance: 3000 + Math.floor(Math.random() * 6000),
      activeTime: 30 + Math.floor(Math.random() * 90),
      happenDate: d.toISOString().split('T')[0]
    });
  }
  return data;
};

export const mockSleep = (days: number): SleepData[] => {
  const data: SleepData[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const duration = 6 * 3600 + Math.floor(Math.random() * 3 * 3600);
    data.push({
      date: d.toISOString().split('T')[0],
      day: d.toISOString().split('T')[0],
      duration: Math.round(duration / 60),  // 转换为分钟
      deep: Math.round(duration * 0.2 / 60),  // 转换为分钟
      light: Math.round(duration * 0.5 / 60),  // 转换为分钟
      rem: Math.round(duration * 0.2 / 60),  // 转换为分钟
      awake: Math.round(duration * 0.1 / 60),  // 转换为分钟
      bedtime_start: d.toISOString(),
      bedtime_end: new Date(d.getTime() + duration * 1000).toISOString(),
    });
  }
  return data;
};

export const mockStats: Stats = {
  heartrate_count: 1440,
  hrv_count: 480,
  stress_count: 360,
  blood_oxygen_count: 120,
  activity_count: 30,
  sleep_count: 30,
  exercise_count: 15,
  sport_plus_count: 5,
  sedentary_count: 24,
  manual_measurements_count: 85,
  last_update: { heartrate: "2025-05-20 10:00:00" }
};

export const mockUserInfo: UserInfo = {
  timeFormat: 24,
  metricSystem: true,
  gender: 1,
  age: 28,
  height: 178,
  weight: 72,
  sbpBase: 120,
  dbpBase: 80,
  hrAlarmValue: 160
};

export const mockTargetInfo: TargetInfo = {
  stepTarget: 10000,
  calorieTarget: 600,
  distanceTarget: 8000,
  sportDurationTarget: 3600,
  sleepDurationTarget: 28800
};
