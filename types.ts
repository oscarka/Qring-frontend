
export interface HeartRateData {
  timestamp: string;
  bpm: number;
  hrId: number;
  // Computed fields for UI
  fullTime?: string;
  bpmOriginal?: number;
}

export interface HRVData {
  date: string;
  hrv: number;
  hrvId: number;
  secondInterval: number;
  fullTime?: string;
  hrvOriginal?: number;
}

export interface StressData {
  date: string;
  stress: number;
  stressId: number;
  secondInterval: number;
  fullTime?: string;
  stressOriginal?: number;
}

export interface BloodOxygenData {
  date: string;
  soa2: number;
  maxSoa2: number;
  minSoa2: number;
  soa2Type: number;
  sourceType: number;
  device: string;
  fullTime?: string;
  soa2Original?: number;
}

export interface ActivityData {
  day: string;
  totalStepCount: number;
  runStepCount: number;
  calories: number;
  distance: number;
  activeTime: number;
  happenDate: string;
}

export interface SleepData {
  day: string;  // 后端统一使用 day
  duration: number;  // 总睡眠时长（分钟）
  deep: number;  // 深度睡眠（分钟）
  light: number;  // 浅度睡眠（分钟）
  rem: number;  // REM睡眠（分钟）
  awake: number;  // 清醒时长（分钟）
  bedtime_start: string;  // 睡眠开始时间
  bedtime_end: string;  // 睡眠结束时间
}

export interface ExerciseData {
  startTime: string;
  type: number;
  lastSeconds: number;
  steps: number;
  meters: number;
  calories: number;
}

export interface UserInfo {
  timeFormat: number;
  metricSystem: boolean;
  gender: number;
  age: number;
  height: number;
  weight: number;
  sbpBase: number;
  dbpBase: number;
  hrAlarmValue: number;
}

export interface TargetInfo {
  stepTarget: number;
  calorieTarget: number;
  distanceTarget: number;
  sportDurationTarget: number;
  sleepDurationTarget: number;
}

export interface Stats {
  heartrate_count: number;
  hrv_count: number;
  stress_count: number;
  blood_oxygen_count: number;
  activity_count: number;
  sleep_count: number;
  exercise_count: number;
  sport_plus_count: number;
  sedentary_count: number;
  manual_measurements_count: number;
  last_update: Record<string, string | null>;
}

export enum TimeRange {
  Day1 = 1,
  Days3 = 3,
  Days7 = 7,
  Days10 = 10,
  Days30 = 30
}
