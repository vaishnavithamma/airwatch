import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AQICategory } from '../../types/data';
import { getCategoryColor } from '../../utils/dataUtils';

interface CategoryDistributionChartProps {
  counts: Record<AQICategory, number>;
  totalDays: number;
}

const ALL_CATEGORIES: AQICategory[] = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];

export function CategoryDistributionChart({ counts, totalDays }: CategoryDistributionChartProps) {
  const data = ALL_CATEGORIES.map(cat => ({
    category: cat,
    days: counts[cat] ?? 0,
    percentage: totalDays > 0 ? Math.round(((counts[cat] ?? 0) / totalDays) * 100) : 0,
    color: getCategoryColor(cat),
  }));

  return (
    <div className="space-y-2">
      {data.map(item => (
        <div key={item.category} className="flex items-center gap-3">
          <div className="w-20 text-xs font-medium text-navy-600 text-right flex-shrink-0">{item.category}</div>
          <div className="flex-1 relative h-7 bg-slate-100 rounded-md overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-700 ease-out"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                opacity: item.days === 0 ? 0.25 : 0.85,
                minWidth: item.days > 0 ? '4px' : '0',
              }}
              role="progressbar"
              aria-valuenow={item.days}
              aria-valuemin={0}
              aria-valuemax={totalDays}
              aria-label={`${item.category}: ${item.days} days`}
            />
          </div>
          <div className="w-16 flex items-center gap-1 flex-shrink-0">
            <span className="text-sm font-semibold text-navy-800">{item.days}</span>
            <span className="text-xs text-navy-400">
              {item.days === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      ))}
      <p className="text-xs text-navy-400 pt-1">
        Based on {totalDays} daily observations. Zero-count categories are shown for completeness.
      </p>
    </div>
  );
}

interface AQIBarChartProps {
  data: Array<{
    displayDate: string;
    aqi: number;
    category: AQICategory;
  }>;
  height?: number;
}

export function AQIBarChart({ data, height = 200 }: AQIBarChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-32 text-navy-400 text-sm">No data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value: any) => [value, 'AQI']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 12 }}
        />
        <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
