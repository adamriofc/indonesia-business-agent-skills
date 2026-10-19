const fs = require('fs');
const path = require('path');
const assert = require('assert');

function discoverAllSkillPaths(rootDir) {
  const bundles = ['legal-id', 'tax-id', 'hr-id', 'finance-id', 'marketing-id', 'strategic-id'];
  const skillPaths = [];

  bundles.forEach(bundle => {
    const skillsDir = path.join(rootDir, bundle, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir);
      skills.forEach(skill => {
        const skillPath = path.join(bundle, 'skills', skill, 'SKILL.md');
        if (fs.existsSync(path.join(rootDir, skillPath))) {
          skillPaths.push(skillPath);
        }
      });
    }
  });

  return skillPaths;
}

function runSecurityTests() {
  console.log("🛡️ Running Prompt Injection Defense Security Tests...\n");
  const rootDir = path.join(__dirname, '../..');
  let failures = 0;
  const allSkills = discoverAllSkillPaths(rootDir);

  console.log(`  Scanning all ${allSkills.length} skills across 6 plugins for closed delimiter boundaries...`);

  allSkills.forEach(skillRelPath => {
    const filePath = path.join(rootDir, skillRelPath);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Skipping missing skill file: ${skillRelPath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Assert that the file contains a COMPLETE prompt isolation boundary: the
    // untrusted payload markers AND the closing [END PAYLOAD] delimiter
    // (an open-ended marker without a close is a boundary-bypass vector).
    const hasOpenMarker = content.includes('[UNTRUSTED DATA PAYLOAD]');
    const hasCloseMarker = content.includes('[END PAYLOAD]');

    if (!hasOpenMarker || !hasCloseMarker) {
      console.error(`❌ Security Violation: ${skillRelPath} does not implement a CLOSED payload boundary (both '[UNTRUSTED DATA PAYLOAD]' and '[END PAYLOAD]' required).`);
      failures++;
    }
  });

  if (failures > 0) {
    console.error(`\n❌ Security testing FAILED with ${failures} violations.`);
    process.exit(1);
  } else {
    console.log(`✅ Security Verified: All ${allSkills.length} skills implement complete closed prompt injection mitigation boundaries.`);
    console.log("✅ Security Policy Verification Passed: Delimiter boundaries enforced on all ingestion skills.");
  }
}

runSecurityTests();
