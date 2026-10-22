/**
 * Unit Tests for Expected Credit Loss (ECL) Provisioning Engine (`tests/units/ecl-provision.test.js`)
 */

const assert = require('assert');
const { calculateEclProvisioning } = require('../../engines/ecl-provision-engine');
const { auditBusinessHealth } = require('../../engines/business-health-oracle');

function runEclTests() {
  console.log("💳 Running Expected Credit Loss (ECL) & Aging Provision Engine Tests...\n");

  // -----------------------------------------------------------------
  // 1. Standard 5-Bucket Aging Schedule Calculation
  // -----------------------------------------------------------------
  console.log("  [1/5] Testing 5-Bucket Aging Schedule & Impairment Calculation...");
  const standardInput = {
    agingSchedule: {
      days0To30: 500000000,   // 500M @ 1% = 5M
      days31To60: 200000000,  // 200M @ 3% = 6M
      days61To90: 100000000,  // 100M @ 8% = 8M
      days91To180: 50000000,  // 50M @ 25% = 12.5M
      over180Days: 20000000   // 20M @ 100% = 20M
    },
    existingAllowanceBalance: 40000000 // 40M
  };

  const res1 = calculateEclProvisioning(standardInput);

  assert.strictEqual(res1.receivablesSummary.totalGrossReceivablesIdr, 870000000);
  assert.strictEqual(res1.receivablesSummary.totalEclAllowanceIdr, 51500000); // 5+6+8+12.5+20 = 51.5M
  assert.strictEqual(res1.receivablesSummary.totalNetReceivablesIdr, 818500000); // 870 - 51.5 = 818.5M
  assert.strictEqual(res1.receivablesSummary.isAccountingConserved, true);
  assert.strictEqual(res1.receivablesSummary.overallCoverageRatioPercent, 5.92);
  assert.strictEqual(res1.receivablesSummary.overdueGrossAmountIdr, 370000000); // 200+100+50+20 = 370M
  assert.strictEqual(res1.receivablesSummary.overdueRatioPercent, 42.53); // 370 / 870 = 42.53%
  assert.strictEqual(res1.receivablesSummary.receivablesQualityTier, 'CRITICAL_IMPAIRMENT_DISTRESSED');

  // Journal entry verification
  assert.strictEqual(res1.adjustmentAccounting.adjustmentExpenseRequiredIdr, 11500000); // 51.5M - 40M = +11.5M
  assert.strictEqual(res1.adjustmentAccounting.journalAction, 'ADDITIONAL_IMPAIRMENT_PROVISION');
  assert.ok(res1.adjustmentAccounting.journalEntry.debit.account.includes('Beban Kerugian Penurunan Nilai'));
  assert.ok(res1.adjustmentAccounting.journalEntry.credit.account.includes('Cadangan Kerugian Penurunan Nilai'));

  // Statutory fiscal tax non-deductible for general trade
  assert.strictEqual(res1.statutoryFiscalTax.isFinancialInstitution, false);
  assert.strictEqual(res1.statutoryFiscalTax.fiscalPositiveAdjustmentIdr, 11500000);
  assert.strictEqual(res1.statutoryFiscalTax.taxDeductibilityStatus, 'NON_DEDUCTIBLE_FISCAL_CORRECTION');

  // -----------------------------------------------------------------
  // 2. Allowance Reversal / Recovery Scenario
  // -----------------------------------------------------------------
  console.log("  [2/5] Testing Allowance Reversal (Recovery of Receivables)...");
  const reversalInput = {
    agingSchedule: {
      days0To30: 500000000,
      days31To60: 200000000,
      days61To90: 100000000,
      days91To180: 50000000,
      over180Days: 20000000
    },
    existingAllowanceBalance: 60000000 // 60M > 51.5M target
  };

  const res2 = calculateEclProvisioning(reversalInput);
  assert.strictEqual(res2.adjustmentAccounting.adjustmentExpenseRequiredIdr, -8500000); // 51.5M - 60M = -8.5M
  assert.strictEqual(res2.adjustmentAccounting.journalAction, 'ALLOWANCE_REVERSAL_RECOVERY');
  assert.ok(res2.adjustmentAccounting.journalEntry.credit.account.includes('Pemulihan Penurunan Nilai Piutang'));

  // -----------------------------------------------------------------
  // 3. Macroeconomic Forward-Looking Stress Adjustment
  // -----------------------------------------------------------------
  console.log("  [3/5] Testing Macroeconomic Stress Multiplier (1.20x Factor)...");
  const macroInput = {
    agingSchedule: {
      days0To30: 100000000,
      days31To60: 50000000
    },
    macroAdjustmentFactor: 1.20 // 20% macroeconomic risk surge
  };

  const res3 = calculateEclProvisioning(macroInput);
  // Current: 100M * (1.0% * 1.20 = 1.20%) = 1,200,000
  // Overdue 31-60: 50M * (3.0% * 1.20 = 3.60%) = 1,800,000
  // Total ECL = 3,000,000
  assert.strictEqual(res3.receivablesSummary.totalEclAllowanceIdr, 3000000);
  assert.strictEqual(res3.agingBuckets[0].effectiveLossRatePercent, 1.2);
  assert.strictEqual(res3.agingBuckets[1].effectiveLossRatePercent, 3.6);

  // -----------------------------------------------------------------
  // 4. Invariant Boundaries & Fail-Closed Errors
  // -----------------------------------------------------------------
  console.log("  [4/5] Testing Invariant Error Boundaries...");

  // Missing all buckets
  assert.throws(() => {
    calculateEclProvisioning({});
  }, /INVALID_INPUT.*must be provided/);

  // Negative loss rate
  assert.throws(() => {
    calculateEclProvisioning({
      buckets: [{ bucket: "A", grossAmount: 100, lossRatePercent: -5 }]
    });
  }, /INVALID_INPUT.*Loss rate percent.*between 0\.0 and 100\.0/);

  // -----------------------------------------------------------------
  // 5. Business Health Oracle Integration & Zero-Prescription
  // -----------------------------------------------------------------
  console.log("  [5/5] Verifying Business Health Oracle Integration & Zero-Prescription...");
  const oracleRes = auditBusinessHealth({
    finance: {
      cashRunwayMonths: 12,
      debtToEquityRatio: 1.0,
      receivablesQualityTier: 'CRITICAL_IMPAIRMENT_DISTRESSED'
    }
  });
  assert.ok(oracleRes.criticalAlerts.some(a => a.includes("Kualitas piutang kritis")));
  assert.ok(oracleRes.radarScores.financialStability < 100);

  const serialized = JSON.stringify(res1);
  assert.ok(!serialized.includes("harus segera"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("sebaiknya"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("kami menyarankan"), "Engine violated zero-prescription policy");

  console.log("\n✅ Expected Credit Loss (ECL) & Aging Provision Engine Tests PASSED 100%!");
}

if (require.main === module) {
  runEclTests();
}

module.exports = {
  runEclTests
};
