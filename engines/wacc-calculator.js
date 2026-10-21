/**
 * Weighted Average Cost of Capital (WACC) Engine (`engines/wacc-calculator.js`)
 *
 * Calculates corporate discount rate incorporating statutory Indonesian corporate tax shield (22% per UU HPP):
 *   WACC = (E / V * Ke) + (D / V * Kd * (1 - t))
 *
 * Zero external dependencies. Pure Node.js.
 */

const STATUTORY_CORP_TAX_RATE = 0.22; // 22% per UU No. 7/2021 (HPP)

function calculateWacc({
  equityValue = 0,
  debtValue = 0,
  costOfEquityPercent = 0, // e.g. 15 for 15%
  costOfDebtPreTaxPercent = 0, // e.g. 9 for 9%
  corporateTaxRatePercent = 22 // Default statutory 22%
}) {
  const E = Math.max(0, Number(equityValue) || 0);
  const D = Math.max(0, Number(debtValue) || 0);
  const V = E + D;

  if (V <= 0) {
    throw new Error("INVALID_INPUT: Total capital (Equity + Debt) must be greater than zero");
  }

  const Ke = (Number(costOfEquityPercent) || 0) / 100;
  const Kd = (Number(costOfDebtPreTaxPercent) || 0) / 100;
  const t = (Number(corporateTaxRatePercent !== undefined ? corporateTaxRatePercent : 22)) / 100;

  const weightEquity = E / V;
  const weightDebt = D / V;

  const costOfDebtAfterTax = Kd * (1 - t);
  const equityContribution = weightEquity * Ke;
  const debtContribution = weightDebt * costOfDebtAfterTax;

  const wacc = equityContribution + debtContribution;

  return {
    equityValue: E,
    debtValue: D,
    totalCapitalValue: V,
    weightEquityPercent: `${(weightEquity * 100).toFixed(2)}%`,
    weightDebtPercent: `${(weightDebt * 100).toFixed(2)}%`,
    costOfEquityPercent: `${(Ke * 100).toFixed(2)}%`,
    costOfDebtPreTaxPercent: `${(Kd * 100).toFixed(2)}%`,
    costOfDebtAfterTaxPercent: `${(costOfDebtAfterTax * 100).toFixed(2)}%`,
    corporateTaxShieldPercent: `${(t * 100).toFixed(2)}%`,
    wacc: Math.round(wacc * 10000) / 10000,
    waccPercent: `${(wacc * 100).toFixed(2)}%`,
    statutoryTaxReference: "UU No. 7/2021 (HPP) Tarif PPh Badan 22%"
  };
}

module.exports = {
  calculateWacc,
  STATUTORY_CORP_TAX_RATE
};
