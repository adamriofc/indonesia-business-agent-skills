/**
 * Reorder Point (ROP) & Stochastic Safety Stock Calculation Engine (`engines/rop-safety-stock-engine.js`)
 *
 * Implements classical stochastic inventory theory under normal distribution demand and lead-time variability.
 * Calculates Safety Stock, Lead Time Demand, Reorder Point, and Inventory Health Status.
 *
 * DOCTRINE: Pure numerical computation and deterministic operations research math.
 * ZERO prescriptive text / ZERO subjective advice.
 * Pure Node.js, zero external dependencies.
 */

'use strict';

const SERVICE_LEVEL_Z_TABLE = [
  { level: 80.0, z: 0.842 },
  { level: 85.0, z: 1.036 },
  { level: 90.0, z: 1.282 },
  { level: 95.0, z: 1.645 },
  { level: 97.5, z: 1.960 },
  { level: 98.0, z: 2.054 },
  { level: 99.0, z: 2.326 },
  { level: 99.5, z: 2.576 },
  { level: 99.9, z: 3.090 }
];

function getZScore(serviceLevelPercent) {
  const sl = Number(serviceLevelPercent);
  if (isNaN(sl) || sl < 50.0 || sl >= 100.0) {
    throw new Error(`INVALID_INPUT: Service level percent must be between 50.0 and 99.9 (got ${serviceLevelPercent})`);
  }

  // Exact match from lookup table if close
  for (const entry of SERVICE_LEVEL_Z_TABLE) {
    if (Math.abs(entry.level - sl) < 0.05) {
      return entry.z;
    }
  }

  // Linear interpolation between table brackets
  for (let i = 0; i < SERVICE_LEVEL_Z_TABLE.length - 1; i++) {
    const cur = SERVICE_LEVEL_Z_TABLE[i];
    const nxt = SERVICE_LEVEL_Z_TABLE[i + 1];
    if (sl >= cur.level && sl <= nxt.level) {
      const frac = (sl - cur.level) / (nxt.level - cur.level);
      return Math.round((cur.z + frac * (nxt.z - cur.z)) * 1000) / 1000;
    }
  }

  if (sl < SERVICE_LEVEL_Z_TABLE[0].level) {
    return 0.842;
  }
  return 3.090;
}

function calculateRopAndSafetyStock(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new Error("INVALID_INPUT: Input must be a valid parameters object");
  }

  const averageDailyDemand = Number(input.averageDailyDemand !== undefined ? input.averageDailyDemand : input.dailyDemand);
  const leadTimeDays = Number(input.leadTimeDays !== undefined ? input.leadTimeDays : input.leadTime);
  const demandStdDev = Number(input.demandStdDev !== undefined ? input.demandStdDev : (input.dailyDemandStdDev || 0));
  const leadTimeStdDev = Number(input.leadTimeStdDev !== undefined ? input.leadTimeStdDev : 0);
  const serviceLevelPercent = input.serviceLevelPercent !== undefined ? Number(input.serviceLevelPercent) : 95.0;
  const currentStock = input.currentStock !== undefined ? Number(input.currentStock) : null;
  const unitCost = input.unitCost !== undefined ? Number(input.unitCost) : null;

  if (isNaN(averageDailyDemand) || averageDailyDemand <= 0) {
    throw new Error(`INVALID_INPUT: 'averageDailyDemand' must be greater than zero (got ${input.averageDailyDemand})`);
  }
  if (isNaN(leadTimeDays) || leadTimeDays <= 0) {
    throw new Error(`INVALID_INPUT: 'leadTimeDays' must be greater than zero (got ${input.leadTimeDays})`);
  }
  if (isNaN(demandStdDev) || demandStdDev < 0) {
    throw new Error(`INVALID_INPUT: 'demandStdDev' must be non-negative (got ${input.demandStdDev})`);
  }
  if (isNaN(leadTimeStdDev) || leadTimeStdDev < 0) {
    throw new Error(`INVALID_INPUT: 'leadTimeStdDev' must be non-negative (got ${input.leadTimeStdDev})`);
  }

  // 1. Resolve Z-Score
  const zScore = getZScore(serviceLevelPercent);

  // 2. Compute Joint Safety Stock Variance:
  // Combined variance = (L * sigma_d^2) + (d^2 * sigma_L^2)
  const demandVarianceComponent = leadTimeDays * Math.pow(demandStdDev, 2);
  const leadTimeVarianceComponent = Math.pow(averageDailyDemand, 2) * Math.pow(leadTimeStdDev, 2);
  const combinedStdDev = Math.sqrt(demandVarianceComponent + leadTimeVarianceComponent);

  const rawSafetyStock = zScore * combinedStdDev;
  const safetyStockUnits = Math.ceil(rawSafetyStock);

  // 3. Lead Time Demand (LTD)
  const leadTimeDemandUnits = Math.round(averageDailyDemand * leadTimeDays * 100) / 100;

  // 4. Reorder Point (ROP)
  const reorderPointUnits = Math.ceil(leadTimeDemandUnits + safetyStockUnits);

  // 5. Stock Status Evaluation
  let stockStatus = 'NOT_EVALUATED';
  let daysOfInventoryRemaining = null;
  let stockoutRiskTier = 'LOW';
  let isReorderNeeded = false;

  if (currentStock !== null) {
    if (isNaN(currentStock) || currentStock < 0) {
      throw new Error(`INVALID_INPUT: 'currentStock' must be a non-negative number (got ${input.currentStock})`);
    }

    daysOfInventoryRemaining = Math.round((currentStock / averageDailyDemand) * 10) / 10;

    if (currentStock <= safetyStockUnits) {
      stockStatus = 'CRITICAL_BUFFER_BREACH';
      stockoutRiskTier = 'CRITICAL';
      isReorderNeeded = true;
    } else if (currentStock <= reorderPointUnits) {
      stockStatus = 'REORDER_IMMEDIATELY';
      stockoutRiskTier = 'HIGH';
      isReorderNeeded = true;
    } else if (currentStock > (2.5 * reorderPointUnits)) {
      stockStatus = 'OVERSTOCKED';
      stockoutRiskTier = 'NEGLIGIBLE';
      isReorderNeeded = false;
    } else {
      stockStatus = 'OPTIMAL_NORMAL';
      stockoutRiskTier = 'MODERATE';
      isReorderNeeded = false;
    }
  }

  // 6. Financial Exposure
  let safetyStockCapitalExposureIdr = null;
  if (unitCost !== null && !isNaN(unitCost) && unitCost > 0) {
    safetyStockCapitalExposureIdr = Math.round(safetyStockUnits * unitCost);
  }

  return {
    parameters: {
      averageDailyDemand,
      leadTimeDays,
      demandStdDev,
      leadTimeStdDev,
      serviceLevelPercent,
      zScore,
      currentStock,
      unitCost
    },
    inventoryMetrics: {
      leadTimeDemandUnits,
      safetyStockUnits,
      reorderPointUnits,
      safetyStockCapitalExposureIdr
    },
    operationalStatus: {
      currentStock,
      daysOfInventoryRemaining,
      stockStatus,
      stockoutRiskTier,
      isReorderNeeded,
      stockoutProbabilityPercent: Math.round((100.0 - serviceLevelPercent) * 100) / 100
    },
    modelMetadata: {
      methodology: "Stochastic Inventory Control (Normal Distribution Joint Demand & Lead-Time Variance)",
      safetyStockFormula: "Z * sqrt(L * sigma_d^2 + d^2 * sigma_L^2)",
      prescriptionConstraint: "ZERO_PRESCRIPTIVE_TEXT_POLICY_ENFORCED"
    }
  };
}

module.exports = {
  calculateRopAndSafetyStock,
  getZScore,
  SERVICE_LEVEL_Z_TABLE
};
