/**
 * Deterministic Balanced Scorecard (BSC) Calculation Engine (`engines/balanced-scorecard-engine.js`)
 *
 * Implements deterministic multi-perspective KPI achievement calculation,
 * Min/Max polarity mapping, KMK statutory 120% cap rules, composite scorecard scoring,
 * and Strategy Map causal broken-link detection.
 *
 * Regulatory & Standards Reference:
 *   - Robert S. Kaplan & David P. Norton (1992, 1996)
 *   - KMK No. 467/KMK.01/2014 & KMK No. 590/KMK.01/2016 (Pengelolaan Kinerja Berbasis Balanced Scorecard)
 *   - Kriteria Penilaian Kinerja Unggul (KPKU) BUMN RI
 *
 * DOCTRINE: Pure numerical computation and causality anomaly detection.
 * ZERO prescriptive text / ZERO subjective advice.
 * Pure Node.js, zero external dependencies.
 */

'use strict';

const WEIGHT_TOLERANCE = 1e-4;
const DEFAULT_CAP_RATIO = 120.0; // 120% standard cap per KMK 467/2014

function round4(val) {
  return Math.round(val * 10000) / 10000;
}

function round2(val) {
  return Math.round(val * 100) / 100;
}

function getTrafficLightStatus(scorePercent) {
  if (scorePercent >= 100.0) return 'GREEN';
  if (scorePercent >= 80.0) return 'YELLOW';
  return 'RED';
}

function evaluateBalancedScorecard(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new Error("INVALID_INPUT: Input must be a valid object containing 'perspectives'");
  }

  const sector = String(input.sector || 'PRIVATE_COMMERCIAL').toUpperCase().trim();
  const capRatio = input.capRatio !== undefined ? Math.max(100.0, Number(input.capRatio) || DEFAULT_CAP_RATIO) : DEFAULT_CAP_RATIO;
  const rawPerspectives = input.perspectives;

  if (!Array.isArray(rawPerspectives) || rawPerspectives.length === 0) {
    throw new Error("INVALID_INPUT: 'perspectives' must be a non-empty array");
  }

  // 1. Perspective Weight Invariant Validation (Sum == 1.0)
  const totalPerspectiveWeight = rawPerspectives.reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
  if (Math.abs(totalPerspectiveWeight - 1.0) > WEIGHT_TOLERANCE) {
    throw new Error(`INVALID_INPUT: Sum of perspective weights must equal 1.0 (got ${round4(totalPerspectiveWeight)})`);
  }

  // 2. Evaluate Each Perspective and KPI
  const evaluatedPerspectives = [];
  const perspectiveScoreLookup = {};
  let compositeWeightedScore = 0;

  for (let pIdx = 0; pIdx < rawPerspectives.length; pIdx++) {
    const p = rawPerspectives[pIdx];
    const pId = String(p.id || `perspective_${pIdx + 1}`).toLowerCase().trim();
    const pName = String(p.name || pId).trim();
    const pWeight = Number(p.weight);

    if (isNaN(pWeight) || pWeight <= 0 || pWeight > 1.0) {
      throw new Error(`INVALID_INPUT: Perspective weight for '${pName}' must be a positive number <= 1.0 (got ${p.weight})`);
    }

    const kpis = p.kpis;
    if (!Array.isArray(kpis) || kpis.length === 0) {
      throw new Error(`INVALID_INPUT: Perspective '${pName}' must contain a non-empty 'kpis' array`);
    }

    // KPI Weight Invariant Validation (Sum == 1.0 per perspective)
    const totalKpiWeight = kpis.reduce((sum, k) => sum + (Number(k.weight) || 0), 0);
    if (Math.abs(totalKpiWeight - 1.0) > WEIGHT_TOLERANCE) {
      throw new Error(`INVALID_INPUT: Sum of KPI weights for perspective '${pName}' must equal 1.0 (got ${round4(totalKpiWeight)})`);
    }

    let perspectiveSumScore = 0;
    const evaluatedKpis = [];

    for (let kIdx = 0; kIdx < kpis.length; kIdx++) {
      const k = kpis[kIdx];
      const code = String(k.code || `KPI-${pIdx + 1}.${kIdx + 1}`).trim();
      const name = String(k.name || code).trim();
      const weight = Number(k.weight);
      const target = Number(k.target);
      const actual = Number(k.actual);
      const unit = String(k.unit || 'points').trim();
      const polarity = String(k.polarity || 'MAXIMIZE').toUpperCase().trim();

      if (isNaN(weight) || weight <= 0 || weight > 1.0) {
        throw new Error(`INVALID_INPUT: KPI weight at index ${kIdx} in '${pName}' must be <= 1.0 (got ${k.weight})`);
      }
      if (isNaN(target) || target <= 0) {
        throw new Error(`INVALID_INPUT: KPI target for '${name}' must be greater than zero (got ${k.target})`);
      }
      if (isNaN(actual) || actual < 0) {
        throw new Error(`INVALID_INPUT: KPI actual for '${name}' must be a non-negative number (got ${k.actual})`);
      }
      if (polarity !== 'MAXIMIZE' && polarity !== 'MINIMIZE') {
        throw new Error(`INVALID_INPUT: Unsupported polarity '${k.polarity}' for '${name}'. Must be 'MAXIMIZE' or 'MINIMIZE'`);
      }

      // Achievement Calculation based on Polarity
      let rawAchievementPercent = 0;
      if (polarity === 'MAXIMIZE') {
        rawAchievementPercent = round2((actual / target) * 100);
      } else {
        // MINIMIZE (Lower actual is better)
        if (actual === 0) {
          rawAchievementPercent = capRatio;
        } else {
          rawAchievementPercent = round2((target / actual) * 100);
        }
      }

      // Statutory Cap Ratio Enforcement (KMK 467/2014)
      const isCapped = rawAchievementPercent > capRatio;
      const cappedAchievementPercent = round2(Math.min(rawAchievementPercent, capRatio));
      const kpiWeightedScore = round4(cappedAchievementPercent * weight);

      perspectiveSumScore += kpiWeightedScore;

      evaluatedKpis.push({
        code,
        name,
        polarity,
        target,
        actual,
        unit,
        weight,
        rawAchievementPercent,
        isCapped,
        cappedAchievementPercent,
        weightedScore: kpiWeightedScore,
        status: getTrafficLightStatus(cappedAchievementPercent)
      });
    }

    const roundedPerspectiveScore = round2(perspectiveSumScore);
    const weightedPerspectiveContribution = round4(roundedPerspectiveScore * pWeight);
    compositeWeightedScore += weightedPerspectiveContribution;

    perspectiveScoreLookup[pId] = roundedPerspectiveScore;

    evaluatedPerspectives.push({
      id: pId,
      name: pName,
      weight: pWeight,
      perspectiveScore: roundedPerspectiveScore,
      weightedContribution: weightedPerspectiveContribution,
      status: getTrafficLightStatus(roundedPerspectiveScore),
      kpiCount: evaluatedKpis.length,
      kpis: evaluatedKpis
    });
  }

  const finalCompositeScore = round2(compositeWeightedScore);

  // 3. Strategy Map Causal Broken Link Detection
  const causalAnomalies = [];

  const lgScore = perspectiveScoreLookup['learning_growth'] || perspectiveScoreLookup['learning'] || perspectiveScoreLookup['pembelajaran_pertumbuhan'];
  const ipScore = perspectiveScoreLookup['internal_process'] || perspectiveScoreLookup['internal'] || perspectiveScoreLookup['proses_bisnis_internal'];
  const custScore = perspectiveScoreLookup['customer'] || perspectiveScoreLookup['pelanggan'] || perspectiveScoreLookup['stakeholder'] || perspectiveScoreLookup['pemangku_kepentingan'];
  const finScore = perspectiveScoreLookup['financial'] || perspectiveScoreLookup['finance'] || perspectiveScoreLookup['keuangan'];

  // Anomaly 1: Learning & Growth high (>=90%) but Internal Process critical (<75%)
  if (lgScore !== undefined && ipScore !== undefined) {
    if (lgScore >= 90.0 && ipScore < 75.0) {
      causalAnomalies.push({
        anomalyCode: "ANOMALY_TRAINING_NOT_CONVERTED_TO_PROCESS_EFFICIENCY",
        severity: "HIGH",
        perspectiveSource: "learning_growth",
        perspectiveTarget: "internal_process",
        sourceScore: lgScore,
        targetScore: ipScore,
        diagnostic: "Learning & Growth achievement is on-track (>=90%) but Internal Business Process is critically lagging (<75%), indicating training, competency, or technology upgrades are not translating into operational efficiency improvements."
      });
    }
  }

  // Anomaly 2: Internal Process high (>=90%) but Customer / Stakeholder critical (<75%)
  if (ipScore !== undefined && custScore !== undefined) {
    if (ipScore >= 90.0 && custScore < 75.0) {
      causalAnomalies.push({
        anomalyCode: "ANOMALY_INTERNAL_EFFICIENCY_NOT_TRANSLATING_TO_CUSTOMER_SATISFACTION",
        severity: "HIGH",
        perspectiveSource: "internal_process",
        perspectiveTarget: "customer",
        sourceScore: ipScore,
        targetScore: custScore,
        diagnostic: "Internal Process achievement is on-track (>=90%) but Customer/Stakeholder satisfaction is critically lagging (<75%), indicating operational optimization does not address customer value drivers."
      });
    }
  }

  // Anomaly 3: Customer high (>=90%) but Financial critical (<75%) [Private Commercial only]
  if (sector === 'PRIVATE_COMMERCIAL' && custScore !== undefined && finScore !== undefined) {
    if (custScore >= 90.0 && finScore < 75.0) {
      causalAnomalies.push({
        anomalyCode: "ANOMALY_CUSTOMER_SATISFACTION_NOT_MONETIZED",
        severity: "MEDIUM",
        perspectiveSource: "customer",
        perspectiveTarget: "financial",
        sourceScore: custScore,
        targetScore: finScore,
        diagnostic: "Customer satisfaction is on-track (>=90%) but Financial performance is critically lagging (<75%), indicating high acquisition or customer-delight costs that are not yielding commercial margins."
      });
    }
  }

  // Hierarchy Structure
  const strategicHierarchy = sector === 'PUBLIC_GOVERNMENT_BUMN'
    ? ["STAKEHOLDER_SATISFACTION", "INTERNAL_PROCESS", "LEARNING_GROWTH", "BUDGET_ACCOUNTABILITY"]
    : ["FINANCIAL", "CUSTOMER", "INTERNAL_PROCESS", "LEARNING_GROWTH"];

  return {
    sector,
    capRatioPercent: capRatio,
    strategicHierarchy,
    compositeBscScore: finalCompositeScore,
    compositeStatus: getTrafficLightStatus(finalCompositeScore),
    totalPerspectives: evaluatedPerspectives.length,
    perspectives: evaluatedPerspectives,
    strategyMapDiagnostics: {
      hasBrokenLinks: causalAnomalies.length > 0,
      anomaliesCount: causalAnomalies.length,
      causalAnomalies
    },
    statutoryFramework: sector === 'PUBLIC_GOVERNMENT_BUMN'
      ? "KMK No. 467/KMK.01/2014 & KMK No. 590/KMK.01/2016 (Pengelolaan Kinerja Berbasis Balanced Scorecard)"
      : "Robert S. Kaplan & David P. Norton Balanced Scorecard Framework"
  };
}

module.exports = {
  evaluateBalancedScorecard,
  getTrafficLightStatus,
  DEFAULT_CAP_RATIO
};
