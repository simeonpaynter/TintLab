/**
 * Top 10 components arranged in a 2-tab, 5-row table (most common first)
 * with drag-and-drop insertion onto the 375px wireframe canvas.
 */
(() => {
  const TOP_10_COMPONENTS = [
    {
      rank: 1,
      type: "button",
      label: "Primary Button",
      html: `<div class="wf-actions">\n  <button type="button" class="wf-btn-primary">Primary Action</button>\n</div>`
    },
    {
      rank: 2,
      type: "header",
      label: "Header / Nav Bar",
      html: `<header class="wf-header">\n  <strong>Brand</strong>\n  <nav><a href="#top">Home</a> · <a href="#contact">Contact</a></nav>\n</header>`
    },
    {
      rank: 3,
      type: "card",
      label: "Content Card",
      html: `<article class="wf-card">\n  <h3>Card Title</h3>\n  <p>Short supporting summary.</p>\n</article>`
    },
    {
      rank: 4,
      type: "hero",
      label: "Hero Section",
      html: `<section class="wf-hero">\n  <span class="wf-badge">Featured</span>\n  <h2>Main Headline</h2>\n  <p>Concise value statement.</p>\n</section>`
    },
    {
      rank: 5,
      type: "input",
      label: "Text Input Field",
      html: `<div class="wf-field">\n  <label class="wf-label">Email</label>\n  <input type="email" class="wf-input" placeholder="name@example.com" />\n</div>`
    },
    {
      rank: 6,
      type: "list",
      label: "Item List",
      html: `<ul class="wf-list">\n  <li>First list item</li>\n  <li>Second list item</li>\n  <li>Third list item</li>\n</ul>`
    },
    {
      rank: 7,
      type: "badge",
      label: "Badge / Tag",
      html: `<div class="wf-inline">\n  <span class="wf-badge">Status Tag</span>\n</div>`
    },
    {
      rank: 8,
      type: "alert",
      label: "Alert Banner",
      html: `<div class="wf-alert" role="status">\n  <strong>Notice:</strong> Token changes apply immediately.\n</div>`
    },
    {
      rank: 9,
      type: "tabs",
      label: "Segmented Tabs",
      html: `<div class="wf-tabs" role="tablist">\n  <button type="button" class="wf-tab active">Tab A</button>\n  <button type="button" class="wf-tab">Tab B</button>\n</div>`
    },
    {
      rank: 10,
      type: "footer",
      label: "Footer Bar",
      html: `<footer class="wf-footer">\n  <span>© 2026 Brand</span>\n  <a href="#privacy">Privacy</a>\n</footer>`
    }
  ];

  const DEFAULT_WIREFRAME_CSS = `body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}
.wf-header, .wf-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-brand-700);
  color: #ffffff;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}
.wf-header a, .wf-footer a {
  color: var(--color-brand-100);
  text-decoration: none;
}
.wf-hero {
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  border-radius: 10px;
  padding: 1.15rem;
  margin-bottom: 0.75rem;
}
.wf-hero h2 {
  margin: 0.45rem 0 0.25rem;
  color: var(--color-brand-900);
  font-size: 1.15rem;
}
.wf-hero p, .wf-card p {
  margin: 0;
  color: #475569;
  font-size: 0.85rem;
}
.wf-actions, .wf-field, .wf-list, .wf-inline, .wf-tabs {
  margin-bottom: 0.75rem;
}
.wf-btn-primary {
  background: var(--color-brand-600);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  min-height: 44px;
  padding: 0 1.2rem;
  font-weight: 600;
  cursor: pointer;
}
.wf-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.9rem;
  margin-bottom: 0.75rem;
}
.wf-card h3 {
  margin: 0 0 0.25rem;
  color: var(--color-brand-800);
  font-size: 0.95rem;
}
.wf-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.wf-input {
  width: 100%;
  min-height: 40px;
  padding: 0.4rem 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
}
.wf-list {
  padding-left: 1.25rem;
  margin-top: 0;
}
.wf-list li {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
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
.wf-alert {
  background: var(--color-brand-50);
  border-left: 4px solid var(--color-brand-600);
  color: var(--color-brand-900);
  padding: 0.7rem 0.85rem;
  border-radius: 6px;
  font-size: 0.825rem;
  margin-bottom: 0.75rem;
}
.wf-tabs {
  display: flex;
  gap: 0.4rem;
}
.wf-tab {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.wf-tab.active {
  background: var(--color-brand-600);
  border-color: var(--color-brand-600);
  color: #ffffff;
}`;

  const templateMap = Object.fromEntries(
    TOP_10_COMPONENTS.map((item) => [item.type, item.html])
  );

  const paletteTabs = document.querySelectorAll(".palette-tab-btn");
  const palettePages = document.querySelectorAll(".palette-page");
  const page1Body = document.getElementById("palette-page-1");
  const page2Body = document.getElementById("palette-page-2");
  const canvas = document.getElementById("canvas");
  const clearCanvasBtn = document.getElementById("clearCanvasBtn");
  const loadWireframeHtmlBtn = document.getElementById("loadWireframeHtmlBtn");

  function sanitizeWireframeMarkup(markup) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(markup || ""), "text/html");

    doc
      .querySelectorAll("script, iframe, object, embed, link[rel='import']")
      .forEach((el) => el.remove());

    doc.body.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const val = attr.value.trim().toLowerCase();
        if (
          name.startsWith("on") ||
          ((name === "href" || name === "src") && val.startsWith("javascript:"))
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  }

  function appendSanitizedMarkup(container, markup) {
    const cleanHtml = sanitizeWireframeMarkup(markup);
    const template = document.createElement("template");
    template.innerHTML = cleanHtml;
    container.appendChild(template.content);
  }

  function renderComponentRows(tbody, items) {
    tbody.replaceChildren();
    items.forEach((item) => {
      const tr = document.createElement("tr");

      const rankTd = document.createElement("td");
      rankTd.className = "rank-cell";
      rankTd.textContent = String(item.rank);

      const presetTd = document.createElement("td");
      const preset = document.createElement("div");
      preset.className = "component-preset";
      preset.draggable = true;
      preset.dataset.type = item.type;
      preset.textContent = item.label;

      preset.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", preset.dataset.type);
      });

      presetTd.appendChild(preset);
      tr.append(rankTd, presetTd);
      tbody.appendChild(tr);
    });
  }

  paletteTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      paletteTabs.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      palettePages.forEach((page) => {
        page.hidden = true;
      });

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const targetId = btn.getAttribute("aria-controls");
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) target.hidden = false;
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
    if (Object.prototype.hasOwnProperty.call(templateMap, type)) {
      appendSanitizedMarkup(canvas, templateMap[type]);
    }
  });

  clearCanvasBtn.addEventListener("click", () => {
    canvas.replaceChildren();
  });

  function getSanitizedCanvasHtml() {
    return sanitizeWireframeMarkup(canvas.innerHTML).trim();
  }

  function pushCanvasToRunner() {
    if (!window.StudioRunner) return;
    window.StudioRunner.loadWireframe(getSanitizedCanvasHtml(), DEFAULT_WIREFRAME_CSS);
  }

  loadWireframeHtmlBtn.addEventListener("click", pushCanvasToRunner);

  window.StudioBuilder = {
    getCanvasHtml: getSanitizedCanvasHtml,
    getDefaultCss: () => DEFAULT_WIREFRAME_CSS,
    init: () => {
      renderComponentRows(page1Body, TOP_10_COMPONENTS.slice(0, 5));
      renderComponentRows(page2Body, TOP_10_COMPONENTS.slice(5, 10));
    }
  };
})();
