/**
 * Indonesian Business Agent Skills — TypeScript Type Definitions (`index.d.ts`)
 * Complete, zero-dependency type declarations for programmatic SDK usage.
 */

export type PtkpStatus =
  | 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3'
  | 'K/0'  | 'K/1'  | 'K/2'  | 'K/3';

export type TerCategory = 'A' | 'B' | 'C';

export type PhkReasonKey =
  | 'efficiency_loss'
  | 'efficiency_prevent_loss'
  | 'merger_employee_reject'
  | 'merger_employer_reject'
  | 'bankruptcy'
  | 'force_majeure'
  | 'retirement'
  | 'major_violation'
  | 'resignation';

export type BusinessArchetype =
  | 'PRODUCT_MANUFACTURING'
  | 'PROFESSIONAL_SERVICE'
  | 'CAPACITY_SERVICE'
  | 'MARKETPLACE_PLATFORM'
  | 'HYBRID';

export type BpjsRiskLevel =
  | 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 1 | 2 | 3 | 4 | 5;

export type TaxpayerType =
  | 'INDIVIDUAL' | 'CORPORATE' | 'PT' | 'CV' | 'FIRMA' | 'KOPERASI' | 'PERSEROAN_PERORANGAN';

export interface AuditReceipt {
  receiptId: string;
  timestamp: string;
  statutoryReference: string;
  rulesetId: string;
  calculationTrace: string[];
  verificationDigest: string;
}

export interface PPh21MonthlyResult {
  grossSalary: number;
  ptkpStatus: PtkpStatus;
  terCategory: TerCategory;
  effectiveRate: number;
  effectiveRatePercent: string;
  hasNpwp: boolean;
  identityStatus: string;
  penaltyApplied: boolean;
  monthlyTaxWithheld: number;
  calculationDate: string;
  rulesetId: string;
  rulesetVersion: string;
  statutoryReference: string;
  _auditReceipt?: AuditReceipt;
}

export interface PPh21DecemberResult {
  annualGrossIncome: number;
  ptkpStatus: PtkpStatus;
  ptkpAmount: number;
  biayaJabatan: number;
  annualJhtDeduction: number;
  netAnnualIncome: number;
  pkp: number;
  totalAnnualTaxArt17: number;
  janToNovTaxWithheld: number;
  decemberTaxWithheld: number;
  isOverpaid: boolean;
  overpaymentRefundAmount: number;
  taxStatus: 'LEBIH_BAYAR' | 'NIHIL' | 'KURANG_BAYAR';
  statutoryAction: string;
  hasNpwp: boolean;
  calculationDate: string;
  rulesetId: string;
  rulesetVersion: string;
  statutoryReference: string;
  _auditReceipt?: AuditReceipt;
}

export interface CorporateTaxResult {
  taxYear: number;
  grossTurnover: number;
  commercialNetProfit: number;
  positiveFiscalAdjustments: number;
  negativeFiscalAdjustments: number;
  fiscalNetIncomeBeforeLoss: number;
  priorYearFiscalLossCarryForward: number;
  remainingFiscalLoss: number;
  taxableIncome: number;
  appliedFacilityType: 'FULL_50_PERCENT_DISCOUNT' | 'PROPORTIONAL_PASAL_31E' | 'NONE';
  facilityTaxableIncome: number;
  nonFacilityTaxableIncome: number;
  facilityTaxDue: number;
  nonFacilityTaxDue: number;
  totalCorporateTaxDue: number;
  effectiveTaxRatePercent: string;
  statutoryRatePercent: string;
  statutoryReference: string;
  _auditReceipt?: AuditReceipt;
}

export interface PhkResult {
  monthlyWage: number;
  tenureYears: number;
  reasonKey: PhkReasonKey;
  reasonDescription: string;
  breakdown: {
    uangPesangon: {
      baseMonths: number;
      reasonMultiplier: number;
      finalMultiplier: number;
      amount: number;
    };
    uangPenghargaanMasaKerja: {
      baseMonths: number;
      reasonMultiplier: number;
      finalMultiplier: number;
      amount: number;
    };
    uangPenggantianHak: {
      unusedLeaveDays: number;
      leavePayoutAmount: number;
      totalUphAmount: number;
    };
    uangPisah: {
      amount: number;
      reference: string;
    };
  };
  totalPayout: number;
  statutoryReference: string;
}

export interface OvertimeResult {
  monthlyWage: number;
  hourlyWage: number;
  dayType: 'WORKDAY' | 'WEEKLY_REST_5_DAYS' | 'WEEKLY_REST_6_DAYS' | 'PUBLIC_HOLIDAY';
  hoursWorked: number;
  totalOvertimePay: number;
  breakdown: Array<{
    hourIndex: number;
    multiplier: number;
    amount: number;
  }>;
  statutoryReference: string;
}

export interface BpjsResult {
  baseWage: number;
  calculationDate: string;
  rulesetId: string;
  rulesetVersion: string;
  bpjsKesehatan: {
    cappedWage: number;
    employer: number;
    employee: number;
    total: number;
  };
  bpjsKetenagakerjaan: {
    jht: { employer: number; employee: number; total: number };
    jp: { cappedWage: number; employer: number; employee: number; total: number };
    jkk: { hazardLevel: string; ratePercent: string; employer: number };
    jkm: { employer: number };
  };
  summary: {
    totalEmployerContribution: number;
    totalEmployeeDeduction: number;
    grandTotalContribution: number;
  };
  statutoryReference: string;
}

export interface ContractRiskResult {
  contractRiskScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedRisks: Array<{
    code: string;
    description: string;
    severity: string;
    clauseMatched: string;
    statutoryBasis: string;
    recommendation: string;
  }>;
  complianceChecks: {
    pasal1266Waiver: boolean;
    liabilityCapped: boolean;
    penaltyExceedsCap: boolean;
    bilingualEquivalence: boolean;
  };
  summary: string;
}

export interface BusinessHealthResult {
  overallHealthScore: number;
  healthTier: 'SOVEREIGN_EXCELLENT' | 'STABLE_COMPLIANT' | 'VULNERABLE' | 'DISTRESSED';
  radarScores: {
    taxCompliance: number;
    laborCompliance: number;
    legalGovernance: number;
    financialStability: number;
    commercialEfficiency: number;
  };
  criticalAlerts: string[];
  recommendations: string[];
  calculatedAt: string;
}

// Direct function exports
export function calculatePPh21Monthly(
  grossSalary: number,
  ptkpStatus?: PtkpStatus | string,
  hasNpwp?: boolean,
  dateStr?: string | null
): PPh21MonthlyResult;

export function calculatePPh21DecemberReconciliation(
  annualGrossIncome: number,
  ptkpStatus?: PtkpStatus | string,
  janToNovTaxWithheld?: number,
  monthlyJhtEmployeeDeduction?: number,
  hasNpwp?: boolean,
  dateStr?: string | null
): PPh21DecemberResult;

export function calculatePhk(
  monthlyWage: number,
  tenureYears: number,
  reasonKey?: PhkReasonKey | string,
  remainingLeaveDays?: number,
  uangPisahAmount?: number
): PhkResult;

export function calculateBpjs(
  baseWage: number,
  jkkHazardLevel?: BpjsRiskLevel | string,
  dateStr?: string | null
): BpjsResult;

export function calculateThr(
  monthlyBaseSalary: number,
  fixedAllowance?: number,
  tenureMonths?: number
): {
  isEligible: boolean;
  tenureMonths: number;
  monthlyBaseSalary: number;
  fixedAllowance: number;
  totalMonthlyWage: number;
  calculationFormula: string;
  statutoryThrPayout: number;
  statutoryReference: string;
};

export function calculateCorporateTax(params: {
  grossTurnover?: number;
  commercialNetProfit?: number;
  positiveFiscalAdjustments?: number;
  negativeFiscalAdjustments?: number;
  priorYearFiscalLossCarryForward?: number;
  taxYear?: number;
}): CorporateTaxResult;

export function calculateOvertime(params: {
  monthlyWage: number;
  fixedAllowance?: number;
  hours: number;
  dayType?: 'WORKDAY' | 'WEEKLY_REST_5_DAYS' | 'WEEKLY_REST_6_DAYS' | 'PUBLIC_HOLIDAY';
}): OvertimeResult;

export function auditContractRisk(contractText: string): ContractRiskResult;

export function auditBusinessHealth(context: any): BusinessHealthResult;

// Domain namespaces
export const tax: any;
export const hr: any;
export const finance: any;
export const commerce: any;
export const marketing: any;
export const strategy: any;
export const legal: any;
export const security: any;
