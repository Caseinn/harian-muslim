"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { applyTheme } from "@/lib/theme";

export default function ThemeSwitch() {
  const [dark, setDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const syncTheme = () => {
      const root = document.documentElement;
      const theme =
        root.dataset.theme ??
        (root.classList.contains("dark") ? "dark" : "light");
      setDark(theme === "dark");
    };

    syncTheme();
    setMounted(true);

    document.addEventListener("astro:after-swap", syncTheme);
    document.addEventListener("astro:page-load", syncTheme);

    return () => {
      document.removeEventListener("astro:after-swap", syncTheme);
      document.removeEventListener("astro:page-load", syncTheme);
    };
  }, []);

  const onCheckedChange = (checked: boolean) => {
    setDark(checked);
    applyTheme(checked ? "dark" : "light");
  };

  return (
    <div
      className={[
        "flex items-center gap-2 transition-opacity",
        mounted ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch checked={dark} onCheckedChange={onCheckedChange} className="cursor-pointer"/>
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
