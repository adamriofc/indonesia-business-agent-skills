#!/usr/bin/env node
/**
 * Zero-Dependency REST API Microservice (`bin/server.js`)
 *
 * Universal, protocol-level REST adapter for Indonesian Business Agent Skills.
 * Built with pure Node.js native `http` module — zero external npm dependencies.
 *
 * Usage:
 *   node bin/server.js --port 3000
 *   npx indonesian-skills serve --port 8080
 */

const http = require('http');
const url = require('url');
const path = require('path');
const sdk = require('../index');
const pkg = require('../package.json');

const ROOT = path.join(__dirname, '..');
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DEFAULT_HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY_BYTES = 1024 * 1024; // 1MB payload ceiling

const ENDPOINT_MAP = {
  // Tax
  '/api/v1/calc/pph21': (body) => sdk.calculatePPh21Monthly(
    Number(body.grossSalary || body.salary || 0),
    String(body.ptkpStatus || body.ptkp || 'TK/0').toUpperCase(),
    body.hasNpwp !== false,
    body.dateStr || null
  ),
  '/api/v1/calc/pph21-december': (body) => sdk.calculatePPh21DecemberReconciliation(
    Number(body.annualGrossIncome || body.annualGross || 0),
    String(body.ptkpStatus || body.ptkp || 'TK/0').toUpperCase(),
    Number(body.janToNovTaxWithheld || body.withheld || 0),
    Number(body.monthlyJhtEmployeeDeduction || body.jht || 0),
    body.hasNpwp !== false,
    body.dateStr || null
  ),
  '/api/v1/calc/pph21-grossup': (body) => sdk.calculatePPh21GrossUp(
    Number(body.targetTakeHome || body.takeHome || 0),
    String(body.ptkpStatus || body.ptkp || 'TK/0').toUpperCase()
  ),
  '/api/v1/calc/pph-badan': (body) => sdk.calculateCorporateTax({
    grossTurnover: Number(body.grossTurnover || body.turnover || 0),
    commercialNetProfit: Number(body.commercialNetProfit || body.profit || 0),
    positiveFiscalAdjustments: Number(body.positiveFiscalAdjustments || 0),
    negativeFiscalAdjustments: Number(body.negativeFiscalAdjustments || 0),
    priorYearFiscalLossCarryForward: Number(body.priorYearFiscalLossCarryForward || 0),
    taxYear: Number(body.taxYear || 2026)
  }),
  '/api/v1/calc/pph23-26': (body) => sdk.calculatePPh23And26(
    Number(body.grossAmount || body.amount || 0),
    body.transactionType || 'service',
    body.hasNpwp !== false,
    body.hasDgtForm === true,
    body.taxTreatyRatePercent ? Number(body.taxTreatyRatePercent) : null
  ),
  '/api/v1/calc/umkm': (body) => sdk.calculateUmkmFinalTax(
    Number(body.monthlyTurnover || body.turnover || 0),
    Number(body.cumulativePreviousTurnover || body.cumulative || 0),
    String(body.taxpayerType || body.entity || 'INDIVIDUAL').toUpperCase(),
    body.dateStr || null
  ),
  '/api/v1/calc/ppn': (body) => sdk.calculatePpnAndPpnbm({
    sellingPriceOrDpp: Number(body.sellingPriceOrDpp || body.price || 0),
    transactionType: body.transactionType || 'standard',
    ppnbmRatePercent: Number(body.ppnbmRatePercent || body.ppnbm || 0),
    cifValueIdr: Number(body.cifValueIdr || body.cif || 0),
    customsDutyAmount: Number(body.customsDutyAmount || body.duty || 0),
    inputTaxCreditsAlreadyPaid: Number(body.inputTaxCreditsAlreadyPaid || body.inputTax || 0)
  }),

  // HR
  '/api/v1/calc/phk': (body) => sdk.calculatePhk(
    Number(body.monthlyWage || body.wage || 0),
    Number(body.tenureYears || body.tenure || 0),
    body.reasonKey || body.reason || 'efficiency_loss',
    Number(body.remainingLeaveDays || body.leaveDays || 0),
    Number(body.uangPisahAmount || body.uangPisah || 0)
  ),
  '/api/v1/calc/pkwt': (body) => sdk.calculatePkwtCompensation(
    Number(body.monthlyWage || body.wage || 0),
    Number(body.tenureMonths || body.tenure || 0)
  ),
  '/api/v1/calc/thr': (body) => sdk.calculateThr(
    Number(body.monthlyBaseSalary || body.wage || 0),
    Number(body.fixedAllowance || body.allowance || 0),
    Number(body.tenureMonths || body.tenure || 12)
  ),
  '/api/v1/calc/bpjs': (body) => sdk.calculateBpjs(
    Number(body.monthlySalary || body.salary || 0),
    body.riskLevel || 'low',
    body.dateStr || null
  ),
  '/api/v1/audit/pkwtt': (body) => sdk.auditPkwttStatus({
    monthlyWage: Number(body.monthlyWage || body.wage || 0),
    probationMonths: Number(body.probationMonths || body.probation || 0),
    minimumWage: Number(body.minimumWage || body.ump || 0),
    contractType: body.contractType || body.contract || 'pkwt',
    jobType: body.jobType || body.job || 'permanent',
    totalTenureMonths: Number(body.totalTenureMonths || body.tenure || 0)
  }),

  // Finance
  '/api/v1/calc/breakeven': (body) => {
    const fixed = Number(body.fixedCosts || body.fixed || 0);
    const price = Number(body.pricePerUnit || body.price || 0);
    const variable = Number(body.variableCostPerUnit || body.variable || 0);
    const revenue = body.actualRevenue !== undefined ? Number(body.actualRevenue) : null;
    const units = sdk.breakEvenUnits(fixed, price, variable);
    const beRev = sdk.breakEvenRevenue(fixed, price, variable);
    const cm = sdk.contributionMargin(price, variable);
    const cmRatio = sdk.contributionMarginRatio(price, variable);
    const mos = revenue !== null ? sdk.marginOfSafety(revenue, beRev) : null;
    return { breakEvenUnits: units, breakEvenRevenue: beRev, contributionMargin: cm, contributionMarginRatio: cmRatio, marginOfSafety: mos };
  },
  '/api/v1/calc/npv': (body) => {
    const rate = Number(body.rate || 0.10);
    const flows = Array.isArray(body.cashflows) ? body.cashflows : [];
    if (body.terminalValue !== undefined) {
      const tv = Number(body.terminalValue);
      const tIdx = Number(body.terminalYearIndex || (flows.length - 1));
      return { npv: sdk.npvWithTerminalValue(rate, flows, tv, tIdx) };
    }
    return { npv: sdk.npv(rate, flows) };
  },
  '/api/v1/calc/irr': (body) => {
    const flows = Array.isArray(body.cashflows) ? body.cashflows : [];
    return sdk.irr(flows);
  },
  '/api/v1/calc/depreciation': (body) => {
    const cost = Number(body.cost || 0);
    const salvage = Number(body.salvage || 0);
    const life = Number(body.lifeYears || body.life || 1);
    const method = String(body.method || 'sl').toLowerCase();
    if (method === 'ddb' || method === 'double_declining') {
      return sdk.doubleDecliningDepreciation(cost, salvage, life);
    } else if (method === 'syd' || method === 'sum_of_years') {
      return sdk.sumOfYearsDigitsDepreciation(cost, salvage, life);
    }
    return sdk.straightLineDepreciation(cost, salvage, life);
  },
  '/api/v1/calc/loan': (body) => sdk.loanAmortizationSchedule(
    Number(body.principal || 0),
    Number(body.annualRate || body.rate || 0),
    Number(body.months || 12)
  ),
  '/api/v1/calc/working-capital': (body) => {
    const ca = Number(body.currentAssets || 0);
    const cl = Number(body.currentLiabilities || 0);
    const nwc = sdk.netWorkingCapital(ca, cl);
    const ratio = cl > 0 ? sdk.workingCapitalRatio(ca, cl) : null;
    let ccc = null;
    if (body.daysInventory !== undefined && body.daysSalesOutstanding !== undefined && body.daysPayables !== undefined) {
      ccc = sdk.cashConversionCycle(body.daysInventory, body.daysSalesOutstanding, body.daysPayables);
    }
    return { netWorkingCapital: nwc, workingCapitalRatio: ratio, cashConversionCycle: ccc };
  },

  // Commerce & Marketing
  '/api/v1/calc/marketplace': (body) => sdk.calculateMarketplaceFee(
    Number(body.sellingPrice || body.price || 0),
    body.platform || 'shopee',
    body.sellerTier || body.tier || 'star',
    body.freeShippingExtra !== false,
    Number(body.adSpendBudget || body.adSpend || 0)
  ),
  '/api/v1/calc/market-sizing': (body) => sdk.calculateMarketSizing({
    totalPopulation: Number(body.totalPopulation || 0),
    targetPercentage: Number(body.targetPercentage || 0.20),
    annualSpendPerUser: Number(body.annualSpendPerUser || 0)
  }),
  '/api/v1/calc/unit-economics': (body) => sdk.calculateMarketingUnitEconomics({
    arppu: Number(body.arppu || 0),
    churnRate: Number(body.churnRate || 0.05),
    cac: Number(body.cac || 0)
  }),
  '/api/v1/route/btki': (body) => sdk.resolveProductClassification({
    targetHsCode: body.btkiCode || body.targetHsCode || body.code,
    cifValueIdr: Number(body.cifValueIdr || body.cif || 0),
    hasNpwp: body.hasNpwp !== false,
    usesApi: body.usesApi !== false
  }),

  // Strategy & Governance
  '/api/v1/route/kbli': (body) => sdk.resolveBusinessArchetype({
    kbliCode: String(body.kbliCode || body.code || '')
  }),
  '/api/v1/audit/thincap': (body) => sdk.auditTransferPricingThinCap({
    interestBearingDebt: Number(body.interestBearingDebt || body.debt || 0),
    totalEquity: Number(body.totalEquity || body.equity || 1),
    totalInterestExpense: Number(body.totalInterestExpense || body.interest || 0)
  }),
  '/api/v1/audit/compliance': (body) => sdk.auditComplianceRisk({
    tax: { hasAnnualSpt: body.hasAnnualSpt !== false },
    hr: { paysUmp: body.paysUmp !== false }
  }),
  '/api/v1/audit/regulatory-impact': (body) => sdk.analyzeRegulatoryImpact({
    domain: body.domain || 'umkm',
    fromRuleset: body.fromRuleset || body.from || 'UMKM-2022',
    toRuleset: body.toRuleset || body.to || 'UMKM-2026',
    companyProfile: {
      entityType: body.entityType || 'corporate',
      annualRevenue: Number(body.annualRevenue || 0)
    }
  }),
  '/api/v1/diff/regulatory': (body) => sdk.compareRulesets(
    body.domain || 'umkm',
    body.fromRuleset || body.from,
    body.toRuleset || body.to
  ),

  // --- v6.18.0 Apex Expansion Endpoints ---
  // Overtime & UPH
  '/api/v1/calc/overtime': (body) => sdk.calculateDailyOvertime({
    monthlyWage: Number(body.monthlyWage || body.wage || 0),
    fixedAllowance: Number(body.fixedAllowance || body.allowance || 0),
    hours: Number(body.hours || 1),
    dayType: body.dayType || 'WORKDAY'
  }),
  '/api/v1/calc/uph': (body) => sdk.calculateUphPayout({
    monthlyWage: Number(body.monthlyWage || body.wage || 0),
    remainingLeaveDays: Number(body.remainingLeaveDays || body.leaveDays || 0),
    monthlyWorkingDays: Number(body.monthlyWorkingDays || 25),
    relocationExpense: Number(body.relocationExpense || 0)
  }),

  // Tax Foreign & Identity
  '/api/v1/calc/kmk-forex': (body) => sdk.calculateKmkForexConversion({
    amountForeign: Number(body.amountForeign || body.amount || 0),
    currency: body.currency || 'USD',
    dateStr: body.dateStr || null
  }),
  '/api/v1/calc/offshore-withholding': (body) => sdk.calculateOffshoreWithholding({
    amountForeign: Number(body.amountForeign || body.amount || 0),
    currency: body.currency || 'USD',
    dateStr: body.dateStr || null,
    taxType: body.taxType || 'pph26',
    hasDgtForm: body.hasDgtForm === true,
    treatyRatePercent: body.treatyRatePercent ? Number(body.treatyRatePercent) : null
  }),
  '/api/v1/audit/identity': (body) => sdk.normalizeTaxIdentity(body.identity || body.nik || body.npwp || ''),

  // e-Bupot Exporters
  '/api/v1/export/ebupot-21': (body) => sdk.exportEbupot21Csv(body.payrollRecords || [], body.options || {}),
  '/api/v1/export/ebupot-23': (body) => sdk.exportEbupot23Csv(body.serviceRecords || [], body.options || {}),

  // Legal & OSS
  '/api/v1/audit/contract-risk': (body) => sdk.auditContractRisk(String(body.contractText || body.text || '')),
  '/api/v1/route/oss-rba': (body) => sdk.resolveOssRisk(body.kbliCode || body.code || ''),
  '/api/v1/audit/bilingual-contract': (body) => sdk.verifyBilingualCompliance(body.indonesianText || body.indo || '', body.englishText || body.eng || ''),

  // Finance WACC & Sanity
  '/api/v1/calc/wacc': (body) => sdk.calculateWacc({
    equityValue: Number(body.equityValue || body.equity || 0),
    debtValue: Number(body.debtValue || body.debt || 0),
    costOfEquityPercent: Number(body.costOfEquityPercent || 15),
    costOfDebtPreTaxPercent: Number(body.costOfDebtPreTaxPercent || 9),
    corporateTaxRatePercent: Number(body.corporateTaxRatePercent !== undefined ? body.corporateTaxRatePercent : 22)
  }),
  '/api/v1/audit/statement-linkage': (body) => sdk.validateStatementLinkage({
    balanceSheet: body.balanceSheet || {},
    incomeStatement: body.incomeStatement || {},
    cashFlowStatement: body.cashFlowStatement || {}
  }),

  // Marketing ROAS & Landed Cost
  '/api/v1/calc/true-roas': (body) => sdk.calculateTrueNetRoas({
    sellingPrice: Number(body.sellingPrice || body.price || 0),
    cogs: Number(body.cogs || 0),
    platformFeePercent: Number(body.platformFeePercent || 6.0),
    freeShippingFeePercent: Number(body.freeShippingFeePercent || 4.0),
    codReturnRatePercent: Number(body.codReturnRatePercent || 0),
    adSpendPerDeliveredOrder: Number(body.adSpendPerDeliveredOrder || body.adSpend || 0),
    shippingSubsidyPerAttempt: Number(body.shippingSubsidyPerAttempt || body.subsidy || 0)
  }),
  '/api/v1/calc/landed-cost': (body) => sdk.calculateLandedCost({
    fobValueUsd: Number(body.fobValueUsd || body.fob || 0),
    freightUsd: Number(body.freightUsd || 0),
    insuranceUsd: Number(body.insuranceUsd || 0),
    exchangeRateKmk: Number(body.exchangeRateKmk || 16250),
    dutyRatePercent: Number(body.dutyRatePercent || 0),
    hasApi: body.hasApi !== false,
    hasNpwp: body.hasNpwp !== false,
    unitsCount: Number(body.unitsCount || 1)
  }),

  // Strategy & Institutional
  '/api/v1/audit/strategy-stress-test': (body) => sdk.stressTestEnterprise({
    baseFinancials: body.baseFinancials || {},
    strategyShocks: body.strategyShocks || {}
  }),
  '/api/v1/audit/business-health': (body) => sdk.auditBusinessHealth(body.profile || body),
  '/api/v1/ledger/record': (body) => sdk.recordComplianceEntry(body.domain, body.action, body.statute, body.payload || {}),
  '/api/v1/ledger/verify': () => sdk.verifyComplianceChain()
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("Payload too large (exceeds 1MB ceiling)"));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Malformed JSON: " + err.message));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(payload);
}

function createServer() {
  return http.createServer(async (req, res) => {
    // 1. CORS Pre-flight Options Handling
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      });
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = (parsedUrl.pathname || '/').replace(/\/+$/, '') || '/';

    // 2. Health & Discovery GET Endpoints
    if (req.method === 'GET') {
      if (pathname === '/' || pathname === '/api/v1/health') {
        sendJson(res, 200, {
          service: pkg.name,
          version: pkg.version,
          status: "UP",
          runtime: `Node.js ${process.version}`,
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.round(process.uptime()),
          availableEndpoints: Object.keys(ENDPOINT_MAP).length
        });
        return;
      }

      if (pathname === '/api/v1/endpoints') {
        sendJson(res, 200, {
          totalEndpoints: Object.keys(ENDPOINT_MAP).length,
          endpoints: Object.keys(ENDPOINT_MAP).sort()
        });
        return;
      }

      if (pathname === '/api/v1/openapi.json' || pathname === '/openapi.json') {
        const openapiPath = path.join(ROOT, 'docs', 'openapi.json');
        if (require('fs').existsSync(openapiPath)) {
          const spec = JSON.parse(require('fs').readFileSync(openapiPath, 'utf8'));
          sendJson(res, 200, spec);
          return;
        }
      }

      sendJson(res, 404, {
        error: `Endpoint not found: GET ${pathname}. Use POST for calculation endpoints or GET /api/v1/endpoints.`,
        status: "NOT_FOUND"
      });
      return;
    }

    // 3. Calculation & Audit POST Endpoints
    if (req.method === 'POST') {
      const handler = ENDPOINT_MAP[pathname];
      if (!handler) {
        sendJson(res, 404, {
          error: `Endpoint not found: POST ${pathname}`,
          status: "NOT_FOUND",
          availableEndpoints: Object.keys(ENDPOINT_MAP).sort()
        });
        return;
      }

      try {
        const body = await readBody(req);
        const result = handler(body);
        sendJson(res, 200, {
          ok: true,
          endpoint: pathname,
          result
        });
      } catch (err) {
        sendJson(res, 400, {
          ok: false,
          endpoint: pathname,
          error: err.message,
          status: "INVALID_INPUT"
        });
      }
      return;
    }

    // 4. Method Not Allowed
    sendJson(res, 405, {
      error: `Method ${req.method} not allowed`,
      status: "METHOD_NOT_ALLOWED"
    });
  });
}

function startServer(options = {}) {
  const port = options.port || DEFAULT_PORT;
  const host = options.host || DEFAULT_HOST;
  const server = createServer();

  return new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      resolve(server);
    });
    server.on('error', (err) => reject(err));
  });
}

// Direct CLI invocation
if (require.main === module) {
  const args = process.argv.slice(2);
  let port = DEFAULT_PORT;
  let host = DEFAULT_HOST;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
      port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i].startsWith('--port=')) {
      port = parseInt(args[i].split('=')[1], 10);
    } else if (args[i] === '--host') {
      host = args[i + 1];
      i++;
    }
  }

  startServer({ port, host })
    .then((server) => {
      const addr = server.address();
      console.log(`🚀 Indonesian Business Skills REST Server running at http://${addr.address}:${addr.port}`);
      console.log(`   Healthcheck: http://${addr.address}:${addr.port}/api/v1/health`);
      console.log(`   Endpoints:   http://${addr.address}:${addr.port}/api/v1/endpoints`);
      console.log(`   Zero external dependencies. Press Ctrl+C to terminate.`);
    })
    .catch((err) => {
      console.error(`❌ Failed to start REST server: ${err.message}`);
      process.exit(1);
    });
}

module.exports = {
  createServer,
  startServer,
  ENDPOINT_MAP
};
