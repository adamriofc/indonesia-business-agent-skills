# Design — Finance Core + Rebrand as Indonesia Business Agent Skills (v2.0.0)

- **Date**: 2026-08-10
- **Status**: Approved by the repository owner (decision: full v2.0.0 at once)
- **Repo**: `indonesian-agent-skills` → (renamed) `indonesia-business-agent-skills`
- **References**: 9.38/10 audit + strategic recommendations (Finance Core, rename, branding)

## 1. Decision Summary

| Decision | Choice |
|---|---|
| Release | **v2.0.0** (finance + rename + rebrand in one go) |
| Physical plugin structure | **No plugin rename** — the CORE/BUSINESS/CREATIVE hierarchy is documented in the README |
| Finance v1 scale | **12 skills + 8 engines** + golden corpus, unit tests, benchmark |

## 2. New Components

### 2.1 `finance-id/` plugin (12 skills)

All skills follow the existing pattern: `name/description/argument-hint/risk_level/rule_type` frontmatter + body with Scope & Safety and Worked Example sections (≥1.2KB):

1. `accounting-basics` — journal entries, debit/credit, accrual vs cash (LOW, internal-policy)
2. `financial-statements` — financial statement structure, PSAK 1 disclosure, accrual vs cash (MEDIUM, professional-standard)
3. `cash-flow-analysis` — direct/indirect method, FCF, cash runway (MEDIUM)
4. `budgeting-forecasting` — top-down/bottom-up, variance analysis (MEDIUM)
5. `financial-ratio-analysis` — engine linkage to `financial-ratios.js` (MEDIUM)
6. `working-capital` — engine linkage to `working-capital.js`, CCC (MEDIUM)
7. `cost-accounting` — COGS, product costing, absorption vs variable (MEDIUM)
8. `break-even-analysis` — engine linkage to `break-even.js` (LOW)
9. `unit-economics` — CAC/LTV, contribution margin per unit (LOW)
10. `business-feasibility` — UMKM feasibility framework (MEDIUM)
11. `financial-modeling` — 3-statement linkage + sensitivity table (deterministic) (MEDIUM)
12. `capital-budgeting` — NPV/IRR/payback/WACC decision framework → engine (MEDIUM)

### 2.2 8 deterministic engines `engines/*.js`

| File | Core exports |
|---|---|
| `break-even.js` | breakEvenUnits, breakEvenRevenue, contributionMargin, marginOfSafety |
| `depreciation.js` | straightLine, doubleDeclining, sumOfYearsDigits (residual value ≥ 0) |
| `npv.js` | npv(cashflows, rate), with terminalValue option |
| `irr.js` | irr(cashflows) via bisection (tolerance 1e-6), depends on `npv.js` |
| `loan-amortization.js` | monthlyPayment (annuity), amortizationSchedule, totalInterest |
| `financial-ratios.js` | current/quick/cash ratio, D/E, gross/net margin, ROA/ROE, inventory/receivable turnover, DSO/DPO/CCC |
| `working-capital.js` | netWorkingCapital, workingCapitalRequirement, cashConversionCycle |
| `eoq.js` | eoq, reorderPoint, annualHoldingCost, annualOrderCost |

Nature: pure mathematical formulas (not regulation) → **not placed in `engines/rules/`**, do not change the integrity manifest. Nearest Rupiah rounding; zero-division handling; negative inputs normalized.

### 2.3 Testing

- `tests/golden/finance.json` — corpus per engine, values computed by hand (standard formulas).
- `tests/units/finance-engines.test.js` — matrix: boundaries (n=0, 1, large), negatives, rounding, 3× determinism.
- `scripts/benchmark.js` — `finance` domain added (reads golden finance.json, per-engine runner via the `case.engine` field).
- `npm test` automatically detects the 6th plugin (validator discovery) → "6 plugins & 54 skills".

## 3. Finance Provenance (honest, non-statutory)

- New section in `PROVENANCE.md`: **Finance & Accounting Standard Register** — references PSAK 1 (financial statement presentation), PSAK 16 (depreciation), PSAK 23 (revenue), SAK EMKM; `STANDARD_REFERENCE` Access Path; sources: IAI (`iaiglobal.or.id`) + secondary references.
- Non-Claims extended: accounting standards ≠ statutes; finance formulas are standard math; PSAK amendments tracked via REGULATORY_PIPELINE notes (not rulesets).
- `risk_level` scheme for finance: LOW/MEDIUM (no HIGH — no legal/statutory decisions).

## 4. Rebranding & Rename

- **GitHub**: `gh repo rename indonesia-business-agent-skills` (automatic redirect) + `git remote set-url`.
- **README**: title "Indonesia Business Agent Skills", tagline *"Give AI agents a business brain for Indonesia."*, domain subheadline; CORE (legal/tax/finance/hr) / BUSINESS (ecommerce) / CREATIVE (content) architecture visualized; marketing figures: **6 business domains · 54 agent skills · 16 deterministic engines**; absolute `/tmp/opencode/...` path fixed in the quickstart; new CI badge URL.
- `package.json` name: `indonesia-business-agent-skills`.
- **CHANGELOG** v2.0.0; **ROADMAP** phase restructure: 1 Finance ✓, 2 Finance×Tax×HR integration, 3 Operations, 4 External benchmark, 5 SDK, 6 Ecosystem.
- `docs/BENCHMARK.md`: add a row with real run results for the 8 finance engines.

## 5. Non-Goals (not done now)

- Physical plugin rename / empty `operations-id` / `business-analysis-id` folders.
- npm publish, SDK, crypto/trading/investment, chasing 60+ skills.
- Finance regulatory rulesets (no legal basis for the formulas — managed as a standard register).

## 6. Execution Order & Verification

1. Write the 8 engines → compute golden values by hand → tests → `npm test` green.
2. Run the finance benchmark → record the actual figures in `docs/BENCHMARK.md`.
3. 12 finance-id skills → schema validator → green.
4. PROVENANCE register + README rebrand + CHANGELOG/ROADMAP + package.json rename.
5. Rename GitHub repo + remote URL.
6. Full `npm test` + `sha256sums.sh verify` + benchmark → green.
7. Commit + push + `gh release v2.0.0` + upload SHA256SUMS + CI/asset verification.
8. Internal audit checklist: all dimensions ≥9/10 (including viral/positioning via verified content, not claims).

## 7. Success Criteria

- `npm test` 100% green (6 plugins, 54 skills, 16 engines; existing 425+225 cases retained).
- Finance golden corpus 100% accuracy + determinism OK (actual run results in BENCHMARK.md).
- Rename validated: v2.0.0 release, SHA256SUMS assets match, CI success on new commits.
- All internal references to the repo name consistent; GitHub redirect works.