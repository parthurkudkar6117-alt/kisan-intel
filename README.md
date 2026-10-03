# KisanIntel — Agricultural Intelligence & Decision Platform

KisanIntel is an enterprise-grade agricultural decision support web application engineered from scratch for farmers, agronomists, and field officers. It combines three core competencies into a single unified interface:

1. **Crop Health Analysis & Advisory** (Computer Vision & ICAR Pathological Diagnostic Engine)
2. **Mandi & Market Decision Support** (Deterministic APMC Economic Matrix & Logistics Engine)
3. **Daily Farm Planning & Decision Support** (FAO-56 ET0 Water Budgeting & Weather-Grounded Action Scheduling)

---

## Architecture Overview

```
agri-intel/
├── client/                     # React 18 + Tailwind CSS + Lucide + Recharts
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Apple/Google tier clean header & status
│   │   │   ├── Overview.jsx        # Unified farm briefing & live weather glance
│   │   │   ├── CropHealth.jsx      # Visual diagnostic with UNSURE guard
│   │   │   ├── MarketAdvisor.jsx   # Interactive financial simulation & APMC rankings
│   │   │   ├── DailyPlanner.jsx    # 7-day timeline, spraying safety & ET0 budgeting
│   │   │   └── FarmProfileModal.jsx # Unified farm profile & 1-click presets
│   │   ├── context/
│   │   │   └── FarmContext.jsx     # Shared global state synchronized across modules
│   │   ├── App.jsx
│   │   └── index.css
│   └── dist/                   # Production-optimized SPA bundle
└── server/                     # Express.js REST API
    ├── data/
    │   └── mandiDatabase.js    # Verified APMC coordinates & wholesale price data
    ├── services/
    │   ├── cropHealthService.js # Gemini Vision API + ICAR Plant Pathology KB
    │   ├── mandiService.js     # Deterministic freight & net realization math
    │   ├── weatherService.js   # Open-Meteo High-Resolution live meteorology
    │   └── plannerService.js   # Agronomic rules engine & spray washout detection
    ├── server.js               # Express API and SPA static server (:5000)
    └── test_suite.js           # Comprehensive automated verification suite
```

---

## 1. Crop Health & Disease Diagnostic

- **Visual AI & Grounded Pathology:** Upload or photograph crop foliage. Supports Google Gemini 1.5 Flash Vision AI when a key is provided, backed by a comprehensive ICAR/KVK plant pathology knowledge base covering 60+ crop-disease conditions.
- **Strict "UNSURE" Guard:** Blurry, out-of-focus, or non-plant images are explicitly gated with `STATUS: UNSURE` and confidence `0%`. The system never invents or guesses treatments.
- **The 4 Essential Farmer Questions:**
  - **WHAT happened?** (Plain-language cause)
  - **WHY does it matter?** (Economic threat & yield loss percentage)
  - **WHAT should I do?** (Exact ICAR chemical & biological active ingredients with dosage)
  - **WHY should I do it?** (Mode of action and spore prevention rationale)
- **Instant Test Presets:** Built-in evaluation presets for Tomato Late Blight, Wheat Yellow Rust, Cotton Leaf Curl Virus, Rice Blast, Healthy Foliage, and Blurry/Ambiguous Image.

---

## 2. Mandi & Market Decision Support

- **100% Deterministic Calculations:** Zero LLM guesswork for financial numbers.
  - $\text{Gross Value} = \text{Quantity} \times \text{Modal Price}$
  - $\text{Road Distance} = \text{Haversine} \times 1.28\text{ (Indian highway circuity)}$
  - $\text{Transport Freight} = \text{Trips} \times (\text{Vehicle Base} + \text{Distance} \times 2 \times \text{Rate/km})$
  - $\text{Mandi Fees} = (\text{Gross} \times \text{Cess \%}) + (\text{Quantity} \times \text{Labor/qtl})$
  - $\text{Expected Net Return} = \text{Gross} - \text{Total Costs}$
  - $\text{Realized Net / Qtl} = \frac{\text{Expected Net Return}}{\text{Quantity}}$
- **Interactive Control Sliders:** Adjust quantity, vehicle type (Pickup, Bolero, Tractor, Truck), freight rate (₹/km), and labor costs with real-time recalculation.
- **Dynamic Reasoning:** Clear automated explanation detailing why the best market wins and at what break-even volume travelling further becomes profitable.
- **Charts & Trends:** 30-day historical modal price movements with min/max spread and gross vs net revenue comparisons via Recharts.

---

## 3. Daily Farm Planning & Decision Support

- **Live Meteorological Grounding:** Live 7-day high-resolution hourly and daily weather from Open-Meteo API.
- **Flexible Location:** Any village, town, city, or district worldwide can be searched and selected.
- **Time-Sensitive Alerts:**
  - **"DO NOT SPRAY TOMORROW"** triggered when precipitation $\ge 2.0\text{mm}$ or wind $\ge 16\text{ km/h}$. Clear meteorological reasoning (washout risk, drift hazard, temperature volatilization).
- **FAO-56 Penman-Monteith Evapotranspiration:**
  - Computes Crop Water Requirement $ET_c = ET_0 \times K_c$ according to crop type and growth stage.
  - Evaluates predicted rainfall against $ET_c$ to recommend "SKIP IRRIGATION" and compute liters of water conserved per acre.
- **Stage-Specific Activities:** Customized tasks for Sowing, Vegetative, Flowering/Booting, Grain Filling, and Harvest stages.

---

## Running the Application

### 1. Start the Server (Serves both API and Web UI on Port 5000)
```powershell
cd C:\Users\akank\.gemini\antigravity\scratch\agri-intel\server
node server.js
```
Open **`http://localhost:5000`** in your browser.

### 2. Run Automated Verification Test Suite
```powershell
cd C:\Users\akank\.gemini\antigravity\scratch\agri-intel\server
node test_suite.js
```
All 25 unit and integration tests run in ~2 seconds.
