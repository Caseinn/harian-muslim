(() => {
  const STORAGE_KEY = "theme";

  const getStoredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const applyTheme = (root, theme, withInit) => {
    if (!root) return;
    if (withInit) root.classList.add("theme-init");
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.style.backgroundColor = theme === "dark" ? "#0f1a15" : "#f8f9fa";
    if (withInit) {
      requestAnimationFrame(() => {
        root.classList.remove("theme-init");
      });
    }
  };

  applyTheme(document.documentElement, getStoredTheme(), true);

  document.addEventListener("astro:before-swap", (event) => {
    applyTheme(event.newDocument?.documentElement, getStoredTheme(), false);
  });
  document.addEventListener("astro:page-load", () => {
    applyTheme(document.documentElement, getStoredTheme(), false);
  });
})();
