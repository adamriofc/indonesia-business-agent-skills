/**
 * Strategic Framework Applicability & Unit-of-Analysis Engine
 * Evaluates framework applicability across 4 states (NATIVE, ADAPTABLE, CONDITIONAL, NOT_RECOMMENDED)
 * and determines the exact Unit of Analysis based on KBLI Business Archetype.
 */

const { resolveBusinessArchetype } = require('./kbli-context-router');

const FRAMEWORK_APPLICABILITY_MATRIX = {
  'bcg-matrix': {
    PRODUCT_MANUFACTURING: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'PHYSICAL_SKU_OR_PRODUCT_LINE', metric: 'Physical Volume or Revenue Share' },
    PROFESSIONAL_SERVICE: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'PRACTICE_AREA_OR_SERVICE_LINE', metric: 'Practice Revenue Contribution Share' },
    CAPACITY_SERVICE: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'CAPACITY_SLOT_OR_PROPERTY', metric: 'Occupancy or Slot Utilization Share' },
    MARKETPLACE_PLATFORM: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'GMV_CATEGORY_OR_STOREFRONT', metric: 'GMV or Seller Market Share' },
    HYBRID: { status: 'CONDITIONAL', recommendationLevel: 'CONDITIONAL', unitOfAnalysis: 'STRATEGIC_BUSINESS_UNIT', metric: 'Revenue Contribution Share' }
  },
  'porter-five-forces': {
    PRODUCT_MANUFACTURING: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'INDUSTRY_SECTOR', metric: 'Five Forces Intensity Scores' },
    PROFESSIONAL_SERVICE: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'SERVICE_MARKET_SECTOR', metric: 'Client & Talent Bargaining Power' },
    CAPACITY_SERVICE: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'LOCAL_SERVICE_MARKET', metric: 'Local Capacity & Substitute Intensity' },
    MARKETPLACE_PLATFORM: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'PLATFORM_ECOSYSTEM', metric: 'Network Effects & Platform Substitutes' },
    HYBRID: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'COMMERCIAL_SECTOR', metric: 'Five Forces Intensity Scores' }
  },
  'value-chain-analysis': {
    PRODUCT_MANUFACTURING: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'MANUFACTURING_LOGISTICS_CHAIN', metric: 'Inbound, Ops, Outbound Logistics Drivers' },
    PROFESSIONAL_SERVICE: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'KNOWLEDGE_DELIVERY_CHAIN', metric: 'Lead Gen, Contracting, Knowledge Acquisition, Execution' },
    CAPACITY_SERVICE: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'SERVICE_CO_PRODUCTION_CHAIN', metric: 'Capacity Slot Setup, Co-Production, Delivery' },
    MARKETPLACE_PLATFORM: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'PLATFORM_NETWORK_CHAIN', metric: 'Seller Acquisition, Buyer Acquisition, Infrastructure' },
    HYBRID: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'VALUE_CREATION_CHAIN', metric: 'Primary Operations & Support Drivers' }
  },
  'porter-three-tests': {
    PRODUCT_MANUFACTURING: { status: 'NATIVE', recommendationLevel: 'RECOMMENDED', unitOfAnalysis: 'PHYSICAL_ASSET_AND_PLANT_LINE', metric: 'Plant Scale & Asset Acquisition Premium' },
    PROFESSIONAL_SERVICE: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'KNOWLEDGE_PRACTICE_OR_TALENT_LINE', metric: 'Intangible Knowledge Reuse & Talent Synergies' },
    CAPACITY_SERVICE: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'TECH_PLATFORM_VS_CAPACITY_SLOT', metric: 'Platform Setup Efficiency vs Slot/Capacity Utilization Model' },
    MARKETPLACE_PLATFORM: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'PLATFORM_NETWORK_INFRASTRUCTURE', metric: 'Two-Sided Network Effects Synergy' },
    HYBRID: { status: 'ADAPTABLE', recommendationLevel: 'ADAPTABLE', unitOfAnalysis: 'INTEGRATED_BUSINESS_PORTFOLIO', metric: 'Integrated DCF Sensitivity NPV 3-Scenarios vs Cross-Selling' }
  }
};

function checkFrameworkApplicability({
  frameworkName = 'bcg-matrix',
  kbliCode = '70209',
  activityName = ''
}) {
  const archetypeRes = resolveBusinessArchetype({ kbliCode, activityName });
  const archetype = archetypeRes.businessArchetype;

  const frameworkRules = FRAMEWORK_APPLICABILITY_MATRIX[frameworkName] || {};
  const evalResult = frameworkRules[archetype] || {
    status: 'CONDITIONAL',
    recommendationLevel: 'CONDITIONAL',
    unitOfAnalysis: 'BUSINESS_UNIT',
    metric: 'Custom Strategic Metric'
  };

  return {
    frameworkName,
    kbliCode: archetypeRes.kbliCode,
    businessArchetype: archetype,
    applicabilityStatus: evalResult.status, // NATIVE, ADAPTABLE, CONDITIONAL, NOT_RECOMMENDED
    recommendationLevel: evalResult.recommendationLevel, // RECOMMENDED, ADAPTABLE, CONDITIONAL, NOT_RECOMMENDED
    unitOfAnalysis: evalResult.unitOfAnalysis,
    recommendedMetric: evalResult.metric,
    applicabilityReason: `Framework '${frameworkName}' has applicability level '${evalResult.recommendationLevel}' for business archetype '${archetype}'.`
  };
}

module.exports = {
  checkFrameworkApplicability
};