import { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Download, ChevronDown, Calendar } from 'lucide-react';
import { HISTORICAL_DATA } from '../data/historicalData';
import {
  computeSummary, filterByDateRange, filterByCategories,
  exportToCSV, formatDate, formatShortDate
} from '../utils/dataUtils';
import { AQITrendChart, PollutantComparisonChart } from '../components/charts/TrendCharts';
import { ObservationTable } from '../components/feedback/ObservationTable';
import { KPICard } from '../components/cards/KPICard';
import { AQICategoryBadge } from '../components/cards/AQICategoryBadge';
import { AQICategory, ChartDataPoint } from '../types/data';

const ALL_CATEGORIES: AQICategory[] = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];
const MIN_DATE = '2026-09-16';
const MAX_DATE = '2026-09-29';

export function AQIExplorerPage() {
  const [startDate, setStartDate] = useState(MIN_DATE);
  const [endDate, setEndDate] = useState(MAX_DATE);
  const [selectedCategories, setSelectedCategories] = useState<AQICategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMetric, setChartMetric] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');
  const [dateError, setDateError] = useState('');

  function resetFilters() {
    setStartDate(MIN_DATE);
    setEndDate(MAX_DATE);
    setSelectedCategories([]);
    setSearchQuery('');
    setDateError('');
  }

  function handleStartDate(val: string) {
    setStartDate(val);
    if (val > endDate) setDateError('Start date must not be after end date');
    else setDateError('');
  }

  function handleEndDate(val: string) {
    setEndDate(val);
    if (startDate > val) setDateError('End date must not be before start date');
    else setDateError('');
  }

  function toggleCategory(cat: AQICategory) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  const filteredData = useMemo(() => {
    if (dateError) return [];
    let data = filterByDateRange(HISTORICAL_DATA, startDate, endDate);
    data = filterByCategories(data, selectedCategories);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(obs =>
        obs.date.includes(q) ||
        formatDate(obs.date).toLowerCase().includes(q) ||
        obs.category.toLowerCase().includes(q) ||
        obs.mainPollutant.toLowerCase().includes(q)
      );
    }
    return data;
  }, [startDate, endDate, selectedCategories, searchQuery, dateError]);

  const summary = useMemo(() => computeSummary(filteredData), [filteredData]);

  const chartData: ChartDataPoint[] = useMemo(() =>
    filteredData.map(obs => ({
      date: obs.date,
      displayDate: formatShortDate(obs.date),
      aqi: obs.aqi,
      pm25: obs.pm25,
      pm10: obs.pm10,
      category: obs.category,
      mainPollutant: obs.mainPollutant,
    })),
    [filteredData]
  );

  const isFiltered = startDate !== MIN_DATE || endDate !== MAX_DATE ||
    selectedCategories.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Historical AQI Explorer</h1>
        <p className="text-sm text-navy-500 mt-1">
          Filter, sort, and explore the 14-day observation dataset interactively.
          Data outside 16–29 September 2026 is not available.
        </p>
      </div>

      {/* Filter panel */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-sky-600" />
          <h2 className="text-sm font-semibold text-navy-800">Filter Observations</h2>
          {isFiltered && (
            <button onClick={resetFilters} className="ml-auto btn-ghost text-xs gap-1">
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date range */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1" htmlFor="start-date">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              min={MIN_DATE}
              max={MAX_DATE}
              onChange={e => handleStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1" htmlFor="end-date">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              min={MIN_DATE}
              max={MAX_DATE}
              onChange={e => handleEndDate(e.target.value)}
              className="input"
            />
          </div>

          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-navy-600 mb-1" htmlFor="search">
              Search
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by date, category, or pollutant…"
                className="input pl-9"
              />
            </div>
          </div>
        </div>

        {dateError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {dateError}
          </div>
        )}

        {/* Category filter */}
        <div className="mt-4">
          <div className="text-xs font-medium text-navy-600 mb-2">
            Filter by Category {selectedCategories.length > 0 && <span className="text-sky-600">({selectedCategories.length} selected)</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedCategories.includes(cat)
                    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-400'
                    : 'border-slate-200 bg-white text-navy-600 hover:border-slate-300'
                }`}
                aria-pressed={selectedCategories.includes(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quick presets */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-xs font-medium text-navy-500 mb-2">Quick select:</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All 14 days', start: '2026-09-16', end: '2026-09-29' },
              { label: 'Week 1 (16–22)', start: '2026-09-16', end: '2026-09-22' },
              { label: 'Week 2 (23–29)', start: '2026-09-23', end: '2026-09-29' },
              { label: 'Good days only', categories: ['Good'] as AQICategory[] },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => {
                  if (preset.start) { setStartDate(preset.start); setEndDate(preset.end!); }
                  if (preset.categories) setSelectedCategories(preset.categories);
                  setDateError('');
                }}
                className="px-3 py-1 text-xs font-medium bg-slate-100 text-navy-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Observations" value={summary.count} subtext={`of ${HISTORICAL_DATA.length} total`} />
        <KPICard label="Mean AQI" value={summary.count > 0 ? summary.meanAqi : '—'} subtext="selected period" />
        <KPICard label="Highest AQI" value={summary.count > 0 ? summary.maxAqi : '—'} subtext={summary.count > 0 ? formatDate(summary.maxAqiDate) : ''} accent="#EF4444" />
        <KPICard label="Lowest AQI" value={summary.count > 0 ? summary.minAqi : '—'} subtext={summary.count > 0 ? formatDate(summary.minAqiDate) : ''} accent="#22C55E" />
      </div>

      {/* Warning: filtered vs full dataset */}
      {isFiltered && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700 flex items-center gap-2">
          <Filter size={13} className="flex-shrink-0" />
          Filters are active. Showing {filteredData.length} of {HISTORICAL_DATA.length} observations.
          Statistics above are recalculated for the selected subset only.
          <button onClick={resetFilters} className="ml-auto underline hover:no-underline font-medium">Clear filters</button>
        </div>
      )}

      {/* Chart */}
      {filteredData.length > 0 ? (
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-navy-800">
              {chartMetric === 'aqi' ? 'AQI' : chartMetric === 'pm25' ? 'PM2.5' : 'PM10'} Trend — Selected Period
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {(['aqi', 'pm25', 'pm10'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    chartMetric === m ? 'bg-white text-navy-800 shadow-sm' : 'text-navy-500 hover:text-navy-700'
                  }`}
                >
                  {m === 'aqi' ? 'AQI' : m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <AQITrendChart data={chartData} metric={chartMetric} height={250} />
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-navy-400 mb-2">
            <Calendar size={32} className="mx-auto mb-3 opacity-40" />
            <div className="text-sm font-medium">No observations match the current filters.</div>
            <div className="text-xs mt-1">Try widening the date range or removing category filters.</div>
          </div>
          <button onClick={resetFilters} className="btn-primary mt-4 mx-auto">
            <RotateCcw size={14} />
            Reset All Filters
          </button>
        </div>
      )}

      {/* Export */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => exportToCSV(filteredData, `airwatch-hyderabad-filtered-${startDate}-to-${endDate}.csv`)}
          disabled={filteredData.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Export {filteredData.length} observation{filteredData.length !== 1 ? 's' : ''} as CSV
        </button>
        <button
          onClick={() => exportToCSV(HISTORICAL_DATA, 'airwatch-hyderabad-all-data.csv')}
          className="btn-secondary"
        >
          <Download size={14} />
          Export All 14 Observations
        </button>
      </div>

      {/* Full data table */}
      <ObservationTable
        data={filteredData}
        showExport={false}
        title={isFiltered ? `Filtered Results (${filteredData.length} observations)` : 'All 14 Observations'}
      />
    </div>
  );
}
