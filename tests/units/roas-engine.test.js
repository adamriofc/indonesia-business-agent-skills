const assert = require('assert');
const { calculateTrueNetRoas } = require('../../engines/roas-contribution-engine');
const { calculateLandedCost } = require('../../engines/landed-cost-calculator');

function runRoasAndLandedCostTests() {
  console.log("🛒 Running True Net ROAS & Customs Landed Cost Engine Tests...\n");

  // 1. True Net ROAS with 10% COD Return Rate
  // Price: 100,000, COGS: 40,000, Platform 6%, FreeShip 4%, Return 10%
  const roasRes = calculateTrueNetRoas({
    sellingPrice: 100000,
    cogs: 40000,
    platformFeePercent: 6.0,
    freeShippingFeePercent: 4.0,
    codReturnRatePercent: 10,
    adSpendPerDeliveredOrder: 15000,
    shippingSubsidyPerAttempt: 10000,
    pphFinalRatePercent: 0.5
  });

  assert.strictEqual(roasRes.isProfitable, true);
  assert.strictEqual(roasRes.deliverySuccessRatePercent, "90.00%");
  assert.strictEqual(roasRes.realizedRevenuePerDispatchedOrder, 90000);
  assert.ok(roasRes.breakEvenRoasFloor > 1.0);
  assert.strictEqual(roasRes.trueRoas, 6.67);

  // 2. Customs Landed Cost Calculation
  // FOB: 10,000 USD, Freight: 1,000 USD, Insurance: 200 USD = CIF 11,200 USD
  // Rate: 16,000 = CIF IDR: 179,200,000
  // Duty: 10% = 17,920,000. Nilai Impor = 197,120,000
  // PPN: 12% = 23,654,400. PPh 22 API: 2.5% = 4,928,000
  // Total Taxes = 46,502,400. Total Landed Cost = 225,702,400
  const landedRes = calculateLandedCost({
    fobValueUsd: 10000,
    freightUsd: 1000,
    insuranceUsd: 200,
    exchangeRateKmk: 16000,
    dutyRatePercent: 10,
    hasApi: true,
    hasNpwp: true,
    unitsCount: 1000
  });

  assert.strictEqual(landedRes.valuation.cifUsd, 11200);
  assert.strictEqual(landedRes.valuation.cifIdr, 179200000);
  assert.strictEqual(landedRes.customsDuty.importDutyAmount, 17920000);
  assert.strictEqual(landedRes.importTaxes.nilaiImporTaxBase, 197120000);
  assert.strictEqual(landedRes.importTaxes.ppnAmount, 23654400);
  assert.strictEqual(landedRes.importTaxes.pph22Amount, 4928000);
  assert.strictEqual(landedRes.totalLandedTaxes, 46502400);
  assert.strictEqual(landedRes.totalLandedCostIdr, 225702400);
  assert.strictEqual(landedRes.unitLandedCostIdr, 225702);

  console.log("✅ True Net ROAS & Landed Cost Tests PASSED 100%!");
}

runRoasAndLandedCostTests();
