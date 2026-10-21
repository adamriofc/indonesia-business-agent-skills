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
  assert.ok(content.includes('export function auditContractRisk'), "Missing auditContractRisk function export");
  assert.ok(content.includes('export function auditBusinessHealth'), "Missing auditBusinessHealth function export");

  // Verify domain namespaces
  assert.ok(content.includes('export const tax: any;'), "Missing tax namespace export");
  assert.ok(content.includes('export const hr: any;'), "Missing hr namespace export");
  assert.ok(content.includes('export const finance: any;'), "Missing finance namespace export");
  assert.ok(content.includes('export const strategy: any;'), "Missing strategy namespace export");
  assert.ok(content.includes('export const legal: any;'), "Missing legal namespace export");

  console.log("✅ TypeScript Typings (`index.d.ts`) Tests PASSED 100%!");
}

runTypeScriptTypingsTests();
