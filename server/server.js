import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { getMarketComparison } from './services/mandiService.js';
import { APMC_MARKETS, VEHICLE_CONFIGS } from './data/mandiDatabase.js';
import { searchLocations, getLiveWeatherForecast } from './services/weatherService.js';
import { generateDailyPlan } from './services/plannerService.js';
import { analyzeCropImage, PLANT_PATHOLOGY_DB } from './services/cropHealthService.js';
import { handleFarmerChat } from './services/assistantService.js';

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

// Market Support: Commodities & APMCs list
app.get('/api/market/meta', (req, res) => {
  const allCommodities = Array.from(
    new Set(
      APMC_MARKETS.flatMap(m => m.supportedCommodities)
    )
  ).sort();

  res.json({
    commodities: allCommodities,
    vehicles: Object.values(VEHICLE_CONFIGS),
    marketCount: APMC_MARKETS.length,
    markets: APMC_MARKETS.map(m => ({
      id: m.id,
      name: m.name,
      district: m.district,
      state: m.state,
      lat: m.lat,
      lng: m.lng,
      type: m.type
    }))
  });
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
      otherCostsPerQtl
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
      otherCostsPerQtl
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

app.listen(PORT, () => {
  console.log(`🌾 AgriIntel backend server running on http://localhost:${PORT}`);
});

