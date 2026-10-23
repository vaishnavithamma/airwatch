/**
 * AirWatch Hyderabad — Historical Dataset
 * Station: Somajiguda – TSPCB
 * Period: 16–29 September 2026
 * Source: CPCB Central Control Room for Air Quality Management Data Repository
 * https://airquality.cpcb.gov.in/ccr/#/repository/data
 * Original access date (per assignment report): 15 October 2026
 *
 * IMPORTANT: This is HISTORICAL data. Do NOT present as live/current readings.
 */

import { DailyObservation, StationInfo, DatasetMeta } from '../types/data';

export const STATION_INFO: StationInfo = {
  id: 'somajiguda-tspcb',
  name: 'Somajiguda – TSPCB',
  city: 'Hyderabad',
  state: 'Telangana',
  country: 'India',
  latitude: 17.4239,
  longitude: 78.4738,
  agency: 'Telangana State Pollution Control Board (TSPCB)',
  network: 'Central Pollution Control Board (CPCB)',
};

export const DATASET_META: DatasetMeta = {
  periodStart: '2026-09-16',
  periodEnd: '2026-09-29',
  accessDate: '2026-10-15',
  source: 'CPCB Central Control Room for Air Quality Management Data Repository',
  sourceUrl: 'https://airquality.cpcb.gov.in/ccr/#/repository/data',
  isHistorical: true,
  isLive: false,
  subject: 'BCV755B — Conservation of Natural Resources',
  institution: 'Sir M. Visvesvaraya Institute of Technology, Bengaluru',
  studyLocation: 'Somajiguda, Hyderabad, Telangana, India',
};

/**
 * Authoritative 14-day historical observations.
 * Values are exactly as supplied in the assignment report.
 * AQI values are sourced from the CPCB report and are the officially reported
 * values — they are NOT recalculated here, to preserve data integrity.
 */
export const HISTORICAL_DATA: DailyObservation[] = [
  { date: '2026-09-16', pm25: 30.67, pm10: 55.68, aqi: 57,  category: 'Satisfactory', mainPollutant: 'PM10' },
  { date: '2026-09-17', pm25: 32.53, pm10: 59.26, aqi: 60,  category: 'Satisfactory', mainPollutant: 'PM10' },
  { date: '2026-09-18', pm25: 31.80, pm10: 55.63, aqi: 57,  category: 'Satisfactory', mainPollutant: 'PM10' },
  { date: '2026-09-19', pm25: 32.68, pm10: 58.49, aqi: 59,  category: 'Satisfactory', mainPollutant: 'PM10' },
  { date: '2026-09-20', pm25: 50.44, pm10: 83.24, aqi: 84,  category: 'Satisfactory', mainPollutant: 'PM2.5' },
  { date: '2026-09-21', pm25: 56.98, pm10: 94.38, aqi: 95,  category: 'Satisfactory', mainPollutant: 'PM2.5' },
  { date: '2026-09-22', pm25: 55.37, pm10: 84.37, aqi: 92,  category: 'Satisfactory', mainPollutant: 'PM2.5' },
  { date: '2026-09-23', pm25: 36.88, pm10: 56.12, aqi: 62,  category: 'Satisfactory', mainPollutant: 'PM2.5' },
  { date: '2026-09-24', pm25: 27.17, pm10: 66.31, aqi: 67,  category: 'Satisfactory', mainPollutant: 'PM10' },
  { date: '2026-09-25', pm25: 12.42, pm10: 46.93, aqi: 47,  category: 'Good',         mainPollutant: 'PM10' },
  { date: '2026-09-26', pm25: 12.98, pm10: 48.07, aqi: 48,  category: 'Good',         mainPollutant: 'PM10' },
  { date: '2026-09-27', pm25:  7.68, pm10: 38.04, aqi: 38,  category: 'Good',         mainPollutant: 'PM10' },
  { date: '2026-09-28', pm25: 14.96, pm10: 46.89, aqi: 47,  category: 'Good',         mainPollutant: 'PM10' },
  { date: '2026-09-29', pm25: 27.01, pm10: 58.23, aqi: 59,  category: 'Satisfactory', mainPollutant: 'PM10' },
];

/** Reported summary statistics from the assignment report (for reference). */
export const REPORTED_SUMMARY = {
  observationCount: 14,
  sumAqi: 872,
  meanAqi: 62.3,
  maxAqi: 95,
  maxAqiDate: '2026-09-21',
  minAqi: 38,
  minAqiDate: '2026-09-27',
  aqiRange: 57,
  stdDevAqi: 16.5,
  meanPm25: 30.68,
  meanPm10: 60.83,
  goodDays: 4,
  satisfactoryDays: 10,
  period1AvgAqi: 72,    // 16–22 Sep (7 days)
  period2AvgAqi: 52.6,  // 23–29 Sep (7 days)
};
