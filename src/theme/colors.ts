export const palette = {
  light: {
    background: "#FAF6F0",
    surface: "#FFFFFF",
    surfaceAlt: "#F1E9DC",
    text: "#2E2A26",
    textMuted: "#6B6259",
    accent: "#C9A24B",
    accentPressed: "#B48F3D",
    border: "#E7DECD",
    danger: "#B5544A",
    success: "#5C8D6E",
    tabInactive: "#A79E8F",
    shadow: "rgba(46, 42, 38, 0.10)",
  },
  dark: {
    background: "#1C1C1E",
    surface: "#2A2A2D",
    surfaceAlt: "#242426",
    text: "#EDEDED",
    textMuted: "#A7A29B",
    accent: "#D8B564",
    accentPressed: "#C6A253",
    border: "#3A3A3D",
    danger: "#D97B71",
    success: "#7CAE8E",
    tabInactive: "#6E6C68",
    shadow: "rgba(0, 0, 0, 0.35)",
  },
} as const;

export type ThemeColors = typeof palette.light;
