/**
 * HTML, CSS, and JS editors with dedicated clear buttons and sandboxed iframe preview.
 */
(() => {
  const htmlInput = document.getElementById("html-input");
  const cssInput = document.getElementById("css-input");
  const jsInput = document.getElementById("js-input");
  const resultsOutput = document.getElementById("results-output");

  const syncFromCanvasBtn = document.getElementById("syncFromCanvasBtn");
  const loadTokenCssBtn = document.getElementById("loadTokenCssBtn");
  const exportBundleBtn = document.getElementById("exportBundleBtn");

  const clearHtmlBtn = document.getElementById("clearHtmlBtn");
  const clearCssBtn = document.getElementById("clearCssBtn");
  const clearJsBtn = document.getElementById("clearJsBtn");
  const clearPreviewBtn = document.getElementById("clearPreviewBtn");

function buildPreviewDocument(customHtml, customCss, customJs) {
  const rootCss = window.StudioTokens ? window.StudioTokens.getRootCss() : "";
  const htmlCode = customHtml !== undefined ? customHtml : htmlInput.value;
  const userCss = customCss !== undefined ? customCss : cssInput.value;
  const jsCode = customJs !== undefined ? customJs : jsInput.value;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src data: https:;" />
  <style>
${escapeStyleTag(rootCss)}
${escapeStyleTag(userCss)}
  </style>
</head>
<body>
${htmlCode}
<script>
try {
${escapeScriptTag(jsCode)}
} catch (err) {
  console.error(err);
}
</script>
</body>
</html>`;
}

  function runResults() {
    if (!resultsOutput) return;
    resultsOutput.srcdoc = buildPreviewDocument();
  }

  function loadWireframe(htmlMarkup, fallbackCss) {
    htmlInput.value = htmlMarkup;
    if (!cssInput.value.trim() && fallbackCss) {
      cssInput.value = fallbackCss;
    }
    runResults();
  }

  [htmlInput, cssInput, jsInput].forEach((editor) => {
    editor.addEventListener("input", runResults);
  });

  syncFromCanvasBtn.addEventListener("click", () => {
    if (!window.StudioBuilder) return;
    loadWireframe(window.StudioBuilder.getCanvasHtml(), window.StudioBuilder.getDefaultCss());
  });

  loadTokenCssBtn.addEventListener("click", () => {
    if (!window.StudioTokens) return;
    const tokenBlock = window.StudioTokens.getExportCss();
    if (tokenBlock && !cssInput.value.includes(tokenBlock)) {
      cssInput.value = `${tokenBlock}\n\n${cssInput.value}`.trim();
      runResults();
    }
  });

  clearHtmlBtn.addEventListener("click", () => {
    htmlInput.value = "";
    runResults();
  });

  clearCssBtn.addEventListener("click", () => {
    cssInput.value = "";
    runResults();
  });

  clearJsBtn.addEventListener("click", () => {
    jsInput.value = "";
    runResults();
  });

  clearPreviewBtn.addEventListener("click", () => {
    resultsOutput.srcdoc = buildPreviewDocument("", "", "");
  });

  exportBundleBtn.addEventListener("click", () => {
    const bundle = buildPreviewDocument();
    navigator.clipboard.writeText(bundle);
    exportBundleBtn.textContent = "Copied";
    setTimeout(() => {
      exportBundleBtn.textContent = "Copy HTML";
    }, 1500);
  });

  window.StudioRunner = {
    runResults,
    loadWireframe,
    init: () => runResults()
  };
})();
