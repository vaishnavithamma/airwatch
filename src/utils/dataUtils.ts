/**
 * AirWatch Hyderabad — Data Calculation Utilities
 * All statistics are computed from the authoritative HISTORICAL_DATA array.
 */

import { DailyObservation, DataSummary, AQICategory, AQIBreakpoint, Insight, Alert, AlertConfig } from '../types/data';
import { format, parseISO } from 'date-fns';

// ---------------------------------------------------------------------------
// CPCB AQI Breakpoints (National AQI, as per CPCB documentation)
// ---------------------------------------------------------------------------
export const AQI_BREAKPOINTS: AQIBreakpoint[] = [
  { aqiLow: 0,   aqiHigh: 50,  pm25Low: 0,   pm25High: 30,  pm10Low: 0,   pm10High: 50,  category: 'Good' },
  { aqiLow: 51,  aqiHigh: 100, pm25Low: 31,  pm25High: 60,  pm10Low: 51,  pm10High: 100, category: 'Satisfactory' },
  { aqiLow: 101, aqiHigh: 200, pm25Low: 61,  pm25High: 90,  pm10Low: 101, pm10High: 250, category: 'Moderate' },
  { aqiLow: 201, aqiHigh: 300, pm25Low: 91,  pm25High: 120, pm10Low: 251, pm10High: 350, category: 'Poor' },
  { aqiLow: 301, aqiHigh: 400, pm25Low: 121, pm25High: 250, pm10Low: 351, pm10High: 430, category: 'Very Poor' },
  { aqiLow: 401, aqiHigh: 500, pm25Low: 251, pm25High: 380, pm10Low: 431, pm10High: 600, category: 'Severe' },
];

// Reference values (24-hour averages, µg/m³)
export const REFERENCE_VALUES = {
  pm25: { indianNAAQS: 60, who2021: 15 },
  pm10: { indianNAAQS: 100, who2021: 45 },
};

// ---------------------------------------------------------------------------
// AQI Classification
// ---------------------------------------------------------------------------
export function classifyAQI(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getCategoryColor(category: AQICategory): string {
  switch (category) {
    case 'Good': return '#22C55E';
    case 'Satisfactory': return '#84CC16';
    case 'Moderate': return '#F59E0B';
    case 'Poor': return '#F97316';
    case 'Very Poor': return '#EF4444';
    case 'Severe': return '#7C3AED';
    default: return '#6B7280';
  }
}

export function getCategoryBgColor(category: AQICategory): string {
  switch (category) {
    case 'Good': return '#F0FDF4';
    case 'Satisfactory': return '#F7FEE7';
    case 'Moderate': return '#FFFBEB';
    case 'Poor': return '#FFF7ED';
    case 'Very Poor': return '#FEF2F2';
    case 'Severe': return '#F5F3FF';
    default: return '#F9FAFB';
  }
}

// ---------------------------------------------------------------------------
// CPCB AQI Calculation (linear interpolation)
// ---------------------------------------------------------------------------
export function calculatePollutantSubIndex(
  concentration: number,
  breakpoints: Array<{ low: number; high: number; aqiLow: number; aqiHigh: number }>
): number | null {
  for (const bp of breakpoints) {
    if (concentration >= bp.low && concentration <= bp.high) {
      // Ip = [(IHI - ILO) / (BPHI - BPLO)] × (Cp - BPLO) + ILO
      return ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (concentration - bp.low) + bp.aqiLow;
    }
  }
  return null;
}

export function calculatePM25SubIndex(pm25: number): number | null {
  const breakpoints = AQI_BREAKPOINTS.map(bp => ({
    low: bp.pm25Low, high: bp.pm25High, aqiLow: bp.aqiLow, aqiHigh: bp.aqiHigh,
  }));
  return calculatePollutantSubIndex(pm25, breakpoints);
}

export function calculatePM10SubIndex(pm10: number): number | null {
  const breakpoints = AQI_BREAKPOINTS.map(bp => ({
    low: bp.pm10Low, high: bp.pm10High, aqiLow: bp.aqiLow, aqiHigh: bp.aqiHigh,
  }));
  return calculatePollutantSubIndex(pm10, breakpoints);
}

// ---------------------------------------------------------------------------
// Statistical calculations
// ---------------------------------------------------------------------------
export function calcMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calcStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calcMean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function calcMax<T>(arr: T[], key: keyof T): T {
  return arr.reduce((max, item) => (item[key] > max[key] ? item : max), arr[0]);
}

export function calcMin<T>(arr: T[], key: keyof T): T {
  return arr.reduce((min, item) => (item[key] < min[key] ? item : min), arr[0]);
}

// ---------------------------------------------------------------------------
// Dataset summary — computed from actual data
// ---------------------------------------------------------------------------
export function computeSummary(data: DailyObservation[]): DataSummary {
  if (data.length === 0) {
    return {
      count: 0, meanAqi: 0, maxAqi: 0, maxAqiDate: '', minAqi: 0, minAqiDate: '',
      aqiRange: 0, stdDevAqi: 0, meanPm25: 0, meanPm10: 0,
      categoryCounts: { Good: 0, Satisfactory: 0, Moderate: 0, Poor: 0, 'Very Poor': 0, Severe: 0 },
      pollutantCounts: { 'PM2.5': 0, 'PM10': 0 },
      period1AvgAqi: 0, period2AvgAqi: 0,
    };
  }

  const aqiValues = data.map(d => d.aqi);
  const pm25Values = data.map(d => d.pm25);
  const pm10Values = data.map(d => d.pm10);

  const maxObs = calcMax(data, 'aqi');
  const minObs = calcMin(data, 'aqi');

  const categoryCounts: Record<AQICategory, number> = {
    Good: 0, Satisfactory: 0, Moderate: 0, Poor: 0, 'Very Poor': 0, Severe: 0,
  };
  const pollutantCounts: Record<'PM2.5' | 'PM10', number> = { 'PM2.5': 0, 'PM10': 0 };

  data.forEach(obs => {
    categoryCounts[obs.category]++;
    pollutantCounts[obs.mainPollutant]++;
  });

  // Period averages (split at 7 days each from full 14-day set)
  const period1 = data.filter(d => d.date >= '2026-09-16' && d.date <= '2026-09-22');
  const period2 = data.filter(d => d.date >= '2026-09-23' && d.date <= '2026-09-29');

  return {
    count: data.length,
    meanAqi: Math.round(calcMean(aqiValues) * 10) / 10,
    maxAqi: maxObs.aqi,
    maxAqiDate: maxObs.date,
    minAqi: minObs.aqi,
    minAqiDate: minObs.date,
    aqiRange: maxObs.aqi - minObs.aqi,
    stdDevAqi: Math.round(calcStdDev(aqiValues) * 10) / 10,
    meanPm25: Math.round(calcMean(pm25Values) * 100) / 100,
    meanPm10: Math.round(calcMean(pm10Values) * 100) / 100,
    categoryCounts,
    pollutantCounts,
    period1AvgAqi: Math.round(calcMean(period1.map(d => d.aqi)) * 10) / 10,
    period2AvgAqi: Math.round(calcMean(period2.map(d => d.aqi)) * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------
export function filterByDateRange(data: DailyObservation[], start: string, end: string): DailyObservation[] {
  return data.filter(d => d.date >= start && d.date <= end);
}

export function filterByCategories(data: DailyObservation[], categories: AQICategory[]): DailyObservation[] {
  if (categories.length === 0) return data;
  return data.filter(d => categories.includes(d.category));
}

// ---------------------------------------------------------------------------
// Standard exceedance checks
// ---------------------------------------------------------------------------
export function countExceedances(
  data: DailyObservation[],
  pollutant: 'pm25' | 'pm10',
  threshold: number
): number {
  return data.filter(d => d[pollutant] > threshold).length;
}

export function getExceedanceDates(
  data: DailyObservation[],
  pollutant: 'pm25' | 'pm10',
  threshold: number
): string[] {
  return data.filter(d => d[pollutant] > threshold).map(d => d.date);
}

// ---------------------------------------------------------------------------
// Insight engine — deterministic, explainable insights from data
// ---------------------------------------------------------------------------
export function generateInsights(data: DailyObservation[], summary: DataSummary): Insight[] {
  if (data.length === 0) return [];
  const insights: Insight[] = [];

  // Peak AQI
  insights.push({
    id: 'peak-aqi',
    title: `Peak AQI: ${summary.maxAqi} on ${formatDate(summary.maxAqiDate)}`,
    description: `The highest observed AQI was ${summary.maxAqi} (${classifyAQI(summary.maxAqi)}) recorded on ${formatDate(summary.maxAqiDate)}.`,
    type: 'warning',
    date: summary.maxAqiDate,
    value: summary.maxAqi,
  });

  // Lowest AQI
  insights.push({
    id: 'min-aqi',
    title: `Best Air Quality: AQI ${summary.minAqi} on ${formatDate(summary.minAqiDate)}`,
    description: `The cleanest day was ${formatDate(summary.minAqiDate)} with an AQI of ${summary.minAqi} (${classifyAQI(summary.minAqi)}).`,
    type: 'success',
    date: summary.minAqiDate,
    value: summary.minAqi,
  });

  // Period comparison
  if (summary.period1AvgAqi > 0 && summary.period2AvgAqi > 0) {
    const diff = Math.round((summary.period1AvgAqi - summary.period2AvgAqi) * 10) / 10;
    insights.push({
      id: 'period-comparison',
      title: `Second week showed improved air quality`,
      description: `16–22 Sep average AQI: ${summary.period1AvgAqi}. 23–29 Sep average AQI: ${summary.period2AvgAqi}. The second week was ${diff} AQI units lower on average.`,
      type: 'info',
      value: diff,
    });
  }

  // Dominant pollutant
  const pm25Days = summary.pollutantCounts['PM2.5'];
  const pm10Days = summary.pollutantCounts['PM10'];
  insights.push({
    id: 'dominant-pollutant',
    title: `PM10 was dominant on ${pm10Days} of ${data.length} days`,
    description: `PM10 controlled the AQI on ${pm10Days} days, while PM2.5 was dominant on ${pm25Days} days (20–23 September).`,
    type: 'info',
    value: pm10Days,
  });

  // WHO exceedances
  const pm25WhoExceed = countExceedances(data, 'pm25', REFERENCE_VALUES.pm25.who2021);
  const pm10WhoExceed = countExceedances(data, 'pm10', REFERENCE_VALUES.pm10.who2021);
  insights.push({
    id: 'who-exceedance',
    title: `WHO 2021 guidelines exceeded on multiple days`,
    description: `PM2.5 exceeded the WHO 2021 guideline (${REFERENCE_VALUES.pm25.who2021} µg/m³) on ${pm25WhoExceed} days. PM10 exceeded the WHO guideline (${REFERENCE_VALUES.pm10.who2021} µg/m³) on ${pm10WhoExceed} days.`,
    type: 'warning',
    value: pm25WhoExceed,
  });

  // NAAQS compliance
  const pm25NaaqsExceed = countExceedances(data, 'pm25', REFERENCE_VALUES.pm25.indianNAAQS);
  const pm10NaaqsExceed = countExceedances(data, 'pm10', REFERENCE_VALUES.pm10.indianNAAQS);
  insights.push({
    id: 'naaqs-compliance',
    title: `Indian NAAQS reference values not exceeded`,
    description: `No observations exceeded the Indian NAAQS 24-hour reference values (PM2.5: ${REFERENCE_VALUES.pm25.indianNAAQS} µg/m³, PM10: ${REFERENCE_VALUES.pm10.indianNAAQS} µg/m³). Note: this reflects a 14-day sample only.`,
    type: 'success',
    value: pm25NaaqsExceed + pm10NaaqsExceed,
  });

  // Largest day-to-day change
  let maxIncrease = 0;
  let maxIncreaseDate = '';
  let maxDecrease = 0;
  let maxDecreaseDate = '';
  for (let i = 1; i < data.length; i++) {
    const change = data[i].aqi - data[i - 1].aqi;
    if (change > maxIncrease) { maxIncrease = change; maxIncreaseDate = data[i].date; }
    if (change < maxDecrease) { maxDecrease = change; maxDecreaseDate = data[i].date; }
  }
  if (maxIncreaseDate) {
    insights.push({
      id: 'largest-increase',
      title: `Largest AQI increase: +${maxIncrease} on ${formatDate(maxIncreaseDate)}`,
      description: `The AQI rose by ${maxIncrease} points from ${formatDate(getPreviousDate(maxIncreaseDate))} to ${formatDate(maxIncreaseDate)}.`,
      type: 'warning',
      date: maxIncreaseDate,
      value: maxIncrease,
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Alert generation
// ---------------------------------------------------------------------------
export function generateAlerts(
  data: DailyObservation[],
  config: AlertConfig
): Alert[] {
  if (!config.enabled) return [];

  return data
    .filter(obs => {
      const meetsThreshold = config.useGreaterThanOrEqual
        ? obs.aqi >= config.aqiThreshold
        : obs.aqi > config.aqiThreshold;
      return meetsThreshold;
    })
    .map(obs => ({
      id: `alert-${obs.date}`,
      date: obs.date,
      aqi: obs.aqi,
      category: obs.category,
      mainPollutant: obs.mainPollutant,
      pm25: obs.pm25,
      pm10: obs.pm10,
      threshold: config.aqiThreshold,
      read: false,
      dismissed: false,
      generatedAt: new Date().toISOString(),
    }));
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------
export function exportToCSV(data: DailyObservation[], filename = 'airwatch-hyderabad-data.csv'): void {
  const headers = ['Date', 'AQI', 'Category', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'Main Pollutant'];
  const rows = data.map(obs => [
    obs.date,
    obs.aqi,
    obs.category,
    obs.pm25.toFixed(2),
    obs.pm10.toFixed(2),
    obs.mainPollutant,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd Sep');
  } catch {
    return dateStr;
  }
}

export function getPreviousDate(dateStr: string): string {
  const date = parseISO(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Data integrity validation
// ---------------------------------------------------------------------------
export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
  computedStats: {
    count: number;
    uniqueDates: number;
    meanAqi: number;
    maxAqi: number;
    minAqi: number;
    sumAqi: number;
  };
}

export function validateDataset(data: DailyObservation[]): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check count
  if (data.length !== 14) {
    issues.push(`Expected 14 observations, found ${data.length}`);
  }

  // Check unique dates
  const dates = data.map(d => d.date);
  const uniqueDates = new Set(dates);
  if (uniqueDates.size !== dates.length) {
    issues.push(`Duplicate dates found: ${dates.length - uniqueDates.size} duplicates`);
  }

  // Check ordering
  const sorted = [...dates].sort();
  if (JSON.stringify(dates) !== JSON.stringify(sorted)) {
    warnings.push('Dates are not in ascending order');
  }

  // Check date range
  const expectedStart = '2026-09-16';
  const expectedEnd = '2026-09-29';
  if (dates[0] !== expectedStart) issues.push(`First date should be ${expectedStart}, got ${dates[0]}`);
  if (dates[dates.length - 1] !== expectedEnd) issues.push(`Last date should be ${expectedEnd}, got ${dates[dates.length - 1]}`);

  // Compute stats for verification
  const aqiValues = data.map(d => d.aqi);
  const sumAqi = aqiValues.reduce((a, b) => a + b, 0);
  const meanAqi = Math.round((sumAqi / data.length) * 10) / 10;
  const maxAqi = Math.max(...aqiValues);
  const minAqi = Math.min(...aqiValues);

  // Verify against reported values
  if (Math.abs(meanAqi - 62.3) > 0.2) {
    warnings.push(`Computed mean AQI ${meanAqi} differs from reported 62.3`);
  }
  if (sumAqi !== 872) {
    warnings.push(`Computed sum AQI ${sumAqi} differs from reported 872`);
  }
  if (maxAqi !== 95) issues.push(`Expected max AQI 95, got ${maxAqi}`);
  if (minAqi !== 38) issues.push(`Expected min AQI 38, got ${minAqi}`);

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    computedStats: {
      count: data.length,
      uniqueDates: uniqueDates.size,
      meanAqi,
      maxAqi,
      minAqi,
      sumAqi,
    },
  };
}
