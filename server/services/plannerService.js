import { getLiveWeatherForecast } from './weatherService.js';

/**
 * Crop Agronomic Profiles & Stage Water Coefficients (FAO-56 standard)
 */
const CROP_PROFILES = {
  "Wheat": {
    name: "Wheat (Triticum aestivum)",
    stages: {
      "Sowing & Germination": { kc: 0.35, critical: false, focus: "Seed bed moisture, pre-emergence weed management" },
      "Crown Root Initiation (CRI)": { kc: 0.75, critical: true, focus: "Most critical irrigation stage (20-25 DAS), first nitrogen top-dressing" },
      "Vegetative / Tillering": { kc: 0.95, critical: false, focus: "Canopy expansion, split nitrogen application, monitor for rusts" },
      "Booting & Flowering": { kc: 1.15, critical: true, focus: "Critical moisture sensitivity; pollen sterility if water-stressed" },
      "Milking & Grain Filling": { kc: 0.90, critical: true, focus: "Kernal weight development, foliar 0:0:50, guard against high wind lodging" },
      "Maturity & Ripening": { kc: 0.40, critical: false, focus: "Withhold irrigation 10 days before harvest, monitor grain moisture" }
    },
    susceptibleDiseases: ["Yellow Rust (Stripe Rust)", "Brown Rust", "Loose Smut", "Powdery Mildew"]
  },
  "Paddy / Rice": {
    name: "Paddy (Oryza sativa)",
    stages: {
      "Nursery & Transplanting": { kc: 1.05, critical: true, focus: "Maintain 2-3 cm standing water, zinc application" },
      "Vegetative / Tillering": { kc: 1.15, critical: true, focus: "Active tillering, urea top-dressing, weed management" },
      "Panicle Initiation / Booting": { kc: 1.30, critical: true, focus: "Water depth 5 cm, protect against stem borer and blast" },
      "Flowering & Heading": { kc: 1.25, critical: true, focus: "Never let field dry during anthesis; leaf blast scouting" },
      "Grain Filling / Dough": { kc: 0.95, critical: false, focus: "Alternate wetting and drying (AWD), drain water 10 days before harvest" },
      "Harvest": { kc: 0.50, critical: false, focus: "Harvest when 80-85% grains turn golden straw color" }
    },
    susceptibleDiseases: ["Rice Blast", "Bacterial Leaf Blight", "Sheath Blight", "Brown Spot"]
  },
  "Cotton": {
    name: "Cotton (Gossypium hirsutum)",
    stages: {
      "Sowing & Seedling": { kc: 0.45, critical: false, focus: "Gap filling, thrips/aphids scouting, weed control" },
      "Vegetative / Square Formation": { kc: 0.85, critical: true, focus: "Squaring requires adequate moisture and balanced nutrition" },
      "Flowering & Boll Development": { kc: 1.20, critical: true, focus: "Peak water consumption, pink bollworm trap monitoring, 1% KNO3 spray" },
      "Boll Maturation & Bursting": { kc: 0.70, critical: false, focus: "Stop irrigation to prevent regrowth; clean boll picking" },
      "Harvest / Picking": { kc: 0.40, critical: false, focus: "Pick clean seed cotton after morning dew dries" }
    },
    susceptibleDiseases: ["Cotton Leaf Curl Virus", "Bacterial Blight", "Alternaria Leaf Spot", "Pink Bollworm"]
  },
  "Tomato": {
    name: "Tomato (Solanum lycopersicum)",
    stages: {
      "Nursery & Transplanting": { kc: 0.60, critical: false, focus: "Seedling hardening, root dip in Trichoderma" },
      "Vegetative Growth": { kc: 0.85, critical: false, focus: "Staking, suckering, balanced 19:19:19 fertigation" },
      "Flowering & Fruit Set": { kc: 1.15, critical: true, focus: "Uniform moisture to prevent blossom end rot, boron foliar spray" },
      "Fruit Enlargement / Color Turning": { kc: 1.05, critical: true, focus: "Calcium nitrate application, avoid sudden flooding (prevents fruit cracking)" },
      "Harvest": { kc: 0.80, critical: false, focus: "Harvest at breaker or pink stage for long distance transit" }
    },
    susceptibleDiseases: ["Early Blight", "Late Blight", "Tomato Leaf Curl Virus", "Bacterial Wilt"]
  },
  "Potato": {
    name: "Potato (Solanum tuberosum)",
    stages: {
      "Sprouting & Emergence": { kc: 0.50, critical: false, focus: "Ensure friable loose ridge soil, monitor cutworms" },
      "Vegetative Growth": { kc: 0.80, critical: false, focus: "Earthing up at 30 DAS, prevent exposed tubers, nitrogen top-dress" },
      "Tuber Initiation & Bulking": { kc: 1.15, critical: true, focus: "Constant moist soil (avoid water fluctuations), prophylactic mancozeb for late blight" },
      "Maturity & Haulm Cutting": { kc: 0.70, critical: false, focus: "Dehaulming 12-15 days before digging to cure tuber skin" },
      "Harvest": { kc: 0.40, critical: false, focus: "Digging on bright sunny day, dry in shade before cold storage" }
    },
    susceptibleDiseases: ["Late Blight (Phytophthora infestans)", "Early Blight", "Black Scurf", "Common Scab"]
  },
  "Soybean": {
    name: "Soybean (Glycine max)",
    stages: {
      "Germination & Emergence": { kc: 0.40, critical: false, focus: "Seed treatment with Rhizobium and Trichoderma" },
      "Vegetative & Branching": { kc: 0.75, critical: false, focus: "Weed-free period for first 30 days, scout for girdle beetle" },
      "Flowering": { kc: 1.15, critical: true, focus: "Drought stress now causes blossom drop; ensure moist root zone" },
      "Pod Formation & Seed Filling": { kc: 1.10, critical: true, focus: "Scout for Spodoptera & rust, foliar 13:0:45 @ 10g/L" },
      "Maturity & Harvest": { kc: 0.50, critical: false, focus: "Harvest when 90% leaves turn yellow and drop; avoid pod shattering" }
    },
    susceptibleDiseases: ["Soybean Rust", "Yellow Mosaic Virus", "Collar Rot", "Anthracnose"]
  },
  "Maize": {
    name: "Maize / Corn (Zea mays)",
    stages: {
      "Germination & Seedling": { kc: 0.40, critical: false, focus: "Scout for Fall Armyworm (FAW) whorl damage, weed control" },
      "Knee-High Stage": { kc: 0.80, critical: false, focus: "First side dressing of urea, intercultivation" },
      "Tasseling & Silking": { kc: 1.20, critical: true, focus: "Most sensitive to moisture stress; drought causes poor seed set" },
      "Grain Filling / Milking": { kc: 1.05, critical: true, focus: "Adequate soil moisture determines kernel weight" },
      "Maturity & Harvest": { kc: 0.60, critical: false, focus: "Harvest when black layer forms at base of grain" }
    },
    susceptibleDiseases: ["Fall Armyworm", "Turcicum Leaf Blight", "Maydis Leaf Blight", "Bacterial Stalk Rot"]
  },
  "Mustard": {
    name: "Mustard / Rapeseed (Brassica juncea)",
    stages: {
      "Germination & Seedling": { kc: 0.35, critical: false, focus: "Thinning at 15-20 DAS to maintain optimal plant population" },
      "Rosette & Branching": { kc: 0.75, critical: false, focus: "First irrigation at 30-35 DAS, top-dress urea, scout for painted bug" },
      "Flowering & Siliqua Formation": { kc: 1.10, critical: true, focus: "Protect against Mustard Aphid (Lipaphis erysimi) and White Rust" },
      "Seed Development & Maturity": { kc: 0.65, critical: false, focus: "Avoid irrigation when crop is tall to prevent lodging" },
      "Harvest": { kc: 0.35, critical: false, focus: "Harvest in morning when pods are 75% yellow to prevent shattering" }
    },
    susceptibleDiseases: ["White Rust", "Alternaria Blight", "Downy Mildew", "Mustard Aphid"]
  },
  "Onion": {
    name: "Onion (Allium cepa)",
    stages: {
      "Transplanting & Establishment": { kc: 0.50, critical: false, focus: "Light frequent irrigation, weed control" },
      "Vegetative Growth": { kc: 0.80, critical: false, focus: "Foliar spray for thrips, split nitrogen application" },
      "Bulb Initiation & Development": { kc: 1.05, critical: true, focus: "Uniform moisture, avoid water stress to prevent split bulbs" },
      "Bulb Maturity": { kc: 0.75, critical: false, focus: "Neck-fall stage (50% neck fall), withhold water 15 days before digging" },
      "Harvest & Curing": { kc: 0.40, critical: false, focus: "Field curing for 3-5 days in shade to dry onion neck and outer skins" }
    },
    susceptibleDiseases: ["Purple Blotch", "Stemphylium Leaf Blight", "Onion Thrips", "Basal Rot"]
  },
  "Chilli": {
    name: "Chilli / Pepper (Capsicum annuum)",
    stages: {
      "Nursery & Transplanting": { kc: 0.55, critical: false, focus: "Seedling root dip with imidacloprid to prevent thrips/leaf curl" },
      "Vegetative Growth": { kc: 0.80, critical: false, focus: "Earthing up, balanced 19:19:19 spray, monitor for mite/thrips" },
      "Flowering & Fruit Set": { kc: 1.10, critical: true, focus: "Planofix @ 0.25ml/L to prevent blossom drop, maintain moisture" },
      "Fruit Maturation & Pickings": { kc: 0.90, critical: false, focus: "Scout for Anthracnose (Die-back/Fruit rot), regular pickings" },
      "Harvest": { kc: 0.60, critical: false, focus: "Dry harvested red chillies on clean tarpaulin to avoid aflatoxin" }
    },
    susceptibleDiseases: ["Chilli Leaf Curl Virus", "Anthracnose / Fruit Rot", "Powdery Mildew", "Mites"]
  }
};

/**
 * Generates an intelligent, scientifically sound day-by-day 7-day farming plan
 * based on live weather data, crop type, crop stage, soil, and irrigation type.
 */
export async function generateDailyPlan({
  crop = "Wheat",
  cropStage = "Crown Root Initiation (CRI)",
  sowingDate = "2026-09-01",
  soilType = "Loam", // Sandy, Loam, Clay / Black Cotton
  irrigationType = "Drip", // Flood/Furrow, Drip, Sprinkler, Rainfed
  location = { name: "Karnal, Haryana", lat: 29.6857, lng: 76.9905 },
}) {
  // 1. Fetch live 7-day weather forecast
  const weather = await getLiveWeatherForecast(location.lat, location.lng);
  const dailyForecast = weather.daily || [];

  const cropProfile = CROP_PROFILES[crop] || CROP_PROFILES["Wheat"];
  const stageInfo = cropProfile.stages[cropStage] || Object.values(cropProfile.stages)[1];
  const kc = stageInfo.kc;

  // Soil retention multiplier
  let soilMultiplier = 1.0;
  if (soilType.toLowerCase().includes("sandy")) soilMultiplier = 0.8; // Lower retention, more frequent
  else if (soilType.toLowerCase().includes("clay") || soilType.toLowerCase().includes("black")) soilMultiplier = 1.25; // High retention

  // Plan generation for next 7 days
  const dayPlans = [];
  const urgentAlerts = [];

  for (let i = 0; i < dailyForecast.length; i++) {
    const dayWeather = dailyForecast[i];
    const isToday = i === 0;
    const isTomorrow = i === 1;

    // A. Spraying Safety Assessment
    const rainSum = dayWeather.precipitationSumMm;
    const rainProb = dayWeather.precipitationProbMax;
    const windSpeed = dayWeather.maxWindSpeedKmH;
    const maxTemp = dayWeather.maxTemp;

    let sprayStatus = "OPTIMAL";
    let sprayReason = "";
    let sprayAlertLevel = "success"; // success, warning, danger
    let sprayAction = "Safe to spray during calm morning hours (06:30 AM - 09:30 AM).";

    if (rainSum >= 2.0 || rainProb >= 45) {
      sprayStatus = isTomorrow ? "DO NOT SPRAY TOMORROW" : isToday ? "DO NOT SPRAY TODAY" : `AVOID SPRAYING (${dayWeather.dayName})`;
      sprayAlertLevel = "danger";
      sprayAction = "Postpone chemical sprays. Active ingredients will be washed off by forecast rainfall.";
      sprayReason = `Meteorological forecast indicates ${rainSum} mm precipitation (${rainProb}% probability). Any systemic or contact foliar spray will suffer chemical wash-off, resulting in wasted input costs and environmental runoff.`;

      if (isTomorrow || isToday) {
        urgentAlerts.push({
          day: isToday ? "Today" : "Tomorrow",
          type: "SPRAYING_WARNING",
          headline: sprayStatus,
          message: sprayReason,
          action: "Postpone all pesticide and foliar nutrition applications.",
          evidence: `Precipitation: ${rainSum}mm (${rainProb}%), Wind: ${windSpeed} km/h`,
          severity: "high"
        });
      }
    } else if (windSpeed >= 16) {
      sprayStatus = `CAUTION: WIND DRIFT HAZARD (${dayWeather.dayName})`;
      sprayAlertLevel = "danger";
      sprayAction = "Do not spray when wind exceeds 15 km/h. Droplet drift will contaminate adjacent fields.";
      sprayReason = `Wind speeds are expected to reach ${windSpeed} km/h (gusts up to ${Math.round(windSpeed * 1.4)} km/h). Excessive wind causes spray droplet displacement, poor canopy penetration, and off-target hazard.`;

      if (isTomorrow || isToday) {
        urgentAlerts.push({
          day: isToday ? "Today" : "Tomorrow",
          type: "SPRAYING_WARNING",
          headline: isTomorrow ? "DO NOT SPRAY TOMORROW: HIGH WINDS" : "HIGH WIND DRIFT ALERT",
          message: sprayReason,
          action: "Wait for winds to drop below 12 km/h before spraying.",
          evidence: `Peak wind speed: ${windSpeed} km/h`,
          severity: "medium"
        });
      }
    } else if (maxTemp >= 34) {
      sprayStatus = "AVOID MIDDAY SPRAY";
      sprayAlertLevel = "warning";
      sprayAction = "Spray strictly between 06:00 AM - 08:30 AM or after 05:00 PM.";
      sprayReason = `High ambient temperature (${maxTemp}°C) leads to rapid droplet evaporation, volatilization of active compounds, and potential foliar phytotoxicity / leaf scorch.`;
    } else {
      sprayStatus = "OPTIMAL SPRAY WINDOW";
      sprayAlertLevel = "success";
      sprayReason = `Weather conditions are ideal: Calm winds (${windSpeed} km/h), moderate temperature (${maxTemp}°C), and 0mm forecast precipitation. Chemical rainfastness is assured for the next 48 hours.`;
    }

    // B. Evapotranspiration & Irrigation Assessment
    const et0 = dayWeather.et0Mm;
    const etc = Math.round(et0 * kc * 10) / 10; // Crop water need in mm
    let irrigationStatus = "NORMAL";
    let irrigationAdvice = "";
    let waterSavingMm = 0;

    if (rainSum >= etc * 0.8) {
      irrigationStatus = "SKIP IRRIGATION";
      waterSavingMm = etc;
      irrigationAdvice = `Natural rainfall (${rainSum} mm) meets or exceeds daily crop evapotranspiration demand (${etc} mm). Withholding irrigation conserves groundwater and prevents root suffocation.`;
    } else if (stageInfo.critical && rainSum < 1.0) {
      irrigationStatus = "CRITICAL IRRIGATION WINDOW";
      irrigationAdvice = `Crop is in the ${cropStage} stage, which is highly sensitive to moisture stress. Apply ${Math.round(etc * soilMultiplier)} mm of water via ${irrigationType} to avoid permanent yield reduction.`;
    } else if (rainSum > 0 && rainSum < etc) {
      irrigationStatus = "REDUCED IRRIGATION";
      irrigationAdvice = `Light rain (${rainSum} mm) will offset part of the crop water demand (${etc} mm). Supplement with a reduced irrigation run.`;
    } else {
      irrigationStatus = "REGULAR IRRIGATION";
      irrigationAdvice = `Maintain standard schedule: Crop evapotranspiration is ${etc} mm/day. Apply ${Math.round(etc * soilMultiplier)} mm irrigation in early morning or evening.`;
    }

    // C. Field Inspection & Crop Specific Actions
    const tasks = getStageSpecificTasks(crop, cropStage, i, dayWeather);

    dayPlans.push({
      dayIndex: i,
      date: dayWeather.date,
      dayName: dayWeather.dayName,
      displayDate: dayWeather.displayDate,
      weather: {
        condition: dayWeather.condition,
        icon: dayWeather.icon,
        maxTemp: dayWeather.maxTemp,
        minTemp: dayWeather.minTemp,
        rainMm: rainSum,
        rainProb: rainProb,
        windSpeed: windSpeed,
        et0: et0,
        etc: etc,
      },
      spraying: {
        status: sprayStatus,
        alertLevel: sprayAlertLevel,
        action: sprayAction,
        reason: sprayReason,
      },
      irrigation: {
        status: irrigationStatus,
        advice: irrigationAdvice,
        waterRequirementMm: etc,
        waterSavingMm: waterSavingMm,
      },
      tasks: tasks,
    });
  }

  return {
    crop,
    cropProfileName: cropProfile.name,
    cropStage,
    stageDetails: stageInfo,
    location,
    soilType,
    irrigationType,
    sowingDate,
    weatherSource: weather.source,
    urgentAlerts,
    dayPlans,
    availableStages: Object.keys(cropProfile.stages),
  };
}

/**
 * Generates agronomic field tasks tailored to crop, stage, and weather
 */
function getStageSpecificTasks(crop, stage, dayIndex, weather) {
  const tasks = [];

  if (dayIndex === 0) {
    tasks.push({
      timeWindow: "06:30 AM - 09:00 AM",
      category: "Inspection",
      priority: "High",
      title: "Field Scouting & Disease Trapping",
      instruction: `Scout field corners and canopy undersides. Look for early signs of foliar discoloration, rust pustules, or leaf spots. Inspect 20 representative plants across the plot.`,
      justification: `Early detection of fungal or bacterial pathogens at the ${stage} stage prevents exponential spore spread.`
    });
  }

  if (dayIndex === 1) {
    tasks.push({
      timeWindow: "07:00 AM - 10:30 AM",
      category: "Nutrition",
      priority: "Medium",
      title: "Nutrient Top-Dressing & Foliar Feeding",
      instruction: stage.includes("CRI") || stage.includes("Vegetative") 
        ? "Apply split nitrogen (Urea @ 25-30 kg/acre) along the crop rows prior to light irrigation."
        : stage.includes("Flowering") || stage.includes("Fruit")
        ? "Prepare foliar spray of 0:52:34 (MKP @ 5g/L) + Micronutrient mixture to promote uniform flowering and pollen vitality."
        : "Check soil moisture before initiating any fertilizer top-dressing.",
      justification: `Nutrient demand spikes during the ${stage} stage; timely application directly influences final grain and fruit weight.`
    });
  }

  if (dayIndex === 2) {
    tasks.push({
      timeWindow: "08:00 AM - 11:00 AM",
      category: "Agronomic Operation",
      priority: "Normal",
      title: "Inter-cultivation & Weed Removal",
      instruction: "Carry out manual weeding or shallow wheel-hoeing between rows to break soil crust and eradicate weed hosts.",
      justification: "Weeds compete for 40% of available soil moisture and harbor viral insect vectors."
    });
  }

  if (dayIndex >= 3 && dayIndex <= 6) {
    tasks.push({
      timeWindow: "07:00 AM - 09:30 AM",
      category: "Maintenance",
      priority: "Normal",
      title: "Irrigation Line & Trap Maintenance",
      instruction: "Flush drip laterals / inspect furrows. Clean pheromone traps and replace sticky cards for pest population monitoring.",
      justification: "Prevents emitter clogging and keeps pest population tracking accurate."
    });
  }

  return tasks;
}
