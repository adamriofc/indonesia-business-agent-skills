/**
 * Indonesian Business Agent Skills — Root SDK Interface (`index.js`)
 *
 * Universal, zero-dependency, pure Node.js SDK interface for enterprise backends,
 * AI agent frameworks, and custom applications.
 *
 * Provides direct access to 40 deterministic computational and regulatory diff engines:
 *   - Tax: PPh 21 TER, December Reconciliation, Gross-Up, PPh Badan 31E, PPh 23/26, PPN 12%, UMKM 0.5%
 *   - HR: BPJS Ketenagakerjaan & Kesehatan, PHK Severance (PP 35/2021), PKWT Compensation, PKWTT Compliance, THR
 *   - Finance: Break-Even, Loan Amortization, Depreciation (SL/DDB/SYD), NPV, IRR, 14 Financial Ratios, Working Capital
 *   - Commerce & Marketing: Marketplace Fee (Shopee/Tokopedia/TikTok), BTKI 2022 Product Classification, Market Sizing, Unit Economics
 *   - Strategy & Legal: KBLI 2020 Context Routing, Compliance Risk, Decision Engine, Business Scenario, Thin Cap Transfer Pricing
 *   - Security: Prompt Injection Closed Delimiter Sanitization & Isolation
 *
 * Usage:
 *   const { calculatePPh21Monthly, calculatePhk, calculateBpjs } = require('indonesian-business-agent-skills');
 *   // Or via domain namespaces:
 *   const { tax, hr, finance, commerce, strategy, legal, security } = require('indonesian-business-agent-skills');
 */

const path = require('path');
const ENGINES = path.join(__dirname, 'engines');

// 1. Tax Engineering Engines
const pph21 = require(path.join(ENGINES, 'pph21-calculator'));
const pph21Grossup = require(path.join(ENGINES, 'pph21-grossup-calculator'));
const pphBadan = require(path.join(ENGINES, 'pph-badan-calculator'));
const pph23_26 = require(path.join(ENGINES, 'pph23-26-calculator'));
const umkmTax = require(path.join(ENGINES, 'umkm-tax-calculator'));
const ppnPpnbm = require(path.join(ENGINES, 'ppn-ppnbm-calculator'));
const transferPricing = require(path.join(ENGINES, 'transfer-pricing-engine'));
const regulatoryDiff = require(path.join(ENGINES, 'regulatory-diff'));
const regulatoryImpact = require(path.join(ENGINES, 'regulatory-impact-engine'));

// 2. Labor, Employment & HR Engines
const phk = require(path.join(ENGINES, 'phk-calculator'));
const pkwt = require(path.join(ENGINES, 'pkwt-compensation-calculator'));
const pkwtt = require(path.join(ENGINES, 'pkwtt-calculator'));
const thr = require(path.join(ENGINES, 'thr-calculator'));
const bpjs = require(path.join(ENGINES, 'bpjs-calculator'));

// 3. Corporate Finance & Management Accounting Engines
const breakeven = require(path.join(ENGINES, 'break-even'));
const depreciation = require(path.join(ENGINES, 'depreciation'));
const loan = require(path.join(ENGINES, 'loan-amortization'));
const npv = require(path.join(ENGINES, 'npv'));
const irr = require(path.join(ENGINES, 'irr'));
const financialRatios = require(path.join(ENGINES, 'financial-ratios'));
const workingCapital = require(path.join(ENGINES, 'working-capital'));
const termSheet = require(path.join(ENGINES, 'term-sheet-waterfall'));

// 4. Marketing, Commerce & Product Classification
const marketplace = require(path.join(ENGINES, 'marketplace-fee-calculator'));
const marketSizing = require(path.join(ENGINES, 'market-sizing-engine'));
const unitEconomics = require(path.join(ENGINES, 'marketing-unit-economics'));
const productContext = require(path.join(ENGINES, 'product-context'));

// 5. Strategy, Governance & Decision Intelligence
const kbli = require(path.join(ENGINES, 'kbli-context-router'));
const compliance = require(path.join(ENGINES, 'compliance-risk-engine'));
const decision = require(path.join(ENGINES, 'decision-engine'));
const businessScenario = require(path.join(ENGINES, 'business-scenario-engine'));
const strategicFramework = require(path.join(ENGINES, 'strategic-framework-engine'));
const strategicRisk = require(path.join(ENGINES, 'strategic-risk-engine'));
const scenarioAnalysis = require(path.join(ENGINES, 'scenario-analysis-engine'));
const decisionAnalysis = require(path.join(ENGINES, 'decision-analysis-engine'));

// 6. Security & Ingestion Sanitization
const securitySanitizer = require(path.join(ENGINES, 'security-sanitizer'));

module.exports = {
  // --- Individual Named Functions (Direct Access) ---
  // Tax
  calculatePPh21Monthly: pph21.calculatePPh21Monthly,
  calculateArticle17AnnualTax: pph21.calculateArticle17AnnualTax,
  calculatePPh21DecemberReconciliation: pph21.calculatePPh21DecemberReconciliation,
  getTerCategory: pph21.getTerCategory,
  PTKP_VALUES: pph21.PTKP_VALUES,
  calculatePPh21GrossUp: pph21Grossup.calculatePPh21GrossUp,
  calculateCorporateTax: pphBadan.calculateCorporateTax,
  calculatePPh23And26: pph23_26.calculatePPh23And26,
  calculateUmkmFinalTax: umkmTax.calculateUmkmFinalTax,
  calculatePpnAndPpnbm: ppnPpnbm.calculatePpnAndPpnbm,
  auditTransferPricingThinCap: transferPricing.auditTransferPricingThinCap,
  compareRulesets: regulatoryDiff.compareRulesets,
  analyzeRegulatoryImpact: regulatoryImpact.analyzeRegulatoryImpact,

  // HR
  calculatePhk: phk.calculatePhk,
  REASON_MULTIPLIERS: phk.REASON_MULTIPLIERS,
  calculatePkwtCompensation: pkwt.calculatePkwtCompensation,
  auditPkwttStatus: pkwtt.auditPkwttStatus,
  calculateThr: thr.calculateThr,
  calculateBpjs: bpjs.calculateBpjs,

  // Finance
  breakEvenUnits: breakeven.breakEvenUnits,
  breakEvenRevenue: breakeven.breakEvenRevenue,
  contributionMargin: breakeven.contributionMargin,
  contributionMarginRatio: breakeven.contributionMarginRatio,
  marginOfSafety: breakeven.marginOfSafety,
  straightLineDepreciation: depreciation.straightLine,
  doubleDecliningDepreciation: depreciation.doubleDeclining,
  sumOfYearsDigitsDepreciation: depreciation.sumOfYearsDigits,
  monthlyLoanPayment: loan.monthlyPayment,
  loanAmortizationSchedule: loan.amortizationSchedule,
  npv: npv.npv,
  npvWithTerminalValue: npv.npvWithTerminalValue,
  irr: irr.irr,
  netWorkingCapital: workingCapital.netWorkingCapital,
  workingCapitalRatio: workingCapital.workingCapitalRatio,
  workingCapitalRequirement: workingCapital.workingCapitalRequirement,
  cashConversionCycle: workingCapital.cashConversionCycle,
  financialRatios,

  // Commerce & Marketing
  calculateMarketplaceFee: marketplace.calculateMarketplaceFee,
  calculateMarketSizing: marketSizing.calculateMarketSizing,
  calculateMarketingUnitEconomics: unitEconomics.calculateMarketingUnitEconomics,
  resolveProductClassification: productContext.resolveProductClassification,

  // Strategy & Governance
  resolveBusinessArchetype: kbli.resolveBusinessArchetype,
  auditComplianceRisk: compliance.auditComplianceRisk,
  evaluateBusinessDecision: decision.evaluateBusinessDecision,
  evaluateBusinessScenario: businessScenario.evaluateBusinessScenario,

  // Security
  sanitizeUntrustedPayload: securitySanitizer.sanitizeUntrustedPayload,
  wrapUntrustedPayload: securitySanitizer.wrapUntrustedPayload,
  extractIsolatedPayload: securitySanitizer.extractIsolatedPayload,

  // --- Domain Namespaces (Grouped Access) ---
  tax: {
    pph21,
    pph21Grossup,
    pphBadan,
    pph23_26,
    umkmTax,
    ppnPpnbm,
    transferPricing,
    regulatoryDiff,
    regulatoryImpact
  },
  hr: {
    phk,
    pkwt,
    pkwtt,
    thr,
    bpjs
  },
  finance: {
    breakeven,
    depreciation,
    loan,
    npv,
    irr,
    financialRatios,
    workingCapital,
    termSheet
  },
  commerce: {
    marketplace,
    productContext
  },
  marketing: {
    marketSizing,
    unitEconomics,
    marketplace
  },
  strategy: {
    kbli,
    decision,
    businessScenario,
    strategicFramework,
    strategicRisk,
    scenarioAnalysis,
    decisionAnalysis,
    regulatoryImpact
  },
  legal: {
    compliance,
    pkwtt,
    securitySanitizer
  },
  security: securitySanitizer
};
