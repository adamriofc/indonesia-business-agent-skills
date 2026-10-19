/**
 * Deterministic Financial Ratios Engine — liquidity, solvency, profitability,
 * and efficiency ratios. Pure math; ratios rounded to 4 decimals.
 */

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

function currentRatio(currentAssets, currentLiabilities) {
  const cl = Number(currentLiabilities);
  if (!(cl > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(currentAssets) / cl);
}

function quickRatio(currentAssets, inventory, currentLiabilities) {
  const cl = Number(currentLiabilities);
  if (!(cl > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4((Number(currentAssets) - Number(inventory)) / cl);
}

function cashRatio(cash, currentLiabilities) {
  const cl = Number(currentLiabilities);
  if (!(cl > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(cash) / cl);
}

function debtToEquity(totalLiabilities, totalEquity) {
  const te = Number(totalEquity);
  if (!(te > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(totalLiabilities) / te);
}

function grossMargin(revenue, cogs) {
  const rev = Number(revenue);
  if (!(rev > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4((rev - Number(cogs)) / rev);
}

function netMargin(netIncome, revenue) {
  const rev = Number(revenue);
  if (!(rev > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(netIncome) / rev);
}

function roa(netIncome, totalAssets) {
  const ta = Number(totalAssets);
  if (!(ta > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(netIncome) / ta);
}

function roe(netIncome, totalEquity) {
  const te = Number(totalEquity);
  if (!(te > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(netIncome) / te);
}

function inventoryTurnover(cogs, avgInventory) {
  const ai = Number(avgInventory);
  if (!(ai > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(cogs) / ai);
}

function receivablesTurnover(revenue, avgReceivables) {
  const ar = Number(avgReceivables);
  if (!(ar > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4(Number(revenue) / ar);
}

function daysSalesOutstanding(revenue, avgReceivables) {
  const rev = Number(revenue);
  if (!(rev > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4((Number(avgReceivables) * 365) / rev);
}

function daysPayablesOutstanding(cogs, avgPayables) {
  const c = Number(cogs);
  if (!(c > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4((Number(avgPayables) * 365) / c);
}

function daysInventoryOutstanding(cogs, avgInventory) {
  const c = Number(cogs);
  if (!(c > 0)) {
    throw new Error('Denominator cannot be zero');
  }
  return round4((Number(avgInventory) * 365) / c);
}

function cashConversionCycle(dio, dso, dpo) {
  const dioN = Number(dio);
  const dsoN = Number(dso);
  const dpoN = Number(dpo);
  if (isNaN(dioN) || isNaN(dsoN) || isNaN(dpoN)) {
    throw new Error("INVALID_INPUT: 'dio', 'dso', and 'dpo' must be valid numbers");
  }
  return round4(dioN + dsoN - dpoN);
}

module.exports = {
  currentRatio,
  quickRatio,
  cashRatio,
  debtToEquity,
  grossMargin,
  netMargin,
  roa,
  roe,
  inventoryTurnover,
  receivablesTurnover,
  daysSalesOutstanding,
  daysPayablesOutstanding,
  daysInventoryOutstanding,
  cashConversionCycle
};