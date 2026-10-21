const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { verifyRulesetIntegrity } = require('../../engines/rules/integrity');

function runSupplyChainSecurityTests() {
  console.log("🛡️ Running Supply-Chain Trust Anchor & Integrity Security Tests...\n");
  const rootDir = path.join(__dirname, '../..');

  // 1. Verify Manifest Version Synchronization
  console.log("  [1/3] Verifying Package & Registry Manifest Version Alignment...");
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const pkgLock = JSON.parse(fs.readFileSync(path.join(rootDir, 'package-lock.json'), 'utf8'));
  const reg = JSON.parse(fs.readFileSync(path.join(rootDir, 'registry/index.json'), 'utf8'));

  assert.strictEqual(pkg.version, pkgLock.version, "package-lock version mismatch");
  assert.strictEqual(pkg.version, reg.version, "registry index version mismatch");

  // 2. Verify Trust Anchor Checksums
  console.log("  [2/3] Verifying SHA-256 Ruleset Trust Anchor Hashes...");
  const ALL_RULESETS = ['bpjs.json', 'pph21.json', 'marketplace.json', 'umkm.json', 'btki.json', 'kmk-rates.json', 'oss-rba.json'];
  for (const ruleFile of ALL_RULESETS) {
    const res = verifyRulesetIntegrity(ruleFile);
    assert.strictEqual(res.status, 'VERIFIED', `Ruleset ${ruleFile} failed integrity verification`);
  }

  // 3. Verify Transparent Issuer Audit Metadata
  console.log("  [3/3] Verifying Transparent Issuer Audit Metadata (no fake review board claims)...");
  const LIFECYCLE_RULESETS = ['bpjs.json', 'pph21.json', 'marketplace.json', 'umkm.json', 'kmk-rates.json', 'oss-rba.json'];
  for (const ruleFile of LIFECYCLE_RULESETS) {
    const filePath = path.join(rootDir, 'engines/rules', ruleFile);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(!content.includes('Review Board'), `File ${ruleFile} contains misleading Review Board claim`);
    assert.ok(content.includes('Repository Maintainer — adamriofc'), `File ${ruleFile} missing Maintainer audit metadata`);
  }

  console.log("\n✅ Supply-Chain Trust Anchor & Integrity Verification Passed 100%!");
}

runSupplyChainSecurityTests();