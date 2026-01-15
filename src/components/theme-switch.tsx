"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { getInitialTheme, applyTheme } from "@/lib/theme";

export default function ThemeSwitch() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    const theme = getInitialTheme();
    setDark(theme === "dark");
    applyTheme(theme);
  }, []);

  const onCheckedChange = (checked: boolean) => {
    setDark(checked);
    applyTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch checked={dark} onCheckedChange={onCheckedChange} />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
