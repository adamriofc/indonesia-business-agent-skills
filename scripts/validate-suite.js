#!/usr/bin/env node
/**
 * Indonesia Business Agent Suite Validator (`scripts/validate-suite.js`)
 *
 * Verifies structural and semantic integrity of all bundle manifests:
 *  - Required fields present and correctly typed
 *  - Plugin IDs match canonical plugin directories
 *  - Skill counts match registry/index.json
 *  - Unique plugin IDs within each bundle
 *  - Unique capability IDs across full suite (no collision)
 *  - Canonical IDs in registry/capabilities.json use domain-namespaced format
 *  - Full-business-suite bundle covers all 6 plugins with exact skill/engine counts
 *
 * Usage:
 *   node scripts/validate-suite.js
 *   npm run validate:suite
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUNDLES_DIR = path.join(ROOT, 'bundles');
const REGISTRY_PATH = path.join(ROOT, 'registry/index.json');
const CAPABILITIES_PATH = path.join(ROOT, 'registry/capabilities.json');
const METADATA_PATH = path.join(ROOT, 'canonical-metadata.json');

const CANONICAL_PLUGINS = ['legal-id', 'tax-id', 'hr-id', 'finance-id', 'marketing-id', 'strategic-id'];
const EXPECTED_FULL_SUITE_BUNDLE = 'full-business-suite.json';

function validateSuite() {
  console.log('🏢 Running Indonesia Business Agent Suite Validator...\n');
  let errors = 0;
  let checks = 0;

  // Load canonical sources
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const capabilities = JSON.parse(fs.readFileSync(CAPABILITIES_PATH, 'utf8'));
  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));

  // Check 1: bundles/ directory exists
  checks++;
  if (!fs.existsSync(BUNDLES_DIR)) {
    console.error('❌ [1] bundles/ directory not found.');
    errors++;
  } else {
    console.log('  ✅ [1] bundles/ directory exists.');
  }

  const bundleFiles = fs.existsSync(BUNDLES_DIR)
    ? fs.readdirSync(BUNDLES_DIR).filter(f => f.endsWith('.json'))
    : [];

  // Check 2: full-business-suite.json exists
  checks++;
  if (!bundleFiles.includes(EXPECTED_FULL_SUITE_BUNDLE)) {
    console.error(`❌ [2] Missing required bundle: ${EXPECTED_FULL_SUITE_BUNDLE}`);
    errors++;
  } else {
    console.log(`  ✅ [2] ${EXPECTED_FULL_SUITE_BUNDLE} present.`);
  }

  // Check 3: All bundle files are valid JSON with required fields
  checks++;
  let bundleErrors = 0;
  const bundleData = {};
  bundleFiles.forEach(bf => {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(BUNDLES_DIR, bf), 'utf8'));
      bundleData[bf] = d;
      const required = ['bundle_id', 'name', 'profile', 'version', 'description', 'plugins', 'totals'];
      required.forEach(field => {
        if (!d[field]) {
          console.error(`❌ [3] Bundle ${bf} missing required field: ${field}`);
          bundleErrors++;
        }
      });
      if (!Array.isArray(d.plugins) || d.plugins.length === 0) {
        console.error(`❌ [3] Bundle ${bf}: plugins must be a non-empty array`);
        bundleErrors++;
      }
    } catch (e) {
      console.error(`❌ [3] Bundle ${bf}: JSON parse error: ${e.message}`);
      bundleErrors++;
    }
  });
  if (bundleErrors === 0) {
    console.log(`  ✅ [3] All ${bundleFiles.length} bundle files valid JSON with required fields.`);
  } else {
    errors += bundleErrors;
  }

  // Check 4: Plugin IDs in bundles match canonical plugin directories
  checks++;
  let pluginIdErrors = 0;
  bundleFiles.forEach(bf => {
    const d = bundleData[bf];
    if (!d || !Array.isArray(d.plugins)) return;
    d.plugins.forEach(p => {
      if (!CANONICAL_PLUGINS.includes(p.id)) {
        console.error(`❌ [4] Bundle ${bf}: unknown plugin id '${p.id}'. Must be one of: ${CANONICAL_PLUGINS.join(', ')}`);
        pluginIdErrors++;
      }
    });
  });
  if (pluginIdErrors === 0) {
    console.log('  ✅ [4] All plugin IDs in bundles match canonical plugin directories.');
  } else {
    errors += pluginIdErrors;
  }

  // Check 5: No duplicate plugin IDs within each bundle
  checks++;
  let dupErrors = 0;
  bundleFiles.forEach(bf => {
    const d = bundleData[bf];
    if (!d || !Array.isArray(d.plugins)) return;
    const seen = new Set();
    d.plugins.forEach(p => {
      if (seen.has(p.id)) {
        console.error(`❌ [5] Bundle ${bf}: duplicate plugin id '${p.id}'`);
        dupErrors++;
      }
      seen.add(p.id);
    });
  });
  if (dupErrors === 0) {
    console.log('  ✅ [5] No duplicate plugin IDs within any bundle.');
  } else {
    errors += dupErrors;
  }

  // Check 6: full-business-suite covers all 6 canonical plugins
  checks++;
  const fullSuite = bundleData[EXPECTED_FULL_SUITE_BUNDLE];
  if (fullSuite && Array.isArray(fullSuite.plugins)) {
    const suitePluginIds = fullSuite.plugins.map(p => p.id).sort();
    const missingPlugins = CANONICAL_PLUGINS.filter(p => !suitePluginIds.includes(p));
    if (missingPlugins.length > 0) {
      console.error(`❌ [6] full-business-suite missing plugins: ${missingPlugins.join(', ')}`);
      errors++;
    } else {
      console.log('  ✅ [6] full-business-suite covers all 6 canonical plugins.');
    }
  }

  // Check 7: full-business-suite totals match canonical metadata
  checks++;
  if (fullSuite && fullSuite.totals) {
    const t = fullSuite.totals;
    if (t.plugins !== metadata.plugins || t.skills !== metadata.skills || t.engines !== metadata.engines) {
      console.error(`❌ [7] full-business-suite totals mismatch: suite(${t.plugins}/${t.skills}/${t.engines}) vs metadata(${metadata.plugins}/${metadata.skills}/${metadata.engines})`);
      errors++;
    } else {
      console.log(`  ✅ [7] full-business-suite totals match canonical metadata (${t.plugins} plugins / ${t.skills} skills / ${t.engines} engines).`);
    }
  }

  // Check 8: Unique capability IDs across full suite (no collision in registry)
  checks++;
  const capIds = capabilities.capabilities.map(c => c.id);
  const capIdSet = new Set(capIds);
  if (capIdSet.size !== capIds.length) {
    const dupes = capIds.filter((id, idx) => capIds.indexOf(id) !== idx);
    console.error(`❌ [8] Duplicate capability IDs detected: ${dupes.join(', ')}`);
    errors++;
  } else {
    console.log(`  ✅ [8] All ${capIds.length} capability IDs are globally unique (no collision).`);
  }

  // Check 9: Capabilities have canonical_id in domain.skill-id format
  checks++;
  let canonicalIdErrors = 0;
  capabilities.capabilities.forEach(c => {
    if (!c.canonical_id) {
      console.error(`❌ [9] Capability '${c.id}' missing canonical_id (expected format: domain.skill-id)`);
      canonicalIdErrors++;
    } else {
      const parts = c.canonical_id.split('.');
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        console.error(`❌ [9] Capability '${c.id}' canonical_id '${c.canonical_id}' not in domain.skill-id format`);
        canonicalIdErrors++;
      }
    }
  });
  if (canonicalIdErrors === 0) {
    console.log(`  ✅ [9] All ${capabilities.capabilities.length} capabilities have domain-namespaced canonical IDs.`);
  } else {
    errors += canonicalIdErrors;
  }

  // Check 10: Suite bundle versions match repository version
  checks++;
  let versionErrors = 0;
  const repoVersion = metadata.version;
  bundleFiles.forEach(bf => {
    const d = bundleData[bf];
    if (!d) return;
    if (d.version !== repoVersion) {
      console.error(`❌ [10] Bundle ${bf} version '${d.version}' != repository version '${repoVersion}'`);
      versionErrors++;
    }
    if (Array.isArray(d.plugins)) {
      d.plugins.forEach(p => {
        if (p.version && p.version !== repoVersion) {
          console.error(`❌ [10] Bundle ${bf} plugin '${p.id}' version '${p.version}' != repository version '${repoVersion}'`);
          versionErrors++;
        }
      });
    }
  });
  if (versionErrors === 0) {
    console.log(`  ✅ [10] All bundle versions aligned to repository version v${repoVersion} (lockstep).`);
  } else {
    errors += versionErrors;
  }

  // Check 11: Internal arithmetic consistency — sum(plugin.skills) == totals.skills per bundle
  checks++;
  let arithmeticErrors = 0;
  bundleFiles.forEach(bf => {
    const d = bundleData[bf];
    if (!d || !Array.isArray(d.plugins) || !d.totals) return;
    const sum = d.plugins.reduce((acc, p) => acc + (Number(p.skills) || 0), 0);
    if (sum !== d.totals.skills) {
      console.error(`❌ [11] Bundle ${bf}: sum(plugin.skills)=${sum} != totals.skills=${d.totals.skills}`);
      arithmeticErrors++;
    }
  });
  if (arithmeticErrors === 0) {
    console.log('  ✅ [11] All bundle skill counts internally consistent (sum(plugin.skills) == totals.skills).');
  } else {
    errors += arithmeticErrors;
  }

  // Check 12: Profile-to-registry exact membership — per-plugin counts AND skill sets match actual registry
  checks++;
  let membershipErrors = 0;
  const skillsByPlugin = {};
  registry.skills.forEach(s => {
    (skillsByPlugin[s.plugin] = skillsByPlugin[s.plugin] || []).push(s.id);
  });
  bundleFiles.forEach(bf => {
    const d = bundleData[bf];
    if (!d || !Array.isArray(d.plugins)) return;
    d.plugins.forEach(p => {
      const actual = skillsByPlugin[p.id] || [];
      // count alignment
      if (actual.length !== (Number(p.skills) || 0)) {
        console.error(`❌ [12] Bundle ${bf} plugin '${p.id}': declared skills=${p.skills}, actual registry count=${actual.length}`);
        membershipErrors++;
      }
    });
    // per-profile totals must equal the union of member plugin actual counts
    const unionCount = d.plugins.reduce((acc, p) => acc + (skillsByPlugin[p.id] || []).length, 0);
    if (unionCount !== d.totals.skills) {
      console.error(`❌ [12] Bundle ${bf}: registry union skill count=${unionCount} != totals.skills=${d.totals.skills}`);
      membershipErrors++;
    }
  });
  if (membershipErrors === 0) {
    console.log(`  ✅ [12] All ${bundleFiles.length} bundle profiles exactly match registry skill counts (profile membership verified).`);
  } else {
    errors += membershipErrors;
  }

  // Summary
  console.log('\n---------------------------------------------------');
  if (errors > 0) {
    console.error(`❌ Suite Validation Failed with ${errors} error(s). (${checks - (errors > 0 ? 1 : 0)}/${checks} checks passed)`);
    process.exit(1);
  } else {
    console.log(`✅ Suite Validation PASSED. All ${checks} integrity checks passed.`);
  }
}

validateSuite();
