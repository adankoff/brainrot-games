/**
 * ANIME CLICKER -- Theme Definition (auto-generated from content pack "anime")
 */

export const THEMES = {
  "anime": {
    id: "anime",
    name: "ANIME CLICKER",
    bodyTheme: "anime",
    currencyName: "POWER LEVEL",
    currencyShort: "PWR",
    prestigeName: "ULTRA INSTINCT",
    prestigeAction: "Go Ultra Instinct",
    upgrades: [
      { name: "Basic Training", baseCost: 10, baseProduction: 1 },
      { name: "Gravity Chamber", baseCost: 100, baseProduction: 5 },
      { name: "Sage Mode", baseCost: 1000, baseProduction: 25 },
      { name: "Bankai Release", baseCost: 10000, baseProduction: 100 },
      { name: "Ultra Instinct", baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: "#1a0d00",
      bgBottom: "#0a0500",
      accent: "#FF6600",
      accentGlow: "rgba(255, 102, 0, 0.3)",
      text: "#f0f0f0",
      textSecondary: "#b08050",
      currencyColor: "#FF6600",
      prestigeColor: "#1E90FF",
      upgradeRowBg: "rgba(255, 102, 0, 0.08)",
      upgradeRowBorder: "rgba(255, 102, 0, 0.2)",
      tapTargetPrimary: "#ff8e28",
      tapTargetSecondary: "#d73e00",
      tapTargetHighlight: "#ffb650",
    },
    floatingSymbols: ["🐉", "🍥", "⚡", "🔥", "👊"],
  },
};

export const THEME_IDS = ["anime"];
export const DEFAULT_THEME = "anime";
