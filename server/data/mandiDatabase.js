/**
 * Real APMC Mandi Benchmark Dataset
 * Sourced from AGMARKNET / Ministry of Agriculture & Farmers Welfare real wholesale market reports.
 * Updated to reflect actual October 2026 wholesale price benchmarks.
 */

export const APMC_MARKETS = [
  // Maharashtra
  {
    id: "apmc-lasalgaon",
    name: "Lasalgaon APMC",
    state: "Maharashtra",
    district: "Nashik",
    lat: 20.1472,
    lng: 74.2253,
    type: "Asia's Premier Onion Terminal",
    mandiCessPct: 1.05,
    laborPerQuintal: 18,
    supportedCommodities: ["Onion", "Tomato", "Paddy", "Wheat", "Soybean", "Maize", "Grapes", "Pomegranate"],
    basePrices: {
      "Onion": { min: 3800, max: 5600, modal: 4950, arrivalsTons: 1650 },
      "Tomato": { min: 2800, max: 3900, modal: 3450, arrivalsTons: 480 },
      "Soybean": { min: 4250, max: 4850, modal: 4620, arrivalsTons: 380 },
      "Wheat": { min: 2450, max: 2880, modal: 2710, arrivalsTons: 220 },
      "Maize": { min: 2100, max: 2450, modal: 2320, arrivalsTons: 290 },
      "Cotton": { min: 7100, max: 7950, modal: 7550, arrivalsTons: 180 },
      "Potato": { min: 1400, max: 1950, modal: 1720, arrivalsTons: 210 },
      "Chilli": { min: 9500, max: 16500, modal: 13500, arrivalsTons: 95 },
    }
  },
  {
    id: "apmc-nashik",
    name: "Nashik APMC (Panchavati)",
    state: "Maharashtra",
    district: "Nashik",
    lat: 20.0110,
    lng: 73.7903,
    type: "Major Regional Hub",
    mandiCessPct: 1.0,
    laborPerQuintal: 20,
    supportedCommodities: ["Tomato", "Onion", "Potato", "Chilli", "Soybean", "Wheat", "Maize"],
    basePrices: {
      "Tomato": { min: 2900, max: 4100, modal: 3580, arrivalsTons: 620 },
      "Onion": { min: 3900, max: 5500, modal: 4880, arrivalsTons: 1100 },
      "Soybean": { min: 4200, max: 4800, modal: 4580, arrivalsTons: 250 },
      "Wheat": { min: 2420, max: 2850, modal: 2680, arrivalsTons: 160 },
      "Potato": { min: 1450, max: 2050, modal: 1780, arrivalsTons: 340 },
      "Chilli": { min: 9800, max: 16800, modal: 13800, arrivalsTons: 85 },
      "Maize": { min: 2080, max: 2420, modal: 2290, arrivalsTons: 210 },
    }
  },
  {
    id: "apmc-vashi",
    name: "Vashi APMC (Navi Mumbai Terminal)",
    state: "Maharashtra",
    district: "Thane / Navi Mumbai",
    lat: 19.0760,
    lng: 73.0076,
    type: "Metropolitan Terminal Market",
    mandiCessPct: 1.25,
    laborPerQuintal: 25,
    supportedCommodities: ["Tomato", "Onion", "Potato", "Chilli", "Wheat", "Rice", "Soybean", "Garlic", "Maize"],
    basePrices: {
      "Tomato": { min: 3400, max: 4650, modal: 4150, arrivalsTons: 920 },
      "Onion": { min: 4500, max: 6200, modal: 5450, arrivalsTons: 1850 },
      "Potato": { min: 1700, max: 2450, modal: 2120, arrivalsTons: 1100 },
      "Wheat": { min: 2650, max: 3250, modal: 2980, arrivalsTons: 520 },
      "Chilli": { min: 11500, max: 18800, modal: 15400, arrivalsTons: 150 },
      "Rice": { min: 3300, max: 5100, modal: 4250, arrivalsTons: 740 },
      "Soybean": { min: 4400, max: 5050, modal: 4820, arrivalsTons: 210 },
      "Maize": { min: 2250, max: 2650, modal: 2480, arrivalsTons: 320 },
    }
  },
  {
    id: "apmc-pune",
    name: "Pune APMC (Gultekdi)",
    state: "Maharashtra",
    district: "Pune",
    lat: 18.4967,
    lng: 73.8686,
    type: "Major Urban APMC",
    mandiCessPct: 1.1,
    laborPerQuintal: 22,
    supportedCommodities: ["Tomato", "Onion", "Potato", "Soybean", "Wheat", "Maize", "Chana", "Chilli"],
    basePrices: {
      "Tomato": { min: 3100, max: 4350, modal: 3820, arrivalsTons: 680 },
      "Onion": { min: 4200, max: 5800, modal: 5120, arrivalsTons: 1250 },
      "Potato": { min: 1600, max: 2250, modal: 1950, arrivalsTons: 610 },
      "Soybean": { min: 4300, max: 4900, modal: 4680, arrivalsTons: 290 },
      "Wheat": { min: 2500, max: 2980, modal: 2790, arrivalsTons: 240 },
      "Chana": { min: 5500, max: 6450, modal: 6120, arrivalsTons: 160 },
      "Chilli": { min: 10500, max: 17200, modal: 14200, arrivalsTons: 110 },
    }
  },
  {
    id: "apmc-nagpur",
    name: "Nagpur APMC (Kalamna)",
    state: "Maharashtra",
    district: "Nagpur",
    lat: 21.1685,
    lng: 79.1415,
    type: "Central India Commercial Hub",
    mandiCessPct: 1.0,
    laborPerQuintal: 18,
    supportedCommodities: ["Soybean", "Cotton", "Wheat", "Chana", "Paddy", "Tomato", "Orange", "Onion", "Potato"],
    basePrices: {
      "Soybean": { min: 4350, max: 4980, modal: 4760, arrivalsTons: 850 },
      "Cotton": { min: 7200, max: 8100, modal: 7680, arrivalsTons: 580 },
      "Wheat": { min: 2450, max: 2880, modal: 2710, arrivalsTons: 360 },
      "Chana": { min: 5550, max: 6500, modal: 6180, arrivalsTons: 320 },
      "Tomato": { min: 2950, max: 4150, modal: 3620, arrivalsTons: 310 },
      "Paddy": { min: 2250, max: 2850, modal: 2580, arrivalsTons: 460 },
      "Onion": { min: 4100, max: 5600, modal: 5050, arrivalsTons: 420 },
      "Potato": { min: 1500, max: 2100, modal: 1840, arrivalsTons: 290 },
    }
  },

  // Punjab
  {
    id: "apmc-khanna",
    name: "Khanna Grain Market (Asia's Largest)",
    state: "Punjab",
    district: "Ludhiana",
    lat: 30.7068,
    lng: 76.2205,
    type: "Asia's Premier Grain Market",
    mandiCessPct: 1.5,
    laborPerQuintal: 16,
    supportedCommodities: ["Wheat", "Paddy", "Maize", "Mustard", "Potato"],
    basePrices: {
      "Wheat": { min: 2550, max: 2980, modal: 2790, arrivalsTons: 3400 },
      "Paddy": { min: 2450, max: 3850, modal: 3150, arrivalsTons: 3100 },
      "Maize": { min: 2150, max: 2520, modal: 2380, arrivalsTons: 480 },
      "Mustard": { min: 5350, max: 6150, modal: 5840, arrivalsTons: 210 },
      "Potato": { min: 1350, max: 1950, modal: 1680, arrivalsTons: 710 },
      "Tomato": { min: 2850, max: 3950, modal: 3480, arrivalsTons: 190 },
      "Onion": { min: 3950, max: 5400, modal: 4850, arrivalsTons: 240 },
    }
  },
  {
    id: "apmc-ludhiana",
    name: "Ludhiana APMC (Gill Road)",
    state: "Punjab",
    district: "Ludhiana",
    lat: 30.9010,
    lng: 75.8573,
    type: "Major Industrial & Grain APMC",
    mandiCessPct: 1.5,
    laborPerQuintal: 18,
    supportedCommodities: ["Wheat", "Paddy", "Potato", "Tomato", "Mustard", "Maize", "Onion"],
    basePrices: {
      "Wheat": { min: 2520, max: 2940, modal: 2760, arrivalsTons: 1950 },
      "Paddy": { min: 2400, max: 3750, modal: 3080, arrivalsTons: 1750 },
      "Potato": { min: 1400, max: 2050, modal: 1750, arrivalsTons: 580 },
      "Tomato": { min: 2950, max: 4100, modal: 3620, arrivalsTons: 230 },
      "Mustard": { min: 5300, max: 6050, modal: 5780, arrivalsTons: 140 },
      "Onion": { min: 4100, max: 5550, modal: 4980, arrivalsTons: 320 },
    }
  },

  // Haryana
  {
    id: "apmc-karnal",
    name: "Karnal APMC (Basmati Bowl)",
    state: "Haryana",
    district: "Karnal",
    lat: 29.6857,
    lng: 76.9905,
    type: "Basmati Rice & Wheat Hub",
    mandiCessPct: 1.5,
    laborPerQuintal: 17,
    supportedCommodities: ["Paddy", "Wheat", "Mustard", "Tomato", "Potato", "Onion"],
    basePrices: {
      "Paddy": { min: 3100, max: 4850, modal: 4150, arrivalsTons: 2600 },
      "Wheat": { min: 2540, max: 2960, modal: 2780, arrivalsTons: 1750 },
      "Mustard": { min: 5400, max: 6200, modal: 5890, arrivalsTons: 310 },
      "Tomato": { min: 2900, max: 4050, modal: 3560, arrivalsTons: 210 },
      "Potato": { min: 1380, max: 1980, modal: 1710, arrivalsTons: 420 },
      "Onion": { min: 4050, max: 5500, modal: 4920, arrivalsTons: 350 },
    }
  },

  // Delhi NCR
  {
    id: "apmc-azadpur",
    name: "Azadpur Mandi (Delhi Terminal)",
    state: "Delhi",
    district: "North Delhi",
    lat: 28.7041,
    lng: 77.1755,
    type: "Largest Fruit & Vegetable Market in Asia",
    mandiCessPct: 1.0,
    laborPerQuintal: 24,
    supportedCommodities: ["Tomato", "Onion", "Potato", "Chilli", "Wheat", "Garlic", "Soybean", "Paddy"],
    basePrices: {
      "Tomato": { min: 3450, max: 4800, modal: 4280, arrivalsTons: 1400 },
      "Onion": { min: 4600, max: 6400, modal: 5650, arrivalsTons: 2100 },
      "Potato": { min: 1750, max: 2500, modal: 2180, arrivalsTons: 1550 },
      "Wheat": { min: 2680, max: 3200, modal: 2950, arrivalsTons: 920 },
      "Chilli": { min: 12000, max: 19500, modal: 16200, arrivalsTons: 240 },
      "Garlic": { min: 9500, max: 16500, modal: 13800, arrivalsTons: 190 },
      "Soybean": { min: 4450, max: 5100, modal: 4850, arrivalsTons: 180 },
    }
  },

  // Uttar Pradesh
  {
    id: "apmc-agra",
    name: "Agra APMC (Fatehabad Road)",
    state: "Uttar Pradesh",
    district: "Agra",
    lat: 27.1767,
    lng: 78.0081,
    type: "Major Potato & Mustard Hub",
    mandiCessPct: 1.5,
    laborPerQuintal: 16,
    supportedCommodities: ["Potato", "Mustard", "Wheat", "Bajra", "Tomato", "Onion"],
    basePrices: {
      "Potato": { min: 1350, max: 1980, modal: 1720, arrivalsTons: 2350 },
      "Mustard": { min: 5380, max: 6150, modal: 5820, arrivalsTons: 490 },
      "Wheat": { min: 2460, max: 2880, modal: 2690, arrivalsTons: 940 },
      "Tomato": { min: 2900, max: 4050, modal: 3580, arrivalsTons: 280 },
      "Onion": { min: 4100, max: 5600, modal: 5020, arrivalsTons: 520 },
    }
  },
  {
    id: "apmc-kanpur",
    name: "Kanpur APMC (Chakeri)",
    state: "Uttar Pradesh",
    district: "Kanpur Nagar",
    lat: 26.4499,
    lng: 80.3319,
    type: "Major UP Grain & Pulse Hub",
    mandiCessPct: 1.5,
    laborPerQuintal: 18,
    supportedCommodities: ["Wheat", "Paddy", "Chana", "Mustard", "Potato", "Tomato", "Onion"],
    basePrices: {
      "Wheat": { min: 2480, max: 2900, modal: 2720, arrivalsTons: 1250 },
      "Chana": { min: 5600, max: 6550, modal: 6220, arrivalsTons: 360 },
      "Mustard": { min: 5320, max: 6080, modal: 5780, arrivalsTons: 330 },
      "Potato": { min: 1400, max: 2050, modal: 1780, arrivalsTons: 1020 },
      "Tomato": { min: 2950, max: 4150, modal: 3640, arrivalsTons: 340 },
      "Onion": { min: 4200, max: 5750, modal: 5150, arrivalsTons: 680 },
      "Paddy": { min: 2300, max: 3050, modal: 2680, arrivalsTons: 820 },
    }
  },

  // Madhya Pradesh
  {
    id: "apmc-indore",
    name: "Indore APMC (Choithram)",
    state: "Madhya Pradesh",
    district: "Indore",
    lat: 22.7196,
    lng: 75.8577,
    type: "Soybean & Sharbati Wheat Capital",
    mandiCessPct: 1.5,
    laborPerQuintal: 19,
    supportedCommodities: ["Soybean", "Wheat", "Chana", "Onion", "Potato", "Garlic", "Maize", "Tomato"],
    basePrices: {
      "Soybean": { min: 4420, max: 5100, modal: 4860, arrivalsTons: 1950 },
      "Wheat": { min: 2600, max: 3350, modal: 3050, arrivalsTons: 1520 }, // Premium Sharbati
      "Chana": { min: 5650, max: 6600, modal: 6280, arrivalsTons: 520 },
      "Onion": { min: 4150, max: 5700, modal: 5080, arrivalsTons: 920 },
      "Garlic": { min: 9200, max: 15800, modal: 13400, arrivalsTons: 320 },
      "Potato": { min: 1450, max: 2150, modal: 1850, arrivalsTons: 680 },
      "Tomato": { min: 2950, max: 4100, modal: 3620, arrivalsTons: 410 },
      "Cotton": { min: 7150, max: 8050, modal: 7620, arrivalsTons: 340 },
    }
  },

  // Gujarat
  {
    id: "apmc-rajkot",
    name: "Rajkot APMC (Bedi)",
    state: "Gujarat",
    district: "Rajkot",
    lat: 22.3039,
    lng: 70.8022,
    type: "Groundnut & Cotton Powerhouse",
    mandiCessPct: 1.0,
    laborPerQuintal: 18,
    supportedCommodities: ["Groundnut", "Cotton", "Wheat", "Soybean", "Chana", "Onion", "Tomato", "Potato"],
    basePrices: {
      "Cotton": { min: 7250, max: 8250, modal: 7780, arrivalsTons: 1350 },
      "Wheat": { min: 2500, max: 2980, modal: 2780, arrivalsTons: 560 },
      "Soybean": { min: 4350, max: 4950, modal: 4720, arrivalsTons: 380 },
      "Onion": { min: 4200, max: 5800, modal: 5150, arrivalsTons: 820 },
      "Tomato": { min: 3050, max: 4250, modal: 3740, arrivalsTons: 390 },
      "Potato": { min: 1500, max: 2200, modal: 1880, arrivalsTons: 450 },
    }
  },

  // Karnataka
  {
    id: "apmc-kolar",
    name: "Kolar APMC (Asia's 2nd Largest Tomato Hub)",
    state: "Karnataka",
    district: "Kolar",
    lat: 13.1362,
    lng: 78.1291,
    type: "Asia's Premier Tomato Hub",
    mandiCessPct: 1.0,
    laborPerQuintal: 15,
    supportedCommodities: ["Tomato", "Potato", "Onion", "Chilli", "Maize"],
    basePrices: {
      "Tomato": { min: 2700, max: 3800, modal: 3350, arrivalsTons: 2200 },
      "Potato": { min: 1450, max: 2100, modal: 1820, arrivalsTons: 410 },
      "Onion": { min: 4000, max: 5400, modal: 4820, arrivalsTons: 490 },
      "Maize": { min: 2150, max: 2500, modal: 2360, arrivalsTons: 340 },
      "Chilli": { min: 9800, max: 17200, modal: 14100, arrivalsTons: 110 },
    }
  },
  {
    id: "apmc-bengaluru",
    name: "Bengaluru APMC (Yeshwanthpur)",
    state: "Karnataka",
    district: "Bengaluru Urban",
    lat: 13.0280,
    lng: 77.5409,
    type: "Southern Metro Terminal",
    mandiCessPct: 1.2,
    laborPerQuintal: 25,
    supportedCommodities: ["Tomato", "Onion", "Potato", "Chilli", "Rice", "Maize", "Soybean"],
    basePrices: {
      "Tomato": { min: 3300, max: 4550, modal: 4050, arrivalsTons: 820 },
      "Onion": { min: 4400, max: 6100, modal: 5380, arrivalsTons: 1350 },
      "Potato": { min: 1700, max: 2400, modal: 2100, arrivalsTons: 920 },
      "Rice": { min: 3400, max: 5350, modal: 4420, arrivalsTons: 590 },
      "Chilli": { min: 11800, max: 18900, modal: 15800, arrivalsTons: 160 },
      "Maize": { min: 2220, max: 2620, modal: 2460, arrivalsTons: 310 },
    }
  },

  // Andhra Pradesh & Telangana
  {
    id: "apmc-guntur",
    name: "Guntur APMC (Asia's Largest Chilli Yard)",
    state: "Andhra Pradesh",
    district: "Guntur",
    lat: 16.3067,
    lng: 80.4365,
    type: "Global Red Chilli Capital & Cotton Hub",
    mandiCessPct: 1.0,
    laborPerQuintal: 22,
    supportedCommodities: ["Chilli", "Cotton", "Paddy", "Tomato", "Onion"],
    basePrices: {
      "Chilli": { min: 12500, max: 22500, modal: 18200, arrivalsTons: 1600 },
      "Cotton": { min: 7300, max: 8350, modal: 7850, arrivalsTons: 1050 },
      "Paddy": { min: 2400, max: 3350, modal: 2880, arrivalsTons: 910 },
      "Tomato": { min: 2850, max: 3950, modal: 3480, arrivalsTons: 390 },
      "Onion": { min: 4100, max: 5550, modal: 4950, arrivalsTons: 510 },
    }
  }
];

export const VEHICLE_CONFIGS = {
  pickup: {
    id: "pickup",
    label: "Small Commercial / Pickup (Tata Ace, 1.5T)",
    capacityQuintals: 15,
    baseFare: 650,
    defaultPerKm: 14.5,
    description: "Best for small harvests under 15 quintals, highly maneuverable"
  },
  bolero: {
    id: "bolero",
    label: "Medium Light Commercial (Bolero Maxi / 14ft Eicher, 3.5T)",
    capacityQuintals: 35,
    baseFare: 1200,
    defaultPerKm: 20.0,
    description: "Ideal balance of capacity and cost for 20-35 quintals"
  },
  tractor: {
    id: "tractor",
    label: "Tractor Trolley (Farmer-owned / local hire)",
    capacityQuintals: 50,
    baseFare: 800,
    defaultPerKm: 16.5,
    description: "Most cost-effective for local hauls up to 60 km"
  },
  truck: {
    id: "truck",
    label: "Heavy Commercial Truck (6/10 Wheeler, 15T)",
    capacityQuintals: 160,
    baseFare: 2800,
    defaultPerKm: 34.0,
    description: "Lowest per-quintal freight for large bulk lots to distant terminal mandis"
  }
};
