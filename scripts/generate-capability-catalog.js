#!/usr/bin/env node
/**
 * Single Source of Truth (SSOT) Capability Catalog Generator (`scripts/generate-capability-catalog.js`)
 *
 * Scans all 88 SKILL.md files across the 6 canonical plugins and extracts
 * machine-readable Agent Capability Contracts into `registry/capabilities.json`.
 *
 * Usage:
 *   node scripts/generate-capability-catalog.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const plugins = ['finance-id', 'hr-id', 'legal-id', 'marketing-id', 'strategic-id', 'tax-id'];

function parseYamlFrontmatter(yamlStr) {
  const lines = yamlStr.split('\n');
  const result = {};
  let currentTopKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const isIndented = /^\s+/.test(line);

    if (isIndented && currentTopKey) {
      const trimmed = line.trim();
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const subKey = trimmed.slice(0, colonIdx).trim();
        const subVal = trimmed.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (typeof result[currentTopKey] !== 'object' || result[currentTopKey] === null) {
          result[currentTopKey] = {};
        }
        result[currentTopKey][subKey] = subVal;
      }
      continue;
    }

    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key) {
      currentTopKey = key;
      result[key] = value || {};
    }
  }

  return result;
}

function generateCapabilityCatalog() {
  console.log("⚙️ Generating Agent Capability Catalog (`registry/capabilities.json`)...\n");

  const catalog = [];
  let totalSkillsDiscovered = 0;

  plugins.forEach(pluginName => {
    const skillsDir = path.join(ROOT, pluginName, 'skills');
    if (!fs.existsSync(skillsDir)) return;

    const skillFolders = fs.readdirSync(skillsDir).sort();
    skillFolders.forEach(skillFolder => {
      const skillFile = path.join(skillsDir, skillFolder, 'SKILL.md');
      if (!fs.existsSync(skillFile)) return;

      const content = fs.readFileSync(skillFile, 'utf8');
      const parts = content.split('---');
      if (parts.length < 3) return;

      const fm = parseYamlFrontmatter(parts[1]);

      const domainName = pluginName.replace('-id', '');

      const registryPath = path.join(ROOT, 'registry/index.json');
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      const registryEntry = registry.skills.find(e => e.id === skillFolder);
      const capObj = (registryEntry && registryEntry.capability) || {};

      // Use typed requires/produces from registry/index.json (SSOT — already patched with correct typed schema)
      const typedRequires = Array.isArray(capObj.requires) && capObj.requires.length > 0
        ? capObj.requires
        : [{ name: 'input', type: 'string', required: true }];

      const typedProduces = Array.isArray(capObj.produces) && capObj.produces.length > 0
        ? capObj.produces
        : [{ name: 'output', type: 'string' }];

      const purposeNames = Array.isArray(capObj.purpose) && capObj.purpose.length > 0
        ? capObj.purpose
        : (typeof fm.capability === 'object' && fm.capability.purpose
            ? String(fm.capability.purpose).replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean)
            : [domainName + '_procedure']);

      const notForNames = Array.isArray(capObj.not_for) && capObj.not_for.length > 0
        ? capObj.not_for
        : (typeof fm.capability === 'object' && fm.capability.not_for
            ? String(fm.capability.not_for).replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean)
            : ['autonomous_filing']);

      const consumesNames = Array.isArray(capObj.consumes) && capObj.consumes.length > 0
        ? capObj.consumes
        : (typeof fm.capability === 'object' && fm.capability.consumes
            ? String(fm.capability.consumes).replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean)
            : ['context.entity']);

      const capabilityEntry = {
        id: fm.name || skillFolder,
        skillName: fm.name || skillFolder,
        plugin: pluginName,
        domain: domainName,
        description: fm.description || '',
        risk_level: fm.risk_level || 'medium',
        rule_type: fm.rule_type || 'statutory',
        quality_tier: fm.quality_tier || 'tested',
        capability: {
          purpose: purposeNames,
          not_for: notForNames,
          requires: typedRequires,
          produces: typedProduces,
          consumes: consumesNames,
          deterministic: typeof fm.capability === 'object' && fm.capability.deterministic !== undefined ? String(fm.capability.deterministic) === 'true' : true,
          risk: { level: fm.risk_level || 'medium', human_review_required: (fm.risk_level === 'high' || fm.risk_level === 'critical') },
          cross_domain_relevance: typeof fm.capability === 'object' && fm.capability.cross_domain_relevance ? fm.capability.cross_domain_relevance : {}
        }
      };

      catalog.push(capabilityEntry);
      totalSkillsDiscovered++;
    });
  });

  const catalogData = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    repository: "https://github.com/adamriofc/indonesia-business-agent-skills",
    total_capabilities: totalSkillsDiscovered,
    capabilities: catalog
  };

  const catalogPath = path.join(ROOT, 'registry/capabilities.json');
  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2) + '\n');

  console.log(`✅ Generated ${catalogPath} (${totalSkillsDiscovered} registered agent capabilities)`);
}

generateCapabilityCatalog();
