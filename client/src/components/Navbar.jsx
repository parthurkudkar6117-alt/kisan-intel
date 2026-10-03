import React from 'react';
import { 
  Sprout, 
  Activity, 
  TrendingUp, 
  CalendarDays, 
  MapPin, 
  Settings, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { profile, setIsProfileModalOpen, presets, applyPreset } = useFarm();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers, badge: null },
    { id: 'crop-health', label: 'Crop Health', icon: Activity, badge: 'Vision AI' },
    { id: 'market-advisor', label: 'Market Advisor', icon: TrendingUp, badge: 'Live Mandis' },
    { id: 'daily-planner', label: 'Daily Planner', icon: CalendarDays, badge: 'Open-Meteo' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-subtle">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">KisanIntel</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Agri OS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Agricultural Decision & Market Intelligence</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Farm Profile Quick-Status & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
              title="Click to change farm profile, crop, or location"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left hidden lg:block">
                <span className="font-semibold text-slate-900">{profile.crop}</span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="text-slate-500">{profile.location.name}</span>
              </div>
              <span className="lg:hidden font-medium">{profile.crop}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="Farm & API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
