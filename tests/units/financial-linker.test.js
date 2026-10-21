const assert = require('assert');
const { validateStatementLinkage } = require('../../engines/financial-statement-linker');
const { calculateWacc } = require('../../engines/wacc-calculator');

function runFinancialLinkerTests() {
  console.log("📊 Running 3-Statement Linkage & WACC Engine Tests...\n");

  // 1. Balanced 3-Statement Financials
  const validProfile = {
    balanceSheet: {
      totalAssets: 1500000000,
      totalLiabilities: 600000000,
      totalEquity: 900000000,
      retainedEarningsBeginning: 300000000,
      retainedEarningsEnding: 450000000,
      cashAndEquivalents: 250000000
    },
    incomeStatement: {
      netProfit: 200000000,
      dividendsDeclared: 50000000
    },
    cashFlowStatement: {
      endingCash: 250000000
    }
  };

  const resBalanced = validateStatementLinkage(validProfile);
  assert.strictEqual(resBalanced.isAuditClean, true);
  assert.strictEqual(resBalanced.balanceSheet.isBalanced, true);
  assert.strictEqual(resBalanced.balanceSheet.difference, 0);
  assert.strictEqual(resBalanced.retainedEarnings.isLinked, true);
  assert.strictEqual(resBalanced.cashReconciliation.isLinked, true);

  // 2. Unbalanced Statement (Asset gap of 100M)
  const unbalancedProfile = {
    balanceSheet: {
      totalAssets: 1400000000,
      totalLiabilities: 600000000,
      totalEquity: 900000000
    }
  };
  const resUnbalanced = validateStatementLinkage(unbalancedProfile);
  assert.strictEqual(resUnbalanced.isAuditClean, false);
  assert.strictEqual(resUnbalanced.balanceSheet.isBalanced, false);
  assert.strictEqual(resUnbalanced.balanceSheet.difference, -100000000);

  // 3. WACC Calculation with 22% Corporate Tax Shield
  // Equity: 600M (60%), Debt: 400M (40%), Total: 1000M
  // Ke: 15%, Kd: 10%, Tax: 22%
  // Kd after tax: 10% * (1 - 0.22) = 7.8%
  // WACC = (0.60 * 15%) + (0.40 * 7.8%) = 9.0% + 3.12% = 12.12%
  const waccRes = calculateWacc({
    equityValue: 600000000,
    debtValue: 400000000,
    costOfEquityPercent: 15,
    costOfDebtPreTaxPercent: 10,
    corporateTaxRatePercent: 22
  });
  assert.strictEqual(waccRes.waccPercent, "12.12%");
  assert.strictEqual(waccRes.costOfDebtAfterTaxPercent, "7.80%");
  assert.strictEqual(waccRes.weightEquityPercent, "60.00%");
  assert.strictEqual(waccRes.weightDebtPercent, "40.00%");

  console.log("✅ Financial Linker & WACC Tests PASSED 100%!");
}

runFinancialLinkerTests();
