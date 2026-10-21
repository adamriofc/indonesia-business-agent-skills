const assert = require('assert');
const { calculateHourlyWage, calculateDailyOvertime, calculateMonthlyOvertimeSheet } = require('../../engines/overtime-calculator');

function runOvertimeEngineTests() {
  console.log("⏱️ Running Statutory Overtime Engine Tests (PP 35/2021)...\n");

  const monthlyWage = 5190000; // 5.19M / 173 = exactly 30,000 per hour
  const hourly = calculateHourlyWage(monthlyWage);
  assert.strictEqual(hourly, 30000);

  // 1. Workday Overtime: 3 hours
  // Hour 1: 1.5x = 45,000
  // Hour 2: 2.0x = 60,000
  // Hour 3: 2.0x = 60,000
  // Total = 165,000
  const workdayRes = calculateDailyOvertime({
    monthlyWage,
    hours: 3,
    dayType: 'WORKDAY'
  });
  assert.strictEqual(workdayRes.totalOvertimePay, 165000);
  assert.strictEqual(workdayRes.breakdown.length, 3);
  assert.strictEqual(workdayRes.breakdown[0].amount, 45000);
  assert.strictEqual(workdayRes.breakdown[1].amount, 60000);
  assert.strictEqual(workdayRes.breakdown[2].amount, 60000);

  // 2. Weekly Rest (5 Days Workweek): 10 hours
  // Hours 1-8: 8 * 2.0 * 30,000 = 480,000
  // Hour 9: 1 * 3.0 * 30,000 = 90,000
  // Hour 10: 1 * 4.0 * 30,000 = 120,000
  // Total = 690,000
  const holidayRes = calculateDailyOvertime({
    monthlyWage,
    hours: 10,
    dayType: 'WEEKLY_REST_5_DAYS'
  });
  assert.strictEqual(holidayRes.totalOvertimePay, 690000);
  assert.strictEqual(holidayRes.breakdown.length, 10);
  assert.strictEqual(holidayRes.breakdown[8].multiplier, 3.0);
  assert.strictEqual(holidayRes.breakdown[9].multiplier, 4.0);

  // 3. Weekly Rest (6 Days Workweek): 9 hours
  // Hours 1-7: 7 * 2.0 * 30,000 = 420,000
  // Hour 8: 1 * 3.0 * 30,000 = 90,000
  // Hour 9: 1 * 4.0 * 30,000 = 120,000
  // Total = 630,000
  const holiday6Res = calculateDailyOvertime({
    monthlyWage,
    hours: 9,
    dayType: 'WEEKLY_REST_6_DAYS'
  });
  assert.strictEqual(holiday6Res.totalOvertimePay, 630000);

  // 4. Monthly Overtime Sheet Aggregation
  const sheet = calculateMonthlyOvertimeSheet(monthlyWage, 0, [
    { date: '2026-03-02', dayType: 'WORKDAY', hours: 2 }, // 45k + 60k = 105k
    { date: '2026-03-07', dayType: 'WEEKLY_REST_5_DAYS', hours: 4 } // 4 * 60k = 240k
  ]);
  assert.strictEqual(sheet.totalOvertimeHours, 6);
  assert.strictEqual(sheet.grandTotalOvertimePay, 345000);

  console.log("✅ Overtime Engine Tests PASSED 100%!");
}

runOvertimeEngineTests();
