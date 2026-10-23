import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  accent?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
}

export function KPICard({
  label, value, unit, subtext, icon, accent = '#0EA5E9', trend, trendLabel, className = ''
}: KPICardProps) {
  return (
    <div className={`card p-4 flex flex-col gap-2 hover:shadow-card-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accent}15`, color: accent }}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-navy-900" style={{ color: accent === '#0EA5E9' ? undefined : accent }}>
          {value}
        </span>
        {unit && <span className="text-sm text-navy-500 font-medium">{unit}</span>}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${
              trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-navy-400'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
              {trendLabel}
            </span>
          )}
          {subtext && <span className="text-xs text-navy-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

interface InsightCardProps {
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'highlight';
  icon?: React.ReactNode;
  date?: string;
}

const TYPE_STYLES = {
  info: {
    bg: 'bg-sky-50 border-sky-100',
    title: 'text-sky-800',
    desc: 'text-sky-700',
    icon: 'bg-sky-100 text-sky-600',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-100',
    title: 'text-amber-800',
    desc: 'text-amber-700',
    icon: 'bg-amber-100 text-amber-600',
  },
  success: {
    bg: 'bg-green-50 border-green-100',
    title: 'text-green-800',
    desc: 'text-green-700',
    icon: 'bg-green-100 text-green-600',
  },
  highlight: {
    bg: 'bg-navy-900 border-navy-800',
    title: 'text-white',
    desc: 'text-navy-300',
    icon: 'bg-navy-700 text-sky-400',
  },
};

export function InsightCard({ title, description, type, icon, date }: InsightCardProps) {
  const styles = TYPE_STYLES[type];
  return (
    <div className={`rounded-xl border p-4 ${styles.bg}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
            {icon}
          </div>
        )}
        <div>
          <div className={`text-sm font-semibold leading-snug ${styles.title}`}>{title}</div>
          <p className={`text-xs mt-1 leading-relaxed ${styles.desc}`}>{description}</p>
          {date && <div className={`text-xs mt-1.5 opacity-70 ${styles.desc}`}>{date}</div>}
        </div>
      </div>
    </div>
  );
}
