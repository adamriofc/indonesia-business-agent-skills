/**
 * Unit Tests for Quantitative SWOT & TOWS Engine (`tests/units/quantitative-swot.test.js`)
 */

const assert = require('assert');
const { evaluateQuantitativeSwot } = require('../../engines/quantitative-swot-engine');

function runQuantitativeSwotTests() {
  console.log("🧭 Running Quantitative SWOT & TOWS Matrix Engine Tests...\n");

  // -----------------------------------------------------------------
  // 1. Quadrant I: Aggressive (deltaX > 0, deltaY > 0)
  // -----------------------------------------------------------------
  console.log("  [1/6] Testing Quadrant I (Aggressive Expansion: ΔX > 0, ΔY > 0)...");
  const quad1Input = {
    internal: {
      strengths: [
        { factor: "Inovasi AI & Engine Deterministik", weight: 0.40, rating: 4 }, // 1.60
        { factor: "Tim R&D Ahli", weight: 0.20, rating: 3 }                       // 0.60 -> S = 2.20
      ],
      weaknesses: [
        { factor: "Brand awareness baru", weight: 0.25, rating: 2 },              // 0.50
        { factor: "Ketergantungan kanal tunggal", weight: 0.15, rating: 2 }       // 0.30 -> W = 0.80 -> ΔX = 1.40
      ]
    },
    external: {
      opportunities: [
        { factor: "Permintaan kepatuhan korporasi tinggi", weight: 0.45, rating: 4 }, // 1.80
        { factor: "Integrasi marketplace & ERP", weight: 0.20, rating: 3 }            // 0.60 -> O = 2.40
      ],
      threats: [
        { factor: "Kompetitor modal ventura asing", weight: 0.20, rating: 2 },        // 0.40
        { factor: "Ketidakpastian makro", weight: 0.15, rating: 2 }                   // 0.30 -> T = 0.70 -> ΔY = 1.70
      ]
    }
  };

  const res1 = evaluateQuantitativeSwot(quad1Input);
  assert.strictEqual(res1.strategicVector.quadrant, 'QUADRANT_I_AGGRESSIVE');
  assert.strictEqual(res1.strategicVector.strategicPosture, 'AGGRESSIVE_EXPANSION');
  assert.ok(res1.strategicVector.deltaX > 0);
  assert.ok(res1.strategicVector.deltaY > 0);
  assert.ok(res1.strategicVector.magnitude > 0);
  assert.ok(res1.strategicVector.angleDegrees >= 0 && res1.strategicVector.angleDegrees <= 90);
  assert.strictEqual(res1.ifeMatrix.internalPosition, 'STRONG_INTERNAL');
  assert.strictEqual(res1.efeMatrix.externalPosition, 'SUPERIOR_RESPONSE');

  // -----------------------------------------------------------------
  // 2. Quadrant II: Diversification (deltaX > 0, deltaY <= 0)
  // -----------------------------------------------------------------
  console.log("  [2/6] Testing Quadrant II (Competitive Diversification: ΔX > 0, ΔY <= 0)...");
  const quad2Input = {
    internal: {
      strengths: [{ factor: "Teknologi Paten", weight: 0.70, rating: 4 }], // 2.80
      weaknesses: [{ factor: "Biaya overhead", weight: 0.30, rating: 1 }]   // 0.30 -> ΔX = 2.50
    },
    external: {
      opportunities: [{ factor: "Pasar baru niche", weight: 0.20, rating: 2 }], // 0.40
      threats: [{ factor: "Regulasi restriktif berat", weight: 0.80, rating: 4 }] // 3.20 -> ΔY = -2.80
    }
  };

  const res2 = evaluateQuantitativeSwot(quad2Input);
  assert.strictEqual(res2.strategicVector.quadrant, 'QUADRANT_II_DIVERSIFICATION');
  assert.strictEqual(res2.strategicVector.strategicPosture, 'COMPETITIVE_DIVERSIFICATION');
  assert.ok(res2.strategicVector.deltaX > 0);
  assert.ok(res2.strategicVector.deltaY <= 0);

  // -----------------------------------------------------------------
  // 3. Quadrant III: Turnaround (deltaX <= 0, deltaY > 0)
  // -----------------------------------------------------------------
  console.log("  [3/6] Testing Quadrant III (Conservative Turnaround: ΔX <= 0, ΔY > 0)...");
  const quad3Input = {
    internal: {
      strengths: [{ factor: "Integritas tim", weight: 0.20, rating: 2 }],       // 0.40
      weaknesses: [{ factor: "Keterbatasan kas & mesin", weight: 0.80, rating: 4 }] // 3.20 -> ΔX = -2.80
    },
    external: {
      opportunities: [{ factor: "Lonjakan permintaan pasar", weight: 0.80, rating: 4 }], // 3.20
      threats: [{ factor: "Pesaing baru kecil", weight: 0.20, rating: 1 }]                // 0.20 -> ΔY = 3.00
    }
  };

  const res3 = evaluateQuantitativeSwot(quad3Input);
  assert.strictEqual(res3.strategicVector.quadrant, 'QUADRANT_III_TURNAROUND');
  assert.strictEqual(res3.strategicVector.strategicPosture, 'CONSERVATIVE_TURNAROUND');
  assert.ok(res3.strategicVector.deltaX <= 0);
  assert.ok(res3.strategicVector.deltaY > 0);

  // -----------------------------------------------------------------
  // 4. Quadrant IV: Defensive (deltaX <= 0, deltaY <= 0)
  // -----------------------------------------------------------------
  console.log("  [4/6] Testing Quadrant IV (Defensive Survival: ΔX <= 0, ΔY <= 0)...");
  const quad4Input = {
    internal: {
      strengths: [{ factor: "Basis pelanggan loyal", weight: 0.20, rating: 2 }],
      weaknesses: [{ factor: "Struktur biaya tinggi", weight: 0.80, rating: 3 }] // ΔX <= 0
    },
    external: {
      opportunities: [{ factor: "Pertumbuhan lambat", weight: 0.20, rating: 1 }],
      threats: [{ factor: "Perang harga kompetitor", weight: 0.80, rating: 4 }]  // ΔY <= 0
    }
  };

  const res4 = evaluateQuantitativeSwot(quad4Input);
  assert.strictEqual(res4.strategicVector.quadrant, 'QUADRANT_IV_DEFENSIVE');
  assert.strictEqual(res4.strategicVector.strategicPosture, 'DEFENSIVE_RETRENCHMENT');
  assert.ok(res4.strategicVector.deltaX <= 0);
  assert.ok(res4.strategicVector.deltaY <= 0);

  // -----------------------------------------------------------------
  // 5. Invariant Boundary Validations (Fail-Closed)
  // -----------------------------------------------------------------
  console.log("  [5/6] Testing Invariant Assertions & Error Boundaries...");

  // 5a. Internal weight sum != 1.0
  assert.throws(() => {
    evaluateQuantitativeSwot({
      internal: {
        strengths: [{ factor: "A", weight: 0.50, rating: 3 }],
        weaknesses: [{ factor: "B", weight: 0.40, rating: 2 }] // Sum = 0.90 != 1.0
      },
      external: {
        opportunities: [{ factor: "C", weight: 0.50, rating: 3 }],
        threats: [{ factor: "D", weight: 0.50, rating: 2 }]
      }
    });
  }, /INVALID_INPUT.*internal weights.*must equal 1\.0/);

  // 5b. External weight sum != 1.0
  assert.throws(() => {
    evaluateQuantitativeSwot({
      internal: {
        strengths: [{ factor: "A", weight: 0.50, rating: 3 }],
        weaknesses: [{ factor: "B", weight: 0.50, rating: 2 }]
      },
      external: {
        opportunities: [{ factor: "C", weight: 0.60, rating: 3 }],
        threats: [{ factor: "D", weight: 0.60, rating: 2 }] // Sum = 1.20 != 1.0
      }
    });
  }, /INVALID_INPUT.*external weights.*must equal 1\.0/);

  // 5c. Rating out of bounds (< 1 or > 4)
  assert.throws(() => {
    evaluateQuantitativeSwot({
      internal: {
        strengths: [{ factor: "A", weight: 1.0, rating: 5 }], // Rating 5 is invalid!
        weaknesses: []
      },
      external: {
        opportunities: [{ factor: "C", weight: 1.0, rating: 3 }],
        threats: []
      }
    });
  }, /INVALID_INPUT.*Rating.*between 1\.0 and 4\.0/);

  // -----------------------------------------------------------------
  // 6. TOWS Cross-Impact Interaction & Zero-Prescription Enforcement
  // -----------------------------------------------------------------
  console.log("  [6/6] Testing TOWS Cross-Impact Ranking & Zero-Prescription Policy...");
  assert.ok(res1.towsCrossImpactRanking.topSoPair, "Top SO pair should exist");
  assert.ok(res1.towsCrossImpactRanking.topSoPair.impactScore > 0);
  assert.strictEqual(res1.towsCrossImpactRanking.topSoPair.type, "SO");

  // Zero-Prescription Verification: Output must NOT contain subjective advice words
  const serialized = JSON.stringify(res1);
  assert.ok(!serialized.includes("harus segera"), "Engine violated zero-prescription policy with prescriptive advice");
  assert.ok(!serialized.includes("sebaiknya"), "Engine violated zero-prescription policy with prescriptive advice");
  assert.ok(!serialized.includes("kami menyarankan"), "Engine violated zero-prescription policy with prescriptive advice");

  console.log("\n✅ Quantitative SWOT & TOWS Engine Tests PASSED 100%!");
}

if (require.main === module) {
  runQuantitativeSwotTests();
}

module.exports = {
  runQuantitativeSwotTests
};
