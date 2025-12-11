"use client";

import * as React from "react";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";
import { useTheme } from "next-themes";


export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
        Theme
      </div>
      <button
        onClick={() => setTheme("light")}
        className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
      >
        <IconSun className="h-4 w-4" />
        <span>Light</span>
        {theme === "light" && (
          <span className="ml-auto text-xs text-muted-foreground">✓</span>
        )}
      </button>
      <button
        onClick={() => setTheme("dark")}
        className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
      >
        <IconMoon className="h-4 w-4" />
        <span>Dark</span>
        {theme === "dark" && (
          <span className="ml-auto text-xs text-muted-foreground">✓</span>
        )}
      </button>
      <button
        onClick={() => setTheme("system")}
        className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
      >
        <IconDeviceDesktop className="h-4 w-4" />
        <span>System</span>
        {theme === "system" && (
          <span className="ml-auto text-xs text-muted-foreground">✓</span>
        )}
      </button>
    </>
  );
}
