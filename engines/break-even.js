/**
 * Deterministic Break-Even Analysis Engine
 * Standard contribution-margin formulas from management accounting.
 */

function contributionMargin(pricePerUnit, variableCostPerUnit) {
  const price = Number(pricePerUnit);
  const vc = Number(variableCostPerUnit);
  if (!(price > vc)) {
    throw new Error('Contribution margin cannot be zero');
  }
  return price - vc;
}

function contributionMarginRatio(pricePerUnit, variableCostPerUnit) {
  const cm = contributionMargin(pricePerUnit, variableCostPerUnit);
  return Math.round((cm / Number(pricePerUnit)) * 10000) / 10000;
}

function breakEvenUnits(fixedCosts, pricePerUnit, variableCostPerUnit) {
  const fc = Number(fixedCosts);
  if (isNaN(fc) || fc < 0) {
    throw new Error("INVALID_INPUT: 'fixedCosts' must be a non-negative number");
  }
  const cm = contributionMargin(pricePerUnit, variableCostPerUnit);
  return Math.ceil(fc / cm);
}

function breakEvenRevenue(fixedCosts, pricePerUnit, variableCostPerUnit) {
  const units = breakEvenUnits(fixedCosts, pricePerUnit, variableCostPerUnit);
  return Math.round(units * Number(pricePerUnit));
}

function marginOfSafety(actualRevenue, breakEvenRevenueAmount) {
  const rev = Number(actualRevenue);
  const beRev = Number(breakEvenRevenueAmount);
  if (isNaN(rev) || isNaN(beRev)) {
    throw new Error("INVALID_INPUT: 'actualRevenue' and 'breakEvenRevenueAmount' must be valid numbers");
  }
  return Math.round(rev - beRev);
}

module.exports = {
  breakEvenUnits,
  breakEvenRevenue,
  contributionMargin,
  contributionMarginRatio,
  marginOfSafety
};