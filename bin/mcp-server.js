#!/usr/bin/env node
/**
 * Native Zero-Dependency MCP Server for Indonesia Business Agent Skills
 * Exposes all deterministic engines as Model Context Protocol (MCP) tools over stdio.
 * Pure Node.js 18+, zero external npm dependencies, cross-platform & lightweight.
 */

const readline = require('readline');
const path = require('path');
const pkg = require('../package.json');

const ROOT = path.join(__dirname, '..');
const ENGINES = path.join(ROOT, 'engines');

// Lazy load engines to minimize memory footprint
const engines = {
  pph21: () => require(path.join(ENGINES, 'pph21-calculator')),
  pph21Grossup: () => require(path.join(ENGINES, 'pph21-grossup-calculator')),
  pphBadan: () => require(path.join(ENGINES, 'pph-badan-calculator')),
  pph23: () => require(path.join(ENGINES, 'pph23-26-calculator')),
  phk: () => require(path.join(ENGINES, 'phk-calculator')),
  thr: () => require(path.join(ENGINES, 'thr-calculator')),
  bpjs: () => require(path.join(ENGINES, 'bpjs-calculator')),
  umkm: () => require(path.join(ENGINES, 'umkm-tax-calculator')),
  ppn: () => require(path.join(ENGINES, 'ppn-ppnbm-calculator')),
  pkwtt: () => require(path.join(ENGINES, 'pkwtt-calculator')),
  pkwtComp: () => require(path.join(ENGINES, 'pkwt-compensation-calculator')),
  breakeven: () => require(path.join(ENGINES, 'break-even')),
  kbli: () => require(path.join(ENGINES, 'kbli-context-router')),
  compliance: () => require(path.join(ENGINES, 'compliance-risk-engine')),
  decision: () => require(path.join(ENGINES, 'decision-engine')),
  marketplace: () => require(path.join(ENGINES, 'marketplace-fee-calculator')),
  npv: () => require(path.join(ENGINES, 'npv')),
  irr: () => require(path.join(ENGINES, 'irr')),
  depreciation: () => require(path.join(ENGINES, 'depreciation')),
  loan: () => require(path.join(ENGINES, 'loan-amortization')),
  ratios: () => require(path.join(ENGINES, 'financial-ratios')),
  workingCapital: () => require(path.join(ENGINES, 'working-capital')),
  marketSizing: () => require(path.join(ENGINES, 'market-sizing-engine')),
  unitEconomics: () => require(path.join(ENGINES, 'marketing-unit-economics')),
  thincap: () => require(path.join(ENGINES, 'transfer-pricing-engine')),
  regulatoryDiff: () => require(path.join(ENGINES, 'regulatory-diff')),
  regulatoryImpact: () => require(path.join(ENGINES, 'regulatory-impact-engine')),
  productContext: () => require(path.join(ENGINES, 'product-context')),
  overtime: () => require(path.join(ENGINES, 'overtime-calculator')),
  uph: () => require(path.join(ENGINES, 'uph-calculator')),
  kmkForex: () => require(path.join(ENGINES, 'kmk-forex-calculator')),
  identityValidator: () => require(path.join(ENGINES, 'identity-validator')),
  contractRisk: () => require(path.join(ENGINES, 'contract-risk-engine')),
  ossRba: () => require(path.join(ENGINES, 'oss-rba-engine')),
  financialLinker: () => require(path.join(ENGINES, 'financial-statement-linker')),
  wacc: () => require(path.join(ENGINES, 'wacc-calculator')),
  roas: () => require(path.join(ENGINES, 'roas-contribution-engine')),
  landedCost: () => require(path.join(ENGINES, 'landed-cost-calculator')),
  strategyStress: () => require(path.join(ENGINES, 'strategy-stress-tester')),
  businessHealth: () => require(path.join(ENGINES, 'business-health-oracle')),
  quantitativeSwot: () => require(path.join(ENGINES, 'quantitative-swot-engine')),
  balancedScorecard: () => require(path.join(ENGINES, 'balanced-scorecard-engine')),
  qspm: () => require(path.join(ENGINES, 'qspm-engine')),
  rop: () => require(path.join(ENGINES, 'rop-safety-stock-engine')),
  inventoryValuation: () => require(path.join(ENGINES, 'inventory-valuation-engine')),
  eclProvision: () => require(path.join(ENGINES, 'ecl-provision-engine'))
};

const TOOLS = [
  {
    name: "calc_pph21_monthly",
    description: "Calculate Indonesian monthly employee income tax (PPh 21 TER) under PP No. 58/2023 & PMK No. 168/2023.",
    inputSchema: {
      type: "object",
      properties: {
        grossSalary: { type: "number", description: "Monthly gross salary in IDR (Gaji bruto bulanan)" },
        ptkpStatus: { type: "string", description: "PTKP status: TK/0, TK/1, TK/2, TK/3, K/0, K/1, K/2, K/3" },
        hasNpwp: { type: "boolean", default: true, description: "Whether employee has valid NPWP/NIK (false applies 20% surcharge)" },
        dateStr: { type: "string", description: "Effective calculation date (YYYY-MM-DD)" }
      },
      required: ["grossSalary", "ptkpStatus"]
    }
  },
  {
    name: "calc_pph21_december_recon",
    description: "Calculate PPh 21 December annual reconciliation and evaluate statutory Overpayment (Lebih Bayar Refund) under PMK 168/2023 Pasal 14 ayat (2).",
    inputSchema: {
      type: "object",
      properties: {
        annualGrossIncome: { type: "number", description: "Annual gross salary in IDR" },
        ptkpStatus: { type: "string", description: "PTKP status (TK/0..K/3)" },
        janToNovTaxWithheld: { type: "number", description: "Total PPh 21 withheld from January to November in IDR" },
        monthlyJhtEmployeeDeduction: { type: "number", default: 0, description: "Monthly employee JHT deduction in IDR" },
        hasNpwp: { type: "boolean", default: true, description: "Whether employee has valid NPWP" },
        dateStr: { type: "string", description: "Calculation date (YYYY-MM-DD)" }
      },
      required: ["annualGrossIncome", "ptkpStatus", "janToNovTaxWithheld"]
    }
  },
  {
    name: "calc_pph_badan",
    description: "Calculate 22% Corporate Income Tax (PPh Badan) with Pasal 31E UU PPh sliding scale facility and fiscal reconciliation.",
    inputSchema: {
      type: "object",
      properties: {
        grossTurnover: { type: "number", description: "Annual gross revenue in IDR (Peredaran bruto)" },
        commercialNetProfit: { type: "number", description: "Commercial net profit in IDR" },
        positiveFiscalAdjustments: { type: "number", default: 0, description: "Positive fiscal adjustments (Koreksi fiskal positif)" },
        negativeFiscalAdjustments: { type: "number", default: 0, description: "Negative fiscal adjustments (Koreksi fiskal negatif)" },
        priorYearFiscalLossCarryForward: { type: "number", default: 0, description: "Prior year fiscal loss compensation in IDR" },
        taxYear: { type: "number", default: 2026, description: "Tax year" }
      },
      required: ["grossTurnover", "commercialNetProfit"]
    }
  },
  {
    name: "calc_pph23_26",
    description: "Calculate PPh 23 (2% service / 15% royalty) and PPh 26 (20% offshore / Tax Treaty DGT Form).",
    inputSchema: {
      type: "object",
      properties: {
        grossAmount: { type: "number", description: "Gross transaction amount in IDR" },
        transactionType: { type: "string", default: "service", description: "service, rent, royalty, dividend, interest, or offshore" },
        hasNpwp: { type: "boolean", default: true, description: "Whether vendor has NPWP (false applies 100% penalty)" },
        hasDgtForm: { type: "boolean", default: false, description: "Whether offshore recipient has valid DGT Form" },
        taxTreatyRatePercent: { type: "number", description: "Reduced tax treaty rate percentage if DGT Form is valid" }
      },
      required: ["grossAmount"]
    }
  },
  {
    name: "calc_phk_severance",
    description: "Calculate statutory severance packages (Uang Pesangon, UPMK, UPH, Uang Pisah) for employment termination under PP No. 35/2021.",
    inputSchema: {
      type: "object",
      properties: {
        monthlyWage: { type: "number", description: "Monthly wage (Base salary + fixed allowances) in IDR" },
        tenureYears: { type: "number", description: "Length of service in years (Masa kerja)" },
        reasonKey: { 
          type: "string", 
          description: "Termination reason (efficiency_loss, efficiency_prevent_loss, retirement, resignation, bankruptcy, force_majeure, major_violation, merger_employee_reject, merger_employer_reject)" 
        },
        remainingLeaveDays: { type: "number", default: 0, description: "Unused paid annual leave days (Sisa cuti tahunan)" },
        uangPisahAmount: { type: "number", default: 0, description: "Contractual separation pay (Uang pisah) in IDR" }
      },
      required: ["monthlyWage", "tenureYears", "reasonKey"]
    }
  },
  {
    name: "calc_pkwt_compensation",
    description: "Calculate statutory PKWT contract completion compensation pay under PP No. 35/2021 Pasal 15-17.",
    inputSchema: {
      type: "object",
      properties: {
        monthlyWage: { type: "number", description: "Monthly wage in IDR" },
        tenureMonths: { type: "number", description: "Service duration in months" }
      },
      required: ["monthlyWage", "tenureMonths"]
    }
  },
  {
    name: "calc_thr_payout",
    description: "Calculate statutory religious holiday allowance (Tunjangan Hari Raya - THR) under Permenaker No. 6/2016.",
    inputSchema: {
      type: "object",
      properties: {
        monthlyBaseSalary: { type: "number", description: "Monthly base salary in IDR (Gaji pokok)" },
        fixedAllowance: { type: "number", default: 0, description: "Monthly fixed allowance in IDR (Tunjangan tetap)" },
        tenureMonths: { type: "number", description: "Service tenure in months (Masa kerja)" }
      },
      required: ["monthlyBaseSalary", "tenureMonths"]
    }
  },
  {
    name: "calc_bpjs_contributions",
    description: "Calculate employer and employee monthly contributions for BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) and BPJS Kesehatan.",
    inputSchema: {
      type: "object",
      properties: {
        monthlySalary: { type: "number", description: "Monthly salary in IDR" },
        riskLevel: { type: "string", default: "low", description: "Workplace accident risk level: very_low, low, medium, high, very_high" },
        dateStr: { type: "string", description: "Effective ruleset date (YYYY-MM-DD)" }
      },
      required: ["monthlySalary"]
    }
  },
  {
    name: "calc_umkm_final_tax",
    description: "Calculate 0.5% MSME final income tax under PP No. 55/2022 & PP No. 20/2026, respecting the Rp 500M annual threshold exemption for Individual Taxpayers.",
    inputSchema: {
      type: "object",
      properties: {
        monthlyTurnover: { type: "number", description: "Gross turnover for current month in IDR (Omzet bulanan)" },
        cumulativePreviousTurnover: { type: "number", default: 0, description: "Cumulative gross turnover in current tax year prior to this month" },
        taxpayerType: { type: "string", default: "INDIVIDUAL", description: "Taxpayer entity: INDIVIDUAL, CORPORATE, PT, CV, or PERSEROAN_PERORANGAN" },
        dateStr: { type: "string", description: "Tax calculation date (YYYY-MM-DD)" }
      },
      required: ["monthlyTurnover"]
    }
  },
  {
    name: "calc_ppn_ppnbm",
    description: "Calculate statutory 12% PPN, Besaran Tertentu (1.2% logistics/travel per PMK 71/2022 & PMK 131/2024), DPP Nilai Lain, and PPnBM luxury tax.",
    inputSchema: {
      type: "object",
      properties: {
        sellingPriceOrDpp: { type: "number", description: "Selling price or DPP in IDR" },
        transactionType: { 
          type: "string", 
          default: "standard", 
          description: "Transaction type: standard, dpp_nilai_lain, besaran_tertentu, import, export_zero" 
        },
        ppnbmRatePercent: { type: "number", default: 0, description: "PPnBM rate percentage (e.g. 10, 20, 50)" },
        cifValueIdr: { type: "number", default: 0, description: "For imports: Cost Insurance Freight in IDR" },
        customsDutyAmount: { type: "number", default: 0, description: "For imports: Bea Masuk in IDR" },
        inputTaxCreditsAlreadyPaid: { type: "number", default: 0, description: "Pajak Masukan already paid" }
      },
      required: ["sellingPriceOrDpp"]
    }
  },
  {
    name: "calc_marketplace_fee",
    description: "Calculate marketplace net seller payout, platform admin fee, and free shipping extra deductions (Shopee, Tokopedia, TikTok Shop).",
    inputSchema: {
      type: "object",
      properties: {
        sellingPrice: { type: "number", description: "Selling price per item in IDR" },
        platform: { type: "string", default: "shopee", description: "Platform: shopee, tokopedia, tiktok_shop" },
        sellerTier: { type: "string", default: "star", description: "Seller tier: non_star, star, star_plus, mall, regular, power_merchant, official_store, standard" },
        freeShippingExtra: { type: "boolean", default: true, description: "Whether Free Shipping Extra program is active" },
        adSpendBudget: { type: "number", default: 0, description: "Optional advertising budget per sale in IDR" }
      },
      required: ["sellingPrice"]
    }
  },
  {
    name: "audit_pkwtt_compliance",
    description: "Audit PKWT/PKWTT employment contract compliance, probation limits (max 3 months), and auto-conversion triggers under PP 35/2021 & UU 6/2023.",
    inputSchema: {
      type: "object",
      properties: {
        monthlyWage: { type: "number", description: "Monthly wage in IDR" },
        probationMonths: { type: "number", default: 0, description: "Contract probation duration in months" },
        minimumWage: { type: "number", default: 0, description: "Applicable statutory provincial/district minimum wage (UMP/UMK) in IDR" },
        contractType: { type: "string", default: "pkwt", description: "Contract type: pkwt or pkwtt" },
        jobType: { type: "string", default: "permanent", description: "Job nature: permanent, temporary, core_production" },
        totalTenureMonths: { type: "number", default: 0, description: "Cumulative service tenure in months" }
      },
      required: ["monthlyWage"]
    }
  },
  {
    name: "analyze_break_even",
    description: "Compute break-even units, break-even revenue, contribution margin, and margin of safety.",
    inputSchema: {
      type: "object",
      properties: {
        fixedCosts: { type: "number", description: "Total fixed costs in IDR" },
        pricePerUnit: { type: "number", description: "Selling price per unit in IDR" },
        variableCostPerUnit: { type: "number", description: "Variable cost per unit in IDR" },
        actualRevenue: { type: "number", description: "Optional actual revenue in IDR to calculate Margin of Safety" }
      },
      required: ["fixedCosts", "pricePerUnit", "variableCostPerUnit"]
    }
  },
  {
    name: "calc_npv",
    description: "Calculate Net Present Value (NPV) using discounted cash flow formula with optional terminal value.",
    inputSchema: {
      type: "object",
      properties: {
        rate: { type: "number", description: "Discount rate / WACC (e.g. 0.10 for 10%)" },
        cashflows: { type: "array", items: { type: "number" }, description: "Cash flow array, cashflows[0] is initial investment (negative)" },
        terminalValue: { type: "number", description: "Optional terminal value" },
        terminalYearIndex: { type: "number", description: "Year index for terminal value" }
      },
      required: ["rate", "cashflows"]
    }
  },
  {
    name: "calc_irr",
    description: "Calculate Internal Rate of Return (IRR) via deterministic bisection.",
    inputSchema: {
      type: "object",
      properties: {
        cashflows: { type: "array", items: { type: "number" }, description: "Cash flow array with initial negative investment" }
      },
      required: ["cashflows"]
    }
  },
  {
    name: "calc_depreciation",
    description: "Calculate fixed asset depreciation schedules per PSAK 16 (Straight Line, Double Declining, Sum of Years Digits).",
    inputSchema: {
      type: "object",
      properties: {
        cost: { type: "number", description: "Asset initial acquisition cost in IDR" },
        salvage: { type: "number", description: "Estimated salvage/residual value in IDR" },
        lifeYears: { type: "number", description: "Useful economic life in years" },
        method: { type: "string", default: "straight_line", description: "straight_line, double_declining, or sum_of_years" }
      },
      required: ["cost", "salvage", "lifeYears"]
    }
  },
  {
    name: "calc_loan_amortization",
    description: "Generate complete fixed-rate monthly loan amortization schedule and calculate total interest.",
    inputSchema: {
      type: "object",
      properties: {
        principal: { type: "number", description: "Loan principal amount in IDR" },
        annualRate: { type: "number", description: "Annual interest rate (e.g. 0.12 for 12%)" },
        months: { type: "number", description: "Loan duration in months" }
      },
      required: ["principal", "annualRate", "months"]
    }
  },
  {
    name: "calc_working_capital",
    description: "Compute Net Working Capital (NWC), Working Capital Ratio, and Cash Conversion Cycle (CCC).",
    inputSchema: {
      type: "object",
      properties: {
        currentAssets: { type: "number", description: "Current assets in IDR" },
        currentLiabilities: { type: "number", description: "Current liabilities in IDR" },
        daysInventory: { type: "number", description: "Days Inventory Outstanding (DIO)" },
        daysSalesOutstanding: { type: "number", description: "Days Sales Outstanding (DSO)" },
        daysPayables: { type: "number", description: "Days Payables Outstanding (DPO)" }
      },
      required: ["currentAssets", "currentLiabilities"]
    }
  },
  {
    name: "route_kbli_context",
    description: "Map 5-digit Indonesian KBLI 2020 codes to canonical Business Archetypes and operational profiles.",
    inputSchema: {
      type: "object",
      properties: {
        kbliCode: { type: "string", description: "5-digit KBLI code (e.g. 70209, 56101, 62010)" }
      },
      required: ["kbliCode"]
    }
  },
  {
    name: "classify_btki_commodity",
    description: "Resolve Indonesian BTKI 2022 commodity classification, import duties, PPN rate, PPh 22 import, and Lartas permits.",
    inputSchema: {
      type: "object",
      properties: {
        btkiCode: { type: "string", description: "8-digit BTKI code (e.g. 0901.21.10, 8471.30.20, 8517.13.00)" },
        cifValueIdr: { type: "number", default: 0, description: "CIF value in IDR" }
      },
      required: ["btkiCode"]
    }
  },
  {
    name: "calc_overtime",
    description: "Calculate statutory overtime pay using 1/173 hourly multiplier across workdays, weekly rest, and public holidays (PP 35/2021).",
    inputSchema: {
      type: "object",
      properties: {
        monthlyWage: { type: "number", description: "Monthly wage in IDR" },
        fixedAllowance: { type: "number", default: 0, description: "Monthly fixed allowance in IDR" },
        hours: { type: "number", description: "Overtime duration in hours" },
        dayType: { type: "string", default: "WORKDAY", description: "WORKDAY, WEEKLY_REST_5_DAYS, WEEKLY_REST_6_DAYS, PUBLIC_HOLIDAY" }
      },
      required: ["monthlyWage", "hours"]
    }
  },
  {
    name: "calc_uph",
    description: "Calculate statutory Uang Penggantian Hak (UPH) for unused annual leave upon termination (PP 35/2021 Pasal 40).",
    inputSchema: {
      type: "object",
      properties: {
        monthlyWage: { type: "number", description: "Monthly wage in IDR" },
        remainingLeaveDays: { type: "number", description: "Remaining unused paid annual leave days" },
        monthlyWorkingDays: { type: "number", default: 25, description: "Working days per month (standard: 25)" }
      },
      required: ["monthlyWage", "remainingLeaveDays"]
    }
  },
  {
    name: "calc_kmk_forex",
    description: "Convert foreign currency amount to IDR using official Ministry of Finance (KMK) tax exchange rate.",
    inputSchema: {
      type: "object",
      properties: {
        amountForeign: { type: "number", description: "Amount in foreign currency" },
        currency: { type: "string", default: "USD", description: "USD, SGD, EUR, JPY, AUD, CNY, GBP" },
        dateStr: { type: "string", description: "Effective transaction date" }
      },
      required: ["amountForeign", "currency"]
    }
  },
  {
    name: "calc_wacc",
    description: "Calculate Weighted Average Cost of Capital (WACC) with 22% Indonesian corporate tax shield.",
    inputSchema: {
      type: "object",
      properties: {
        equityValue: { type: "number", description: "Total equity value in IDR" },
        debtValue: { type: "number", description: "Total debt value in IDR" },
        costOfEquityPercent: { type: "number", description: "Cost of equity percentage (e.g. 15 for 15%)" },
        costOfDebtPreTaxPercent: { type: "number", description: "Pre-tax cost of debt percentage (e.g. 9 for 9%)" }
      },
      required: ["equityValue", "debtValue", "costOfEquityPercent", "costOfDebtPreTaxPercent"]
    }
  },
  {
    name: "calc_true_roas",
    description: "Calculate True Net ROAS & contribution margin accounting for COD return rate, marketplace fee, and shipping losses.",
    inputSchema: {
      type: "object",
      properties: {
        sellingPrice: { type: "number", description: "Selling price in IDR" },
        cogs: { type: "number", description: "Cost of Goods Sold in IDR" },
        platformFeePercent: { type: "number", default: 6.0, description: "Marketplace admin fee percentage" },
        freeShippingFeePercent: { type: "number", default: 4.0, description: "Free shipping extra fee percentage" },
        codReturnRatePercent: { type: "number", default: 0, description: "COD return rate percentage (e.g. 15 for 15%)" },
        adSpendPerDeliveredOrder: { type: "number", default: 0, description: "Ad spend per delivered order in IDR" }
      },
      required: ["sellingPrice", "cogs"]
    }
  },
  {
    name: "calc_landed_cost",
    description: "Calculate Customs CIF valuation, Bea Masuk, PPN 12%, and PPh 22 Impor (API vs Non-API).",
    inputSchema: {
      type: "object",
      properties: {
        fobValueUsd: { type: "number", description: "FOB value in USD" },
        freightUsd: { type: "number", default: 0, description: "Freight in USD" },
        insuranceUsd: { type: "number", default: 0, description: "Insurance in USD" },
        exchangeRateKmk: { type: "number", default: 16250, description: "KMK exchange rate" },
        dutyRatePercent: { type: "number", default: 0, description: "Import duty rate percentage" },
        hasApi: { type: "boolean", default: true, description: "Whether importer has API" }
      },
      required: ["fobValueUsd"]
    }
  },
  {
    name: "audit_contract_risk",
    description: "Audit commercial agreement text for legal risks, Article 1266 KUHPerdata waivers, liability caps, and excessive penalties.",
    inputSchema: {
      type: "object",
      properties: {
        contractText: { type: "string", description: "Contract agreement text to analyze" }
      },
      required: ["contractText"]
    }
  },
  {
    name: "audit_identity",
    description: "Validate and normalize Indonesian NIK (16-digit) and NPWP (15/16-digit Coretax standard).",
    inputSchema: {
      type: "object",
      properties: {
        identity: { type: "string", description: "15 or 16 digit NIK or NPWP string" }
      },
      required: ["identity"]
    }
  },
  {
    name: "audit_business_health",
    description: "Run 360-degree sovereign corporate health audit across tax, labor, legal, financial, and commercial pillars.",
    inputSchema: {
      type: "object",
      properties: {
        tax: { type: "object", description: "Tax compliance facts (hasAnnualSpt, isNpwpValid, etc.)" },
        hr: { type: "object", description: "HR facts (meetsMinimumWage, hasBpjsRegistration, etc.)" },
        legal: { type: "object", description: "Legal facts (hasNibOss, contractRiskScore, etc.)" },
        finance: { type: "object", description: "Financial facts (cashRunwayMonths, debtToEquityRatio, etc.)" },
        commerce: { type: "object", description: "Commerce facts (isContributionMarginPositive, etc.)" }
      }
    }
  },
  {
    name: "route_oss_rba",
    description: "Map 5-digit KBLI 2020 code to official OSS-RBA Risk Classification and PB-UMKU permits (PP 5/2021).",
    inputSchema: {
      type: "object",
      properties: {
        kbliCode: { type: "string", description: "5-digit KBLI code (e.g. 70209, 56101)" }
      },
      required: ["kbliCode"]
    }
  },
  {
    name: "calc_quantitative_swot",
    description: "Evaluate internal (IFE) and external (EFE) strategic position, strategic vector (ΔX, ΔY), posture quadrant, and TOWS cross-impact ranking.",
    inputSchema: {
      type: "object",
      properties: {
        internal: {
          type: "object",
          description: "Internal factors with strengths and weaknesses arrays (weight sum must equal 1.0, ratings 1.0-4.0)",
          properties: {
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  weight: { type: "number" },
                  rating: { type: "number" }
                },
                required: ["factor", "weight", "rating"]
              }
            },
            weaknesses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  weight: { type: "number" },
                  rating: { type: "number" }
                },
                required: ["factor", "weight", "rating"]
              }
            }
          },
          required: ["strengths", "weaknesses"]
        },
        external: {
          type: "object",
          description: "External factors with opportunities and threats arrays (weight sum must equal 1.0, ratings 1.0-4.0)",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  weight: { type: "number" },
                  rating: { type: "number" }
                },
                required: ["factor", "weight", "rating"]
              }
            },
            threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  weight: { type: "number" },
                  rating: { type: "number" }
                },
                required: ["factor", "weight", "rating"]
              }
            }
          },
          required: ["opportunities", "threats"]
        }
      },
      required: ["internal", "external"]
    }
  },
  {
    name: "calc_balanced_scorecard",
    description: "Evaluate Balanced Scorecard (BSC) multi-perspective performance with Min/Max polarity, statutory 120% cap ratio (KMK 467/2014), and strategy map causal broken link detection.",
    inputSchema: {
      type: "object",
      properties: {
        sector: { type: "string", enum: ["PRIVATE_COMMERCIAL", "PUBLIC_GOVERNMENT_BUMN"], default: "PRIVATE_COMMERCIAL" },
        capRatio: { type: "number", default: 120.0, description: "Cap ratio percent ceiling (default 120.0 per KMK 467/2014)" },
        perspectives: {
          type: "array",
          description: "Array of perspectives with weights (summing to 1.0) and KPIs",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              weight: { type: "number" },
              kpis: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    code: { type: "string" },
                    name: { type: "string" },
                    weight: { type: "number" },
                    target: { type: "number" },
                    actual: { type: "number" },
                    polarity: { type: "string", enum: ["MAXIMIZE", "MINIMIZE"], default: "MAXIMIZE" },
                    unit: { type: "string" }
                  },
                  required: ["code", "weight", "target", "actual"]
                }
              }
            },
            required: ["name", "weight", "kpis"]
          }
        }
      },
      required: ["perspectives"]
    }
  },
  {
    name: "calc_qspm",
    description: "Evaluate and rank alternative strategic options using Quantitative Strategic Planning Matrix (QSPM) Stage-3 decision analysis.",
    inputSchema: {
      type: "object",
      properties: {
        factors: { description: "Array of factors with weights (summing to 1.0) or { internal, external } object" },
        strategies: {
          type: "array",
          description: "Array of strategy alternatives with attractiveness scores (1-4, or 0/null)"
        }
      },
      required: ["factors", "strategies"]
    }
  },
  {
    name: "calc_rop_safety_stock",
    description: "Calculate Reorder Point (ROP) and stochastic Safety Stock with normal distribution Z-scores (80%-99.9%) across demand and lead-time variability.",
    inputSchema: {
      type: "object",
      properties: {
        averageDailyDemand: { type: "number", description: "Average units consumed/sold per day" },
        leadTimeDays: { type: "number", description: "Vendor lead time in days" },
        demandStdDev: { type: "number", default: 0, description: "Daily demand standard deviation" },
        leadTimeStdDev: { type: "number", default: 0, description: "Vendor lead time standard deviation" },
        serviceLevelPercent: { type: "number", default: 95.0, description: "Cycle service level percentage (e.g. 90, 95, 99)" },
        currentStock: { type: "number", description: "Current inventory on-hand" },
        unitCost: { type: "number", description: "Unit purchase cost in IDR" }
      },
      required: ["averageDailyDemand", "leadTimeDays"]
    }
  },
  {
    name: "calc_inventory_valuation",
    description: "Calculate inventory valuation under FIFO vs Moving Weighted Average per Article 10(6) UU PPh & PSAK 14, evaluating COGS and corporate tax impacts.",
    inputSchema: {
      type: "object",
      properties: {
        beginningInventory: {
          type: "object",
          description: "Beginning inventory { quantity, unitCost }"
        },
        transactions: {
          type: "array",
          description: "Array of inventory transactions: { type: 'PURCHASE'|'SALE', quantity, unitPrice }"
        },
        corporateTaxRate: { type: "number", default: 0.22, description: "Corporate tax rate (default 0.22)" }
      },
      required: ["transactions"]
    }
  },
  {
    name: "calc_ecl_provisioning",
    description: "Calculate trade receivables impairment under PSAK 71 Expected Credit Loss (ECL) aging schedule matrix and evaluate Article 9(1)(c) UU PPh fiscal adjustments.",
    inputSchema: {
      type: "object",
      properties: {
        agingSchedule: {
          type: "object",
          description: "Aging schedule balances: { days0To30, days31To60, days61To90, days91To180, over180Days }"
        },
        buckets: {
          type: "array",
          description: "Array of aging buckets with grossAmount and lossRatePercent"
        },
        existingAllowanceBalance: { type: "number", default: 0, description: "Current allowance on balance sheet in IDR" },
        macroAdjustmentFactor: { type: "number", default: 1.0, description: "Forward-looking macro stress factor" },
        isFinancialInstitution: { type: "boolean", default: false, description: "Whether entity is a financial institution under Pasal 9(1)(c) UU PPh" }
      }
    }
  }
];

function handleToolCall(name, args) {
  switch (name) {
    case "calc_pph21_monthly": {
      const fn = engines.pph21().calculatePPh21Monthly;
      return fn(args.grossSalary, args.ptkpStatus, args.hasNpwp !== false, args.dateStr);
    }
    case "calc_pph21_december_recon": {
      const fn = engines.pph21().calculatePPh21DecemberReconciliation;
      return fn(
        args.annualGrossIncome,
        args.ptkpStatus,
        args.janToNovTaxWithheld,
        args.monthlyJhtEmployeeDeduction || 0,
        args.hasNpwp !== false,
        args.dateStr
      );
    }
    case "calc_pph_badan": {
      const fn = engines.pphBadan().calculateCorporateTax;
      return fn(args);
    }
    case "calc_pph23_26": {
      const fn = engines.pph23().calculatePPh23And26;
      return fn(args.grossAmount, args.transactionType, args.hasNpwp !== false, args.hasDgtForm, args.taxTreatyRatePercent);
    }
    case "calc_phk_severance": {
      const fn = engines.phk().calculatePhk;
      return fn(
        args.monthlyWage,
        args.tenureYears,
        args.reasonKey,
        args.remainingLeaveDays || 0,
        args.uangPisahAmount || 0
      );
    }
    case "calc_pkwt_compensation": {
      const fn = engines.pkwtComp().calculatePkwtCompensation;
      return fn(args.monthlyWage, args.tenureMonths);
    }
    case "calc_thr_payout": {
      const fn = engines.thr().calculateThr;
      return fn(args.monthlyBaseSalary, args.fixedAllowance || 0, args.tenureMonths);
    }
    case "calc_bpjs_contributions": {
      const fn = engines.bpjs().calculateBpjs;
      return fn(args.monthlySalary, args.riskLevel || 'low', args.dateStr);
    }
    case "calc_umkm_final_tax": {
      const fn = engines.umkm().calculateUmkmFinalTax;
      return fn(args.monthlyTurnover, args.cumulativePreviousTurnover || 0, args.taxpayerType || 'INDIVIDUAL', args.dateStr);
    }
    case "calc_ppn_ppnbm": {
      const fn = engines.ppn().calculatePpnAndPpnbm;
      return fn(args);
    }
    case "calc_marketplace_fee": {
      const fn = engines.marketplace().calculateMarketplaceFee;
      return fn(args.sellingPrice, args.platform, args.sellerTier, args.freeShippingExtra !== false, args.adSpendBudget || 0);
    }
    case "audit_pkwtt_compliance": {
      const fn = engines.pkwtt().auditPkwttStatus;
      return fn(args);
    }
    case "analyze_break_even": {
      const be = engines.breakeven();
      const units = be.breakEvenUnits(args.fixedCosts, args.pricePerUnit, args.variableCostPerUnit);
      const rev = be.breakEvenRevenue(args.fixedCosts, args.pricePerUnit, args.variableCostPerUnit);
      const cm = be.contributionMargin(args.pricePerUnit, args.variableCostPerUnit);
      const cmRatio = be.contributionMarginRatio(args.pricePerUnit, args.variableCostPerUnit);
      const mos = args.actualRevenue !== undefined ? be.marginOfSafety(args.actualRevenue, rev) : null;
      return {
        breakEvenUnits: units,
        breakEvenRevenue: rev,
        contributionMargin: cm,
        contributionMarginRatio: cmRatio,
        marginOfSafety: mos
      };
    }
    case "calc_npv": {
      const { npv, npvWithTerminalValue } = engines.npv();
      if (args.terminalValue !== undefined) {
        return { npv: npvWithTerminalValue(args.rate, args.cashflows, args.terminalValue, args.terminalYearIndex || (args.cashflows.length - 1)) };
      }
      return { npv: npv(args.rate, args.cashflows) };
    }
    case "calc_irr": {
      return engines.irr().irr(args.cashflows);
    }
    case "calc_depreciation": {
      const dep = engines.depreciation();
      const method = (args.method || 'straight_line').toLowerCase();
      if (method === 'double_declining' || method === 'ddb') {
        return dep.doubleDeclining(args.cost, args.salvage, args.lifeYears);
      } else if (method === 'sum_of_years' || method === 'syd') {
        return dep.sumOfYearsDigits(args.cost, args.salvage, args.lifeYears);
      }
      return dep.straightLine(args.cost, args.salvage, args.lifeYears);
    }
    case "calc_loan_amortization": {
      return engines.loan().amortizationSchedule(args.principal, args.annualRate, args.months);
    }
    case "calc_working_capital": {
      const wc = engines.workingCapital();
      const nwc = wc.netWorkingCapital(args.currentAssets, args.currentLiabilities);
      const ratio = wc.workingCapitalRatio(args.currentAssets, args.currentLiabilities);
      let ccc = null;
      if (args.daysInventory !== undefined && args.daysSalesOutstanding !== undefined && args.daysPayables !== undefined) {
        ccc = wc.cashConversionCycle(args.daysInventory, args.daysSalesOutstanding, args.daysPayables);
      }
      return { netWorkingCapital: nwc, workingCapitalRatio: ratio, cashConversionCycle: ccc };
    }
    case "route_kbli_context": {
      const fn = engines.kbli().resolveBusinessArchetype;
      return fn(args);
    }
    case "classify_btki_commodity": {
      const fn = engines.productContext().resolveProductClassification;
      return fn({ targetHsCode: args.btkiCode, cifValueIdr: args.cifValueIdr || 0 });
    }
    case "calc_overtime": {
      const fn = engines.overtime().calculateDailyOvertime;
      return fn({
        monthlyWage: args.monthlyWage,
        fixedAllowance: args.fixedAllowance || 0,
        hours: args.hours,
        dayType: args.dayType || 'WORKDAY'
      });
    }
    case "calc_uph": {
      const fn = engines.uph().calculateUphPayout;
      return fn({
        monthlyWage: args.monthlyWage,
        remainingLeaveDays: args.remainingLeaveDays,
        monthlyWorkingDays: args.monthlyWorkingDays || 25
      });
    }
    case "calc_kmk_forex": {
      const fn = engines.kmkForex().calculateKmkForexConversion;
      return fn({
        amountForeign: args.amountForeign,
        currency: args.currency || 'USD',
        dateStr: args.dateStr || null
      });
    }
    case "calc_wacc": {
      const fn = engines.wacc().calculateWacc;
      return fn(args);
    }
    case "calc_true_roas": {
      const fn = engines.roas().calculateTrueNetRoas;
      return fn(args);
    }
    case "calc_landed_cost": {
      const fn = engines.landedCost().calculateLandedCost;
      return fn(args);
    }
    case "audit_contract_risk": {
      const fn = engines.contractRisk().auditContractRisk;
      return fn(args.contractText);
    }
    case "audit_identity": {
      const fn = engines.identityValidator().normalizeTaxIdentity;
      return fn(args.identity);
    }
    case "audit_business_health": {
      const fn = engines.businessHealth().auditBusinessHealth;
      return fn(args);
    }
    case "route_oss_rba": {
      const fn = engines.ossRba().resolveOssRisk;
      return fn(args.kbliCode);
    }
    case "calc_quantitative_swot": {
      const fn = engines.quantitativeSwot().evaluateQuantitativeSwot;
      return fn(args);
    }
    case "calc_balanced_scorecard": {
      const fn = engines.balancedScorecard().evaluateBalancedScorecard;
      return fn(args);
    }
    case "calc_qspm": {
      const fn = engines.qspm().evaluateQspm;
      return fn(args);
    }
    case "calc_rop_safety_stock": {
      const fn = engines.rop().calculateRopAndSafetyStock;
      return fn(args);
    }
    case "calc_inventory_valuation": {
      const fn = engines.inventoryValuation().calculateInventoryValuation;
      return fn(args);
    }
    case "calc_ecl_provisioning": {
      const fn = engines.eclProvision().calculateEclProvisioning;
      return fn(args);
    }
    default:
      throw new Error(`Unknown tool '${name}'`);
  }
}

function sendResponse(id, result, error = null) {
  const response = { jsonrpc: "2.0", id };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request;
  try {
    request = JSON.parse(trimmed);
  } catch (err) {
    sendResponse(null, null, { code: -32700, message: "Parse error: invalid JSON" });
    return;
  }

  const { id, method, params } = request;

  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "indonesia-business-agent-skills",
        version: pkg.version
      }
    });
  } else if (method === 'notifications/initialized') {
    // Acknowledge notification
  } else if (method === 'ping') {
    sendResponse(id, {});
  } else if (method === 'tools/list') {
    sendResponse(id, { tools: TOOLS });
  } else if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    try {
      const data = handleToolCall(name, args || {});
      sendResponse(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      });
    } catch (err) {
      sendResponse(id, {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: err.message, status: "ERROR" }, null, 2)
          }
        ]
      });
    }
  } else {
    if (id !== undefined && id !== null) {
      sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
    }
  }
});
