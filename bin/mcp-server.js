#!/usr/bin/env node
/**
 * Native Zero-Dependency MCP Server for Indonesian Business Agent Skills
 * Exposes deterministic engines as Model Context Protocol (MCP) tools over stdio.
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
  marketplace: () => require(path.join(ENGINES, 'marketplace-fee-calculator'))
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
    name: "route_kbli_context",
    description: "Map 5-digit Indonesian KBLI 2020 codes to canonical Business Archetypes and operational profiles.",
    inputSchema: {
      type: "object",
      properties: {
        kbliCode: { type: "string", description: "5-digit KBLI code (e.g. 70209, 56101, 62010)" }
      },
      required: ["kbliCode"]
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
    case "route_kbli_context": {
      const fn = engines.kbli().resolveBusinessArchetype;
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
