# Changelog

All notable changes to this project are documented here in reverse chronological order. Regulatory/statutory changes are additionally tracked per-rule in [REGULATORY_CHANGELOG.md](./REGULATORY_CHANGELOG.md); provenance of every rule in [PROVENANCE.md](./PROVENANCE.md); release cadence in [REGULATORY_PIPELINE.md](./REGULATORY_PIPELINE.md).

## [6.19.0] - 2026-10-22

### Apex Strategic Expansion: Quantitative SWOT/TOWS Matrix & Balanced Scorecard (BSC)

- **P0 — Quantitative SWOT & TOWS Matrix Calculation Engine (`engines/quantitative-swot-engine.js`)**: Implemented deterministic Internal Factor Evaluation (IFE) and External Factor Evaluation (EFE) matrix weighting with strict invariant enforcement ($\sum W_{internal} \equiv 1.0, \sum W_{external} \equiv 1.0$), strategic vector coordinates ($\Delta X, \Delta Y$), mathematical quadrant mapping (Aggressive, Diversification, Turnaround, Defensive), and TOWS cross-impact interaction ranking per Fred R. David and IE Matrix methodology.
- **P0 — Deterministic Balanced Scorecard (BSC) Engine (`engines/balanced-scorecard-engine.js`)**: Implemented multi-perspective scorecard calculation with dual sector models (Private Commercial vs Public/Government/BUMN per KMK No. 467/KMK.01/2014 & KMK No. 590/KMK.01/2016), Min/Max polarity mapping, statutory 120% cap ratio enforcement, and Strategy Map causal broken-link anomaly detection.
- **P0 — 2 New Agent Skills**: Delivered `strategic-id/skills/quantitative-swot/SKILL.md` and `strategic-id/skills/balanced-scorecard/SKILL.md`, expanding the total skill library from 88 to 90 skills, each protected with closed prompt injection delimiter boundaries.
- **P0 — 4-State Framework Applicability & Strategic Protocol**: Integrated `quantitative-swot` and `balanced-scorecard` into `engines/framework-applicability.js` and `engines/strategic-protocol.js`, binding them to KBLI 2020 5-digit codes and the 5 canonical business archetypes.
- **P0 — Root SDK & TypeScript Parity (`index.js` & `index.d.ts`)**: Exported `evaluateQuantitativeSwot` and `evaluateBalancedScorecard` on root SDK and `strategy` namespace, alongside comprehensive TypeScript declarations and interfaces.
- **P0 — Multi-Interface Uniformity (MCP, CLI & REST)**: Expanded MCP Server from 30 to 32 tools (`calc_quantitative_swot`, `calc_balanced_scorecard`), CLI from 40 to 42 commands (`calc swot`, `calc bsc`), and REST server from 45 to 47 endpoints (`/api/v1/strategy/quantitative-swot`, `/api/v1/strategy/balanced-scorecard`) with updated OpenAPI 3.1 definitions.
- **All artifacts synchronized to v6.19.0**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, `registry/capabilities.json`, all 5 `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.18.0] - 2026-10-21

### Apex Release: Full 6-Domain Enterprise Expansion, TypeScript Typings, OpenAPI 3.1 & Strategic Framework Extension

- **P0 — Developer Experience & Strict Typings (`index.d.ts`)**: Delivered comprehensive zero-dependency TypeScript definitions across all 55 computational engines, types (`PtkpStatus`, `TerCategory`, `PhkReasonKey`, `BusinessArchetype`), interfaces, and domain namespaces for seamless autocomplete and type safety.
- **P0 — Built-in OpenAPI 3.1 Specification (`docs/openapi.json` & `GET /api/v1/openapi.json`)**: Added formal OpenAPI 3.1 spec covering all 45+ REST endpoints for instant Postman/Swagger import and multi-language client generation (Python, Go, PHP, Rust, Java).
- **P0 — Tax Intelligence Expansion**: Added Kurs Pajak KMK currency conversion (`engines/kmk-forex-calculator.js`), algorithmic NIK/NPWP 16-digit validation (`engines/identity-validator.js`), e-Bupot Unifikasi 21/26 & 23 CSV export generator (`engines/ebupot-exporter.js`), and cryptographic calculation receipt (`_auditReceipt`) embedded in tax outputs.
- **P0 — Labor & Employment Compliance Expansion**: Added PP No. 35/2021 overtime engine with statutory 1/173 hourly multiplier (`engines/overtime-calculator.js`) and statutory Uang Penggantian Hak (UPH) & unused leave payout engine (`engines/uph-calculator.js`).
- **P0 — Commercial Law & Governance Expansion**: Added quantitative Contract Risk Scorer (0-100) detecting Article 1266 waivers and liability caps (`engines/contract-risk-engine.js`), PP No. 5/2021 OSS-RBA risk & PB-UMKU navigator (`engines/oss-rba-engine.js`), and UU No. 24/2009 bilingual contract harmonizer (`engines/bilingual-contract-harmonizer.js`).
- **P0 — Finance, Commerce & Marketing Expansion**: Added 3-statement balance sanity checker enforcing PSAK 1 balance identity (`engines/financial-statement-linker.js`), WACC with 22% corporate tax shield (`engines/wacc-calculator.js`), True Net ROAS with COD return rate deductions (`engines/roas-contribution-engine.js`), and Customs CIF & landed cost calculator (`engines/landed-cost-calculator.js`).
- **P0 — Strategic Framework Adaptation Model**: Formalized strategic framework extension adapting Michael Porter's Three Tests to service & EdTech capacity slot archetypes (`engines/framework-applicability.js` & `engines/strategic-protocol.js`), and cross-domain competitive stress testing (`engines/strategy-stress-tester.js`).
- **P0 — Institutional Merkle Ledger & 360° Health Oracle**: Added zero-database Merkle hash chain audit ledger (`engines/compliance-ledger.js`) and 360-degree Sovereign Business Health Oracle (`engines/business-health-oracle.js`).
- **All artifacts synchronized to v6.18.0**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, all 5 `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.17.2] - 2026-10-20

### Zero-Dependency REST API Microservice, Root SDK (`index.js`) & Verified Protocol Adapter

- **P0 — Custom SDK & Root Module Interface (`index.js`)**: Added official root package entrypoint (`"main": "index.js"`) exporting all 40 deterministic engines, mathematical constants, and domain namespaces (`tax`, `hr`, `finance`, `commerce`, `marketing`, `strategy`, `legal`, `security`) for direct programmatic consumption in Node.js, TypeScript, and modern JS stacks.
- **P0 — Zero-Dependency Native REST API Microservice (`bin/server.js`)**: Added standalone HTTP REST server built with Node.js native `http` and `URL` modules (zero npm dependencies). Features automatic CORS pre-flight, 1MB payload ceiling, structured JSON error responses, and 28+ calculation and audit endpoints (`/api/v1/calc/*`, `/api/v1/audit/*`, `/api/v1/route/*`).
- **P0 — Universal CLI `serve` Command**: Wired `indonesia-skills serve [--port <3000>] [--host <0.0.0.0>]` into `bin/cli.js`, allowing instant one-command microservice startup via `npx indonesia-skills serve`.
- **P0 — Compatibility Matrix Status Transition**: Promoted `Custom SDK / REST Adapters` in `README.md` from `⚪ Planned` to `✅ Verified` with comprehensive documentation and code samples.
- **P1 — Comprehensive REST Adapter Test Suite (`tests/units/rest-adapter.test.js`)**: Added automated integration tests verifying root SDK export bindings, HTTP server lifecycle on ephemeral ports, deterministic calculation outputs over HTTP, and fail-closed 400/404 error boundaries.
- **All artifacts synchronized to v6.17.2**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, all 5 `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.17.1] - 2026-10-20

### Full Engine Coverage CLI/MCP, Failsafe Product Classification & Pure Evergreen Header Banner

- **P0 — Header Visual Banner Evergreen**: Cleaned `docs/indonesia-business-agent-skills-hero.svg` and `README.md` by removing hardcoded release version badges, transient query parameters, and production label elements, creating a permanent, balanced 4-column metrics design (Agent Skills, Computational Engines, Golden Corpus, Total Assertions) that never requires manual version maintenance on future bumps.
- **P0 — Full Engine CLI & MCP Tool Expansion**: Expanded `bin/cli.js` and `bin/mcp-server.js` from basic 10 tools to comprehensive 20 native tools and 40-engine CLI command coverage, including `calc_pph_badan`, `calc_pph23_26`, `calc_pkwt_compensation`, `calc_marketplace_fee`, `calc_npv`, `calc_irr`, `calc_depreciation`, `calc_loan_amortization`, `calc_working_capital`, and `classify_btki_commodity`.
- **P0 — Failsafe Product Classification (`product-context.js`)**: Updated `resolveProductClassification` to accept polymorphic input (both direct string code and object parameters) and updated CLI/MCP bindings with complete CIF valuation arguments.
- **P1 — SKILL.md Directives Enhanced**: Embedded explicit tri-modal execution directives (MCP tool, Universal CLI, and Node.js require) into flagship skills across Tax, HR, Finance, Marketing, and Legal domains.
- **P1 — Temporal Transition Boundary Hardening**: Hardened `getRulesForDate` across BPJS, PPh 21, UMKM, and BTKI engines to cover the exact final millisecond of transition days (`23:59:59.999Z`), eliminating potential 24-hour boundary dead-zones.
- **P1 — Sandbox Package Smoke Test**: Hardened `scripts/package-smoke-test.sh` to use an isolated tmpfs npm cache, guaranteeing 100% pass rate in strict read-only Bubblewrap sandbox environments.
- **All artifacts synchronized to v6.17.1**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, all 5 `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.17.0] - 2026-10-19

### Universal CLI Runner, Native Zero-Dependency MCP Server, Statutory Bugfixes & Hardened Ingestion

- **P0 — Universal CLI Runner (`bin/cli.js`)**: Added standalone agnostic CLI runner supporting commands like `indonesia-skills calc pph21`, `calc phk`, `calc thr`, `calc bpjs`, `calc umkm`, `calc ppn`, `calc breakeven`, `audit pkwtt`, and `route kbli`. Registered under `"bin"` in `package.json` for seamless `npx indonesia-skills` execution with zero external npm dependencies.
- **P0 — Native Zero-Dependency MCP Server (`bin/mcp-server.js`)**: Added full Model Context Protocol (MCP) server over stdio, providing 10 native tools (`calc_pph21_monthly`, `calc_pph21_december_recon`, `calc_phk_severance`, `calc_thr_payout`, `calc_bpjs_contributions`, `calc_umkm_final_tax`, `calc_ppn_ppnbm`, `audit_pkwtt_compliance`, `analyze_break_even`, `route_kbli_context`) for direct invocation in OpenWork, Claude Code, and Cursor without bash scripting friction.
- **P0 — PPh 21 December Overpayment (Lebih Bayar) Restitution**: Fixed `engines/pph21-calculator.js` where `Math.max(0, ...)` erased employee tax overpayment. Engine now fully computes and reports `isOverpaid`, `overpaymentRefundAmount`, `taxStatus: LEBIH_BAYAR`, and statutory employer restitution directive under PMK No. 168/2023 Pasal 14 ayat (2).
- **P0 — PHK Reason Resolution & Fail-Closed Guard**: Fixed `engines/phk-calculator.js` to normalize NL reason aliases (e.g. `resign`, `mengundurkan diri` -> `resignation`) and fail-closed with `INVALID_INPUT` on unrecognized reasons, preventing voluntary resignations from erroneously defaulting to 50M IDR efficiency severance. Added `uangPisah` and UPH tracking under PP No. 35/2021 Pasal 50.
- **P0 — YAML Frontmatter Syntax Fixes**: Corrected invalid nested flow sequences and unquoted colon scalars in 6 flagship skills (`phk-calculator`, `margin-pricing-calculator`, `ansoff-matrix`, `pph21-calculator`, `pph23-26-calculator`, `regulatory-impact`). Hardened `tests/schema/validator.test.js` to strictly enforce YAML specification compliance.
- **P1 — PPN Besaran Tertentu 1.2%**: Extended `engines/ppn-ppnbm-calculator.js` with `besaran_tertentu` effective 1.2% rate for logistics, freight forwarding, and travel agencies under Pasal 9A UU PPN jo. PMK 71/2022 & PMK 131/2024.
- **P1 — PKWT 5-Year Tenure Cap Warning**: Enhanced `engines/pkwt-compensation-calculator.js` to flag tenures exceeding 60 months with `isExceedingMaxTenure: true` and warning of statutory automatic conversion to permanent employment (PKWTT) under PP 35/2021 Pasal 8.
- **P1 — Silent NaN Elimination**: Refactored `engines/break-even.js`, `engines/financial-ratios.js`, and `engines/working-capital.js` to assert valid numeric inputs and throw structured `INVALID_INPUT` errors instead of silently returning `NaN`.
- **P1 — Closed Prompt Delimiter Boundary**: Standardized the closed `[SYSTEM INSTRUCTION] ... [UNTRUSTED DATA PAYLOAD] ... [END PAYLOAD]` boundary across all 88 skills. Extracted `engines/security-sanitizer.js` as an official production sanitization module and updated `tests/security/injection.test.js` to audit all 88 skills.
- **P1 — Agnostic Sandbox & Regulatory Monitoring**: Added `scripts/sandbox-test.sh` for unprivileged Bubblewrap sandbox validation with automatic fallback, and `scripts/regulatory-watch.js` for lightweight zero-lock-in statutory portal checks.
- **All artifacts synchronized to v6.17.0**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, all 5 `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.16.3] - 2026-08-16

### Final Release Lock — Tag Boundary Hygiene & Ancestor-Verified Lineage

- **P0 — Tag Boundary Corrected**: `v6.16.2` pointed to the feature commit (`fb62e6c`) whose tree still carried the pre-final manifest (`releaseSourceCommitHash=ab4dd2b`); the final manifest lived one commit later on master (`f133335`). `v6.16.3` fixes this: the tag now points to the **manifest-final lock commit** itself, so checking out the tag yields the exact final manifest — GitHub compare shows tag == master (0 commits ahead).
- **P0 — Validator Lineage Hardening**: `scripts/validate-release.js` Check [16] now additionally verifies `git merge-base --is-ancestor <releaseSourceCommitHash> <tagCommit>` — the recorded source commit must be an **ancestor of the release tag**, proving the manifest's lineage genuinely belongs to this release's history. Provenance check score target rises from 9.4 → 9.8.
- **Provenance schema stays `manifestVersion 1.2.0`** (non-self-referential design retained).
- **All artifacts synchronized to v6.16.3**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, all `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.16.2] - 2026-08-15

### Release Provenance Semantics — Non-Self-Referential Design (Final Suite Stabilization)

- **P0 — Release Provenance Schema v1.2.0**: Redesigned `release-manifest.json` from self-referential `releaseCommitHash` (which caused the Git circular-dependency loop: manifest cannot store the SHA of the commit that contains it) to non-self-referential `releaseSourceCommitHash` (the feature commit the tag points to) + `provenancePolicy` field documenting the design rationale. Git tag remains the authoritative immutable release boundary; manifest records lineage, not self-attestation.
- **P0 — Validator Check [16] Redesigned**: `scripts/validate-release.js` Check [16] now verifies: (1) version alignment, (2) git tag existence, (3) `releaseSourceCommitHash` is a reachable commit (non-self-referential), (4) metrics alignment, (5) manifest schema version warning if pre-v1.2.0. Removed the circular SHA comparison that made every correct lock commit fail because the manifest's hash was always one commit behind.
- **P1 — docs/RELEASE.md Provenance Architecture Section Added**: New section "Release Provenance Design — Non-Self-Referential (manifestVersion 1.2.0+)" explaining why self-referential commit hash attestation is cryptographically impossible in Git, the correct non-self-referential architecture, and comparison with industry practice (npm, GitHub Release, Docker digest).
- **All artifacts synchronized to v6.16.2**: `package.json`, `package-lock.json`, `canonical-metadata.json`, `registry/index.json`, all 5 `bundles/*.json`, `README.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`.

## [6.16.1] - 2026-08-15

### Suite Integrity Correction & Release Boundary Fix

- **P0 — Full-Suite Skill-Count Arithmetic Fixed**: `bundles/full-business-suite.json` declared `marketing-id = 27` while actual registry count is `26`, making `sum(plugin.skills) = 89 ≠ totals.skills = 88`. Corrected `marketing-id` to `26`; also corrected `go-to-market.json` (marketing `27→26` and totals `52→51`). All 5 bundles now satisfy `sum(plugin.skills) == totals.skills`.
- **P0 — Suite Validator Hardened (Check 11)**: `scripts/validate-suite.js` now verifies internal arithmetic consistency for every bundle (`sum(plugin.skills) == totals.skills`) — previously it only compared declared totals against canonical metadata.
- **P1 — Profile-to-Registry Membership (Check 12)**: Suite validator now validates each bundle profile's per-plugin declared skill counts AND the union skill count against the actual `registry/index.json` counts — catching stale/mismatched profile metadata.
- **P1 — Suite Discovery Test Expanded**: `tests/suite/suite-discovery.test.js` grew from 34 to 40 assertions, adding bundle arithmetic, per-plugin registry count alignment, exact full-suite skill membership, and installation-command smoke verification.
- **P1 — Installation Claim Alignment**: `bundles/full-business-suite.json` npm command corrected from `npm install @adamriofc/indonesia-business-agent-skills` (package not published under scoped name) to `npm install adamriofc/indonesia-business-agent-skills (Git-based; npm registry publish pending)`.
- **P1 — Stale Release-Gate Wording**: `README.md` documentation tree updated from "13-check release gate" to "18-check release gate".
- **P2 — KBLI Terminology**: `README.md` architecture diagram updated from "KBLI 2020 ROUTER" to "KBLI Business Activity Classification" — consistent with the Agent-owned orchestration boundary.
- **P0 — Release Boundary v6.16.1**: New tag with correct release manifest (v6.16.1 → final commit), CI checkout fix (`fetch-depth: 0` + `fetch-tags: true`), and exact tag↔manifest provenance. Supersedes v6.16.0 whose tag carried a stale v6.15.0 manifest.
- **CI Provenance Policy Fix**: Release workflow now triggers on `branches: [master, main]` only (removed `tags: ['v*']`). A tag points to a feature commit whose manifest cannot reference its own commit hash (self-referential hash is impossible), so a strict provenance gate always failed on tag pushes. Full 18-check release gate — including exact tag↔manifest provenance — is verified on every branch push where the manifest is locked to the already-tagged feature commit. Tags remain immutable pointers to commits that already passed the gate.
- **README & Hero SVG Updated**: CI badge fixed from broken `ci.yml` → correct `ci-release.yml`. Hero SVG updated: version badge `v6.14.0` → `v6.16.1`, assertions `424` → `526+`, added runtime compatibility pill row (OpenWork, OpenCode, Claude Code, Cursor, Codex, OpenClaw, Hermes). Suite badge added to README header.
- **Compatibility Matrix Expanded**: Added **OpenClaw** and **Hermes** as compatible runtimes with integration guidance. Updated opening paragraph and installation guide to reference both runtimes.
- **"Who Uses This" Profession-Based Use Cases Added**: New README section organized by profession — Tax Consultant, HR Manager, Corporate Lawyer, CFO/Finance Director, Business Owner/UMKM, Business Consultant/Strategy Advisor, Startup Founder/Product Manager, E-Commerce Seller/D2C, Content Creator/KOL, Corporate Finance/Investment Analyst, HR-Tech/Payroll Developer — each with concrete problems, relevant skills, and single-domain + cross-domain composition examples, ending with the full cross-domain expansion scenario.
- **Per-Profession 30-Second Killer Cross-Domain Demos Added**: Each of the 11 profession tables plus the Cross-Domain Agent section now carries its own `⚡ 30-Second Killer Cross-Domain Demo` — a concrete user query with agent execution steps spanning multiple domains (e.g. Tax Consultant demo spans PPh 21 → BPJS → UMKM eligibility → cost-to-company). The former standalone top-level demo section was replaced by these per-profession demos so every reader sees an example directly under their own profession table.

## [6.16.0] - 2026-08-15

### Indonesia Business Agent Suite — Distribution Layer & Suite Integrity

- **Suite/Bundle Distribution Architecture**: Added `bundles/` directory with 5 curated installation profiles: `full-business-suite.json` (all 6 domains, 88 skills), `finance-strategy.json`, `people-payroll.json`, `compliance.json`, `go-to-market.json`. Suite is a **distribution layer only** — no orchestration logic, no reasoning, no LLM calls. Agent owns all orchestration.
- **Lockstep Versioning**: All 5 bundle manifests versioned in lockstep with repository (`v6.16.0`). Plugin versions within bundles match repository version. No independent plugin versioning complexity.
- **Suite Integrity Validator (`scripts/validate-suite.js`)**: 10-check validator covering: bundles/ directory presence, full-business-suite existence, valid JSON + required fields, canonical plugin ID match, no duplicate plugin IDs per bundle, full suite covers all 6 plugins, totals match canonical metadata, globally unique capability IDs, domain-namespaced canonical IDs, lockstep version alignment.
- **Suite Discovery Test (`tests/suite/suite-discovery.test.js`)**: 34-assertion test verifying all 6 plugins discoverable, 88 skills present (no duplicate IDs), capability catalog covers all 6 domains, all 88 capabilities have `canonical_id` in `domain.skill-id` format with no collisions, engines + rulesets present, bundle manifests consistent with registry.
- **Namespaced Canonical IDs (`canonical_id` field)**: Added `canonical_id` in `domain.skill-id` format to all 88 entries in `registry/capabilities.json` and `registry/index.json` for globally unique machine-readable identification across the unified catalog.
- **18-Check Release Gate**: Upgraded `scripts/validate-release.js` from 17-check to 18-check pipeline; added Check 18 (`npm run validate:suite`) as a blocking gate in CI and local validation.
- **README Suite UX Section**: Added "Indonesia Business Agent Suite — Installation Profiles" section with 5 profile choices, architecture diagram, and agent-boundary note. Updated test assertion badge to `526+`.
- **`package.json` scripts**: Added `validate:suite` and `test:suite` scripts; added `bundles/` and `schemas/` to `files` array for npm distribution.



### Last-Mile Integrity Hardening — Typed Capability Contracts & SSOT Audit Completion

- **Fully Typed Capability Contracts (P0 Audit Fix)**: All 88 skills in `registry/index.json` and `registry/capabilities.json` now carry machine-readable typed `requires` arrays (objects with `name`, `type`, `required`) and semantic `produces` arrays (objects with `name`, `type`) parsed directly from `argument-hint` frontmatter via regex extraction (`/<([^>]+)>/g`). No more string-literal `<param>` names or generic domain-level placeholder outputs.
- **Per-Skill Semantic Produces (P1 Audit Fix)**: All 88 skills have skill-specific `produces` arrays reflecting actual engine outputs (e.g. `break-even-analysis` now produces `bep_units`, `bep_revenue`, `contribution_margin`, `contribution_margin_ratio`, `margin_of_safety` — not generic `financialRatio`, `cashRunwayMonths`).
- **Type Inference Engine**: Added `inferType()` in `fix-registry.js` assigning `money_idr`, `percentage`, `integer`, `boolean`, `enum`, `array`, `object`, or `string` per parameter name pattern — eliminating all untyped `string` fallback for numeric/monetary params.
- **Enriched Cross-Domain Relevance (P1 Audit Fix)**: All 6 domain clusters now carry structured `cross_domain_relevance` objects with `{ relevance, outputs }` per related domain, replacing empty `{}` placeholders.
- **Generator Fixed (P0 Audit Fix)**: `scripts/generate-capability-catalog.js` now reads typed `requires`/`produces` from `registry/index.json` (SSOT) instead of attempting to split comma-delimited `argument-hint` strings — resolving the root cause of all 87 bad `requires[].name` entries.
- **Capability Validator Hardened (P0 Audit Fix)**: `scripts/validate-capabilities.js` now enforces full typed schema: `requires[i].name`, `requires[i].type`, `requires[i].required` (boolean), `produces[i].name`, `produces[i].type`, `purpose` non-empty array, `not_for` non-empty array — matching `schemas/capability-contract.schema.json`.
- **Documentation SSOT Cleanup (P1 Audit Fix)**: Fixed all stale stats across `README.md`, `docs/RELEASE.md`, `docs/METRICS.md`, `docs/BENCHMARK.md`: 424+ → 526+, 479+ → 526+, 14-check → 17-check, 13-check → 17-check, v6.14.0 → v6.15.0.
- **Release Provenance Verified**: `release-manifest.json` `releaseCommitHash` correctly locked to tag `v6.14.0` → `4c155bb`. CI enforces `REQUIRE_RELEASE_TAG=true` as blocking gate check [16/17].

## [6.14.0] - 2026-08-13

### Typed Agent Capability Contract & Agent-Native Catalog Release
- **Canonical Capability Catalog (`registry/capabilities.json` & `scripts/generate-capability-catalog.js`)**: Added machine-readable agent capability catalog indexing all 88 skill contracts across 6 plugins for instant host agent discovery without scanning disk.
- **Dedicated Capability Contract Validator (`scripts/validate-capabilities.js`)**: Added `npm run validate:capabilities` enforcing `schemas/capability-contract.schema.json` validation across 88 skills.
- **17-Check Release Gate Pipeline (`scripts/validate-release.js`)**: Added Check 17 capability contract validation check to automated release pipeline.
- **Refined Capability Schema**: Added `schemas/capability-contract.schema.json` formalizing typed `requires`, `produces`, `deterministic`, `risk`, and `cross_domain_relevance` properties.

## [6.13.0] - 2026-08-13

### In-Code Capability Contract Enforcement & Agent Capability Discovery Benchmark Release
- **88 SKILL.md Machine-Readable Capability Metadata (P0 Audit Fix)**: Enriched frontmatter across **all 88 SKILL.md files** in 6 canonical plugins with machine-readable `capability` blocks (`requires`, `produces`, `deterministic`, `cross_domain_relevance`).
- **Dynamic Schema Validator Enforcement (P0 Audit Fix)**: `tests/schema/validator.test.js` updated to enforce `capability` block schema validation across all 88 skill manifests.
- **Agent Capability Discovery & Composition Benchmark (`tests/benchmarks/agent-capability.test.js`)**: Added Tier 4 benchmark suite evaluating capability selection precision (100%), selection recall (100%), composition success (100%), and output interpretability (100%) across single-domain, partial, and full enterprise tasks.
- **README Test Assertion Badge Sync (P0 Audit Fix)**: Corrected README badge from 900+ to `514+ Test Assertions` matching SSOT canonical metadata.

## [6.12.0] - 2026-08-13

### Added & Architecture Refined (Agent Capability Contract & Cognitive Instrument Architecture Release)
- **Agent Capability Contract Standard (`SKILL_PROTOCOL.md`)**: Formalized architectural boundary: Agent/LLM acts as the reasoning brain and orchestrator; Skills and Engines act as agent-native cognitive instruments declaring `requires`, `produces`, `deterministic`, and `cross_domain_relevance`.
- **Refined Semantic Confidence Governance**: `normalizeFact` assigns `UNVERIFIED` confidence for unverified `user_input` sources; `normalizeOption` sets non-numeric cost strings to `null` rather than coercing to `0`; `normalizeObjective` strictly requires input in `STRICT_PRODUCTION_MODE` (`requiresInput: true`) rather than assuming `GROWTH`.
- **Unit Test Coverage Expansion**: Added 100% passing tests in `tests/units/context-contract.test.js` verifying strict mode objective requirements, unverified fact confidence, and option cost sanitization.

## [6.11.3] - 2026-08-13

### Security & CodeQL Code Scanning Remediation (CodeQL Alerts #5 & #6 Resolved)
- **CodeQL Alert #6 Resolved (Bad HTML Filtering Regexp)**: Updated script tag regex in `tests/security/adversarial.test.js` to `/<script\b[\s\S]*?<\/script\s*>/gi` to safely handle optional whitespace before closing brackets.
- **CodeQL Alert #5 / #7 Resolved (Incomplete Multi-Character Sanitization)**: Verified multi-pass iterative loop prevents nested tag reappearance.
- **0 Open CodeQL Vulnerabilities**: 100% of GitHub CodeQL Code Scanning security alerts resolved across all branches.

## [6.11.2] - 2026-08-13

### Security & CodeQL Code Scanning Remediation (CodeQL Alerts #1, #2, #3, #4 Resolved)
- **CodeQL Alert #4 Resolved (Bad HTML Filtering Regexp)**: Replaced non-greedy script tag regex in `tests/security/adversarial.test.js` with safer `<script[\s\S]*?>[\s\S]*?<\/script>` matching to prevent ReDoS / parser bypass.
- **CodeQL Alert #3 Resolved (Incomplete Multi-Character Sanitization)**: Implemented iterative sanitization loop in `agentIngestParser` preventing multi-character replacement bypasses.
- **CodeQL Alerts #1 & #2 Resolved (Incomplete URL Substring Sanitization)**: Replaced string inclusion check `includes("http://evil-attacker.com")` with strict scheme regex test `/https?:\/\//i` in security assertions.
- **0 Open CodeQL Vulnerabilities**: All 4 GitHub CodeQL Code Scanning security alerts resolved.

## [6.11.1] - 2026-08-13

### Hardened & Provenance Synchronized (Semantic Precision & Release Provenance Patch Release)
- **Synchronized Release Manifest Commit Provenance (P0)**: `release-manifest.json` updated so `releaseCommitHash` aligns precisely with tag `v6.11.1` target commit.
- **Fail-Closed Temporal BTKI Date Resolution (P0)**: `getBtkirulesetForDate(dateStr)` returns `null` for out-of-coverage date windows, setting `status: "UNRESOLVED"` (`safeToUse: "REQUIRES_REVIEW"`) rather than defaulting to baseline rulesets.
- **Refined Semantic Confidence & Option Sanitization (P0)**: `normalizeFact` assigns `UNVERIFIED` confidence for unverified `user_input` sources; `normalizeOption` sets non-numeric cost strings to `null` rather than coercing to `0`; `normalizeObjective` strictly requires input in `STRICT_PRODUCTION_MODE` instead of assuming `GROWTH`.
- **Multi-Candidate HS6 Ambiguity Handling**: 6-digit HS searches returning multiple 8-digit BTKI tariff lines resolve to `AMBIGUOUS` with candidate rankings (`rankingScore`), withholding landed tax calculations until clarified.
- **PPN Statutory vs Effective Rate Structure**: Expressed PPN import tax structure explicitly (`statutoryRatePercent: 12`, `dppFactor: "11/12"`, `effectiveRatePercent: 11`).

## [6.11.0] - 2026-08-13

### Hardened & Full Audit Closure (Semantic Classification Evidence & 15-Check Release Gate Release)
- **Structured Classification Evidence (`engines/product-context.js`)**: Added explicit `classificationEvidence` array detailing matched product attributes (`product_name`, `category`, `btki_code`) for transparent explainability.
- **Detailed Lartas Permit Governance**: Added structured `lartas` object (`required`, `authority`, `regulation`, `status`) to clearly distinguish trade restrictions from tariff duties.
- **15-Check Automated Release Gate (`scripts/validate-release.js`)**: Added Check 15 for deep semantic alignment verification between `docs/benchmark-results/latest.json` and canonical metadata.
- **SSOT README & Hero SVG Sync**: Updated README hero SVG (`?v=6.11.0`) and aligned all SSOT metadata boundaries across `package.json`, `package-lock.json`, `registry/index.json`, `canonical-metadata.json`, and `release-manifest.json`.

## [6.10.0] - 2026-08-13

### Hardened & Refined (Fail-Closed BTKI Commodity Engine & PPh 22 API Semantics Release)
- **Fail-Closed Classification Safeguard (P0 Audit Fix)**: `engines/product-context.js` updated to enforce zero-fabrication math on `UNRESOLVED` or `AMBIGUOUS` commodity statuses; landed tax calculations are withheld (`importDutyAmount: null`, `nilaiImpor: null`, `ppnAmount: null`, `totalLandedCost: null`) and flag `safeToUse: "REQUIRES_REVIEW"`.
- **PPh 22 Import API Semantics Correction (P0 Audit Fix)**: Importer status now strictly evaluates `usesApi` (API Importer rate 2.5% vs Non-API rate 7.5% vs No-NPWP penalty 15.0%), rectifying the previous NPWP-only ambiguity.
- **PPN Treatment Schemes (P0 Audit Fix)**: Supported multi-scheme PPN import calculations (`STANDARD_12`, `NON_LUXURY_DPP_11_12` effective 11% burden, `EXEMPT`, `INCENTIVE_DTP`).
- **Temporal Date Resolution (P0 Audit Fix)**: `getBtkirulesetForDate(dateStr)` dynamically resolves active BTKI rulesets by statutory effective date window.
- **BTKI 2022 Curated Dataset Expansion (P1 Audit Fix)**: Expanded `engines/rules/btki.json` to 12 curated commodities (Coffee 0901, Rice 1006, Food 1905, Medicaments 3004, Cosmetics 3304, Apparel 6109, Steel Coils 7208, Laptops 8471, Smartphones 8517, EV CBU 8703, Medical Instruments 9018, Furniture 9403) with SHA-256 integrity hash protection (`d5ca820d...`).
- **Strict Release Security Audit (P0 Audit Fix)**: Added Check 14 to `scripts/validate-release.js` and updated `.github/workflows/ci-release.yml` for blocking `npm audit --audit-level=high` checks.
- **SSOT README & Hero SVG Sync**: Updated README hero SVG (`?v=6.10.0`), ASCII Semantic Business Context Graph architecture diagram, and documentation SSOT metrics.

## [6.9.0] - 2026-08-12

### Added & Architecture Extended (Product Context & Business Reasoning Substrate Release)
- **Product Context Layer & Commodity Classification Engine (`engines/product-context.js`)**: Extended business context contract to support commodity classification anchor (`product`, `classification` with `scheme: "BTKI"`, `hs6`, `ahtn8`, `btkiCode`, `version: "BTKI-2022"`), Lartas permit auditing, and landed cost duty calculations (Import Duty, PPN 12%, PPh 22 Impor).
- **Single Source of Truth BTKI Ruleset (`engines/rules/btki.json`)**: Added BTKI 2022 tariff entries for major commodities (Coffee 0901, Food 1905, Cosmetics 3304, Apparel 6109, Smartphones 8517, Electric Vehicles 8703) protected by cryptographic SHA-256 trust anchor verification (`0e0063cb...`).
- **Product Classification Skill (`marketing-id/skills/product-classification/SKILL.md`)**: Registered 88th agent skill (`product-classification`) guiding commodity attribute extraction and BTKI 2022 tariff audits.
- **Semantic Business Context Extensions**: `engines/context-contract.js` updated to version `2.2.0` supporting Facts (`facts`), Semantic Relations (`relations`), Multi-Domain Constraints (`constraints`), Business Objectives (`objectives`), and Decision Options (`options`).
- **Product Context Unit Test Suite (`tests/units/product-context.test.js`)**: Added 100% passing test suite for product classification, non-NPWP 7.5% penalty rates, EV CBU exemption incentives, and fail-closed `INVALID_INPUT` error boundaries.

## [6.8.0] - 2026-08-12

### Expanded & Hardened (Golden Corpus Expansion & Cross-Engine Invariants Release)
- **Golden Test Corpus Expansion (121 Golden Cases)**: Expanded static golden corpus from 94 to 121 golden cases across 27 benchmark domains in `tests/golden/*.json` (`transfer-pricing`, `market-sizing`, `marketing-unit-economics`, `scenario-analysis`, `strategic-risk`, `decision-analysis`, `decision-engine`, `business-scenario`, `compliance-risk`, `regulatory-impact`, `regulatory-diff`, `pph21-grossup`, `term-sheet`, `kbli-context`).
- **Cross-Engine Invariants Suite (`tests/units/cross-engine-invariants.test.js`)**: Added 23 explicit invariant assertions verifying mathematical conservation laws (Exit Waterfall conservation, Net Seller Payout accounting, DER 4:1 secondary dividend adjustment, TER 35% cap, KBLI capacity model contracts).
- **Immutable Release Trace Manifest (`release-manifest.json` & `scripts/generate-release-manifest.js`)**: Generates machine-readable release trace capturing version, git commit hash, SHA256 ruleset checksums, benchmark artifact hash, and Node matrix status.
- **Strict Release Gate Upgrade (`scripts/validate-release.js`)**: Added Check 11 verification for `release-manifest.json` and strict workspace cleanliness verification (`REQUIRE_CLEAN_GIT=true`).
- **SSOT Alignment Wording**: Updated documentation alignment wording across README, BENCHMARK, and METRICS ("All validated documentation fields are in SSOT alignment").

## [6.7.0] - 2026-08-12

### Added & Hardened (Production Hardening & Feature Freeze Release — Audit Roadmap Phase 3)
- **Operational Runbook (`docs/OPERATIONAL_RUNBOOK.md`)**: Comprehensive emergency & maintenance SOPs covering statutory ruleset updates, SHA256 mismatches, benchmark throughput regressions, context conflicts, input errors, LLM timeouts, and model hallucinations.
- **Documentation Architecture Tree**: Formalized 8-file documentation hierarchy in `docs/METRICS.md` and `README.md` (README -> ARCHITECTURE -> DESIGN_PRINCIPLES -> BENCHMARK -> PROVENANCE -> PRODUCTION_READINESS -> RELEASE -> METRICS -> OPERATIONAL_RUNBOOK).
- **High-Risk Human-Review Matrix & Readiness Level L3**: Enforced Level L3 Production Decision-Support readiness controls and explicit human advocate/CPA review policies in `PRODUCTION_READINESS.md`.
- **Deterministic Fallback & Isolation Safeguards**: Formally locked pure Node.js computational isolation, zero external API data leakage, and `INVALID_INPUT` fail-closed error boundaries.
- **FEATURE FREEZE ANNOUNCEMENT**: Official feature freeze entered. Future updates will strictly maintain deterministic engine accuracy, statutory ruleset freshness, and release engineering integrity without adding redundant plugins or skills.

## [6.6.0] - 2026-08-12

### Added & Hardened (Evaluation Release — Audit Roadmap Phase 2)
- **Apples-to-Apples LLM Evaluation Engine (`scripts/llm-benchmark-eval.js`)**: Upgraded evaluation harness to compare identical model outputs across 5 Ablation Conditions (Condition A: Vanilla LLM, Condition B: LLM + Context, Condition C: LLM + Skills, Condition D: LLM + Skills + Engines, Condition E: Full Stack).
- **2-Evaluator Architecture & 1-5 Blind Rubric Evaluator**: Implemented Dual Evaluator architecture combining strict deterministic numeric/classification matching with 1-5 Blind Rubric evaluation across 7 dimensions (*Context Specificity*, *Evidence Grounding*, *Actionability*, *Feasibility*, *Strategic Fit*, *Risk Awareness*, *Business Relevance*).
- **Statistical Analysis Reporting**: Automatically computes sample size ($n$), mean, median, standard deviation, delta, and 95% Confidence Intervals for both live API and offline fixture execution modes.
- **BENCHMARK.md §3 Refinement**: Updated empirical evaluation documentation with 5-Condition Ablation Study matrix and 1-5 Rubric statistical metrics (+2.57 quality rating delta on 1-5 scale).

## [6.5.0] - 2026-08-12

### Added & Hardened (Reliability Release — Audit Roadmap Phase 1)
- **13-Check Automated Release Gate (`scripts/validate-release.js`)**: Implemented `npm run validate:release` checking SemVer version alignment, CHANGELOG entries, plugin/skill/engine counts, SHA256 ruleset hashes, dynamic schema validation, required files, git cleanliness, and benchmark artifact freshness.
- **Single Source of Truth (SSOT) Metadata Engine (`scripts/generate-metadata.js`)**: Generates `canonical-metadata.json`, updates `README.md` `<!-- GENERATED:STATS -->` block, and produces `docs/METRICS.md` to eliminate documentation drift.
- **Documentation SSOT Validator (`scripts/validate-docs.js`)**: Implemented `npm run validate:docs` to verify 0-drift across README, BENCHMARK, METRICS, CHANGELOG, and SKILL_PROTOCOL.
- **2-Tier Strategic CI Pipeline (`.github/workflows/`)**: Split CI into `ci-pr.yml` (fast PR confidence) and `ci-release.yml` (full release matrix Node 20/22/24, dedicated security jobs with CodeQL & npm audit, package smoke test, and benchmark artifact retention).
- **Package Smoke Test (`scripts/package-smoke-test.sh`)**: Added `npm run test:smoke` packing the tarball, installing in an isolated environment, and verifying module exports.
- **Lightweight Performance Regression Gate (`scripts/perf-gate.js`)**: Compares execution throughput against `docs/benchmark-results/baseline.json` and warns on >30% degradation.
- **Tier A Boundary, Invalid & Invariant Suite (`tests/benchmarks/boundary-edge.test.js`)**: Added 27 explicit tests covering bracket boundaries (`threshold-1`, `threshold`, `threshold+1`), invalid fail-closed inputs, and post-condition invariants.
- **Tier B Adversarial Expansion**: Added 5 `ADVERSARIAL_CASE` entries to `tests/benchmarks/business-scenario-regression.test.js` (30 scenarios total).
- **Production Contract & Error Model (`engines/production-contract.js`)**: High-risk engines (`pph21`, `bpjs`, `umkm`, `transfer-pricing`) now throw `TypeError` with `INVALID_INPUT` messages rather than silently coercing malformed inputs to `0` ("no fabricated answer" principle).
- **Mutually Exclusive LLM Evaluation Provenance**: `scripts/llm-benchmark-eval.js` enforces mutually exclusive schema (`OFFLINE_FIXTURE_VERIFICATION_MODE` vs `LIVE_NETWORK_API_INVOCATION`) and removed default private tunnel URL.
- **Production Governance Docs**: Added `PRODUCTION_READINESS.md` (Readiness Levels L0-L4, Human-Review Matrix, Fallback Policy), `docs/RELEASE.md`, and `docs/NODE_SUPPORT.md`.

## [6.4.1] - 2026-08-12

### Corrected & Hardened (Final Audit Feedback)
- **Benchmark Semantics Correction (P0)**: Renamed `tests/benchmarks/recommendation-quality.test.js` → `tests/benchmarks/business-scenario-regression.test.js`. The suite is now explicitly a *deterministic business scenario regression benchmark*, not an LLM recommendation-quality measurement; claims are scoped accordingly in `docs/BENCHMARK.md` §1/§4.
- **Independent 8-Dimension Evaluation (P0)**: Each of the 8 dimensions (Context Correctness, Evidence Grounding, Recommendation Specificity, Actionability, Financial Feasibility, Constraint Awareness, Cross-Domain Consistency, Hallucination Absence) now has its own evaluator and its own 100% assertion. Dimension scores are no longer derived from a single case-level boolean.
- **Case Provenance & Citation Metadata (P0)**: All 25 scenarios carry `sourceType` (`AUTHORED_SOURCE_CASE` | `PARAMETRIC_CASE`); the 5 authored cases include verifiable statutory citations (PP 20/2026, PP 55/2022, PMK 172/2023, Permenaker 1/2017, UU 13/2003 jo. UU 6/2023, UU 27/2022). Fabricated journal titles removed; no case is presented as a published journal study.
- **Dead Expectation Repaired (P0)**: `totalViolationsCount` was previously asserted against a nonexistent engine field; the evaluator now compares the real `totalViolationsDetected` output, closing a silent coverage gap.
- **Invalid Numeric Input Protocol (P1)**: `engines/context-contract.js` no longer silently coerces malformed numerics to `0` (`Number(x) || 0` removed). Non-numeric or negative scale values now surface `INVALID_INPUT` (`INVALID_NUMERIC_VALUE` / `NEGATIVE_VALUE_OUT_OF_RANGE`) via the new `inputIssues` array; schema version bumped to 2.1.0.
- **Soft Context Warning (P1)**: KBLI vs activity-name ambiguity (`KBLI_ARCHETYPE_MISMATCH`) is now a soft `CONTEXT_WARNING` (needs clarification) rather than a hard `CONTEXT_CONFLICT`; hard conflicts remain only for structural contradictions (e.g., individual + Perseroan Terbatas).
- **Documentation Consistency (P1)**: `docs/BENCHMARK.md` corrected to measured figures — 94 golden cases / 27 domains / 38 engines (was 92/25/32), Tier 2/3 suite paths, and 424 assertion statements; §2 table now includes Market Sizing and Marketing Unit Economics domains with measured throughput.
- **Version Metadata Sync**: `package.json`, `package-lock.json`, and `registry/index.json` aligned at 6.4.1.

## [6.4.0] - 2026-08-12

### Refined & Hardened
- **Recommendation Quality Benchmark Suite (P0 Fix)**: Added `tests/benchmarks/recommendation-quality.test.js` incorporating 25 real-world journal & business case studies across 8 evaluation dimensions (*Context Correctness, Evidence Grounding, Specificity, Actionability, Feasibility, Constraint Awareness, Cross-Domain Consistency, Hallucination Absence*) with 100% assertion coverage (`contractInput`, `thinCapInput`, `recommendedTaxRegime`, etc.).
- **Context Conflict Detection & Reference Fix (P0 Fix)**: Resolved `ReferenceError` in `engines/context-contract.js` (`detectContextConflicts`) and enforced `CONTEXT_CONFLICT` status when KBLI 2020 code conflicts with user-stated business activity.
- **Stale Package Description & Timestamp Sync (P0 Fix)**: Updated `package.json` description to reflect canonical 6 business plugins (`legal, tax, HR, finance, marketing, and strategic business reasoning`) and updated `registry.generated_at` timestamp.
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `6.4.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [6.3.0] - 2026-08-12

### Refined & Hardened
- **Multi-Factor Statutory Conflict Resolution Refinement (`engines/conflict-resolution.js`)**: Enhanced statutory conflict engine with temporal applicability verification (`effectiveFromDate` vs `asOfDate`), explicit repeal evidence check (`explicitRepeal`), and `NOT_YET_EFFECTIVE` status handling under UU No. 12/2011 jo. UU No. 13/2022.
- **Clean Framework Recommendation Levels (`engines/framework-applicability.js`)**: Removed redundant boolean flag in favor of explicit 4-state `recommendationLevel` (`RECOMMENDED`, `ADAPTABLE`, `CONDITIONAL`, `NOT_RECOMMENDED`) with detailed `applicabilityReason`.
- **Stale Taxonomy Enforcer Upgrade (`tests/schema/validator.test.js`)**: Enhanced schema validator to automatically assert canonical version `6.3.0` and reject stale plugin references (`tax-payroll-id`, `ecommerce-id`, `content-lokal-id`) across docs and manifests.
- **Documentation & Install Command Sync**: Cleaned up 100% of remaining legacy installation commands across `README.md`, `SKILL_PROTOCOL.md`, and `package.json`.

## [6.2.0] - 2026-08-12

### Refined & Hardened
- **Multi-Factor Statutory Conflict Resolution System (`engines/conflict-resolution.js`)**: Enhanced conflict resolution engine to evaluate `subjectMatterScope` (identical vs distinct subject matter), `explicitRepeal` evidence, and precise `effectiveFromDate` under UU No. 12/2011 jo. UU No. 13/2022.
- **Shared Business Archetype Contract Expansion (`engines/business-archetype-contract.js`)**: Expanded archetype contracts with generic operational attributes (`capacityModel`, `revenueModel`, `deliveryModel`, `customerParticipation`, `scalabilityConstraint`).
- **Structured Framework Applicability Levels (`engines/framework-applicability.js`)**: Replaced boolean recommendation flag with explicit 4-state `recommendationLevel` (`RECOMMENDED`, `ADAPTABLE`, `CONDITIONAL`, `NOT_RECOMMENDED`) and detailed `applicabilityReason`.
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `6.2.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [6.1.0] - 2026-08-12

### Refined & Hardened
- **Strict Production Mode Enforcement (`engines/context-contract.js`)**: Enforced explicit context validation separating `DEMO_MODE` from `STRICT_PRODUCTION_MODE` (returning `INSUFFICIENT_CONTEXT` with `missingParameters[]` and an explicit `assumptionRegistry` when context fields are missing).
- **Multi-Factor Statutory Conflict Resolution System (`engines/conflict-resolution.js`)**: Implemented the 4 Principles of Indonesian Jurisprudence under UU No. 12/2011 jo. UU No. 13/2022 (*Lex Superior*, *Lex Specialis*, *Lex Posterior*, and Delegated Authority).
- **Failure Taxonomy Expansion (`engines/failure-taxonomy.js`)**: Expanded failure taxonomy codes with `CONTEXT_CONFLICT` and `EVIDENCE_INSUFFICIENT`.
- **Shared Business Archetype Contract Engine (`engines/business-archetype-contract.js`)**: Canonical archetype contracts mapping units of analysis, inventory characteristics, and value chain focus (`PRODUCT_MANUFACTURING`, `PROFESSIONAL_SERVICE`, `CAPACITY_SERVICE`, `MARKETPLACE_PLATFORM`, `HYBRID`).
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert version `6.1.0`, **87 skills**, **38 engines**, **6 plugins**, and Overview narrative consistency.

## [6.0.0] - 2026-08-12

### Major Business Capability Taxonomy Refactoring
- **Standalone `tax-id` & Payroll Integration into `hr-id`**: Refactored domain architecture by separating tax engineering from payroll operations into two dedicated business capability plugins:
  - **`tax-id`**: *Indonesian Tax Intelligence, Engineering & Compliance* (16 Skills — PPh 21 TER, PPh 23/26, PPh Badan, PPN 12%, PPnBM, Transfer Pricing, Tax Planning, Tax Risk, Tax Audit, Cross-Border Tax).
  - **`hr-id`**: *Indonesian Human Resources, Employment & Payroll Compliance* (12 Skills — Warning letters, SOPs, Interview, BPJS SIPP Admin, PHK Severance, PKWT/PKWTT, Wage Structure, and Statutory Payroll Execution: `bpjs-calculator`, `thr-calculator`, `spt-tahunan-guide`).
- **6 Canonical Business Operating Intelligence Stack**:
  1. `legal-id`: Commercial Law & Compliance (9 Skills)
  2. `tax-id`: Tax Intelligence, Engineering & Compliance (16 Skills)
  3. `hr-id`: Labor, Employment & Payroll Compliance (12 Skills)
  4. `finance-id`: Business Finance & Accounting (15 Skills)
  5. `marketing-id`: Marketing, Growth & Commerce (25 Skills)
  6. `strategic-id`: Strategic Management & Corporate Strategy (10 Skills)
- **Automated Schema & Catalog Sync**: Upgraded `tests/schema/validator.test.js` to automatically assert canonical version `6.0.0`, **87 skills**, **38 engines**, **6 plugins**, and Overview narrative consistency.

## [5.1.0] - 2026-08-12

### Added
- **Market Research & Positioning Intelligence (`marketing-id`)**:
  - 6 New Flagship Skills: `market-sizing`, `customer-segmentation`, `jobs-to-be-done`, `voice-of-customer`, `positioning-analysis`, `go-to-market` (expanding `marketing-id` to 25 Skills & total catalog to **87 Skills Across 6 Plugins**).
- **2 Deterministic Marketing & Unit Economics Engines**:
  - `engines/market-sizing-engine.js`: Top-down TAM / SAM / SOM market opportunity calculation engine.
  - `engines/marketing-unit-economics.js`: LTV, CAC, LTV:CAC ratio (target >= 3.0x), CAC payback period (months), and ROAS calculation engine.
- **Automated Schema & Catalog Sync**: Upgraded `tests/schema/validator.test.js` to automatically assert canonical version `5.1.0`, **87 skills**, **38 engines**, **6 plugins**, and Overview narrative consistency.

## [5.0.0] - 2026-08-12

### Major Architectural Consolidation
- **6 Canonical Business Operating Intelligence Stack**: Refactored domain architecture by consolidating channel-level plugins (`ecommerce-id` 10 skills & `content-lokal-id` 9 skills) into a single unified business capability plugin: **`marketing-id`** (*Indonesian Marketing, Growth & Commerce* — 19 Skills).
- **Consolidated Business Domain Hierarchy**:
  1. `legal-id`: Commercial Law & Compliance (9 Skills)
  2. `tax-payroll-id`: Tax Engineering & Payroll (19 Skills)
  3. `hr-id`: Labor & Employment Compliance (9 Skills)
  4. `finance-id`: Business Finance & Accounting (15 Skills)
  5. `marketing-id`: Marketing, Growth & Commerce (19 Skills)
  6. `strategic-id`: Strategic Management & Corporate Strategy (10 Skills)
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `5.0.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md` (verifying 6 plugins & 81 skills).

## [4.2.0] - 2026-08-10

### Refined & Hardened
- **Multi-Factor Statutory Conflict Resolution System (`engines/conflict-resolution.js`)**: Refactored statutory conflict resolution to implement the 4 Principles of Indonesian Jurisprudence:
  1. `STATUTORY_HIERARCHY_PASAL_7` (Pasal 7 UU No. 12/2011: UUD 1945 > TAP MPR > UU/Perpu > PP > Perpres > Perda).
  2. `DELEGATED_AUTHORITY_PASAL_8` (Pasal 8 UU No. 12/2011: Permen / SE bound by explicit statutory mandate).
  3. `LEX_SPECIALIS_DEROGAT_LEGI_GENERALI` (Specific subject-matter rule overrides general rule).
  4. `LEX_POSTERIORI_DEROGAT_LEGI_PRIORI` (Newer rule overrides older rule of equal rank and scope).
- **Shared Business Archetype Contract Engine (`engines/business-archetype-contract.js`)**: Added canonical archetype contract engine (`PRODUCT_MANUFACTURING`, `PROFESSIONAL_SERVICE`, `CAPACITY_SERVICE`, `MARKETPLACE_PLATFORM`, `HYBRID`) mapping units of analysis, inventory characteristics, and value chain focus.
- **Failure Taxonomy Expansion (`engines/failure-taxonomy.js`)**: Expanded failure taxonomy codes with `CONTEXT_CONFLICT` and `EVIDENCE_INSUFFICIENT`.
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `4.2.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [4.1.0] - 2026-08-10

### Refined & Hardened
- **Strict Production Mode & DEMO Mode (`engines/context-contract.js`)**: Enforced explicit operational context separation (`DEMO_MODE` for default simulation vs `STRICT_PRODUCTION_MODE` returning `INSUFFICIENT_CONTEXT` with `missingParameters` and explicit `assumptionRegistry`).
- **Indonesian Legal Hierarchy & Statutory Conflict Resolution Engine (`engines/conflict-resolution.js`)**: Implemented statutory hierarchy under UU No. 12/2011 jo. UU No. 13/2022 (*Lex Superior Derogat Legi Inferiori* & *Lex Posteriori Derogat Legi Priori*).
- **Standard Failure Taxonomy Engine (`engines/failure-taxonomy.js`)**: Classified execution errors into standard audit categories (`INVALID_INPUT`, `MISSING_PARAMETER`, `INSUFFICIENT_CONTEXT`, `AMBIGUOUS_CONTEXT`, `OUTDATED_RULESET`, `CONFLICTING_RULE`, `UNSUPPORTED_CASE`, `ENGINE_ERROR`).
- **4-State Strategic Framework Applicability Engine (`engines/framework-applicability.js`)**: Mapped framework applicability across 4 states (`NATIVE`, `ADAPTABLE`, `CONDITIONAL`, `NOT_RECOMMENDED`) and archetype units of analysis (`PHYSICAL_SKU`, `SERVICE_LINE_PRACTICE`, `CAPACITY_SLOT_OR_PROPERTY`, `GMV_TAKE_RATE_CHANNEL`).
- **120-Case Multi-Category Benchmark Suite**: Partitioned benchmark suite into `tests/benchmarks/live/`, `tests/benchmarks/fixture/`, and `tests/benchmarks/synthetic/` (50 fixture cases + 70 synthetic/authored cases across 25 benchmark domains at **100.00% pass rate**).
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `4.1.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [4.0.0] - 2026-08-10

### Major System Maturity Release
- **Strict Production Mode & DEMO Mode (`engines/context-contract.js`)**: Separated `DEMO_MODE` (transparent demo defaults) from `STRICT_PRODUCTION_MODE` (returns `INSUFFICIENT_CONTEXT` with `missingParameters` and explicit `assumptionRegistry`).
- **Indonesian Legal Hierarchy & Statutory Conflict Resolution Engine (`engines/conflict-resolution.js`)**: Implemented statutory hierarchy under UU No. 12/2011 jo. UU No. 13/2022 (*Lex Superior Derogat Legi Inferiori* & *Lex Posteriori Derogat Legi Priori*).
- **Standard Failure Taxonomy Engine (`engines/failure-taxonomy.js`)**: Classified error modes into standard audit categories (`INVALID_INPUT`, `MISSING_PARAMETER`, `AMBIGUOUS_CONTEXT`, `OUTDATED_RULESET`, `CONFLICTING_RULE`, `UNSUPPORTED_CASE`, `ENGINE_ERROR`).
- **Benchmark Corpus Partitioning & 120-Case Multi-Category Suite**: Reorganized benchmark folder into `tests/benchmarks/live/`, `tests/benchmarks/fixture/`, and `tests/benchmarks/synthetic/` (50 fixture cases + 70 synthetic/authored cases at **100.00% pass rate**).
- **README Compatibility Matrix Refinement**: Clarified compatibility states: `✅ Verified` (CI-tested Node 20/22/24), `🟡 Compatible` (IDE agent skill paths), and `⚪ Planned` (Custom SDK adapters).

## [3.1.0] - 2026-08-10

### Refined & Hardened
- **Standard Business Context Contract (`engines/context-contract.js`)**: Added canonical shared context contract schema across Tax, HR, Legal, Finance, and Strategic skills with automated `validateBusinessContext()` validation.
- **Missing Information Protocol & Assumption Registry**: Implemented incomplete context detection returning `INSUFFICIENT_CONTEXT` with `missingParameters` and an audit-transparent `assumptionRegistry`.
- **Framework Applicability & Unit-of-Analysis Engine (`engines/framework-applicability.js`)**: Created matrix mapping 4 applicability states (`NATIVE`, `ADAPTABLE`, `CONDITIONAL`, `NOT_RECOMMENDED`) and archetype units of analysis (`PHYSICAL_SKU`, `SERVICE_LINE_PRACTICE`, `CAPACITY_SLOT_OR_PROPERTY`, `GMV_TAKE_RATE_CHANNEL`).
- **Dynamic Skill Engine Match Evaluation (P0 Fix)**: Refactored `scripts/llm-benchmark-eval.js` to dynamically evaluate skill engine accuracy using `checkOutputMatch()` instead of hardcoded boolean assertions.
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert version `3.1.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [3.0.0] - 2026-08-10

### Major Release & System Maturity
- **Empirical Live LLM Evaluation Harness (`scripts/llm-benchmark-eval.js`)**: Refactored evaluation harness to execute live model predictions (evaluated against Gemini 3.6 Flash / OpenAI-compatible baseline) and write reproducible provenance metadata to `docs/benchmark-results/llm-eval.json` (`evaluatedModel`, `evaluatedAt`, `sampleSize`, `temperature`).
- **Compatibility & Testing Matrix (`README.md`)**: Added explicit compatibility matrix distinguishing `✅ Verified` (CI-tested runtimes), `🟡 Compatible` (IDE agent skill paths), and `🔵 Expected` (Custom SDK adapters).
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `3.0.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.
- **System Freeze & Production Stabilization**: Locked architecture at **81 Skills across 7 Plugins** & **32 Deterministic Engines** (25 benchmark domains at **100.00% pass rate**).

## [2.9.0] - 2026-08-10

### Fixed & Hardened
- **Benchmark Semantics & Nomenclature (P0 Fix)**:
  - Renamed Tier-2 extractor fixture test to `Regex & Rule-Based Parameter Extractor Fixture Test` to avoid over-claiming local regex parsers as LLM extraction models.
  - Renamed Tier-3 integration benchmark to `Cross-Domain Decision & Integration Benchmark`.
- **100% Expected Field Assertion (P0 Fix)**: Refactored `tests/benchmarks/agent-decision-benchmark.test.js` so that 100% of defined `expected` fields (`recommendedTaxRegime`, `maxAllowableDebt`, etc.) are explicitly asserted in the test loop without omission.
- **Reproducible Benchmark JSON Artifact**: Generated `docs/benchmark-results/latest.json` artifact via `scripts/benchmark.js --json-report docs/benchmark-results/latest.json`.
- **Empirical LLM Evaluation Harness**: Added `scripts/llm-benchmark-eval.js` to evaluate Vanilla LLM error rates against Skill-assisted agent executions.
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `2.9.0` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [2.8.0] - 2026-08-10

### Refined & Hardened
- **Empirical 3-Tier Benchmark Suite (P0 Fix)**:
  - Added Tier-2 Agent Parameter Extraction Benchmark (`tests/benchmarks/nlp-extraction-benchmark.test.js`) testing 50 natural language parameter extraction cases (**96.00% Accuracy**).
  - Added Tier-3 Agent End-to-End Decision Benchmark (`tests/benchmarks/agent-decision-benchmark.test.js`) testing 25 realistic Indonesian enterprise scenario cases (**100.00% Pass Rate**).
  - Integrated full benchmark suite into CI build gate (`npm run test:benchmarks`).
- **Supply-Chain Trust Anchor & Integrity Suite (P1 Fix)**: Added `tests/security/supply-chain.test.js` validating manifest version alignment, SHA-256 trust anchors, and maintainer audit metadata.
- **Interoperability & DX Protocol (`SKILL_PROTOCOL.md`)**: Created `SKILL_PROTOCOL.md` defining architectural principles, universal agent CLI shorthands, Claude marketplace manifests, and Node.js SDK engine integration.

## [2.7.1] - 2026-08-10

### Fixed & Hardened
- **Benchmark Taxonomy Correction (P0 Fix)**: Refactored `docs/BENCHMARK.md` to eliminate claims overstatement, formally classifying Tier 1 (Deterministic Engine Math: **100.00% Pass Rate** on 92 Golden Cases), Tier 2 (Multi-Engine Integration Assertions: **100.00% Pass Rate** on 50 Enterprise Lifecycle Assertions), and Tier 3 (Agent LLM End-to-End Decision: **EXPERIMENTAL**).
- **4-State Strategic Applicability Enum (P1 Fix)**: Refactored `engines/strategic-protocol.js` to replace boolean `isApplicable` with a 4-state enum (`'NATIVE'`, `'ADAPTABLE'`, `'CONDITIONAL'`, `'NOT_RECOMMENDED'`) for strict framework applicability bounds.
- **Audit Validator Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert canonical version `2.7.1` across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md`.

## [2.7.0] - 2026-08-10

### Refined & Hardened
- **3-Tier Accuracy Taxonomy**: Updated `docs/BENCHMARK.md` to define Tier 1 (Deterministic Engine Math: **100.00% Pass Rate**), Tier 2 (Parameter Extraction Accuracy: **96.00%**), and Tier 3 (End-to-End Enterprise Task Completion: **94.00%**).
- **Strategic Application Protocol Engine**: Added `engines/strategic-protocol.js` establishing a 12-Step Strategic Operating System connecting KBLI 2020 Context Routing, Business Archetype Adaptation (`PRODUCT_MANUFACTURING`, `PROFESSIONAL_SERVICE`, `CAPACITY_SERVICE`), and Evidence Sufficiency Discipline (`SUFFICIENT`, `PARTIAL`, `INSUFFICIENT`).
- **Strategic Skills Protocol Integration**: Updated 10 Strategic Skills in `strategic-id/skills/` to enforce KBLI context resolution and evidence-based decision boundaries.
- **50-Case Enterprise Integration Suite**: Expanded `tests/integration/workflow.test.js` from 20 to **50 end-to-end enterprise employee lifecycle & scenario assertions**.
- **Provenance Taxonomy Refinement**: Updated `PROVENANCE.md` with 4 explicit **Source Quality Tiers** (`STATUTORY`, `PROFESSIONAL_STANDARD`, `COMMERCIAL_POLICY`, `INTERNAL_HEURISTIC`).
- **30-Second Killer Cross-Domain Demo**: Added interactive scenario demo and updated System Architecture ASCII Diagram in `README.md`.

## [2.6.0] - 2026-08-10

### Refined & Hardened
- **MCDA Benefit vs Cost Normalization (P0 Fix)**: Refactored `engines/decision-analysis-engine.js` to explicitly support criterion direction (`'benefit'` where higher is better vs `'cost'` where lower is better with `10 - rawScore` normalization).
- **KBLI Context Router Engine**: Added `engines/kbli-context-router.js` mapping 5-digit Indonesian KBLI 2020 codes to canonical Business Archetypes (`PRODUCT_MANUFACTURING`, `PROFESSIONAL_SERVICE`, `CAPACITY_SERVICE`, `MARKETPLACE_PLATFORM`, `HYBRID`) for contextual strategic adaptation.
- **Configurable Portfolio Thresholds & GE 9-Box Cell Bands**: Refactored `engines/strategic-framework-engine.js` to support industry-configurable BCG thresholds (`highGrowthThresholdPercent`, `highRelativeShareThreshold`) and explicit 3x3 GE-McKinsey cell coordinates (`HIGH_HIGH`, `HIGH_MEDIUM`, etc.).
- **Docstring Accuracy Cleanup**: Cleaned up docstrings in `engines/scenario-analysis-engine.js` and `decision-analysis-engine.js` to strictly match implemented features.
- **25-Domain Golden Benchmark**: Expanded static golden corpus (`tests/golden/`) to **92 golden cases across 32 engine modules** (25 benchmark domains at 100.00% accuracy).

## [2.5.1] - 2026-08-10

### Fixed & Hardened
- **README Layout Fix (P0 Fix)**: Corrected Markdown section hierarchy in `README.md` catalog so that the 15 bullet skills for `finance-id` are rendered directly under `### 6. finance-id` and before `### 7. strategic-id`.
- **Automated Layout Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert that every plugin section in `README.md` contains its exact required number of skill bullets.

## [2.5.0] - 2026-08-10

### Added
- **Plugin Ke-7: `strategic-id` (Strategic Management & Corporate Strategy)**:
  - 10 Flagship Strategic Management Skills: `porter-three-tests`, `porter-five-forces`, `bcg-matrix`, `ansoff-matrix`, `vrio-analysis`, `value-chain-analysis`, `strategic-planning`, `decision-making`, `scenario-planning`, `strategic-risk-analysis`.
- **4 Deterministic Strategic & MCDA Engines**:
  - `engines/strategic-framework-engine.js`: Deterministic portfolio matrix evaluation (BCG Growth-Share Matrix & GE-McKinsey 9-Box Matrix).
  - `engines/decision-analysis-engine.js`: Multi-Criteria Decision Analysis (MCDA) weighted scoring & trade-off ranking engine.
  - `engines/scenario-analysis-engine.js`: What-If macro/micro scenario simulation & profit sensitivity engine.
  - `engines/strategic-risk-engine.js`: Strategic Risk Index (Likelihood x Impact x Velocity) scoring & heatmap classification engine.
- **Catalog & Benchmark Expansion**: Expanded catalog to **81 Skills Across 7 Plugins** and **31 Deterministic Engines** (24 benchmark domains / 90 golden cases at 100.00% accuracy).

## [2.4.0] - 2026-08-10

### Refined & Hardened
- **Scientific Accuracy & Wording Refinement**: Updated `README.md` to refine `"0% hallucination"` into technically defensible statements (`"Deterministic computation removes LLM arithmetic hallucination within the engine"` & `"100% pass rate on the curated golden benchmark corpus"`).
- **Source Quality Classification**: Added explicit **Source Quality Classification** (`PRIMARY` vs `SECONDARY_VERIFIED`) column to all regulatory ruleset registers in `PROVENANCE.md`.
- **Empirical LLM Baseline Benchmark**: Populated `docs/BENCHMARK.md` with empirical LLM baseline vs Skill-assisted Agent accuracy findings (Skill Engine **100.00%** vs Vanilla LLM **70.54%** across 20 benchmark domains).
- **Automated Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert version `2.4.0`, **71 skills**, **27 engines**, **6 plugins**, and Overview narrative consistency.

## [2.3.2] - 2026-08-10

### Fixed & Hardened
- **README Overview Narrative Sync (P0 Fix)**: Synchronized stale narrative text in `README.md` Overview (line 23), ASCII architecture diagram (line 77), and activation instructions (line 148) from historical `67 skills / 23 engines` to current canonical counts (**71 skills / 27 engines**).
- **Audit Validator Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert strict Regex matches on Overview narrative skill & engine numbers against `registry.total_skills` and `registry.total_engines` (0 schema, lockfile, or narrative drift errors).

## [2.3.1] - 2026-08-10

### Fixed & Hardened
- **Metadata & Version Alignment (P0 Fix)**: Synchronized `package.json`, `package-lock.json`, and `registry/index.json` to canonical version `2.3.1` (71 skills, 27 engines, exact tier counts).
- **Audit Enforcer Upgrade**: Enhanced `tests/schema/validator.test.js` to automatically assert strict version consistency across `package.json`, `package-lock.json`, `registry/index.json`, and `README.md` catalog headers.
- **Trust Alignment (`verified_by` P1 Fix)**: Updated ruleset issuer audit metadata in `engines/rules/*.json` to transparently state `"Repository Maintainer — adamriofc"`.
- **SHA-256 Ruleset Anchor**: Expanded cryptographic trust anchor generator (`scripts/sha256sums.sh` & `engines/rules/integrity.js`) to cover all 4 statutory rulesets (`bpjs.json`, `pph21.json`, `marketplace.json`, `umkm.json`).

## [2.3.0] - 2026-08-10

### Added
- **4 Strategic Cross-Domain Intelligence Engines**:
  - `engines/regulatory-impact-engine.js`: Evaluates versioned statutory transitions (PP 20/2026, BPJS caps) against company operational profiles to compute business impact level, affected domains, action checklists, and statutory deadlines.
  - `engines/compliance-risk-engine.js`: Multi-Domain Compliance Health Audit (Tax, HR, Legal, Data/PDP, Commerce) computing a Compliance Health Score (0-100), domain health flags, detected violations, and a prioritized remediation roadmap.
  - `engines/business-scenario-engine.js`: Maps business profiles across the 8 Stages of the Indonesia Business Lifecycle (Incorporation ➔ HR Onboarding ➔ Payroll/THR ➔ Contracts ➔ Tax ➔ E-Commerce ➔ Financial Reporting ➔ Exit/Restructuring).
  - `engines/decision-engine.js`: Evaluates corporate financial & operational metrics (cash runway, gross margin, Thin Cap DER 4:1 ratio under PMK 172/2023, PPh 21 gross-up tax burden) to generate deterministic, prioritized business decision recommendations and driver classifications.
- **4 Flagship Cross-Domain Agent Skills**: `regulatory-impact` (under `tax-payroll-id`), `compliance-risk` (under `legal-id`), `business-scenario` (under `finance-id`), `decision-engine` (under `finance-id`), bringing total catalog to **71 Skills across 6 Plugins** & **27 Deterministic Engines**.
- **20-Domain Golden Benchmark**: Expanded static golden corpus (`tests/golden/`) to **85 golden cases across 27 engines** (20 benchmark domains) at **100.00% accuracy** and stable determinism.

## [2.2.1] - 2026-08-10

### Fixed & Hardened
- **Metadata & Catalog Sync**: Updated `tax-payroll-id/.claude-plugin/plugin.json` to rate-agnostic PPN/PPnBM description; corrected tax-payroll-id inventory count (18 skills) in `README.md`.
- **Registry Cross-Validation**: Upgraded `tests/schema/validator.test.js` to cross-validate registry IDs, plugins, skill paths, frontmatter metadata (`risk_level`, `rule_type`, `quality_tier`), engine paths, and README inventory section counts (0 schema or cross-field errors across all 67 skills).
- **Closed Security Boundaries**: Replaced dangling injection isolation blocks across ingestion skills (`contract-reviewer`, `pdp-compliance`, `phk-calculator`, `analisis-kompetitor-marketplace`, `somasi-draft-id`, `oss-kbli-navigator`, `haki-trademark-check`) with complete, closed `[SYSTEM INSTRUCTION] ... [UNTRUSTED DATA PAYLOAD] ... [END PAYLOAD]` runtime templates; added delimiter-break protection and adversarial fixtures (`fixtures/adversarial/`).
- **23-Engine Golden Benchmark**: Expanded deterministic benchmark harness (`scripts/benchmark.js`) and static golden corpus (`tests/golden/`) to **78 cases across all 23 engine modules** (16 domains) at 100% accuracy and stable determinism.
- **Engine Coercion Safety**: Hardened `engines/pph21-calculator.js` to clamp `NaN`/`Infinity`/hostile values to zero Rupiah balance without crashing or leaking numeric anomalies.
- **CI Dependency Upgrades**: Merged Dependabot PRs for GitHub Actions workflows (`actions/checkout` v7, `actions/setup-node` v7; Node 20/22/24 matrix green).

### Added
- **5 Ultra-Advanced Corporate & Enterprise Engines**:
  - `engines/pph21-grossup-calculator.js`: Circular PPh 21 tax allowance bisection loop & PMK 66/2023 Natura exemption thresholds.
  - `engines/pph-badan-calculator.js`: Corporate Income Tax (22%) with Pasal 31E UU PPh sliding scale facility (&le; 4.8B, 4.8B–50B, > 50B).
  - `engines/transfer-pricing-engine.js`: Thin Capitalization (DER 4:1 max ceiling), interest deduction barriers, & secondary dividend adjustments (PMK 172/2023).
  - `engines/ppn-ppnbm-calculator.js`: Statutory 12% PPN, PPnBM Luxury Goods Tax (10% to 200%), Other Basis DPP (11/12), & CIF import bases.
  - `engines/term-sheet-waterfall.js`: Indonesian startup VC liquidation preference exit waterfall (Seniority, Pari Passu, Participating with Caps).
- **6 Flagship Enterprise Agent Skills**: `pph21-grossup`, `pph-badan-calculator`, `transfer-pricing-audit`, `ppn-ppnbm-advanced`, `vc-term-sheet-waterfall`, `phk-advanced-matrix` (expanding total skills to **67 Skills across 6 Plugins** & **23 Deterministic Engines**).
- **Registry Update**: `registry/index.json` updated with 67 registered skills and quality tiers.

## [2.1.0] - 2026-08-10

### Added
- **Tax Engineering & Strategic Planning Skills**: 5 new flagship tax engineering, planning, and cross-border skills (`tax-planning`, `tax-optimization`, `tax-risk-analysis`, `tax-audit-preparation`, `tax-cross-border`) under `tax-payroll-id` (bringing total skill count to 60).
- **Machine-Readable Skill Registry**: `registry/index.json` machine-readable index mapping all 60 skills across 6 plugins with `quality_tier` classification (`source-verified`, `tested`, `expert-reviewed`).
- **Optional Integrations Architecture**: `integrations/README.md` defining static knowledge ➔ skill, calculation ➔ engine, live state ➔ API/tool principles.

## [2.0.1] - 2026-08-10

### Fixed
- **Claude Code Marketplace Schema**: `.claude-plugin/marketplace.json` updated with `$schema`, object `owner`, and `source` plugin declarations.
- **e-Faktur & Coretax PPN 12% Update**: `tax-payroll-id/skills/efaktur-helper/SKILL.md` updated for statutory 12% PPN rate and 11/12 DPP Nilai Lain (effective 11% burden).
- **UMKM Skill Synchronization**: `tax-payroll-id/skills/pph-final-umkm/SKILL.md` updated to reflect PP 20/2026 ruleset and Rp 4.8B turnover cap.
- **README Skill Inventory**: fixed stale descriptions for `pph-final-umkm` and `efaktur-helper` in the catalog.
- **CI Node Matrix**: updated to Node 20, 22, and 24 LTS runtimes.
- **Dependabot**: added `.github/dependabot.yml` for automated npm & GitHub Actions dependency tracking.

## [2.0.0] - 2026-08-10

### Added
- **Finance Core (`finance-id` plugin)**: 12 business finance & accounting skills — accounting-basics, financial-statements, cash-flow-analysis, budgeting-forecasting, financial-ratio-analysis, working-capital, cost-accounting, break-even-analysis, unit-economics, business-feasibility, financial-modeling, capital-budgeting.
- **8 deterministic finance engines** (pure standard math, no ruleset): `engines/break-even.js`, `depreciation.js` (SL/DDB/SYD), `npv.js` (+ terminal value), `irr.js` (bisection, self-consistency), `loan-amortization.js`, `financial-ratios.js` (14 ratios), `working-capital.js`, `eoq.js` — each with a golden corpus (`tests/golden/finance.json`, 11 cases) + unit module (`tests/units/finance-engines.test.js`).
- **Benchmark harness extended**: domain `finance` (8 engines, 11 golden cases) — all domains 100% deterministic.
- **PROVENANCE.md**: new `STANDARD_REFERENCE` Access Path + section 6 Finance & Accounting Standard Register (PSAK 1/16/23, SAK EMKM; IAI — 404 for automated clients, verified manually).

### Changed
- **Repo renamed**: `indonesian-agent-skills` → `indonesia-business-agent-skills` (automatic GitHub redirect).
- **Rebrand**: title "Indonesia Business Agent Skills", tagline *"Give AI agents a business brain for Indonesia."*; CORE (legal/tax/finance/HR) · BUSINESS (commerce) · CREATIVE (content) architecture; scope "6 business domains · 54 agent skills · 16 deterministic engines".
- `package.json`: name `indonesia-business-agent-skills`, version `2.0.0`; the `npm test` + `test:units` chain now includes `finance-engines.test.js` (9 modules).
- README: actual finance engine output examples (break-even, amortization, IRR) added; absolute `/tmp/...` paths replaced with `$PWD`.

### Fixed
- `scripts/benchmark.js`: the `--json-report`/`--llm-sample` argument parser now accepts both space (`--json-report path`) and `=` syntax; array case comparisons (e.g. `annual` depreciation) use deep-match instead of `===` reference equality.

### Benchmark (actual run 2026-08-10, Node v26.5.1, `scripts/benchmark.js`)
- PPh 21 100% (6 cases, 14.649 ops/s) · BPJS 100% (3, 14.329) · PHK 100% (3, 27.028) · Finance 100% (11, 4.099) — determinism 3× OK, 0 violations.

## [1.1.0] - 2026-08-10

### Added
- **Release Trust Anchor**: `SHA256SUMS.txt` + `scripts/sha256sums.sh generate|verify`, automatically verified in CI on every push.
- **Benchmark harness**: `scripts/benchmark.js` (deterministic accuracy vs golden corpus, 3× determinism, ops/second, LLM baseline option via OpenAI-compatible endpoint) + `docs/BENCHMARK.md` (no-fiction policy: only numbers from actual runs).
- **PROVENANCE.md expanded**: Access Path column (`DIRECT_DOCUMENT` / `REGISTRY_ENTRY` / `OFFICIAL_PAGE` / `SECONDARY_MIRROR`), Audit Scope Statement & Non-Claims section, and Provenance Change Log.
- **15 shortest skills enriched** with Scope & Safety + Worked Example (script-reels-tiktok, press-release-id, lokalisasi-slang-indonesia, tokopedia-seo-optimizer, linkedin-x-thread-id, spt-tahunan-guide, shopee-live-script, whatsapp-broadcast, buyer-negotiator, shopee-video-creator, bpjs-tenagakerja-admin, klaim-logistik-retur, tiktok-shop-affiliate, interview-id, gmb-local-seo).
- Community files: `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/regulatory-update.md`; GitHub topics (regtech, taxtech, legaltech, etc.).

### Fixed
- **Broken source links (404)** replaced with verified official links: UU 7/2021 (JDIH Kemenkeu download → BPK JDIH `Details/185162`), PP 55/2022 (JDIH Kemenkeu download → `jdih.kemenkeu.go.id/dok/pp-55-tahun-2022`).
- **Provenance precision**: BPJS-KES (archive portal root → Peraturan.go.id Perpres 64/2020), BPJS-JP-2015 (FAQ root → BPK JDIH PP 45/2015), BPJS-JP-2026 (FAQ root → verified SE PDF mirror), OSS-PP5 (oss.go.id root → Peraturan.go.id PP 5/2021), PDP (Kominfo timeout → Peraturan.go.id UU 27/2022).
- **README**: quickstart <60 seconds, actual engine outputs (not guesses), compatibility table with Verification Method & Last Verified columns, "synced via Cloud API" claim removed (honest: schema-validated, not cloud E2E).

### Changed
- `engines/rules/bpjs.json`: exact source URL per ruleset (BPJS-2015, BPJS-2025, BPJS-2026); `integrity.js` checksums updated.
- CI: `sha256sums.sh verify` step before `npm test`.

### Benchmark (actual run 2026-08-10)
- Golden corpus accuracy: PPh 21 100%, BPJS 100%, PHK 100% — determinism 3× OK; throughput 17.373 / 1.921 / 16.450 ops/second (Node v26.5.1).

## [1.0.0] - 2026-08-10

### Added
- 42 enterprise skills across 5 domain plugins, all carrying `risk_level` and `rule_type` frontmatter metadata.
- 8 deterministic calculation engines (PPh21, BPJS, THR, PHK, PPh23/26, UMKM final tax, marketplace fee, PKWT compensation).
- SSOT temporal rulesets with lifecycle status (`engines/rules/pph21.json`, `bpjs.json`); SHA-256 integrity checksums regenerated for lifecycle-enriched rulesets.
- Trust Envelope (confidence contract) appended to 8 flagship engine-driven skills.
- `REGULATORY_PIPELINE.md` operational procedure, granular provenance register with direct source URLs & article citations, community governance docs (`CONTRIBUTING.md`, `ROADMAP.md`).
- Deepened unit test coverage: boundary, negative, rounding, fallback and determinism assertions across the 4 newer engines.

### Changed
- Ruleset lifecycle fields (`status`, `verified_at`, `verified_by`, `review_interval_months`, `superseded_by`) added to every ruleset entry; `source.article` populated for gazette-level tracing.
- `tests/units/new-engines.test.js` replaced with an expanded 4-module boundary/matrix suite.

### Security
- Runtime integrity verifier unchanged; checksums updated to match lifecycle-enriched rulesets (any ruleset mutation outside the pipeline is detected at load time).