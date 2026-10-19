/**
 * Deterministic Working Capital Engine — net working capital, cash conversion
 * cycle, and working capital requirement. Pure math; money rounded to whole
 * Rupiah, ratios to 4 decimals.
 */

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

function assertValidNumber(val, name) {
  const n = Number(val);
  if (isNaN(n)) {
    throw new Error(`INVALID_INPUT: '${name}' must be a valid number`);
  }
  return n;
}

function netWorkingCapital(currentAssets, currentLiabilities) {
  const ca = assertValidNumber(currentAssets, 'currentAssets');
  const cl = assertValidNumber(currentLiabilities, 'currentLiabilities');
  return Math.round(ca - cl);
}

function workingCapitalRatio(currentAssets, currentLiabilities) {
  const cl = assertValidNumber(currentLiabilities, 'currentLiabilities');
  if (!(cl > 0)) {
    throw new Error('Current liabilities must be greater than zero');
  }
  const ca = assertValidNumber(currentAssets, 'currentAssets');
  return round4(ca / cl);
}

function cashConversionCycle(daysInventory, daysSalesOutstanding, daysPayables) {
  const di = assertValidNumber(daysInventory, 'daysInventory');
  const dso = assertValidNumber(daysSalesOutstanding, 'daysSalesOutstanding');
  const dp = assertValidNumber(daysPayables, 'daysPayables');
  return round4(di + dso - dp);
}

function workingCapitalRequirement(cashCycleDays, costOfGoodsSoldPerDay) {
  const ccd = assertValidNumber(cashCycleDays, 'cashCycleDays');
  const cogs = assertValidNumber(costOfGoodsSoldPerDay, 'costOfGoodsSoldPerDay');
  return Math.round(ccd * cogs);
}

module.exports = {
  netWorkingCapital,
  workingCapitalRatio,
  cashConversionCycle,
  workingCapitalRequirement
};