import React, { createContext, useContext, useMemo } from "react";
import { palette, ThemeColors } from "@/theme/colors";
import { useAppData } from "@/context/AppDataContext";

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAppData();

  const isDark = settings.themePreference === "dark";

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? palette.dark : palette.light,
      isDark,
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within a ThemeProvider");
  return ctx;
}