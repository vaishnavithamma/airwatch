/**
 * AirWatch Hyderabad — TypeScript Type Definitions
 */

export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export type Pollutant = 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'NH3' | 'CO' | 'O3';

export interface DailyObservation {
  date: string; // ISO date string 'YYYY-MM-DD'
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  aqi: number;
  category: AQICategory;
  mainPollutant: 'PM2.5' | 'PM10';
  // Optional fields for future data sources:
  no2?: number;
  so2?: number;
  nh3?: number;
  co?: number;
  o3?: number;
}

export interface StationInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  agency: string;
  network: string;
}

export interface DatasetMeta {
  periodStart: string;
  periodEnd: string;
  accessDate: string;
  source: string;
  sourceUrl: string;
  isHistorical: boolean;
  isLive: boolean;
  subject: string;
  institution: string;
  studyLocation: string;
}

export interface DataSummary {
  count: number;
  meanAqi: number;
  maxAqi: number;
  maxAqiDate: string;
  minAqi: number;
  minAqiDate: string;
  aqiRange: number;
  stdDevAqi: number;
  meanPm25: number;
  meanPm10: number;
  categoryCounts: Record<AQICategory, number>;
  pollutantCounts: Record<'PM2.5' | 'PM10', number>;
  period1AvgAqi: number; // 16–22 Sep
  period2AvgAqi: number; // 23–29 Sep
}

export interface AQIBreakpoint {
  aqiLow: number;
  aqiHigh: number;
  pm25Low: number;
  pm25High: number;
  pm10Low: number;
  pm10High: number;
  category: AQICategory;
}

export interface Alert {
  id: string;
  date: string;
  aqi: number;
  category: AQICategory;
  mainPollutant: 'PM2.5' | 'PM10';
  pm25: number;
  pm10: number;
  threshold: number;
  read: boolean;
  dismissed: boolean;
  generatedAt: string; // ISO timestamp
}

export interface AlertConfig {
  enabled: boolean;
  aqiThreshold: number;
  categoryThreshold: AQICategory | null;
  useGreaterThanOrEqual: boolean;
}

export interface ChartDataPoint {
  date: string;
  displayDate: string;
  aqi: number;
  pm25: number;
  pm10: number;
  category: AQICategory;
  mainPollutant: 'PM2.5' | 'PM10';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'highlight';
  date?: string;
  value?: number | string;
}

export interface ReferenceValue {
  pollutant: Pollutant;
  indianNAAQS: number; // 24-hour average µg/m³
  who2021: number;     // WHO 2021 AQG µg/m³
  unit: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterState {
  dateRange: DateRange;
  categories: AQICategory[];
  searchQuery: string;
  sortField: keyof DailyObservation;
  sortDirection: 'asc' | 'desc';
}
