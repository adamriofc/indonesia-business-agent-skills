/**
 * Unit Tests for Balanced Scorecard (BSC) Engine (`tests/units/balanced-scorecard.test.js`)
 */

const assert = require('assert');
const { evaluateBalancedScorecard } = require('../../engines/balanced-scorecard-engine');

function runBalancedScorecardTests() {
  console.log("📊 Running Balanced Scorecard (BSC) Deterministic Engine Tests...\n");

  // -----------------------------------------------------------------
  // 1. Private Commercial Scorecard with 4 Perspectives
  // -----------------------------------------------------------------
  console.log("  [1/6] Testing Private Commercial Scorecard & 4 Perspectives...");
  const validPrivateInput = {
    sector: "PRIVATE_COMMERCIAL",
    capRatio: 120.0,
    perspectives: [
      {
        id: "financial",
        name: "Perspektif Finansial",
        weight: 0.25,
        kpis: [
          { code: "FIN-01", name: "Pendapatan Bersih", weight: 0.60, target: 10000000000, actual: 11000000000, polarity: "MAXIMIZE" }, // 110% * 0.60 = 66
          { code: "FIN-02", name: "Rasio Beban Operasional", weight: 0.40, target: 0.50, actual: 0.45, polarity: "MINIMIZE" }         // (0.50/0.45)*100 = 111.11% * 0.40 = 44.444 -> 110.44%
        ]
      },
      {
        id: "customer",
        name: "Perspektif Pelanggan",
        weight: 0.25,
        kpis: [
          { code: "CUST-01", name: "NPS Customer Satisfaction", weight: 0.50, target: 80, actual: 88, polarity: "MAXIMIZE" },
          { code: "CUST-02", name: "Churn Rate", weight: 0.50, target: 5.0, actual: 4.0, polarity: "MINIMIZE" }
        ]
      },
      {
        id: "internal_process",
        name: "Perspektif Proses Bisnis Internal",
        weight: 0.25,
        kpis: [
          { code: "PROC-01", name: "Throughput Efficiency", weight: 1.0, target: 100, actual: 105, polarity: "MAXIMIZE" }
        ]
      },
      {
        id: "learning_growth",
        name: "Perspektif Pembelajaran & Pertumbuhan",
        weight: 0.25,
        kpis: [
          { code: "LRN-01", name: "Jam Pelatihan per Karyawan", weight: 1.0, target: 40, actual: 44, polarity: "MAXIMIZE" }
        ]
      }
    ]
  };

  const res1 = evaluateBalancedScorecard(validPrivateInput);
  assert.strictEqual(res1.sector, "PRIVATE_COMMERCIAL");
  assert.strictEqual(res1.compositeStatus, "GREEN");
  assert.ok(res1.compositeBscScore >= 100.0);
  assert.strictEqual(res1.perspectives.length, 4);
  assert.strictEqual(res1.strategyMapDiagnostics.hasBrokenLinks, false);

  // -----------------------------------------------------------------
  // 2. Cap Ratio Enforcement (120% KMK 467/2014 Limit)
  // -----------------------------------------------------------------
  console.log("  [2/6] Testing Statutory Cap Ratio (120% ceiling per KMK 467/2014)...");
  const cappedInput = {
    perspectives: [
      {
        id: "financial",
        name: "Finansial",
        weight: 1.0,
        kpis: [
          { code: "FIN-SUPER", name: "Extreme Overperformance", weight: 1.0, target: 100, actual: 250, polarity: "MAXIMIZE" } // raw = 250%
        ]
      }
    ]
  };

  const resCapped = evaluateBalancedScorecard(cappedInput);
  const kpi = resCapped.perspectives[0].kpis[0];
  assert.strictEqual(kpi.rawAchievementPercent, 250.0);
  assert.strictEqual(kpi.isCapped, true);
  assert.strictEqual(kpi.cappedAchievementPercent, 120.0);
  assert.strictEqual(resCapped.compositeBscScore, 120.0);

  // -----------------------------------------------------------------
  // 3. Polarity MINIMIZE Logic
  // -----------------------------------------------------------------
  console.log("  [3/6] Testing MINIMIZE Polarity (Lower actual is better)...");
  const minInput = {
    perspectives: [
      {
        id: "ops",
        name: "Operations",
        weight: 1.0,
        kpis: [
          // Target defect 10, actual 5 -> performance = 10 / 5 = 200% -> capped at 120%
          { code: "DEF-01", name: "Defect Count", weight: 0.5, target: 10, actual: 5, polarity: "MINIMIZE" },
          // Target defect 10, actual 20 -> performance = 10 / 20 = 50%
          { code: "DEF-02", name: "Defect Severe", weight: 0.5, target: 10, actual: 20, polarity: "MINIMIZE" }
        ]
      }
    ]
  };

  const resMin = evaluateBalancedScorecard(minInput);
  assert.strictEqual(resMin.perspectives[0].kpis[0].cappedAchievementPercent, 120.0);
  assert.strictEqual(resMin.perspectives[0].kpis[1].cappedAchievementPercent, 50.0);
  assert.strictEqual(resMin.perspectives[0].kpis[1].status, "RED");

  // -----------------------------------------------------------------
  // 4. Strategy Map Broken Link Detection (Anomali Kausalitas)
  // -----------------------------------------------------------------
  console.log("  [4/6] Testing Strategy Map Causal Broken Link Detection...");
  const brokenLinkInput = {
    sector: "PRIVATE_COMMERCIAL",
    perspectives: [
      {
        id: "financial",
        name: "Finansial",
        weight: 0.25,
        kpis: [{ code: "F1", name: "Net Profit", weight: 1.0, target: 100, actual: 50, polarity: "MAXIMIZE" }] // 50% (RED)
      },
      {
        id: "customer",
        name: "Pelanggan",
        weight: 0.25,
        kpis: [{ code: "C1", name: "CSAT", weight: 1.0, target: 100, actual: 95, polarity: "MAXIMIZE" }] // 95% (GREEN) -> Anomaly 3 (Customer green but Financial red)
      },
      {
        id: "internal_process",
        name: "Proses Internal",
        weight: 0.25,
        kpis: [{ code: "P1", name: "Process Lead Time", weight: 1.0, target: 100, actual: 65, polarity: "MAXIMIZE" }] // 65% (RED)
      },
      {
        id: "learning_growth",
        name: "Pembelajaran & Pertumbuhan",
        weight: 0.25,
        kpis: [{ code: "L1", name: "Training Hours", weight: 1.0, target: 100, actual: 95, polarity: "MAXIMIZE" }] // 95% (GREEN) -> Anomaly 1 (Learning green but Process red)
      }
    ]
  };

  const resBroken = evaluateBalancedScorecard(brokenLinkInput);
  assert.strictEqual(resBroken.strategyMapDiagnostics.hasBrokenLinks, true);
  assert.ok(resBroken.strategyMapDiagnostics.anomaliesCount >= 2);
  const codes = resBroken.strategyMapDiagnostics.causalAnomalies.map(a => a.anomalyCode);
  assert.ok(codes.includes("ANOMALY_TRAINING_NOT_CONVERTED_TO_PROCESS_EFFICIENCY"));
  assert.ok(codes.includes("ANOMALY_CUSTOMER_SATISFACTION_NOT_MONETIZED"));

  // -----------------------------------------------------------------
  // 5. Public / Government / BUMN Sector Hierarchy Model
  // -----------------------------------------------------------------
  console.log("  [5/6] Testing Public / Government / BUMN Sector Model...");
  const bumnInput = {
    sector: "PUBLIC_GOVERNMENT_BUMN",
    perspectives: [
      {
        id: "stakeholder",
        name: "Kepuasan Pemangku Kepentingan",
        weight: 0.35,
        kpis: [{ code: "STK-01", name: "Indeks Kepuasan Masyarakat", weight: 1.0, target: 85, actual: 90, polarity: "MAXIMIZE" }]
      },
      {
        id: "internal_process",
        name: "Proses Bisnis Internal",
        weight: 0.30,
        kpis: [{ code: "PRC-01", name: "Digital Service SLA", weight: 1.0, target: 99, actual: 99.5, polarity: "MAXIMIZE" }]
      },
      {
        id: "learning_growth",
        name: "SDM & Organisasi",
        weight: 0.20,
        kpis: [{ code: "SDM-01", name: "Sertifikasi Kompetensi", weight: 1.0, target: 50, actual: 55, polarity: "MAXIMIZE" }]
      },
      {
        id: "financial",
        name: "Akuntabilitas Anggaran",
        weight: 0.15,
        kpis: [{ code: "BUD-01", name: "Realisasi Penyerapan Anggaran", weight: 1.0, target: 95, actual: 96, polarity: "MAXIMIZE" }]
      }
    ]
  };

  const resBumn = evaluateBalancedScorecard(bumnInput);
  assert.strictEqual(resBumn.sector, "PUBLIC_GOVERNMENT_BUMN");
  assert.deepStrictEqual(resBumn.strategicHierarchy[0], "STAKEHOLDER_SATISFACTION");
  assert.ok(resBumn.statutoryFramework.includes("KMK No. 467/KMK.01/2014"));

  // -----------------------------------------------------------------
  // 6. Invariant & Error Boundaries
  // -----------------------------------------------------------------
  console.log("  [6/6] Testing Invariant Error Boundaries (Fail-Closed)...");

  // 6a. Perspective weights sum != 1.0
  assert.throws(() => {
    evaluateBalancedScorecard({
      perspectives: [
        { id: "p1", name: "P1", weight: 0.50, kpis: [{ target: 10, actual: 10, weight: 1.0 }] },
        { id: "p2", name: "P2", weight: 0.40, kpis: [{ target: 10, actual: 10, weight: 1.0 }] } // sum = 0.90
      ]
    });
  }, /INVALID_INPUT.*perspective weights must equal 1\.0/);

  // 6b. KPI weights sum != 1.0
  assert.throws(() => {
    evaluateBalancedScorecard({
      perspectives: [
        {
          id: "p1",
          name: "P1",
          weight: 1.0,
          kpis: [
            { code: "K1", name: "K1", target: 10, actual: 10, weight: 0.60 },
            { code: "K2", name: "K2", target: 10, actual: 10, weight: 0.30 } // sum = 0.90
          ]
        }
      ]
    });
  }, /INVALID_INPUT.*KPI weights.*must equal 1\.0/);

  // 6c. Target <= 0
  assert.throws(() => {
    evaluateBalancedScorecard({
      perspectives: [
        { id: "p1", name: "P1", weight: 1.0, kpis: [{ code: "K1", name: "K1", target: 0, actual: 10, weight: 1.0 }] }
      ]
    });
  }, /INVALID_INPUT.*target.*greater than zero/);

  console.log("\n✅ Balanced Scorecard Engine Tests PASSED 100%!");
}

if (require.main === module) {
  runBalancedScorecardTests();
}

module.exports = {
  runBalancedScorecardTests
};
