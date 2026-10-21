/**
 * 3-Statement Linkage & Balance Sanity Engine (`engines/financial-statement-linker.js`)
 *
 * Enforces fundamental accounting invariants per PSAK 1 / SAK EMKM:
 *   1. Balance Sheet Identity: Total Assets === Total Liabilities + Total Equity
 *   2. Retained Earnings Roll-Forward: Ending Retained Earnings === Beginning Retained Earnings + Net Profit - Dividends
 *   3. Cash Flow Reconciliation: Ending Cash on Cash Flow === Cash on Balance Sheet
 *
 * Zero external dependencies. Pure Node.js.
 */

function validateStatementLinkage({
  balanceSheet = {},
  incomeStatement = {},
  cashFlowStatement = {}
}) {
  const totalAssets = Math.round(Number(balanceSheet.totalAssets) || 0);
  const totalLiabilities = Math.round(Number(balanceSheet.totalLiabilities) || 0);
  const totalEquity = Math.round(Number(balanceSheet.totalEquity) || 0);

  const netProfit = Math.round(Number(incomeStatement.netProfit || incomeStatement.netIncome) || 0);
  const dividends = Math.round(Number(balanceSheet.dividendsPaid || incomeStatement.dividendsDeclared) || 0);

  const retainedEarningsBeginning = Math.round(Number(balanceSheet.retainedEarningsBeginning) || 0);
  const retainedEarningsEnding = Math.round(Number(balanceSheet.retainedEarningsEnding) || 0);

  const cashOnBalanceSheet = Math.round(Number(balanceSheet.cashAndEquivalents || balanceSheet.cash) || 0);
  const cashEndingOnCashFlow = Math.round(Number(cashFlowStatement.endingCash || cashFlowStatement.cashAtEndOfYear) || 0);

  const diagnostics = [];

  // Invariant 1: Total Assets === Total Liabilities + Total Equity
  const totalClaim = totalLiabilities + totalEquity;
  const balanceDifference = totalAssets - totalClaim;
  const isBalanceSheetBalanced = balanceDifference === 0;

  if (!isBalanceSheetBalanced) {
    diagnostics.push(`NERACA TIDAK SEIMBANG: Total Aset (Rp ${totalAssets.toLocaleString('id-ID')}) selisih Rp ${Math.abs(balanceDifference).toLocaleString('id-ID')} terhadap Liabilitas + Ekuitas (Rp ${totalClaim.toLocaleString('id-ID')}).`);
  }

  // Invariant 2: Retained Earnings Roll-Forward
  let isRetainedEarningsLinked = true;
  let reDifference = 0;
  if (balanceSheet.retainedEarningsEnding !== undefined && balanceSheet.retainedEarningsBeginning !== undefined) {
    const expectedEndingRe = retainedEarningsBeginning + netProfit - dividends;
    reDifference = retainedEarningsEnding - expectedEndingRe;
    isRetainedEarningsLinked = reDifference === 0;

    if (!isRetainedEarningsLinked) {
      diagnostics.push(`MUTASI LABA DITAHAN SELISIH: Laba Ditahan Akhir (Rp ${retainedEarningsEnding.toLocaleString('id-ID')}) tidak sesuai dengan Saldo Awal + Laba Bersih - Dividen (Rp ${expectedEndingRe.toLocaleString('id-ID')}). Selisih: Rp ${Math.abs(reDifference).toLocaleString('id-ID')}.`);
    }
  }

  // Invariant 3: Cash Reconciliation
  let isCashLinked = true;
  let cashDifference = 0;
  if (cashFlowStatement.endingCash !== undefined && balanceSheet.cashAndEquivalents !== undefined) {
    cashDifference = cashEndingOnCashFlow - cashOnBalanceSheet;
    isCashLinked = cashDifference === 0;

    if (!isCashLinked) {
      diagnostics.push(`KAS TIDAK TERSINKRONISASI: Saldo Kas Akhir pada Laporan Arus Kas (Rp ${cashEndingOnCashFlow.toLocaleString('id-ID')}) berbeda Rp ${Math.abs(cashDifference).toLocaleString('id-ID')} dengan Akun Kas Neraca (Rp ${cashOnBalanceSheet.toLocaleString('id-ID')}).`);
    }
  }

  const isAuditClean = isBalanceSheetBalanced && isRetainedEarningsLinked && isCashLinked;

  return {
    isAuditClean,
    balanceSheet: {
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: isBalanceSheetBalanced,
      difference: balanceDifference
    },
    retainedEarnings: {
      beginning: retainedEarningsBeginning,
      netProfit,
      dividends,
      ending: retainedEarningsEnding,
      isLinked: isRetainedEarningsLinked,
      difference: reDifference
    },
    cashReconciliation: {
      balanceSheetCash: cashOnBalanceSheet,
      cashFlowEndingCash: cashEndingOnCashFlow,
      isLinked: isCashLinked,
      difference: cashDifference
    },
    diagnosticsCount: diagnostics.length,
    diagnostics,
    standardReference: "PSAK 1 (Penyajian Laporan Keuangan) & SAK EMKM"
  };
}

module.exports = {
  validateStatementLinkage
};
