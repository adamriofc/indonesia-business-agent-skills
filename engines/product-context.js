/**
 * Product Context & Commodity Classification Engine (`engines/product-context.js`)
 *
 * Provides a canonical Product Context Layer for commodity classification,
 * BTKI 2022 / HS 6-digit & AHTN 8-digit mapping, tariff calculation
 * (Import Duty, PPN 12% / DPP Nilai Lain / Exempt / DTP, PPh 22 Impor API vs Non-API),
 * and Lartas regulatory requirement analysis.
 *
 * Enforces cryptographic ruleset runtime integrity and fail-closed validation:
 *  - UNRESOLVED or AMBIGUOUS classifications NEVER produce fabricated landed tax math.
 *  - Importer API status (`usesApi`) strictly determines PPh 22 Import rate (2.5% vs 7.5% vs 15.0%).
 *  - Temporal date resolution matches active ruleset by effective date window.
 */

const { verifyRulesetIntegrity } = require('./rules/integrity');
const btkiRules = require('./rules/btki.json');
const { requireRupiah, buildResultEnvelope, RESULT_STATUSES, SAFE_TO_USE_STATES } = require('./production-contract');

// Cryptographic SHA-256 integrity verification on module load
verifyRulesetIntegrity('btki.json');

const STANDARD_PRODUCT_CONTEXT_SCHEMA_VERSION = "1.0.0";

const PRODUCT_CLASSIFICATION_STATUSES = {
  UNRESOLVED: 'UNRESOLVED',
  CANDIDATE: 'CANDIDATE',
  CLASSIFIED: 'CLASSIFIED',
  AMBIGUOUS: 'AMBIGUOUS',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  SUPERSEDED: 'SUPERSEDED'
};

const PPN_TREATMENTS = {
  STANDARD_12: 'STANDARD_12',
  NON_LUXURY_DPP_11_12: 'NON_LUXURY_DPP_11_12',
  EXEMPT: 'EXEMPT',
  INCENTIVE_DTP: 'INCENTIVE_DTP'
};

/**
 * Resolves active BTKI ruleset by effective date window.
 */
function getBtkirulesetForDate(dateStr) {
  const activeDateStr = dateStr || new Date().toISOString().slice(0, 10);
  const checkDate = new Date(activeDateStr);
  
  if (isNaN(checkDate.getTime())) {
    throw new TypeError(`INVALID_INPUT: 'dateStr' must be a valid ISO date string (received: ${dateStr})`);
  }

  for (const r of btkiRules.rulesets) {
    const fromDate = new Date(r.effective_from.includes('T') ? r.effective_from : r.effective_from + 'T00:00:00.000Z');
    const toDate = r.effective_to === 'Infinity' ? new Date('9999-12-31T23:59:59.999Z') : new Date(r.effective_to.includes('T') ? r.effective_to : r.effective_to + 'T23:59:59.999Z');
    
    if (checkDate >= fromDate && checkDate <= toDate) {
      return r;
    }
  }

  return null; // Return null if date is out of statutory ruleset coverage (RULESET_UNRESOLVED)
}

/**
 * Creates a default canonical Product Context object.
 */
function createDefaultProductContext(overrides = {}) {
  const prod = overrides.product || {};
  const cls = overrides.classification || {};
  const comm = overrides.commercial || {};

  return {
    schemaVersion: STANDARD_PRODUCT_CONTEXT_SCHEMA_VERSION,
    product: {
      id: prod.id || null,
      name: prod.name || 'Unspecified Product',
      description: prod.description || '',
      category: prod.category || 'general_goods',
      brand: prod.brand || null,
      model: prod.model || null,
      specifications: prod.specifications || {
        material: null,
        composition: null,
        form: null,
        size: null,
        grade: null
      }
    },
    classification: {
      scheme: 'BTKI',
      hs6: cls.hs6 || null,
      ahtn8: cls.ahtn8 || null,
      btkiCode: cls.btkiCode || null,
      version: cls.version || 'BTKI-2022'
    },
    commercial: {
      unit: comm.unit || 'unit',
      unitPriceIdr: comm.unitPriceIdr !== undefined && comm.unitPriceIdr !== null ? Math.max(0, Number(comm.unitPriceIdr) || 0) : 0,
      unitCostIdr: comm.unitCostIdr !== undefined && comm.unitCostIdr !== null ? Math.max(0, Number(comm.unitCostIdr) || 0) : 0,
      marginPercent: comm.marginPercent !== undefined ? Number(comm.marginPercent) || 0 : 0
    },
    status: overrides.status || PRODUCT_CLASSIFICATION_STATUSES.UNRESOLVED,
    confidence: overrides.confidence || 'LOW',
    effectiveFrom: overrides.effectiveFrom || '2022-04-01',
    effectiveTo: overrides.effectiveTo || 'Infinity',
    evidence: overrides.evidence || []
  };
}

/**
 * Resolves product classification & tariff duties against BTKI rulesets.
 */
function resolveProductClassification(input = {}) {
  const params = typeof input === 'string' ? { targetHsCode: input } : (input || {});
  const {
    productName = '',
    description = '',
    attributes = {},
    targetHsCode = null,
    cifValueIdr = 0,
    importerStatus = {},
    hasNpwp = true,
    usesApi = true,
    dateStr = null
  } = params;
  const activeDateStr = dateStr || new Date().toISOString().slice(0, 10);
  const activeRuleset = getBtkirulesetForDate(activeDateStr);
  const validCifValue = requireRupiah(cifValueIdr, 'cifValueIdr');

  // Ruleset Unresolved Fail-Closed Safeguard
  if (!activeRuleset) {
    const canonicalContext = createDefaultProductContext({
      product: { name: productName || 'Unresolved Commodity', description, specifications: attributes },
      classification: { scheme: 'BTKI', version: 'NONE' },
      status: PRODUCT_CLASSIFICATION_STATUSES.UNRESOLVED,
      confidence: 'LOW',
      evidence: [`Ruleset Unresolved: No BTKI ruleset effective for date ${activeDateStr}`]
    });

    const baseResult = {
      productName: canonicalContext.product.name,
      classificationStatus: PRODUCT_CLASSIFICATION_STATUSES.UNRESOLVED,
      btkiCode: null,
      hs6Code: null,
      hsDescription: null,
      candidates: [],
      cifValueIdr: validCifValue,
      customsDuty: { importDutyPercent: null, importDutyAmount: null },
      importTax: { ppnTreatment: null, ppnPercent: null, ppnAmount: null, pph22RatePercent: null, pph22Amount: null },
      taxIncentive: { eligibleIncentives: [], isDtpApplied: false, dtpAmount: 0 },
      importDutyAmount: null,
      nilaiImpor: null,
      ppnAmount: null,
      pph22Amount: null,
      totalLandedTaxes: null,
      totalLandedCost: null,
      requiresLartasPermit: null,
      lartasAuthority: null,
      canonicalProductContext: canonicalContext
    };

    return buildResultEnvelope({
      result: baseResult,
      status: RESULT_STATUSES.REQUIRES_REVIEW,
      safeToUse: SAFE_TO_USE_STATES.REQUIRES_REVIEW,
      confidence: 'LOW',
      evidence: canonicalContext.evidence,
      provenance: {
        rulesetId: 'NONE',
        statute: 'OUT_OF_COVERAGE_DATE',
        calculatedAt: activeDateStr
      }
    });
  }

  const entries = activeRuleset.tariff_entries;

  // Importer status normalization (API vs Non-API vs No-NPWP)
  const apiActive = importerStatus.usesApi !== undefined ? Boolean(importerStatus.usesApi) : Boolean(usesApi);
  const npwpActive = importerStatus.hasNpwp !== undefined ? Boolean(importerStatus.hasNpwp) : Boolean(hasNpwp);

  let candidate = null;
  let matches = [];

  const queryText = (productName + " " + description + " " + (attributes.material || '') + " " + (attributes.category || '')).toLowerCase();

  if (targetHsCode) {
    const cleanHs = String(targetHsCode).replace(/[\.\s]/g, '');
    const exactMatches = entries.filter(e => e.btkiCode.replace(/[\.\s]/g, '') === cleanHs);
    if (exactMatches.length === 1) {
      candidate = exactMatches[0];
      matches = exactMatches;
    } else {
      const hs6Matches = entries.filter(e => e.hs6 === cleanHs.slice(0, 6) || e.btkiCode.replace(/[\.\s]/g, '').startsWith(cleanHs));
      if (hs6Matches.length === 1) {
        candidate = hs6Matches[0];
        matches = hs6Matches;
      } else if (hs6Matches.length > 1) {
        matches = hs6Matches;
        candidate = null; // AMBIGUOUS: multiple 8-digit BTKI tariff lines under this 6-digit HS heading
      }
    }
  }

  if (!candidate && queryText.trim()) {
    matches = entries.filter(e => {
      const desc = e.description.toLowerCase();
      const cat = e.category.toLowerCase();
      return desc.split(' ').some(w => w.length > 3 && queryText.includes(w)) || queryText.includes(cat);
    });

    if (matches.length === 1) {
      candidate = matches[0];
    }
  }

  const isAmbiguous = matches.length > 1;
  const isUnresolved = !candidate && matches.length === 0;

  // Fail-Closed Guard: UNRESOLVED or AMBIGUOUS status NEVER produces fabricated landed tax calculations
  if (isUnresolved || isAmbiguous) {
    const classificationStatus = isAmbiguous
      ? PRODUCT_CLASSIFICATION_STATUSES.AMBIGUOUS
      : PRODUCT_CLASSIFICATION_STATUSES.UNRESOLVED;

    const candidateRankings = matches.map((m, idx) => ({
      rank: idx + 1,
      btkiCode: m.btkiCode,
      description: m.description,
      category: m.category,
      rankingScore: Number((1 / (idx + 1)).toFixed(2))
    }));

    const canonicalContext = createDefaultProductContext({
      product: { name: productName || 'Unclassified Commodity', description, specifications: attributes },
      classification: { scheme: 'BTKI', version: activeRuleset.rulesetId },
      status: classificationStatus,
      confidence: 'LOW',
      evidence: [
        isAmbiguous ? `Ambiguous: Matched ${matches.length} candidate BTKI tariff lines` : 'Unresolved: No matching BTKI tariff line found',
        'Fail-Closed Safety: Landed tax calculation withheld until classification is resolved'
      ]
    });

    const baseResult = {
      productName: canonicalContext.product.name,
      classificationStatus,
      btkiCode: null,
      hs6Code: null,
      hsDescription: null,
      candidates: candidateRankings,
      cifValueIdr: validCifValue,
      customsDuty: { importDutyPercent: null, importDutyAmount: null },
      importTax: { ppnTreatment: null, ppnPercent: null, ppnAmount: null, pph22RatePercent: null, pph22Amount: null },
      taxIncentive: { eligibleIncentives: [], isDtpApplied: false, dtpAmount: 0 },
      importDutyAmount: null,
      nilaiImpor: null,
      ppnAmount: null,
      pph22Amount: null,
      totalLandedTaxes: null,
      totalLandedCost: null,
      requiresLartasPermit: null,
      lartasAuthority: null,
      canonicalProductContext: canonicalContext
    };

    return buildResultEnvelope({
      result: baseResult,
      status: RESULT_STATUSES.REQUIRES_REVIEW,
      safeToUse: SAFE_TO_USE_STATES.REQUIRES_REVIEW,
      confidence: 'LOW',
      evidence: canonicalContext.evidence,
      provenance: {
        rulesetId: activeRuleset.rulesetId,
        statute: activeRuleset.statute,
        calculatedAt: activeDateStr
      }
    });
  }

  // Single exact candidate resolved
  const resolvedHs = candidate;

  // PPh 22 Import Rate Determination (API 2.5%, Non-API 7.5%, No-NPWP 15.0%)
  let pph22RatePercent = 2.5;
  if (!npwpActive) {
    pph22RatePercent = 15.0; // 100% penalty on non-API rate
  } else if (!apiActive) {
    pph22RatePercent = 7.5; // Non-API rate
  } else {
    pph22RatePercent = resolvedHs.pph22ApiPercent || 2.5;
  }

  // Tariff duty calculations
  const importDutyPercent = resolvedHs.importDutyPercent;
  const importDutyAmount = Math.round(validCifValue * (importDutyPercent / 100));
  const nilaiImpor = validCifValue + importDutyAmount;

  // PPN Treatment Calculation
  const ppnTreatment = resolvedHs.ppnTreatment || PPN_TREATMENTS.STANDARD_12;
  let ppnPercent = 12;
  let ppnAmount = 0;

  if (ppnTreatment === PPN_TREATMENTS.EXEMPT || ppnTreatment === PPN_TREATMENTS.INCENTIVE_DTP) {
    ppnPercent = 0;
    ppnAmount = 0;
  } else if (ppnTreatment === PPN_TREATMENTS.NON_LUXURY_DPP_11_12) {
    ppnPercent = 11; // Effective 11% burden (12% x 11/12)
    ppnAmount = Math.round(nilaiImpor * (11 / 12) * 0.12);
  } else {
    ppnPercent = 12;
    ppnAmount = Math.round(nilaiImpor * 0.12);
  }

  const pph22Amount = Math.round(nilaiImpor * (pph22RatePercent / 100));
  const totalLandedTaxes = importDutyAmount + ppnAmount + pph22Amount;
  const totalLandedCost = validCifValue + totalLandedTaxes;

  const classificationStatus = PRODUCT_CLASSIFICATION_STATUSES.CLASSIFIED;
  const safeToUse = resolvedHs.requiresLartasPermit
    ? SAFE_TO_USE_STATES.REQUIRES_REVIEW
    : SAFE_TO_USE_STATES.SAFE_TO_USE_FOR_ESTIMATE;

  const classificationEvidence = [
    { attribute: 'product_name', source: productName || 'description', required: true, matched: true },
    { attribute: 'category', source: resolvedHs.category, required: true, matched: true },
    { attribute: 'btki_code', source: resolvedHs.btkiCode, required: true, matched: true }
  ];

  const lartasDetail = {
    required: resolvedHs.requiresLartasPermit,
    authority: resolvedHs.lartasAuthority || 'None',
    regulation: resolvedHs.requiresLartasPermit ? `Import Permit Required (${resolvedHs.lartasAuthority})` : 'No Lartas Permit Required',
    status: resolvedHs.requiresLartasPermit ? 'REVIEW_REQUIRED' : 'CLEAR'
  };

  const canonicalContext = createDefaultProductContext({
    product: {
      name: productName || resolvedHs.description,
      description,
      category: resolvedHs.category,
      specifications: attributes
    },
    classification: {
      scheme: 'BTKI',
      hs6: resolvedHs.hs6,
      btkiCode: resolvedHs.btkiCode,
      version: activeRuleset.rulesetId
    },
    commercial: {
      unitPriceIdr: validCifValue,
      unitCostIdr: totalLandedCost
    },
    status: classificationStatus,
    confidence: 'HIGH',
    evidence: [
      `BTKI 2022 Code: ${resolvedHs.btkiCode}`,
      `Statute: ${activeRuleset.statute}`,
      `PPN Treatment: ${ppnTreatment}`,
      `PPh 22 Impor Rate: ${pph22RatePercent}% (${apiActive ? 'API Importer' : (npwpActive ? 'Non-API Importer' : 'No-NPWP Penalty')})`,
      `Lartas Status: ${resolvedHs.requiresLartasPermit ? 'Requires Permit (' + resolvedHs.lartasAuthority + ')' : 'No Lartas Permit Required'}`
    ]
  });

  const customsDuty = {
    importDutyPercent,
    importDutyAmount
  };

  const dppFactor = ppnTreatment === PPN_TREATMENTS.NON_LUXURY_DPP_11_12 ? '11/12' : (ppnTreatment === PPN_TREATMENTS.EXEMPT || ppnTreatment === PPN_TREATMENTS.INCENTIVE_DTP ? '0/1' : '1/1');

  const importTax = {
    ppnTreatment,
    statutoryRatePercent: 12,
    dppFactor,
    effectiveRatePercent: ppnPercent,
    ppnPercent,
    ppnAmount,
    pph22RatePercent,
    pph22Amount
  };

  const taxIncentive = {
    eligibleIncentives: ppnTreatment === PPN_TREATMENTS.INCENTIVE_DTP ? ['PPN DTP'] : (ppnTreatment === PPN_TREATMENTS.EXEMPT ? ['PPN Pembebasan'] : []),
    isDtpApplied: ppnTreatment === PPN_TREATMENTS.INCENTIVE_DTP,
    dtpAmount: ppnTreatment === PPN_TREATMENTS.INCENTIVE_DTP ? Math.round(nilaiImpor * 0.12) : 0
  };

  const baseResult = {
    productName: canonicalContext.product.name,
    classificationStatus,
    btkiCode: resolvedHs.btkiCode,
    hs6Code: resolvedHs.hs6,
    hsDescription: resolvedHs.description,
    classificationEvidence,
    cifValueIdr: validCifValue,
    customsDuty,
    importTax,
    taxIncentive,
    importDutyPercent,
    importDutyAmount,
    nilaiImpor,
    ppnTreatment,
    ppnPercent,
    ppnAmount,
    pph22RatePercent,
    pph22Amount,
    totalLandedTaxes,
    totalLandedCost,
    requiresLartasPermit: resolvedHs.requiresLartasPermit,
    lartasAuthority: resolvedHs.lartasAuthority,
    lartas: lartasDetail,
    canonicalProductContext: canonicalContext
  };

  return buildResultEnvelope({
    result: baseResult,
    status: RESULT_STATUSES.COMPLETE,
    safeToUse,
    confidence: 'HIGH',
    evidence: canonicalContext.evidence,
    provenance: {
      rulesetId: activeRuleset.rulesetId,
      statute: activeRuleset.statute,
      effectiveFrom: activeRuleset.effective_from,
      calculatedAt: activeDateStr
    }
  });
}

module.exports = {
  STANDARD_PRODUCT_CONTEXT_SCHEMA_VERSION,
  PRODUCT_CLASSIFICATION_STATUSES,
  PPN_TREATMENTS,
  createDefaultProductContext,
  resolveProductClassification
};
