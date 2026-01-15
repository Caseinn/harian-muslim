export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}
