import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { getMarketComparison } from './services/mandiService.js';
import { APMC_MARKETS, VEHICLE_CONFIGS, COMMODITY_ALIASES, resolveCommodityAlias, MANDI_SOURCE_BOARDS } from './data/mandiDatabase.js';
import { searchLocations, getLiveWeatherForecast } from './services/weatherService.js';
import { generateDailyPlan } from './services/plannerService.js';
import { analyzeCropImage, PLANT_PATHOLOGY_DB } from './services/cropHealthService.js';
import { handleFarmerChat } from './services/assistantService.js';
import { getScraperApiStatus, fetchAgmarknetCommodities, fetchViaScraperApi } from './services/scraperService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Agricultural Chatbot Assistant
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, history, farmProfile, language, geminiApiKey } = req.body;
    const response = await handleFarmerChat({
      message,
      history,
      farmProfile,
      language: language || 'en',
      geminiApiKey: req.headers['x-gemini-key'] || geminiApiKey || process.env.GEMINI_API_KEY
    });
    res.json(response);
  } catch (err) {
    console.error("Assistant chat error:", err);
    res.status(500).json({ error: err.message });
  }
});


// Multer memory storage for direct file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgriIntel API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Geocoding: Flexible location search
app.get('/api/locations/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const results = await searchLocations(q);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Weather forecast
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const lat = Number(req.query.lat) || 19.9975;
    const lng = Number(req.query.lng) || 73.7898;
    const forecast = await getLiveWeatherForecast(lat, lng);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Farm Planner: Generate actionable day-by-day plan
app.post('/api/planner/generate', async (req, res) => {
  try {
    const { crop, cropStage, sowingDate, soilType, irrigationType, location } = req.body;
    const plan = await generateDailyPlan({
      crop,
      cropStage,
      sowingDate,
      soilType,
      irrigationType,
      location: location || { name: "Nashik, Maharashtra", lat: 19.9975, lng: 73.7898 }
    });
    res.json(plan);
  } catch (err) {
    console.error("Planner generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

import { getAuthenticatedGovtAdvisory } from './services/governmentAdvisoryService.js';

// Advanced AI Farm Advisory Chatbot
app.post('/api/planner/ai-advisor', async (req, res) => {
  try {
    const { message, location, crop, cropStage } = req.body;
    const locationName = location?.name || "Nashik, Maharashtra";
    
    // 1. Fetch Authenticated Govt Advisory
    const govtAdvisory = await getAuthenticatedGovtAdvisory({
      locationName,
      crop: crop || "Tomato",
      cropStage: cropStage || "Vegetative"
    });

    // 2. Prepare Gemini Prompt Grounded in Govt Data
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }
    
    const prompt = `You are a highly advanced Agricultural AI Chatbot strictly following official Indian government advisories.
You are talking to a farmer growing ${crop || 'Tomato'} at the ${cropStage || 'Vegetative'} stage in ${locationName}.

Official Grounding Data:
- Authority: ${govtAdvisory.issuingAuthority}
- Agro-Climatic Zone: ${govtAdvisory.agroClimaticZone}
- Stage Alert: ${govtAdvisory.stageAlert || 'N/A'}
- Weather Warning: ${govtAdvisory.weatherWarning || 'N/A'}
- Official Recommendations: ${(govtAdvisory.officialRecommendations || []).join('; ')}

Farmer's Question: "${message}"

Respond directly, concisely, and professionally to the farmer's question. 
Always cite the official government authority in your response (e.g., "According to IMD/ICAR...").
If the question is unrelated to farming, politely redirect them.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini Chat API returned ${response.status}`);
    }
    
    const result = await response.json();
    const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I am currently unable to provide advice.";

    res.json({
      reply: replyText,
      advisorySource: govtAdvisory.issuingAuthority,
      isLiveWebScraped: govtAdvisory.isLiveWebScraped,
      liveSourceNote: govtAdvisory.liveSourceNote
    });
  } catch (err) {
    console.error("Planner AI Advisor Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Market Support: Commodities & APMCs list with Uni-Scrapper metadata
app.get('/api/market/meta', (req, res) => {
  const allCommodities = Array.from(
    new Set(
      APMC_MARKETS.flatMap(m => m.supportedCommodities)
    )
  ).sort();

  res.json({
    commodities: allCommodities,
    aliases: COMMODITY_ALIASES,
    boards: Object.values(MANDI_SOURCE_BOARDS),
    vehicles: Object.values(VEHICLE_CONFIGS),
    marketCount: APMC_MARKETS.length,
    markets: APMC_MARKETS.map(m => ({
      id: m.id,
      name: m.name,
      district: m.district,
      state: m.state,
      lat: m.lat,
      lng: m.lng,
      type: m.type,
      sourceSystem: m.sourceSystem,
      sourceBoard: m.sourceBoard,
      sourcePortal: m.sourcePortal,
      sourceUrl: m.sourceUrl,
    }))
  });
});

// Market Support: Vernacular Crop Alias Resolution (Entity Resolution)
app.get('/api/market/resolve-alias', (req, res) => {
  const query = req.query.q || '';
  const resolved = resolveCommodityAlias(query);
  res.json(resolved);
});

// Market Support: Uni-Scrapper Architecture & Data Pipeline Documentation
app.get('/api/market/architecture', (req, res) => {
  res.json({
    title: "National Mandi Intelligence System (Uni-Scrapper) Architecture",
    reference: "https://github.com/vicharanashala/Mandi",
    pipelineSteps: [
      { step: 1, name: "Data Ingestion", desc: "Automated daily scraping from 1 Central OGD portal and 7 State Agricultural Marketing Boards (MSAMB, KRAMA, PSAMB, UPSAMB, AP eMarket, MEGAMB)." },
      { step: 2, name: "Cleansing & Normalization", desc: "Converts heterogeneous units to metric quintals (100 kg), cleans currency symbols ('Rs', '₹', '/Qtl'), normalizes dates." },
      { step: 3, name: "Entity Resolution", desc: "Maps vernacular crop aliases in Hindi, Marathi, Telugu, Kannada, Punjabi to canonical commodities (e.g. Batata -> Potato, Kanda -> Onion)." },
      { step: 4, name: "Sanity Quality Validation", desc: "Verifies Min Price <= Modal Price <= Max Price and removes anomalous outlier records." },
      { step: 5, name: "Deterministic Economics", desc: "Computes transport costs, vehicle trips, mandi cess, labor fees, and expected net returns using mathematical application logic." }
    ],
    supportedBoards: Object.values(MANDI_SOURCE_BOARDS),
    totalApmcsMonitored: APMC_MARKETS.length
  });
});

// ScraperAPI Gateway: Status & proxy health
app.get('/api/scraper/status', async (req, res) => {
  try {
    const status = await getScraperApiStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ScraperAPI Gateway: Live Agmarknet 2.0 Commodities
app.get('/api/scraper/agmarknet-commodities', async (req, res) => {
  try {
    const result = await fetchAgmarknetCommodities();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ScraperAPI Gateway: Proxy institutional URL
app.post('/api/scraper/proxy', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const result = await fetchViaScraperApi(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market Support: Compare mandis & run sensitivity analysis
app.post('/api/market/compare', async (req, res) => {
  try {
    const {
      commodity,
      quantity,
      farmerLat,
      farmerLng,
      farmerLocation,
      vehicleType,
      customRatePerKm,
      customLaborRate,
      otherCostsPerQtl,
      filterBoard,
      maxDistanceKm
    } = req.body;

    const result = await getMarketComparison({
      commodity,
      quantity,
      farmerLat,
      farmerLng,
      farmerLocation,
      vehicleType,
      customRatePerKm,
      customLaborRate,
      otherCostsPerQtl,
      filterBoard,
      maxDistanceKm
    });

    res.json(result);
  } catch (err) {
    console.error("Market comparison error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crop Health: Diagnose image (supports both multipart upload & base64)
app.post('/api/crop-health/analyze', upload.single('image'), async (req, res) => {
  try {
    let imageBase64 = req.body.imageBase64;

    if (req.file) {
      const mime = req.file.mimetype || 'image/jpeg';
      imageBase64 = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
    }

    const cropHint = req.body.cropHint || '';
    const symptomsObserved = req.body.symptomsObserved || '';
    const geminiApiKey = req.headers['x-gemini-key'] || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
    const sampleId = req.body.sampleId || null;

    const diagnosis = await analyzeCropImage({
      imageBase64,
      cropHint,
      symptomsObserved,
      geminiApiKey,
      sampleId
    });

    res.json(diagnosis);
  } catch (err) {
    console.error("Crop health analysis error:", err);
    res.status(500).json({
      status: "UNSURE",
      error: err.message,
      data: {
        condition: "UNSURE",
        confidence: 0,
        reason: "An error occurred while evaluating the image. Please retry with a clear photo."
      }
    });
  }
});

// Presets for quick evaluation & testing
app.get('/api/crop-health/samples', (req, res) => {
  res.json({
    samples: [
      { id: "tomato_late_blight", title: "Tomato Late Blight (Water-soaked lesions & mold)", crop: "Tomato" },
      { id: "wheat_yellow_rust", title: "Wheat Yellow Rust (Linear bright yellow pustules)", crop: "Wheat" },
      { id: "cotton_leaf_curl", title: "Cotton Leaf Curl Virus (Vein thickening & enations)", crop: "Cotton" },
      { id: "rice_blast", title: "Rice Blast (Spindle eye lesions & neck necrosis)", crop: "Paddy / Rice" },
      { id: "healthy_plant", title: "Healthy Foliage (Vigorous green chlorophyll)", crop: "Field Crop" },
      { id: "unsure_sample", title: "Blurry / Ambiguous Image (Reliability Guard test)", crop: "Unknown" },
    ]
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Export the Express API
export default app;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🌾 AgriIntel backend server running on http://localhost:${PORT}`);
  });
}

