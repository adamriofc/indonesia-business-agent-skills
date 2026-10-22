/**
 * Unit Tests for Quantitative Strategic Planning Matrix (QSPM) Engine (`tests/units/qspm-engine.test.js`)
 */

const assert = require('assert');
const { evaluateQspm } = require('../../engines/qspm-engine');
const { checkFrameworkApplicability } = require('../../engines/framework-applicability');
const { applyStrategicProtocol } = require('../../engines/strategic-protocol');

function runQspmTests() {
  console.log("🎯 Running Quantitative Strategic Planning Matrix (QSPM) Engine Tests...\n");

  // -----------------------------------------------------------------
  // 1. Valid QSPM Evaluation (Flat Factor List)
  // -----------------------------------------------------------------
  console.log("  [1/5] Testing 2-Strategy Decision Evaluation (Flat Factor List)...");
  const validFlatInput = {
    factors: [
      { factor: "Keahlian AI Deterministik", weight: 0.30, category: "STRENGTH" },
      { factor: "Keterbatasan Saluran Penjualan", weight: 0.20, category: "WEAKNESS" },
      { factor: "Permintaan Kepatuhan Regulasi Tinggi", weight: 0.30, category: "OPPORTUNITY" },
      { factor: "Pesaing Global Modal Besar", weight: 0.20, category: "THREAT" }
    ],
    strategies: [
      {
        id: "strat_enterprise",
        name: "Penetrasi Pasar B2B Enterprise Compliance",
        scores: [4, 3, 4, 2] // TAS: 0.3*4(1.2) + 0.2*3(0.6) + 0.3*4(1.2) + 0.2*2(0.4) = 3.40
      },
      {
        id: "strat_consumer",
        name: "Peluncuran Aplikasi D2C Consumer App",
        scores: [2, 1, 2, 4] // TAS: 0.3*2(0.6) + 0.2*1(0.2) + 0.3*2(0.6) + 0.2*4(0.8) = 2.20
      }
    ]
  };

  const res1 = evaluateQspm(validFlatInput);
  assert.strictEqual(res1.totalFactorsEvaluated, 4);
  assert.strictEqual(res1.totalStrategiesEvaluated, 2);
  assert.strictEqual(res1.decisionMetrics.topStrategyId, "strat_enterprise");
  assert.strictEqual(res1.decisionMetrics.topScore, 3.4);
  assert.strictEqual(res1.decisionMetrics.runnerUpStrategyId, "strat_consumer");
  assert.strictEqual(res1.decisionMetrics.runnerUpScore, 2.2);
  assert.strictEqual(res1.decisionMetrics.deltaTas, 1.2);
  assert.strictEqual(res1.decisionMetrics.dominanceRatio, 1.55); // 3.4 / 2.2 = 1.545... -> 1.55
  assert.strictEqual(res1.rankedStrategies[0].isTopRanked, true);
  assert.strictEqual(res1.rankedStrategies[1].isTopRanked, false);

  // -----------------------------------------------------------------
  // 2. Structured Factor Input (Internal + External from SWOT)
  // -----------------------------------------------------------------
  console.log("  [2/5] Testing Structured SWOT IFE/EFE Factors Input...");
  const structuredInput = {
    factors: {
      internal: {
        strengths: [{ factor: "Teknologi Unggul", weight: 0.30 }],
        weaknesses: [{ factor: "Biaya Overhead", weight: 0.20 }]
      },
      external: {
        opportunities: [{ factor: "Regulasi Baru Mandat UU", weight: 0.30 }],
        threats: [{ factor: "Inflasi Makro", weight: 0.20 }]
      }
    },
    strategies: [
      {
        id: "s1",
        name: "Strategi Solusi Regulasi",
        scores: {
          "Teknologi Unggul": 4,
          "Biaya Overhead": 2,
          "Regulasi Baru Mandat UU": 4,
          "Inflasi Makro": 1
        }
      },
      {
        id: "s2",
        name: "Strategi Efisiensi Biaya",
        scores: {
          "Teknologi Unggul": 2,
          "Biaya Overhead": 4,
          "Regulasi Baru Mandat UU": 2,
          "Inflasi Makro": 3
        }
      }
    ]
  };

  const res2 = evaluateQspm(structuredInput);
  assert.strictEqual(res2.totalFactorsEvaluated, 4);
  assert.strictEqual(res2.rankedStrategies.length, 2);
  assert.strictEqual(res2.decisionMetrics.topStrategyId, "s1");

  // -----------------------------------------------------------------
  // 3. Not Applicable / Null Attractiveness Scores (AS = 0)
  // -----------------------------------------------------------------
  console.log("  [3/5] Testing Not Applicable (AS = 0 / null) Handling...");
  const naInput = {
    factors: [
      { factor: "Faktor Relevan", weight: 0.60 },
      { factor: "Faktor Netral Tidak Berdampak", weight: 0.40 }
    ],
    strategies: [
      {
        id: "strat_a",
        name: "Strategi A",
        scores: [4, null] // null AS -> 0
      },
      {
        id: "strat_b",
        name: "Strategi B",
        scores: [3, 0] // 0 AS -> 0
      }
    ]
  };

  const resNa = evaluateQspm(naInput);
  assert.strictEqual(resNa.decisionMetrics.topScore, 2.4); // 0.60 * 4 = 2.4
  assert.strictEqual(resNa.decisionMetrics.runnerUpScore, 1.8); // 0.60 * 3 = 1.8

  // -----------------------------------------------------------------
  // 4. Invariant Boundaries & Fail-Closed Error Handling
  // -----------------------------------------------------------------
  console.log("  [4/5] Testing Invariant Error Boundaries...");

  // 4a. Weights sum != 1.0
  assert.throws(() => {
    evaluateQspm({
      factors: [
        { factor: "F1", weight: 0.5 },
        { factor: "F2", weight: 0.3 } // sum = 0.8 != 1.0
      ],
      strategies: [{ id: "s1", scores: [1, 1] }, { id: "s2", scores: [2, 2] }]
    });
  }, /INVALID_INPUT.*must equal 1\.0/);

  // 4b. Attractiveness score out of bounds (> 4)
  assert.throws(() => {
    evaluateQspm({
      factors: [
        { factor: "F1", weight: 0.5 },
        { factor: "F2", weight: 0.5 }
      ],
      strategies: [{ id: "s1", scores: [5, 1] }, { id: "s2", scores: [2, 2] }]
    });
  }, /INVALID_INPUT.*Attractiveness Score.*between 1 and 4/);

  // 4c. Fewer than 2 strategies
  assert.throws(() => {
    evaluateQspm({
      factors: [{ factor: "F1", weight: 1.0 }],
      strategies: [{ id: "s1", scores: [3] }]
    });
  }, /INVALID_INPUT.*at least 2 alternative strategies/);

  // -----------------------------------------------------------------
  // 5. Framework Applicability, Strategic Protocol & Zero-Prescription
  // -----------------------------------------------------------------
  console.log("  [5/5] Testing Applicability, Protocol Wiring & Zero-Prescription Policy...");
  const appRes = checkFrameworkApplicability({
    frameworkName: 'qspm-matrix',
    kbliCode: '10710' // Roti & Bakery (Product Manufacturing)
  });
  assert.strictEqual(appRes.applicabilityStatus, 'NATIVE');
  assert.strictEqual(appRes.unitOfAnalysis, 'PRODUCT_LINE_EXPANSION_STRATEGY');

  const protoRes = applyStrategicProtocol({
    frameworkName: 'qspm-matrix',
    kbliCode: '70209', // Konsultasi Manajemen
    activityName: 'Konsultasi Manajemen'
  });
  assert.strictEqual(protoRes.applicability.status, 'ADAPTABLE');

  // Zero-Prescription Verification: Output must NOT contain subjective advice
  const serialized = JSON.stringify(res1);
  assert.ok(!serialized.includes("harus segera"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("sebaiknya"), "Engine violated zero-prescription policy");
  assert.ok(!serialized.includes("kami menyarankan"), "Engine violated zero-prescription policy");

  console.log("\n✅ Quantitative Strategic Planning Matrix (QSPM) Engine Tests PASSED 100%!");
}

if (require.main === module) {
  runQspmTests();
}

module.exports = {
  runQspmTests
};
