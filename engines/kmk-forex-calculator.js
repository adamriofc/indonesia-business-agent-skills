/**
 * Statutory Kurs Pajak KMK & Offshore Withholding Calculator (`engines/kmk-forex-calculator.js`)
 *
 * Implements deterministic foreign currency conversion and withholding tax calculations per:
 *   - UU PPh Pasal 1 ayat (3) & Pasal 26
 *   - UU PPN 12% (UU HPP) atas Pemanfaatan JKP dari Luar Daerah Pabean
 *   - Keputusan Menteri Keuangan (KMK) tentang Nilai Kurs sebagai Dasar Pelunasan Bea Masuk, PPN, dan PPh
 *
 * Zero external dependencies. Pure Node.js.
 */

const kmkRules = require('./rules/kmk-rates.json');
const { verifyRulesetIntegrity } = require('./rules/integrity');
const { requireRupiah } = require('./production-contract');

// Validate ruleset integrity
verifyRulesetIntegrity('kmk-rates.json');

function resolveKmkRuleset(dateStr) {
  const checkDate = new Date(dateStr || new Date().toISOString().slice(0, 10));
  for (const r of kmkRules.rulesets) {
    const fromDate = new Date(r.effective_from.includes('T') ? r.effective_from : r.effective_from + 'T00:00:00.000Z');
    const toDate = r.effective_to === 'Infinity' ? new Date('9999-12-31T23:59:59.999Z') : new Date(r.effective_to.includes('T') ? r.effective_to : r.effective_to + 'T23:59:59.999Z');
    if (checkDate >= fromDate && checkDate <= toDate) {
      return r;
    }
  }
  return kmkRules.rulesets[0];
}

/**
 * Converts a foreign currency amount to Indonesian Rupiah based on official KMK tax rate.
 */
function calculateKmkForexConversion({
  amountForeign = 0,
  currency = 'USD',
  dateStr = null
}) {
  const amount = Math.max(0, Number(amountForeign) || 0);
  const curr = String(currency || 'USD').toUpperCase().trim();
  const activeRuleset = resolveKmkRuleset(dateStr);

  const rate = activeRuleset.rates[curr];
  if (!rate) {
    throw new Error(`INVALID_INPUT: Unsupported currency '${curr}'. Available: ${Object.keys(activeRuleset.rates).join(', ')}`);
  }

  const convertedIdr = Math.round(amount * rate);

  return {
    amountForeign: amount,
    currency: curr,
    kmkExchangeRate: rate,
    convertedIdr,
    rulesetId: activeRuleset.rulesetId,
    statutoryReference: `${activeRuleset.statute} (${activeRuleset.source.regulation})`
  };
}

/**
 * Calculates statutory offshore withholding tax (PPh 26 and/or PPN Jasa Luar Negeri) on forex invoices.
 */
function calculateOffshoreWithholding({
  amountForeign = 0,
  currency = 'USD',
  dateStr = null,
  taxType = 'pph26', // 'pph26', 'ppn_jln', 'both'
  hasDgtForm = false,
  treatyRatePercent = null
}) {
  const conversion = calculateKmkForexConversion({ amountForeign, currency, dateStr });
  const dppIdr = conversion.convertedIdr;

  let pph26Rate = 0.20; // Default 20%
  if (hasDgtForm && treatyRatePercent !== null) {
    pph26Rate = Number(treatyRatePercent) / 100;
  }

  const pph26Amount = Math.round(dppIdr * pph26Rate);
  const ppnJlnRate = 0.12; // 12% PPN Jasa Luar Negeri
  const ppnJlnAmount = Math.round(dppIdr * ppnJlnRate);

  const type = taxType.toLowerCase().trim();
  let totalTaxIdr = 0;

  if (type === 'pph26') {
    totalTaxIdr = pph26Amount;
  } else if (type === 'ppn_jln' || type === 'ppn') {
    totalTaxIdr = ppnJlnAmount;
  } else {
    // both
    totalTaxIdr = pph26Amount + ppnJlnAmount;
  }

  return {
    ...conversion,
    dppIdr,
    taxType: type,
    pph26: {
      appliedRatePercent: `${(pph26Rate * 100).toFixed(2)}%`,
      hasDgtForm,
      taxWithheldIdr: pph26Amount,
      statutoryReference: hasDgtForm ? "P3B (Tax Treaty) & UU PPh Pasal 26" : "UU PPh Pasal 26 (Statutory 20%)"
    },
    ppnJasaLuarNegeri: {
      appliedRatePercent: "12.00%",
      taxDueIdr: ppnJlnAmount,
      statutoryReference: "UU No. 7/2021 (HPP) Pasal 4 ayat (1) huruf d & PMK 131/2024"
    },
    totalTaxWithheldIdr: totalTaxIdr,
    netForeignPaymentIdr: dppIdr - pph26Amount
  };
}

module.exports = {
  calculateKmkForexConversion,
  calculateOffshoreWithholding,
  resolveKmkRuleset
};
