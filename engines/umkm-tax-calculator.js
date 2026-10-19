/**
 * Deterministic UMKM Final Tax Calculator Engine (PP No. 55/2022 & PP No. 20/2026)
 * Computes 0.5% final PPh for MSMEs including the Rp 500M annual non-taxable threshold for Individual Taxpayers.
 * Implements temporal rulesets for PP 55/2022 and PP 20/2026.
 */

const umkmRules = require('./rules/umkm.json');
const { verifyRulesetIntegrity } = require('./rules/integrity');

// Enforce ruleset integrity on load
verifyRulesetIntegrity('umkm.json');

const UMKM_FREE_THRESHOLD_OP = 500000000; // Rp 500.000.000 (Individual threshold)

function getRulesForDate(dateStr) {
  if (!dateStr) {
    throw new Error("effectiveDate (dateStr) is a required parameter.");
  }
  
  const checkDate = new Date(dateStr);
  if (isNaN(checkDate.getTime())) {
    throw new Error(`Invalid date format provided: ${dateStr}`);
  }

  for (const r of umkmRules.rulesets) {
    const fromDate = new Date(r.effective_from.includes('T') ? r.effective_from : r.effective_from + 'T00:00:00.000Z');
    const toDate = r.effective_to === 'Infinity' ? new Date('9999-12-31T23:59:59.999Z') : new Date(r.effective_to.includes('T') ? r.effective_to : r.effective_to + 'T23:59:59.999Z');
    
    if (checkDate >= fromDate && checkDate <= toDate) {
      return r;
    }
  }

  throw new Error(`No regulatory UMKM ruleset available for date: ${dateStr}`);
}

function calculateUmkmFinalTax(grossRevenueYtd, currentMonthRevenue, taxpayerType = 'individual', dateStr = null) {
  const activeDateStr = dateStr || new Date().toISOString().split('T')[0];
  const { requireRupiah } = require('./production-contract');
  const ytdBefore = requireRupiah(grossRevenueYtd, 'grossRevenueYtd');
  const currentRevenue = requireRupiah(currentMonthRevenue, 'currentMonthRevenue');
  const typeLower = (taxpayerType || 'individual').toLowerCase().trim();

  const rules = getRulesForDate(activeDateStr);
  
  // Resolve eligibility based on ruleset and turnover
  const isTypeEligible = rules.eligible_taxpayers.includes(typeLower);
  const totalTurnover = ytdBefore + currentRevenue;
  const isTurnoverEligible = totalTurnover <= rules.max_turnover_limit;
  const isEligible = isTypeEligible && isTurnoverEligible;

  let taxableRevenue = 0;
  let taxExemptRevenue = 0;

  if (isEligible) {
    if (typeLower === 'individual' || typeLower === 'orang_pribadi') {
      if (totalTurnover <= rules.individual_threshold) {
        taxExemptRevenue = currentRevenue;
        taxableRevenue = 0;
      } else if (ytdBefore < rules.individual_threshold) {
        taxExemptRevenue = rules.individual_threshold - ytdBefore;
        taxableRevenue = currentRevenue - taxExemptRevenue;
      } else {
        taxExemptRevenue = 0;
        taxableRevenue = currentRevenue;
      }
    } else {
      // PT Perorangan or Koperasi (or Corporate PT/CV under old 2022 ruleset)
      taxableRevenue = currentRevenue;
      taxExemptRevenue = 0;
    }
  } else {
    // If not eligible (wrong type or turnover > 4.8B), no final tax is calculated here (handled under general PPh)
    taxableRevenue = 0;
    taxExemptRevenue = currentRevenue;
  }

  const taxDue = isEligible ? Math.round(taxableRevenue * rules.tax_rate) : 0;

  let displayType = taxpayerType;
  if (typeLower === 'individual' || typeLower === 'orang_pribadi') {
    displayType = 'Orang Pribadi (Individual)';
  } else if (typeLower === 'single_person_company' || typeLower === 'perseroan_perorangan') {
    displayType = 'Perseroan Perorangan (PT Perorangan)';
  } else if (typeLower === 'cooperative' || typeLower === 'koperasi') {
    displayType = 'Koperasi (Cooperative)';
  } else {
    displayType = 'Badan (Corporate PT/CV/Firma/dll)';
  }

  return {
    isEligible,
    taxpayerType: displayType,
    grossRevenueYtdBefore: ytdBefore,
    currentMonthRevenue: currentRevenue,
    taxExemptRevenue,
    taxableRevenue,
    finalTaxRatePercent: isEligible ? `${(rules.tax_rate * 100).toFixed(2)}%` : "0.00%",
    finalTaxDue: taxDue,
    rulesetId: rules.rulesetId,
    rulesetVersion: rules.rulesetVersion,
    statutoryReference: `${rules.source.regulation} ${rules.source.article}`
  };
}

module.exports = {
  calculateUmkmFinalTax,
  getRulesForDate,
  UMKM_FREE_THRESHOLD_OP
};
