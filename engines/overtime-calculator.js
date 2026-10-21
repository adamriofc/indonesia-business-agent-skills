/**
 * Deterministic Statutory Overtime Calculation Engine (`engines/overtime-calculator.js`)
 *
 * Implements exact overtime formulas per Government Regulation:
 *   - PP No. 35 Tahun 2021 Pasal 31 & 32 (Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan PHK)
 *   - Statutory Hourly Wage: 1/173 x (Gaji Pokok + Tunjangan Tetap)
 *
 * Zero external dependencies. Pure Node.js.
 */

function calculateHourlyWage(monthlyWage, fixedAllowance = 0) {
  const base = Math.max(0, Number(monthlyWage) || 0);
  const allowance = Math.max(0, Number(fixedAllowance) || 0);
  const total = base + allowance;
  return Math.round(total / 173);
}

/**
 * Calculates overtime pay for a specific day type and duration.
 */
function calculateDailyOvertime({
  monthlyWage = 0,
  fixedAllowance = 0,
  hours = 1,
  dayType = 'WORKDAY' // 'WORKDAY', 'WEEKLY_REST_5_DAYS', 'WEEKLY_REST_6_DAYS', 'PUBLIC_HOLIDAY'
}) {
  const wage = Math.max(0, Number(monthlyWage) || 0);
  const allowance = Math.max(0, Number(fixedAllowance) || 0);
  const totalMonthlyWage = wage + allowance;
  const numHours = Math.max(0, Number(hours) || 0);
  const type = String(dayType || 'WORKDAY').toUpperCase().trim();

  const hourlyWage = calculateHourlyWage(wage, allowance);
  const breakdown = [];
  let totalOvertimePay = 0;

  if (type === 'WORKDAY') {
    // Hari Kerja Biasa (Pasal 31 ayat (1)):
    // Jam pertama: 1.5x upah sejam
    // Jam kedua dan seterusnya: 2.0x upah sejam
    for (let h = 1; h <= Math.ceil(numHours); h++) {
      const duration = (h <= numHours) ? 1 : (numHours - Math.floor(numHours));
      if (duration <= 0) break;

      const multiplier = (h === 1) ? 1.5 : 2.0;
      const amount = Math.round(duration * multiplier * hourlyWage);
      totalOvertimePay += amount;
      breakdown.push({
        hourIndex: h,
        durationHours: duration,
        multiplier,
        amount
      });
    }
  } else if (type === 'WEEKLY_REST_5_DAYS' || type === 'PUBLIC_HOLIDAY') {
    // Hari Libur Istirahat Mingguan 5 Hari Kerja (Pasal 31 ayat (2)):
    // 8 jam pertama: 2x upah sejam
    // Jam ke-9: 3x upah sejam
    // Jam ke-10, 11, 12: 4x upah sejam
    for (let h = 1; h <= Math.ceil(numHours); h++) {
      const duration = (h <= numHours) ? 1 : (numHours - Math.floor(numHours));
      if (duration <= 0) break;

      let multiplier = 2.0;
      if (h === 9) multiplier = 3.0;
      else if (h >= 10) multiplier = 4.0;

      const amount = Math.round(duration * multiplier * hourlyWage);
      totalOvertimePay += amount;
      breakdown.push({
        hourIndex: h,
        durationHours: duration,
        multiplier,
        amount
      });
    }
  } else if (type === 'WEEKLY_REST_6_DAYS') {
    // Hari Libur Istirahat Mingguan 6 Hari Kerja (Pasal 31 ayat (3)):
    // 7 jam pertama: 2x upah sejam
    // Jam ke-8: 3x upah sejam
    // Jam ke-9, 10, 11: 4x upah sejam
    for (let h = 1; h <= Math.ceil(numHours); h++) {
      const duration = (h <= numHours) ? 1 : (numHours - Math.floor(numHours));
      if (duration <= 0) break;

      let multiplier = 2.0;
      if (h === 8) multiplier = 3.0;
      else if (h >= 9) multiplier = 4.0;

      const amount = Math.round(duration * multiplier * hourlyWage);
      totalOvertimePay += amount;
      breakdown.push({
        hourIndex: h,
        durationHours: duration,
        multiplier,
        amount
      });
    }
  } else {
    throw new Error(`INVALID_INPUT: Unsupported dayType '${dayType}'. Valid types: WORKDAY, WEEKLY_REST_5_DAYS, WEEKLY_REST_6_DAYS, PUBLIC_HOLIDAY`);
  }

  return {
    monthlyWage: wage,
    fixedAllowance: allowance,
    totalMonthlyWage,
    hourlyWage,
    dayType: type,
    hoursWorked: numHours,
    totalOvertimePay,
    breakdown,
    statutoryReference: "PP No. 35 Tahun 2021 Pasal 31 & 32"
  };
}

/**
 * Aggregates a monthly sheet of multiple overtime records.
 */
function calculateMonthlyOvertimeSheet(monthlyWage, fixedAllowance = 0, records = []) {
  const wage = Math.max(0, Number(monthlyWage) || 0);
  const allowance = Math.max(0, Number(fixedAllowance) || 0);

  let grandTotalOvertimePay = 0;
  let totalOvertimeHours = 0;
  const processedRecords = [];

  for (const rec of records) {
    const calc = calculateDailyOvertime({
      monthlyWage: wage,
      fixedAllowance: allowance,
      hours: rec.hours || 0,
      dayType: rec.dayType || 'WORKDAY'
    });
    grandTotalOvertimePay += calc.totalOvertimePay;
    totalOvertimeHours += calc.hoursWorked;
    processedRecords.push({
      date: rec.date || null,
      dayType: calc.dayType,
      hoursWorked: calc.hoursWorked,
      overtimePay: calc.totalOvertimePay
    });
  }

  return {
    monthlyWage: wage,
    fixedAllowance: allowance,
    hourlyWage: calculateHourlyWage(wage, allowance),
    totalOvertimeHours,
    grandTotalOvertimePay,
    records: processedRecords,
    statutoryReference: "PP No. 35 Tahun 2021 Pasal 31 & 32"
  };
}

module.exports = {
  calculateHourlyWage,
  calculateDailyOvertime,
  calculateMonthlyOvertimeSheet
};
