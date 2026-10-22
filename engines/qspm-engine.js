/**
 * Quantitative Strategic Planning Matrix (QSPM) Calculation Engine (`engines/qspm-engine.js`)
 *
 * Implements Stage-3 Decision Stage of Fred R. David Strategic Formulation Framework.
 * Computes Total Attractiveness Scores (TAS) objectively from IFE/EFE weights and
 * Attractiveness Scores (AS 1-4) across multiple strategic alternatives.
 *
 * DOCTRINE: Pure numerical computation and mathematical invariant verification.
 * ZERO prescriptive text / ZERO subjective advice.
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

/**
 * Validates and normalizes factor list.
 * Supports flat array of factors or structured { internal, external } object.
 */
function normalizeFactors(inputFactors) {
  let list = [];

  if (Array.isArray(inputFactors)) {
    list = inputFactors;
  } else if (inputFactors && typeof inputFactors === 'object') {
    // Support structured { internal: { strengths, weaknesses }, external: { opportunities, threats } }
    const internal = inputFactors.internal || {};
    const external = inputFactors.external || {};
    const strengths = (internal.strengths || []).map(f => ({ ...f, category: 'STRENGTH' }));
    const weaknesses = (internal.weaknesses || []).map(f => ({ ...f, category: 'WEAKNESS' }));
    const opportunities = (external.opportunities || []).map(f => ({ ...f, category: 'OPPORTUNITY' }));
    const threats = (external.threats || []).map(f => ({ ...f, category: 'THREAT' }));
    list = [...strengths, ...weaknesses, ...opportunities, ...threats];
  } else {
    throw new Error("INVALID_INPUT: 'factors' must be an array or an object containing 'internal' and 'external' factor lists");
  }

  if (list.length === 0) {
    throw new Error("INVALID_INPUT: At least one strategic factor must be provided");
  }

  const normalized = list.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`INVALID_INPUT: Factor at index ${idx} must be an object`);
    }
    const name = String(item.factor || item.name || `Factor_${idx + 1}`).trim();
    const weight = Number(item.weight);
    const category = String(item.category || item.type || 'STRATEGIC_FACTOR').toUpperCase().trim();

    if (isNaN(weight) || weight <= 0 || weight > 1.0) {
      throw new Error(`INVALID_INPUT: Weight for factor '${name}' must be a positive number <= 1.0 (got ${item.weight})`);
    }

    return {
      index: idx,
      name,
      weight,
      category
    };
  });

  const totalWeight = normalized.reduce((sum, f) => sum + f.weight, 0);
  if (Math.abs(totalWeight - 1.0) > WEIGHT_TOLERANCE) {
    throw new Error(`INVALID_INPUT: Sum of factor weights must equal 1.0 (got ${round4(totalWeight)})`);
  }

  return normalized;
}

/**
 * Evaluates Quantitative Strategic Planning Matrix (QSPM)
 *
 * @param {Object} input
 * @param {Array|Object} input.factors - Array of factors with weight, or { internal, external }
 * @param {Array} input.strategies - Array of strategy alternatives
 */
function evaluateQspm(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new Error("INVALID_INPUT: Input must be an object containing 'factors' and 'strategies'");
  }

  const factors = normalizeFactors(input.factors);
  const rawStrategies = input.strategies;

  if (!Array.isArray(rawStrategies) || rawStrategies.length < 2) {
    throw new Error("INVALID_INPUT: 'strategies' must be an array containing at least 2 alternative strategies to evaluate");
  }

  // Validate and parse strategies
  const evaluatedStrategies = rawStrategies.map((s, sIdx) => {
    if (!s || typeof s !== 'object') {
      throw new Error(`INVALID_INPUT: Strategy at index ${sIdx} must be an object`);
    }
    const id = String(s.id || `strategy_${sIdx + 1}`).trim();
    const name = String(s.name || id).trim();

    // Map scores to factors
    let factorScores = [];
    let sumTas = 0;

    for (let fIdx = 0; fIdx < factors.length; fIdx++) {
      const f = factors[fIdx];
      let asValue = null;

      if (Array.isArray(s.scores)) {
        asValue = s.scores[fIdx];
      } else if (s.scores && typeof s.scores === 'object') {
        asValue = s.scores[f.name] !== undefined ? s.scores[f.name] : s.scores[f.index];
      } else if (Array.isArray(s.attractivenessScores)) {
        asValue = s.attractivenessScores[fIdx];
      } else if (s.attractivenessScores && typeof s.attractivenessScores === 'object') {
        asValue = s.attractivenessScores[f.name] !== undefined ? s.attractivenessScores[f.name] : s.attractivenessScores[f.index];
      }

      let as = 0;
      if (asValue !== null && asValue !== undefined) {
        const numAs = Number(asValue);
        if (isNaN(numAs) || numAs < 0 || numAs > 4 || !Number.isInteger(numAs)) {
          throw new Error(`INVALID_INPUT: Attractiveness Score (AS) for factor '${f.name}' in strategy '${name}' must be an integer between 1 and 4, or 0/null for no effect (got ${asValue})`);
        }
        as = numAs;
      }

      const tas = round4(f.weight * as);
      sumTas += tas;

      factorScores.push({
        factorName: f.name,
        category: f.category,
        weight: f.weight,
        attractivenessScore: as,
        totalAttractivenessScore: tas
      });
    }

    const roundedSumTas = round4(sumTas);

    return {
      strategyId: id,
      strategyName: name,
      sumTotalAttractivenessScore: roundedSumTas,
      factorEvaluations: factorScores
    };
  });

  // Sort strategies descending by sumTotalAttractivenessScore
  const rankedStrategies = [...evaluatedStrategies].sort((a, b) => b.sumTotalAttractivenessScore - a.sumTotalAttractivenessScore);

  const topStrategy = rankedStrategies[0];
  const secondStrategy = rankedStrategies[1];
  const deltaTas = round4(topStrategy.sumTotalAttractivenessScore - secondStrategy.sumTotalAttractivenessScore);
  const dominanceRatio = secondStrategy.sumTotalAttractivenessScore > 0
    ? round2(topStrategy.sumTotalAttractivenessScore / secondStrategy.sumTotalAttractivenessScore)
    : null;

  return {
    totalFactorsEvaluated: factors.length,
    totalStrategiesEvaluated: evaluatedStrategies.length,
    rankedStrategies: rankedStrategies.map((strat, rank) => ({
      rank: rank + 1,
      strategyId: strat.strategyId,
      strategyName: strat.strategyName,
      sumTotalAttractivenessScore: strat.sumTotalAttractivenessScore,
      isTopRanked: rank === 0
    })),
    decisionMetrics: {
      topStrategyId: topStrategy.strategyId,
      topStrategyName: topStrategy.strategyName,
      topScore: topStrategy.sumTotalAttractivenessScore,
      runnerUpStrategyId: secondStrategy.strategyId,
      runnerUpStrategyName: secondStrategy.strategyName,
      runnerUpScore: secondStrategy.sumTotalAttractivenessScore,
      deltaTas,
      dominanceRatio
    },
    detailedScoreMatrix: evaluatedStrategies,
    methodologyMetadata: {
      framework: "Quantitative Strategic Planning Matrix (QSPM) - Fred R. David Stage-3 Decision Framework",
      scoreScale: "1 = Not attractive, 2 = Somewhat attractive, 3 = Reasonably attractive, 4 = Highly attractive, 0 = Not applicable",
      prescriptionConstraint: "ZERO_PRESCRIPTIVE_TEXT_POLICY_ENFORCED"
    }
  };
}

module.exports = {
  evaluateQspm,
  normalizeFactors
};
