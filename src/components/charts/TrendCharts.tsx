import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Legend, Dot
} from 'recharts';
import { ChartDataPoint, AQICategory } from '../../types/data';
import { getCategoryColor, formatShortDate } from '../../utils/dataUtils';
import { AQICategoryBadge } from '../cards/AQICategoryBadge';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  data?: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label, data }: CustomTooltipProps) {
  if (!active || !payload || !payload.length || !data) return null;

  const obs = data.find(d => d.displayDate === label);
  if (!obs) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card-lg p-3 text-xs">
      <div className="font-semibold text-navy-800 mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-navy-500">{p.name}:</span>
          <span className="font-semibold text-navy-800">{typeof p.value === 'number' ? p.value.toFixed(p.name === 'AQI' ? 0 : 2) : p.value}</span>
          {p.name !== 'AQI' && <span className="text-navy-400">µg/m³</span>}
        </div>
      ))}
      {obs.category && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <AQICategoryBadge category={obs.category as AQICategory} size="sm" />
          <span className="ml-2 text-navy-500">Main: {obs.mainPollutant}</span>
        </div>
      )}
    </div>
  );
}

interface AQITrendChartProps {
  data: ChartDataPoint[];
  metric?: 'aqi' | 'pm25' | 'pm10' | 'all';
  height?: number;
  showBands?: boolean;
}

const METRIC_CONFIG = {
  aqi: { key: 'aqi', label: 'AQI', color: '#0EA5E9', unit: '' },
  pm25: { key: 'pm25', label: 'PM2.5', color: '#8B5CF6', unit: 'µg/m³' },
  pm10: { key: 'pm10', label: 'PM10', color: '#F97316', unit: 'µg/m³' },
};

export function AQITrendChart({ data, metric = 'aqi', height = 280, showBands = true }: AQITrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-navy-400 text-sm">
        No data available for this selection.
      </div>
    );
  }

  const maxObs = data.reduce((m, d) => d.aqi > m.aqi ? d : m, data[0]);
  const minObs = data.reduce((m, d) => d.aqi < m.aqi ? d : m, data[0]);

  if (metric === 'all') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip data={data} />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#64748B' }} />
          <Line type="monotone" dataKey="aqi" name="AQI" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 3, fill: '#0EA5E9' }} />
          <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="pm10" name="PM10" stroke="#F97316" strokeWidth={2} dot={{ r: 3, fill: '#F97316' }} strokeDasharray="2 2" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const cfg = METRIC_CONFIG[metric];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={cfg.color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={cfg.color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<CustomTooltip data={data} />} />

        {/* AQI category reference lines only for AQI metric */}
        {metric === 'aqi' && showBands && (
          <>
            <ReferenceLine y={50} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Good', position: 'right', fontSize: 10, fill: '#22C55E' }} />
            <ReferenceLine y={100} stroke="#84CC16" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Satisfactory', position: 'right', fontSize: 10, fill: '#84CC16' }} />
          </>
        )}

        {/* Max/min markers */}
        {metric === 'aqi' && (
          <>
            <ReferenceLine
              x={maxObs.displayDate}
              stroke="#EF4444"
              strokeDasharray="4 2"
              strokeOpacity={0.6}
              label={{ value: `Max ${maxObs.aqi}`, position: 'insideTopRight', fontSize: 10, fill: '#EF4444' }}
            />
            <ReferenceLine
              x={minObs.displayDate}
              stroke="#22C55E"
              strokeDasharray="4 2"
              strokeOpacity={0.6}
              label={{ value: `Min ${minObs.aqi}`, position: 'insideBottomLeft', fontSize: 10, fill: '#22C55E' }}
            />
          </>
        )}

        <Area
          type="monotone"
          dataKey={cfg.key}
          name={cfg.label}
          stroke={cfg.color}
          strokeWidth={2.5}
          fill={`url(#gradient-${metric})`}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const obs = data.find(d => d.displayDate === payload.displayDate);
            const dotColor = metric === 'aqi' && obs ? getCategoryColor(obs.category) : cfg.color;
            return <circle key={`dot-${payload.displayDate}`} cx={cx} cy={cy} r={4} fill={dotColor} stroke="white" strokeWidth={1.5} />;
          }}
          activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface PollutantComparisonChartProps {
  data: ChartDataPoint[];
  height?: number;
  showPm25?: boolean;
  showPm10?: boolean;
  showAqi?: boolean;
}

export function PollutantComparisonChart({
  data, height = 280, showPm25 = true, showPm10 = true, showAqi = false
}: PollutantComparisonChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-navy-400 text-sm">No data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} width={45} unit=" µg" />
        <Tooltip content={<CustomTooltip data={data} />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#64748B' }} />

        {/* WHO reference lines */}
        {showPm25 && (
          <ReferenceLine y={15} stroke="#8B5CF6" strokeDasharray="4 2" strokeOpacity={0.6}
            label={{ value: 'WHO PM2.5 (15)', position: 'insideTopLeft', fontSize: 9, fill: '#8B5CF6' }} />
        )}
        {showPm10 && (
          <ReferenceLine y={45} stroke="#F97316" strokeDasharray="4 2" strokeOpacity={0.6}
            label={{ value: 'WHO PM10 (45)', position: 'insideTopRight', fontSize: 9, fill: '#F97316' }} />
        )}

        {showPm25 && (
          <Line type="monotone" dataKey="pm25" name="PM2.5 (µg/m³)" stroke="#8B5CF6" strokeWidth={2.5}
            dot={{ r: 3.5, fill: '#8B5CF6', strokeWidth: 1.5, stroke: 'white' }}
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }} />
        )}
        {showPm10 && (
          <Line type="monotone" dataKey="pm10" name="PM10 (µg/m³)" stroke="#F97316" strokeWidth={2.5}
            dot={{ r: 3.5, fill: '#F97316', strokeWidth: 1.5, stroke: 'white' }}
            activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }} />
        )}
        {showAqi && (
          <Line type="monotone" dataKey="aqi" name="AQI" stroke="#0EA5E9" strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: '#0EA5E9' }}
            activeDot={{ r: 5 }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
