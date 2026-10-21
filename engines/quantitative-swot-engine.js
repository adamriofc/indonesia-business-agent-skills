/**
 * Quantitative SWOT & TOWS Matrix Calculation Engine (`engines/quantitative-swot-engine.js`)
 *
 * Implements deterministic IFE/EFE matrix weighting, strategic vector coordinates (ΔX, ΔY),
 * mathematical quadrant mapping, and cross-impact interaction ranking per Fred R. David
 * and IE Matrix standards.
 *
 * DOCTRINE: Pure numerical computation and invariant verification.
 * ZERO prescriptive text / ZERO canned advice.
 * Pure Node.js, zero external dependencies.
 */

'use strict';

const WEIGHT_TOLERANCE = 1e-4;

function round4(val) {
  return Math.round(val * 10000) / 10000;
}

function round2(val) {
  return Math.round(val * 100) / 100;
}

function validateFactorList(factors, listName) {
  if (!Array.isArray(factors)) {
    throw new Error(`INVALID_INPUT: '${listName}' must be an array of factors`);
  }

  return factors.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`INVALID_INPUT: Factor at index ${idx} in '${listName}' must be an object`);
    }

    const factor = String(item.factor || item.name || `Factor ${idx + 1}`).trim();
    const weight = Number(item.weight);
    const rating = Number(item.rating);

    if (isNaN(weight) || weight <= 0 || weight > 1.0) {
      throw new Error(`INVALID_INPUT: Weight at index ${idx} in '${listName}' must be a positive number <= 1.0 (got ${item.weight})`);
    }

    if (isNaN(rating) || rating < 1.0 || rating > 4.0) {
      throw new Error(`INVALID_INPUT: Rating at index ${idx} in '${listName}' must be a number between 1.0 and 4.0 (got ${item.rating})`);
    }

    const weightedScore = round4(weight * rating);

    return {
      factor,
      weight,
      rating,
      weightedScore
    };
  });
}

function evaluateQuantitativeSwot(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new Error("INVALID_INPUT: Input must be a valid object containing 'internal' and 'external' matrices");
  }

  const internal = input.internal || {};
  const external = input.external || {};

  // 1. Validate & Parse Factors
  const strengths = validateFactorList(internal.strengths || [], 'internal.strengths');
  const weaknesses = validateFactorList(internal.weaknesses || [], 'internal.weaknesses');
  const opportunities = validateFactorList(external.opportunities || [], 'external.opportunities');
  const threats = validateFactorList(external.threats || [], 'external.threats');

  if (strengths.length === 0 && weaknesses.length === 0) {
    throw new Error("INVALID_INPUT: At least one strength or weakness must be provided in 'internal'");
  }
  if (opportunities.length === 0 && threats.length === 0) {
    throw new Error("INVALID_INPUT: At least one opportunity or threat must be provided in 'external'");
  }

  // 2. Validate Weight Invariants (Sum == 1.0)
  const totalInternalWeight = strengths.reduce((sum, f) => sum + f.weight, 0) +
                              weaknesses.reduce((sum, f) => sum + f.weight, 0);

  if (Math.abs(totalInternalWeight - 1.0) > WEIGHT_TOLERANCE) {
    throw new Error(`INVALID_INPUT: Sum of internal weights (strengths + weaknesses) must equal 1.0 (got ${round4(totalInternalWeight)})`);
  }

  const totalExternalWeight = opportunities.reduce((sum, f) => sum + f.weight, 0) +
                              threats.reduce((sum, f) => sum + f.weight, 0);

  if (Math.abs(totalExternalWeight - 1.0) > WEIGHT_TOLERANCE) {
    throw new Error(`INVALID_INPUT: Sum of external weights (opportunities + threats) must equal 1.0 (got ${round4(totalExternalWeight)})`);
  }

  // 3. Compute Weighted Scores
  const strengthsScore = round4(strengths.reduce((sum, f) => sum + f.weightedScore, 0));
  const weaknessesScore = round4(weaknesses.reduce((sum, f) => sum + f.weightedScore, 0));
  const ifeTotalScore = round4(strengthsScore + weaknessesScore);

  const opportunitiesScore = round4(opportunities.reduce((sum, f) => sum + f.weightedScore, 0));
  const threatsScore = round4(threats.reduce((sum, f) => sum + f.weightedScore, 0));
  const efeTotalScore = round4(opportunitiesScore + threatsScore);

  // 4. Strategic Vector Coordinates (ΔX, ΔY)
  // Sumbu X: Kekuatan Bersih = S - W
  // Sumbu Y: Peluang Bersih = O - T
  const deltaX = round4(strengthsScore - weaknessesScore);
  const deltaY = round4(opportunitiesScore - threatsScore);

  const vectorMagnitude = round4(Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));

  let rawAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  if (rawAngle < 0) rawAngle += 360;
  const vectorAngleDegrees = round2(rawAngle);

  // 5. Objective Quadrant Mapping
  let quadrant = 'QUADRANT_IV_DEFENSIVE';
  let strategicPosture = 'DEFENSIVE_RETRENCHMENT';

  if (deltaX > 0 && deltaY > 0) {
    quadrant = 'QUADRANT_I_AGGRESSIVE';
    strategicPosture = 'AGGRESSIVE_EXPANSION';
  } else if (deltaX > 0 && deltaY <= 0) {
    quadrant = 'QUADRANT_II_DIVERSIFICATION';
    strategicPosture = 'COMPETITIVE_DIVERSIFICATION';
  } else if (deltaX <= 0 && deltaY > 0) {
    quadrant = 'QUADRANT_III_TURNAROUND';
    strategicPosture = 'CONSERVATIVE_TURNAROUND';
  } else {
    quadrant = 'QUADRANT_IV_DEFENSIVE';
    strategicPosture = 'DEFENSIVE_RETRENCHMENT';
  }

  // 6. Cross-Impact TOWS Matrix Ranking
  function computeCrossImpactPairs(listA, listB, type) {
    const pairs = [];
    for (const a of listA) {
      for (const b of listB) {
        const impactScore = round4(a.weight * b.weight * ((a.rating + b.rating) / 2));
        pairs.push({
          type,
          factorA: a.factor,
          factorB: b.factor,
          weightA: a.weight,
          weightB: b.weight,
          ratingA: a.rating,
          ratingB: b.rating,
          impactScore
        });
      }
    }
    return pairs.sort((p1, p2) => p2.impactScore - p1.impactScore);
  }

  const towsMatrix = {
    soInteractions: computeCrossImpactPairs(strengths, opportunities, 'SO'),
    stInteractions: computeCrossImpactPairs(strengths, threats, 'ST'),
    woInteractions: computeCrossImpactPairs(weaknesses, opportunities, 'WO'),
    wtInteractions: computeCrossImpactPairs(weaknesses, threats, 'WT')
  };

  return {
    ifeMatrix: {
      strengths,
      weaknesses,
      strengthsWeightedScore: strengthsScore,
      weaknessesWeightedScore: weaknessesScore,
      ifeTotalScore,
      internalPosition: ifeTotalScore >= 2.5 ? 'STRONG_INTERNAL' : 'WEAK_INTERNAL'
    },
    efeMatrix: {
      opportunities,
      threats,
      opportunitiesWeightedScore: opportunitiesScore,
      threatsWeightedScore: threatsScore,
      efeTotalScore,
      externalPosition: efeTotalScore >= 2.5 ? 'SUPERIOR_RESPONSE' : 'POOR_RESPONSE'
    },
    strategicVector: {
      deltaX,
      deltaY,
      magnitude: vectorMagnitude,
      angleDegrees: vectorAngleDegrees,
      quadrant,
      strategicPosture
    },
    towsCrossImpactRanking: {
      topSoPair: towsMatrix.soInteractions[0] || null,
      topStPair: towsMatrix.stInteractions[0] || null,
      topWoPair: towsMatrix.woInteractions[0] || null,
      topWtPair: towsMatrix.wtInteractions[0] || null,
      allInteractionsCount: {
        soCount: towsMatrix.soInteractions.length,
        stCount: towsMatrix.stInteractions.length,
        woCount: towsMatrix.woInteractions.length,
        wtCount: towsMatrix.wtInteractions.length
      }
    },
    diagnosticMetadata: {
      evaluatedAt: new Date().toISOString(),
      methodology: "Fred R. David Quantitative Strategic Matrix & IE Framework",
      prescriptionConstraint: "ZERO_PRESCRIPTIVE_TEXT_POLICY_ENFORCED"
    }
  };
}

module.exports = {
  evaluateQuantitativeSwot,
  validateFactorList
};
