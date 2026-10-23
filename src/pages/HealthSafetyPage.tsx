import { useState } from 'react';
import { HeartPulse, Users, Activity, AlertTriangle, Info, Shield, Wind } from 'lucide-react';
import { AQICategory } from '../types/data';
import { AQICategoryBadge } from '../components/cards/AQICategoryBadge';

interface HealthGuidance {
  category: AQICategory;
  range: string;
  color: string;
  bg: string;
  summary: string;
  generalGuidance: string[];
  sensitiveGroups: string;
  outdoorActivity: string;
  icon: string;
}

const HEALTH_DATA: HealthGuidance[] = [
  {
    category: 'Good',
    range: '0–50',
    color: '#22C55E',
    bg: '#F0FDF4',
    summary: 'Air quality is satisfactory and poses little or no risk.',
    generalGuidance: [
      'Ideal conditions for all outdoor activities.',
      'No special precautions required.',
      'A good time to open windows and ventilate indoor spaces.',
    ],
    sensitiveGroups: 'No specific concerns for sensitive groups at this AQI level.',
    outdoorActivity: 'Unrestricted. All outdoor activities are appropriate.',
    icon: '🌿',
  },
  {
    category: 'Satisfactory',
    range: '51–100',
    color: '#84CC16',
    bg: '#F7FEE7',
    summary: 'Air quality is acceptable. A very small number of unusually sensitive individuals may experience minor symptoms.',
    generalGuidance: [
      'Most people can continue with normal outdoor activities.',
      'If you notice unusual respiratory discomfort, consider reducing prolonged exertion outdoors.',
      'Children and older adults may wish to take brief rest breaks during sustained physical activity.',
    ],
    sensitiveGroups: 'People with existing heart or respiratory conditions should monitor their symptoms. If symptoms worsen during outdoor activity, consider reducing intensity or duration.',
    outdoorActivity: 'Generally suitable for all. Unusually sensitive individuals may wish to limit very prolonged or intense exertion.',
    icon: '🌤',
  },
  {
    category: 'Moderate',
    range: '101–200',
    color: '#F59E0B',
    bg: '#FFFBEB',
    summary: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
    generalGuidance: [
      'Reduce prolonged or heavy outdoor exertion if you experience respiratory symptoms.',
      'Take more frequent rest breaks during outdoor activities.',
      'Consider moving strenuous activities indoors if possible.',
    ],
    sensitiveGroups: 'Children, older adults, and people with respiratory or heart conditions should limit prolonged outdoor exertion and monitor symptoms closely. Consider remaining indoors if symptoms develop.',
    outdoorActivity: 'Reduce prolonged or intense outdoor exertion, especially for sensitive individuals.',
    icon: '⚠️',
  },
  {
    category: 'Poor',
    range: '201–300',
    color: '#F97316',
    bg: '#FFF7ED',
    summary: 'Health effects may be experienced by everyone. Sensitive individuals may experience more serious effects.',
    generalGuidance: [
      'Avoid prolonged outdoor exertion.',
      'Keep indoor spaces well-ventilated with filtered air if available.',
      'Check and follow official local health advisories.',
    ],
    sensitiveGroups: 'Children, older adults, pregnant women, and people with pre-existing heart or respiratory conditions should stay indoors and avoid outdoor physical activity. Follow official guidance.',
    outdoorActivity: 'Avoid prolonged or intense outdoor activity. Sensitive groups should remain indoors.',
    icon: '🚫',
  },
  {
    category: 'Very Poor',
    range: '301–400',
    color: '#EF4444',
    bg: '#FEF2F2',
    summary: 'Health alert: everyone may experience serious health effects.',
    generalGuidance: [
      'Avoid all unnecessary outdoor activity.',
      'Keep windows and doors closed.',
      'Follow official public health guidance and advisories.',
      'Wear a well-fitted mask rated for fine particles if outdoor exposure is unavoidable.',
    ],
    sensitiveGroups: 'Sensitive groups should remain indoors and avoid all physical exertion. Seek medical attention promptly if respiratory or cardiovascular symptoms develop.',
    outdoorActivity: 'Avoid all outdoor activity.',
    icon: '🔴',
  },
  {
    category: 'Severe',
    range: '401–500',
    color: '#7C3AED',
    bg: '#F5F3FF',
    summary: 'Health emergency. The entire population is more likely to be affected.',
    generalGuidance: [
      'Stay indoors with all windows and doors closed.',
      'Follow all official emergency health directives immediately.',
      'Wear appropriate respiratory protection if outdoor exposure cannot be avoided.',
      'Contact health services if respiratory distress develops.',
    ],
    sensitiveGroups: 'All sensitive groups should seek shelter indoors immediately. Avoid all physical activity and seek medical care as needed.',
    outdoorActivity: 'No outdoor activity.',
    icon: '🚨',
  },
];

export function HealthSafetyPage() {
  const [selected, setSelected] = useState<AQICategory>('Satisfactory');
  const [aqiSlider, setAqiSlider] = useState(62);

  const guidance = HEALTH_DATA.find(h => h.category === selected)!;

  function sliderToCategory(val: number): AQICategory {
    if (val <= 50) return 'Good';
    if (val <= 100) return 'Satisfactory';
    if (val <= 200) return 'Moderate';
    if (val <= 300) return 'Poor';
    if (val <= 400) return 'Very Poor';
    return 'Severe';
  }

  function handleSlider(val: number) {
    setAqiSlider(val);
    setSelected(sliderToCategory(val));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Health & Safety Guide</h1>
        <p className="text-sm text-navy-500 mt-1">
          Public health guidance based on CPCB National AQI categories. Educational information only.
        </p>
      </div>

      {/* Study period context */}
      <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-lime-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-lime-800 mb-1">Study Period Air Quality (16–29 Sep 2026)</p>
          <p className="text-xs text-lime-700 leading-relaxed">
            During the 14-day observation period, Somajiguda experienced <strong>Satisfactory</strong> air quality on 10 days
            and <strong>Good</strong> air quality on 4 days. The mean AQI was 62.3 (Satisfactory).
            No Moderate, Poor, Very Poor, or Severe days were recorded.
            The guidance below applies to each AQI category generally — not solely to the study period.
          </p>
        </div>
      </div>

      {/* Category selector */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Select AQI Category or Drag Slider</h2>

        {/* AQI slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-navy-600" htmlFor="aqi-slider">AQI Value</label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-navy-900">{aqiSlider}</span>
              <AQICategoryBadge category={sliderToCategory(aqiSlider)} />
            </div>
          </div>
          <div className="relative">
            <input
              id="aqi-slider"
              type="range"
              min={0}
              max={500}
              value={aqiSlider}
              onChange={e => handleSlider(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  #22C55E 0%, #22C55E 10%,
                  #84CC16 10%, #84CC16 20%,
                  #F59E0B 20%, #F59E0B 40%,
                  #F97316 40%, #F97316 60%,
                  #EF4444 60%, #EF4444 80%,
                  #7C3AED 80%, #7C3AED 100%)`,
              }}
              aria-valuemin={0}
              aria-valuemax={500}
              aria-valuenow={aqiSlider}
              aria-label={`AQI slider: ${aqiSlider}`}
            />
          </div>
          <div className="flex justify-between text-xs text-navy-400 mt-1">
            <span>0 (Good)</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
            <span>500 (Severe)</span>
          </div>
        </div>

        {/* Category buttons */}
        <div className="flex flex-wrap gap-2">
          {HEALTH_DATA.map(h => (
            <button
              key={h.category}
              onClick={() => { setSelected(h.category); setAqiSlider(h.range.includes('–') ? parseInt(h.range.split('–')[0]) + Math.floor((parseInt(h.range.split('–')[1] || '500') - parseInt(h.range.split('–')[0])) / 2) : 450); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selected === h.category
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-navy-600 border-slate-200 hover:border-slate-300'
              }`}
              style={selected === h.category ? { backgroundColor: h.color, borderColor: h.color } : {}}
              aria-pressed={selected === h.category}
            >
              {h.category}
            </button>
          ))}
        </div>
      </div>

      {/* Guidance panel */}
      <div
        className="card p-5 border-l-4 transition-all duration-300"
        style={{ borderLeftColor: guidance.color, backgroundColor: guidance.bg }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0 font-bold"
            style={{ backgroundColor: guidance.color }}
          >
            <span className="text-xl">{guidance.range.split('–')[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AQICategoryBadge category={guidance.category} size="lg" />
              <span className="text-xs text-navy-500">AQI {guidance.range}</span>
            </div>
            <p className="text-sm font-medium text-navy-800 mb-4">{guidance.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Activity size={12} /> General Precautions
                </h3>
                <ul className="space-y-1.5">
                  {guidance.generalGuidance.map((g, i) => (
                    <li key={i} className="flex gap-2 text-xs text-navy-700">
                      <span className="text-navy-400 mt-0.5">•</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Users size={12} /> Sensitive Groups
                </h3>
                <p className="text-xs text-navy-700 leading-relaxed">{guidance.sensitiveGroups}</p>

                <h3 className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-2 mt-3 flex items-center gap-1">
                  <Wind size={12} /> Outdoor Activity
                </h3>
                <p className="text-xs text-navy-700 leading-relaxed">{guidance.outdoorActivity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full category reference table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-navy-800">CPCB National AQI Categories — Complete Reference</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="AQI categories reference">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2 font-semibold text-navy-500 uppercase tracking-wide">Category</th>
                <th className="text-center px-4 py-2 font-semibold text-navy-500 uppercase tracking-wide">AQI Range</th>
                <th className="text-left px-4 py-2 font-semibold text-navy-500 uppercase tracking-wide">Health Implication</th>
                <th className="text-center px-4 py-2 font-semibold text-navy-500 uppercase tracking-wide">Study Days</th>
              </tr>
            </thead>
            <tbody>
              {HEALTH_DATA.map(h => {
                const studyDays = h.category === 'Good' ? 4 : h.category === 'Satisfactory' ? 10 : 0;
                return (
                  <tr key={h.category} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                        <span className="font-semibold text-navy-800">{h.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-navy-700">{h.range}</td>
                    <td className="px-4 py-3 text-navy-600">{h.summary}</td>
                    <td className="px-4 py-3 text-center">
                      {studyDays > 0 ? (
                        <span className="font-bold text-navy-800">{studyDays}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitive groups callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Users size={18} />, title: 'Children', desc: 'Higher respiratory rates increase exposure. Avoid prolonged outdoor play during elevated AQI periods.', color: 'sky' },
          { icon: <HeartPulse size={18} />, title: 'Heart & Lung Conditions', desc: 'Pre-existing conditions can be aggravated by elevated particulate matter. Monitor symptoms and follow medical advice.', color: 'red' },
          { icon: <Shield size={18} />, title: 'Older Adults', desc: 'Reduced physiological reserve may increase sensitivity. Consider limiting outdoor exertion at higher AQI levels.', color: 'amber' },
        ].map(sg => (
          <div key={sg.title} className={`card p-4 border-t-2 border-${sg.color}-400`}>
            <div className={`w-8 h-8 rounded-lg bg-${sg.color}-100 text-${sg.color}-600 flex items-center justify-center mb-3`}>
              {sg.icon}
            </div>
            <h3 className="text-sm font-semibold text-navy-800 mb-1">{sg.title}</h3>
            <p className="text-xs text-navy-600 leading-relaxed">{sg.desc}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertTriangle size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Educational Disclaimer:</strong> The guidance on this page is informational and based on general CPCB AQI category descriptions.
            It does not constitute medical advice and does not replace guidance from qualified healthcare professionals or official public health authorities.
            Do not start, stop, or change medication or treatment based on this information.
            AQI categories and health impacts are generalised — individual sensitivity varies widely.
            Always follow official public health advisories from relevant state and central authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
