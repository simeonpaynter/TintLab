/**
 * Top-level tab switching and initialization across separated studio modules.
 */
(() => {
  const tabButtons = document.querySelectorAll('.studio-tabs [role="tab"]');
  const tabPanels = document.querySelectorAll(".tab-panel");

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

  if (window.StudioBuilder) {
    window.StudioBuilder.init();
  }

  if (window.StudioTokens && window.StudioRunner) {
    window.StudioTokens.onChange(() => window.StudioRunner.runResults());
  }

  if (window.StudioTokens) {
    window.StudioTokens.init();
  }

  if (window.StudioRunner) {
    window.StudioRunner.init();
  }
})();
