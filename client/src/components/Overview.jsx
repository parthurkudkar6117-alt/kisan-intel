import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Activity, 
  TrendingUp, 
  CalendarDays, 
  MapPin, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Droplets, 
  Wind, 
  Sun, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Overview({ setActiveTab }) {
  const { profile, setIsProfileModalOpen, presets, applyPreset } = useFarm();
  const [weatherGlance, setWeatherGlance] = useState(null);
  const [urgentAlert, setUrgentAlert] = useState(null);
  const [marketBrief, setMarketBrief] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOverviewData() {
      setIsLoading(true);
      try {
        // Fetch weather for active location
        const weatherRes = await fetch(`/api/weather/forecast?lat=${profile.location.lat}&lng=${profile.location.lng}`);
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          setWeatherGlance(wData);

          // Check if tomorrow has rain > 2mm or wind > 15
          const tomorrow = wData.daily?.[1];
          if (tomorrow && (tomorrow.precipitationSumMm >= 2 || tomorrow.maxWindSpeedKmH >= 16)) {
            setUrgentAlert({
              headline: tomorrow.precipitationSumMm >= 2 ? "DO NOT SPRAY TOMORROW" : "HIGH WIND DRIFT ALERT",
              reason: tomorrow.precipitationSumMm >= 2
                ? `Forecast indicates ${tomorrow.precipitationSumMm}mm rain. Foliar sprays will suffer chemical wash-off and economic loss.`
                : `Wind gusts up to ${tomorrow.maxWindSpeedKmH} km/h will cause severe droplet drift onto adjacent plots.`,
              severity: "danger"
            });
          } else {
            setUrgentAlert(null);
          }
        }

        // Fetch quick market comparison for current crop
        const mRes = await fetch('/api/market/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodity: profile.crop,
            quantity: 35,
            farmerLat: profile.location.lat,
            farmerLng: profile.location.lng,
            farmerLocation: profile.location.name,
            vehicleType: 'bolero'
          })
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          setMarketBrief(mData);
        }
      } catch (err) {
        console.error("Error loading overview data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOverviewData();
  }, [profile]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Farm Overview Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        {/* Subtle background graphic */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Agricultural Intelligence Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.crop} Farm — {profile.location.name}
            </h1>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              Growth Stage: <span className="font-semibold text-white">{profile.cropStage}</span> • {profile.acreage} Acres • {profile.soilType} Soil • {profile.irrigationType} Irrigation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Edit Farm Profile</span>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
        </div>

        {/* Preset quick pills */}
        <div className="mt-6 pt-5 border-t border-emerald-700/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-emerald-300 font-medium">Quick Farm Switcher:</span>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                profile.crop === p.crop && profile.location.name.includes(p.location.state)
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-emerald-950/40 text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              {p.crop} ({p.location.name.split(',')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Urgent Weather Alert (If Applicable) */}
      {urgentAlert && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-subtle animate-pulse">
          <div className="p-2.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-950">{urgentAlert.headline}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                Action Required
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">{urgentAlert.reason}</p>
          </div>
        </div>
      )}

      {/* Weather Glance Bar */}
      {weatherGlance && weatherGlance.current && (
        <div className="card-clean p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Sun className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900">{weatherGlance.current.temp}°C</span>
                <span className="text-xs font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
                  {weatherGlance.current.condition}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.location.name}
              </p>
            </div>
          </div>

          {/* Key metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-500 text-[11px]">Wind Speed</p>
                <p className="font-bold text-slate-800">{weatherGlance.current.windSpeed} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-500" />
              <div>
                <p className="text-slate-500 text-[11px]">Rain (Tomorrow)</p>
                <p className="font-bold text-slate-800">
                  {weatherGlance.daily?.[1]?.precipitationSumMm || 0} mm ({weatherGlance.daily?.[1]?.precipitationProbMax || 0}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-slate-500 text-[11px]">Evapotranspiration (ET0)</p>
                <p className="font-bold text-slate-800">{weatherGlance.daily?.[0]?.et0Mm || 4.5} mm/day</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('daily-planner')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>Full 7-Day Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3 Core Section Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Crop Health */}
        <div className="card-interactive p-6 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <span className="badge-pill bg-emerald-50 text-emerald-800 border border-emerald-200">
                Diagnostic AI
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
              Crop Health & Pathology
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Upload or snap a photo of any diseased leaf. Our vision intelligence checks image validity, diagnoses conditions, and provides verified ICAR treatments.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 mb-4">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Reliability Guard:</span>
                <span className="font-bold text-emerald-700">Strict "UNSURE" gating</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Active Crop Profile:</span>
                <span className="font-bold text-slate-800">{profile.crop}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('crop-health')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-subtle"
          >
            <span>Diagnose Leaf Disease</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Market Advisor */}
        <div className="card-interactive p-6 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="badge-pill bg-blue-50 text-blue-800 border border-blue-200">
                Financial Support
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
              Market Advisor & Mandis
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Deterministic logistics math comparing APMC terminal mandis. Calculate transport, mandi cess, and expected net returns with live sensitivity sliders.
            </p>
            {marketBrief && marketBrief.bestMarket ? (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Top Market:</span>
                  <span className="font-bold text-blue-900">{marketBrief.bestMarket.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Modal Price:</span>
                  <span className="font-bold text-slate-900">₹{marketBrief.bestMarket.priceData.modalPrice}/qtl</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Expected Net (35 qtl):</span>
                  <span className="font-extrabold text-emerald-700">
                    ₹{marketBrief.bestMarket.economics.expectedNetReturn.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 mb-4">
                Loading real APMC mandi economics...
              </div>
            )}
          </div>
          <button
            onClick={() => setActiveTab('market-advisor')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-subtle"
          >
            <span>Compare Mandi Returns</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Daily Planner */}
        <div className="card-interactive p-6 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="badge-pill bg-amber-50 text-amber-800 border border-amber-200">
                Action Timeline
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-amber-700 transition-colors">
              Daily Farm Planner
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Weather-grounded day-by-day operations. Evaluates rain washout and wind drift to warn when to spray and when to skip irrigation.
            </p>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Stage:</span>
                <span className="font-bold text-slate-900">{profile.cropStage.split('/')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Weather Engine:</span>
                <span className="font-semibold text-emerald-800">Open-Meteo High Res</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Spraying Status:</span>
                <span className={`font-bold ${urgentAlert ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {urgentAlert ? 'Prohibited (Risk)' : 'Optimal Window'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('daily-planner')}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-subtle"
          >
            <span>View 7-Day Farm Plan</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grounded Agricultural Data Standard */}
      <div className="p-5 rounded-2xl bg-slate-100/70 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Deterministic Agronomic Intelligence:</strong> Grounded in ICAR/KVK Package of Practices, Open-Meteo live meteorology, and verified AGMARKNET wholesale market data.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-semibold text-slate-500">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>No LLM Guesswork for Math or Prices</span>
        </div>
      </div>
    </div>
  );
}
