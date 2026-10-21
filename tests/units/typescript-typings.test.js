const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runTypeScriptTypingsTests() {
  console.log("📘 Running TypeScript Typings (`index.d.ts`) Verification Tests...\n");

  const dtsPath = path.join(__dirname, '../../index.d.ts');
  assert.ok(fs.existsSync(dtsPath), "index.d.ts file must exist at repository root");

  const content = fs.readFileSync(dtsPath, 'utf8');

  // Verify key types
  assert.ok(content.includes('type PtkpStatus ='), "Missing PtkpStatus type definition");
  assert.ok(content.includes('type TerCategory ='), "Missing TerCategory type definition");
  assert.ok(content.includes('type PhkReasonKey ='), "Missing PhkReasonKey type definition");
  assert.ok(content.includes('type BusinessArchetype ='), "Missing BusinessArchetype type definition");

  // Verify key interfaces
  assert.ok(content.includes('interface PPh21MonthlyResult'), "Missing PPh21MonthlyResult interface");
  assert.ok(content.includes('interface PPh21DecemberResult'), "Missing PPh21DecemberResult interface");
  assert.ok(content.includes('interface PhkResult'), "Missing PhkResult interface");
  assert.ok(content.includes('interface BpjsResult'), "Missing BpjsResult interface");
  assert.ok(content.includes('interface ContractRiskResult'), "Missing ContractRiskResult interface");
  assert.ok(content.includes('interface BusinessHealthResult'), "Missing BusinessHealthResult interface");
  assert.ok(content.includes('interface AuditReceipt'), "Missing AuditReceipt interface");

  // Verify function exports
  assert.ok(content.includes('export function calculatePPh21Monthly'), "Missing calculatePPh21Monthly function export");
  assert.ok(content.includes('export function calculatePhk'), "Missing calculatePhk function export");
  assert.ok(content.includes('export function calculateBpjs'), "Missing calculateBpjs function export");
  assert.ok(content.includes('export function calculateOvertime'), "Missing calculateOvertime function export");
  assert.ok(content.includes('export function calculateDailyOvertime'), "Missing calculateDailyOvertime function export");
  assert.ok(content.includes('export function auditContractRisk'), "Missing auditContractRisk function export");
  assert.ok(content.includes('export function auditBusinessHealth'), "Missing auditBusinessHealth function export");

  // Verify runtime-types parity with index.js exports
  const sdk = require('../../index');
  assert.strictEqual(typeof sdk.calculateOvertime, 'function', "sdk.calculateOvertime must be exported as a function");
  assert.strictEqual(typeof sdk.calculateDailyOvertime, 'function', "sdk.calculateDailyOvertime must be exported as a function");
  assert.strictEqual(sdk.calculateOvertime, sdk.calculateDailyOvertime, "sdk.calculateOvertime must be an alias for calculateDailyOvertime");
  assert.strictEqual(typeof sdk.calculateHourlyWage, 'function', "sdk.calculateHourlyWage must be exported as a function");
  assert.strictEqual(typeof sdk.calculateUphPayout, 'function', "sdk.calculateUphPayout must be exported as a function");
  assert.strictEqual(typeof sdk.calculateWacc, 'function', "sdk.calculateWacc must be exported as a function");
  assert.strictEqual(typeof sdk.calculateTrueNetRoas, 'function', "sdk.calculateTrueNetRoas must be exported as a function");
  assert.strictEqual(typeof sdk.calculateLandedCost, 'function', "sdk.calculateLandedCost must be exported as a function");
  assert.strictEqual(typeof sdk.validateNik, 'function', "sdk.validateNik must be exported as a function");
  assert.strictEqual(typeof sdk.validateNpwp, 'function', "sdk.validateNpwp must be exported as a function");
  assert.strictEqual(typeof sdk.resolveOssRisk, 'function', "sdk.resolveOssRisk must be exported as a function");
  assert.strictEqual(typeof sdk.auditBusinessHealth, 'function', "sdk.auditBusinessHealth must be exported as a function");

  // Verify domain namespaces
  assert.ok(content.includes('export const tax: any;'), "Missing tax namespace export");
  assert.ok(content.includes('export const hr: any;'), "Missing hr namespace export");
  assert.ok(content.includes('export const finance: any;'), "Missing finance namespace export");
  assert.ok(content.includes('export const strategy: any;'), "Missing strategy namespace export");
  assert.ok(content.includes('export const legal: any;'), "Missing legal namespace export");

  console.log("✅ TypeScript Typings (`index.d.ts`) Tests PASSED 100%!");
}

runTypeScriptTypingsTests();
