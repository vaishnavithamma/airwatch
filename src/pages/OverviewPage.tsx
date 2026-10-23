import { useMemo, useState } from 'react';
import {
  Activity, BarChart2, Wind, TrendingUp, TrendingDown,
  Calendar, AlertTriangle, CheckCircle, Info, Layers,
  Database, Target
} from 'lucide-react';
import { HISTORICAL_DATA, DATASET_META, STATION_INFO } from '../data/historicalData';
import { computeSummary, generateInsights, formatDate, formatShortDate } from '../utils/dataUtils';
import { AQIGauge } from '../components/charts/AQIGauge';
import { AQITrendChart, PollutantComparisonChart } from '../components/charts/TrendCharts';
import { CategoryDistributionChart } from '../components/charts/CategoryCharts';
import { KPICard, InsightCard } from '../components/cards/KPICard';
import { ObservationTable } from '../components/feedback/ObservationTable';
import { AQICategoryBadge } from '../components/cards/AQICategoryBadge';
import { ChartDataPoint } from '../types/data';

const CHART_METRICS = [
  { key: 'aqi' as const, label: 'AQI' },
  { key: 'pm25' as const, label: 'PM2.5' },
  { key: 'pm10' as const, label: 'PM10' },
];

export function OverviewPage() {
  const [chartMetric, setChartMetric] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');
  const [showPm25, setShowPm25] = useState(true);
  const [showPm10, setShowPm10] = useState(true);

  const summary = useMemo(() => computeSummary(HISTORICAL_DATA), []);
  const insights = useMemo(() => generateInsights(HISTORICAL_DATA, summary), [summary]);

  const chartData: ChartDataPoint[] = useMemo(() =>
    HISTORICAL_DATA.map(obs => ({
      date: obs.date,
      displayDate: formatShortDate(obs.date),
      aqi: obs.aqi,
      pm25: obs.pm25,
      pm10: obs.pm10,
      category: obs.category,
      mainPollutant: obs.mainPollutant,
    })),
    []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="historical-badge">
              <Database size={10} />
              Historical Observations · Not Live Data
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Air Quality Overview</h1>
          <p className="text-sm text-navy-500 mt-1">
            {STATION_INFO.name} · {STATION_INFO.city}, {STATION_INFO.state} ·&nbsp;
            16–29 September 2026
          </p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="text-xs text-navy-400">Source: CPCB CCR Data Repository</div>
          <div className="text-xs text-navy-400">Access date: {formatDate(DATASET_META.accessDate)}</div>
        </div>
      </div>

      {/* Primary AQI module */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <AQIGauge aqi={summary.meanAqi} category="Satisfactory" size={220} />
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-navy-500 uppercase tracking-wide">Period Mean AQI</div>
              <div className="text-3xl font-bold text-navy-900 mt-1">{summary.meanAqi}</div>
              <div className="mt-2"><AQICategoryBadge category="Satisfactory" size="lg" /></div>
              <div className="mt-2 text-xs text-navy-400">16–29 September 2026</div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                  <TrendingUp size={12} /> Highest AQI
                </div>
                <div className="text-3xl font-bold text-red-700">{summary.maxAqi}</div>
                <div className="text-xs text-red-500 mt-1">{formatDate(summary.maxAqiDate)}</div>
                <div className="mt-1"><AQICategoryBadge category="Satisfactory" size="sm" /></div>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                  <TrendingDown size={12} /> Lowest AQI
                </div>
                <div className="text-3xl font-bold text-green-700">{summary.minAqi}</div>
                <div className="text-xs text-green-500 mt-1">{formatDate(summary.minAqiDate)}</div>
                <div className="mt-1"><AQICategoryBadge category="Good" size="sm" /></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-navy-500 font-medium">AQI Range</div>
                <div className="text-xl font-bold text-navy-800">{summary.aqiRange}</div>
                <div className="text-xs text-navy-400">points</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-navy-500 font-medium">Std. Dev.</div>
                <div className="text-xl font-bold text-navy-800">~{summary.stdDevAqi}</div>
                <div className="text-xs text-navy-400">AQI units</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-navy-500 font-medium">Days Analysed</div>
                <div className="text-xl font-bold text-navy-800">{summary.count}</div>
                <div className="text-xs text-navy-400">observations</div>
              </div>
            </div>
          </div>

          {/* AQI scale legend */}
          <div className="flex-shrink-0">
            <div className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3 text-center">CPCB AQI Scale</div>
            {[
              { label: 'Good', range: '0–50', color: '#22C55E' },
              { label: 'Satisfactory', range: '51–100', color: '#84CC16' },
              { label: 'Moderate', range: '101–200', color: '#F59E0B' },
              { label: 'Poor', range: '201–300', color: '#F97316' },
              { label: 'Very Poor', range: '301–400', color: '#EF4444' },
              { label: 'Severe', range: '401–500', color: '#7C3AED' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-navy-600 font-medium w-20">{item.label}</span>
                <span className="text-xs text-navy-400 font-mono">{item.range}</span>
              </div>
            ))}
            <p className="text-xs text-navy-400 mt-2 max-w-[140px] text-center">
              Mean AQI {summary.meanAqi} falls in the Satisfactory range
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          label="Avg AQI"
          value={summary.meanAqi}
          subtext="14-day mean"
          icon={<Activity size={15} />}
          accent="#0EA5E9"
        />
        <KPICard
          label="Highest AQI"
          value={summary.maxAqi}
          subtext="21 Sep 2026"
          icon={<TrendingUp size={15} />}
          accent="#EF4444"
        />
        <KPICard
          label="Lowest AQI"
          value={summary.minAqi}
          subtext="27 Sep 2026"
          icon={<TrendingDown size={15} />}
          accent="#22C55E"
        />
        <KPICard
          label="Avg PM2.5"
          value={summary.meanPm25.toFixed(1)}
          unit="µg/m³"
          subtext="14-day mean"
          icon={<Wind size={15} />}
          accent="#8B5CF6"
        />
        <KPICard
          label="Avg PM10"
          value={summary.meanPm10.toFixed(1)}
          unit="µg/m³"
          subtext="14-day mean"
          icon={<Layers size={15} />}
          accent="#F97316"
        />
        <KPICard
          label="Days Analysed"
          value={summary.count}
          subtext="All in Satisfactory/Good"
          icon={<Calendar size={15} />}
          accent="#0EA5E9"
        />
      </div>

      {/* Two-column: Trend chart + Category distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AQI Trend Chart */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-navy-800">Daily AQI Trend</h2>
              <p className="text-xs text-navy-400 mt-0.5">16–29 September 2026 · Somajiguda TSPCB</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {CHART_METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setChartMetric(m.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    chartMetric === m.key
                      ? 'bg-white text-navy-800 shadow-sm'
                      : 'text-navy-500 hover:text-navy-700'
                  }`}
                  aria-pressed={chartMetric === m.key}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <AQITrendChart data={chartData} metric={chartMetric} height={260} />
        </div>

        {/* Category Distribution */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-navy-800 mb-1">AQI Category Distribution</h2>
          <p className="text-xs text-navy-400 mb-4">14 daily observations</p>
          <CategoryDistributionChart
            counts={summary.categoryCounts}
            totalDays={summary.count}
          />

          {/* Category summary */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-2.5 text-center border border-green-100">
              <div className="text-lg font-bold text-green-700">{summary.categoryCounts.Good}</div>
              <div className="text-xs text-green-600 font-medium">Good days</div>
            </div>
            <div className="bg-lime-50 rounded-lg p-2.5 text-center border border-lime-100">
              <div className="text-lg font-bold text-lime-700">{summary.categoryCounts.Satisfactory}</div>
              <div className="text-xs text-lime-600 font-medium">Satisfactory</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pollutant comparison */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-navy-800">PM2.5 vs PM10 Concentration</h2>
            <p className="text-xs text-navy-400 mt-0.5">
              Both are particle concentration measurements (µg/m³) — not interchangeable with AQI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPm25}
                onChange={e => setShowPm25(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
                id="toggle-pm25"
              />
              <span className="text-xs font-medium text-purple-700">PM2.5</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPm10}
                onChange={e => setShowPm10(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
                id="toggle-pm10"
              />
              <span className="text-xs font-medium text-orange-600">PM10</span>
            </label>
          </div>
        </div>
        <PollutantComparisonChart
          data={chartData}
          showPm25={showPm25}
          showPm10={showPm10}
          height={250}
        />
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-navy-500">
            <strong>PM2.5:</strong> Fine particles ≤2.5 µm — can penetrate deep into respiratory system.
            <strong className="ml-2">PM10:</strong> Coarser particles ≤10 µm — includes road dust, construction debris.
            Dashed lines show WHO 2021 guidelines (PM2.5: 15 µg/m³; PM10: 45 µg/m³).
          </p>
        </div>
      </div>

      {/* Period comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <BarChart2 size={15} className="text-sky-600" />
            </div>
            <h2 className="text-sm font-semibold text-navy-800">Week-by-Week Comparison</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-navy-600">16–22 Sep (Week 1)</span>
                <span className="text-sm font-bold text-navy-900">{summary.period1AvgAqi}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(summary.period1AvgAqi / 100) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-navy-600">23–29 Sep (Week 2)</span>
                <span className="text-sm font-bold text-navy-900">{summary.period2AvgAqi}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-400 rounded-full"
                  style={{ width: `${(summary.period2AvgAqi / 100) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-navy-400">
              Week 2 shows a lower average AQI. The 4 Good-category days all fell in the second half of the study period.
              Note: Correlation with specific factors cannot be established from this 14-day sample alone.
            </p>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Target size={15} className="text-purple-600" />
            </div>
            <h2 className="text-sm font-semibold text-navy-800">Main Pollutant Breakdown</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-orange-600">PM10</span>
                <span className="text-sm font-bold text-navy-800">{summary.pollutantCounts['PM10']} days</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${(summary.pollutantCounts['PM10'] / summary.count) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-purple-600">PM2.5</span>
                <span className="text-sm font-bold text-navy-800">{summary.pollutantCounts['PM2.5']} days</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${(summary.pollutantCounts['PM2.5'] / summary.count) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-navy-400 mt-3">
            PM2.5 dominated on 20–23 September, coinciding with the study period's highest AQI values.
            PM10 was the main pollutant on {summary.pollutantCounts['PM10']} of {summary.count} days.
          </p>
        </div>
      </div>

      {/* Insight cards */}
      <div>
        <h2 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <Info size={15} className="text-sky-600" />
          Data Insights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.slice(0, 6).map(insight => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              type={insight.type}
              icon={
                insight.type === 'warning' ? <AlertTriangle size={14} /> :
                insight.type === 'success' ? <CheckCircle size={14} /> :
                <Info size={14} />
              }
            />
          ))}
        </div>
      </div>

      {/* Recent observations table */}
      <div>
        <h2 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <Database size={15} className="text-sky-600" />
          Observations (Most Recent First)
        </h2>
        <ObservationTable
          data={HISTORICAL_DATA}
          showExport={true}
          maxRows={7}
          title="Daily Air Quality Observations — Somajiguda TSPCB"
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800 mb-1">Historical Data Disclaimer</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              All measurements displayed are <strong>historical observations</strong> from the Somajiguda TSPCB monitoring station
              (16–29 September 2026), sourced from the CPCB Central Control Room for Air Quality Management Data Repository.
              This data does not represent current or real-time air quality. A single 14-day monitoring period at one station
              cannot establish citywide or annual air quality conditions. AQI values are as reported in the assignment source document.
              This application is developed as part of an academic assignment for BCV755B at Sir MVIT, Bengaluru.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
