/**
 * Deterministic PKWT Compensation Payout Calculator Engine (PP No. 35/2021)
 * Computes mandatory compensation pay at contract completion for contract workers.
 */

function calculatePkwtCompensation(monthlyWage, tenureMonths) {
  const wage = Math.max(0, Number(monthlyWage) || 0);
  const tenure = Math.max(0, Number(tenureMonths) || 0);

  if (tenure < 1) {
    return {
      isEligible: false,
      tenureMonths: tenure,
      reason: "PKWT tenure is less than 1 month (PP 35/2021 Art. 15)",
      compensationPayout: 0
    };
  }

  let finalPayout = 0;
  let formulaStr = "";

  if (tenure === 12) {
    finalPayout = wage;
    formulaStr = "1 x Monthly Wage";
  } else {
    finalPayout = Math.round((tenure / 12) * wage);
    formulaStr = `(${tenure} / 12) x Monthly Wage`;
  }

  const isExceedingMaxTenure = tenure > 60;
  const statutoryWarning = isExceedingMaxTenure
    ? "PERINGATAN STATUTER: Masa kerja PKWT kumulatif (" + tenure + " bulan) melebihi batas maksimal 5 tahun (60 bulan) per PP 35/2021 Pasal 8. Demi hukum perjanjian kerja berubah status menjadi PKWTT (Tetap)."
    : null;

  return {
    isEligible: true,
    tenureMonths: tenure,
    monthlyWage: wage,
    formulaApplied: formulaStr,
    statutoryCompensationPayout: finalPayout,
    isExceedingMaxTenure,
    statutoryWarning,
    statutoryReference: "PP No. 35 Tahun 2021 Pasal 15 - 17 (jo. Pasal 8 batas maksimal 5 tahun)"
  };
}

module.exports = {
  calculatePkwtCompensation
};
