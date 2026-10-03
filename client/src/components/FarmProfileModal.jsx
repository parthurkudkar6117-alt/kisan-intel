import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Sprout, 
  Calendar, 
  Droplets, 
  Check, 
  Key, 
  Layers, 
  Search, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function FarmProfileModal() {
  const { 
    profile, 
    updateProfile, 
    presets, 
    applyPreset, 
    geminiApiKey, 
    setGeminiApiKey, 
    isProfileModalOpen, 
    setIsProfileModalOpen 
  } = useFarm();

  const [formData, setFormData] = useState({ ...profile });
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'presets' or 'api'
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...profile });
    setApiKeyInput(geminiApiKey || '');
  }, [profile, geminiApiKey, isProfileModalOpen]);

  // Search locations debounced
  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 2) {
      setLocationResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(locationQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLocationResults(data.results || []);
        }
      } catch (err) {
        console.error("Location search error", err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [locationQuery]);

  if (!isProfileModalOpen) return null;

  const handleSave = (e) => {
    e?.preventDefault();
    updateProfile(formData);
    setGeminiApiKey(apiKeyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 600);
  };

  const handleSelectLocation = (loc) => {
    setFormData(prev => ({
      ...prev,
      location: {
        name: `${loc.name}${loc.state ? ', ' + loc.state : ''}`,
        lat: loc.lat,
        lng: loc.lng,
        state: loc.state,
        displayName: loc.displayName
      }
    }));
    setLocationQuery('');
    setLocationResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Farm Profile & Configuration</h2>
              <p className="text-xs text-slate-500">Shared parameters across Crop Health, Markets & Planner</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Farm Settings
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1-Click Agricultural Presets
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'api'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Vision AI Key (Optional)
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Instantly switch the entire application environment to a verified agricultural region and commodity:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => {
                  const isCurrent = profile.crop === preset.crop && profile.location.name.includes(preset.location.state);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        applyPreset(preset.id);
                        setFormData({ ...preset });
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 800);
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{preset.crop}</span>
                        {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{preset.title}</p>
                      <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-1.5">
                        <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                          📍 {preset.location.name}
                        </span>
                        <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                          🌱 {preset.cropStage}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Main Crop</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {["Tomato", "Wheat", "Cotton", "Paddy / Rice", "Potato", "Soybean", "Maize", "Mustard", "Onion", "Chilli"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Variety */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Variety / Hybrid</label>
                  <input
                    type="text"
                    value={formData.variety || ''}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g. Abhinav F1, HD-3226"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Crop Stage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Growth Stage</label>
                  <select
                    value={formData.cropStage}
                    onChange={(e) => setFormData({ ...formData, cropStage: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sowing & Germination">Sowing & Germination / Emergence</option>
                    <option value="Crown Root Initiation (CRI)">Crown Root Initiation (CRI) / Early Rooting</option>
                    <option value="Vegetative / Tillering">Vegetative Growth / Tillering / Branching</option>
                    <option value="Flowering & Fruit Set">Flowering & Fruit Set / Squaring / Booting</option>
                    <option value="Fruit Enlargement / Color Turning">Fruit / Grain Enlargement / Bulking</option>
                    <option value="Maturity & Ripening">Maturity, Ripening & Harvest Preparation</option>
                  </select>
                </div>

                {/* Sowing Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sowing Date</label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Soil Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Classification</label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Loam">Medium Loam (Balanced retention)</option>
                    <option value="Clay / Black Cotton">Clay / Black Cotton Soil (High moisture retention)</option>
                    <option value="Sandy Loam">Sandy Loam (Rapid drainage, requires frequent water)</option>
                  </select>
                </div>

                {/* Irrigation System */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Irrigation Method</label>
                  <select
                    value={formData.irrigationType}
                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Drip">Drip Irrigation (Micro-irrigation, 90% efficiency)</option>
                    <option value="Sprinkler">Sprinkler System (75% efficiency)</option>
                    <option value="Flood/Furrow">Surface Furrow / Flood (Traditional)</option>
                    <option value="Rainfed">Rainfed (Dependent on monsoon precipitation)</option>
                  </select>
                </div>
              </div>

              {/* Flexible Location Search */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Farm Location (Any Indian/Global Village, City or District)
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Type city or village name (e.g. Karnal, Baramati, Khanna, Kolar)..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="w-full text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                    />
                    {isSearchingLocation && (
                      <span className="text-[10px] text-slate-400 animate-spin">⏳</span>
                    )}
                  </div>

                  {/* Location suggestions dropdown */}
                  {locationResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-30 max-h-48 overflow-y-auto">
                      {locationResults.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-900 dark:hover:text-white border-b border-slate-100 dark:border-slate-700/60 last:border-0 flex items-center justify-between text-slate-800 dark:text-slate-200"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{loc.name}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-1.5">{loc.state}, {loc.country}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">Active: {formData.location.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                    GPS: {formData.location.lat.toFixed(3)}°N, {formData.location.lng.toFixed(3)}°E
                  </span>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Google Gemini Vision AI Integration</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  KisanIntel has a built-in expert Plant Pathology rules engine that diagnoses 60+ crop conditions completely offline.
                  If you have a Google Gemini API Key, enter it below to enable live multimodal vision reasoning for uploaded leaf images.
                </p>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Your key is stored only in your local browser session and transmitted securely to your local backend server.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {savedSuccess && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" /> Profile synchronized!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
