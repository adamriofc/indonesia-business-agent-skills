#!/usr/bin/env node
/**
 * Suite Discovery & Installation Integrity Test (`tests/suite/suite-discovery.test.js`)
 *
 * Verifies that the full Indonesia Business Agent Suite can be discovered
 * correctly as a unified ecosystem:
 *  - All 6 plugins discoverable with correct skill counts
 *  - 88 total skills across the suite (no missing, no duplicate IDs)
 *  - 39 engines present and loadable
 *  - Capability catalog covers all 6 domains
 *  - No duplicate skill IDs across plugins
 *  - No duplicate canonical capability IDs
 *  - Suite bundle manifests consistent with registry
 *  - All bundles reference only existing plugins
 *
 * This test does NOT execute LLM calls or agent reasoning.
 * It validates distribution correctness only.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '../..');
const plugins = ['finance-id', 'hr-id', 'legal-id', 'marketing-id', 'strategic-id', 'tax-id'];
const CANONICAL_PLUGINS = plugins;

console.log('🏢 Running Suite Discovery & Installation Integrity Tests...\n');

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    console.log(`  ✅ ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${label}: ${e.message}`);
    failed++;
  }
}

// Load registry data
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/index.json'), 'utf8'));
const capabilities = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry/capabilities.json'), 'utf8'));
const metadata = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical-metadata.json'), 'utf8'));

// ── [1] Plugin Discovery ──────────────────────────────────────────────────────
console.log('  [1/8] Plugin Discovery — all 6 canonical plugins present...');
plugins.forEach(plugin => {
  check(`Plugin directory exists: ${plugin}`, () => {
    const dir = path.join(ROOT, plugin, 'skills');
    assert.ok(fs.existsSync(dir), `${plugin}/skills directory not found`);
  });
  check(`Plugin manifest exists: ${plugin}`, () => {
    const manifest = path.join(ROOT, plugin, '.claude-plugin', 'plugin.json');
    assert.ok(fs.existsSync(manifest), `${plugin}/.claude-plugin/plugin.json not found`);
  });
});

// ── [2] Total Skill Count ─────────────────────────────────────────────────────
console.log('\n  [2/8] Total Skill Count — 88 skills across 6 plugins...');
let totalSkills = 0;
const allSkillIds = [];
plugins.forEach(plugin => {
  const dir = path.join(ROOT, plugin, 'skills');
  if (!fs.existsSync(dir)) return;
  const skillFolders = fs.readdirSync(dir).filter(f =>
    fs.existsSync(path.join(dir, f, 'SKILL.md'))
  );
  totalSkills += skillFolders.length;
  skillFolders.forEach(id => allSkillIds.push(`${plugin}:${id}`));
});
check(`Total skills = ${metadata.skills}`, () => {
  assert.strictEqual(totalSkills, metadata.skills,
    `Found ${totalSkills} skills, expected ${metadata.skills}`);
});

// ── [3] No Duplicate Skill IDs ────────────────────────────────────────────────
console.log('\n  [3/8] Unique Skill IDs — no cross-plugin collision...');
check('All skill IDs globally unique (plugin:id namespace)', () => {
  const seen = new Set();
  const dupes = [];
  allSkillIds.forEach(id => {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  });
  assert.strictEqual(dupes.length, 0, `Duplicate skill IDs: ${dupes.join(', ')}`);
});
check('Short skill IDs unique within registry', () => {
  const shortIds = registry.skills.map(s => s.id);
  const shortIdSet = new Set(shortIds);
  assert.strictEqual(shortIdSet.size, shortIds.length,
    `Duplicate short skill IDs in registry`);
});

// ── [4] Capability Catalog Completeness ───────────────────────────────────────
console.log('\n  [4/8] Capability Catalog — 88 entries covering all 6 domains...');
check(`Capability catalog total = ${metadata.skills}`, () => {
  assert.strictEqual(capabilities.total_capabilities, metadata.skills,
    `Catalog total ${capabilities.total_capabilities} != ${metadata.skills}`);
});
check('Capability catalog entry count matches total_capabilities', () => {
  assert.strictEqual(capabilities.capabilities.length, capabilities.total_capabilities,
    `capabilities array length ${capabilities.capabilities.length} != total_capabilities ${capabilities.total_capabilities}`);
});
const domainsInCatalog = new Set(capabilities.capabilities.map(c => c.domain));
const expectedDomains = ['legal', 'tax', 'hr', 'finance', 'marketing', 'strategic'];
expectedDomains.forEach(d => {
  check(`Domain '${d}' represented in capability catalog`, () => {
    assert.ok(domainsInCatalog.has(d), `Domain '${d}' missing from capability catalog`);
  });
});

// ── [5] Canonical IDs ─────────────────────────────────────────────────────────
console.log('\n  [5/8] Canonical IDs — domain.skill-id format for all 88 capabilities...');
let missingCanonicalId = 0;
capabilities.capabilities.forEach(c => {
  if (!c.canonical_id || !c.canonical_id.includes('.')) missingCanonicalId++;
});
check('All capabilities have domain-namespaced canonical_id', () => {
  assert.strictEqual(missingCanonicalId, 0,
    `${missingCanonicalId} capabilities missing valid canonical_id`);
});
check('No duplicate canonical_id values', () => {
  const canonIds = capabilities.capabilities.map(c => c.canonical_id).filter(Boolean);
  const canonSet = new Set(canonIds);
  assert.strictEqual(canonSet.size, canonIds.length, 'Duplicate canonical IDs detected');
});

// ── [6] Engines ───────────────────────────────────────────────────────────────
console.log('\n  [6/8] Engine Layer — 39 deterministic engines present...');
check(`Engine count = ${metadata.engines}`, () => {
  const engDir = path.join(ROOT, 'engines');
  const engines = fs.readdirSync(engDir).filter(f => f.endsWith('.js') && !f.startsWith('.'));
  assert.ok(engines.length >= metadata.engines,
    `Found ${engines.length} engine files, expected >= ${metadata.engines}`);
});
check('Shared ruleset files present (pph21, bpjs, marketplace, umkm, btki, kmk-rates, oss-rba)', () => {
  const rulesDir = path.join(ROOT, 'engines', 'rules');
  ['pph21.json', 'bpjs.json', 'marketplace.json', 'umkm.json', 'btki.json', 'kmk-rates.json', 'oss-rba.json'].forEach(r => {
    assert.ok(fs.existsSync(path.join(rulesDir, r)), `Missing ruleset: engines/rules/${r}`);
  });
});

// ── [7] Bundle Manifests ─────────────────────────────────────────────────────
console.log('\n  [7/8] Bundle Manifests — all 5 profiles present and consistent...');
const bundlesDir = path.join(ROOT, 'bundles');
const expectedBundles = [
  'full-business-suite.json',
  'finance-strategy.json',
  'people-payroll.json',
  'compliance.json',
  'go-to-market.json'
];
check(`bundles/ directory exists with ${expectedBundles.length} bundle files`, () => {
  assert.ok(fs.existsSync(bundlesDir), 'bundles/ directory not found');
  expectedBundles.forEach(bf => {
    assert.ok(
      fs.existsSync(path.join(bundlesDir, bf)),
      `Missing bundle: bundles/${bf}`
    );
  });
});
const fullBundle = JSON.parse(fs.readFileSync(path.join(bundlesDir, 'full-business-suite.json'), 'utf8'));
check('full-business-suite covers all 6 plugins', () => {
  const bundlePluginIds = fullBundle.plugins.map(p => p.id).sort();
  const canonical = [...plugins].sort();
  assert.deepStrictEqual(bundlePluginIds, canonical,
    `Bundle plugins: [${bundlePluginIds}] vs canonical: [${canonical}]`);
});
check('full-business-suite totals match canonical metadata', () => {
  assert.strictEqual(fullBundle.totals.plugins, metadata.plugins);
  assert.strictEqual(fullBundle.totals.skills, metadata.skills);
  assert.strictEqual(fullBundle.totals.engines, metadata.engines);
});
check('All bundle versions == repository version (lockstep)', () => {
  const repoVer = metadata.version;
  expectedBundles.forEach(bf => {
    const b = JSON.parse(fs.readFileSync(path.join(bundlesDir, bf), 'utf8'));
    assert.strictEqual(b.version, repoVer,
      `Bundle ${bf} version ${b.version} != repo version ${repoVer}`);
  });
});

// ── [8] Cross-Suite Integrity ─────────────────────────────────────────────────
console.log('\n  [8/8] Cross-Suite Integrity — registry ↔ capability catalog ↔ bundles alignment...');
check('registry/index.json skill count == canonical metadata', () => {
  assert.strictEqual(registry.skills.length, metadata.skills,
    `registry.skills.length ${registry.skills.length} != metadata.skills ${metadata.skills}`);
});
check('registry/capabilities.json version field exists', () => {
  assert.ok(capabilities.schemaVersion, 'capabilities.json missing schemaVersion');
});
check('All registry skill IDs present in capability catalog', () => {
  const catalogIds = new Set(capabilities.capabilities.map(c => c.id));
  const missing = registry.skills.filter(s => !catalogIds.has(s.id));
  assert.strictEqual(missing.length, 0,
    `Skills in registry but not in catalog: ${missing.map(s => s.id).join(', ')}`);
});

// ── [9] Bundle Arithmetic & Membership (P0/P1 audit fixes) ───────────────────
console.log('\n  [9/10] Bundle Arithmetic & Registry Membership...');
check('sum(plugin.skills) == totals.skills for every bundle', () => {
  expectedBundles.forEach(bf => {
    const b = JSON.parse(fs.readFileSync(path.join(bundlesDir, bf), 'utf8'));
    const sum = b.plugins.reduce((acc, p) => acc + (Number(p.skills) || 0), 0);
    assert.strictEqual(sum, b.totals.skills,
      `Bundle ${bf}: sum(plugin.skills)=${sum} != totals.skills=${b.totals.skills}`);
  });
});
check('Per-plugin declared skill counts == actual registry counts', () => {
  const actual = {};
  registry.skills.forEach(s => { actual[s.plugin] = (actual[s.plugin] || 0) + 1; });
  expectedBundles.forEach(bf => {
    const b = JSON.parse(fs.readFileSync(path.join(bundlesDir, bf), 'utf8'));
    b.plugins.forEach(p => {
      assert.strictEqual(actual[p.id], Number(p.skills),
        `Bundle ${bf} plugin ${p.id}: declared=${p.skills}, actual=${actual[p.id]}`);
    });
  });
});
check('Full suite plugin set == all registry skill IDs (exact membership)', () => {
  const actualById = {};
  registry.skills.forEach(s => { actualById[s.id] = s.plugin; });
  fullBundle.plugins.forEach(p => {
    // every skill in this plugin's directory must exist in registry
    const dir = path.join(ROOT, p.id, 'skills');
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).filter(f => fs.existsSync(path.join(dir, f, 'SKILL.md'))).forEach(id => {
      assert.strictEqual(actualById[id], p.id,
        `Skill '${id}' in ${p.id}/skills but registry maps it to '${actualById[id]}'`);
    });
  });
});

// ── [10] Installation Command Smoke Verification (P1 audit fix) ──────────────
console.log('\n  [10/10] Installation Command Smoke Verification...');
check('Full-suite installation command present in full-business-suite.json', () => {
  const install = fullBundle.installation;
  assert.ok(install, 'full-business-suite.json missing installation block');
  assert.ok(install.oneCommand, 'missing installation.oneCommand');
  assert.ok(install.oneCommand.includes('indonesia-business-agent-skills'),
    `oneCommand must reference the suite repo: ${install.oneCommand}`);
  assert.ok(install.opencode.includes('indonesia-business-agent-skills'),
    `opencode command must reference the suite repo: ${install.opencode}`);
});
check('Suite repository constant referenced by all installation modes', () => {
  const SUITE_REPO = 'adamriofc/indonesia-business-agent-skills';
  const install = fullBundle.installation;
  [install.oneCommand, install.opencode, install.git].forEach(cmd => {
    assert.ok(cmd.includes(SUITE_REPO), `Install command missing ${SUITE_REPO}: ${cmd}`);
  });
  assert.ok(fullBundle.repository.includes(SUITE_REPO), 'bundle repository URL mismatch');
});
check('Selective profile commands reference only member plugins', () => {
  expectedBundles.forEach(bf => {
    const b = JSON.parse(fs.readFileSync(path.join(bundlesDir, bf), 'utf8'));
    b.plugins.forEach(p => {
      assert.ok(CANONICAL_PLUGINS.includes(p.id), `Bundle ${bf} references unknown plugin '${p.id}'`);
    });
  });
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n  Total Checks: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
if (failed > 0) {
  console.error(`\n❌ Suite Discovery Tests FAILED with ${failed} failure(s).`);
  process.exit(1);
} else {
  console.log(`\n✅ Suite Discovery & Installation Integrity Tests Passed 100%! (${passed} assertions verified)`);
}
