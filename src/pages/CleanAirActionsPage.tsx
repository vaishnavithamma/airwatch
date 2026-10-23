import { useState } from 'react';
import {
  Leaf, Globe, Building2, User, Award, CheckSquare,
  Sparkles, ArrowRight, ShieldCheck, HeartHandshake,
  BarChart3, TreePine, Car, Factory, Zap
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  category: 'individual' | 'community' | 'policy';
  impact: 'High' | 'Medium' | 'Direct';
  sdg: string[];
  description: string;
  points: number;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-1',
    title: 'Adopt Public Transit & Metro for Commutes',
    category: 'individual',
    impact: 'High',
    sdg: ['SDG 11', 'SDG 13'],
    description: 'Utilize Hyderabad Metro Rail or TSRTC electric buses along corridors like Begumpet-Somajiguda to cut vehicular PM2.5 tailpipe emissions.',
    points: 25,
  },
  {
    id: 'act-2',
    title: 'Zero Waste Burning & Strict Segregation',
    category: 'individual',
    impact: 'High',
    sdg: ['SDG 3', 'SDG 12'],
    description: 'Ensure household garden clippings and dry waste are sent to GHMC bio-composting instead of open leaf burning which spikes PM10.',
    points: 20,
  },
  {
    id: 'act-3',
    title: 'Deploy High-Efficiency HEPA Filtration',
    category: 'individual',
    impact: 'Direct',
    sdg: ['SDG 3'],
    description: 'Use true HEPA filters indoors during elevated morning inversions to reduce sensitive group exposure by up to 90%.',
    points: 15,
  },
  {
    id: 'act-4',
    title: 'Campus & Neighborhood Miyawaki Forests',
    category: 'community',
    impact: 'High',
    sdg: ['SDG 11', 'SDG 15'],
    description: 'Plant indigenous dense micro-forests along arterial boundaries to act as particulate sinks and thermal buffers.',
    points: 30,
  },
  {
    id: 'act-5',
    title: 'Construction Dust Suppression Protocols',
    category: 'community',
    impact: 'High',
    sdg: ['SDG 11'],
    description: 'Mandate anti-smog mist sprayers, wind barriers, and paved transit paths on civil engineering and development sites.',
    points: 25,
  },
  {
    id: 'act-6',
    title: 'Neighborhood Low-Cost Sensor Networks',
    category: 'community',
    impact: 'Medium',
    sdg: ['SDG 9', 'SDG 11'],
    description: 'Install open hyper-local IoT air quality monitors to validate regional dispersion patterns against the TSPCB Somajiguda station.',
    points: 20,
  },
  {
    id: 'act-7',
    title: 'NCAP Non-Attainment City Action Plan',
    category: 'policy',
    impact: 'High',
    sdg: ['SDG 11', 'SDG 13'],
    description: 'Implement Hyderabad City Clean Air Action Plan under National Clean Air Programme (NCAP) targeting 40% PM reduction.',
    points: 35,
  },
  {
    id: 'act-8',
    title: 'Strict Industrial Emission Continuous Monitoring (CEMS)',
    category: 'policy',
    impact: 'High',
    sdg: ['SDG 9', 'SDG 12'],
    description: 'TSPCB enforcement of 24x7 automated stack monitoring across industrial belts including Jeedimetla and Pashamylaram.',
    points: 30,
  },
  {
    id: 'act-9',
    title: 'Aggressive Electrification of Municipal Fleets',
    category: 'policy',
    impact: 'High',
    sdg: ['SDG 7', 'SDG 11'],
    description: 'Transition GHMC sanitation loaders, patrol bikes, and TSRTC intra-city buses entirely to zero-emission battery electric platforms.',
    points: 30,
  },
];

export function CleanAirActionsPage() {
  const [selectedActions, setSelectedActions] = useState<Set<string>>(
    new Set(['act-1', 'act-2', 'act-4'])
  );
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'community' | 'policy'>('all');

  const toggleAction = (id: string) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalScore = ACTION_ITEMS
    .filter(a => selectedActions.has(a.id))
    .reduce((acc, curr) => acc + curr.points, 0);

  const maxScore = ACTION_ITEMS.reduce((acc, curr) => acc + curr.points, 0);
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  const filteredItems = ACTION_ITEMS.filter(
    item => activeTab === 'all' || item.category === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Leaf size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900 dark:text-white">Clean Air Action Framework</h1>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              Evidence-based mitigation strategies, civic commitments & UN Sustainable Development Goals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles size={14} className="text-emerald-500" />
            Commitment Score: {totalScore} / {maxScore} pts
          </div>
        </div>
      </div>

      {/* SDG Alignment Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-emerald-500 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy-900 dark:text-white">SDG 3: Good Health & Well-being</h3>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-0.5">
              Target 3.9: Substantially reduce illnesses and deaths from hazardous airborne chemicals and particulates.
            </p>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
            11
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy-900 dark:text-white">SDG 11: Sustainable Cities</h3>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-0.5">
              Target 11.6: Reduce the adverse per capita environmental impact of cities, focusing on ambient urban air quality.
            </p>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-sky-500 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
            13
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy-900 dark:text-white">SDG 13: Climate Action</h3>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-0.5">
              Integrating air pollution abatement measures into state policies and urban infrastructure development.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Action Tracker & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-navy-900 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400'
              }`}
            >
              All Actions ({ACTION_ITEMS.length})
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'individual'
                  ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400'
              }`}
            >
              <User size={13} />
              Individual
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'community'
                  ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400'
              }`}
            >
              <Building2 size={13} />
              Community
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'policy'
                  ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-400'
              }`}
            >
              <Globe size={13} />
              Policy
            </button>
          </div>

          {/* Action List Items */}
          <div className="space-y-3">
            {filteredItems.map(item => {
              const isSelected = selectedActions.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleAction(item.id)}
                  className={`card p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
                      : 'hover:border-slate-300 dark:hover:border-navy-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div
                      className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-navy-600"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-navy-900 dark:text-white">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {item.sdg.map(s => (
                            <span
                              key={s}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
                            >
                              {s}
                            </span>
                          ))}
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            +{item.points} pts
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-navy-600 dark:text-navy-400 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-navy-400">
                        <span className="capitalize font-medium text-navy-500 dark:text-navy-400">
                          Domain: {item.category}
                        </span>
                        <span>•</span>
                        <span className="text-navy-500 dark:text-navy-400">
                          Abatement Impact: <strong>{item.impact}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Impact Summary Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">
                Clean Air Pledge Calculator
              </h3>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-navy-700 dark:text-navy-300 mb-1">
                <span>Engagement Index</span>
                <span>{scorePercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500 rounded-full"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-navy-800/60 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-navy-500 dark:text-navy-400">Active Commitments:</span>
                <span className="font-bold text-navy-800 dark:text-navy-200">
                  {selectedActions.size} of {ACTION_ITEMS.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500 dark:text-navy-400">Estimated PM Reduction Potential:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(scorePercent * 0.35)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500 dark:text-navy-400">Pledge Tier:</span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {scorePercent > 70 ? 'Gold Ambassador' : scorePercent > 40 ? 'Silver Advocate' : 'Bronze Champion'}
                </span>
              </div>
            </div>

            <div className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed border-t border-slate-200 dark:border-navy-700 pt-3">
              Every committed practice reduces local particulate resuspension, improves community air sheds, and directly contributes to national environmental standards.
            </div>
          </div>

          {/* Hyderabad Local Context Box */}
          <div className="card p-5 bg-gradient-to-br from-slate-50 to-sky-50 dark:from-navy-900 dark:to-navy-800 border-sky-100 dark:border-navy-700 space-y-3">
            <h4 className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
              <TreePine size={15} className="text-emerald-500" />
              Telangana State Initiatives
            </h4>
            <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed">
              Hyderabad is part of the 131 non-attainment cities in India under NCAP. Flagship initiatives include <strong>Telangana Ku Haritha Haram</strong> (extensive green canopy enhancement) and rapid phase-in of electric feeder fleets by TSRTC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
