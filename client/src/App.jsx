import React, { useState } from 'react';
import { FarmProvider } from './context/FarmContext';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import CropHealth from './components/CropHealth';
import MarketAdvisor from './components/MarketAdvisor';
import DailyPlanner from './components/DailyPlanner';
import FarmProfileModal from './components/FarmProfileModal';
import FarmerChatbot from './components/FarmerChatbot';
import { Sprout, ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <FarmProvider>
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col text-slate-800">
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
          {activeTab === 'crop-health' && <CropHealth />}
          {activeTab === 'market-advisor' && <MarketAdvisor />}
          {activeTab === 'daily-planner' && <DailyPlanner />}
        </main>

        {/* Unified Farm Profile Modal */}
        <FarmProfileModal />

        {/* Farmer-Friendly AI Chatbot Assistant */}
        <FarmerChatbot />


        {/* Clean Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  K
                </div>
                <span className="font-semibold text-slate-700">KisanIntel</span>
                <span>— Advanced Agricultural Intelligence & Advisory System</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ICAR / KVK Package of Practices
                </span>
                <span>•</span>
                <span className="text-slate-600">Open-Meteo High-Resolution Meteorology</span>
                <span>•</span>
                <span className="text-slate-600">AGMARKNET APMC Terminal Benchmarks</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </FarmProvider>
  );
}
