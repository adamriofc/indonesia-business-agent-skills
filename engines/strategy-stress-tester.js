/**
 * Cross-Domain Enterprise Strategic Stress-Testing Engine (`engines/strategy-stress-tester.js`)
 *
 * Simulates micro & macro competitive strategic shocks (Michael Porter Five Forces threats)
 * directly against corporate financial health, cash runway, and statutory debt-equity boundaries.
 *
 * Zero external dependencies. Pure Node.js.
 */

function stressTestEnterprise({
  baseFinancials = {},
  strategyShocks = {}
}) {
  const rev = Math.max(0, Number(baseFinancials.monthlyRevenue || baseFinancials.revenue) || 0);
  const gm = Math.max(0, Math.min(100, Number(baseFinancials.grossMarginPercent || 40))) / 100;
  const opex = Math.max(0, Number(baseFinancials.monthlyOpex || baseFinancials.opex) || 0);
  const cash = Math.max(0, Number(baseFinancials.cashBalance || baseFinancials.cash) || 0);
  const debt = Math.max(0, Number(baseFinancials.totalDebt || baseFinancials.debt) || 0);
  const equity = Math.max(1, Number(baseFinancials.totalEquity || baseFinancials.equity) || 1);

  // Strategy Shocks (Five Forces Threats)
  const supplierCostShock = Math.max(0, Number(strategyShocks.supplierPowerCostIncreasePercent || 0)) / 100;
  const priceWarShock = Math.max(0, Number(strategyShocks.competitivePriceDropPercent || 0)) / 100;
  const demandShock = Math.max(0, Number(strategyShocks.demandShockPercent || 0)) / 100;
  const attritionCost = Math.max(0, Number(strategyShocks.employeeAttritionCost || 0));

  // 1. Revenue Shock Impact
  const revenueLossRatio = Math.min(0.95, priceWarShock + demandShock);
  const stressedRevenue = Math.round(rev * (1 - revenueLossRatio));

  // 2. Base COGS & Stressed COGS
  const baseCogs = Math.round(rev * (1 - gm));
  const stressedCogs = Math.round(baseCogs * (1 + supplierCostShock) * (1 - demandShock));

  // 3. Stressed Gross Profit & Margin
  const stressedGrossProfit = stressedRevenue - stressedCogs;
  const stressedGrossMarginPercent = stressedRevenue > 0
    ? `${((stressedGrossProfit / stressedRevenue) * 100).toFixed(2)}%`
    : '0.00%';

  // 4. Stressed Operating Expense
  const stressedOpex = opex + attritionCost;

  // 5. Stressed EBITDA / Operating Profit
  const stressedEbitda = stressedGrossProfit - stressedOpex;

  // 6. Cash Burn & Runway Calculation
  const baseMonthlyBurn = Math.max(0, opex - (rev * gm));
  const stressedMonthlyBurn = stressedEbitda < 0 ? Math.abs(stressedEbitda) : 0;

  const baseRunwayMonths = baseMonthlyBurn > 0 ? Math.round((cash / baseMonthlyBurn) * 10) / 10 : 999;
  const stressedRunwayMonths = stressedMonthlyBurn > 0 ? Math.round((cash / stressedMonthlyBurn) * 10) / 10 : 999;
  const runwayDeltaMonths = Math.round((stressedRunwayMonths - baseRunwayMonths) * 10) / 10;

  // 7. Solvency & Thin-Cap Boundary Check (PMK 172/2023 DER max 4:1)
  const currentDer = Math.round((debt / equity) * 100) / 100;
  const isThinCapBreached = currentDer > 4.0;
  const isSolvent = stressedRunwayMonths > 3 && stressedGrossProfit > 0;

  // 8. Prioritized Strategic Mitigation Action Plan
  const actions = [];
  if (stressedEbitda < 0) {
    actions.push(`DARURAT CASH RUNWAY: Sisa kas hanya bertahan ${stressedRunwayMonths} bulan pada laju defisit Rp ${stressedMonthlyBurn.toLocaleString('id-ID')}/bulan. Lakukan pemangkasan OpEx non-inti segera.`);
  }
  if (supplierCostShock > 0.15) {
    actions.push("MITIGASI SUPPLIER: Kekuatan tawar pemasok menggerus margin. Diversifikasi vendor atau lakukan negosiasi kontrak volume jangka panjang.");
  }
  if (priceWarShock > 0.10) {
    actions.push("DIFERENSIASI HARGA: Perang harga kompetitor menurunkan pendapatan. Tingkatkan diferensiasi nilai tambah / switching costs daripada mengikuti diskon harga.");
  }
  if (isThinCapBreached) {
    actions.push(`PELANGGARAN THIN CAPITALIZATION: Rasio utang DER (${currentDer}:1) melebihi batas fiskal 4:1 per PMK 172/2023. Biaya bunga atas kelebihan utang akan dikoreksi positif secara fiskal.`);
  }

  return {
    isSolvent,
    stressedRevenue,
    stressedGrossProfit,
    stressedGrossMarginPercent,
    stressedOpex,
    stressedEbitda,
    cashRunwayMonths: stressedRunwayMonths,
    runwayDeltaMonths,
    debtToEquityRatio: currentDer,
    isThinCapBreached,
    prioritizedActions: actions,
    strategicFramework: "Cross-Domain Michael Porter Five Forces to Corporate Financial Runway Simulation"
  };
}

module.exports = {
  stressTestEnterprise
};
