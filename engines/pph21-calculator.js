/**
 * Deterministic PPh 21 Calculator Engine (PP 58/2023 & PMK 168/2023)
 * Supports Monthly TER withholding (Jan-Nov) and December Annual Tax Reconciliation (Art. 17 UU PPh).
 * Dynamically evaluates temporal rulesets loaded from engines/rules/pph21.json.
 * Enforces cryptographic ruleset runtime integrity and fail-closed validation.
 */

const pphRulesData = require('./rules/pph21.json');
const { verifyRulesetIntegrity } = require('./rules/integrity');

// Enforce runtime integrity validation on load
verifyRulesetIntegrity('pph21.json');

function getRulesForDate(dateStr) {
  const activeDateStr = dateStr || '2026-03-01';
  const checkDate = new Date(activeDateStr);

  if (isNaN(checkDate.getTime())) {
    throw new Error(`Invalid date format provided: ${dateStr}`);
  }

  for (const r of pphRulesData.rulesets) {
    const fromDate = new Date(r.effective_from.includes('T') ? r.effective_from : r.effective_from + 'T00:00:00.000Z');
    const toDate = r.effective_to === 'Infinity' ? new Date('9999-12-31T23:59:59.999Z') : new Date(r.effective_to.includes('T') ? r.effective_to : r.effective_to + 'T23:59:59.999Z');
    
    if (checkDate >= fromDate && checkDate <= toDate) {
      return r;
    }
  }

  throw new Error(`No regulatory PPh 21 ruleset available for date: ${dateStr}`);
}

function parseMaxLimit(val) {
  return val === 'Infinity' ? Infinity : Number(val);
}

// Deterministic non-negative Rupiah guard: INVALID_INPUT boundary instead of silent
// zero-coercion, so hostile or malformed values can never propagate into tax math
// as fabricated numbers (Production Contract: no fabricated answer).
const { requireRupiah } = require('./production-contract');
function clampRupiah(val) {
  return requireRupiah(val, 'rupiahInput');
}


function getTerCategory(ptkp, pphRules) {
  const ptkpUpper = (ptkp || 'TK/0').toUpperCase().trim();
  if (pphRules.ter_categories.A.includes(ptkpUpper)) return { category: 'A', table: pphRules.ter_tables.A };
  if (pphRules.ter_categories.B.includes(ptkpUpper)) return { category: 'B', table: pphRules.ter_tables.B };
  if (pphRules.ter_categories.C.includes(ptkpUpper)) return { category: 'C', table: pphRules.ter_tables.C };
  throw new Error(`[Regulatory Execution Failure] Invalid PTKP status provided: ${ptkp}`);
}

// Monthly TER Calculation (Jan-Nov)
function calculatePPh21Monthly(grossSalary, ptkpStatus = 'TK/0', taxpayerIdentity = true, dateStr) {
  const salary = clampRupiah(grossSalary);
  const activeDateStr = dateStr || '2026-03-01';
  const pphRules = getRulesForDate(activeDateStr);
  const { category, table } = getTerCategory(ptkpStatus, pphRules);

  let isNPWPValid = true;
  let identityStatusStr = 'validated_nik_npwp';

  if (typeof taxpayerIdentity === 'boolean') {
    isNPWPValid = taxpayerIdentity;
    identityStatusStr = isNPWPValid ? 'validated_nik_npwp' : 'unvalidated';
  } else if (typeof taxpayerIdentity === 'string') {
    identityStatusStr = taxpayerIdentity.toLowerCase().trim();
    isNPWPValid = ['validated_nik_npwp', 'npwp', 'validated'].includes(identityStatusStr);
  }

  let appliedRate = 0;
  for (const entry of table) {
    const limit = parseMaxLimit(entry.max);
    if (salary <= limit) {
      appliedRate = entry.rate;
      break;
    }
  }

  let baseWithholding = Math.round(salary * appliedRate);
  let penaltyApplied = false;

  if (!isNPWPValid) {
    baseWithholding = Math.round(baseWithholding * pphRules.non_npwp_penalty_rate);
    penaltyApplied = true;
  }

  return {
    grossSalary: salary,
    ptkpStatus: ptkpStatus.toUpperCase(),
    terCategory: category,
    effectiveRate: appliedRate,
    effectiveRatePercent: `${(appliedRate * 100).toFixed(2)}%`,
    hasNpwp: isNPWPValid,
    identityStatus: identityStatusStr,
    penaltyApplied,
    monthlyTaxWithheld: baseWithholding,
    calculationDate: activeDateStr,
    rulesetId: pphRules.rulesetId,
    rulesetVersion: pphRules.rulesetVersion,
    statutoryReference: pphRules.statute
  };
}

// Article 17 UU HPP Progressive Rates for Annual Tax
function calculateArticle17AnnualTax(netTaxableIncome, dateStr) {
  const activeDateStr = dateStr || '2026-03-01';
  const pphRules = getRulesForDate(activeDateStr);
  let pkp = Math.max(0, Math.floor(Number(netTaxableIncome) / 1000) * 1000);
  if (pkp <= 0) return 0;

  let totalTax = 0;
  let prevLimit = 0;

  for (const b of pphRules.article_17_brackets) {
    const limit = parseMaxLimit(b.limit);
    if (pkp > prevLimit) {
      const taxableInBracket = Math.min(pkp - prevLimit, limit - prevLimit);
      totalTax += taxableInBracket * b.rate;
      prevLimit = limit;
    } else {
      break;
    }
  }

  return Math.round(totalTax);
}

// December Annual Reconciliation
function calculatePPh21DecemberReconciliation(annualGrossIncome, ptkpStatus = 'TK/0', janToNovTaxWithheld = 0, monthlyJhtEmployeeDeduction = 0, taxpayerIdentity = true, dateStr) {
  const activeDateStr = dateStr || '2026-03-01';
  const pphRules = getRulesForDate(activeDateStr);
  const annualGross = clampRupiah(annualGrossIncome);
  const ptkpAmount = pphRules.ptkp_thresholds[ptkpStatus.toUpperCase()] || pphRules.ptkp_thresholds['TK/0'];

  const calculatedBiayaJabatan = Math.min(annualGross * pphRules.biaya_jabatan.rate, pphRules.biaya_jabatan.annual_max);
  
  const annualJhtDeduction = clampRupiah(monthlyJhtEmployeeDeduction) * 12;
  const totalDeductions = calculatedBiayaJabatan + annualJhtDeduction;

  const netAnnualIncome = Math.max(0, annualGross - totalDeductions);
  const pkp = Math.max(0, netAnnualIncome - ptkpAmount);

  let isNPWPValid = true;
  if (typeof taxpayerIdentity === 'boolean') {
    isNPWPValid = taxpayerIdentity;
  } else if (typeof taxpayerIdentity === 'string') {
    isNPWPValid = ['validated_nik_npwp', 'npwp', 'validated'].includes(taxpayerIdentity.toLowerCase().trim());
  }

  let totalAnnualTax = calculateArticle17AnnualTax(pkp, activeDateStr);
  if (!isNPWPValid) {
    totalAnnualTax = Math.round(totalAnnualTax * pphRules.non_npwp_penalty_rate);
  }

  const netTaxDiff = totalAnnualTax - clampRupiah(janToNovTaxWithheld);
  const isOverpaid = netTaxDiff < 0;
  const decTaxToWithhold = isOverpaid ? 0 : netTaxDiff;
  const overpaymentRefundAmount = isOverpaid ? Math.abs(netTaxDiff) : 0;
  const taxStatus = isOverpaid ? 'LEBIH_BAYAR' : (netTaxDiff === 0 ? 'NIHIL' : 'KURANG_BAYAR');

  return {
    annualGrossIncome: annualGross,
    ptkpStatus: ptkpStatus.toUpperCase(),
    ptkpAmount,
    biayaJabatan: calculatedBiayaJabatan,
    annualJhtDeduction,
    netAnnualIncome,
    pkp,
    totalAnnualTaxArt17: totalAnnualTax,
    janToNovTaxWithheld: clampRupiah(janToNovTaxWithheld),
    decemberTaxWithheld: decTaxToWithhold,
    isOverpaid,
    overpaymentRefundAmount,
    taxStatus,
    statutoryAction: isOverpaid
      ? "Pemberi kerja wajib mengembalikan kelebihan pemotongan sebesar Rp " + overpaymentRefundAmount.toLocaleString('id-ID') + " kepada pegawai beserta bukti potong 1721-A1 paling lambat akhir bulan berikutnya (PMK 168/2023 Pasal 14 ayat (2))."
      : (decTaxToWithhold > 0 ? "Pemberi kerja memotong sisa pajak terutang sebesar Rp " + decTaxToWithhold.toLocaleString('id-ID') + " pada penggajian Desember." : "Kewajiban pajak tahunan telah terpenuhi (Nihil)."),
    hasNpwp: isNPWPValid,
    calculationDate: activeDateStr,
    rulesetId: pphRules.rulesetId,
    rulesetVersion: pphRules.rulesetVersion,
    statutoryReference: `PMK No. 168/2023 (Masa Pajak Terakhir / Rekonsiliasi Desember) - Ruleset: ${pphRules.statute}`
  };
}

module.exports = {
  calculatePPh21Monthly,
  calculateArticle17AnnualTax,
  calculatePPh21DecemberReconciliation,
  getTerCategory: (ptkp) => getTerCategory(ptkp, getRulesForDate()),
  PTKP_VALUES: pphRulesData.rulesets[0].ptkp_thresholds
};
