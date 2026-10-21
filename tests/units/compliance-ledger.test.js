const assert = require('assert');
const { ComplianceLedger } = require('../../engines/compliance-ledger');
const { auditBusinessHealth } = require('../../engines/business-health-oracle');

function runComplianceLedgerAndHealthTests() {
  console.log("🔐 Running Compliance Ledger & Business Health Oracle Tests...\n");

  // 1. Compliance Ledger Chain Linkage & Anti-Tamper Verification
  const ledger = new ComplianceLedger();

  const b0 = ledger.append({
    domain: 'tax',
    action: 'calculate_pph21',
    statute: 'PMK 168/2023',
    payload: { grossSalary: 10000000, taxWithheld: 200000 }
  });
  assert.strictEqual(b0.blockIndex, 0);
  assert.strictEqual(b0.previousHash, "0000000000000000000000000000000000000000000000000000000000000000");

  const b1 = ledger.append({
    domain: 'hr',
    action: 'calculate_phk',
    statute: 'PP 35/2021',
    payload: { wage: 10000000, reason: 'resignation' }
  });
  assert.strictEqual(b1.blockIndex, 1);
  assert.strictEqual(b1.previousHash, b0.blockHash);

  // Chain Verification (Clean State)
  const cleanVerify = ledger.verifyChain();
  assert.strictEqual(cleanVerify.isValid, true);
  assert.strictEqual(cleanVerify.totalBlocks, 2);

  // Tamper Simulation: Modify block 0 payload
  ledger.chain[0].action = "illegal_tampered_action";
  const tamperedVerify = ledger.verifyChain();
  assert.strictEqual(tamperedVerify.isValid, false);
  assert.strictEqual(tamperedVerify.violationBlockIndex, 0);

  // 2. 360-Degree Business Health Oracle
  const healthyProfile = {
    tax: { hasAnnualSpt: true, isNpwpValid: true, hasPph21TerWithholding: true },
    hr: { meetsMinimumWage: true, paysUmp: true, hasBpjsRegistration: true, pkwtExceeds5Years: false, thrPaid: true },
    legal: { hasNibOss: true, contractRiskScore: 15, hasUuPdpCompliance: true },
    finance: { cashRunwayMonths: 14, debtToEquityRatio: 1.2 },
    commerce: { isContributionMarginPositive: true, isRoasAboveBreakEven: true }
  };

  const healthRes = auditBusinessHealth(healthyProfile);
  assert.strictEqual(healthRes.overallHealthScore, 100);
  assert.strictEqual(healthRes.healthTier, 'SOVEREIGN_EXCELLENT');
  assert.strictEqual(healthRes.criticalAlertsCount, 0);

  // Distressed Profile
  const distressedProfile = {
    tax: { hasAnnualSpt: false, isNpwpValid: false },
    hr: { meetsMinimumWage: false, hasBpjsRegistration: false, pkwtExceeds5Years: true },
    legal: { hasNibOss: false, contractRiskScore: 85 },
    finance: { cashRunwayMonths: 2, debtToEquityRatio: 5.5 },
    commerce: { isContributionMarginPositive: false }
  };

  const distRes = auditBusinessHealth(distressedProfile);
  assert.ok(distRes.overallHealthScore < 50);
  assert.strictEqual(distRes.healthTier, 'DISTRESSED');
  assert.ok(distRes.criticalAlertsCount >= 5);

  console.log("✅ Compliance Ledger & Health Oracle Tests PASSED 100%!");
}

runComplianceLedgerAndHealthTests();
