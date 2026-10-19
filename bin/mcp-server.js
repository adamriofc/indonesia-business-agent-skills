#!/usr/bin/env node
/**
 * Native Zero-Dependency MCP Server for Indonesian Business Agent Skills
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
  productContext: () => require(path.join(ENGINES, 'product-context'))
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
        btkiCode: { type: "string", description: "8-digit BTKI code (e.g. 0901.21.10, 8471.30.20, 8517.13.00)" }
      },
      required: ["btkiCode"]
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
      return fn(args.btkiCode);
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
        name: "indonesian-business-agent-skills",
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
