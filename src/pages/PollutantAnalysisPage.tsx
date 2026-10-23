import { useMemo, useState } from 'react';
import { Info, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { HISTORICAL_DATA } from '../data/historicalData';
import {
  computeSummary, formatDate, formatShortDate,
  countExceedances, getExceedanceDates, REFERENCE_VALUES
} from '../utils/dataUtils';
import { PollutantComparisonChart, AQITrendChart } from '../components/charts/TrendCharts';
import { AQICategoryBadge } from '../components/cards/AQICategoryBadge';
import { ChartDataPoint } from '../types/data';

export function PollutantAnalysisPage() {
  const [showPm25, setShowPm25] = useState(true);
  const [showPm10, setShowPm10] = useState(true);

  const summary = useMemo(() => computeSummary(HISTORICAL_DATA), []);

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

  // Exceedance analysis
  const pm25WhoExceed = countExceedances(HISTORICAL_DATA, 'pm25', REFERENCE_VALUES.pm25.who2021);
  const pm25NaaqsExceed = countExceedances(HISTORICAL_DATA, 'pm25', REFERENCE_VALUES.pm25.indianNAAQS);
  const pm10WhoExceed = countExceedances(HISTORICAL_DATA, 'pm10', REFERENCE_VALUES.pm10.who2021);
  const pm10NaaqsExceed = countExceedances(HISTORICAL_DATA, 'pm10', REFERENCE_VALUES.pm10.indianNAAQS);

  const maxPm25 = HISTORICAL_DATA.reduce((m, d) => d.pm25 > m.pm25 ? d : m, HISTORICAL_DATA[0]);
  const maxPm10 = HISTORICAL_DATA.reduce((m, d) => d.pm10 > m.pm10 ? d : m, HISTORICAL_DATA[0]);

  function ReferenceRow({ label, value, threshold, unit }: {
    label: string; value: number; threshold: number; unit: string;
  }) {
    const exceeds = value > threshold;
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        exceeds ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
      }`}>
        <span className="text-xs font-medium text-navy-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-navy-800">{threshold} {unit}</span>
          {exceeds
            ? <XCircle size={14} className="text-red-500" />
            : <CheckCircle size={14} className="text-green-500" />
          }
        </div>
      </div>
    );
  }

  function PollutantSection({
    pollutant, values, avg, max, maxDate, naaqs, who,
    whoExceedCount, naaqsExceedCount, color, description, sources
  }: {
    pollutant: 'PM2.5' | 'PM10';
    values: number[];
    avg: number;
    max: number;
    maxDate: string;
    naaqs: number;
    who: number;
    whoExceedCount: number;
    naaqsExceedCount: number;
    color: string;
    description: string;
    sources: string[];
  }) {
    return (
      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">{pollutant}</h2>
            <p className="text-xs text-navy-500 mt-0.5">
              Particulate matter ≤{pollutant === 'PM2.5' ? '2.5' : '10'} micrometres aerodynamic diameter
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {pollutant}
          </div>
        </div>

        <p className="text-sm text-navy-700 leading-relaxed">{description}</p>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-navy-500 font-medium">Mean</div>
            <div className="text-xl font-bold text-navy-800 mt-0.5">{avg.toFixed(2)}</div>
            <div className="text-xs text-navy-400">µg/m³</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-navy-500 font-medium">Maximum</div>
            <div className="text-xl font-bold text-navy-800 mt-0.5">{max.toFixed(2)}</div>
            <div className="text-xs text-navy-400">µg/m³</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-xs text-navy-500 font-medium">Max Date</div>
            <div className="text-sm font-bold text-navy-800 mt-0.5">{formatDate(maxDate)}</div>
          </div>
        </div>

        {/* Reference values */}
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">
            Comparison with Reference Values (24-hour averages)
          </div>
          <div className="space-y-2">
            <ReferenceRow
              label="Indian NAAQS 24-hour reference"
              value={avg}
              threshold={naaqs}
              unit="µg/m³"
            />
            <ReferenceRow
              label="WHO 2021 AQG"
              value={avg}
              threshold={who}
              unit="µg/m³"
            />
          </div>
          <p className="text-xs text-navy-400 mt-2">
            ⓘ Mean concentration is compared against 24-hour reference values for context only.
          </p>
        </div>

        {/* Daily exceedances */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${
            whoExceedCount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'
          }`}>
            <div className="text-xs font-medium text-navy-600 mb-1">Days exceeding WHO guideline</div>
            <div className={`text-2xl font-bold ${whoExceedCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>
              {whoExceedCount}
            </div>
            <div className="text-xs text-navy-400">of {HISTORICAL_DATA.length} days</div>
            <div className="text-xs text-navy-400 mt-0.5">(WHO: {who} µg/m³)</div>
          </div>
          <div className={`p-3 rounded-lg border ${
            naaqsExceedCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
          }`}>
            <div className="text-xs font-medium text-navy-600 mb-1">Days exceeding NAAQS reference</div>
            <div className={`text-2xl font-bold ${naaqsExceedCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {naaqsExceedCount}
            </div>
            <div className="text-xs text-navy-400">of {HISTORICAL_DATA.length} days</div>
            <div className="text-xs text-navy-400 mt-0.5">(NAAQS: {naaqs} µg/m³)</div>
          </div>
        </div>

        {/* Sources */}
        <div>
          <div className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">Potential Sources</div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map(s => (
              <span key={s} className="px-2 py-0.5 bg-slate-100 text-navy-600 rounded-full text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Pollutant Analysis</h1>
        <p className="text-sm text-navy-500 mt-1">
          Scientific analysis of PM2.5 and PM10 concentrations — Somajiguda TSPCB · 16–29 September 2026
        </p>
      </div>

      {/* Combined chart */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-navy-800">Daily PM2.5 & PM10 Concentrations</h2>
            <p className="text-xs text-navy-400 mt-0.5">
              Dashed reference lines = WHO 2021 guidelines (PM2.5: 15 µg/m³ · PM10: 45 µg/m³)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={showPm25} onChange={e => setShowPm25(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500" id="pm25-toggle" />
              <span className="text-xs font-medium text-purple-700">PM2.5</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={showPm10} onChange={e => setShowPm10(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500" id="pm10-toggle" />
              <span className="text-xs font-medium text-orange-600">PM10</span>
            </label>
          </div>
        </div>
        <PollutantComparisonChart
          data={chartData}
          showPm25={showPm25}
          showPm10={showPm10}
          height={270}
        />
      </div>

      {/* Per-pollutant analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PollutantSection
          pollutant="PM2.5"
          values={HISTORICAL_DATA.map(d => d.pm25)}
          avg={summary.meanPm25}
          max={maxPm25.pm25}
          maxDate={maxPm25.date}
          naaqs={REFERENCE_VALUES.pm25.indianNAAQS}
          who={REFERENCE_VALUES.pm25.who2021}
          whoExceedCount={pm25WhoExceed}
          naaqsExceedCount={pm25NaaqsExceed}
          color="#8B5CF6"
          description="Fine particulate matter with an aerodynamic diameter of approximately 2.5 micrometres or less. Because of their very small size, PM2.5 particles can penetrate deeply into the respiratory system, reaching the alveoli and potentially entering the bloodstream. Prolonged exposure is associated with cardiovascular and respiratory health effects. Common sources include combustion processes, vehicle exhaust emissions, and secondary particle formation through atmospheric reactions."
          sources={['Vehicle exhaust', 'Combustion', 'Secondary aerosols', 'Industrial emissions', 'Biomass burning']}
        />
        <PollutantSection
          pollutant="PM10"
          values={HISTORICAL_DATA.map(d => d.pm10)}
          avg={summary.meanPm10}
          max={maxPm10.pm10}
          maxDate={maxPm10.date}
          naaqs={REFERENCE_VALUES.pm10.indianNAAQS}
          who={REFERENCE_VALUES.pm10.who2021}
          whoExceedCount={pm10WhoExceed}
          naaqsExceedCount={pm10NaaqsExceed}
          color="#F97316"
          description="Coarser particulate matter with an aerodynamic diameter of approximately 10 micrometres or less (includes PM2.5 as a subset). PM10 is typically deposited in the upper respiratory tract. Sources in urban environments like Somajiguda commonly include road dust resuspension, construction activity, exposed soil, and vehicle tyre and brake wear. It was the primary AQI-controlling pollutant on 10 of the 14 study days."
          sources={['Road dust', 'Construction sites', 'Soil resuspension', 'Tyre/brake wear', 'Open land']}
        />
      </div>

      {/* Standards comparison table */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-navy-800 mb-1">Reference Value Comparison Table</h2>
        <p className="text-xs text-navy-400 mb-4">
          Indian NAAQS and WHO 2021 AQG are different standards with different purposes.
          Compliance with Indian NAAQS does not imply compliance with WHO guidelines and vice versa.
          A 14-day sample cannot determine annual compliance.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Reference standards comparison">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">Pollutant</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">Observed Mean (µg/m³)</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">Indian NAAQS (µg/m³)</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">WHO 2021 AQG (µg/m³)</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">Days Exceeding WHO</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-navy-500 uppercase tracking-wide">Days Exceeding NAAQS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-purple-700">PM2.5</td>
                <td className="px-4 py-3 text-right text-navy-800">{summary.meanPm25.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-navy-600">{REFERENCE_VALUES.pm25.indianNAAQS}</td>
                <td className="px-4 py-3 text-right text-navy-600">{REFERENCE_VALUES.pm25.who2021}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-amber-700">{pm25WhoExceed}</span>
                  <span className="text-navy-400 text-xs"> / {HISTORICAL_DATA.length}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${pm25NaaqsExceed > 0 ? 'text-red-700' : 'text-green-700'}`}>{pm25NaaqsExceed}</span>
                  <span className="text-navy-400 text-xs"> / {HISTORICAL_DATA.length}</span>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-orange-600">PM10</td>
                <td className="px-4 py-3 text-right text-navy-800">{summary.meanPm10.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-navy-600">{REFERENCE_VALUES.pm10.indianNAAQS}</td>
                <td className="px-4 py-3 text-right text-navy-600">{REFERENCE_VALUES.pm10.who2021}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-amber-700">{pm10WhoExceed}</span>
                  <span className="text-navy-400 text-xs"> / {HISTORICAL_DATA.length}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${pm10NaaqsExceed > 0 ? 'text-red-700' : 'text-green-700'}`}>{pm10NaaqsExceed}</span>
                  <span className="text-navy-400 text-xs"> / {HISTORICAL_DATA.length}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex gap-2">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          Compliance with the Indian NAAQS reference values during this 14-day sample does not prove that air is universally safe
          or that the station complies year-round. WHO guidelines are aspirational health targets and are more stringent than Indian standards.
          This information is educational and does not constitute a health assessment for any individual.
        </div>
      </div>
    </div>
  );
}
