# Scope of Truth & Metadata Metrics (`docs/METRICS.md`)

Official measurement definitions and exact metrics for `indonesian-business-agent-skills`.

> **Single Source of Truth File**: [`canonical-metadata.json`](../canonical-metadata.json)  
> **Last Generated**: 2026-10-21T13:32:43.641Z  
> **Generator Command**: `npm run generate:metadata`

---

## 1. Measured Metrics Summary

| Metric Name | Value | Exact Definition & Measurement Source |
|---|---|---|
| **Repository Version** | `v6.18.0` | SemVer string in `package.json`, `package-lock.json`, and `registry/index.json` |
| **Canonical Plugins** | `6` | Plugin directories containing `.claude-plugin/plugin.json` (`legal-id`, `tax-id`, `hr-id`, `finance-id`, `marketing-id`, `strategic-id`) |
| **Agent Skills** | `88` | Total `SKILL.md` files registered across the 6 canonical plugins |
| **Deterministic Engines** | `55` | Pure Node.js calculation & regulatory diff engine modules in `engines/*.js` |
| **Golden Cases** | `121` | Static golden test cases across `27` domain files in `tests/golden/*.json` |
| **Benchmark Domains** | `27` | Domain JSON files in `tests/golden/` evaluated by `scripts/benchmark.js` |
| **Benchmark Assertions** | `434` | Explicit assertion statements in `tests/benchmarks/` (`business-scenario-regression.test.js`, `nlp-extraction-fixture.test.js`, `cross-domain-synthetic.test.js`) |
| **Total Test Assertions** | `741+` | Total explicit `assert.*` calls across all test files executed by `npm test` |

---

## 2. Distinction Between Assertion Metrics

To eliminate documentation drift and ambiguity:
- **Benchmark Assertions (`434`)**: Refers strictly to explicit assertions within the 3 benchmark suites in `tests/benchmarks/`.
- **Total Repository Test Assertions (`741+`)**: Refers to assertions executed across unit, matrix, integration, security, and benchmark suites in `npm test`.

---

## 3. Supported Node.js Runtimes

- **Node.js 20**: Minimum Supported Version
- **Node.js 22**: LTS (Recommended)
- **Node.js 24**: Current Tested Version

---

## 4. Repository Documentation Architecture Tree

```text
README.md (What / Why / Overview)
  ├── ARCHITECTURE.md (How it works & engine isolation)
  ├── DESIGN_PRINCIPLES.md (Why design choices were made)
  ├── BENCHMARK.md (How measurement works & 3-Tier taxonomy)
  ├── PROVENANCE.md (Where statutory rules come from)
  ├── PRODUCTION_READINESS.md (Readiness levels & human review matrix)
  ├── RELEASE.md (How releases are verified & 13-check gate)
  ├── METRICS.md (Single source of truth metrics & definitions)
  └── OPERATIONAL_RUNBOOK.md (Incident handling & emergency procedures)
```

---

*This document is automatically updated by `npm run generate:metadata`. Do not edit manual figures here.*
