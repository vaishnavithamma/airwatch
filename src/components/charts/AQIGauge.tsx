import React from 'react';
import { AQICategory } from '../../types/data';
import { getCategoryColor } from '../../utils/dataUtils';

interface AQIGaugeProps {
  aqi: number;
  category: AQICategory;
  size?: number;
  showLabel?: boolean;
}

export function AQIGauge({ aqi, category, size = 200, showLabel = true }: AQIGaugeProps) {
  const color = getCategoryColor(category);

  // Gauge: 0-500 AQI mapped to 0-180 degrees (half circle)
  const maxAqi = 500;
  const clampedAqi = Math.min(Math.max(aqi, 0), maxAqi);
  const angle = (clampedAqi / maxAqi) * 180;
  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.55;

  // SVG arc path helper
  function polarToCartesian(centerX: number, centerY: number, r: number, deg: number) {
    const rad = ((deg - 180) * Math.PI) / 180;
    return { x: centerX + r * Math.cos(rad), y: centerY + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  // Background arc segments for each AQI band
  const segments = [
    { color: '#22C55E', start: 0, end: 18 },    // Good 0-50
    { color: '#84CC16', start: 18, end: 36 },   // Satisfactory 51-100
    { color: '#F59E0B', start: 36, end: 72 },   // Moderate 101-200
    { color: '#F97316', start: 72, end: 108 },  // Poor 201-300
    { color: '#EF4444', start: 108, end: 144 }, // Very Poor 301-400
    { color: '#7C3AED', start: 144, end: 180 }, // Severe 401-500
  ];

  const strokeWidth = size * 0.075;
  const needleLength = radius * 0.85;
  const needleAngle = angle - 90; // Rotate: 0 deg = left, 180 deg = right
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleTip = {
    x: cx + needleLength * Math.cos(needleRad),
    y: cy + needleLength * Math.sin(needleRad),
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size * 0.62}
        viewBox={`0 0 ${size} ${size * 0.62}`}
        role="img"
        aria-label={`AQI gauge showing ${aqi} — ${category}`}
      >
        {/* Background track */}
        <path
          d={describeArc(cx, cy, radius, 0, 180)}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(cx, cy, radius, seg.start, seg.end)}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            opacity={0.25}
          />
        ))}

        {/* Active fill arc */}
        <path
          d={describeArc(cx, cy, radius, 0, Math.max(0, angle))}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={color}
          strokeWidth={size * 0.018}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={size * 0.032} fill={color} />
        <circle cx={cx} cy={cy} r={size * 0.016} fill="white" />

        {/* AQI value text */}
        {showLabel && (
          <>
            <text
              x={cx}
              y={cy - size * 0.12}
              textAnchor="middle"
              fontSize={size * 0.15}
              fontWeight="700"
              fontFamily="Inter, sans-serif"
              fill={color}
            >
              {aqi}
            </text>
            <text
              x={cx}
              y={cy + size * 0.04}
              textAnchor="middle"
              fontSize={size * 0.065}
              fontWeight="500"
              fontFamily="Inter, sans-serif"
              fill="#64748B"
            >
              {category}
            </text>
          </>
        )}

        {/* Scale labels */}
        <text x={cx - radius - strokeWidth / 2} y={cy + 14} textAnchor="middle" fontSize={size * 0.048} fill="#94A3B8" fontFamily="Inter, sans-serif">0</text>
        <text x={cx + radius + strokeWidth / 2} y={cy + 14} textAnchor="middle" fontSize={size * 0.048} fill="#94A3B8" fontFamily="Inter, sans-serif">500</text>
      </svg>
    </div>
  );
}
