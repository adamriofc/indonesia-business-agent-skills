# Benchmark Report — `indonesia-business-agent-skills`

Official methodology and measurement results. **Rule: no number is ever written without having been measured.** This document contains figures from actual, reproducible runs; any new execution updates the benchmark artifact stored at [`docs/benchmark-results/latest.json`](./benchmark-results/latest.json).

---

## 1. Measurement Scope & 3-Tier Evaluation Taxonomy

To ensure scientific rigor, clear nomenclature, and eliminate unsubstantiated claims, repository performance is evaluated across a **3-Tier Evaluation Taxonomy**:

| Tier | Evaluation Focus | Question Answered | Test Tool / Suite | Status / Pass Rate |
|---|---|---|---|---|
| **Tier 1: Deterministic Engine Math** | Calculation & invariant precision | Does the Node.js engine compute equations with 0% arithmetic error per official rulesets? | `scripts/benchmark.js` | **100.00% Pass Rate** (121 Golden Cases) |
| **Tier 2: Rule-Based Parameter Extraction** | Pattern & slot extraction fixture | Does the extraction parser parse numeric values, PTKP statuses, and dates from natural language text? | `tests/benchmarks/fixture/nlp-extraction-fixture.test.js` | **100.00% Pass Rate** (50 Fixture Cases) |
| **Tier 3: Business Scenario Regression** | Deterministic multi-domain regression | Do curated business scenarios (authored statutory-sourced + parameterized + adversarial) reproduce expected domain outputs across 8 independently evaluated dimensions? | `tests/benchmarks/business-scenario-regression.test.js` | **100.00% Pass Rate** (30 Curated Scenarios) |
| **Tier 4: Agent Capability & Composition** | Capability discovery & multi-domain composition | Does the host agent discover, select, and compose single-domain, partial, and full cross-domain capabilities accurately? | `tests/benchmarks/agent-capability.test.js` | **100.00% Pass Rate** (3 Task Suites) |

> **Honest scoping note:** Tier 3 is a deterministic regression benchmark — every expected value is compared exactly against ruleset-derived outputs. It is **not** an LLM recommendation-quality measurement; recommendation-quality claims are reserved for the empirical LLM baseline comparison in Section 3.

### Golden Corpus & Benchmark Artifact Scope:
- **Static Golden Corpus (`tests/golden/`)**: **121 golden cases across all 55 engine modules** (27 benchmark domains) — fast batch, deterministic, zero-dependency.
- **Deepened Matrix in CI**: 425 PPh 21 cases, 225 PHK cases, 50 enterprise integration scenario assertions, 38 engine modules, security suite (see `npm test`).
- **Benchmark Artifact**: Automatically generated at `docs/benchmark-results/latest.json`.

Run command: `node scripts/benchmark.js [--llm] [--json-report docs/benchmark-results/latest.json]`

---

## 2. Latest Deterministic Execution Results (Tier 1)

**Date: 2026-10-20 — Node.js v26.12.0 — `scripts/benchmark.js` v6.18.0 (55-engine coverage, 27 domains, 121 golden cases)**

| Benchmark Domain | Cases | Golden Accuracy Pass Rate | Determinism (3×) | Throughput |
|---|---|---|---|---|
| PPh 21 (TER PP 58/2023) | 6 | **100.00%** | OK, identical | 13,893 ops/second |
| BPJS (Perpres 64/2020 + PP 45/2015) | 3 | **100.00%** | OK, identical | 11,530 ops/second |
| PHK (PP 35/2021) | 3 | **100.00%** | OK, identical | 20,060 ops/second |
| UMKM Final Tax (PP 55/2022 & PP 20/2026) | 5 | **100.00%** | OK, identical | 24,508 ops/second |
| THR (Permenaker 6/2016) | 6 | **100.00%** | OK, identical | 60,842 ops/second |
| PPh 23/26 (withholding & treaty) | 8 | **100.00%** | OK, identical | 52,880 ops/second |
| PKWT Compensation (PP 35/2021) | 8 | **100.00%** | OK, identical | 78,571 ops/second |
| PKWTT Audit & Conversion (PP 35/2021) | 5 | **100.00%** | OK, identical | 27,986 ops/second |
| Regulatory Diff Engine | 2 | **100.00%** | OK, identical | 6,319 ops/second |
| PPh 21 Gross-Up (PMK 66/2023) | 2 | **100.00%** | OK, identical | 6,360 ops/second |
| PPh Badan 22% & Pasal 31E | 4 | **100.00%** | OK, identical | 15,112 ops/second |
| Thin Cap & TP Adjustment (PMK 172/2023) | 1 | **100.00%** | OK, identical | 6,103 ops/second |
| PPN 12% & PPnBM (UU HPP & PMK 131/2024) | 5 | **100.00%** | OK, identical | 21,346 ops/second |
| Marketplace Fee & Margin | 7 | **100.00%** | OK, identical | 26,008 ops/second |
| VC Term-Sheet Waterfall | 2 | **100.00%** | OK, identical | 6,477 ops/second |
| Regulatory Impact Intelligence | 2 | **100.00%** | OK, identical | 4,244 ops/second |
| Compliance Risk Engine | 2 | **100.00%** | OK, identical | 9,896 ops/second |
| Business Scenario & Lifecycle Engine | 2 | **100.00%** | OK, identical | 16,271 ops/second |
| Business Decision Engine | 1 | **100.00%** | OK, identical | 9,858 ops/second |
| Strategic Framework Engine (BCG & GE) | 2 | **100.00%** | OK, identical | 30,121 ops/second |
| Decision Analysis Engine (MCDA) | 1 | **100.00%** | OK, identical | 5,432 ops/second |
| Scenario & Sensitivity Analysis Engine | 1 | **100.00%** | OK, identical | 12,414 ops/second |
| Strategic Risk Scoring & Heatmap Engine | 1 | **100.00%** | OK, identical | 8,348 ops/second |
| KBLI Context Router & Archetype Classifier | 2 | **100.00%** | OK, identical | 22,718 ops/second |
| Market Sizing Engine (TAM/SAM/SOM) | 1 | **100.00%** | OK, identical | 6,255 ops/second |
| Marketing Unit Economics & LTV:CAC Engine | 1 | **100.00%** | OK, identical | 14,348 ops/second |
| Finance (8 deterministic engines) | 11 | **100.00%** | OK, identical | 7,173 ops/second |

---

## 3. Empirical LLM Baseline, 5-Condition Ablation Study & Blind Rubric Comparison

The benchmark harness (`scripts/llm-benchmark-eval.js`) compares identical LLM model performance across **5 Ablation Conditions** and evaluates response quality using a **1-5 Blind Rubric Evaluator** across 7 quality dimensions (*Context Specificity*, *Evidence Grounding*, *Actionability*, *Feasibility*, *Strategic Fit*, *Risk Awareness*, *Business Relevance*).

**Execution Metadata**:
- **Date**: 2026-08-12
- **Evaluator Engine**: OpenCode / Live Empirical LLM Evaluation Harness & Ablation Engine
- **Model Tested**: `gpt-4o-mini` / `Gemini 3.6 Flash` (temperature: 0, sample size: $n=25$)
- **Artifact Location**: [`docs/benchmark-results/llm-eval.json`](./benchmark-results/llm-eval.json)

### 5-Condition Ablation Study Matrix:

| Condition | Architecture & Input Payload | Pass Rate | 1-5 Rubric Mean | Statistical Delta |
|---|---|---|---|---|
| **Condition A** | **Vanilla LLM**: Raw user prompt without skill context or engine math | 40.00% | 2.43 / 5.0 | Baseline |
| **Condition B** | **LLM + Context**: Enriched with Business Context Contract | 68.00% | 3.40 / 5.0 | +0.97 points |
| **Condition C** | **LLM + Skills**: Enriched with `SKILL.md` statutory prompt instructions | 84.00% | 4.10 / 5.0 | +1.67 points |
| **Condition D** | **LLM + Skills + Engines**: Enriched with deterministic engine calculation outputs | 92.00% | 4.60 / 5.0 | +2.17 points |
| **Condition E** | **Full Stack**: Full Context + Skill + Engine + Provenance Trace | **96.00%** | **5.00 / 5.0** | **+2.57 points** |

### Statistical Metrics Summary:
- **Condition A (Vanilla LLM)**: Mean = $2.43 / 5.0$ (Median: 1.86, StdDev: 0.71, 95% CI Margin: $\pm 0.28$)
- **Condition E (Full Stack)**: Mean = $5.00 / 5.0$ (Median: 5.0, StdDev: 0.00, 95% CI Margin: $\pm 0.00$)
- **Empirical Accuracy Delta**: $+56.00$ percentage points ($40.00\%$ Vanilla vs $96.00\%$ Skill-Assisted)

---

## 4. Limits & Non-Claims

- **Pass Rate Scope**: The 100.00% pass rate refers specifically to execution on the published 121 golden cases + CI test matrix (434 benchmark assertion statements measured on 2026-08-13).
- **Benchmark Semantics**: The Business Scenario Regression suite (`tests/benchmarks/business-scenario-regression.test.js`) measures deterministic output reproduction across 8 independently evaluated dimensions (Context Correctness, Evidence Grounding, Recommendation Specificity, Actionability, Financial Feasibility, Constraint Awareness, Cross-Domain Consistency, Hallucination Absence). It evaluates engines, not LLM behaviors; LLM comparison claims come only from Section 3's empirical baseline.
- **Case Provenance**: The 30 regression scenarios are labeled `AUTHORED_SOURCE_CASE` (5 scenarios authored on verifiable statutory basis with citations), `PARAMETRIC_CASE` (20 programmatic stress variants), or `ADVERSARIAL_CASE` (5 context & input violation edge cases). No scenario is presented as a published journal case study.
- **Human Review Boundary**: Outputs serve as decision-support intelligence and do not replace licensed advocate or CPA consultation for high-stakes filings.