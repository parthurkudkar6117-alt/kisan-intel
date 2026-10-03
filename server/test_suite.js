/**
 * Automated Verification Suite for KisanIntel
 * Validates Crop Health, Market Support, and Daily Farm Planner end-to-end.
 */

async function runTestSuite() {
  console.log("🧪 Starting KisanIntel Automated Verification Suite...\n");
  const baseUrl = "http://localhost:5000";
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    assert(data.status === "ok", "Server health check returns ok");
  } catch (e) {
    assert(false, `Health check failed: ${e.message}`);
  }

  // 2. Geocoding / Location search
  try {
    const res = await fetch(`${baseUrl}/api/locations/search?q=Karnal`);
    const data = await res.json();
    assert(data.results && data.results.length > 0, "Location search returns results for 'Karnal'");
    assert(data.results[0].lat && data.results[0].lng, "Location contains valid latitude and longitude");
  } catch (e) {
    assert(false, `Location search failed: ${e.message}`);
  }

  // 3. Live Weather Forecast
  try {
    const res = await fetch(`${baseUrl}/api/weather/forecast?lat=29.6857&lng=76.9905`);
    const data = await res.json();
    assert(data.current && data.current.temp !== undefined, "Live weather returns current temperature");
    assert(data.daily && data.daily.length === 7, "Weather returns 7 days of daily forecasts");
    assert(data.daily[0].et0Mm > 0, "FAO-56 ET0 evapotranspiration is calculated");
  } catch (e) {
    assert(false, `Weather forecast failed: ${e.message}`);
  }

  // 4. Daily Planner Generation
  try {
    const res = await fetch(`${baseUrl}/api/planner/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crop: "Wheat",
        cropStage: "Crown Root Initiation (CRI)",
        sowingDate: "2026-09-01",
        soilType: "Loam",
        irrigationType: "Drip",
        location: { name: "Karnal, Haryana", lat: 29.6857, lng: 76.9905 }
      })
    });
    const data = await res.json();
    assert(data.dayPlans && data.dayPlans.length === 7, "Planner produces 7-day schedule");
    assert(data.dayPlans[0].spraying && data.dayPlans[0].spraying.status, "Each day contains spraying safety evaluation");
    assert(data.dayPlans[0].irrigation && data.dayPlans[0].irrigation.status, "Each day contains ET0 irrigation evaluation");
    assert(data.dayPlans[0].tasks && data.dayPlans[0].tasks.length > 0, "Each day contains actionable agronomic tasks");
  } catch (e) {
    assert(false, `Planner generation failed: ${e.message}`);
  }

  // 5. Market Decision Support
  try {
    const res = await fetch(`${baseUrl}/api/market/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commodity: "Tomato",
        quantity: 45,
        farmerLat: 20.0110,
        farmerLng: 73.7903,
        farmerLocation: "Nashik, Maharashtra",
        vehicleType: "bolero",
        customRatePerKm: 20,
        customLaborRate: 18,
        otherCostsPerQtl: 10
      })
    });
    const data = await res.json();
    assert(data.rankedMarkets && data.rankedMarkets.length >= 3, "Market advisor returns ranked APMC markets");
    assert(data.bestMarket && data.bestMarket.economics.expectedNetReturn > 0, "Expected net return is calculated deterministically");
    assert(data.explanation && data.explanation.length > 20, "Dynamic economic explanation is generated");
    assert(data.trendHistory && data.trendHistory.length === 30, "30-day historical price movement points generated");

    // Verify mathematical integrity
    const m = data.bestMarket;
    const expectedGross = m.priceData.modalPrice * 45;
    assert(m.economics.grossSaleValue === expectedGross, `Gross sale value math matches: ${m.economics.grossSaleValue} == ${expectedGross}`);
    const expectedNet = m.economics.grossSaleValue - m.economics.totalCost;
    assert(m.economics.expectedNetReturn === expectedNet, `Net return math matches: ${m.economics.expectedNetReturn} == ${expectedNet}`);
  } catch (e) {
    assert(false, `Market decision support failed: ${e.message}`);
  }

  // 6. Crop Health: Confirmed Condition Diagnosis
  try {
    const res = await fetch(`${baseUrl}/api/crop-health/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: "tomato_late_blight" })
    });
    const data = await res.json();
    assert(data.status === "DIAGNOSED", "Sample condition is diagnosed");
    assert(data.data.condition === "Late Blight", "Correctly identifies Late Blight");
    assert(data.data.confidence >= 90, "Confidence score is high for clear pathology");
    assert(data.data.farmerExplanation.whatHappened && data.data.farmerExplanation.whyItMatters, "The 4 farmer questions are populated");
    assert(data.data.managementActions && data.data.managementActions.length > 0, "Provides ICAR verified treatments");
  } catch (e) {
    assert(false, `Crop health diagnosis failed: ${e.message}`);
  }

  // 7. Crop Health: Strict UNSURE Reliability Guard
  try {
    const res = await fetch(`${baseUrl}/api/crop-health/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: "unsure_sample" })
    });
    const data = await res.json();
    assert(data.status === "UNSURE", "Reliability guard correctly returns 'UNSURE' on ambiguous image");
    assert(data.data.condition === "UNSURE", "Condition is explicitly flagged as 'UNSURE'");
    assert(data.data.confidence === 0, "Confidence is zero, avoiding guesswork");
    assert(data.data.farmerExplanation.whatToDo.includes("photo"), "Advises farmer on how to retake a proper photo");
  } catch (e) {
    assert(false, `Crop health UNSURE guard test failed: ${e.message}`);
  }

  // 8. Farmer AI Chatbot Assistant
  try {
    const res = await fetch(`${baseUrl}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Can I spray pesticide tomorrow?",
        farmProfile: {
          crop: "Tomato",
          cropStage: "Flowering & Fruit Set",
          location: { name: "Nashik, Maharashtra", lat: 20.011, lng: 73.7903 }
        },
        language: "en"
      })
    });
    const data = await res.json();
    assert(data.reply && data.reply.length > 20, "Kisan Sahayak AI provides structured response");
    assert(data.source && data.source.length > 0, "AI response includes grounded data source");
  } catch (e) {
    assert(false, `Farmer chatbot test failed: ${e.message}`);
  }

  console.log(`\n========================================`);

  console.log(`Suite finished: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTestSuite();
