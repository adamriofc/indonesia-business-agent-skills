/**
 * Indonesian Business Agent Skills — Root SDK Interface (`index.js`)
 *
 * Universal, zero-dependency, pure Node.js SDK interface for enterprise backends,
 * AI agent frameworks, and custom applications.
 *
 * Provides direct access to 55 deterministic computational and regulatory diff engines:
 *   - Tax: PPh 21 TER, December Reconciliation, Gross-Up, PPh Badan 31E, PPh 23/26, PPN 12%, UMKM 0.5%, Kurs Pajak KMK, NIK/NPWP 16-Digit, e-Bupot CSV Exporter
 *   - HR: BPJS Ketenagakerjaan & Kesehatan, PHK Severance (PP 35/2021), PKWT Compensation, PKWTT Compliance, Overtime (1/173), UPH Sisa Cuti, THR
 *   - Finance: Break-Even, Loan Amortization, Depreciation (SL/DDB/SYD), NPV, IRR, 14 Financial Ratios, Working Capital, 3-Statement Linker, WACC with Tax Shield
 *   - Commerce & Marketing: Marketplace Fee (Shopee/Tokopedia/TikTok), BTKI 2022 Product Classification, True Net ROAS & COD Retur, Customs Landed Cost
 *   - Strategy & Legal: KBLI 2020 Context Routing, OSS-RBA PP 5/2021, Contract Risk Scorer (0-100), Bilingual Contract Harmonizer (UU 24/2009), Porter Three Tests (Capacity & Digital Service Model), Enterprise Strategy Stress-Tester
 *   - Institutional & Security: Local Merkle Compliance Ledger, 360° Business Health Oracle, Prompt Injection Closed Delimiter Sanitization
 *
 * Usage:
 *   const { calculatePPh21Monthly, calculatePhk, calculateBpjs, auditContractRisk, auditBusinessHealth } = require('indonesia-business-agent-skills');
 *   // Or via domain namespaces:
 *   const { tax, hr, finance, commerce, strategy, legal, institutional, security } = require('indonesia-business-agent-skills');
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
const kmkForex = require(path.join(ENGINES, 'kmk-forex-calculator'));
const identityValidator = require(path.join(ENGINES, 'identity-validator'));
const ebupotExporter = require(path.join(ENGINES, 'ebupot-exporter'));

// 2. Labor, Employment & HR Engines
const phk = require(path.join(ENGINES, 'phk-calculator'));
const pkwt = require(path.join(ENGINES, 'pkwt-compensation-calculator'));
const pkwtt = require(path.join(ENGINES, 'pkwtt-calculator'));
const thr = require(path.join(ENGINES, 'thr-calculator'));
const bpjs = require(path.join(ENGINES, 'bpjs-calculator'));
const overtime = require(path.join(ENGINES, 'overtime-calculator'));
const uph = require(path.join(ENGINES, 'uph-calculator'));

// 3. Corporate Finance & Management Accounting Engines
const breakeven = require(path.join(ENGINES, 'break-even'));
const depreciation = require(path.join(ENGINES, 'depreciation'));
const loan = require(path.join(ENGINES, 'loan-amortization'));
const npv = require(path.join(ENGINES, 'npv'));
const irr = require(path.join(ENGINES, 'irr'));
const financialRatios = require(path.join(ENGINES, 'financial-ratios'));
const workingCapital = require(path.join(ENGINES, 'working-capital'));
const termSheet = require(path.join(ENGINES, 'term-sheet-waterfall'));
const financialLinker = require(path.join(ENGINES, 'financial-statement-linker'));
const waccCalculator = require(path.join(ENGINES, 'wacc-calculator'));

// 4. Marketing, Commerce & Product Classification
const marketplace = require(path.join(ENGINES, 'marketplace-fee-calculator'));
const marketSizing = require(path.join(ENGINES, 'market-sizing-engine'));
const unitEconomics = require(path.join(ENGINES, 'marketing-unit-economics'));
const productContext = require(path.join(ENGINES, 'product-context'));
const roasEngine = require(path.join(ENGINES, 'roas-contribution-engine'));
const landedCostCalculator = require(path.join(ENGINES, 'landed-cost-calculator'));

// 5. Strategy, Governance & Legal Engines
const kbli = require(path.join(ENGINES, 'kbli-context-router'));
const compliance = require(path.join(ENGINES, 'compliance-risk-engine'));
const decision = require(path.join(ENGINES, 'decision-engine'));
const businessScenario = require(path.join(ENGINES, 'business-scenario-engine'));
const strategicFramework = require(path.join(ENGINES, 'strategic-framework-engine'));
const strategicRisk = require(path.join(ENGINES, 'strategic-risk-engine'));
const scenarioAnalysis = require(path.join(ENGINES, 'scenario-analysis-engine'));
const decisionAnalysis = require(path.join(ENGINES, 'decision-analysis-engine'));
const frameworkApplicability = require(path.join(ENGINES, 'framework-applicability'));
const strategicProtocol = require(path.join(ENGINES, 'strategic-protocol'));
const strategyStressTester = require(path.join(ENGINES, 'strategy-stress-tester'));
const contractRisk = require(path.join(ENGINES, 'contract-risk-engine'));
const ossRba = require(path.join(ENGINES, 'oss-rba-engine'));
const bilingualHarmonizer = require(path.join(ENGINES, 'bilingual-contract-harmonizer'));

// 6. Institutional Trust & Security Engines
const complianceLedger = require(path.join(ENGINES, 'compliance-ledger'));
const businessHealthOracle = require(path.join(ENGINES, 'business-health-oracle'));
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
  calculateKmkForexConversion: kmkForex.calculateKmkForexConversion,
  calculateOffshoreWithholding: kmkForex.calculateOffshoreWithholding,
  validateNik: identityValidator.validateNik,
  validateNpwp: identityValidator.validateNpwp,
  normalizeTaxIdentity: identityValidator.normalizeTaxIdentity,
  exportEbupot21Csv: ebupotExporter.exportEbupot21Csv,
  exportEbupot23Csv: ebupotExporter.exportEbupot23Csv,

  // HR
  calculatePhk: phk.calculatePhk,
  REASON_MULTIPLIERS: phk.REASON_MULTIPLIERS,
  calculatePkwtCompensation: pkwt.calculatePkwtCompensation,
  auditPkwttStatus: pkwtt.auditPkwttStatus,
  calculateThr: thr.calculateThr,
  calculateBpjs: bpjs.calculateBpjs,
  calculateHourlyWage: overtime.calculateHourlyWage,
  calculateDailyOvertime: overtime.calculateDailyOvertime,
  calculateOvertime: overtime.calculateDailyOvertime, // Parity alias matching TypeScript definitions
  calculateMonthlyOvertimeSheet: overtime.calculateMonthlyOvertimeSheet,
  calculateUphPayout: uph.calculateUphPayout,

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
  validateStatementLinkage: financialLinker.validateStatementLinkage,
  calculateWacc: waccCalculator.calculateWacc,
  financialRatios,

  // Commerce & Marketing
  calculateMarketplaceFee: marketplace.calculateMarketplaceFee,
  calculateMarketSizing: marketSizing.calculateMarketSizing,
  calculateMarketingUnitEconomics: unitEconomics.calculateMarketingUnitEconomics,
  resolveProductClassification: productContext.resolveProductClassification,
  calculateTrueNetRoas: roasEngine.calculateTrueNetRoas,
  calculateLandedCost: landedCostCalculator.calculateLandedCost,

  // Strategy & Legal
  resolveBusinessArchetype: kbli.resolveBusinessArchetype,
  auditComplianceRisk: compliance.auditComplianceRisk,
  evaluateBusinessDecision: decision.evaluateBusinessDecision,
  evaluateBusinessScenario: businessScenario.evaluateBusinessScenario,
  checkFrameworkApplicability: frameworkApplicability.checkFrameworkApplicability,
  applyStrategicProtocol: strategicProtocol.applyStrategicProtocol,
  stressTestEnterprise: strategyStressTester.stressTestEnterprise,
  auditContractRisk: contractRisk.auditContractRisk,
  resolveOssRisk: ossRba.resolveOssRisk,
  verifyBilingualCompliance: bilingualHarmonizer.verifyBilingualCompliance,

  // Institutional Trust & Security
  ComplianceLedger: complianceLedger.ComplianceLedger,
  defaultLedger: complianceLedger.defaultLedger,
  recordComplianceEntry: complianceLedger.recordComplianceEntry,
  verifyComplianceChain: complianceLedger.verifyComplianceChain,
  auditBusinessHealth: businessHealthOracle.auditBusinessHealth,
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
    regulatoryImpact,
    kmkForex,
    identityValidator,
    ebupotExporter
  },
  hr: {
    phk,
    pkwt,
    pkwtt,
    thr,
    bpjs,
    overtime,
    uph
  },
  finance: {
    breakeven,
    depreciation,
    loan,
    npv,
    irr,
    financialRatios,
    workingCapital,
    termSheet,
    financialLinker,
    waccCalculator
  },
  commerce: {
    marketplace,
    productContext,
    roasEngine,
    landedCostCalculator
  },
  marketing: {
    marketSizing,
    unitEconomics,
    marketplace,
    roasEngine
  },
  strategy: {
    kbli,
    decision,
    businessScenario,
    strategicFramework,
    strategicRisk,
    scenarioAnalysis,
    decisionAnalysis,
    frameworkApplicability,
    strategicProtocol,
    strategyStressTester
  },
  legal: {
    compliance,
    pkwtt,
    contractRisk,
    ossRba,
    bilingualHarmonizer,
    securitySanitizer
  },
  institutional: {
    complianceLedger,
    businessHealthOracle
  },
  security: securitySanitizer
};
