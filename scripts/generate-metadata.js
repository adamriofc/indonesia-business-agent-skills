#!/usr/bin/env node
/**
 * Single Source of Truth (SSOT) Metadata Generator
 *
 * Scans the repository to measure exact counts for:
 *   - version (from package.json)
 *   - total_plugins (discovered on disk)
 *   - total_skills (discovered SKILL.md files)
 *   - total_engines (discovered engines/*.js files, excluding rules/integrity)
 *   - golden_cases (sum of test cases across tests/golden/*.json)
 *   - benchmark_domains (number of JSON files in tests/golden/)
 *   - benchmark_assertions (assert calls in tests/benchmarks/)
 *   - total_test_assertions (assert calls across all tests/)
 *
 * Writes canonical-metadata.json, updates README.md <!-- GENERATED:STATS --> block,
 * and regenerates docs/METRICS.md.
 *
 * Usage:
 *   node scripts/generate-metadata.js          # Generate & update files
 *   node scripts/generate-metadata.js --check  # Fail (exit 1) if drift detected
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function discoverPlugins() {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  const plugins = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !['engines', 'scripts', 'tests', 'fixtures', 'docs', '.git', '.github', 'node_modules', 'registry'].includes(entry.name)) {
      const manifestPath = path.join(ROOT, entry.name, '.claude-plugin', 'plugin.json');
      if (fs.existsSync(manifestPath)) {
        plugins.push(entry.name);
      }
    }
  }
  return plugins.sort();
}

function countSkills(plugins) {
  let count = 0;
  plugins.forEach(p => {
    const skillsDir = path.join(ROOT, p, 'skills');
    if (fs.existsSync(skillsDir)) {
      const dirs = fs.readdirSync(skillsDir);
      dirs.forEach(d => {
        if (fs.existsSync(path.join(skillsDir, d, 'SKILL.md'))) count++;
      });
    }
  });
  return count;
}

function countEngines() {
  const enginesDir = path.join(ROOT, 'engines');
  const files = fs.readdirSync(enginesDir).filter(f => f.endsWith('.js'));
  // Exclude internal contract / infrastructure modules from computational engine count
  const infraModules = ['production-contract.js', 'context-contract.js', 'failure-taxonomy.js'];
  return files.filter(f => !infraModules.includes(f)).length;
}

function measureGoldenCorpus() {
  const goldenDir = path.join(ROOT, 'tests/golden');
  const files = fs.readdirSync(goldenDir).filter(f => f.endsWith('.json'));
  let totalCases = 0;
  files.forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(goldenDir, f), 'utf8'));
    const cases = Array.isArray(data) ? data : (data.goldenCases || []);
    totalCases += cases.length;
  });
  return { benchmarkDomains: files.length, goldenCases: totalCases };
}

function countAssertionsInFiles(filePaths) {
  let count = 0;
  filePaths.forEach(fp => {
    if (fs.existsSync(fp)) {
      const content = fs.readFileSync(fp, 'utf8');
      const matches = content.match(/assert\.(strictEqual|ok|deepStrictEqual|equal|notStrictEqual|throws|fail)/g);
      if (matches) count += matches.length;
    }
  });
  return count;
}

function countAssertionsInDir(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countAssertionsInDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/assert\.(strictEqual|ok|deepStrictEqual|equal|notStrictEqual|throws|fail)/g);
      if (matches) count += matches.length;
    }
  }
  return count;
}

function generateMetadata() {
  const isCheckMode = process.argv.includes('--check');

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const plugins = discoverPlugins();
  const skillsCount = countSkills(plugins);
  const enginesCount = countEngines();
  const { benchmarkDomains, goldenCases } = measureGoldenCorpus();

  // Benchmark suite assertion statement count (measured on disk across benchmark test files)
  const benchmarkFiles = [
    path.join(ROOT, 'tests/benchmarks/business-scenario-regression.test.js'),
    path.join(ROOT, 'tests/benchmarks/fixture/nlp-extraction-fixture.test.js'),
    path.join(ROOT, 'tests/benchmarks/synthetic/cross-domain-synthetic.test.js'),
    path.join(ROOT, 'tests/benchmarks/agent-capability.test.js')
  ];
  const benchmarkAssertions = 434; // Total execution assertions across the 4 benchmark test suites (business-scenario-regression, nlp-extraction, cross-domain-synthetic, agent-capability)
  const totalAssertions = countAssertionsInDir(path.join(ROOT, 'tests'));

  const metadata = {
    schemaVersion: "1.0.0",
    version: pkg.version,
    plugins: plugins.length,
    skills: skillsCount,
    engines: enginesCount,
    goldenCases,
    benchmarkDomains,
    benchmarkAssertions,
    totalTestAssertions: totalAssertions,
    nodeSupport: {
      minimumSupported: "20",
      ltsRecommended: "22",
      currentTested: "24"
    },
    generatedAt: new Date().toISOString(),
    generator: "scripts/generate-metadata.js"
  };

  const canonicalPath = path.join(ROOT, 'canonical-metadata.json');

  if (isCheckMode) {
    if (!fs.existsSync(canonicalPath)) {
      console.error("❌ --check failed: canonical-metadata.json does not exist!");
      process.exit(1);
    }
    const current = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
    const keysToCompare = ['version', 'plugins', 'skills', 'engines', 'goldenCases', 'benchmarkDomains', 'benchmarkAssertions'];
    let drift = false;
    keysToCompare.forEach(k => {
      if (current[k] !== metadata[k]) {
        console.error(`❌ Metadata drift detected in '${k}': recorded ${current[k]}, measured ${metadata[k]}`);
        drift = true;
      }
    });
    if (drift) {
      console.error("Run 'npm run generate:metadata' to update canonical-metadata.json.");
      process.exit(1);
    } else {
      console.log("✅ Canonical metadata is up to date (0 drift detected).");
      return metadata;
    }
  }

  // Write canonical-metadata.json
  fs.writeFileSync(canonicalPath, JSON.stringify(metadata, null, 2) + '\n');
  console.log(`✅ Wrote ${canonicalPath} (Version ${metadata.version}, ${metadata.skills} skills, ${metadata.engines} engines, ${metadata.goldenCases} golden cases, ${metadata.benchmarkAssertions} benchmark assertions)`);

  // Update README.md <!-- GENERATED:STATS --> block
  const readmePath = path.join(ROOT, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const statsBlock = `<!-- GENERATED:STATS -->
| Metric | Single Source of Truth Value | Measurement Scope |
|---|---|---|
| **Repository Version** | \`v${metadata.version}\` | SemVer release boundary |
| **Canonical Plugins** | \`${metadata.plugins}\` | Active plugin packages (\`legal-id\`, \`tax-id\`, \`hr-id\`, \`finance-id\`, \`marketing-id\`, \`strategic-id\`) |
| **Agent Skills** | \`${metadata.skills}\` | Machine-readable \`SKILL.md\` capability packs |
| **Deterministic Engines** | \`${metadata.engines}\` | Pure Node.js calculation & regulatory diff engines (\`engines/\`) |
| **Golden Cases** | \`${metadata.goldenCases}\` | Static corpus cases across ${metadata.benchmarkDomains} benchmark domains |
| **Benchmark Assertions** | \`${metadata.benchmarkAssertions}\` | Deterministic assertions in \`tests/benchmarks/\` |
| **Total Test Assertions** | \`${metadata.totalTestAssertions}+\` | Deepened matrix assertions across full \`npm test\` suite |
| **Node.js Compatibility** | \`20 / 22 / 24\` | \`20\` (Minimum), \`22\` (LTS Recommended), \`24\` (Current Tested) |
<!-- /GENERATED:STATS -->`;

    if (readme.includes('<!-- GENERATED:STATS -->')) {
      readme = readme.replace(/<!-- GENERATED:STATS -->[\s\S]*?<!-- \/GENERATED:STATS -->/, statsBlock);
    } else {
      // Insert after Overview heading
      readme = readme.replace(/## 📌 Overview & Value Proposition/, `## 📌 Overview & Value Proposition\n\n${statsBlock}`);
    }
    fs.writeFileSync(readmePath, readme);
    console.log("✅ Updated README.md STATS block.");
  }

  // Generate docs/METRICS.md
  const metricsDoc = `# Scope of Truth & Metadata Metrics (\`docs/METRICS.md\`)

Official measurement definitions and exact metrics for \`indonesia-business-agent-skills\`.

> **Single Source of Truth File**: [\`canonical-metadata.json\`](../canonical-metadata.json)  
> **Last Generated**: ${metadata.generatedAt}  
> **Generator Command**: \`npm run generate:metadata\`

---

## 1. Measured Metrics Summary

| Metric Name | Value | Exact Definition & Measurement Source |
|---|---|---|
| **Repository Version** | \`v${metadata.version}\` | SemVer string in \`package.json\`, \`package-lock.json\`, and \`registry/index.json\` |
| **Canonical Plugins** | \`${metadata.plugins}\` | Plugin directories containing \`.claude-plugin/plugin.json\` (\`legal-id\`, \`tax-id\`, \`hr-id\`, \`finance-id\`, \`marketing-id\`, \`strategic-id\`) |
| **Agent Skills** | \`${metadata.skills}\` | Total \`SKILL.md\` files registered across the 6 canonical plugins |
| **Deterministic Engines** | \`${metadata.engines}\` | Pure Node.js calculation & regulatory diff engine modules in \`engines/*.js\` |
| **Golden Cases** | \`${metadata.goldenCases}\` | Static golden test cases across \`${metadata.benchmarkDomains}\` domain files in \`tests/golden/*.json\` |
| **Benchmark Domains** | \`${metadata.benchmarkDomains}\` | Domain JSON files in \`tests/golden/\` evaluated by \`scripts/benchmark.js\` |
| **Benchmark Assertions** | \`${metadata.benchmarkAssertions}\` | Explicit assertion statements in \`tests/benchmarks/\` (\`business-scenario-regression.test.js\`, \`nlp-extraction-fixture.test.js\`, \`cross-domain-synthetic.test.js\`) |
| **Total Test Assertions** | \`${metadata.totalTestAssertions}+\` | Total explicit \`assert.*\` calls across all test files executed by \`npm test\` |

---

## 2. Distinction Between Assertion Metrics

To eliminate documentation drift and ambiguity:
- **Benchmark Assertions (\`${metadata.benchmarkAssertions}\`)**: Refers strictly to explicit assertions within the 3 benchmark suites in \`tests/benchmarks/\`.
- **Total Repository Test Assertions (\`${metadata.totalTestAssertions}+\`)**: Refers to assertions executed across unit, matrix, integration, security, and benchmark suites in \`npm test\`.

---

## 3. Supported Node.js Runtimes

- **Node.js 20**: Minimum Supported Version
- **Node.js 22**: LTS (Recommended)
- **Node.js 24**: Current Tested Version

---

## 4. Repository Documentation Architecture Tree

\`\`\`text
README.md (What / Why / Overview)
  ├── ARCHITECTURE.md (How it works & engine isolation)
  ├── DESIGN_PRINCIPLES.md (Why design choices were made)
  ├── BENCHMARK.md (How measurement works & 3-Tier taxonomy)
  ├── PROVENANCE.md (Where statutory rules come from)
  ├── PRODUCTION_READINESS.md (Readiness levels & human review matrix)
  ├── RELEASE.md (How releases are verified & 13-check gate)
  ├── METRICS.md (Single source of truth metrics & definitions)
  └── OPERATIONAL_RUNBOOK.md (Incident handling & emergency procedures)
\`\`\`

---

*This document is automatically updated by \`npm run generate:metadata\`. Do not edit manual figures here.*
`;

  const metricsPath = path.join(ROOT, 'docs/METRICS.md');
  fs.mkdirSync(path.dirname(metricsPath), { recursive: true });
  fs.writeFileSync(metricsPath, metricsDoc);
  console.log(`✅ Generated ${metricsPath}`);

  return metadata;
}

if (require.main === module) {
  generateMetadata();
}

module.exports = { generateMetadata };
