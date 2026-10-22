/**
 * Unit Tests for Inventory Valuation Engine (FIFO vs Weighted Average) (`tests/units/inventory-valuation.test.js`)
 */

const assert = require('assert');
const { calculateInventoryValuation } = require('../../engines/inventory-valuation-engine');

function runInventoryValuationTests() {
  console.log("📦 Running Inventory Valuation (FIFO vs Average) Engine Tests...\n");

  // -----------------------------------------------------------------
  // 1. Inflationary Inventory Cycle (Rising Purchase Prices)
  // -----------------------------------------------------------------
  console.log("  [1/5] Testing Inflationary Price Cycle (FIFO vs Average)...");
  const inflationInput = {
    beginningInventory: {
      quantity: 100,
      unitCost: 10000 // Rp 1,000,000
    },
    transactions: [
      { type: "PURCHASE", quantity: 150, unitPrice: 12000 }, // + 1,800,000 -> Total Goods: 250 units, 2,800,000 (avg = 11,200)
      { type: "SALE", quantity: 120 },                      // FIFO takes 100@10k + 20@12k = 1,240,000. Avg takes 120@11,200 = 1,344,000
      { type: "PURCHASE", quantity: 100, unitPrice: 15000 }, // + 1,500,000
      { type: "SALE", quantity: 80 }
    ]
  };

  const res1 = calculateInventoryValuation(inflationInput);

  // General assertions
  assert.strictEqual(res1.inventorySummary.beginningInventoryQty, 100);
  assert.strictEqual(res1.inventorySummary.totalPurchasedQty, 250);
  assert.strictEqual(res1.inventorySummary.totalSoldQty, 200);
  assert.strictEqual(res1.inventorySummary.endingInventoryQty, 150);
  assert.strictEqual(res1.inventorySummary.totalGoodsAvailableForSaleValue, 4300000); // 1.0M + 1.8M + 1.5M

  // Accounting Conservation Invariants
  assert.strictEqual(res1.fifoMethod.isConserved, true);
  assert.strictEqual(res1.weightedAverageMethod.isConserved, true);

  // In inflation: FIFO COGS is lower (uses older cheaper inventory), so ending inventory is higher
  assert.ok(res1.fifoMethod.endingInventoryValueIdr > res1.weightedAverageMethod.endingInventoryValueIdr);
  assert.ok(res1.fifoMethod.cogsIdr < res1.weightedAverageMethod.cogsIdr);

  // Tax differential check
  const deltaCogs = Math.abs(res1.comparativeAnalysis.deltaCogsIdr);
  assert.ok(deltaCogs > 0);
  assert.strictEqual(
    res1.comparativeAnalysis.estimatedCorporateTaxImpactIdr,
    Math.round(deltaCogs * 0.22 * 100) / 100
  );

  // -----------------------------------------------------------------
  // 2. Deflationary Inventory Cycle (Falling Purchase Prices)
  // -----------------------------------------------------------------
  console.log("  [2/5] Testing Deflationary Price Cycle (Prices Dropping)...");
  const deflationInput = {
    beginningInventory: { quantity: 100, unitCost: 20000 },
    transactions: [
      { type: "PURCHASE", quantity: 100, unitPrice: 15000 },
      { type: "SALE", quantity: 150 },
      { type: "PURCHASE", quantity: 100, unitPrice: 10000 },
      { type: "SALE", quantity: 80 }
    ]
  };

  const res2 = calculateInventoryValuation(deflationInput);
  assert.strictEqual(res2.fifoMethod.isConserved, true);
  assert.strictEqual(res2.weightedAverageMethod.isConserved, true);
  // In deflation: FIFO COGS is higher (uses older expensive inventory)
  assert.ok(res2.fifoMethod.cogsIdr > res2.weightedAverageMethod.cogsIdr);

  // -----------------------------------------------------------------
  // 3. Zero Beginning Inventory
  // -----------------------------------------------------------------
  console.log("  [3/5] Testing Zero Beginning Inventory Baseline...");
  const zeroInput = {
    beginningInventory: { quantity: 0, unitCost: 0 },
    transactions: [
      { type: "PURCHASE", quantity: 50, unitPrice: 10000 },
      { type: "SALE", quantity: 30 }
    ]
  };

  const res3 = calculateInventoryValuation(zeroInput);
  assert.strictEqual(res3.fifoMethod.cogsIdr, 300000);
  assert.strictEqual(res3.fifoMethod.endingInventoryValueIdr, 200000);
  assert.strictEqual(res3.weightedAverageMethod.cogsIdr, 300000);
  assert.strictEqual(res3.weightedAverageMethod.endingInventoryValueIdr, 200000);
  assert.strictEqual(res3.comparativeAnalysis.deltaCogsIdr, 0);

  // -----------------------------------------------------------------
  // 4. Invariant Boundaries & Fail-Closed Errors
  // -----------------------------------------------------------------
  console.log("  [4/5] Testing Invariant Error Boundaries...");

  // 4a. Sale exceeds available stock
  assert.throws(() => {
    calculateInventoryValuation({
      beginningInventory: { quantity: 10, unitCost: 1000 },
      transactions: [{ type: "SALE", quantity: 25 }] // 25 > 10
    });
  }, /INVALID_INPUT.*exceeds total goods available/);

  // 4b. Unsupported transaction type
  assert.throws(() => {
    calculateInventoryValuation({
      transactions: [{ type: "LIFO", quantity: 10 }]
    });
  }, /INVALID_INPUT.*Unsupported transaction type/);

  // 4c. Negative quantity
  assert.throws(() => {
    calculateInventoryValuation({
      transactions: [{ type: "PURCHASE", quantity: -10, unitPrice: 1000 }]
    });
  }, /INVALID_INPUT.*quantity.*must be a positive number/);

  // -----------------------------------------------------------------
  // 5. Statutory References & Zero-Prescription Policy
  // -----------------------------------------------------------------
  console.log("  [5/5] Verifying Statutory References & Zero-Prescription Policy...");
  assert.ok(res1.statutoryCompliance.statutoryLaw.includes("Pasal 10 ayat (6)"));
  assert.ok(res1.statutoryCompliance.accountingStandard.includes("PSAK 14"));
  assert.strictEqual(res1.statutoryCompliance.lifoStatus, "STRICTLY_PROHIBITED_UNDER_INDONESIAN_TAX_LAW");

  const serialized = JSON.stringify(res1);
  assert.ok(!serialized.includes("harus segera"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("sebaiknya"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("kami menyarankan"), "Engine violated zero-prescription policy");

  console.log("\n✅ Inventory Valuation (FIFO vs Average) Engine Tests PASSED 100%!");
}

if (require.main === module) {
  runInventoryValuationTests();
}

module.exports = {
  runInventoryValuationTests
};
