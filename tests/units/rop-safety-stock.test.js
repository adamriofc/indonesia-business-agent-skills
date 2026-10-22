/**
 * Unit Tests for Reorder Point (ROP) & Safety Stock Engine (`tests/units/rop-safety-stock.test.js`)
 */

const assert = require('assert');
const { calculateRopAndSafetyStock, getZScore } = require('../../engines/rop-safety-stock-engine');
const { auditBusinessHealth } = require('../../engines/business-health-oracle');

function runRopTests() {
  console.log("📦 Running Reorder Point (ROP) & Safety Stock Engine Tests...\n");

  // -----------------------------------------------------------------
  // 1. Constant Lead Time (sigma_L = 0)
  // -----------------------------------------------------------------
  console.log("  [1/6] Testing Fixed Lead Time & Variable Demand (95% SL)...");
  const res1 = calculateRopAndSafetyStock({
    averageDailyDemand: 50,
    leadTimeDays: 10,
    demandStdDev: 5,
    leadTimeStdDev: 0,
    serviceLevelPercent: 95.0,
    unitCost: 100000
  });

  assert.strictEqual(res1.inventoryMetrics.leadTimeDemandUnits, 500);
  assert.strictEqual(res1.parameters.zScore, 1.645);
  // combinedStdDev = sqrt(10 * 25) = sqrt(250) = 15.811388...
  // SS = ceil(1.645 * 15.811388) = ceil(26.0097) = 27
  assert.strictEqual(res1.inventoryMetrics.safetyStockUnits, 27);
  assert.strictEqual(res1.inventoryMetrics.reorderPointUnits, 527);
  assert.strictEqual(res1.inventoryMetrics.safetyStockCapitalExposureIdr, 2700000); // 27 * 100,000

  // -----------------------------------------------------------------
  // 2. Stochastic Lead Time & Demand (sigma_L > 0, sigma_d > 0, 99% SL)
  // -----------------------------------------------------------------
  console.log("  [2/6] Testing Joint Demand & Lead-Time Variability (99% SL)...");
  const res2 = calculateRopAndSafetyStock({
    averageDailyDemand: 20,
    leadTimeDays: 5,
    demandStdDev: 4,
    leadTimeStdDev: 1,
    serviceLevelPercent: 99.0
  });

  assert.strictEqual(res2.inventoryMetrics.leadTimeDemandUnits, 100);
  assert.strictEqual(res2.parameters.zScore, 2.326);
  // Variance = (5 * 16) + (400 * 1) = 80 + 400 = 480
  // sqrt(480) = 21.9089
  // SS = ceil(2.326 * 21.9089) = ceil(50.96) = 51
  assert.strictEqual(res2.inventoryMetrics.safetyStockUnits, 51);
  assert.strictEqual(res2.inventoryMetrics.reorderPointUnits, 151);

  // -----------------------------------------------------------------
  // 3. Operational Stock Status & Reorder Trigger
  // -----------------------------------------------------------------
  console.log("  [3/6] Testing Operational Stock Status Thresholds...");

  // 3a. Critical buffer breach (current <= SS)
  const resCritical = calculateRopAndSafetyStock({
    averageDailyDemand: 10,
    leadTimeDays: 7,
    demandStdDev: 2,
    serviceLevelPercent: 95.0,
    currentStock: 5 // SS is > 5
  });
  assert.strictEqual(resCritical.operationalStatus.stockStatus, 'CRITICAL_BUFFER_BREACH');
  assert.strictEqual(resCritical.operationalStatus.stockoutRiskTier, 'CRITICAL');
  assert.strictEqual(resCritical.operationalStatus.isReorderNeeded, true);

  // 3b. Reorder needed (SS < current <= ROP)
  const resReorder = calculateRopAndSafetyStock({
    averageDailyDemand: 10,
    leadTimeDays: 7,
    demandStdDev: 2,
    serviceLevelPercent: 95.0,
    currentStock: 75 // LTD=70, SS=9 -> ROP=79 -> current=75 is between SS and ROP
  });
  assert.strictEqual(resReorder.operationalStatus.stockStatus, 'REORDER_IMMEDIATELY');
  assert.strictEqual(resReorder.operationalStatus.stockoutRiskTier, 'HIGH');
  assert.strictEqual(resReorder.operationalStatus.isReorderNeeded, true);

  // 3c. Overstocked (current > 2.5 * ROP)
  const resOver = calculateRopAndSafetyStock({
    averageDailyDemand: 10,
    leadTimeDays: 7,
    demandStdDev: 2,
    serviceLevelPercent: 95.0,
    currentStock: 300 // ROP=79, 2.5*79 = 197.5
  });
  assert.strictEqual(resOver.operationalStatus.stockStatus, 'OVERSTOCKED');
  assert.strictEqual(resOver.operationalStatus.stockoutRiskTier, 'NEGLIGIBLE');
  assert.strictEqual(resOver.operationalStatus.isReorderNeeded, false);

  // -----------------------------------------------------------------
  // 4. Invariant Boundaries & Fail-Closed Error Handling
  // -----------------------------------------------------------------
  console.log("  [4/6] Testing Invariant Error Boundaries...");

  // Demand <= 0
  assert.throws(() => {
    calculateRopAndSafetyStock({ averageDailyDemand: 0, leadTimeDays: 5 });
  }, /INVALID_INPUT.*averageDailyDemand.*must be greater than zero/);

  // Lead time <= 0
  assert.throws(() => {
    calculateRopAndSafetyStock({ averageDailyDemand: 10, leadTimeDays: -2 });
  }, /INVALID_INPUT.*leadTimeDays.*must be greater than zero/);

  // Service level >= 100 or < 50
  assert.throws(() => {
    calculateRopAndSafetyStock({ averageDailyDemand: 10, leadTimeDays: 5, serviceLevelPercent: 100 });
  }, /INVALID_INPUT.*Service level percent.*between 50\.0 and 99\.9/);

  // -----------------------------------------------------------------
  // 5. Business Health Oracle Integration
  // -----------------------------------------------------------------
  console.log("  [5/6] Testing Business Health Oracle Commercial Integration...");
  const oracleRes = auditBusinessHealth({
    commerce: {
      isContributionMarginPositive: true,
      isRoasAboveBreakEven: true,
      stockStatus: 'CRITICAL_BUFFER_BREACH'
    }
  });
  assert.ok(oracleRes.criticalAlerts.some(a => a.includes("Level stok menembus batas kritis Safety Stock")));
  assert.ok(oracleRes.radarScores.commercialEfficiency < 100);

  // -----------------------------------------------------------------
  // 6. Zero-Prescription Policy Enforcement
  // -----------------------------------------------------------------
  console.log("  [6/6] Verifying Zero-Prescription Policy...");
  const serialized = JSON.stringify(res1);
  assert.ok(!serialized.includes("harus segera"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("sebaiknya"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("kami menyarankan"), "Engine violated zero-prescription policy");

  console.log("\n✅ Reorder Point (ROP) & Safety Stock Engine Tests PASSED 100%!");
}

if (require.main === module) {
  runRopTests();
}

module.exports = {
  runRopTests
};
