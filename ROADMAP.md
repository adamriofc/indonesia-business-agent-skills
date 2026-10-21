# Roadmap

Status legend: `[x]` shipped · `[→]` active hardening / validation · `[ ]` future-gated.

## Current State — v6.11.3

The repository is currently in **stabilization & evidence mode**. The six canonical business-domain plugins and the existing reasoning substrate are intentionally feature-stable. The priority is correctness, documentation integrity, release governance, independent validation, and distribution — not horizontal feature expansion.

### Shipped capabilities

- [x] **6 canonical plugins / 88 Agent Skills** — `legal-id`, `tax-id`, `hr-id`, `finance-id`, `marketing-id`, `strategic-id`.
- [x] **39 deterministic engines** with zero third-party runtime dependencies.
- [x] **Semantic Business Context** — entity, KBLI/activity, Product Context, facts, relations, constraints, objectives, and decision options.
- [x] **Business Archetype routing** — `PRODUCT_MANUFACTURING`, `PROFESSIONAL_SERVICE`, `CAPACITY_SERVICE`, `MARKETPLACE_PLATFORM`, `HYBRID`.
- [x] **Product Context / BTKI layer** — curated BTKI 2022 commodity classification, temporal resolution, tariff/tax separation, Lartas governance, classification evidence, and fail-closed ambiguity handling.
- [x] **Regulatory temporal rulesets & provenance** — effective windows, lifecycle states, SHA-256 integrity, and auditable source register.
- [x] **Cross-domain deterministic reasoning** — legal, tax, HR, finance, marketing, and strategic engines consuming shared context.
- [x] **121 golden cases / 27 benchmark domains / 424 benchmark assertions** plus cross-engine invariants.
- [x] **Apples-to-apples LLM evaluation harness** with 5-condition ablation and blind rubric methodology.
- [x] **Production governance L3** — Production Decision-Support with explicit human-review boundaries.
- [x] **Release engineering** — SSOT metadata, benchmark artifacts, SHA-256 verification, dependency audit, package smoke test, performance gate, documentation validation, and automated release gate.

## Active Hardening & Validation

- [→] **Documentation integrity** — validate current-state metrics and architecture claims across README, Skill Protocol, Roadmap, Benchmark, Metrics, Release, and governance documents, including fenced code blocks and historical-vs-current section boundaries.
- [→] **External domain validation** — obtain independent review from Indonesian tax, employment-law, accounting, and/or business practitioners using cases they supply or approve. Results will be published with scope, reviewer identity (where permission is granted), methodology, and limitations.
- [→] **Community / maintainer continuity** — maintain an explicit hand-off runbook for ruleset ownership, incident response, and release recovery; pursue a trusted co-maintainer only when a suitable person is actually available.
- [→] **Empirical LLM benchmark publication** — run the same model on the same held-out business cases with Vanilla vs Context vs Skills vs Engines vs Full Stack conditions and publish reproducible results.
- [→] **Release governance** — treat normal releases as deliberate stabilization checkpoints. Emergency security or statutory corrections are the only exceptions to an accelerated release cadence.

## Future-Gated (Do Not Expand Scope Prematurely)

- [ ] **Regional derivatives** — Malaysia, Singapore, Philippines only after Indonesian core has meaningful external validation and documented demand.
- [ ] **Ruleset lifecycle promotion tooling** — scripted `DRAFT → VERIFIED → RELEASED` promotion after governance evidence is mature enough to justify automation.
- [ ] **Ruleset UI / diff tooling** — human-readable effective-window diffs and changelog generation when maintenance volume justifies it.
- [ ] **Plugin registry sync automation** — publish automation only when external contributor/adoption volume makes manual publishing a bottleneck.
- [ ] **Future Indonesian regulatory versions** — add new statutory rulesets only when an official source and effective-date evidence exist.

## Explicit Non-Goals / Feature Boundary

The roadmap intentionally does **not** add new top-level business plugins such as `operations-id`, `branding-id`, `payroll-id`, `customer-id`, or `transaction-id` merely for completeness. Product Context is a shared semantic primitive, not a new top-level plugin. The repository is also not intended to become a customs/INSW filing platform, ERP, vector database, graph database, custom agent runtime, MCP/A2A orchestration platform, or licensed tax/legal filing product.

## Historical Release Milestones

The repository's early releases are retained as history, not as the current roadmap. Major milestones include:

- **v1.x** — foundational hybrid LLM + deterministic engine architecture, provenance, security, CI, and initial plugins.
- **v2.x** — finance domain, rebrand to `indonesia-business-agent-skills`, and expanded provenance/benchmarking.
- **v6.5.x** — release gate, canonical metadata, and documentation SSOT.
- **v6.6.x** — empirical LLM evaluation harness, ablation study, blind rubric, and statistics.
- **v6.7.x** — production-readiness model and operational governance stabilization checkpoint.
- **v6.8.x** — expanded golden corpus, cross-engine invariants, and release trace manifest.
- **v6.9.x–v6.11.2** — Product Context / BTKI, fail-closed classification, tax-treatment semantics, semantic context normalization, release provenance hardening, and CodeQL remediation.

> **Governance note:** the v6.7 "feature freeze" announcement should be understood as a **stabilization checkpoint**: no redundant horizontal expansion. Later Product Context work was an explicit closure of a documented ontology gap, not a change of product direction. Current policy is: do not expand capability surface unless the change closes a verified architectural gap or a high-severity correctness/security issue.
