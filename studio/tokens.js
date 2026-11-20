/**
 * Token scale generation, WCAG contrast calculation, and :root CSS output.
 */
(() => {
  const STEPS = [
    { step: 50,  lightness: 96, satAdjust: -10 },
    { step: 100, lightness: 91, satAdjust: -5 },
    { step: 200, lightness: 82, satAdjust: 0 },
    { step: 300, lightness: 71, satAdjust: 0 },
    { step: 400, lightness: 60, satAdjust: 0 },
    { step: 500, lightness: 50, satAdjust: 0 },
    { step: 600, lightness: 42, satAdjust: 4 },
    { step: 700, lightness: 34, satAdjust: 6 },
    { step: 800, lightness: 26, satAdjust: 8 },
    { step: 900, lightness: 19, satAdjust: 10 }
  ];

  const colorPicker = document.getElementById("baseColorPicker");
  const hexInput = document.getElementById("baseHexInput");
  const prefixInput = document.getElementById("tokenPrefix");
  const randomBtn = document.getElementById("randomColorBtn");
  const copyCssBtn = document.getElementById("copyCssBtn");
  const swatchGrid = document.getElementById("swatchGrid");
  const cssOutput = document.getElementById("cssOutput");
  const copyStatus = document.getElementById("copyStatus");

  let latestBrandRootCss = "";
  const listeners = new Set();

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

  function showStatus(message) {
    if (!copyStatus) return;
    copyStatus.textContent = message;
    setTimeout(() => {
      copyStatus.textContent = "";
    }, 2000);
  }

  function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  function sanitizePrefix(rawPrefix) {
    const trimmed = String(rawPrefix || "").trim();
    return /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(trimmed) ? trimmed : "brand";
  }

  function createContrastBadge(bgHex, fgHex, titleText, labelText) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.style.backgroundColor = bgHex;
    badge.style.color = fgHex;
    badge.title = titleText;
    badge.textContent = labelText;
    return badge;
  }

  function renderStudio(baseHex) {
    const safeHex = isValidHex(baseHex) ? baseHex.toLowerCase() : "#6366f1";
    const prefix = sanitizePrefix(prefixInput ? prefixInput.value : "brand");
    const scale = generateScale(safeHex);
    const whiteRgb = { r: 255, g: 255, b: 255 };
    const darkRgb = { r: 17, g: 24, b: 39 };

    swatchGrid.replaceChildren();
    const cssLines = [":root {"];
    const internalBrandLines = [":root {"];

    scale.forEach(({ step, hex, rgb }) => {
      const safeStepHex = isValidHex(hex) ? hex.toLowerCase() : safeHex;
      document.documentElement.style.setProperty(`--color-brand-${step}`, safeStepHex);
      internalBrandLines.push(`  --color-brand-${step}: ${safeStepHex};`);
      cssLines.push(`  --color-${prefix}-${step}: ${safeStepHex};`);

      const whiteRatio = getContrastRatio(rgb, whiteRgb);
      const darkRatio = getContrastRatio(rgb, darkRgb);
      const whitePass = whiteRatio >= 4.5;
      const darkPass = darkRatio >= 4.5;

      const card = document.createElement("div");
      card.className = "swatch-card";

      const colorBox = document.createElement("div");
      colorBox.className = "swatch-color";
      colorBox.style.backgroundColor = safeStepHex;

      const badges = document.createElement("div");
      badges.className = "contrast-badges";
      badges.append(
        createContrastBadge(
          "#ffffff",
          "#111827",
          `Contrast vs White: ${whiteRatio.toFixed(2)}`,
          `W ${whitePass ? "AA" : whiteRatio.toFixed(1)}`
        ),
        createContrastBadge(
          "#111827",
          "#ffffff",
          `Contrast vs Dark: ${darkRatio.toFixed(2)}`,
          `D ${darkPass ? "AA" : darkRatio.toFixed(1)}`
        )
      );
      colorBox.appendChild(badges);

      const meta = document.createElement("div");
      meta.className = "swatch-meta";

      const stepEl = document.createElement("div");
      stepEl.className = "swatch-step";
      stepEl.textContent = String(step);

      const hexEl = document.createElement("div");
      hexEl.className = "swatch-hex";
      hexEl.title = "Click to copy hex";
      hexEl.textContent = safeStepHex;
      hexEl.addEventListener("click", () => {
        navigator.clipboard.writeText(safeStepHex);
        showStatus(`Copied ${safeStepHex}`);
      });

      meta.append(stepEl, hexEl);
      card.append(colorBox, meta);
      swatchGrid.appendChild(card);
    });

    cssLines.push("}");
    internalBrandLines.push("}");
    latestBrandRootCss = internalBrandLines.join("\n");
    cssOutput.textContent = cssLines.join("\n");

    listeners.forEach((fn) => fn());
  }

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

  window.StudioTokens = {
    getRootCss: () => latestBrandRootCss,
    getExportCss: () => cssOutput.textContent.trim(),
    onChange: (fn) => listeners.add(fn),
    init: () => renderStudio(colorPicker.value)
  };
})();
