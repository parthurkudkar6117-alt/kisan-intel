import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Droplets, 
  Wind, 
  Sun, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Search, 
  Sprout, 
  Sparkles, 
  ChevronRight, 
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Thermometer,
  CloudRain,
  CloudSun,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Check
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import PlannerChatbot from './PlannerChatbot';

export default function DailyPlanner() {
  const { profile, updateProfile, setIsProfileModalOpen } = useFarm();

  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Local overrides for instant testing without modal
  const [activeCrop, setActiveCrop] = useState(profile.crop);
  const [activeStage, setActiveStage] = useState(profile.cropStage);
  const [locationInput, setLocationInput] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Fetch / Generate Plan
  const fetchPlan = async (cropParam, stageParam, locParam) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: cropParam || activeCrop,
          cropStage: stageParam || activeStage,
          sowingDate: profile.sowingDate,
          soilType: profile.soilType,
          irrigationType: profile.irrigationType,
          location: locParam || profile.location,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlanData(data);
      }
    } catch (err) {
      console.error("Planner generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setActiveCrop(profile.crop);
    setActiveStage(profile.cropStage);
    fetchPlan(profile.crop, profile.cropStage, profile.location);
  }, [profile]);

  // Debounced location search
  useEffect(() => {
    if (!locationInput || locationInput.trim().length < 2) {
      setLocationResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(locationInput.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLocationResults(data.results || []);
        }
      } catch (e) {
        console.error("Loc search error", e);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [locationInput]);

  const handleSelectLocation = (loc) => {
    const newLoc = {
      name: `${loc.name}${loc.state ? ', ' + loc.state : ''}`,
      lat: loc.lat,
      lng: loc.lng,
      state: loc.state,
      displayName: loc.displayName
    };
    updateProfile({ location: newLoc });
    setLocationInput('');
    setLocationResults([]);
    fetchPlan(activeCrop, activeStage, newLoc);
  };

  const handleStageChange = (newStage) => {
    setActiveStage(newStage);
    updateProfile({ cropStage: newStage });
    fetchPlan(activeCrop, newStage, profile.location);
  };

  const selectedDay = planData?.dayPlans?.[selectedDayIndex] || planData?.dayPlans?.[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-pill bg-amber-50 text-amber-800 border border-amber-200">
              Timeline & Action Oriented
            </span>
            <span className="text-xs text-slate-500">• Weather-Grounded Decision Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Farm Planning & Scheduling</h1>
          <p className="text-xs text-slate-500">
            Day-by-day irrigation budgeting (FAO-56 ET0), spray window safety assessments, and crop stage tasks.
          </p>
        </div>

        {/* Flexible Location Selector */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-subtle text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <input
              type="text"
              placeholder={`Switch location (${profile.location.name})...`}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="text-xs bg-transparent focus:outline-none w-48 sm:w-60 placeholder:text-slate-400"
            />
            {isSearchingLocation && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />}
          </div>

          {locationResults.length > 0 && (
            <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-30 max-h-48 overflow-y-auto">
              {locationResults.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-900 border-b border-slate-100 last:border-0 flex items-center justify-between"
                >
                  <span className="font-semibold">{loc.name}, {loc.state}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{loc.lat.toFixed(1)}°N</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crop Growth Stage Interactive Ribbon */}
      <div className="card-clean p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Active Crop: {activeCrop} • Growth Stage Selector
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Current Crop Coefficient: <strong className="text-slate-800">Kc = {planData?.stageDetails?.kc || 1.15}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {planData?.availableStages?.map((stage) => {
            const isSelected = stage === activeStage;
            return (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>

        {planData?.stageDetails && (
          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <strong>Stage Focus:</strong> {planData.stageDetails.focus}
            {planData.stageDetails.critical && (
              <span className="ml-2 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Critical Moisture Sensitive Phase
              </span>
            )}
          </p>
        )}
      </div>

      {/* Urgent Time-Sensitive Recommendations (e.g. DO NOT SPRAY TOMORROW) */}
      {planData?.urgentAlerts && planData.urgentAlerts.length > 0 && (
        <div className="space-y-3">
          {planData.urgentAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-subtle"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-200 text-rose-900 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight text-rose-900">
                      {alert.headline}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200 text-rose-900">
                      {alert.day}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
                    {alert.message}
                  </p>
                  <p className="text-[11px] text-rose-700 font-mono pt-1">
                    Evidence: {alert.evidence}
                  </p>
                </div>
              </div>

              <div className="shrink-0 bg-white/80 p-3 rounded-2xl border border-rose-200 text-xs">
                <span className="block font-bold text-rose-900 mb-0.5">Required Action:</span>
                <span className="text-rose-800">{alert.action}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7-Day Day-by-Day Timeline Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <span>7-Day Operational Horizon</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {planData?.weatherSource || "Live Open-Meteo API"}
          </span>
        </div>

        {/* 7 Day Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {planData?.dayPlans?.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            const isDangerSpray = day.spraying.alertLevel === 'danger';
            const isSkipIrrigation = day.irrigation.status.includes('SKIP');

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-card'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900">{day.dayName}</span>
                    <span className="text-[11px] text-slate-400">{day.displayDate.split(' ')[0]}</span>
                  </div>
                  <div className="text-sm font-black text-slate-800 mb-1">
                    {day.weather.maxTemp}° / {day.weather.minTemp}°
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>{day.weather.condition}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  {/* Spray badge */}
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                    isDangerSpray ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isDangerSpray ? '🚫 Avoid Spray' : '✓ Safe Spray'}
                  </div>

                  {/* Rain badge if rain > 0 */}
                  {day.weather.rainMm > 0 && (
                    <div className="text-[9px] font-mono font-medium text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      💧 {day.weather.rainMm} mm
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day In-Depth Decision Breakdown */}
      {selectedDay && (
        <div className="card-clean overflow-hidden shadow-card border-slate-200">
          {/* Day Header Banner */}
          <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedDay.dayName} • {selectedDay.displayDate}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Location: {profile.location.name}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {selectedDay.weather.condition} — High {selectedDay.weather.maxTemp}°C / Low {selectedDay.weather.minTemp}°C
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Precipitation</span>
                <span className="font-bold text-white">{selectedDay.weather.rainMm} mm ({selectedDay.weather.rainProb}%)</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">Peak Wind</span>
                <span className="font-bold text-white">{selectedDay.weather.windSpeed} km/h</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">Crop ETc</span>
                <span className="font-bold text-white">{selectedDay.weather.etc} mm/day</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* The Two Core Decisions: Spraying & Irrigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spraying Decision Card */}
              <div className={`p-5 rounded-2xl border ${
                selectedDay.spraying.alertLevel === 'danger'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : selectedDay.spraying.alertLevel === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                    Spraying Decision
                  </span>
                  <span className="text-xs font-bold font-mono">
                    {selectedDay.spraying.alertLevel === 'danger' ? '⛔ Prohibited' : '✓ Safe'}
                  </span>
                </div>

                <h3 className="text-lg font-black tracking-tight mb-2">
                  {selectedDay.spraying.status}
                </h3>

                <p className="text-xs font-bold mb-1">
                  {selectedDay.spraying.action}
                </p>

                <p className="text-xs leading-relaxed opacity-90">
                  {selectedDay.spraying.reason}
                </p>
              </div>

              {/* Irrigation Decision Card */}
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 text-sky-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-sky-900">
                    Irrigation & Water Budget
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-800">
                    ETc: {selectedDay.weather.etc} mm
                  </span>
                </div>

                <h3 className="text-lg font-black tracking-tight mb-2 text-sky-950">
                  {selectedDay.irrigation.status}
                </h3>

                <p className="text-xs leading-relaxed text-sky-900 mb-3">
                  {selectedDay.irrigation.advice}
                </p>

                {selectedDay.irrigation.waterSavingMm > 0 && (
                  <div className="p-2.5 rounded-xl bg-white/80 border border-sky-200 text-xs text-sky-900 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>
                      Natural rainfall conserves ~{Math.round(selectedDay.irrigation.waterSavingMm * 4000)} Litres of irrigation water per acre today.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Agronomic Tasks for this Day */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Scheduled Agricultural Activities ({selectedDay.dayName})</span>
              </h3>

              <div className="space-y-3">
                {selectedDay.tasks?.map((task, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-800">
                          {task.timeWindow}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{task.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {task.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {task.instruction}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Agronomic Justification: </strong>{task.justification}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Advanced AI Farm Advisory Chatbot */}
      <PlannerChatbot crop={activeCrop} cropStage={activeStage} location={profile.location} />
      
    </div>
  );
}
