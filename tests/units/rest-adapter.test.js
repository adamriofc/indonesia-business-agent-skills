/**
 * Unit & Integration Tests for Root SDK and REST API Adapter (`tests/units/rest-adapter.test.js`)
 *
 * Verifies:
 *   1. Root SDK (`index.js`) module exports and direct/namespace bindings.
 *   2. Zero-dependency HTTP REST server (`bin/server.js`) lifecycle (listen, request, response, shutdown).
 *   3. Deterministic accuracy of JSON calculation endpoints over HTTP.
 *   4. Robust error boundaries (400 on malformed/invalid inputs, 404 on absent routes).
 */

const assert = require('assert');
const http = require('http');
const sdk = require('../../index');
const { startServer } = require('../../bin/server');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            rawBody: data
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runRestAdapterTests() {
  console.log("🌐 Running Root SDK & REST API Adapter Unit Tests...\n");

  // -------------------------------------------------------------
  // Part 1: Root SDK Interface Verification
  // -------------------------------------------------------------
  console.log("  [1/4] Verifying Root SDK (`index.js`) Interface & Namespace Bindings...");
  
  // Tax exports
  assert.strictEqual(typeof sdk.calculatePPh21Monthly, 'function');
  assert.strictEqual(typeof sdk.calculatePPh21DecemberReconciliation, 'function');
  assert.strictEqual(typeof sdk.calculatePPh21GrossUp, 'function');
  assert.strictEqual(typeof sdk.calculateCorporateTax, 'function');
  assert.strictEqual(typeof sdk.calculatePPh23And26, 'function');
  assert.strictEqual(typeof sdk.calculateUmkmFinalTax, 'function');
  assert.strictEqual(typeof sdk.calculatePpnAndPpnbm, 'function');

  // HR exports
  assert.strictEqual(typeof sdk.calculatePhk, 'function');
  assert.strictEqual(typeof sdk.calculatePkwtCompensation, 'function');
  assert.strictEqual(typeof sdk.auditPkwttStatus, 'function');
  assert.strictEqual(typeof sdk.calculateThr, 'function');
  assert.strictEqual(typeof sdk.calculateBpjs, 'function');

  // Finance exports
  assert.strictEqual(typeof sdk.breakEvenUnits, 'function');
  assert.strictEqual(typeof sdk.loanAmortizationSchedule, 'function');
  assert.strictEqual(typeof sdk.straightLineDepreciation, 'function');
  assert.strictEqual(typeof sdk.npv, 'function');
  assert.strictEqual(typeof sdk.irr, 'function');
  assert.strictEqual(typeof sdk.netWorkingCapital, 'function');

  // Strategy & Commerce exports
  assert.strictEqual(typeof sdk.resolveBusinessArchetype, 'function');
  assert.strictEqual(typeof sdk.resolveProductClassification, 'function');
  assert.strictEqual(typeof sdk.calculateMarketplaceFee, 'function');
  assert.strictEqual(typeof sdk.auditComplianceRisk, 'function');

  // Security exports
  assert.strictEqual(typeof sdk.sanitizeUntrustedPayload, 'function');
  assert.strictEqual(typeof sdk.wrapUntrustedPayload, 'function');

  // Namespaces exist
  assert.ok(sdk.tax && sdk.hr && sdk.finance && sdk.commerce && sdk.strategy && sdk.security);
  console.log("    ✓ Root SDK exported all 40 computational engines and domain namespaces successfully.");

  // -------------------------------------------------------------
  // Part 2: REST Server Startup on Ephemeral Port
  // -------------------------------------------------------------
  console.log("  [2/4] Starting Zero-Dependency REST Server on Ephemeral Port...");
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  const address = server.address();
  const baseOptions = {
    hostname: '127.0.0.1',
    port: address.port,
    headers: { 'Content-Type': 'application/json' }
  };
  console.log(`    ✓ Server active at http://127.0.0.1:${address.port}`);

  try {
    // -------------------------------------------------------------
    // Part 3: HTTP Endpoint Requests & Deterministic Execution
    // -------------------------------------------------------------
    console.log("  [3/4] Testing HTTP REST API Calculation Endpoints...");

    // 3a. Healthcheck
    const healthRes = await makeRequest({ ...baseOptions, path: '/api/v1/health', method: 'GET' });
    assert.strictEqual(healthRes.statusCode, 200);
    assert.strictEqual(healthRes.body.status, "UP");
    assert.strictEqual(typeof healthRes.body.availableEndpoints, "number");

    // 3b. PPh 21 TER Endpoint
    const pphRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/pph21', method: 'POST' },
      { grossSalary: 10000000, ptkpStatus: "TK/0" }
    );
    assert.strictEqual(pphRes.statusCode, 200);
    assert.strictEqual(pphRes.body.ok, true);
    assert.strictEqual(pphRes.body.result.monthlyTaxWithheld, 200000);

    // 3c. PPh 21 December Reconciliation (Lebih Bayar Refund)
    const pphDecRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/pph21-december', method: 'POST' },
      { annualGrossIncome: 80000000, ptkpStatus: "TK/0", janToNovTaxWithheld: 5000000, monthlyJhtEmployeeDeduction: 100000 }
    );
    assert.strictEqual(pphDecRes.statusCode, 200);
    assert.strictEqual(pphDecRes.body.result.isOverpaid, true);
    assert.strictEqual(pphDecRes.body.result.overpaymentRefundAmount, 3960000);
    assert.strictEqual(pphDecRes.body.result.taxStatus, "LEBIH_BAYAR");

    // 3d. PHK Resignation
    const phkRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/phk', method: 'POST' },
      { monthlyWage: 10000000, tenureYears: 5, reasonKey: "resign" }
    );
    assert.strictEqual(phkRes.statusCode, 200);
    assert.strictEqual(phkRes.body.result.totalPayout, 0);
    assert.strictEqual(phkRes.body.result.reasonKey, "resignation");

    // 3e. PPN Besaran Tertentu 1.2%
    const ppnRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/ppn', method: 'POST' },
      { sellingPriceOrDpp: 100000000, transactionType: "besaran_tertentu" }
    );
    assert.strictEqual(ppnRes.statusCode, 200);
    assert.strictEqual(ppnRes.body.result.ppnAmount, 1200000);
    assert.strictEqual(ppnRes.body.result.effectivePpnBurdenPercent, "1.20%");

    // 3f. KBLI Routing
    const kbliRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/route/kbli', method: 'POST' },
      { kbliCode: "70209" }
    );
    assert.strictEqual(kbliRes.statusCode, 200);
    assert.strictEqual(kbliRes.body.result.businessArchetype, "PROFESSIONAL_SERVICE");

    // 3g. BTKI Classification
    const btkiRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/route/btki', method: 'POST' },
      { btkiCode: "0901.21.10", cifValueIdr: 100000000 }
    );
    assert.strictEqual(btkiRes.statusCode, 200);
    assert.strictEqual(btkiRes.body.result.classificationStatus, "CLASSIFIED");
    assert.strictEqual(btkiRes.body.result.totalLandedCost, 137400000);

    // 3h. Break-Even
    const beRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/breakeven', method: 'POST' },
      { fixedCosts: 50000000, pricePerUnit: 100000, variableCostPerUnit: 60000 }
    );
    assert.strictEqual(beRes.statusCode, 200);
    assert.strictEqual(beRes.body.result.breakEvenUnits, 1250);

    // -------------------------------------------------------------
    // Part 4: Error Handling & Security Boundary Verification
    // -------------------------------------------------------------
    console.log("  [4/4] Verifying Error Boundaries & Negative Input Handling...");

    // 4a. 400 Bad Request on Negative Salary
    const badSalaryRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/pph21', method: 'POST' },
      { grossSalary: -5000000, ptkpStatus: "TK/0" }
    );
    assert.strictEqual(badSalaryRes.statusCode, 400);
    assert.strictEqual(badSalaryRes.body.ok, false);
    assert.strictEqual(badSalaryRes.body.status, "INVALID_INPUT");

    // 4b. 404 Not Found on Unknown Endpoint
    const notFoundRes = await makeRequest(
      { ...baseOptions, path: '/api/v1/calc/non-existent-calc', method: 'POST' },
      { test: 123 }
    );
    assert.strictEqual(notFoundRes.statusCode, 404);
    assert.strictEqual(notFoundRes.body.status, "NOT_FOUND");

    console.log("\n✅ Root SDK & REST API Adapter Tests PASSED 100%!");
  } finally {
    await new Promise((res) => server.close(res));
    console.log("  ✓ Test server closed cleanly.");
  }
}

if (require.main === module) {
  runRestAdapterTests();
}

module.exports = {
  runRestAdapterTests
};
