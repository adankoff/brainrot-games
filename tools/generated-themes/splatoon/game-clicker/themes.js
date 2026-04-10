/**
 * SPLATOON CLICKER -- Theme Definition (auto-generated from content pack "splatoon")
 */

export const THEMES = {
  "splatoon": {
    id: "splatoon",
    name: "SPLATOON CLICKER",
    bodyTheme: "splatoon",
    currencyName: "INK POINTS",
    currencyShort: "INK",
    prestigeName: "FRESH TOKENS",
    prestigeAction: "Go Splatfest",
    upgrades: [
      { name: "Splattershot", baseCost: 10, baseProduction: 1 },
      { name: "Roller", baseCost: 100, baseProduction: 5 },
      { name: "Charger", baseCost: 1000, baseProduction: 25 },
      { name: "Slosher", baseCost: 10000, baseProduction: 100 },
      { name: "Splatana", baseCost: 100000, baseProduction: 500 },
    ],
    colors: {
      bgTop: "#1a0028",
      bgBottom: "#0a0014",
      accent: "#FF4081",
      accentGlow: "rgba(255, 64, 129, 0.3)",
      text: "#f0f0f0",
      textSecondary: "#c070a0",
      currencyColor: "#FF4081",
      prestigeColor: "#00E676",
      upgradeRowBg: "rgba(255, 64, 129, 0.08)",
      upgradeRowBorder: "rgba(255, 64, 129, 0.2)",
      tapTargetPrimary: "#ff68a9",
      tapTargetSecondary: "#d71859",
      tapTargetHighlight: "#ff90d1",
    },
    floatingSymbols: ["🦑", "🐙", "💣", "🥚", "🎨"],
  },
};

export const THEME_IDS = ["splatoon"];
export const DEFAULT_THEME = "splatoon";
