/**
 * Inventory Valuation Engine: FIFO vs Moving Weighted Average (`engines/inventory-valuation-engine.js`)
 *
 * Implements deterministic stock card costing per Indonesian statutory mandate:
 *   - Pasal 10 ayat (6) UU Pajak Penghasilan (UU PPh No. 7/1983 stdtd UU No. 7/2021)
 *   - PSAK 14 (Pernyataan Standar Akuntansi Keuangan: Persediaan)
 *   - Strict prohibition of LIFO (Last-In, First-Out) under Indonesian tax law.
 *
 * Computes comparative Ending Inventory Value, Cost of Goods Sold (COGS/HPP),
 * Gross Profit impact, and statutory PPh Badan (22%) fiscal differential.
 *
 * DOCTRINE: Pure numerical computation and accounting conservation invariant verification.
 * ZERO prescriptive text / ZERO subjective advice.
 * Pure Node.js, zero external dependencies.
 */

'use strict';

const STATUTORY_CORP_TAX_RATE = 0.22; // 22% Statutory Corporate Tax Rate
const EPSILON = 1e-4;

function round2(val) {
  return Math.round(val * 100) / 100;
}

function calculateInventoryValuation(input = {}) {
  if (!input || typeof input !== 'object') {
    throw new Error("INVALID_INPUT: Input must be a valid parameters object");
  }

  const rawBeginning = input.beginningInventory || {};
  const beginningQty = Math.max(0, Number(rawBeginning.quantity || 0));
  const beginningUnitCost = Math.max(0, Number(rawBeginning.unitCost || 0));
  const beginningTotalValue = round2(beginningQty * beginningUnitCost);

  const rawTransactions = input.transactions;
  if (!Array.isArray(rawTransactions)) {
    throw new Error("INVALID_INPUT: 'transactions' must be an array of stock movement records");
  }

  const taxRate = input.corporateTaxRate !== undefined ? Number(input.corporateTaxRate) : STATUTORY_CORP_TAX_RATE;
  if (isNaN(taxRate) || taxRate < 0 || taxRate > 1.0) {
    throw new Error(`INVALID_INPUT: 'corporateTaxRate' must be a decimal between 0 and 1.0 (got ${input.corporateTaxRate})`);
  }

  // -----------------------------------------------------------------
  // 1. Transaction Validation & Normalization
  // -----------------------------------------------------------------
  let totalPurchasedQty = 0;
  let totalPurchasedValue = 0;
  let totalSoldQty = 0;

  const normalizedTransactions = rawTransactions.map((tx, idx) => {
    if (!tx || typeof tx !== 'object') {
      throw new Error(`INVALID_INPUT: Transaction at index ${idx} must be an object`);
    }

    const rawType = String(tx.type || '').toUpperCase().trim();
    let type = '';
    if (['PURCHASE', 'BUY', 'IN', 'MASUK'].includes(rawType)) {
      type = 'PURCHASE';
    } else if (['SALE', 'SELL', 'OUT', 'KELUAR'].includes(rawType)) {
      type = 'SALE';
    } else {
      throw new Error(`INVALID_INPUT: Unsupported transaction type '${tx.type}' at index ${idx}. Must be 'PURCHASE' or 'SALE'`);
    }

    const quantity = Number(tx.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error(`INVALID_INPUT: Transaction quantity at index ${idx} must be a positive number (got ${tx.quantity})`);
    }

    let unitPrice = 0;
    if (type === 'PURCHASE') {
      unitPrice = Number(tx.unitPrice !== undefined ? tx.unitPrice : tx.unitCost);
      if (isNaN(unitPrice) || unitPrice < 0) {
        throw new Error(`INVALID_INPUT: Purchase unitPrice at index ${idx} must be a non-negative number (got ${tx.unitPrice})`);
      }
      totalPurchasedQty += quantity;
      totalPurchasedValue += round2(quantity * unitPrice);
    } else {
      totalSoldQty += quantity;
    }

    return {
      index: idx,
      type,
      date: tx.date || null,
      quantity,
      unitPrice
    };
  });

  const totalGoodsAvailableForSaleQty = beginningQty + totalPurchasedQty;
  const totalGoodsAvailableForSaleValue = round2(beginningTotalValue + totalPurchasedValue);

  if (totalSoldQty > totalGoodsAvailableForSaleQty) {
    throw new Error(`INVALID_INPUT: Cumulative sales quantity (${totalSoldQty}) exceeds total goods available for sale (${totalGoodsAvailableForSaleQty})`);
  }

  // -----------------------------------------------------------------
  // 2. FIFO Execution (First-In, First-Out)
  // -----------------------------------------------------------------
  const fifoBatches = [];
  if (beginningQty > 0) {
    fifoBatches.push({
      batchId: 'BEGINNING_INVENTORY',
      remainingQty: beginningQty,
      unitCost: beginningUnitCost
    });
  }

  let fifoTotalCogs = 0;
  const fifoStockCardLog = [];

  for (let i = 0; i < normalizedTransactions.length; i++) {
    const tx = normalizedTransactions[i];

    if (tx.type === 'PURCHASE') {
      fifoBatches.push({
        batchId: `BATCH_${i + 1}`,
        remainingQty: tx.quantity,
        unitCost: tx.unitPrice
      });
      fifoStockCardLog.push({
        transactionIndex: i,
        type: 'PURCHASE',
        quantity: tx.quantity,
        unitCost: tx.unitPrice,
        totalAmount: round2(tx.quantity * tx.unitPrice)
      });
    } else {
      // SALE
      let remainingToSell = tx.quantity;
      let txCogs = 0;
      const consumedLayers = [];

      for (let b = 0; b < fifoBatches.length && remainingToSell > 0; b++) {
        const batch = fifoBatches[b];
        if (batch.remainingQty <= 0) continue;

        const takeQty = Math.min(batch.remainingQty, remainingToSell);
        const layerCost = round2(takeQty * batch.unitCost);

        batch.remainingQty -= takeQty;
        remainingToSell -= takeQty;
        txCogs += layerCost;

        consumedLayers.push({
          batchId: batch.batchId,
          qtyTaken: takeQty,
          unitCost: batch.unitCost,
          layerCost
        });
      }

      if (remainingToSell > EPSILON) {
        throw new Error(`INVALID_INPUT: Insufficient stock on hand for SALE transaction at index ${i}`);
      }

      fifoTotalCogs += round2(txCogs);
      fifoStockCardLog.push({
        transactionIndex: i,
        type: 'SALE',
        quantity: tx.quantity,
        cogs: round2(txCogs),
        consumedLayers
      });
    }
  }

  const fifoEndingInventoryQty = fifoBatches.reduce((sum, b) => sum + b.remainingQty, 0);
  const fifoEndingInventoryValue = round2(fifoBatches.reduce((sum, b) => sum + (b.remainingQty * b.unitCost), 0));
  fifoTotalCogs = round2(fifoTotalCogs);

  // -----------------------------------------------------------------
  // 3. Weighted Average Execution (Moving Weighted Average)
  // -----------------------------------------------------------------
  let avgCurrentQty = beginningQty;
  let avgCurrentValue = beginningTotalValue;
  let avgCurrentUnitCost = avgCurrentQty > 0 ? (avgCurrentValue / avgCurrentQty) : 0;
  let avgTotalCogs = 0;
  const avgStockCardLog = [];

  for (let i = 0; i < normalizedTransactions.length; i++) {
    const tx = normalizedTransactions[i];

    if (tx.type === 'PURCHASE') {
      avgCurrentQty += tx.quantity;
      avgCurrentValue += round2(tx.quantity * tx.unitPrice);
      avgCurrentUnitCost = avgCurrentValue / avgCurrentQty;

      avgStockCardLog.push({
        transactionIndex: i,
        type: 'PURCHASE',
        quantity: tx.quantity,
        unitPrice: tx.unitPrice,
        balanceQty: avgCurrentQty,
        balanceValue: round2(avgCurrentValue),
        movingAverageCost: round2(avgCurrentUnitCost)
      });
    } else {
      // SALE
      if (tx.quantity > avgCurrentQty + EPSILON) {
        throw new Error(`INVALID_INPUT: Insufficient stock on hand for SALE transaction at index ${i}`);
      }

      const txCogs = round2(tx.quantity * avgCurrentUnitCost);
      avgTotalCogs += txCogs;
      avgCurrentQty -= tx.quantity;
      avgCurrentValue -= txCogs;

      // Guard against minor floating point drift at zero inventory
      if (avgCurrentQty === 0) {
        avgCurrentValue = 0;
        avgCurrentUnitCost = 0;
      } else {
        avgCurrentUnitCost = avgCurrentValue / avgCurrentQty;
      }

      avgStockCardLog.push({
        transactionIndex: i,
        type: 'SALE',
        quantity: tx.quantity,
        cogs: txCogs,
        balanceQty: avgCurrentQty,
        balanceValue: round2(avgCurrentValue),
        movingAverageCost: round2(avgCurrentUnitCost)
      });
    }
  }

  const avgEndingInventoryQty = avgCurrentQty;
  const avgEndingInventoryValue = round2(avgCurrentValue);
  avgTotalCogs = round2(avgTotalCogs);

  // -----------------------------------------------------------------
  // 4. Accounting Invariant Check (Conservation of Costs)
  // -----------------------------------------------------------------
  // Beginning + Purchases === COGS + Ending Inventory
  const fifoDiscrepancy = Math.abs(totalGoodsAvailableForSaleValue - (fifoTotalCogs + fifoEndingInventoryValue));
  const avgDiscrepancy = Math.abs(totalGoodsAvailableForSaleValue - (avgTotalCogs + avgEndingInventoryValue));

  const isFifoConserved = fifoDiscrepancy <= 0.05; // rounding tolerance <= 5 sen
  const isAverageConserved = avgDiscrepancy <= 0.05;

  // -----------------------------------------------------------------
  // 5. Statutory PPh Badan Fiscal Reconciliation Differential
  // -----------------------------------------------------------------
  // Selisih HPP = COGS_FIFO - COGS_AVERAGE
  const deltaCogs = round2(fifoTotalCogs - avgTotalCogs);
  // Selisih Nilai Persediaan Akhir = Ending_FIFO - Ending_AVERAGE
  const deltaEndingInventory = round2(fifoEndingInventoryValue - avgEndingInventoryValue);
  // Selisih Laba Kotor (Gross Profit) = - deltaCogs = deltaEndingInventory
  const deltaGrossProfit = round2(avgTotalCogs - fifoTotalCogs);
  // Estimasi Selisih PPh Badan (22%)
  const estimatedTaxDifferentialIdr = round2(Math.abs(deltaCogs) * taxRate);

  let taxEfficiencyObservation = 'EQUAL_IMPACT';
  if (deltaCogs > 0) {
    taxEfficiencyObservation = 'FIFO_YIELDS_LOWER_TAXABLE_INCOME';
  } else if (deltaCogs < 0) {
    taxEfficiencyObservation = 'AVERAGE_YIELDS_LOWER_TAXABLE_INCOME';
  }

  return {
    inventorySummary: {
      beginningInventoryQty: beginningQty,
      beginningInventoryValue: beginningTotalValue,
      totalPurchasedQty,
      totalPurchasedValue: round2(totalPurchasedValue),
      totalGoodsAvailableForSaleQty,
      totalGoodsAvailableForSaleValue,
      totalSoldQty,
      endingInventoryQty: fifoEndingInventoryQty
    },
    fifoMethod: {
      cogsIdr: fifoTotalCogs,
      endingInventoryValueIdr: fifoEndingInventoryValue,
      remainingBatchesCount: fifoBatches.filter(b => b.remainingQty > 0).length,
      remainingBatches: fifoBatches.filter(b => b.remainingQty > 0),
      isConserved: isFifoConserved
    },
    weightedAverageMethod: {
      cogsIdr: avgTotalCogs,
      endingInventoryValueIdr: avgEndingInventoryValue,
      finalMovingAverageUnitCost: round2(avgCurrentUnitCost),
      isConserved: isAverageConserved
    },
    comparativeAnalysis: {
      deltaCogsIdr: deltaCogs,
      deltaEndingInventoryIdr: deltaEndingInventory,
      deltaGrossProfitIdr: deltaGrossProfit,
      corporateTaxRateAppliedPercent: Math.round(taxRate * 10000) / 100,
      estimatedCorporateTaxImpactIdr: estimatedTaxDifferentialIdr,
      taxPositionStatus: taxEfficiencyObservation
    },
    statutoryCompliance: {
      statutoryLaw: "Pasal 10 ayat (6) UU No. 7/1983 stdtd UU No. 7/2021 (UU PPh)",
      accountingStandard: "PSAK 14 (Persediaan)",
      lifoStatus: "STRICTLY_PROHIBITED_UNDER_INDONESIAN_TAX_LAW",
      prescriptionConstraint: "ZERO_PRESCRIPTIVE_TEXT_POLICY_ENFORCED"
    }
  };
}

module.exports = {
  calculateInventoryValuation,
  STATUTORY_CORP_TAX_RATE
};
