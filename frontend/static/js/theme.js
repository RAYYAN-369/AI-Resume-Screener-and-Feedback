// theme.js — light/dark mode toggle. Dark is the default look; the app
// only switches to light when the user explicitly picks it.

(function () {
  const STORAGE_KEY = "resume-scanner-theme";
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      if (label) label.textContent = "Light";
      if (toggle) toggle.setAttribute("aria-pressed", "false");
    } else {
      root.setAttribute("data-theme", "dark");
      if (label) label.textContent = "Dark";
      if (toggle) toggle.setAttribute("aria-pressed", "true");
    }
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return "dark"; // dark is the default brand look
  }

  // Apply immediately on load to avoid a flash of the wrong theme.
  applyTheme(getPreferredTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      const isLight = root.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }
})();