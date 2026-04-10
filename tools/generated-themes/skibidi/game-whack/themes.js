/**
 * SKIBIDI TOILET WHACK -- Theme Definition (auto-generated)
 */

const theme = {
  id: "skibidi",
  name: "SKIBIDI TOILET WHACK",
  accentColor: "#b44dff",
  deathMessages: ["got flushed", "the skibidi won", "bop bop bop... no no no", "cameraman down", "should have upgraded your antenna", "the toilet was stronger", "signal lost permanently", "flushed your whole career"],
  roster: [
    { id: "tvman", name: "TV Man", emoji: "📺", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "speaker", name: "Speaker Man", emoji: "🔊", basePoints: 10, isBonus: false, isPenalty: false },
    { id: "plunger", name: "Plunger Man", emoji: "🪠", basePoints: 15, isBonus: false, isPenalty: false },
    { id: "titan", name: "Titan Cameraman", emoji: "🤖", basePoints: 100, isBonus: true, isPenalty: false },
    { id: "skibidi", name: "Skibidi Toilet", emoji: "🚽", basePoints: -50, isBonus: false, isPenalty: true },
    { id: "gman", name: "G-Man Toilet", emoji: "🎩", basePoints: 20, isBonus: false, isPenalty: false },
  ],
};

export const THEMES = [theme];
export function getThemeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
