// theme.js — light/dark mode toggle, persisted across visits.

(function () {
  const STORAGE_KEY = "resume-scanner-theme";
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      if (label) label.textContent = "Dark";
      if (toggle) toggle.setAttribute("aria-pressed", "true");
    } else {
      root.removeAttribute("data-theme");
      if (label) label.textContent = "Light";
      if (toggle) toggle.setAttribute("aria-pressed", "false");
    }
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // Apply immediately on load to avoid a flash of the wrong theme.
  applyTheme(getPreferredTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      const isDark = root.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // Follow system changes only if the user hasn't chosen manually.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
})();
