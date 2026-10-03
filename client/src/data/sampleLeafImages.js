/**
 * High-fidelity visual representations of crop foliar conditions
 * Used for instant visual verification, testing, and UI preview.
 */

// Helper to encode SVG to clean data URL
function svgToDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_LEAF_IMAGES = {
  tomato_late_blight: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <radialGradient id="leafGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#4ade80"/>
          <stop offset="60%" stop-color="#16a34a"/>
          <stop offset="100%" stop-color="#14532d"/>
        </radialGradient>
        <radialGradient id="lesion1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#261a0f"/>
          <stop offset="50%" stop-color="#452a15"/>
          <stop offset="85%" stop-color="#78350f"/>
          <stop offset="100%" stop-color="#a3e635" stop-opacity="0.3"/>
        </radialGradient>
        <filter id="moldBlur">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>
      <!-- Background Field -->
      <rect width="400" height="300" fill="#f8fafc"/>
      
      <!-- Stem -->
      <path d="M 60 270 Q 140 180 210 110" stroke="#15803d" stroke-width="12" fill="none" stroke-linecap="round"/>
      
      <!-- Tomato Leaf Blade -->
      <path d="M 120 230 C 60 170, 70 90, 160 70 C 230 40, 310 90, 340 170 C 350 220, 270 260, 200 240 C 160 260, 130 250, 120 230 Z" 
            fill="url(#leafGrad)" stroke="#166534" stroke-width="3"/>
      
      <!-- Leaf Veins -->
      <path d="M 120 230 Q 210 160 330 160" stroke="#86efac" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M 170 190 Q 200 130 250 100" stroke="#86efac" stroke-width="2" fill="none" opacity="0.5"/>
      <path d="M 210 175 Q 260 210 300 210" stroke="#86efac" stroke-width="2" fill="none" opacity="0.5"/>
      <path d="M 250 165 Q 290 130 320 120" stroke="#86efac" stroke-width="1.5" fill="none" opacity="0.5"/>
      
      <!-- Late Blight Water-Soaked Necrotic Lesion 1 -->
      <ellipse cx="230" cy="140" rx="45" ry="32" fill="url(#lesion1)" transform="rotate(-15 230 140)"/>
      <!-- Chlorotic Pale Yellow Halo -->
      <path d="M 180 130 Q 220 95 275 125 Q 285 165 240 175 Q 185 170 180 130 Z" fill="none" stroke="#facc15" stroke-width="4" opacity="0.75"/>
      <!-- White Downy Mildew / Sporulation on margin -->
      <circle cx="215" cy="130" r="14" fill="#ffffff" opacity="0.45" filter="url(#moldBlur)"/>
      <circle cx="240" cy="150" r="10" fill="#ffffff" opacity="0.4" filter="url(#moldBlur)"/>
      <circle cx="260" cy="135" r="8" fill="#ffffff" opacity="0.35" filter="url(#moldBlur)"/>
      
      <!-- Secondary Lesion 2 near tip -->
      <ellipse cx="295" cy="175" rx="28" ry="20" fill="url(#lesion1)" transform="rotate(20 295 175)"/>
      <circle cx="300" cy="175" r="7" fill="#ffffff" opacity="0.4" filter="url(#moldBlur)"/>
      
      <!-- Label Banner -->
      <rect x="15" y="15" width="220" height="30" rx="8" fill="#0f172a" opacity="0.85"/>
      <text x="25" y="35" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Tomato: Late Blight (Water-Soaked)</text>
    </svg>
  `),

  wheat_yellow_rust: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <!-- Background -->
      <rect width="400" height="300" fill="#f8fafc"/>
      
      <!-- Wheat Leaf Blade (Long linear strap) -->
      <path d="M 30 250 C 90 200, 180 140, 270 90 C 320 60, 360 40, 380 30 C 370 50, 330 90, 280 140 C 200 210, 100 270, 40 280 Z" 
            fill="#22c55e" stroke="#15803d" stroke-width="2"/>
            
      <!-- Linear Vein Grooves -->
      <path d="M 35 265 Q 200 150 375 35" stroke="#16a34a" stroke-width="1.5" fill="none"/>
      <path d="M 45 260 Q 210 145 370 40" stroke="#166534" stroke-width="1.5" fill="none"/>
      
      <!-- Yellow Rust Linear Stripe Pustules (Puccinia striiformis) -->
      <!-- Stripe 1 -->
      <g fill="#eab308">
        <circle cx="120" cy="205" r="3"/><circle cx="128" cy="199" r="3.5"/><circle cx="136" cy="193" r="3.2"/>
        <circle cx="144" cy="187" r="3.5"/><circle cx="152" cy="181" r="3.5"/><circle cx="160" cy="175" r="3.2"/>
        <circle cx="168" cy="169" r="3.5"/><circle cx="176" cy="163" r="3"/><circle cx="184" cy="157" r="3.2"/>
      </g>
      <!-- Stripe 2 (Parallel Linear) -->
      <g fill="#facc15">
        <circle cx="150" cy="195" r="3"/><circle cx="158" cy="189" r="3.5"/><circle cx="166" cy="183" r="3.5"/>
        <circle cx="174" cy="177" r="3.8"/><circle cx="182" cy="171" r="3.5"/><circle cx="190" cy="165" r="3.5"/>
        <circle cx="198" cy="159" r="3.2"/><circle cx="206" cy="153" r="3.5"/><circle cx="214" cy="147" r="3"/>
        <circle cx="222" cy="141" r="3.2"/><circle cx="230" cy="135" r="3.5"/><circle cx="238" cy="129" r="3"/>
      </g>
      <!-- Stripe 3 -->
      <g fill="#ca8a04">
        <circle cx="210" cy="155" r="3.2"/><circle cx="218" cy="149" r="3.5"/><circle cx="226" cy="143" r="3.5"/>
        <circle cx="234" cy="137" r="3.8"/><circle cx="242" cy="131" r="3.2"/><circle cx="250" cy="125" r="3.5"/>
        <circle cx="258" cy="119" r="3.5"/><circle cx="266" cy="113" r="3.2"/>
      </g>
      
      <!-- Ruptured chlorotic tissue -->
      <path d="M 120 205 L 266 113" stroke="#fef08a" stroke-width="7" opacity="0.3" fill="none"/>
      
      <!-- Label -->
      <rect x="15" y="15" width="230" height="30" rx="8" fill="#0f172a" opacity="0.85"/>
      <text x="25" y="35" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Wheat: Yellow Rust (Linear Stripes)</text>
    </svg>
  `),

  cotton_leaf_curl: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#f8fafc"/>
      <!-- Cotton Palmate Leaf Blade with Curled Lobes -->
      <path d="M 80 240 C 50 180, 50 100, 110 80 C 140 70, 170 100, 190 70 C 220 30, 270 50, 280 110 C 310 110, 350 140, 330 190 C 310 230, 230 250, 190 220 C 150 250, 100 260, 80 240 Z" 
            fill="#15803d" stroke="#14532d" stroke-width="3"/>
            
      <!-- Thickened Pale Veins (Characteristic of Begomovirus / CLCuD) -->
      <path d="M 90 230 Q 180 170 270 110" stroke="#fef08a" stroke-width="5" fill="none"/>
      <path d="M 180 170 Q 150 110 120 90" stroke="#fef08a" stroke-width="4.5" fill="none"/>
      <path d="M 180 170 Q 240 160 310 180" stroke="#fef08a" stroke-width="4" fill="none"/>
      <path d="M 180 170 Q 210 100 240 70" stroke="#fef08a" stroke-width="4.5" fill="none"/>
      
      <!-- Leaf margin curling shading -->
      <path d="M 110 80 Q 140 60 170 90" stroke="#84cc16" stroke-width="8" opacity="0.6" fill="none"/>
      <path d="M 280 110 Q 330 125 320 180" stroke="#84cc16" stroke-width="8" opacity="0.6" fill="none"/>
      
      <!-- Enation outgrowths (Bottom cup-like formations) -->
      <ellipse cx="205" cy="140" rx="14" ry="9" fill="#a3e635" stroke="#4d7c0f" stroke-width="1.5"/>
      <ellipse cx="160" cy="130" rx="12" ry="7" fill="#a3e635" stroke="#4d7c0f" stroke-width="1.5"/>
      
      <!-- Label -->
      <rect x="15" y="15" width="240" height="30" rx="8" fill="#0f172a" opacity="0.85"/>
      <text x="25" y="35" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Cotton: Leaf Curl Virus (Thick Veins)</text>
    </svg>
  `),

  rice_blast: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#f8fafc"/>
      <!-- Rice Blade -->
      <path d="M 20 220 Q 180 170 380 90 Q 280 180 30 250 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
      
      <!-- Diamond / Spindle-shaped lesions (Magnaporthe oryzae) -->
      <!-- Lesion 1 -->
      <path d="M 130 185 Q 160 170 190 175 Q 160 185 130 185 Z" fill="#78350f"/>
      <polygon points="135,183 160,172 185,174 160,183" fill="#cbd5e1" stroke="#991b1b" stroke-width="2"/>
      
      <!-- Lesion 2 (Center Spindle) -->
      <polygon points="210,155 245,138 280,143 245,158" fill="#e2e8f0" stroke="#7f1d1d" stroke-width="2.5"/>
      <circle cx="245" cy="148" r="3" fill="#475569"/>
      
      <!-- Lesion 3 Small -->
      <polygon points="280,132 305,120 330,123 305,134" fill="#cbd5e1" stroke="#991b1b" stroke-width="2"/>
      
      <!-- Chlorotic Halo -->
      <ellipse cx="245" cy="148" rx="45" ry="18" fill="none" stroke="#facc15" stroke-width="2" opacity="0.6"/>
      
      <!-- Label -->
      <rect x="15" y="15" width="220" height="30" rx="8" fill="#0f172a" opacity="0.85"/>
      <text x="25" y="35" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Paddy: Rice Blast (Spindle Lesions)</text>
    </svg>
  `),

  healthy_plant: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <rect width="400" height="300" fill="#f8fafc"/>
      <!-- Vibrant, disease-free healthy leaf -->
      <path d="M 70 240 C 40 150, 90 70, 200 50 C 310 70, 360 150, 330 240 C 260 270, 140 270, 70 240 Z" 
            fill="#16a34a" stroke="#15803d" stroke-width="3"/>
      <!-- Crisp Healthy Green Veins -->
      <path d="M 70 240 Q 200 170 200 50" stroke="#86efac" stroke-width="4" fill="none"/>
      <path d="M 150 180 Q 110 140 90 120" stroke="#86efac" stroke-width="2.5" fill="none"/>
      <path d="M 150 180 Q 250 150 300 130" stroke="#86efac" stroke-width="2.5" fill="none"/>
      <path d="M 180 120 Q 130 90 120 80" stroke="#86efac" stroke-width="2" fill="none"/>
      <path d="M 180 120 Q 250 100 280 90" stroke="#86efac" stroke-width="2" fill="none"/>
      
      <!-- Sunlight Glint -->
      <ellipse cx="230" cy="110" rx="40" ry="20" fill="#ffffff" opacity="0.15" transform="rotate(-25 230 110)"/>
      
      <!-- Label -->
      <rect x="15" y="15" width="220" height="30" rx="8" fill="#14532d" opacity="0.9"/>
      <text x="25" y="35" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Healthy Foliage (Vigorous Green)</text>
    </svg>
  `),

  unsure_sample: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <filter id="heavyBlur">
          <feGaussianBlur stdDeviation="14"/>
        </filter>
      </defs>
      <!-- Blurry, out of focus indoor/unidentifiable scene -->
      <rect width="400" height="300" fill="#94a3b8"/>
      <circle cx="150" cy="120" r="90" fill="#64748b" filter="url(#heavyBlur)"/>
      <circle cx="280" cy="190" r="110" fill="#cbd5e1" filter="url(#heavyBlur)"/>
      <rect x="40" y="80" width="200" height="150" fill="#475569" filter="url(#heavyBlur)"/>
      
      <!-- Question Mark watermark -->
      <text x="180" y="170" font-family="sans-serif" font-size="70" font-weight="bold" fill="#334155" opacity="0.35">?</text>
      
      <!-- Label -->
      <rect x="15" y="15" width="240" height="30" rx="8" fill="#b45309" opacity="0.95"/>
      <text x="25" y="35" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Blurry / Ambiguous (UNSURE Test)</text>
    </svg>
  `)
};
