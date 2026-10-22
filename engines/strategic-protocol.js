/**
 * Strategic Application Protocol (Strategic Operating System)
 * Connects KBLI Context Router, Business Archetype Adaptation, 4-State Framework Applicability,
 * and Evidence Sufficiency Verification into a unified protocol for all strategic skills.
 */

const { resolveBusinessArchetype } = require('./kbli-context-router');

/**
 * Executes the 12-Step Strategic Protocol to adapt any strategic framework to local Indonesian business reality.
 */
function applyStrategicProtocol({
  frameworkName = 'porter-five-forces',
  kbliCode = '70209',
  activityName = 'Konsultasi Manajemen',
  availableEvidence = {
    revenueData: true,
    competitorData: false,
    customerData: true
  },
  customAssumptions = []
}) {
  // 1. Resolve KBLI & Business Archetype
  const archetypeRes = resolveBusinessArchetype({ kbliCode, activityName });
  const archetype = archetypeRes.businessArchetype;
  const characteristics = archetypeRes.archetypeCharacteristics;

  // 2. 4-State Framework Applicability Check: NATIVE, ADAPTABLE, CONDITIONAL, NOT_RECOMMENDED
  let applicabilityStatus = 'NATIVE';
  let applicabilityNote = 'Framework applies natively to this business archetype.';

  if (frameworkName === 'bcg-matrix') {
    if (archetype === 'PRODUCT_MANUFACTURING') {
      applicabilityStatus = 'NATIVE';
      applicabilityNote = 'BCG Matrix applies natively using Physical SKU / Product Volume share.';
    } else if (archetype === 'PROFESSIONAL_SERVICE') {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'BCG Matrix adapted to Professional Service Lines / Practice Areas (using Practice Revenue Share as proxy).';
    } else if (archetype === 'CAPACITY_SERVICE') {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'BCG Matrix adapted to Capacity Slots / Properties (using Occupancy / Utilization Share as proxy).';
    } else {
      applicabilityStatus = 'CONDITIONAL';
      applicabilityNote = 'BCG Matrix requires explicit definition of Strategic Business Units (SBUs).';
    }
  } else if (frameworkName === 'value-chain-analysis') {
    if (archetype === 'PRODUCT_MANUFACTURING') {
      applicabilityStatus = 'NATIVE';
      applicabilityNote = 'Value Chain applies natively across physical inbound, ops, and outbound logistics.';
    } else if (archetype === 'PROFESSIONAL_SERVICE' || archetype === 'CAPACITY_SERVICE') {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'Value Chain adapted from physical manufacturing logistics to Service Co-Production and Slot Delivery.';
    }
  } else if (frameworkName === 'porter-three-tests') {
    if (archetype === 'PRODUCT_MANUFACTURING') {
      applicabilityStatus = 'NATIVE';
      applicabilityNote = 'Porter Three Tests applies natively across plant scale and physical acquisition premium.';
    } else if (archetype === 'CAPACITY_SERVICE') {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'Porter Three Tests adapted to EdTech & Capacity Services: platform setup efficiency vs slot/capacity utilization model.';
    } else {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'Porter Three Tests adapted to intangible talent/knowledge synergies & network effects.';
    }
  } else if (frameworkName === 'quantitative-swot') {
    if (archetype === 'PRODUCT_MANUFACTURING') {
      applicabilityStatus = 'NATIVE';
      applicabilityNote = 'Quantitative SWOT applies natively using plant utilization and commodity exposure.';
    } else {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'Quantitative SWOT adapted to archetype-specific internal capabilities and external market dynamics.';
    }
  } else if (frameworkName === 'balanced-scorecard') {
    if (archetype === 'PRODUCT_MANUFACTURING') {
      applicabilityStatus = 'NATIVE';
      applicabilityNote = 'Balanced Scorecard applies natively across manufacturing operations, OEE, and financial linkage.';
    } else {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'Balanced Scorecard adapted across multi-perspective KPIs tailored to business archetype.';
    }
  } else if (frameworkName === 'qspm-matrix') {
    if (archetype === 'PRODUCT_MANUFACTURING') {
      applicabilityStatus = 'NATIVE';
      applicabilityNote = 'QSPM applies natively to product line and manufacturing capacity strategy decisions.';
    } else {
      applicabilityStatus = 'ADAPTABLE';
      applicabilityNote = 'QSPM adapted to archetype-specific strategic alternatives using Attractiveness Scores against IFE/EFE factors.';
    }
  }

  // 3. Evidence Sufficiency Verification
  const evidenceKeys = Object.keys(availableEvidence || {});
  const presentEvidence = evidenceKeys.filter((k) => availableEvidence[k] === true);
  let evidenceSufficiency = 'SUFFICIENT';
  const missingEvidence = [];

  if (presentEvidence.length === 0) {
    evidenceSufficiency = 'INSUFFICIENT';
    missingEvidence.push('No market/financial evidence provided.');
  } else if (!availableEvidence.competitorData) {
    evidenceSufficiency = 'PARTIAL';
    missingEvidence.push('Competitor market share & relative margin data unavailable; using internal practice proxies.');
  }

  // 4. Required Assumptions
  const mandatoryAssumptions = [...customAssumptions];
  if (evidenceSufficiency === 'PARTIAL') {
    mandatoryAssumptions.push('Relative market position estimated via internal revenue contribution due to missing external competitor data.');
  }

  return {
    protocolVersion: '1.1.0',
    frameworkName,
    businessContext: {
      kbliCode: archetypeRes.kbliCode,
      activityName: archetypeRes.activityName,
      businessArchetype: archetype,
      unitOfAnalysis: characteristics.unitOfAnalysis,
      valueChainFocus: characteristics.valueChainFocus
    },
    applicability: {
      status: applicabilityStatus, // NATIVE, ADAPTABLE, CONDITIONAL, NOT_RECOMMENDED
      isApplicable: applicabilityStatus !== 'NOT_RECOMMENDED',
      applicabilityNote
    },
    evidenceVerification: {
      sufficiency: evidenceSufficiency,
      presentEvidence,
      missingEvidence
    },
    mandatoryAssumptions,
    protocolSteps: [
      '1. Identify Business Activity',
      '2. Resolve KBLI 2020 Context',
      '3. Determine Business Archetype',
      '4. Determine Unit of Analysis',
      '5. 4-State Framework Applicability Check (NATIVE/ADAPTABLE/CONDITIONAL/NOT_RECOMMENDED)',
      '6. Verify Evidence Sufficiency',
      '7. Identify Missing Evidence',
      '8. State Explicit Assumptions',
      '9. Apply Framework Logic',
      '10. Execute Deterministic Engine Scoring',
      '11. State Analytical Confidence',
      '12. Define Strategic Recommendations'
    ]
  };
}

module.exports = {
  applyStrategicProtocol
};