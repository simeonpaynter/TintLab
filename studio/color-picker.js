/**
 * TintLab — Color Scale, WCAG Contrast & Wireframe/Code Runner
 * Generates a 50–900 primitive ramp from a single base hex color,
 * binds live CSS custom properties to the studio preview, and powers
 * the drag/drop wireframe builder + live code executor tab.
 */

const STEPS = [
  { step: 50,  lightness: 96, satAdjust: -10 },
  { step: 100, lightness: 91, satAdjust: -5 },
  { step: 200, lightness: 82, satAdjust: 0 },
  { step: 300, lightness: 71, satAdjust: 0 },
  { step: 400, lightness: 60, satAdjust: 0 },
  { step: 500, lightness: 50, satAdjust: 0 }, // Anchor base
  { step: 600, lightness: 42, satAdjust: 4 },
  { step: 700, lightness: 34, satAdjust: 6 },
  { step: 800, lightness: 26, satAdjust: 8 },
  { step: 900, lightness: 19, satAdjust: 10 }
];

// DOM Elements — Token Generator
const colorPicker = document.getElementById("baseColorPicker");
const hexInput = document.getElementById("baseHexInput");
const prefixInput = document.getElementById("tokenPrefix");
const randomBtn = document.getElementById("randomColorBtn");
const copyCssBtn = document.getElementById("copyCssBtn");
const swatchGrid = document.getElementById("swatchGrid");
const cssOutput = document.getElementById("cssOutput");
const copyStatus = document.getElementById("copyStatus");

// DOM Elements — Tabs, Wireframe Builder & Code Executor
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const canvas = document.getElementById("canvas");
const presetItems = document.querySelectorAll(".component-preset");
const clearCanvasBtn = document.getElementById("clearCanvasBtn");
const loadWireframeHtmlBtn = document.getElementById("loadWireframeHtmlBtn");
const syncFromCanvasBtn = document.getElementById("syncFromCanvasBtn");
const loadTokenCssBtn = document.getElementById("loadTokenCssBtn");
const exportBundleBtn = document.getElementById("exportBundleBtn");
const htmlInput = document.getElementById("html-input");
const cssInput = document.getElementById("css-input");
const jsInput = document.getElementById("js-input");
const resultsOutput = document.getElementById("results-output");

let latestBrandRootCss = "";

// --- Color Conversion Helpers ---

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((val) => Math.max(0, Math.min(255, Math.round(val))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// --- WCAG Contrast Ratio Helpers ---

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// --- Scale Generation & Rendering ---

function generateScale(baseHex) {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return STEPS.map(({ step, lightness, satAdjust }) => {
    if (step === 500) {
      return { step, hex: baseHex.toLowerCase(), rgb };
    }
    const clampedSat = Math.max(5, Math.min(100, hsl.s + satAdjust));
    const stepRgb = hslToRgb(hsl.h, clampedSat, lightness);
    return {
      step,
      hex: rgbToHex(stepRgb.r, stepRgb.g, stepRgb.b),
      rgb: stepRgb
    };
  });
}

function renderStudio(baseHex) {
  const prefix = (prefixInput.value.trim() || "brand").replace(/[^a-zA-Z0-9-_]/g, "");
  const scale = generateScale(baseHex);
  const whiteRgb = { r: 255, g: 255, b: 255 };
  const darkRgb = { r: 17, g: 24, b: 39 };

  swatchGrid.innerHTML = "";
  let cssLines = [`:root {`];
  let internalBrandLines = [`:root {`];

  scale.forEach(({ step, hex, rgb }) => {
    // 1. Update live preview CSS variables on :root
    document.documentElement.style.setProperty(`--color-brand-${step}`, hex);
    internalBrandLines.push(`  --color-brand-${step}: ${hex};`);

    // 2. Append to export CSS string
    cssLines.push(`  --color-${prefix}-${step}: ${hex};`);

    // 3. Calculate WCAG contrast ratios
    const whiteRatio = getContrastRatio(rgb, whiteRgb);
    const darkRatio = getContrastRatio(rgb, darkRgb);
    const whitePass = whiteRatio >= 4.5;
    const darkPass = darkRatio >= 4.5;

    // 4. Render swatch card
    const card = document.createElement("div");
    card.className = "swatch-card";
    card.innerHTML = `
      <div class="swatch-color" style="background-color: ${hex};">
        <div class="contrast-badges">
          <span class="badge" style="background:#ffffff; color:#111827;" title="Contrast vs White: ${whiteRatio.toFixed(2)}">
            W ${whitePass ? "AA" : whiteRatio.toFixed(1)}
          </span>
          <span class="badge" style="background:#111827; color:#ffffff;" title="Contrast vs Dark: ${darkRatio.toFixed(2)}">
            D ${darkPass ? "AA" : darkRatio.toFixed(1)}
          </span>
        </div>
      </div>
      <div class="swatch-meta">
        <div class="swatch-step">${step}</div>
        <div class="swatch-hex" title="Click to copy hex">${hex}</div>
      </div>
    `;

    card.querySelector(".swatch-hex").addEventListener("click", () => {
      navigator.clipboard.writeText(hex);
      showStatus(`Copied ${hex}`);
    });

    swatchGrid.appendChild(card);
  });

  cssLines.push(`}`);
  internalBrandLines.push(`}`);
  latestBrandRootCss = internalBrandLines.join("\n");
  cssOutput.textContent = cssLines.join("\n");

  // Keep live code runner synced with updated brand tokens
  runResults();
}

function showStatus(message) {
  copyStatus.textContent = message;
  setTimeout(() => {
    copyStatus.textContent = "";
  }, 2000);
}

function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// --- Tab Navigation ---

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    tabPanels.forEach((panel) => {
      panel.hidden = true;
    });

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    const targetPanel = document.getElementById(btn.getAttribute("aria-controls"));
    if (targetPanel) {
      targetPanel.hidden = false;
    }
  });
});

// --- Wireframe Drag & Drop Builder ---

const COMPONENT_TEMPLATES = {
  header: `<header class="wf-header">
  <strong>Brand Studio</strong>
  <nav><a href="#features">Features</a> · <a href="#contact">Contact</a></nav>
</header>`,
  hero: `<section class="wf-hero">
  <span class="wf-badge">New Release</span>
  <h2>Build with Semantic Tokens</h2>
  <p>Assemble responsive layouts bound directly to your generated TintLab scale.</p>
</section>`,
  button: `<div class="wf-actions">
  <button type="button" class="wf-btn-primary">Primary Action</button>
</div>`,
  card: `<article class="wf-card">
  <h3>Content Card</h3>
  <p>Structured content block styled with your active brand tokens.</p>
</article>`
};

const DEFAULT_WIREFRAME_CSS = `body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}
.wf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-brand-700);
  color: #ffffff;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}
.wf-header a {
  color: var(--color-brand-100);
  text-decoration: none;
  font-size: 0.85rem;
}
.wf-hero {
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
}
.wf-badge {
  display: inline-block;
  background: var(--color-brand-100);
  color: var(--color-brand-800);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}
.wf-hero h2 {
  margin: 0.5rem 0 0.35rem;
  color: var(--color-brand-900);
  font-size: 1.2rem;
}
.wf-hero p, .wf-card p {
  margin: 0;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.45;
}
.wf-actions {
  margin-bottom: 0.75rem;
}
.wf-btn-primary {
  background: var(--color-brand-600);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  min-height: 44px;
  padding: 0 1.25rem;
  font-weight: 600;
  cursor: pointer;
}
.wf-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
.wf-card h3 {
  margin: 0 0 0.35rem;
  color: var(--color-brand-800);
  font-size: 1rem;
}`;

presetItems.forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", item.dataset.type);
  });
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
  canvas.classList.add("drag-over");
});

canvas.addEventListener("dragleave", () => {
  canvas.classList.remove("drag-over");
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  canvas.classList.remove("drag-over");
  const type = e.dataTransfer.getData("text/plain");
  if (COMPONENT_TEMPLATES[type]) {
    canvas.insertAdjacentHTML("beforeend", COMPONENT_TEMPLATES[type]);
  }
});

function syncCanvasToEditor() {
  htmlInput.value = canvas.innerHTML.trim();
  if (!cssInput.value.trim()) {
    cssInput.value = DEFAULT_WIREFRAME_CSS;
  }
  runResults();
}

clearCanvasBtn.addEventListener("click", () => {
  canvas.innerHTML = "";
});

loadWireframeHtmlBtn.addEventListener("click", syncCanvasToEditor);
syncFromCanvasBtn.addEventListener("click", syncCanvasToEditor);

loadTokenCssBtn.addEventListener("click", () => {
  const tokenBlock = cssOutput.textContent.trim();
  if (!cssInput.value.includes(tokenBlock)) {
    cssInput.value = `${tokenBlock}\n\n${cssInput.value}`.trim();
  }
  runResults();
});

exportBundleBtn.addEventListener("click", () => {
  const bundle = buildPreviewDocument();
  navigator.clipboard.writeText(bundle);
  exportBundleBtn.textContent = "Copied!";
  setTimeout(() => {
    exportBundleBtn.textContent = "Copy HTML Bundle";
  }, 1800);
});

// --- Live Code Executor ---

function buildPreviewDocument() {
  const htmlCode = htmlInput.value;
  const userCss = cssInput.value;
  const jsCode = jsInput.value;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
${latestBrandRootCss}
${userCss}
  </style>
</head>
<body>
${htmlCode}
<script>
try {
${jsCode}
} catch (err) {
  console.error(err);
}
<\/script>
</body>
</html>`;
}

function runResults() {
  if (!resultsOutput) return;
  resultsOutput.srcdoc = buildPreviewDocument();
}

[htmlInput, cssInput, jsInput].forEach((editor) => {
  editor.addEventListener("input", runResults);
});

// --- Token Event Listeners ---

colorPicker.addEventListener("input", (e) => {
  const val = e.target.value;
  hexInput.value = val;
  renderStudio(val);
});

hexInput.addEventListener("input", (e) => {
  let val = e.target.value.trim();
  if (!val.startsWith("#")) val = "#" + val;
  if (isValidHex(val)) {
    colorPicker.value = val;
    renderStudio(val);
  }
});

prefixInput.addEventListener("input", () => {
  if (isValidHex(colorPicker.value)) {
    renderStudio(colorPicker.value);
  }
});

randomBtn.addEventListener("click", () => {
  const randomHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  colorPicker.value = randomHex;
  hexInput.value = randomHex;
  renderStudio(randomHex);
});

copyCssBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(cssOutput.textContent);
  showStatus("Copied :root CSS!");
});

// Initialize on load
renderStudio(colorPicker.value);
