import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, FlaskConical, HeartPulse,
  Map, Bell, Leaf, BookOpen, Menu, X, Sun, Moon,
  Wind, Clock, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { STATION_INFO, DATASET_META } from '../../data/historicalData';

interface NavItemDef {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { path: '/overview', label: 'Overview', icon: <LayoutDashboard size={18} />, description: 'Dashboard summary' },
  { path: '/explorer', label: 'AQI Explorer', icon: <TrendingUp size={18} />, description: 'Interactive analysis' },
  { path: '/pollutants', label: 'Pollutant Analysis', icon: <FlaskConical size={18} />, description: 'PM2.5 & PM10 deep-dive' },
  { path: '/health', label: 'Health & Safety', icon: <HeartPulse size={18} />, description: 'Public health guidance' },
  { path: '/map', label: 'City Map', icon: <Map size={18} />, description: 'Station geolocation' },
  { path: '/alerts', label: 'Alerts Centre', icon: <Bell size={18} />, description: 'Threshold monitoring' },
  { path: '/actions', label: 'Clean Air Actions', icon: <Leaf size={18} />, description: 'Sustainability & SDGs' },
  { path: '/methodology', label: 'Methodology & Data', icon: <BookOpen size={18} />, description: 'Transparency & downloads' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const currentNav = NAV_ITEMS.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-navy-900
          border-r border-slate-200 dark:border-navy-700 transform transition-transform duration-300 ease-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-navy-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-navy-900 dark:bg-sky-500/20 flex items-center justify-center">
                <Wind size={16} className="text-sky-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-aqi-satisfactory border-2 border-white dark:border-navy-900" />
            </div>
            <div>
              <div className="text-sm font-bold text-navy-900 dark:text-white leading-none">AirWatch</div>
              <div className="text-xs text-navy-500 dark:text-navy-400 leading-none mt-0.5">Hyderabad</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-navy-500"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Station info */}
        <div className="px-4 py-3 mx-3 mt-3 bg-sky-50 dark:bg-navy-800 rounded-lg border border-sky-100 dark:border-navy-700">
          <div className="text-xs font-medium text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse-soft" />
            Monitoring Station
          </div>
          <div className="text-xs font-semibold text-navy-800 dark:text-white mt-0.5">{STATION_INFO.name}</div>
          <div className="text-xs text-navy-500 dark:text-navy-400">{STATION_INFO.city}, {STATION_INFO.state}</div>
        </div>

        {/* Historical badge */}
        <div className="px-4 py-2 mx-3 mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Historical Data</span>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">16–29 Sep 2026</div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
                    : 'text-navy-600 dark:text-navy-400 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white'
                }`
              }
              aria-current={location.pathname.startsWith(item.path) ? 'page' : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200 dark:border-navy-700">
          <div className="text-xs text-navy-400 dark:text-navy-500 text-center">
            <div className="font-medium text-navy-500 dark:text-navy-400">BCV755B — Conservation of Natural Resources</div>
            <div className="mt-0.5">Sir MVIT, Bengaluru · 2026</div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-navy-500"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-navy-900 dark:text-white">
                {currentNav?.label ?? 'AirWatch Hyderabad'}
              </h1>
              {currentNav?.description && (
                <p className="text-xs text-navy-500 dark:text-navy-400 hidden sm:block">{currentNav.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Data source */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full">
              <Clock size={12} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Historical · 16–29 Sep 2026</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-navy-500 dark:text-navy-400 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-slate-50 dark:bg-navy-950"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
