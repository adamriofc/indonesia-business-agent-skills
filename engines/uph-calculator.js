/**
 * Deterministic Uang Penggantian Hak (UPH) Calculator Engine (`engines/uph-calculator.js`)
 *
 * Implements statutory termination compensation entitlements per:
 *   - PP No. 35 Tahun 2021 Pasal 40 ayat (4)
 *   - Unused paid annual leave, relocation allowance, and contractual separation benefits
 *
 * Zero external dependencies. Pure Node.js.
 */

function calculateUphPayout({
  monthlyWage = 0,
  remainingLeaveDays = 0,
  monthlyWorkingDays = 25,
  relocationExpense = 0,
  medicalHousingAllowance = 0, // 15% housing/medical was repealed by UU Cipta Kerja, supported only if explicitly in PKB/contract
  contractualAdditions = 0
}) {
  const wage = Math.max(0, Number(monthlyWage) || 0);
  const leaveDays = Math.max(0, Number(remainingLeaveDays) || 0);
  const workingDays = Math.max(1, Number(monthlyWorkingDays) || 25);
  const relocation = Math.max(0, Number(relocationExpense) || 0);
  const medHousing = Math.max(0, Number(medicalHousingAllowance) || 0);
  const additions = Math.max(0, Number(contractualAdditions) || 0);

  // Pasal 40 ayat (4) huruf a: Cuti tahunan yang belum diambil dan belum gugur
  const dailyWage = wage / workingDays;
  const leavePayoutAmount = Math.round(leaveDays * dailyWage);

  const totalUphAmount = leavePayoutAmount + relocation + medHousing + additions;

  return {
    monthlyWage: wage,
    remainingLeaveDays: leaveDays,
    monthlyWorkingDays: workingDays,
    breakdown: {
      unusedLeaveCompensation: {
        days: leaveDays,
        dailyRate: Math.round(dailyWage),
        amount: leavePayoutAmount,
        legalBasis: "PP 35/2021 Pasal 40 ayat (4) huruf a"
      },
      relocationExpense: {
        amount: relocation,
        legalBasis: "PP 35/2021 Pasal 40 ayat (4) huruf b"
      },
      contractualAdditions: {
        amount: additions + medHousing,
        legalBasis: "PP 35/2021 Pasal 40 ayat (4) huruf c"
      }
    },
    totalUphAmount,
    statutoryReference: "PP No. 35 Tahun 2021 Pasal 40 ayat (4)"
  };
}

module.exports = {
  calculateUphPayout
};
