(function () {
  const STORAGE_KEY = "soft75Theme.v1";
  const DARK = "dark";
  const LIGHT = "light";

  function loadPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) === DARK ? DARK : LIGHT;
    } catch {
      return LIGHT;
    }
  }

  function savePreference(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works for the current session if storage is unavailable.
    }
  }

  function ensureStylesheet() {
    if (document.querySelector('link[data-dark-mode-styles]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "dark-mode.css?v=27";
    link.dataset.darkModeStyles = "true";
    document.head.appendChild(link);
  }

  function updateThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === DARK ? "#111710" : "#6f8065");
  }

  function applyTheme(theme, save = false) {
    document.documentElement.dataset.theme = theme;
    updateThemeColor(theme);
    if (save) savePreference(theme);

    const button = document.getElementById("themeToggle");
    if (button) {
      const isDark = theme === DARK;
      button.textContent = isDark ? "Light mode" : "Dark mode";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function ensureToggle() {
    if (document.getElementById("themeToggle")) return;
    const buttonRow = document.querySelector(".topbar .button-row.compact");
    if (!buttonRow) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "themeToggle";
    button.className = "ghost-btn theme-toggle-btn";
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === DARK ? LIGHT : DARK;
      applyTheme(next, true);
      if (typeof showToast === "function") {
        showToast(next === DARK ? "Dark mode enabled" : "Light mode enabled");
      }
    });

    const installButton = document.getElementById("installBtn");
    if (installButton) buttonRow.insertBefore(button, installButton);
    else buttonRow.appendChild(button);
  }

  function boot() {
    ensureStylesheet();
    applyTheme(loadPreference());
    ensureToggle();
    applyTheme(loadPreference());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
