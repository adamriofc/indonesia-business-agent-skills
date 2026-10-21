/**
 * Customs Valuation & Landed Cost Calculator Engine (`engines/landed-cost-calculator.js`)
 *
 * Computes exact landed cost for imported commodities per Indonesian customs law:
 *   - UU Kepabeanan (UU No. 17/2006) Nilai Pabean CIF = FOB + Freight + Asuransi
 *   - UU HPP No. 7/2021 (PPN 12% atas Nilai Impor = CIF + Bea Masuk)
 *   - PMK No. 34/PMK.010/2017 jo. PMK No. 41/2022 (PPh Pasal 22 Impor: 2.5% API vs 7.5% Non-API vs 15% Non-NPWP)
 *
 * Zero external dependencies. Pure Node.js.
 */

function calculateLandedCost({
  fobValueUsd = 0,
  freightUsd = 0,
  insuranceUsd = 0,
  exchangeRateKmk = 16250, // Nilai Kurs KMK
  dutyRatePercent = 0,     // Bea Masuk rate from BTKI 2022
  hasApi = true,           // Angka Pengenal Importir
  hasNpwp = true,
  unitsCount = 1
}) {
  const fob = Math.max(0, Number(fobValueUsd) || 0);
  const freight = Math.max(0, Number(freightUsd) || 0);
  const insurance = Math.max(0, Number(insuranceUsd) || 0);
  const rate = Math.max(1, Number(exchangeRateKmk) || 16250);
  const dutyRate = Math.max(0, Number(dutyRatePercent) || 0) / 100;
  const units = Math.max(1, Number(unitsCount) || 1);

  // 1. CIF Valuation in USD and IDR
  const cifUsd = fob + freight + insurance;
  const cifIdr = Math.round(cifUsd * rate);

  // 2. Bea Masuk (Customs Duty)
  const importDutyAmount = Math.round(cifIdr * dutyRate);

  // 3. Nilai Impor (Tax Base for PPN & PPh 22) = CIF + Bea Masuk
  const nilaiImpor = cifIdr + importDutyAmount;

  // 4. PPN 12%
  const ppnRate = 0.12;
  const ppnAmount = Math.round(nilaiImpor * ppnRate);

  // 5. PPh 22 Impor
  // With API: 2.5%; Without API: 7.5%; Without NPWP: 100% surcharge = 15.0%
  let pph22Rate = 0.025;
  if (!hasNpwp) {
    pph22Rate = 0.15;
  } else if (!hasApi) {
    pph22Rate = 0.075;
  }
  const pph22Amount = Math.round(nilaiImpor * pph22Rate);

  // 6. Total Landed Taxes & Final Landed Cost
  const totalLandedTaxes = importDutyAmount + ppnAmount + pph22Amount;
  const totalLandedCost = cifIdr + totalLandedTaxes;
  const unitLandedCost = Math.round(totalLandedCost / units);

  return {
    valuation: {
      fobUsd: fob,
      freightUsd: freight,
      insuranceUsd: insurance,
      cifUsd,
      exchangeRateKmk: rate,
      cifIdr
    },
    customsDuty: {
      dutyRatePercent: `${(dutyRate * 100).toFixed(2)}%`,
      importDutyAmount
    },
    importTaxes: {
      nilaiImporTaxBase: nilaiImpor,
      ppnRatePercent: "12.00%",
      ppnAmount,
      pph22RatePercent: `${(pph22Rate * 100).toFixed(2)}%`,
      pph22Amount,
      hasApi,
      hasNpwp
    },
    totalLandedTaxes,
    totalLandedCostIdr: totalLandedCost,
    unitsCount: units,
    unitLandedCostIdr: unitLandedCost,
    statutoryReference: "UU No. 17/2006 (Kepabeanan), UU No. 7/2021 (HPP PPN 12%) & PMK 41/2022 (PPh 22)"
  };
}

module.exports = {
  calculateLandedCost
};
