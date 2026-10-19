#!/usr/bin/env node
/**
 * Universal CLI Runner — Indonesian Business Agent Skills
 * Pure Node.js, zero external dependencies, agnostic, lightweight & agent-friendly.
 *
 * Usage:
 *   indonesian-skills calc pph21 --salary 10000000 --ptkp TK/0
 *   indonesian-skills calc phk --wage 10000000 --tenure 5 --reason resignation
 *   indonesian-skills calc thr --wage 5000000 --tenure 6
 *   indonesian-skills calc bpjs --salary 8000000 --risk low
 *   indonesian-skills calc umkm --turnover 50000000 --cumulative 200000000
 *   indonesian-skills calc ppn --price 10000000 --type standard
 *   indonesian-skills calc breakeven --fixed 50000000 --price 100000 --variable 60000
 *   indonesian-skills audit pkwtt --wage 5000000 --probation 4 --contract pkwt
 *   indonesian-skills route kbli --code 70209
 *   indonesian-skills mcp
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

function printHelp() {
  const helpText = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    commands: {
      "calc pph21": "Calculate PPh 21 TER tax (--salary <IDR>, --ptkp <TK/0..K/3>, [--has-npwp <bool>], [--date <YYYY-MM-DD>])",
      "calc pph21-december": "PPh 21 December annual reconciliation (--annual-gross <IDR>, --ptkp <TK/0..K/3>, --withheld <IDR>, [--jht <IDR>])",
      "calc phk": "Calculate statutory PHK severance (--wage <IDR>, --tenure <years>, --reason <code|alias>, [--leave-days <days>], [--uang-pisah <IDR>])",
      "calc thr": "Calculate statutory THR payout (--wage <IDR>, [--allowance <IDR>], --tenure <months>)",
      "calc bpjs": "Calculate BPJS Ketenagakerjaan & Kesehatan (--salary <IDR>, [--risk <low|medium|high>], [--date <YYYY-MM-DD>])",
      "calc umkm": "Calculate UMKM 0.5% final tax (--turnover <IDR>, [--cumulative <IDR>], [--entity <individual|corporate>])",
      "calc ppn": "Calculate PPN 12% & PPnBM (--price <IDR>, [--type <standard|dpp_nilai_lain|besaran_tertentu|import>])",
      "calc breakeven": "Analyze break-even point (--fixed <IDR>, --price <IDR>, --variable <IDR>, [--revenue <IDR>])",
      "audit pkwtt": "Audit PKWTT/PKWT contract status (--wage <IDR>, --probation <months>, --contract <pkwt|pkwtt>, [--tenure <months>])",
      "route kbli": "Resolve KBLI code to business archetype (--code <5-digit KBLI>)",
      "mcp": "Start native stdio MCP server for agent integration",
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
      } else if (subAction === 'phk') {
        const { calculatePhk } = require(path.join(ENGINES, 'phk-calculator'));
        const wage = Number(flags.wage || flags.salary || 0);
        const tenure = Number(flags.tenure || flags.years || 0);
        const reason = flags.reason || 'efficiency_loss';
        const leaveDays = Number(flags['leave-days'] || flags.leave || 0);
        const uangPisah = Number(flags['uang-pisah'] || 0);
        result = calculatePhk(wage, tenure, reason, leaveDays, uangPisah);
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
      } else if (subAction === 'compliance' || subAction === 'risk') {
        const { auditComplianceRisk } = require(path.join(ENGINES, 'compliance-risk-engine'));
        result = auditComplianceRisk({
          tax: { hasAnnualSpt: flags['annual-spt'] !== 'false' },
          hr: { paysUmp: flags['pays-ump'] !== 'false' }
        });
      } else {
        throw new Error(`Unknown audit target '${subAction}'. Run 'indonesian-skills help' for available commands.`);
      }
    } else if (action === 'route') {
      if (subAction === 'kbli') {
        const { resolveBusinessArchetype } = require(path.join(ENGINES, 'kbli-context-router'));
        const code = String(flags.code || flags.kbli || '');
        result = resolveBusinessArchetype({ kbliCode: code });
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
