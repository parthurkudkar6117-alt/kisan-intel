import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Truck, 
  DollarSign, 
  MapPin, 
  Sliders, 
  ArrowUpRight, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Scale, 
  Layers, 
  RefreshCw,
  TrendingDown,
  BarChart3,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { useFarm } from '../context/FarmContext';

export default function MarketAdvisor() {
  const { profile, updateProfile } = useFarm();

  // Inputs
  const [commodity, setCommodity] = useState(profile.crop || 'Tomato');
  const [quantity, setQuantity] = useState(35); // quintals
  const [vehicleType, setVehicleType] = useState('bolero');
  const [customRatePerKm, setCustomRatePerKm] = useState(20);
  const [customLaborRate, setCustomLaborRate] = useState(18); // ₹/qtl
  const [otherCostPerQtl, setOtherCostPerQtl] = useState(8); // ₹/qtl

  // Search & Filter State
  const [searchMandiQuery, setSearchMandiQuery] = useState('');
  const [maxDistanceFilter, setMaxDistanceFilter] = useState('all'); // 'all', '100', '250', '500'

  // Change Origin State
  const [isChangingOrigin, setIsChangingOrigin] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState('');
  const [originSearchResults, setOriginSearchResults] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);

  // Results & Loading
  const [marketData, setMarketData] = useState(null);
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison', 'trends'

  // Quick Agricultural Origin Hubs
  const popularOrigins = [
    { name: "Nashik, Maharashtra", lat: 20.0110, lng: 73.7903, state: "Maharashtra" },
    { name: "Karnal, Haryana", lat: 29.6857, lng: 76.9905, state: "Haryana" },
    { name: "Nagpur, Maharashtra", lat: 21.1458, lng: 79.0882, state: "Maharashtra" },
    { name: "Guntur, Andhra Pradesh", lat: 16.3067, lng: 80.4365, state: "Andhra Pradesh" },
    { name: "Agra, Uttar Pradesh", lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
    { name: "Indore, Madhya Pradesh", lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
    { name: "Rajkot, Gujarat", lat: 22.3039, lng: 70.8022, state: "Gujarat" },
    { name: "Kolar, Karnataka", lat: 13.1362, lng: 78.1291, state: "Karnataka" },
  ];

  // Fetch commodities list on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch('/api/market/meta');
        if (res.ok) {
          const data = await res.json();
          setAvailableCommodities(data.commodities || []);
        }
      } catch (err) {
        console.error("Meta fetch error", err);
      }
    }
    loadMeta();
  }, []);

  // Update commodity if farm profile changes
  useEffect(() => {
    if (profile.crop) {
      setCommodity(profile.crop);
    }
  }, [profile.crop]);

  // Debounced Origin Geocoding Search
  useEffect(() => {
    if (!originSearchQuery || originSearchQuery.trim().length < 2) {
      setOriginSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingOrigin(true);
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(originSearchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setOriginSearchResults(data.results || []);
        }
      } catch (e) {
        console.error("Origin search error", e);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [originSearchQuery]);

  const handleSelectOrigin = (loc) => {
    updateProfile({
      location: {
        name: `${loc.name}${loc.state ? ', ' + loc.state : ''}`,
        lat: loc.lat,
        lng: loc.lng,
        state: loc.state,
        displayName: loc.displayName || `${loc.name}, ${loc.state}`
      }
    });
    setOriginSearchQuery('');
    setOriginSearchResults([]);
    setIsChangingOrigin(false);
  };

  // Reactive calculation: Re-fetch / re-calculate whenever inputs change
  useEffect(() => {
    let isCancelled = false;

    async function fetchComparison() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/market/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodity,
            quantity: Number(quantity) || 1,
            farmerLat: profile.location.lat,
            farmerLng: profile.location.lng,
            farmerLocation: profile.location.name,
            vehicleType,
            customRatePerKm: Number(customRatePerKm),
            customLaborRate: Number(customLaborRate),
            otherCostsPerQtl: Number(otherCostPerQtl),
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setMarketData(data);
          }
        }
      } catch (err) {
        console.error("Market fetch error:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchComparison();

    return () => {
      isCancelled = true;
    };
  }, [commodity, quantity, vehicleType, customRatePerKm, customLaborRate, otherCostPerQtl, profile.location]);

  // Filter ranked markets by search query and distance
  const filteredMarkets = useMemo(() => {
    if (!marketData?.rankedMarkets) return [];
    return marketData.rankedMarkets.filter(m => {
      const q = searchMandiQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        m.name.toLowerCase().includes(q) || 
        m.district.toLowerCase().includes(q) || 
        m.state.toLowerCase().includes(q);

      const matchesDistance = maxDistanceFilter === 'all' ? true : m.distanceKm <= Number(maxDistanceFilter);

      return matchesSearch && matchesDistance;
    });
  }, [marketData, searchMandiQuery, maxDistanceFilter]);

  // Chart data for comparing net returns vs gross value
  const comparisonChartData = useMemo(() => {
    if (!marketData?.rankedMarkets) return [];
    return marketData.rankedMarkets.slice(0, 5).map(m => ({
      name: m.name.replace(' APMC', '').replace(' Market', ''),
      gross: m.economics.grossSaleValue,
      net: m.economics.expectedNetReturn,
      transport: m.economics.transportCost,
      isBest: m.id === marketData.bestMarket.id,
      isBaseline: m.isBaseline
    }));
  }, [marketData]);

  const bestMarket = marketData?.bestMarket;
  const baselineMarket = marketData?.baselineLocalMarket;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-pill bg-blue-50 text-blue-800 border border-blue-200">
              Analytical & Financial Intelligence
            </span>
            <span className="text-xs text-slate-500">• 100% Deterministic Mathematical Modeling</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mandi & Market Decision Support</h1>
          <p className="text-xs text-slate-500">
            Real APMC price intelligence, logistics freight optimization, and expected net return ranking.
          </p>
        </div>

        {/* Change Origin Trigger Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Farm Origin</span>
            <span className="text-xs font-bold text-slate-800">{profile.location.name}</span>
          </div>
          <button
            onClick={() => setIsChangingOrigin(!isChangingOrigin)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Change Origin</span>
          </button>
        </div>
      </div>

      {/* Change Origin Interactive Drawer / Box */}
      {isChangingOrigin && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-blue-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Select Farm Departure Origin</span>
            </span>
            <button
              onClick={() => setIsChangingOrigin(false)}
              className="p-1 rounded-lg text-blue-500 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-600 text-[11px]">
            Distances and freight calculations will recompute instantly from your selected origin location:
          </p>

          {/* Search Origin Autocomplete */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-blue-200 shadow-sm">
              <Search className="w-4 h-4 text-blue-500 shrink-0" />
              <input
                type="text"
                placeholder="Search any village, town, city, or district (e.g. Karnal, Baramati, Khanna)..."
                value={originSearchQuery}
                onChange={(e) => setOriginSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none placeholder:text-slate-400"
              />
              {isSearchingOrigin && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
            </div>

            {originSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-30 max-h-48 overflow-y-auto">
                {originSearchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOrigin(loc)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 hover:text-blue-900 border-b border-slate-100 last:border-0 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{loc.name}</span>
                      <span className="text-slate-500 ml-1.5">{loc.state}, {loc.country}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 1-Click Popular Origin Hubs */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Or choose a major farming hub:</span>
            <div className="flex flex-wrap gap-1.5">
              {popularOrigins.map((orig, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOrigin(orig)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    profile.location.name.includes(orig.name.split(',')[0])
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white text-slate-700 hover:bg-blue-100/70 border border-slate-200'
                  }`}
                >
                  📍 {orig.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real Mandi Source Live Sync Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-300">AGMARKNET Real APMC Wholesale Feed</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Live Data Feed
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sourced from Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
          <span>Grade: FAQ</span>
          <span>•</span>
          <span>Origin: {profile.location.name.split(',')[0]}</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">100% Deterministic Math</span>
        </div>
      </div>

      {/* Interactive Simulation & Logistics Assumptions */}
      <div className="card-clean p-6 bg-white space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Interactive Simulation & Logistics Assumptions</h2>
          </div>
          <span className="text-xs text-slate-400">All numbers recalculate in code</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Commodity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Crop / Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableCommodities.length > 0 ? (
                availableCommodities.map(c => <option key={c} value={c}>{c}</option>)
              ) : (
                ["Tomato", "Wheat", "Cotton", "Paddy / Rice", "Potato", "Soybean", "Maize", "Mustard", "Onion", "Chilli"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))
              )}
            </select>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Harvest Quantity</label>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {quantity} Quintals ({Math.round(quantity * 0.1 * 10) / 10} Tons)
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="150"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2 Qtl (Small)</span>
              <span>50 Qtl (Trolley)</span>
              <span>150 Qtl (Truck)</span>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transport Vehicle
            </label>
            <select
              value={vehicleType}
              onChange={(e) => {
                const vt = e.target.value;
                setVehicleType(vt);
                if (vt === 'pickup') setCustomRatePerKm(14.5);
                else if (vt === 'bolero') setCustomRatePerKm(20.0);
                else if (vt === 'tractor') setCustomRatePerKm(16.5);
                else if (vt === 'truck') setCustomRatePerKm(34.0);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pickup">Small Pickup / Tata Ace (Max 15 Qtl)</option>
              <option value="bolero">Medium Bolero / Eicher (Max 35 Qtl)</option>
              <option value="tractor">Tractor Trolley (Max 50 Qtl, Local)</option>
              <option value="truck">Heavy 10-Wheeler Truck (Max 160 Qtl)</option>
            </select>
          </div>

          {/* Freight Rate per Km */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Freight Rate (₹/km)</label>
              <span className="text-xs font-extrabold text-slate-800 font-mono">
                ₹{customRatePerKm}/km
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={customRatePerKm}
              onChange={(e) => setCustomRatePerKm(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹10/km</span>
              <span>₹25/km</span>
              <span>₹50/km</span>
            </div>
          </div>
        </div>

        {/* Cost adjustments toggle / secondary costs */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-medium">Fine-tune charges:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Hamali / Labor:</span>
              <input
                type="number"
                value={customLaborRate}
                onChange={(e) => setCustomLaborRate(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs rounded border border-slate-200 text-center font-bold"
              />
              <span className="text-slate-400">₹/qtl</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Misc handling:</span>
              <input
                type="number"
                value={otherCostPerQtl}
                onChange={(e) => setOtherCostPerQtl(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs rounded border border-slate-200 text-center font-bold"
              />
              <span className="text-slate-400">₹/qtl</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Trips required for {quantity} quintals: <strong className="text-slate-800">{marketData?.bestMarket?.economics?.tripsRequired || 1} Trip(s)</strong>
          </div>
        </div>
      </div>

      {/* Top Optimal Recommendation Banner */}
      {bestMarket && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Optimal Market Recommendation</span>
              </div>
              <span className="text-xs text-blue-200 font-mono">
                From: {profile.location.name} • Batch: {quantity} Quintals
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{bestMarket.name}</h2>
                <p className="text-xs text-blue-200/90 mt-1">
                  {bestMarket.district}, {bestMarket.state} • {bestMarket.distanceKm} km road distance
                </p>
              </div>

              {/* Economic Highlights */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/10 p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-blue-200 font-medium">Modal Price</p>
                  <p className="text-xl font-black text-white">₹{bestMarket.priceData.modalPrice}/qtl</p>
                </div>

                <div className="h-8 w-px bg-white/20 hidden sm:block" />

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-blue-200 font-medium">Expected Net Return</p>
                  <p className="text-xl font-black text-emerald-400">
                    ₹{bestMarket.economics.expectedNetReturn.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="h-8 w-px bg-white/20 hidden sm:block" />

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-blue-200 font-medium">Realized Net / Qtl</p>
                  <p className="text-xl font-black text-white">₹{bestMarket.economics.netPerQuintal}/qtl</p>
                </div>
              </div>
            </div>

            {/* Grounded Decision Intelligence Explanation */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs leading-relaxed text-blue-50">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Why this market is optimal: </strong>
                  <span>{marketData.explanation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandi Comparative Analysis Table with Search Box & Filters */}
      <div className="card-clean overflow-hidden">
        {/* Table Controls: Search & Tabs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mandi Economic Comparison Matrix</h3>
              <p className="text-xs text-slate-500">Ranked by expected net return after transport freight and mandi cess</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'comparison' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Matrix Table
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'trends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Price Trends & Charts
              </button>
            </div>
          </div>

          {/* Search Box & Distance Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mandis by name, district, or state (e.g. Vashi, Azadpur, Nashik, Punjab)..."
                value={searchMandiQuery}
                onChange={(e) => setSearchMandiQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
              {searchMandiQuery && (
                <button
                  onClick={() => setSearchMandiQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] text-slate-500 font-medium">Distance:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
                {['all', '100', '250', '500'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setMaxDistanceFilter(d)}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                      maxDistanceFilter === d ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {d === 'all' ? 'All' : `< ${d}km`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'comparison' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Market & Location</th>
                  <th className="py-3 px-3">Distance</th>
                  <th className="py-3 px-3">Modal Price</th>
                  <th className="py-3 px-3">Gross Value</th>
                  <th className="py-3 px-3">Transport Freight</th>
                  <th className="py-3 px-3">Mandi Cess + Labor</th>
                  <th className="py-3 px-3 text-right">Expected Net Return</th>
                  <th className="py-3 px-4 text-right">Realized Net/Qtl</th>
                  <th className="py-3 px-4 text-center">Profit vs Baseline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      No mandis found matching "{searchMandiQuery}". Try another search term or increase the distance filter.
                    </td>
                  </tr>
                ) : (
                  filteredMarkets.map((market, idx) => {
                    const isBest = market.id === bestMarket?.id;
                    const isBaseline = market.isBaseline;
                    return (
                      <tr
                        key={market.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isBest ? 'bg-blue-50/40 font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isBest ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900">{market.name}</span>
                              <div className="text-[11px] text-slate-400">
                                {market.district}, {market.state}
                                {isBaseline && (
                                  <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[9px]">
                                    Local Mandi
                                  </span>
                                )}
                                {isBest && (
                                  <span className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold text-[9px]">
                                    ★ Highest Net
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {market.distanceKm} km
                        </td>

                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          ₹{market.priceData.modalPrice}
                        </td>

                        <td className="py-3.5 px-3 text-slate-700">
                          ₹{market.economics.grossSaleValue.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-rose-700 font-mono">
                          -₹{market.economics.transportCost.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 font-mono">
                          -₹{(market.economics.mandiCessAmount + market.economics.laborAmount + market.economics.otherCostAmount).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <span className={`text-sm font-extrabold ${isBest ? 'text-emerald-700' : 'text-slate-900'}`}>
                            ₹{market.economics.expectedNetReturn.toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          ₹{market.economics.netPerQuintal}/qtl
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {market.profitDelta > 0 ? (
                            <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              +₹{market.profitDelta.toLocaleString('en-IN')}
                            </span>
                          ) : market.profitDelta < 0 ? (
                            <span className="inline-flex items-center text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              -₹{Math.abs(market.profitDelta).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">Baseline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Charts & Trends Tab */}
        {activeTab === 'trends' && (
          <div className="p-6 space-y-8">
            {/* Chart 1: Net Return vs Gross Value Comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Gross Revenue vs Expected Net Return (Top 5 Mandis)</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip
                      formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="gross" name="Gross Sale Value" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="net" name="Expected Net Return" fill="#15803d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: 30-Day Historical Price Movement */}
            {marketData?.trendHistory && (
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>30-Day Agmarknet Price Movement & Spread ({commodity} - ₹/Quintal)</span>
                  </h4>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Modal
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Min/Max Spread
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketData.trendHistory} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={4} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        formatter={(val, name) => [`₹${val}/qtl`, name === 'price' ? 'Modal Price' : name]}
                      />
                      <Line type="monotone" dataKey="maxPrice" stroke="#cbd5e1" strokeDasharray="3 3" dot={false} name="Max Price" />
                      <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2.5} dot={{ r: 2 }} name="Modal Price" />
                      <Line type="monotone" dataKey="minPrice" stroke="#cbd5e1" strokeDasharray="3 3" dot={false} name="Min Price" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Break-Even Volume & Sensitivity Analysis Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-clean p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">Break-Even Volume Analysis</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Distant terminal markets have higher fixed transport base fares. If you harvest only 5 quintals, travelling 100km loses money.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Break-Even Volume:</span>
              <span className="font-extrabold text-indigo-900">
                {marketData?.breakEvenQuintals ? `${marketData.breakEvenQuintals} Quintals` : 'Optimal at all volumes'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {marketData?.breakEvenQuintals
                ? `At volumes above ${marketData.breakEvenQuintals} quintals, travelling to ${bestMarket?.name} generates more net profit than the local mandi.`
                : 'Local mandi is already closest with strong prices.'}
            </p>
          </div>
        </div>

        <div className="card-clean p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Logistics Optimization Tip</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vehicle load utilization directly dictates net return. Empty freight capacity wastes ₹{customRatePerKm}/km.
          </p>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-emerald-950 font-semibold">Active Vehicle:</span>
              <span className="font-bold text-emerald-800">{marketData?.vehicle.label.split('(')[0]}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-950 font-semibold">Load Capacity:</span>
              <span className="font-mono text-emerald-900">{quantity} / {marketData?.vehicle.capacityQuintals} Quintals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
