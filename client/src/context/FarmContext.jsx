import React, { createContext, useContext, useState, useEffect } from 'react';

const PRESET_FARMS = [
  {
    id: 'nashik_tomato',
    title: 'Nashik Vegetable Hub',
    crop: 'Tomato',
    variety: 'Abhinav (Indeterminate F1)',
    cropStage: 'Flowering & Fruit Set',
    sowingDate: '2026-08-20',
    acreage: 4.5,
    soilType: 'Loam',
    irrigationType: 'Drip',
    location: {
      name: 'Nashik, Maharashtra',
      lat: 20.0110,
      lng: 73.7903,
      state: 'Maharashtra',
      displayName: 'Nashik, Maharashtra, India'
    }
  },
  {
    id: 'karnal_wheat',
    title: 'Karnal Grain Belt',
    crop: 'Wheat',
    variety: 'HD-3226 (Pusa Yashasvi)',
    cropStage: 'Crown Root Initiation (CRI)',
    sowingDate: '2026-09-05',
    acreage: 8.0,
    soilType: 'Loam',
    irrigationType: 'Sprinkler',
    location: {
      name: 'Karnal, Haryana',
      lat: 29.6857,
      lng: 76.9905,
      state: 'Haryana',
      displayName: 'Karnal, Haryana, India'
    }
  },
  {
    id: 'nagpur_cotton',
    title: 'Nagpur Cotton & Soybean Zone',
    crop: 'Cotton',
    variety: 'Bollgard II Hybrid',
    cropStage: 'Flowering & Boll Development',
    sowingDate: '2026-07-15',
    acreage: 6.0,
    soilType: 'Clay / Black Cotton',
    irrigationType: 'Drip',
    location: {
      name: 'Nagpur, Maharashtra',
      lat: 21.1458,
      lng: 79.0882,
      state: 'Maharashtra',
      displayName: 'Nagpur, Maharashtra, India'
    }
  },
  {
    id: 'guntur_chilli',
    title: 'Guntur Chilli Yard',
    crop: 'Chilli',
    variety: 'Teja / Guntur Sannam',
    cropStage: 'Fruit Maturation & Pickings',
    sowingDate: '2026-07-25',
    acreage: 3.5,
    soilType: 'Loam',
    irrigationType: 'Drip',
    location: {
      name: 'Guntur, Andhra Pradesh',
      lat: 16.3067,
      lng: 80.4365,
      state: 'Andhra Pradesh',
      displayName: 'Guntur, Andhra Pradesh, India'
    }
  },
  {
    id: 'agra_potato',
    title: 'Agra Potato Bowl',
    crop: 'Potato',
    variety: 'Kufri Bahar (3797)',
    cropStage: 'Tuber Initiation & Bulking',
    sowingDate: '2026-09-10',
    acreage: 10.0,
    soilType: 'Sandy Loam',
    irrigationType: 'Flood/Furrow',
    location: {
      name: 'Agra, Uttar Pradesh',
      lat: 27.1767,
      lng: 78.0081,
      state: 'Uttar Pradesh',
      displayName: 'Agra, Uttar Pradesh, India'
    }
  }
];

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('kisan_farm_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved farm profile", e);
      }
    }
    return PRESET_FARMS[0];
  });

  const [geminiApiKey, setGeminiApiKeyState] = useState(() => {
    return localStorage.getItem('kisan_gemini_api_key') || '';
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('kisan_farm_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (partial) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  const applyPreset = (presetId) => {
    const found = PRESET_FARMS.find(p => p.id === presetId);
    if (found) {
      setProfile(found);
    }
  };

  const setGeminiApiKey = (key) => {
    const trimmed = key ? key.trim() : '';
    setGeminiApiKeyState(trimmed);
    if (trimmed) {
      localStorage.setItem('kisan_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('kisan_gemini_api_key');
    }
  };

  return (
    <FarmContext.Provider
      value={{
        profile,
        updateProfile,
        presets: PRESET_FARMS,
        applyPreset,
        geminiApiKey,
        setGeminiApiKey,
        isProfileModalOpen,
        setIsProfileModalOpen
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
