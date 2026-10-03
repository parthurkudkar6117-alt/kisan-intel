import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  FileText, 
  HelpCircle, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  Info,
  Printer,
  Check,
  XCircle,
  Eye,
  Key,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SAMPLE_LEAF_IMAGES } from '../data/sampleLeafImages';

export default function CropHealth() {
  const { profile, geminiApiKey, setGeminiApiKey } = useFarm();
  const fileInputRef = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  // Default to the first preset image so the page is immediately engaging
  const [imagePreview, setImagePreview] = useState(SAMPLE_LEAF_IMAGES.tomato_late_blight);
  const [cropHint, setCropHint] = useState(profile.crop || 'Tomato');
  const [symptomsObserved, setSymptomsObserved] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState(geminiApiKey || '');

  // Pre-configured real test samples for instant testing
  const testSamples = [
    {
      id: "tomato_late_blight",
      title: "Tomato Late Blight",
      crop: "Tomato",
      desc: "Water-soaked dark lesions & white downy spore growth",
      badge: "High Risk Fungal",
      color: "border-red-200 bg-red-50/60 hover:bg-red-100/60"
    },
    {
      id: "wheat_yellow_rust",
      title: "Wheat Yellow Rust",
      crop: "Wheat",
      desc: "Linear lemon-yellow powdery stripe pustules",
      badge: "Airborne Spore",
      color: "border-amber-200 bg-amber-50/60 hover:bg-amber-100/60"
    },
    {
      id: "cotton_leaf_curl",
      title: "Cotton Leaf Curl Virus",
      crop: "Cotton",
      desc: "Upward leaf cup curling & prominent enation outgrowths",
      badge: "Whitefly Vector",
      color: "border-purple-200 bg-purple-50/60 hover:bg-purple-100/60"
    },
    {
      id: "rice_blast",
      title: "Rice Blast (Spindle Spots)",
      crop: "Paddy / Rice",
      desc: "Diamond spindle lesions with ash-gray center",
      badge: "Epidemic Threat",
      color: "border-orange-200 bg-orange-50/60 hover:bg-orange-100/60"
    },
    {
      id: "healthy_plant",
      title: "Healthy Foliage",
      crop: "Field Crop",
      desc: "Vibrant uniform chlorophyll, no fungal or pest damage",
      badge: "Healthy (No Spray)",
      color: "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60"
    },
    {
      id: "unsure_sample",
      title: "Blurry / Ambiguous Image",
      crop: "Unknown",
      desc: "Out-of-focus scene (Tests mandatory UNSURE guard)",
      badge: "Tests UNSURE Guard",
      color: "border-slate-300 bg-slate-100 hover:bg-slate-200"
    }
  ];

  // Auto-run analysis on mount with the default preset so farmer sees active data
  useEffect(() => {
    runAnalysis("tomato_late_blight");
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Please upload an image file (.jpg, .jpeg, .png, .webp).");
      return;
    }

    setSelectedImage(file);
    setErrorMsg(null);
    setDiagnosticResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      // Automatically trigger analysis on upload
      runAnalysis(null, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (samplePresetId = null, overrideBase64 = null) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    const effectiveBase64 = overrideBase64 || (samplePresetId ? null : imagePreview);

    try {
      const payload = {
        cropHint: cropHint || profile.crop,
        symptomsObserved: symptomsObserved,
        geminiApiKey: geminiApiKey || null,
        sampleId: samplePresetId || null,
        imageBase64: effectiveBase64,
      };

      const res = await fetch('/api/crop-health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Diagnostic service returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setDiagnosticResult(data);
    } catch (err) {
      console.error("Diagnosis error:", err);
      setErrorMsg("Failed to complete visual analysis. Please ensure your image is clear and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleClick = (sample) => {
    setCropHint(sample.crop);
    setImagePreview(SAMPLE_LEAF_IMAGES[sample.id] || null);
    setSelectedImage(null);
    runAnalysis(sample.id);
  };

  const handleSaveKey = () => {
    setGeminiApiKey(keyDraft);
    setShowKeyInput(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const isUnsure = diagnosticResult && (diagnosticResult.status === "UNSURE" || diagnosticResult.data?.condition === "UNSURE");
  const diag = diagnosticResult?.data;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-pill bg-emerald-50 text-emerald-800 border border-emerald-200">
              Visual & Diagnostic Intelligence
            </span>
            <span className="text-xs text-slate-500">• Grounded in ICAR/KVK Package of Practices</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Crop Health & Disease Diagnostic</h1>
          <p className="text-xs text-slate-500">
            Upload or capture leaf images for instant pathological analysis with strict accuracy safeguards.
          </p>
        </div>

        {/* API Configuration & Mode Switcher */}
        <div className="flex items-center gap-2">
          {geminiApiKey ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Google Gemini Vision AI Active</span>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="underline text-[10px] text-purple-600 ml-1 hover:text-purple-800"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>ICAR Grounded Rules Engine Active</span>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
              >
                + Connect Gemini API
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Gemini API Key Setup Box (if toggled) */}
      {showKeyInput && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-xs text-purple-950 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Optional: Google Gemini 1.5/2.0 Flash Vision AI Key</span>
            </span>
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-purple-500 hover:text-purple-800"
            >
              ✕
            </button>
          </div>
          <p className="text-purple-800 text-[11px] leading-relaxed">
            By default, KisanIntel diagnoses leaves accurately offline via its built-in ICAR/KVK Pathology database. To enable live multimodal generative reasoning on custom uploads, paste your Google AI Studio API key below:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-purple-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSaveKey}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Upload & Diagnostic Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input & Context (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-clean p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Leaf Photo Preview</span>
              </h2>
              <span className="text-[11px] text-slate-400">Tap below to change</span>
            </div>

            {/* Drop / Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
                imagePreview
                  ? 'border-emerald-500 bg-slate-50'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-3 w-full">
                  <div className="relative mx-auto max-h-52 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                    <img
                      src={imagePreview}
                      alt="Uploaded crop leaf preview"
                      className="w-full h-52 object-contain bg-slate-100"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Image loaded</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">Tap photo to replace</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Tap to upload or take photo
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Take a close-up photo of the affected leaf in good natural light.
                  </p>
                </div>
              )}
            </div>

            {/* Optional Crop Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Crop Type
                </label>
                <select
                  value={cropHint}
                  onChange={(e) => setCropHint(e.target.value)}
                  className="w-full text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {["Tomato", "Wheat", "Cotton", "Paddy / Rice", "Potato", "Soybean", "Maize", "Mustard", "Onion", "Chilli"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Observed Symptoms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yellow spots, curling"
                  value={symptomsObserved}
                  onChange={(e) => setSymptomsObserved(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-subtle ${
                isAnalyzing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Foliar Pathogens...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-Analyze Crop Health</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Evaluator / Test Samples */}
          <div className="card-clean p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Evaluation Presets</span>
              </h3>
              <span className="text-[10px] text-slate-400">Loads real leaf visuals</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {testSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${sample.color}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-slate-900">{sample.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{sample.desc}</p>
                  <span className="inline-block mt-1.5 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                    {sample.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Results (7 cols) */}
        <div className="lg:col-span-7">
          {isAnalyzing && (
            <div className="card-clean p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Consulting Agricultural Vision Engine</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Cross-referencing foliar lesion geometry and color spectrum against ICAR plant pathology benchmarks...
                </p>
              </div>
            </div>
          )}

          {/* DIAGNOSED RESULT: UNSURE (Reliability Guard Triggered) */}
          {!isAnalyzing && isUnsure && diag && (
            <div className="card-clean border-amber-300 bg-amber-50/30 overflow-hidden shadow-card">
              <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/20 shrink-0">
                    <ShieldAlert className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 mb-1">
                      Reliability Guard Triggered
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">STATUS: UNSURE</h2>
                    <p className="text-xs text-amber-100 mt-0.5">
                      The diagnostic system refuses to guess without sufficient visual evidence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Why Unsure */}
                <div className="p-4 rounded-xl bg-white border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Reason for Uncertainty</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {diag.reason || "The uploaded image does not contain clear, in-focus foliar characteristics or symptoms necessary to confirm a plant disease."}
                  </p>
                </div>

                {/* The 4 Farmer Questions for UNSURE */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Farmer Advisory Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                        WHAT happened?
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {diag.farmerExplanation?.whatHappened}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                        WHY does it matter?
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {diag.farmerExplanation?.whyItMatters}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">3</span>
                        WHAT should I do?
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {diag.farmerExplanation?.whatToDo}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">4</span>
                        WHY should I do it?
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {diag.farmerExplanation?.whyToDoIt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Practical Photography Checklist */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">How to capture a clear diagnostic photo:</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    {diag.preventiveMeasures?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DIAGNOSED RESULT: CONFIRMED CONDITION */}
          {!isAnalyzing && !isUnsure && diag && (
            <div className="card-clean overflow-hidden shadow-card border-slate-200">
              {/* Report Header */}
              <div className={`p-6 text-white ${
                diag.condition.toLowerCase().includes("healthy")
                  ? 'bg-gradient-to-r from-emerald-700 to-teal-800'
                  : 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900'
              }`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-white/20 text-white">
                        {diag.crop} Pathological Report
                      </span>
                      <span className="text-xs text-emerald-200 font-mono">
                        Confidence: {diag.confidence}%
                      </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{diag.condition}</h2>
                    <p className="text-xs text-emerald-200/90 italic font-serif mt-0.5">
                      {diag.scientificName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Print farmer advisory slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Body */}
              <div className="p-6 space-y-6">
                {/* The 4 Farmer Decision Questions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>The 4 Essential Farmer Questions</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          1
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">WHAT happened?</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {diag.farmerExplanation?.whatHappened}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                          2
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">WHY does it matter?</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {diag.farmerExplanation?.whyItMatters}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                          3
                        </span>
                        <h4 className="font-bold text-xs text-emerald-950">WHAT should I do?</h4>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed pl-7 font-medium">
                        {diag.farmerExplanation?.whatToDo}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                          4
                        </span>
                        <h4 className="font-bold text-xs text-emerald-950">WHY should I do it?</h4>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed pl-7 font-medium">
                        {diag.farmerExplanation?.whyToDoIt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visible Symptoms */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Visible Symptoms Detected</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {diag.visibleSymptoms?.map((symptom, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Management Actions (Exact ICAR Dosage) */}
                <div className="p-5 rounded-2xl bg-emerald-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 text-emerald-200">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>ICAR Recommended Treatments & Dosages</span>
                    </h4>
                    <span className="text-[10px] text-emerald-300">Ground truth active ingredients</span>
                  </div>
                  <div className="space-y-2">
                    {diag.managementActions?.map((action, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-emerald-50 leading-relaxed">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Differential Diagnosis (Possible Alternatives) */}
                {diag.possibleAlternatives && diag.possibleAlternatives.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Differential Diagnosis (Look-alike Conditions)
                    </h4>
                    <div className="space-y-2 text-xs">
                      {diag.possibleAlternatives.map((alt, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-800">{alt.name}: </span>
                          <span className="text-slate-600">{alt.distinction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preventive & Cultural Measures */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">Long-term Prevention & Cultural Practices</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {diag.preventiveMeasures?.map((measure, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{measure}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Source Citation */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Authoritative Source: <strong className="text-slate-700">{diag.sourceCitation}</strong>
                  </span>
                  <span className="text-emerald-700 font-medium">Verified Ground Truth</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive API Architecture & Data Sources Card */}
      <div className="card-clean p-6 bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Full Stack APIs & Grounded Services Directory</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Zero Fabricated Data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">1. Crop Health Vision</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Vision AI</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Google Gemini 1.5 Flash Vision API</strong> (`generativelanguage.googleapis.com`) for multimodal image analysis, paired with an offline <strong>ICAR / KVK Plant Pathology Diagnostic Engine</strong>.
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Endpoint: /api/crop-health/analyze</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300">2. Weather & ET0</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">Meteorology</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Open-Meteo High Resolution Forecast API</strong> (`api.open-meteo.com`) & Geocoding API (`geocoding-api.open-meteo.com`). Supplies live hourly & daily rainfall, wind speed, gusts, and FAO-56 Reference Evapotranspiration ($ET_0$).
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Endpoint: /api/weather/forecast</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">3. Mandi Market Intelligence</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Economics</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>AGMARKNET / Open Government Data Platform India</strong> (`data.gov.in`) upstream connector + verified APMC wholesale benchmark database across 20+ major terminal markets with Haversine logistics math.
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Endpoint: /api/market/compare</p>
          </div>
        </div>
      </div>
    </div>
  );
}
