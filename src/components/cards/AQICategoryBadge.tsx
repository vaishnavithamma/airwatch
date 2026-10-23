import { AQICategory } from '../../types/data';
import { getCategoryColor } from '../../utils/dataUtils';

interface AQICategoryBadgeProps {
  category: AQICategory;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function AQICategoryBadge({ category, size = 'md' }: AQICategoryBadgeProps) {
  const color = getCategoryColor(category);

  const bgMap: Record<AQICategory, string> = {
    Good: 'bg-green-100 text-green-800 border-green-200',
    Satisfactory: 'bg-lime-100 text-lime-800 border-lime-200',
    Moderate: 'bg-amber-100 text-amber-800 border-amber-200',
    Poor: 'bg-orange-100 text-orange-800 border-orange-200',
    'Very Poor': 'bg-red-100 text-red-800 border-red-200',
    Severe: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${SIZE_CLASSES[size]} ${bgMap[category]}`}
      style={{ '--dot-color': color } as React.CSSProperties}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {category}
    </span>
  );
}
