import { useState, useMemo } from 'react';
import {
  Bell, AlertTriangle, ShieldAlert, CheckCircle2,
  Sliders, Filter, RefreshCw, Volume2, Info, Calendar,
  Activity, ArrowUpRight, Check, Trash2
} from 'lucide-react';
import { HISTORICAL_DATA } from '../data/historicalData';
import { AQICategoryBadge } from '../components/cards/AQICategoryBadge';
import { formatDate, getCategoryColor } from '../utils/dataUtils';
import type { AQICategory, DailyObservation } from '../types/data';

interface HistoricalAlert {
  id: string;
  date: string;
  aqi: number;
  category: AQICategory;
  mainPollutant: 'PM2.5' | 'PM10';
  pm25: number;
  pm10: number;
  severity: 'low' | 'medium' | 'high';
  read: boolean;
  message: string;
}

export function AlertsCentrePage() {
  const [threshold, setThreshold] = useState<number>(60);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [pollutantFilter, setPollutantFilter] = useState<'ALL' | 'PM2.5' | 'PM10'>('ALL');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Derive alerts from historical observations
  const alerts: HistoricalAlert[] = useMemo(() => {
    return HISTORICAL_DATA
      .filter(obs => obs.aqi >= threshold)
      .map(obs => {
        let severity: 'low' | 'medium' | 'high' = 'low';
        let msg = '';

        if (obs.aqi >= 90) {
          severity = 'high';
          msg = `Substantial elevated air pollution observed (AQI ${obs.aqi}). Sensitive individuals should limit outdoor activity.`;
        } else if (obs.aqi >= 70) {
          severity = 'medium';
          msg = `Elevated ${obs.mainPollutant} concentrations (AQI ${obs.aqi}). Increased particulate presence recorded.`;
        } else {
          severity = 'low';
          msg = `Threshold breach detected (AQI ${obs.aqi} vs threshold ${threshold}). Routine cautionary advisory.`;
        }

        return {
          id: `alert-${obs.date}`,
          date: obs.date,
          aqi: obs.aqi,
          category: obs.category,
          mainPollutant: obs.mainPollutant,
          pm25: obs.pm25,
          pm10: obs.pm10,
          severity,
          read: readIds.has(`alert-${obs.date}`),
          message: msg,
        };
      })
      .filter(alert => !dismissedIds.has(alert.id));
  }, [threshold, dismissedIds, readIds]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filterType === 'unread' && alert.read) return false;
      if (filterType === 'read' && !alert.read) return false;
      if (pollutantFilter !== 'ALL' && alert.mainPollutant !== pollutantFilter) return false;
      return true;
    });
  }, [alerts, filterType, pollutantFilter]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllAsRead = () => {
    const newRead = new Set(readIds);
    alerts.forEach(a => newRead.add(a.id));
    setReadIds(newRead);
  };

  const toggleRead = (id: string) => {
    const newRead = new Set(readIds);
    if (newRead.has(id)) {
      newRead.delete(id);
    } else {
      newRead.add(id);
    }
    setReadIds(newRead);
  };

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const resetDismissed = () => {
    setDismissedIds(new Set());
    setReadIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900 dark:text-white">Alerts & Warning Centre</h1>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Configurable threshold monitoring and historical exposure alert reconstruction
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              soundEnabled
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300'
                : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-navy-600 dark:text-navy-300'
            }`}
            title="Toggle alert sound simulation"
          >
            <Volume2 size={14} className={soundEnabled ? 'text-rose-500' : 'text-slate-400'} />
            Sound Sim: {soundEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={resetDismissed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
          >
            <RefreshCw size={13} />
            Reset Feed
          </button>
        </div>
      </div>

      {/* Historical Disclaimer Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
        <Info size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Historical Advisory Engine Mode</p>
          <p className="text-amber-700 dark:text-amber-300">
            This module retrospectively applies custom warning thresholds to the 16–29 September 2026 Somajiguda CPCB dataset. It allows environmental health officers to evaluate alert frequency, peak exposure triggers, and public notification efficacy.
          </p>
        </div>
      </div>

      {/* Controls and Threshold Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threshold Configuration Card */}
        <div className="card p-5 lg:col-span-1 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Sliders size={16} className="text-sky-500" />
              Trigger Parameters
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 rounded">
              AQI &ge; {threshold}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-navy-600 dark:text-navy-300 mb-1.5 font-medium">
              <span>AQI Warning Threshold</span>
              <span className="font-bold text-navy-900 dark:text-white">{threshold}</span>
            </div>
            <input
              type="range"
              min={35}
              max={100}
              step={1}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-navy-400 mt-1">
              <span>35 (Strict)</span>
              <span>60 (Standard)</span>
              <span>85 (Critical)</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-navy-300 block mb-2">
              Sensitivity Profiles
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setThreshold(50)}
                className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  threshold === 50
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-navy-600 dark:text-navy-400'
                }`}
              >
                Strict (50)
              </button>
              <button
                onClick={() => setThreshold(60)}
                className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  threshold === 60
                    ? 'bg-lime-50 dark:bg-lime-950/40 border-lime-300 dark:border-lime-800 text-lime-700 dark:text-lime-300'
                    : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-navy-600 dark:text-navy-400'
                }`}
              >
                Standard (60)
              </button>
              <button
                onClick={() => setThreshold(80)}
                className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  threshold === 80
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-navy-600 dark:text-navy-400'
                }`}
              >
                High (80)
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-3 border-t border-slate-200 dark:border-navy-700 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-navy-500 dark:text-navy-400">Triggered Days:</span>
              <span className="font-bold text-navy-900 dark:text-white">
                {alerts.length} of {HISTORICAL_DATA.length} ({Math.round((alerts.length / HISTORICAL_DATA.length) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-navy-500 dark:text-navy-400">Peak Alert AQI:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {alerts.length > 0 ? Math.max(...alerts.map(a => a.aqi)) : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-navy-500 dark:text-navy-400">Unread Notifications:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{unreadCount}</span>
            </div>
          </div>
        </div>

        {/* Alerts Feed Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Feed Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-navy-400 ml-1" />
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-navy-900 dark:bg-sky-500 text-white'
                    : 'text-navy-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  filterType === 'unread'
                    ? 'bg-navy-900 dark:bg-sky-500 text-white'
                    : 'text-navy-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterType('read')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  filterType === 'read'
                    ? 'bg-navy-900 dark:bg-sky-500 text-white'
                    : 'text-navy-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                Read ({alerts.length - unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-navy-700 p-0.5 text-xs">
                {(['ALL', 'PM2.5', 'PM10'] as const).map(pollutant => (
                  <button
                    key={pollutant}
                    onClick={() => setPollutantFilter(pollutant)}
                    className={`px-2 py-0.5 rounded font-medium ${
                      pollutantFilter === pollutant
                        ? 'bg-slate-200 dark:bg-navy-700 text-navy-900 dark:text-white'
                        : 'text-navy-500 dark:text-navy-400'
                    }`}
                  >
                    {pollutant}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Alert List */}
          {filteredAlerts.length === 0 ? (
            <div className="card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                No Triggered Advisories
              </h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 max-w-sm mx-auto">
                {threshold > 95
                  ? `No historical days reached the high threshold of ${threshold}. Adjust slider to simulate lower exposure tiers.`
                  : 'No alerts match the currently applied filter parameters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`card p-4 transition-all border-l-4 ${
                    alert.read
                      ? 'border-slate-300 dark:border-navy-700 opacity-80'
                      : alert.severity === 'high'
                      ? 'border-l-rose-500 shadow-sm'
                      : alert.severity === 'medium'
                      ? 'border-l-amber-500 shadow-sm'
                      : 'border-l-sky-500 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          alert.severity === 'high'
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                            : alert.severity === 'medium'
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                        }`}
                      >
                        {alert.severity === 'high' ? (
                          <ShieldAlert size={18} />
                        ) : (
                          <AlertTriangle size={18} />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                            <Calendar size={13} className="text-navy-400" />
                            {formatDate(alert.date)}
                          </span>
                          <AQICategoryBadge category={alert.category} size="sm" />
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-navy-600 dark:text-navy-400">
                            Dominant: {alert.mainPollutant}
                          </span>
                        </div>

                        <p className="text-xs text-navy-700 dark:text-navy-300 leading-relaxed">
                          {alert.message}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-navy-500 dark:text-navy-400 pt-1">
                          <span>PM2.5: <strong className="text-navy-800 dark:text-navy-200">{alert.pm25.toFixed(1)} µg/m³</strong></span>
                          <span>PM10: <strong className="text-navy-800 dark:text-navy-200">{alert.pm10.toFixed(1)} µg/m³</strong></span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            +{alert.aqi - threshold} pts above threshold
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => toggleRead(alert.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          alert.read
                            ? 'border-slate-200 dark:border-navy-700 text-navy-400 hover:text-navy-600'
                            : 'border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300'
                        }`}
                        title={alert.read ? 'Mark as unread' : 'Mark as read'}
                        aria-label={alert.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        <Check size={14} />
                      </button>

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-navy-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                        title="Dismiss alert"
                        aria-label="Dismiss alert"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
