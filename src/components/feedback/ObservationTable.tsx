import { useState, useMemo, Fragment } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronRight } from 'lucide-react';
import { DailyObservation } from '../../types/data';
import { formatDate, exportToCSV } from '../../utils/dataUtils';
import { AQICategoryBadge } from '../cards/AQICategoryBadge';

type SortField = 'date' | 'aqi' | 'pm25' | 'pm10';
type SortDir = 'asc' | 'desc';

interface ObservationTableProps {
  data: DailyObservation[];
  showExport?: boolean;
  maxRows?: number;
  title?: string;
}

export function ObservationTable({ data, showExport = true, maxRows, title }: ObservationTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const arr = [...data].sort((a, b) => {
      let av: number | string = a[sortField] ?? '';
      let bv: number | string = b[sortField] ?? '';
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return maxRows ? arr.slice(0, maxRows) : arr;
  }, [data, sortField, sortDir, maxRows]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-sky-600" /> : <ArrowDown size={12} className="text-sky-600" />;
  }

  function ThBtn({ field, label }: { field: SortField; label: string }) {
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold text-navy-500 uppercase tracking-wide hover:text-navy-800 transition-colors focus:outline-none focus:text-sky-600"
        aria-sort={sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <SortIcon field={field} />
      </button>
    );
  }

  return (
    <div className="card overflow-hidden">
      {(title || showExport) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          {title && <h3 className="text-sm font-semibold text-navy-800">{title}</h3>}
          {showExport && (
            <button
              onClick={() => exportToCSV(data)}
              className="btn-secondary text-xs"
              aria-label="Export observations to CSV"
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Daily air quality observations">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3"><ThBtn field="date" label="Date" /></th>
              <th className="text-right px-4 py-3"><ThBtn field="aqi" label="AQI" /></th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Category</span>
              </th>
              <th className="text-right px-4 py-3 hidden md:table-cell"><ThBtn field="pm25" label="PM2.5" /></th>
              <th className="text-right px-4 py-3 hidden md:table-cell"><ThBtn field="pm10" label="PM10" /></th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Main Pollutant</span>
              </th>
              <th className="px-2 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-navy-400 text-sm">
                  No observations match the current filters.
                </td>
              </tr>
            ) : (
              sorted.map(obs => (
                <Fragment key={obs.date}>
                  <tr
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === obs.date ? null : obs.date)}
                    aria-expanded={expanded === obs.date}
                  >
                    <td className="px-4 py-3 font-medium text-navy-800">{formatDate(obs.date)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-navy-900">{obs.aqi}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <AQICategoryBadge category={obs.category} />
                    </td>
                    <td className="px-4 py-3 text-right text-navy-700 hidden md:table-cell">
                      {obs.pm25.toFixed(2)}
                      <span className="text-navy-400 text-xs ml-1">µg/m³</span>
                    </td>
                    <td className="px-4 py-3 text-right text-navy-700 hidden md:table-cell">
                      {obs.pm10.toFixed(2)}
                      <span className="text-navy-400 text-xs ml-1">µg/m³</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        obs.mainPollutant === 'PM2.5'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {obs.mainPollutant}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <ChevronRight
                        size={14}
                        className={`text-navy-400 transition-transform duration-200 ${expanded === obs.date ? 'rotate-90' : ''}`}
                      />
                    </td>
                  </tr>
                  {expanded === obs.date && (
                    <tr className="bg-sky-50 border-b border-sky-100">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <div className="text-navy-400 font-medium uppercase tracking-wide">Date</div>
                            <div className="font-semibold text-navy-800 mt-0.5">{formatDate(obs.date)}</div>
                          </div>
                          <div>
                            <div className="text-navy-400 font-medium uppercase tracking-wide">AQI (Reported)</div>
                            <div className="font-bold text-navy-900 mt-0.5 text-base">{obs.aqi}</div>
                          </div>
                          <div>
                            <div className="text-navy-400 font-medium uppercase tracking-wide">PM2.5</div>
                            <div className="font-semibold text-purple-700 mt-0.5">{obs.pm25.toFixed(2)} µg/m³</div>
                          </div>
                          <div>
                            <div className="text-navy-400 font-medium uppercase tracking-wide">PM10</div>
                            <div className="font-semibold text-orange-600 mt-0.5">{obs.pm10.toFixed(2)} µg/m³</div>
                          </div>
                          <div>
                            <div className="text-navy-400 font-medium uppercase tracking-wide">Category</div>
                            <div className="mt-0.5"><AQICategoryBadge category={obs.category} size="sm" /></div>
                          </div>
                          <div>
                            <div className="text-navy-400 font-medium uppercase tracking-wide">Main Pollutant</div>
                            <div className="font-semibold text-navy-800 mt-0.5">{obs.mainPollutant}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {maxRows && data.length > maxRows && (
        <div className="px-4 py-3 border-t border-slate-100 text-center">
          <span className="text-xs text-navy-400">Showing {maxRows} of {data.length} observations. Go to AQI Explorer for full data.</span>
        </div>
      )}
    </div>
  );
}
