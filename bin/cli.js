#!/usr/bin/env node
/**
 * Universal CLI Runner — Indonesian Business Agent Skills
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
      } else {
        throw new Error(`Unknown calc target '${subAction}'. Run 'indonesian-skills help' for available commands.`);
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
        throw new Error(`Unknown audit target '${subAction}'. Run 'indonesian-skills help' for available commands.`);
      }
    } else if (action === 'diff') {
      if (subAction === 'regulatory' || subAction === 'ruleset') {
        const { compareRulesets } = require(path.join(ENGINES, 'regulatory-diff'));
        result = compareRulesets(flags.domain || 'umkm', flags.from, flags.to);
      } else {
        throw new Error(`Unknown diff target '${subAction}'. Run 'indonesian-skills help' for available commands.`);
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
      } else {
        throw new Error(`Unknown route target '${subAction}'. Run 'indonesian-skills help' for available commands.`);
      }
    } else {
      throw new Error(`Unknown command '${action}'. Run 'indonesian-skills help' for available commands.`);
    }

    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({ error: err.message, status: "ERROR" }, null, 2));
    process.exit(1);
  }
}

run();
