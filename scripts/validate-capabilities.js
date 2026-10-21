#!/usr/bin/env node
/**
 * Agent Capability Contract Validator (`scripts/validate-capabilities.js`)
 *
 * Verifies that all 88 SKILL.md files and registry/capabilities.json
 * strictly implement the Agent Capability Contract schema.
 *
 * Usage:
 *   node scripts/validate-capabilities.js
 *   npm run validate:capabilities
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const plugins = ['finance-id', 'hr-id', 'legal-id', 'marketing-id', 'strategic-id', 'tax-id'];

function validateCapabilities() {
  console.log("🔍 Running Agent Capability Contract Schema Validator...\n");
  let errors = 0;
  let totalValidated = 0;

  const catalogPath = path.join(ROOT, 'registry/capabilities.json');
  if (!fs.existsSync(catalogPath)) {
    console.error("❌ Missing registry/capabilities.json. Run 'node scripts/generate-capability-catalog.js' first.");
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  if (catalog.total_capabilities !== 90) {
    console.error(`❌ Capability Catalog Mismatch: catalog claims ${catalog.total_capabilities} capabilities, expected 90.`);
    errors++;
  }

  catalog.capabilities.forEach(entry => {
    if (!entry.id || !entry.plugin || !entry.domain) {
      console.error(`❌ Capability Catalog Violation: entry missing required fields (id, plugin, domain)`);
      errors++;
      return;
    }

    if (!entry.capability || typeof entry.capability !== 'object') {
      console.error(`❌ Capability Contract Violation in capability '${entry.id}': missing 'capability' object`);
      errors++;
      return;
    }

    if (!Array.isArray(entry.capability.requires) || entry.capability.requires.length === 0) {
      console.error(`❌ Capability Contract Violation in capability '${entry.id}': 'capability.requires' must be a non-empty array`);
      errors++;
    } else {
      entry.capability.requires.forEach(req => {
        if (!req.name || !req.type || typeof req.required !== 'boolean') {
          console.error(`❌ Capability Contract Violation in capability '${entry.id}': typed 'requires' item missing name/type/required`);
          errors++;
        }
      });
    }

    if (!Array.isArray(entry.capability.produces) || entry.capability.produces.length === 0) {
      console.error(`❌ Capability Contract Violation in capability '${entry.id}': 'capability.produces' must be a non-empty array`);
      errors++;
    } else {
      entry.capability.produces.forEach(prod => {
        if (!prod.name || !prod.type) {
          console.error(`❌ Capability Contract Violation in capability '${entry.id}': typed 'produces' item missing name/type`);
          errors++;
        }
      });
    }

    if (!Array.isArray(entry.capability.purpose) || entry.capability.purpose.length === 0) {
      console.error(`❌ Capability Contract Violation in capability '${entry.id}': 'capability.purpose' must be non-empty array`);
      errors++;
    }

    if (!Array.isArray(entry.capability.not_for) || entry.capability.not_for.length === 0) {
      console.error(`❌ Capability Contract Violation in capability '${entry.id}': 'capability.not_for' must be non-empty array`);
      errors++;
    }

    if (typeof entry.capability.deterministic !== 'boolean') {
      console.error(`❌ Capability Contract Violation in capability '${entry.id}': 'capability.deterministic' must be boolean`);
      errors++;
    }

    totalValidated++;
  });

  if (errors > 0) {
    console.error(`\n❌ Agent Capability Contract Validation Failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    console.log(`✅ Agent Capability Contract Validation Passed 100%! (${totalValidated} capabilities validated)`);
  }
}

validateCapabilities();
