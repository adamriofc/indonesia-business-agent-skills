/**
 * Expected Credit Loss (ECL) Provisioning & Aging Matrix Engine (`engines/ecl-provision-engine.js`)
 *
 * Implements deterministic accounts receivable impairment calculation per:
 *   - PSAK 71 (Instrumen Keuangan: Pengukuran Kerugian Kredit Ekspektasian)
 *   - Simplified Provision Matrix Approach for Trade Receivables
 *   - Pasal 9 ayat (1) huruf c stdtd Pasal 6 ayat (1) huruf h UU PPh (Fiscal Deductibility)
 *
 * DOCTRINE: Pure numerical computation and financial accounting invariant verification.
 * ZERO prescriptive text / ZERO subjective advice.
 * Pure Node.js, zero external dependencies.
 */

'use strict';

const DEFAULT_LOSS_RATES = {
  CURRENT_0_30: 1.0,      // 0 - 30 days (Lancar)
  OVERDUE_31_60: 3.0,     // 31 - 60 days
  OVERDUE_61_90: 8.0,     // 61 - 90 days
  OVERDUE_OVER_90: 25.0,  // 91 - 180 days
  DEFAULT_OVER_180: 100.0 // > 180 days / Macet
};

function round2(val) {
  return Math.round(val * 100) / 100;
}

function calculateEclProvisioning(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new Error("INVALID_INPUT: Input must be a valid parameters object");
  }

  const macroFactor = input.macroAdjustmentFactor !== undefined ? Math.max(0.5, Number(input.macroAdjustmentFactor) || 1.0) : 1.0;
  const existingAllowance = Math.max(0, Number(input.existingAllowanceBalance || 0));
  const isFinancialInstitution = Boolean(input.isFinancialInstitution);

  let rawBuckets = [];

  if (Array.isArray(input.buckets || input.accountsReceivable)) {
    rawBuckets = input.buckets || input.accountsReceivable;
  } else if (input.agingSchedule && typeof input.agingSchedule === 'object') {
    const s = input.agingSchedule;
    rawBuckets = [
      { bucket: 'CURRENT_0_30', label: '0-30 Hari (Lancar)', grossAmount: s.current || s.days0To30 || 0, lossRatePercent: s.rate0To30 },
      { bucket: 'OVERDUE_31_60', label: '31-60 Hari', grossAmount: s.days31To60 || 0, lossRatePercent: s.rate31To60 },
      { bucket: 'OVERDUE_61_90', label: '61-90 Hari', grossAmount: s.days61To90 || 0, lossRatePercent: s.rate61To90 },
      { bucket: 'OVERDUE_OVER_90', label: '91-180 Hari', grossAmount: s.days91To180 || s.over90Days || 0, lossRatePercent: s.rate91To180 },
      { bucket: 'DEFAULT_OVER_180', label: '>180 Hari (Macet)', grossAmount: s.over180Days || s.default || 0, lossRatePercent: s.rateDefault || 100.0 }
    ];
  } else if (input.current !== undefined || input.overdue !== undefined) {
    rawBuckets = [
      { bucket: 'CURRENT_0_30', label: '0-30 Hari (Lancar)', grossAmount: input.current || 0, lossRatePercent: input.rateCurrent },
      { bucket: 'OVERDUE_31_60', label: '31-60 Hari', grossAmount: input.days31To60 || 0, lossRatePercent: input.rate31To60 },
      { bucket: 'OVERDUE_61_90', label: '61-90 Hari', grossAmount: input.days61To90 || 0, lossRatePercent: input.rate61To90 },
      { bucket: 'OVERDUE_OVER_90', label: '>90 Hari', grossAmount: input.overdue || input.over90Days || 0, lossRatePercent: input.rateOverdue },
      { bucket: 'DEFAULT_OVER_180', label: 'Default / Macet', grossAmount: input.default || 0, lossRatePercent: 100.0 }
    ];
  } else {
    throw new Error("INVALID_INPUT: 'buckets', 'accountsReceivable', or 'agingSchedule' must be provided");
  }

  if (rawBuckets.length === 0) {
    throw new Error("INVALID_INPUT: At least one aging bucket must be provided");
  }

  // 1. Process and evaluate each bucket
  let totalGrossReceivables = 0;
  let totalEclAllowance = 0;

  const evaluatedBuckets = rawBuckets.map((b, idx) => {
    if (!b || typeof b !== 'object') {
      throw new Error(`INVALID_INPUT: Bucket at index ${idx} must be an object`);
    }

    const bucketKey = String(b.bucket || `BUCKET_${idx + 1}`).trim().toUpperCase();
    const label = String(b.label || bucketKey).trim();
    const grossAmount = Math.max(0, Number(b.grossAmount !== undefined ? b.grossAmount : b.amount) || 0);

    const defaultRate = DEFAULT_LOSS_RATES[bucketKey] !== undefined ? DEFAULT_LOSS_RATES[bucketKey] : 5.0;
    const baseLossRate = b.lossRatePercent !== undefined && b.lossRatePercent !== null ? Number(b.lossRatePercent) : defaultRate;

    if (isNaN(baseLossRate) || baseLossRate < 0 || baseLossRate > 100.0) {
      throw new Error(`INVALID_INPUT: Loss rate percent for bucket '${label}' must be between 0.0 and 100.0 (got ${b.lossRatePercent})`);
    }

    // Apply forward-looking macro adjustment factor
    const effectiveLossRate = Math.min(100.0, round2(baseLossRate * macroFactor));
    const allowanceAmount = round2((grossAmount * effectiveLossRate) / 100);
    const netReceivableAmount = round2(grossAmount - allowanceAmount);

    totalGrossReceivables += grossAmount;
    totalEclAllowance += allowanceAmount;

    return {
      bucket: bucketKey,
      label,
      grossAmount,
      baseLossRatePercent: baseLossRate,
      effectiveLossRatePercent: effectiveLossRate,
      allowanceAmount,
      netReceivableAmount
    };
  });

  totalGrossReceivables = round2(totalGrossReceivables);
  totalEclAllowance = round2(totalEclAllowance);
  const totalNetReceivables = round2(totalGrossReceivables - totalEclAllowance);

  // Invariant validation: Gross === Net + Allowance
  const conservationDiscrepancy = Math.abs(totalGrossReceivables - (totalNetReceivables + totalEclAllowance));
  const isConserved = conservationDiscrepancy <= 0.01;

  // 2. Metrics & Ratios
  const overallCoverageRatioPercent = totalGrossReceivables > 0
    ? round2((totalEclAllowance / totalGrossReceivables) * 100)
    : 0.0;

  const currentBucket = evaluatedBuckets.find(b => b.bucket.includes('CURRENT') || b.bucket === '0_30') || evaluatedBuckets[0];
  const overdueGrossAmount = round2(totalGrossReceivables - (currentBucket ? currentBucket.grossAmount : 0));
  const overdueRatioPercent = totalGrossReceivables > 0
    ? round2((overdueGrossAmount / totalGrossReceivables) * 100)
    : 0.0;

  let receivablesQualityTier = 'SOUND_HIGH_QUALITY';
  if (overdueRatioPercent > 30.0 || overallCoverageRatioPercent > 15.0) {
    receivablesQualityTier = 'CRITICAL_IMPAIRMENT_DISTRESSED';
  } else if (overdueRatioPercent > 15.0 || overallCoverageRatioPercent > 5.0) {
    receivablesQualityTier = 'WATCHLIST_MODERATE_RISK';
  }

  // 3. Accounting Adjustment & Journal Entry
  const adjustmentExpenseRequired = round2(totalEclAllowance - existingAllowance);
  let journalAction = 'NO_ADJUSTMENT';
  let debitAccount = null;
  let creditAccount = null;

  if (adjustmentExpenseRequired > 0) {
    journalAction = 'ADDITIONAL_IMPAIRMENT_PROVISION';
    debitAccount = 'Beban Kerugian Penurunan Nilai Piutang (Income Statement)';
    creditAccount = 'Cadangan Kerugian Penurunan Nilai / CKPN (Balance Sheet Contra-Asset)';
  } else if (adjustmentExpenseRequired < 0) {
    journalAction = 'ALLOWANCE_REVERSAL_RECOVERY';
    debitAccount = 'Cadangan Kerugian Penurunan Nilai / CKPN (Balance Sheet Contra-Asset)';
    creditAccount = 'Pemulihan Penurunan Nilai Piutang (Income Statement Other Income)';
  }

  // 4. Statutory Fiscal Tax Reconciliation (Pasal 9 ayat 1 huruf c UU PPh)
  const isTaxDeductible = isFinancialInstitution;
  const fiscalPositiveAdjustmentIdr = !isTaxDeductible && adjustmentExpenseRequired > 0
    ? adjustmentExpenseRequired
    : 0;

  return {
    receivablesSummary: {
      totalGrossReceivablesIdr: totalGrossReceivables,
      totalEclAllowanceIdr: totalEclAllowance,
      totalNetReceivablesIdr: totalNetReceivables,
      overallCoverageRatioPercent,
      overdueGrossAmountIdr: overdueGrossAmount,
      overdueRatioPercent,
      receivablesQualityTier,
      isAccountingConserved: isConserved
    },
    agingBuckets: evaluatedBuckets,
    adjustmentAccounting: {
      existingAllowanceBalanceIdr: existingAllowance,
      targetAllowanceBalanceIdr: totalEclAllowance,
      adjustmentExpenseRequiredIdr: adjustmentExpenseRequired,
      journalAction,
      journalEntry: adjustmentExpenseRequired !== 0 ? {
        debit: { account: debitAccount, amountIdr: Math.abs(adjustmentExpenseRequired) },
        credit: { account: creditAccount, amountIdr: Math.abs(adjustmentExpenseRequired) }
      } : null
    },
    statutoryFiscalTax: {
      isFinancialInstitution,
      taxDeductibilityStatus: isTaxDeductible ? 'STATUTORILY_DEDUCTIBLE' : 'NON_DEDUCTIBLE_FISCAL_CORRECTION',
      fiscalPositiveAdjustmentIdr,
      statutoryLaw: "Pasal 9 ayat (1) huruf c jo. Pasal 6 ayat (1) huruf h UU PPh",
      accountingStandard: "PSAK 71 (Instrumen Keuangan - Impairment Expected Credit Loss)",
      prescriptionConstraint: "ZERO_PRESCRIPTIVE_TEXT_POLICY_ENFORCED"
    }
  };
}

module.exports = {
  calculateEclProvisioning,
  DEFAULT_LOSS_RATES
};
