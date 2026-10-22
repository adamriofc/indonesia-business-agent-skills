#!/usr/bin/env node
/**
 * Universal CLI Runner — Indonesia Business Agent Skills
 * Pure Node.js, zero external dependencies, agnostic, lightweight & agent-friendly.
 * Full coverage across all 40 calculation and regulatory diff engines.
 */

const path = require('path');
const pkg = require('../package.json');

const ROOT = path.join(__dirname, '..');
const ENGINES = path.join(ROOT, 'engines');

function parseArgs(args) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        flags[k] = v;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        flags[key] = args[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function parseArrayArg(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const str = String(val).trim();
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      return JSON.parse(str);
    } catch {
      return str.slice(1, -1).split(',').map(s => Number(s.trim()));
    }
  }
  return str.split(',').map(s => Number(s.trim()));
}

function printHelp() {
  const helpText = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    commands: {
      "calc pph21": "Calculate PPh 21 TER tax (--salary <IDR>, --ptkp <TK/0..K/3>, [--has-npwp <bool>], [--date <YYYY-MM-DD>])",
      "calc pph21-december": "PPh 21 December annual reconciliation (--annual-gross <IDR>, --ptkp <TK/0..K/3>, --withheld <IDR>, [--jht <IDR>])",
      "calc pph21-grossup": "PPh 21 gross-up iterative allowance calculation (--take-home <IDR>, --ptkp <TK/0..K/3>)",
      "calc pph-badan": "Corporate income tax 22% & Article 31E facility (--turnover <IDR>, --profit <IDR>, [--pos-adj <IDR>], [--neg-adj <IDR>], [--loss-carry <IDR>])",
      "calc pph23": "PPh 23/26 withholding tax (--amount <IDR>, [--type <service|royalty|dividend|offshore>], [--has-npwp <bool>], [--has-dgt <bool>])",
      "calc phk": "Calculate statutory PHK severance (--wage <IDR>, --tenure <years>, --reason <code|alias>, [--leave-days <days>], [--uang-pisah <IDR>])",
      "calc pkwt": "Calculate PKWT contract compensation pay (--wage <IDR>, --tenure <months>)",
      "calc thr": "Calculate statutory THR payout (--wage <IDR>, [--allowance <IDR>], --tenure <months>)",
      "calc bpjs": "Calculate BPJS Ketenagakerjaan & Kesehatan (--salary <IDR>, [--risk <low|medium|high>], [--date <YYYY-MM-DD>])",
      "calc umkm": "Calculate UMKM 0.5% final tax (--turnover <IDR>, [--cumulative <IDR>], [--entity <individual|corporate>])",
      "calc ppn": "Calculate PPN 12%, Besaran Tertentu & PPnBM (--price <IDR>, [--type <standard|dpp_nilai_lain|besaran_tertentu|import>])",
      "calc marketplace": "Calculate marketplace net seller payout & fee (--price <IDR>, [--platform <shopee|tokopedia|tiktok_shop>], [--tier <star|mall|standard>])",
      "calc breakeven": "Analyze break-even point (--fixed <IDR>, --price <IDR>, --variable <IDR>, [--revenue <IDR>])",
      "calc npv": "Calculate Net Present Value (--rate <0.10>, --cashflows <[-100, 30, 40, 50]>, [--terminal-value <IDR>], [--terminal-year <N>])",
      "calc irr": "Calculate Internal Rate of Return (--cashflows <[-100, 30, 40, 50]>)",
      "calc depreciation": "Calculate asset depreciation (--cost <IDR>, --salvage <IDR>, --life <years>, [--method <sl|ddb|syd>])",
      "calc loan": "Calculate monthly loan amortization schedule (--principal <IDR>, --rate <annualRate>, --months <N>)",
      "calc ratios": "Calculate 14 financial ratios (--current-assets <IDR>, --current-liabilities <IDR>, [--cogs <IDR>], [--revenue <IDR>], etc.)",
      "calc working-capital": "Calculate Net Working Capital & CCC (--current-assets <IDR>, --current-liabilities <IDR>, [--cogs-per-day <IDR>], [--cycle-days <N>])",
      "calc market-sizing": "Calculate TAM, SAM, SOM (--total-population <N>, --target-percentage <rate>, --annual-spend <IDR>)",
      "calc unit-economics": "Calculate marketing LTV, CAC & LTV:CAC (--arppu <IDR>, --churn-rate <rate>, --cac <IDR>)",
      "audit pkwtt": "Audit PKWTT/PKWT contract compliance (--wage <IDR>, --probation <months>, --contract <pkwt|pkwtt>, [--tenure <months>])",
      "audit thincap": "Audit Thin Capitalization DER 4:1 & secondary dividend (--debt <IDR>, --equity <IDR>, [--interest <IDR>])",
      "audit compliance": "Audit multi-domain statutory compliance risk (--spt <bool>, --ump <bool>)",
      "audit regulatory-impact": "Analyze business impact of statutory transition (--domain <umkm|bpjs|phk>, --from <ruleset>, --to <ruleset>, --revenue <IDR>)",
      "diff regulatory": "Compare statutory rulesets side-by-side (--domain <umkm|bpjs>, --from <ruleset>, --to <ruleset>)",
      "calc overtime": "Calculate statutory overtime pay (--wage <IDR>, --hours <N>, [--day-type <WORKDAY|WEEKLY_REST_5_DAYS|WEEKLY_REST_6_DAYS|PUBLIC_HOLIDAY>])",
      "calc uph": "Calculate Uang Penggantian Hak & unused leave (--wage <IDR>, --leave-days <N>, [--working-days <25>])",
      "calc kmk-forex": "Convert foreign currency to IDR via official KMK tax rate (--amount <N>, --currency <USD|SGD|EUR|JPY>, [--date <YYYY-MM-DD>])",
      "calc offshore-withholding": "Calculate PPh 26 & PPN JLN on forex invoices (--amount <N>, --currency <USD>, [--has-dgt <bool>])",
      "calc wacc": "Calculate WACC with 22% Corporate Tax Shield (--equity <IDR>, --debt <IDR>, --cost-equity <%>, --cost-debt <%>, [--tax-rate <%>])",
      "calc true-roas": "Calculate True Net ROAS & COD return economics (--price <IDR>, --cogs <IDR>, [--return-rate <%>], [--ad-spend <IDR>])",
      "calc landed-cost": "Calculate Customs CIF, Bea Masuk, PPN 12% & PPh 22 Impor (--fob <USD>, [--freight <USD>], [--duty <%>], [--has-api <bool>])",
      "calc swot": "Quantitative SWOT/TOWS Matrix calculation (--file <swot.json> or --data <json>)",
      "calc bsc": "Balanced Scorecard evaluation & strategy map audit (--file <bsc.json> or --data <json>, [--sector <private|public>], [--cap <%>])",
      "calc qspm": "Quantitative Strategic Planning Matrix (--file <qspm.json> or --data <json>)",
      "calc rop": "Calculate Reorder Point & Safety Stock (--daily <N>, --lead <days>, [--daily-std <N>], [--lead-std <N>], [--service <95>], [--stock <N>], [--cost <IDR>])",
      "calc inventory": "Calculate FIFO vs Average inventory valuation & tax impact (--file <stockcard.json> or --data <json>)",
      "calc ecl": "Calculate PSAK 71 Expected Credit Loss AR impairment (--file <aging.json> or --data <json>)",
      "audit contract-risk": "Audit contract risk score 0-100 & clause traps (--text <string> or --file <path>)",
      "audit identity": "Validate and normalize NIK/NPWP 16-digit identity (--id <string>)",
      "audit statement-linkage": "Verify 3-statement balance & retained earnings sanity (--file <financials.json>)",
      "audit business-health": "Run 360-degree sovereign corporate health audit (--file <profile.json>)",
      "audit strategy-stress-test": "Simulate Five Forces competitive strategic shocks (--file <stress-params.json>)",
      "route oss-rba": "Resolve 5-digit KBLI code to OSS-RBA Risk Classification & PB-UMKU (--code <5-digit KBLI>)",
      "ledger record": "Append compliance action to local Merkle audit chain (--domain <string>, --action <string>, --statute <string>, [--data <json>])",
      "ledger verify": "Cryptographically verify compliance Merkle chain integrity",
      "route kbli": "Resolve 5-digit KBLI code to business archetype (--code <5-digit KBLI>)",
      "route btki": "Resolve BTKI commodity classification & import duty (--code <BTKI code>)",
      "serve": "Start zero-dependency REST API server ([--port <3000>], [--host <0.0.0.0>])",
      "mcp": "Start native stdio MCP server for direct AI agent integration",
      "version": "Display current engine version"
    }
  };
  console.log(JSON.stringify(helpText, null, 2));
}

function run() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help') || args[0] === 'help') {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version') || args[0] === 'version') {
    console.log(JSON.stringify({ version: pkg.version }));
    process.exit(0);
  }

  const { positional, flags } = parseArgs(args);
  const action = positional[0]?.toLowerCase();
  const subAction = positional[1]?.toLowerCase();

  if (action === 'mcp') {
    require('./mcp-server');
    return;
  }

  if (action === 'serve' || action === 'server' || action === 'rest') {
    require('./server');
    return;
  }

  try {
    let result = null;

    if (action === 'calc') {
      if (subAction === 'pph21') {
        const { calculatePPh21Monthly } = require(path.join(ENGINES, 'pph21-calculator'));
        const salary = Number(flags.salary || flags.wage || flags.gross || 0);
        const ptkp = String(flags.ptkp || 'TK/0').toUpperCase();
        const hasNpwp = flags['has-npwp'] !== undefined ? flags['has-npwp'] !== 'false' && flags['has-npwp'] !== false : true;
        const dateStr = flags.date || null;
        result = calculatePPh21Monthly(salary, ptkp, hasNpwp, dateStr);
      } else if (subAction === 'pph21-december' || subAction === 'pph21-dec') {
        const { calculatePPh21DecemberReconciliation } = require(path.join(ENGINES, 'pph21-calculator'));
        const annualGross = Number(flags['annual-gross'] || flags.salary || 0);
        const ptkp = String(flags.ptkp || 'TK/0').toUpperCase();
        const withheld = Number(flags.withheld || flags['jan-nov-withheld'] || 0);
        const jht = Number(flags.jht || flags['monthly-jht'] || 0);
        const hasNpwp = flags['has-npwp'] !== undefined ? flags['has-npwp'] !== 'false' : true;
        const dateStr = flags.date || null;
        result = calculatePPh21DecemberReconciliation(annualGross, ptkp, withheld, jht, hasNpwp, dateStr);
      } else if (subAction === 'pph21-grossup') {
        const { calculatePPh21GrossUp } = require(path.join(ENGINES, 'pph21-grossup-calculator'));
        const targetTakeHome = Number(flags['take-home'] || flags.target || flags.salary || 0);
        const ptkp = String(flags.ptkp || 'TK/0').toUpperCase();
        result = calculatePPh21GrossUp(targetTakeHome, ptkp);
      } else if (subAction === 'pph-badan' || subAction === 'corporate-tax') {
        const { calculateCorporateTax } = require(path.join(ENGINES, 'pph-badan-calculator'));
        result = calculateCorporateTax({
          grossTurnover: Number(flags.turnover || flags.revenue || 0),
          commercialNetProfit: Number(flags.profit || flags.net || 0),
          positiveFiscalAdjustments: Number(flags['pos-adj'] || 0),
          negativeFiscalAdjustments: Number(flags['neg-adj'] || 0),
          priorYearFiscalLossCarryForward: Number(flags['loss-carry'] || 0),
          taxYear: Number(flags.year || 2026)
        });
      } else if (subAction === 'pph23' || subAction === 'pph26') {
        const { calculatePPh23And26 } = require(path.join(ENGINES, 'pph23-26-calculator'));
        const amount = Number(flags.amount || flags.gross || 0);
        const type = flags.type || (subAction === 'pph26' ? 'offshore_service' : 'service');
        const hasNpwp = flags['has-npwp'] !== undefined ? flags['has-npwp'] !== 'false' : true;
        const hasDgt = flags['has-dgt'] !== undefined ? flags['has-dgt'] !== 'false' : false;
        const treatyRate = flags['treaty-rate'] ? Number(flags['treaty-rate']) : null;
        result = calculatePPh23And26(amount, type, hasNpwp, hasDgt, treatyRate);
      } else if (subAction === 'phk') {
        const { calculatePhk } = require(path.join(ENGINES, 'phk-calculator'));
        const wage = Number(flags.wage || flags.salary || 0);
        const tenure = Number(flags.tenure || flags.years || 0);
        const reason = flags.reason || 'efficiency_loss';
        const leaveDays = Number(flags['leave-days'] || flags.leave || 0);
        const uangPisah = Number(flags['uang-pisah'] || 0);
        result = calculatePhk(wage, tenure, reason, leaveDays, uangPisah);
      } else if (subAction === 'pkwt') {
        const { calculatePkwtCompensation } = require(path.join(ENGINES, 'pkwt-compensation-calculator'));
        const wage = Number(flags.wage || flags.salary || 0);
        const tenure = Number(flags.tenure || flags.months || 0);
        result = calculatePkwtCompensation(wage, tenure);
      } else if (subAction === 'thr') {
        const { calculateThr } = require(path.join(ENGINES, 'thr-calculator'));
        const wage = Number(flags.wage || flags.salary || 0);
        const allowance = Number(flags.allowance || 0);
        const tenure = Number(flags.tenure || flags.months || 12);
        result = calculateThr(wage, allowance, tenure);
      } else if (subAction === 'bpjs') {
        const { calculateBpjs } = require(path.join(ENGINES, 'bpjs-calculator'));
        const salary = Number(flags.salary || flags.wage || 0);
        const risk = flags.risk || 'low';
        const dateStr = flags.date || null;
        result = calculateBpjs(salary, risk, dateStr);
      } else if (subAction === 'umkm') {
        const { calculateUmkmFinalTax } = require(path.join(ENGINES, 'umkm-tax-calculator'));
        const turnover = Number(flags.turnover || flags.revenue || 0);
        const cumulative = Number(flags.cumulative || flags.previous || 0);
        const entity = String(flags.entity || 'INDIVIDUAL').toUpperCase();
        const dateStr = flags.date || null;
        result = calculateUmkmFinalTax(turnover, cumulative, entity, dateStr);
      } else if (subAction === 'ppn') {
        const { calculatePpnAndPpnbm } = require(path.join(ENGINES, 'ppn-ppnbm-calculator'));
        const price = Number(flags.price || flags.dpp || 0);
        const type = flags.type || 'standard';
        const ppnbm = Number(flags.ppnbm || 0);
        const inputTax = Number(flags['input-tax'] || 0);
        result = calculatePpnAndPpnbm({
          sellingPriceOrDpp: price,
          transactionType: type,
          ppnbmRatePercent: ppnbm,
          inputTaxCreditsAlreadyPaid: inputTax
        });
      } else if (subAction === 'marketplace' || subAction === 'margin') {
        const { calculateMarketplaceFee } = require(path.join(ENGINES, 'marketplace-fee-calculator'));
        const price = Number(flags.price || flags.selling || 0);
        const plat = flags.platform || 'shopee';
        const tier = flags.tier || 'star';
        const freeShipping = flags['free-shipping'] !== 'false';
        const adSpend = Number(flags['ad-spend'] || flags.ads || 0);
        result = calculateMarketplaceFee(price, plat, tier, freeShipping, adSpend);
      } else if (subAction === 'breakeven' || subAction === 'be') {
        const be = require(path.join(ENGINES, 'break-even'));
        const fixed = Number(flags.fixed || 0);
        const price = Number(flags.price || 0);
        const variable = Number(flags.variable || 0);
        const revenue = flags.revenue ? Number(flags.revenue) : null;
        const units = be.breakEvenUnits(fixed, price, variable);
        const beRev = be.breakEvenRevenue(fixed, price, variable);
        const cm = be.contributionMargin(price, variable);
        const cmRatio = be.contributionMarginRatio(price, variable);
        const mos = revenue !== null ? be.marginOfSafety(revenue, beRev) : null;
        result = {
          breakEvenUnits: units,
          breakEvenRevenue: beRev,
          contributionMargin: cm,
          contributionMarginRatio: cmRatio,
          marginOfSafety: mos
        };
      } else if (subAction === 'npv') {
        const { npv, npvWithTerminalValue } = require(path.join(ENGINES, 'npv'));
        const rate = Number(flags.rate || 0.10);
        const cashflows = parseArrayArg(flags.cashflows || flags.flows);
        if (flags['terminal-value']) {
          const tv = Number(flags['terminal-value']);
          const tIdx = Number(flags['terminal-year'] || cashflows.length - 1);
          result = { npv: npvWithTerminalValue(rate, cashflows, tv, tIdx) };
        } else {
          result = { npv: npv(rate, cashflows) };
        }
      } else if (subAction === 'irr') {
        const { irr } = require(path.join(ENGINES, 'irr'));
        const cashflows = parseArrayArg(flags.cashflows || flags.flows);
        result = irr(cashflows);
      } else if (subAction === 'depreciation') {
        const dep = require(path.join(ENGINES, 'depreciation'));
        const cost = Number(flags.cost || 0);
        const salvage = Number(flags.salvage || 0);
        const life = Number(flags.life || flags.years || 1);
        const method = (flags.method || 'sl').toLowerCase();
        if (method === 'ddb' || method === 'double_declining') {
          result = dep.doubleDeclining(cost, salvage, life);
        } else if (method === 'syd' || method === 'sum_of_years') {
          result = dep.sumOfYearsDigits(cost, salvage, life);
        } else {
          result = dep.straightLine(cost, salvage, life);
        }
      } else if (subAction === 'loan') {
        const loan = require(path.join(ENGINES, 'loan-amortization'));
        const principal = Number(flags.principal || 0);
        const rate = Number(flags.rate || 0);
        const months = Number(flags.months || 12);
        result = loan.amortizationSchedule(principal, rate, months);
      } else if (subAction === 'working-capital' || subAction === 'wc') {
        const wc = require(path.join(ENGINES, 'working-capital'));
        const ca = Number(flags['current-assets'] || flags.assets || 0);
        const cl = Number(flags['current-liabilities'] || flags.liabilities || 0);
        const nwc = wc.netWorkingCapital(ca, cl);
        const ratio = cl > 0 ? wc.workingCapitalRatio(ca, cl) : null;
        let ccc = null;
        if (flags['days-inventory'] && flags['days-sales'] && flags['days-payables']) {
          ccc = wc.cashConversionCycle(flags['days-inventory'], flags['days-sales'], flags['days-payables']);
        }
        result = { netWorkingCapital: nwc, workingCapitalRatio: ratio, cashConversionCycle: ccc };
      } else if (subAction === 'market-sizing') {
        const { calculateMarketSizing } = require(path.join(ENGINES, 'market-sizing-engine'));
        result = calculateMarketSizing({
          totalPopulation: Number(flags['total-population'] || flags.population || 0),
          targetPercentage: Number(flags['target-percentage'] || flags.target || 0.20),
          annualSpendPerUser: Number(flags['annual-spend'] || flags.spend || 0)
        });
      } else if (subAction === 'unit-economics') {
        const { calculateMarketingUnitEconomics } = require(path.join(ENGINES, 'marketing-unit-economics'));
        result = calculateMarketingUnitEconomics({
          arppu: Number(flags.arppu || 0),
          churnRate: Number(flags['churn-rate'] || flags.churn || 0.05),
          cac: Number(flags.cac || 0)
        });
      } else if (subAction === 'overtime') {
        const { calculateDailyOvertime } = require(path.join(ENGINES, 'overtime-calculator'));
        result = calculateDailyOvertime({
          monthlyWage: Number(flags.wage || flags.salary || 0),
          fixedAllowance: Number(flags.allowance || 0),
          hours: Number(flags.hours || 1),
          dayType: flags['day-type'] || flags.type || 'WORKDAY'
        });
      } else if (subAction === 'uph') {
        const { calculateUphPayout } = require(path.join(ENGINES, 'uph-calculator'));
        result = calculateUphPayout({
          monthlyWage: Number(flags.wage || flags.salary || 0),
          remainingLeaveDays: Number(flags['leave-days'] || flags.leave || 0),
          monthlyWorkingDays: Number(flags['working-days'] || 25),
          relocationExpense: Number(flags.relocation || 0)
        });
      } else if (subAction === 'kmk-forex') {
        const { calculateKmkForexConversion } = require(path.join(ENGINES, 'kmk-forex-calculator'));
        result = calculateKmkForexConversion({
          amountForeign: Number(flags.amount || 0),
          currency: flags.currency || 'USD',
          dateStr: flags.date || null
        });
      } else if (subAction === 'offshore-withholding') {
        const { calculateOffshoreWithholding } = require(path.join(ENGINES, 'kmk-forex-calculator'));
        result = calculateOffshoreWithholding({
          amountForeign: Number(flags.amount || 0),
          currency: flags.currency || 'USD',
          dateStr: flags.date || null,
          hasDgtForm: flags['has-dgt'] !== undefined ? flags['has-dgt'] !== 'false' : false,
          treatyRatePercent: flags['treaty-rate'] ? Number(flags['treaty-rate']) : null
        });
      } else if (subAction === 'wacc') {
        const { calculateWacc } = require(path.join(ENGINES, 'wacc-calculator'));
        result = calculateWacc({
          equityValue: Number(flags.equity || 0),
          debtValue: Number(flags.debt || 0),
          costOfEquityPercent: Number(flags['cost-equity'] || 15),
          costOfDebtPreTaxPercent: Number(flags['cost-debt'] || 9),
          corporateTaxRatePercent: Number(flags['tax-rate'] !== undefined ? flags['tax-rate'] : 22)
        });
      } else if (subAction === 'true-roas') {
        const { calculateTrueNetRoas } = require(path.join(ENGINES, 'roas-contribution-engine'));
        result = calculateTrueNetRoas({
          sellingPrice: Number(flags.price || flags.selling || 0),
          cogs: Number(flags.cogs || 0),
          platformFeePercent: Number(flags['platform-fee'] || 6.0),
          freeShippingFeePercent: Number(flags['free-shipping-fee'] || 4.0),
          codReturnRatePercent: Number(flags['return-rate'] || flags.cod || 0),
          adSpendPerDeliveredOrder: Number(flags['ad-spend'] || flags.ads || 0),
          shippingSubsidyPerAttempt: Number(flags.subsidy || 0)
        });
      } else if (subAction === 'landed-cost') {
        const { calculateLandedCost } = require(path.join(ENGINES, 'landed-cost-calculator'));
        result = calculateLandedCost({
          fobValueUsd: Number(flags.fob || 0),
          freightUsd: Number(flags.freight || 0),
          insuranceUsd: Number(flags.insurance || 0),
          exchangeRateKmk: Number(flags.rate || flags.kmk || 16250),
          dutyRatePercent: Number(flags.duty || 0),
          hasApi: flags['has-api'] !== 'false',
          hasNpwp: flags['has-npwp'] !== 'false',
          unitsCount: Number(flags.units || 1)
        });
      } else if (subAction === 'swot' || subAction === 'quantitative-swot') {
        const { evaluateQuantitativeSwot } = require(path.join(ENGINES, 'quantitative-swot-engine'));
        let inputData = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          inputData = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        } else if (flags.data) {
          inputData = typeof flags.data === 'string' ? JSON.parse(flags.data) : flags.data;
        } else {
          inputData = {
            internal: {
              strengths: [{ factor: "Inovasi Produk", weight: 0.6, rating: 4 }],
              weaknesses: [{ factor: "Biaya Operasional", weight: 0.4, rating: 2 }]
            },
            external: {
              opportunities: [{ factor: "Ekspansi Pasar", weight: 0.6, rating: 4 }],
              threats: [{ factor: "Kompetitor Baru", weight: 0.4, rating: 2 }]
            }
          };
        }
        result = evaluateQuantitativeSwot(inputData);
      } else if (subAction === 'bsc' || subAction === 'balanced-scorecard') {
        const { evaluateBalancedScorecard } = require(path.join(ENGINES, 'balanced-scorecard-engine'));
        let inputData = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          inputData = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        } else if (flags.data) {
          inputData = typeof flags.data === 'string' ? JSON.parse(flags.data) : flags.data;
        } else {
          inputData = {
            sector: flags.sector === 'public' ? 'PUBLIC_GOVERNMENT_BUMN' : 'PRIVATE_COMMERCIAL',
            capRatio: flags.cap ? Number(flags.cap) : 120.0,
            perspectives: [
              {
                id: "financial",
                name: "Finansial",
                weight: 0.5,
                kpis: [{ code: "FIN-01", name: "Revenue Growth", weight: 1.0, target: 100, actual: 110, polarity: "MAXIMIZE" }]
              },
              {
                id: "customer",
                name: "Customer",
                weight: 0.5,
                kpis: [{ code: "CUST-01", name: "CSAT", weight: 1.0, target: 80, actual: 85, polarity: "MAXIMIZE" }]
              }
            ]
          };
        }
        result = evaluateBalancedScorecard(inputData);
      } else if (subAction === 'qspm') {
        const { evaluateQspm } = require(path.join(ENGINES, 'qspm-engine'));
        let inputData = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          inputData = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        } else if (flags.data) {
          inputData = typeof flags.data === 'string' ? JSON.parse(flags.data) : flags.data;
        } else {
          inputData = {
            factors: [
              { factor: "Keahlian AI Deterministik", weight: 0.5 },
              { factor: "Permintaan Kepatuhan Regulasi", weight: 0.5 }
            ],
            strategies: [
              { id: "s1", name: "B2B Enterprise", scores: [4, 4] },
              { id: "s2", name: "D2C Retail", scores: [2, 2] }
            ]
          };
        }
        result = evaluateQspm(inputData);
      } else if (subAction === 'rop' || subAction === 'safety-stock') {
        const { calculateRopAndSafetyStock } = require(path.join(ENGINES, 'rop-safety-stock-engine'));
        result = calculateRopAndSafetyStock({
          averageDailyDemand: Number(flags.daily || flags['daily-demand'] || 50),
          leadTimeDays: Number(flags.lead || flags['lead-time'] || 10),
          demandStdDev: Number(flags['daily-std'] || flags['demand-std'] || 5),
          leadTimeStdDev: Number(flags['lead-std'] || 0),
          serviceLevelPercent: Number(flags.service || flags['service-level'] || 95),
          currentStock: flags.stock !== undefined ? Number(flags.stock) : null,
          unitCost: flags.cost !== undefined ? Number(flags.cost) : null
        });
      } else if (subAction === 'inventory' || subAction === 'inventory-valuation') {
        const { calculateInventoryValuation } = require(path.join(ENGINES, 'inventory-valuation-engine'));
        let inputData = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          inputData = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        } else if (flags.data) {
          inputData = typeof flags.data === 'string' ? JSON.parse(flags.data) : flags.data;
        } else {
          inputData = {
            beginningInventory: { quantity: 100, unitCost: 10000 },
            transactions: [
              { type: "PURCHASE", quantity: 150, unitPrice: 12000 },
              { type: "SALE", quantity: 120 }
            ]
          };
        }
        result = calculateInventoryValuation(inputData);
      } else if (subAction === 'ecl' || subAction === 'ecl-provision') {
        const { calculateEclProvisioning } = require(path.join(ENGINES, 'ecl-provision-engine'));
        let inputData = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          inputData = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        } else if (flags.data) {
          inputData = typeof flags.data === 'string' ? JSON.parse(flags.data) : flags.data;
        } else {
          inputData = {
            agingSchedule: {
              days0To30: Number(flags.current || 500000000),
              days31To60: Number(flags['days-31-60'] || 200000000),
              days61To90: Number(flags['days-61-90'] || 100000000),
              over90Days: Number(flags.overdue || flags['over-90'] || 50000000)
            },
            existingAllowanceBalance: Number(flags.existing || 40000000)
          };
        }
        result = calculateEclProvisioning(inputData);
      } else {
        throw new Error(`Unknown calc target '${subAction}'. Run 'indonesia-skills help' for available commands.`);
      }
    } else if (action === 'audit') {
      if (subAction === 'pkwtt' || subAction === 'pkwt') {
        const { auditPkwttStatus } = require(path.join(ENGINES, 'pkwtt-calculator'));
        result = auditPkwttStatus({
          monthlyWage: Number(flags.wage || 0),
          probationMonths: Number(flags.probation || 0),
          minimumWage: Number(flags.minimum || flags.ump || 0),
          contractType: flags.contract || 'pkwt',
          jobType: flags.job || 'permanent',
          totalTenureMonths: Number(flags.tenure || 0)
        });
      } else if (subAction === 'contract-risk') {
        const { auditContractRisk } = require(path.join(ENGINES, 'contract-risk-engine'));
        let text = flags.text || '';
        if (flags.file && require('fs').existsSync(flags.file)) {
          text = require('fs').readFileSync(flags.file, 'utf8');
        }
        result = auditContractRisk(text);
      } else if (subAction === 'identity') {
        const { normalizeTaxIdentity } = require(path.join(ENGINES, 'identity-validator'));
        result = normalizeTaxIdentity(flags.id || flags.nik || flags.npwp);
      } else if (subAction === 'statement-linkage') {
        const { validateStatementLinkage } = require(path.join(ENGINES, 'financial-statement-linker'));
        let profile = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          profile = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        }
        result = validateStatementLinkage(profile);
      } else if (subAction === 'business-health') {
        const { auditBusinessHealth } = require(path.join(ENGINES, 'business-health-oracle'));
        let profile = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          profile = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        }
        result = auditBusinessHealth(profile);
      } else if (subAction === 'strategy-stress-test') {
        const { stressTestEnterprise } = require(path.join(ENGINES, 'strategy-stress-tester'));
        let params = {};
        if (flags.file && require('fs').existsSync(flags.file)) {
          params = JSON.parse(require('fs').readFileSync(flags.file, 'utf8'));
        }
        result = stressTestEnterprise(params);
      } else if (subAction === 'thincap' || subAction === 'thin-capitalization') {
        const { auditTransferPricingThinCap } = require(path.join(ENGINES, 'transfer-pricing-engine'));
        result = auditTransferPricingThinCap({
          interestBearingDebt: Number(flags.debt || 0),
          totalEquity: Number(flags.equity || 1),
          totalInterestExpense: Number(flags.interest || 0)
        });
      } else if (subAction === 'compliance' || subAction === 'risk') {
        const { auditComplianceRisk } = require(path.join(ENGINES, 'compliance-risk-engine'));
        result = auditComplianceRisk({
          tax: { hasAnnualSpt: flags['annual-spt'] !== 'false' },
          hr: { paysUmp: flags['pays-ump'] !== 'false' }
        });
      } else if (subAction === 'regulatory-impact') {
        const { analyzeRegulatoryImpact } = require(path.join(ENGINES, 'regulatory-impact-engine'));
        result = analyzeRegulatoryImpact({
          domain: flags.domain || 'umkm',
          fromRuleset: flags.from || 'UMKM-2022',
          toRuleset: flags.to || 'UMKM-2026',
          companyProfile: {
            entityType: flags.entity || 'corporate',
            annualRevenue: Number(flags.revenue || 0)
          }
        });
      } else {
        throw new Error(`Unknown audit target '${subAction}'. Run 'indonesia-skills help' for available commands.`);
      }
    } else if (action === 'diff') {
      if (subAction === 'regulatory' || subAction === 'ruleset') {
        const { compareRulesets } = require(path.join(ENGINES, 'regulatory-diff'));
        result = compareRulesets(flags.domain || 'umkm', flags.from, flags.to);
      } else {
        throw new Error(`Unknown diff target '${subAction}'. Run 'indonesia-skills help' for available commands.`);
      }
    } else if (action === 'route') {
      if (subAction === 'kbli') {
        const { resolveBusinessArchetype } = require(path.join(ENGINES, 'kbli-context-router'));
        const code = String(flags.code || flags.kbli || '');
        result = resolveBusinessArchetype({ kbliCode: code });
      } else if (subAction === 'btki') {
        const { resolveProductClassification } = require(path.join(ENGINES, 'product-context'));
        const code = String(flags.code || flags.btki || '');
        const cif = Number(flags.cif || flags['cif-value'] || 0);
        result = resolveProductClassification({ targetHsCode: code, cifValueIdr: cif });
      } else if (subAction === 'oss-rba' || subAction === 'oss') {
        const { resolveOssRisk } = require(path.join(ENGINES, 'oss-rba-engine'));
        const code = String(flags.code || flags.kbli || '');
        result = resolveOssRisk(code);
      } else {
        throw new Error(`Unknown route target '${subAction}'. Run 'indonesia-skills help' for available commands.`);
      }
    } else if (action === 'ledger') {
      const { recordComplianceEntry, verifyComplianceChain } = require(path.join(ENGINES, 'compliance-ledger'));
      if (subAction === 'record') {
        const payloadData = flags.data ? JSON.parse(flags.data) : {};
        result = recordComplianceEntry(flags.domain || 'compliance', flags.action || 'record', flags.statute || '', payloadData);
      } else if (subAction === 'verify') {
        result = verifyComplianceChain();
      } else {
        throw new Error(`Unknown ledger command '${subAction}'. Available: record, verify.`);
      }
    } else {
      throw new Error(`Unknown command '${action}'. Run 'indonesia-skills help' for available commands.`);
    }

    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({ error: err.message, status: "ERROR" }, null, 2));
    process.exit(1);
  }
}

run();
