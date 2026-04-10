/**
 * ANIME CLICKER -- Upgrade System
 * Cost calculation, purchasing, and production with prestige multiplier.
 * Cloned from game-03 (Sigma Grindset Simulator) -- logic unchanged.
 */

/** Cost growth factor per owned unit. */
const COST_GROWTH = 1.15;

/**
 * Calculate the cost of buying the next unit of an upgrade.
 *
 * @param {number} baseCost - Base cost of the upgrade tier
 * @param {number} owned - Number currently owned
 * @returns {number} Cost for the next unit (floored to integer)
 */
export function getUpgradeCost(baseCost, owned) {
  return Math.floor(baseCost * Math.pow(COST_GROWTH, owned));
}

/**
 * Calculate total production per second for all upgrades, including prestige multiplier.
 *
 * @param {Array<{ baseProduction: number }>} upgradeDefs - Theme upgrade definitions
 * @param {number[]} ownedCounts - Number owned per upgrade tier
 * @param {number} prestigeTokens - Total prestige tokens accumulated
 * @returns {number} Total production per second
 */
export function getTotalProduction(upgradeDefs, ownedCounts, prestigeTokens) {
  const multiplier = getPrestigeMultiplier(prestigeTokens);
  let total = 0;
  for (let i = 0; i < upgradeDefs.length; i++) {
    total += (ownedCounts[i] || 0) * upgradeDefs[i].baseProduction;
  }
  return total * multiplier;
}

/**
 * Get the production multiplier from prestige tokens.
 * Each token = +10% multiplicative.
 *
 * @param {number} prestigeTokens
 * @returns {number} Multiplier (>= 1.0)
 */
export function getPrestigeMultiplier(prestigeTokens) {
  return 1 + prestigeTokens * 0.1;
}

/**
 * Calculate prestige tokens earned from total currency earned this run.
 *
 * @param {number} totalEarned - Total currency earned in this prestige cycle
 * @returns {number} Prestige tokens to grant
 */
export function calcPrestigeTokens(totalEarned) {
  if (totalEarned < 1000) return 0;
  return Math.floor(Math.sqrt(totalEarned / 1000));
}

/**
 * Attempt to purchase an upgrade. Mutates currency and ownedCounts in place.
 *
 * @param {number} tierIndex - Index of the upgrade tier (0-4)
 * @param {{ baseCost: number }} upgradeDef - Upgrade definition
 * @param {number[]} ownedCounts - Mutable owned counts array
 * @param {number} currency - Current currency
 * @returns {{ success: boolean, newCurrency: number, cost: number }}
 */
export function tryBuyUpgrade(tierIndex, upgradeDef, ownedCounts, currency) {
  const cost = getUpgradeCost(upgradeDef.baseCost, ownedCounts[tierIndex] || 0);
  if (currency < cost) {
    return { success: false, newCurrency: currency, cost };
  }
  ownedCounts[tierIndex] = (ownedCounts[tierIndex] || 0) + 1;
  return { success: true, newCurrency: currency - cost, cost };
}
