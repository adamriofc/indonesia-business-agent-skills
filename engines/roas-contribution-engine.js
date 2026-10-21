/**
 * True Net ROAS & COD Contribution Margin Engine (`engines/roas-contribution-engine.js`)
 *
 * Models real e-commerce contribution economics factoring:
 *   - Cash on Delivery (COD) RTS (Return to Seller) return loss rate
 *   - Platform admin fees (Shopee/Tokopedia/TikTok)
 *   - Free shipping extra charges & shipping subsidies
 *   - Break-Even ROAS Floor calculation
 *
 * Zero external dependencies. Pure Node.js.
 */

function calculateTrueNetRoas({
  sellingPrice = 0,
  cogs = 0,
  platformFeePercent = 6.0, // Default 6%
  freeShippingFeePercent = 4.0, // Default 4%
  codReturnRatePercent = 0, // e.g. 15 for 15% return rate
  adSpendPerDeliveredOrder = 0,
  shippingSubsidyPerAttempt = 0,
  pphFinalRatePercent = 0.5 // Default UMKM final tax 0.5%
}) {
  const price = Math.max(0, Number(sellingPrice) || 0);
  const costOfGoods = Math.max(0, Number(cogs) || 0);
  const feeRate = (Number(platformFeePercent) || 0) / 100;
  const freeShipRate = (Number(freeShippingFeePercent) || 0) / 100;
  const returnRate = Math.min(0.99, Math.max(0, Number(codReturnRatePercent) || 0) / 100);
  const adSpend = Math.max(0, Number(adSpendPerDeliveredOrder) || 0);
  const subsidy = Math.max(0, Number(shippingSubsidyPerAttempt) || 0);
  const taxRate = (Number(pphFinalRatePercent) || 0) / 100;

  if (price <= 0) {
    throw new Error("INVALID_INPUT: 'sellingPrice' must be greater than zero");
  }

  // 1. Net Realized Delivery Ratio
  const deliverySuccessRatio = 1 - returnRate;

  // 2. Net Revenue realized per dispatched order
  const realizedRevenuePerOrder = price * deliverySuccessRatio;

  // 3. Platform Deductions on successfully delivered orders
  const platformDeductions = (price * (feeRate + freeShipRate)) * deliverySuccessRatio;

  // 4. Lost shipping and repackaging costs on failed COD returns
  const unrecoverableCodLosses = subsidy * returnRate;

  // 5. Final tax liability on gross revenue realized
  const taxPerOrder = realizedRevenuePerOrder * taxRate;

  // 6. Net Contribution Margin BEFORE Advertising per order dispatched
  const variableCostsBeforeAds = (costOfGoods * deliverySuccessRatio) + platformDeductions + unrecoverableCodLosses + taxPerOrder;
  const netContributionBeforeAds = realizedRevenuePerOrder - variableCostsBeforeAds;

  // 7. Net Contribution Margin AFTER Advertising
  const netContributionAfterAds = netContributionBeforeAds - adSpend;
  const netMarginPercent = price > 0 ? ((netContributionAfterAds / price) * 100).toFixed(2) + '%' : '0.00%';

  // 8. Break-Even ROAS Floor
  // Minimum ROAS required so net margin after ads is >= 0
  let breakEvenRoasFloor = 0;
  if (netContributionBeforeAds > 0) {
    breakEvenRoasFloor = Math.round((price / netContributionBeforeAds) * 100) / 100;
  } else {
    breakEvenRoasFloor = Infinity; // Negative unit economics before ads!
  }

  // 9. Actual True ROAS achieved
  const trueRoas = adSpend > 0 ? Math.round((price / adSpend) * 100) / 100 : null;

  return {
    sellingPrice: price,
    cogs: costOfGoods,
    codReturnRatePercent: `${(returnRate * 100).toFixed(2)}%`,
    deliverySuccessRatePercent: `${(deliverySuccessRatio * 100).toFixed(2)}%`,
    realizedRevenuePerDispatchedOrder: Math.round(realizedRevenuePerOrder),
    deductions: {
      platformFees: Math.round(platformDeductions),
      unrecoverableCodLosses: Math.round(unrecoverableCodLosses),
      statutoryTax: Math.round(taxPerOrder),
      totalVariableCostsBeforeAds: Math.round(variableCostsBeforeAds)
    },
    netContributionBeforeAds: Math.round(netContributionBeforeAds),
    adSpendPerDeliveredOrder: adSpend,
    netContributionAfterAds: Math.round(netContributionAfterAds),
    netMarginPercent,
    breakEvenRoasFloor,
    trueRoas,
    isProfitable: netContributionAfterAds > 0,
    unitEconomicsHealth: netContributionBeforeAds <= 0
      ? 'CRITICAL_NEGATIVE_MARGIN'
      : (netContributionAfterAds > 0 ? 'HEALTHY_PROFITABLE' : 'UNPROFITABLE_DUE_TO_ADS')
  };
}

module.exports = {
  calculateTrueNetRoas
};
