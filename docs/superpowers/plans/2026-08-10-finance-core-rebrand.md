# Finance Core + Rebrand (v2.0.0) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the finance-id plugin (12 skills) + 8 deterministic finance engines + golden corpus + tests + benchmark, rename the repository to `indonesia-business-agent-skills`, rebrand README/PROVENANCE/CHANGELOG/ROADMAP, release v2.0.0.

**Architecture:** Finance engines = pure Node functions (no ruleset; standard mathematical formulas); the finance-id plugin follows the existing plugin pattern; consistent `camelCase` signatures. Golden values computed by hand; test tolerance: float ±0.01, Rupiah ±1 (or per case).

**Tech Stack:** Node.js (no dependencies), node:test? — no; uses assert + the repository's manual runner (`npm test` + chain).

## Global Constraints

- No new npm dependencies; all engines plain CommonJS `module.exports`.
- Rupiah rounding: `Math.round` to integer; ratios: 4 decimals (or percentage strings at the skill-owned boundary).
- Function & field names follow the table below — consistent across tasks.
- All new files use LF, UTF-8 without BOM, no excessive comments (no AI slop).
- `npm test` MUST be green at the end of every task (chain of 8 files).
- No-fiction: benchmark figures only from actual runs.
- Skill frontmatter: `name`, `description`, `argument-hint`, `risk_level`, `rule_type` (the schema validator requires name+description).

## Engine Signature Table (used by all tasks)

| File | Signature |
|---|---|
| `engines/break-even.js` | `breakEvenUnits(fixedCosts, pricePerUnit, variableCostPerUnit)`, `breakEvenRevenue(fixedCosts, pricePerUnit, variableCostPerUnit)`, `contributionMargin(pricePerUnit, variableCostPerUnit)`, `contributionMarginRatio(pricePerUnit, variableCostPerUnit)`, `marginOfSafety(actualRevenue, breakEvenRevenue)` |
| `engines/depreciation.js` | `straightLine(cost, salvage, lifeYears)`, `doubleDeclining(cost, salvage, lifeYears)`, `sumOfYearsDigits(cost, salvage, lifeYears)` → `{ annual: number[], totalDepreciation, netBookValue }` |
| `engines/npv.js` | `npv(rate, cashflows)` (cashflows[0] at t=0), `npvWithTerminalValue(rate, cashflows, terminalValue, terminalYearIndex)` |
| `engines/irr.js` | `irr(cashflows, {maxIterations=200, tolerance=1e-6} = {})`, `irrFromNpv(npvFn, cashflows, opts)` — bisection in [-0.99, 10]; throws when no root exists |
| `engines/loan-amortization.js` | `monthlyPayment(principal, annualRate, months)`, `amortizationSchedule(principal, annualRate, months)` → `{ payment, schedule: [{month, payment, interest, principal, balance}] , totalInterest}` |
| `engines/financial-ratios.js` | `currentRatio(currentAssets, currentLiabilities)`, `quickRatio(currentAssets, inventory, currentLiabilities)`, `cashRatio(cash, currentLiabilities)`, `debtToEquity(totalLiabilities, totalEquity)`, `grossMargin(revenue, cogs)`, `netMargin(netIncome, revenue)`, `roa(netIncome, totalAssets)`, `roe(netIncome, totalEquity)`, `inventoryTurnover(cogs, avgInventory)`, `receivablesTurnover(revenue, avgReceivables)`, `daysSalesOutstanding(revenue, avgReceivables)`, `daysPayablesOutstanding(cogs, avgPayables)`, `daysInventoryOutstanding(cogs, avgInventory)`, `cashConversionCycle(dio, dso, dpo)` |
| `engines/working-capital.js` | `netWorkingCapital(currentAssets, currentLiabilities)`, `workingCapitalRatio(currentAssets, currentLiabilities)`, `cashConversionCycle(daysInventory, daysSalesOutstanding, daysPayables)`, `workingCapitalRequirement(cashCycleDays, costOfGoodsSoldPerDay)` |
| `engines/eoq.js` | `eoq(annualDemand, orderCost, holdingCostPerUnit)`, `reorderPoint(annualDemand, leadTimeDays, safetyStock=0)`, `annualHoldingCost(orderQuantity, holdingCostPerUnit)`, `annualOrderCost(annualDemand, orderQuantity, orderCost)` |

---

### Task 1: `engines/break-even.js` + golden case + unit test

**Files:**
- Create: `engines/break-even.js`, `tests/units/finance-engines.test.js` (module `break-even`)
- Modify: `tests/golden/finance.json` (add `BREAKEVEN-*` cases)

**Consumes:** — | **Produces:** functions per the table above.

- [ ] **Step 1: Write golden cases** in `tests/golden/finance.json`:
```json
  { "caseId": "BE-001", "engine": "break-even", "description": "Break-even unit & revenue, price 25.000, vc 15.000, fixed 20.000.000",
    "input": { "fixedCosts": 20000000, "pricePerUnit": 25000, "variableCostPerUnit": 15000, "actualRevenue": 60000000 },
    "expected": { "contributionMargin": 10000, "contributionMarginRatio": 0.4, "breakEvenUnits": 2000, "breakEvenRevenue": 50000000, "marginOfSafety": 10000000 } }
```
- [ ] **Step 2: Write unit tests** (module `break-even`) — exact math + 3× determinism + edge case (price=vc → throw/∞ avoided):
```js
const { breakEvenUnits, breakEvenRevenue, contributionMargin, contributionMarginRatio, marginOfSafety } = require('../../engines/break-even');
// BE-001: assert deepEqual against the expected above (tolerance ±0.01 float, ±1 money)
// edge case: pricePerUnit === variableCostPerUnit → throw new Error('Contribution margin cannot be zero')
```
- [ ] **Step 3: Minimal implementation** — standard formulas, guard `price > vc`, rounded Rupiah, ratios rounded to 4 decimals.
- [ ] **Step 4: Run `node tests/units/finance-engines.test.js`** → PASS + `node tests/schema/validator.test.js` stays green.
- [ ] **Step 5: Commit** `feat(finance): break-even engine + golden corpus`

### Task 2: `engines/depreciation.js` + golden + unit test

**Files:** Create `engines/depreciation.js`; Modify `tests/golden/finance.json`, `tests/units/finance-engines.test.js` (module `depreciation`)

- [ ] **Step 1: Golden cases:**
```json
  { "caseId": "DEP-SL-001", "engine": "depreciation", "method": "straightLine", "input": { "cost": 120000000, "salvage": 0, "lifeYears": 5 },
    "expected": { "annual": [24000000, 24000000, 24000000, 24000000, 24000000], "totalDepreciation": 120000000, "netBookValue": 0 } },
  { "caseId": "DEP-DDB-001", "engine": "depreciation", "method": "doubleDeclining", "input": { "cost": 120000000, "salvage": 0, "lifeYears": 5 },
    "expected": { "annual": [48000000, 28800000, 17280000, 10368000, 6220800], "totalDepreciation": 110668800, "netBookValue": 9331200 } },
  { "caseId": "DEP-SYD-001", "engine": "depreciation", "method": "sumOfYearsDigits", "input": { "cost": 120000000, "salvage": 0, "lifeYears": 5 },
    "expected": { "annual": [40000000, 32000000, 24000000, 16000000, 8000000], "totalDepreciation": 120000000, "netBookValue": 0 } }
```
- [ ] **Step 2: Unit tests** — full SL; DDB: `dep = min(rate*bookValue, bookValue - salvage)` per year, stop when `bookValue <= salvage || year > life`; SYD: `(cost-salvage)*(lifeYear - i)/(n(n+1)/2)`; determinism; validate `cost >= salvage >= 0`, `lifeYears >= 1`, else throw.
- [ ] **Step 3: Implement** — all three methods + `netBookValue = cost - totalDepreciation`.
- [ ] **Step 4: Run test module** → PASS. **Step 5: Commit** `feat(finance): depreciation engine`

### Task 3: `engines/npv.js` + golden + unit test

**Files:** Create `engines/npv.js`; modify golden + finance-engines.test.js (module `npv`)

- [ ] **Step 1: Golden:**
```json
  { "caseId": "NPV-001", "engine": "npv", "input": { "rate": 0.10, "cashflows": [-100000, 30000, 40000, 50000] },
    "expected": { "npv": -2103.68 } }, // tolerance ±0.02
  { "caseId": "NPV-TV-001", "engine": "npvWithTerminalValue", "input": { "rate": 0.10, "cashflows": [-100000, 30000, 40000], "terminalValue": 50000, "terminalYearIndex": 2 },
    "expected": { "npv": -2103.68 } } // 50.000 at t=2 -> same as NPV-001
```
  Note: NPV-001 computed as: 30000/1.1=27272.7273, 40000/1.21=33057.8512, 50000/1.331=37565.7400 → total PV 97896.3186 − 100000 = **−2103.6814**.
- [ ] **Step 2: Unit tests** — formula Σ cf[t]/(1+r)^t; rate=0 OK (direct sum); empty array → 0; throw when rate < -1.
- [ ] **Step 3: Implement.** **Step 4: Run PASS.** **Step 5: Commit** `feat(finance): npv engine`

### Task 4: `engines/irr.js` + golden + unit test

**Files:** Create `engines/irr.js`; modify golden + finance-engines.test.js (module `irr`); reuse `npv.js`

**Consumes:** `npv(rate, cashflows)` from Task 3.

- [ ] **Step 1: Golden (self-consistency):**
```json
  { "caseId": "IRR-001", "engine": "irr", "input": { "cashflows": [-100000, 30000, 40000, 50000] },
    "expected": { "irrMin": 0.088, "irrMax": 0.090 } }
```
  Validation: `npv(irr, cashflows)` must be ≈ 0 (±0.02); the NPV root in [-0.99, 10] for this case ≈ 0.0885–0.0895.
- [ ] **Step 2: Unit tests** — bisection: `a=-0.99, b=10`; iterate; if `npv(a)*npv(b) > 0` → throw `No IRR found in range`; result within [irrMin, irrMax]; self-consistency `|npv(r)| < 0.02`; determinism.
- [ ] **Step 3: Implement** — use `npv.js`; bisect until `|b-a| < tolerance`.
- [ ] **Step 4: Run PASS.** **Step 5: Commit** `feat(finance): irr engine`

### Task 5: `engines/loan-amortization.js` + golden + unit test

**Files:** Create `engines/loan-amortization.js`; modify golden + tests (module `loan`)

- [ ] **Step 1: Golden:**
```json
  { "caseId": "LOAN-001", "engine": "loan-amortization", "input": { "principal": 100000000, "annualRate": 0.12, "months": 24 },
    "expected": { "monthlyPayment": 4707346, "totalInterest": 12976306, "finalBalance": 0 } } // pmt ±1; totalInterest = pmt*24 - 100.000.000 ±24
```
  Calculation: r=0.01; (1.01)^24=1.26973465; pmt=1.000.000/(1−1/1.26973465)=4.707.346,09.
- [ ] **Step 2: Unit tests** — schedule: `balance_months = balance_prev*(1+r) - payment`; final month: payment adjusted so balance → 0 (±1); determinism; throw when months ≤ 0 or annualRate < 0.
- [ ] **Step 3: Implement.** **Step 4: Run PASS.** **Step 5: Commit** `feat(finance): loan amortization engine`

### Task 6: `engines/financial-ratios.js` + golden + unit test

**Files:** Create `engines/financial-ratios.js`; modify golden + tests (module `ratios`)

- [ ] **Step 1: Golden (one consistent input set):**
```json
  { "caseId": "RAT-001", "engine": "financial-ratios", "input": { "currentAssets": 500000000, "currentLiabilities": 250000000, "inventory": 150000000, "cash": 80000000, "totalLiabilities": 600000000, "totalEquity": 400000000, "revenue": 1200000000, "cogs": 800000000, "netIncome": 120000000, "totalAssets": 1000000000, "avgInventory": 200000000, "avgReceivables": 150000000, "avgPayables": 100000000 },
    "expected": { "currentRatio": 2.0, "quickRatio": 1.4, "cashRatio": 0.32, "debtToEquity": 1.5, "grossMargin": 0.3333, "netMargin": 0.1, "roa": 0.12, "roe": 0.3, "inventoryTurnover": 4.0, "receivablesTurnover": 8.0, "daysSalesOutstanding": 45.625, "daysPayablesOutstanding": 45.625, "daysInventoryOutstanding": 91.25, "cashConversionCycle": 91.25 } }
```
- [ ] **Step 2: Unit tests** — percent vs decimal: ratios = 4-decimal values (grossMargin 0.3333); days: 365/x (x>0); zero divisor → throw `Denominator cannot be zero`.
- [ ] **Step 3: Implement.** **Step 4: Run PASS.** **Step 5: Commit** `feat(finance): financial ratios engine`

### Task 7: `engines/working-capital.js` + golden + unit test

**Files:** Create `engines/working-capital.js`; modify golden + tests (module `workingCapital`)

- [ ] **Step 1: Golden:**
```json
  { "caseId": "WC-001", "engine": "working-capital", "input": { "currentAssets": 500000000, "currentLiabilities": 250000000, "daysInventory": 60, "daysSalesOutstanding": 45, "daysPayables": 30, "cashCycleDays": 75, "cogsPerDay": 2000000 },
    "expected": { "netWorkingCapital": 250000000, "workingCapitalRatio": 2.0, "cashConversionCycle": 75, "workingCapitalRequirement": 150000000 } }
```
- [ ] **Step 2: Unit tests** — CCC = dio+dso−dpo; WCR = cycleDays × cogsPerDay; throw when currentLiabilities ≤ 0.
- [ ] **Step 3: Implement.** **Step 4: Run PASS.** **Step 5: Commit** `feat(finance): working capital engine`

### Task 8: `engines/eoq.js` + golden + unit test

**Files:** Create `engines/eoq.js`; modify golden + tests (module `eoq`)

- [ ] **Step 1: Golden:**
```json
  { "caseId": "EOQ-001", "engine": "eoq", "input": { "annualDemand": 12000, "orderCost": 100000, "holdingCostPerUnit": 6000, "leadTimeDays": 7, "safetyStock": 0 },
    "expected": { "eoq": 633, "reorderPoint": 230, "annualHoldingCost": 1899000, "annualOrderCost": 1897322 } }
```
  Calculation: EOQ=√(2·12000·100000/6000)=√400000=632.46→633 (round). Reorder = 12000/365·7=230.14→230. Holding=(633/2)·6000=1,899,000. Order cost=(12000/633)·100000=1,895,734.6 → 1,895,735? (12000/633=18.95734; ×100000=1,895,734) — **verify at execution time with node; adjust expected ±1**.
- [ ] **Step 2: Unit tests** — guard D>0, H>0, S>0; round EOQ; determinism.
- [ ] **Step 3: Implement.** **Step 4: Run PASS.** **Step 5: Commit** `feat(finance): eoq engine`

### Task 9: Benchmark harness — domain `finance`

**Files:** Modify `scripts/benchmark.js` (add the finance domain)

- [ ] **Step 1:** Add `runFinance(c)` runner: switch on `c.engine` → call the corresponding engine (`method` field for depreciation), map expected keys → results; the domain list gains `{ name: 'finance', label: 'Finance (8 deterministic engines)', golden: 'finance', run: runFinance }`.
- [ ] **Step 2:** Add golden parser `loadGolden('finance')` (already generic) — the `DOMAINS` list also includes finance.
- [ ] **Step 3:** Run `node scripts/benchmark.js --json-report /tmp/bench-v2.json` → 100% accuracy on all domains; record the rows in `docs/BENCHMARK.md` (new table with v2.0.0 run results, Node version).
- [ ] **Step 4:** Commit `feat(finance): extend benchmark harness to finance engines`

### Task 10: Plugin `finance-id` — 12 skills

**Files:** Create `finance-id/.claude-plugin/plugin.json` (following the other plugins' pattern: name `finance-id`, long description, author `adamriofc`, version `1.0.0`) and 12 `finance-id/skills/<name>/SKILL.md` files.

**Frontmatter & core content of each skill (actual):**
- accounting-basics: risk LOW, rule_type internal-policy. Content: debit=left/credit=right rule; paired journal entries; accrual vs cash; credit purchase journal example; Scope & Safety (not a substitute for an accountant; SAK EMKM for UMKM); Worked Example of a Rp 5 million credit purchase of supplies.
- financial-statements: risk MEDIUM, rule_type professional-standard. Content: 3 statements (Income Statement/Balance Sheet/Cash Flow) + line items & linkage; PSAK 1 key disclosure points; accrual; simple financial statement structure example + equity scheme; relationship to `laporan-keuangan-psak` (difference: this one is general analysis/presentation, that one is SAK EMKM for bank credit).
- cash-flow-analysis: risk MEDIUM. Content: direct vs indirect method; FCF = OCF − Capex; cash runway = cash / monthly burn; example: OCF 150 million, Capex 40 million → FCF 110 million; runway 300 million cash / 25 million burn = 12 months.
- budgeting-forecasting: risk MEDIUM. Content: top-down vs bottom-up; variance = actual − budget; rolling forecast; 5% variance threshold example; budget flexibility when volume rises.
- financial-ratio-analysis: risk MEDIUM. Content: invoke `engines/financial-ratios.js`; 4 ratio groups (liquidity, solvency, profitability, efficiency); common benchmarks (current ≥1.5, D/E <2 for conservative SMEs — with an industry-differs note); example using RAT-001 inputs.
- working-capital: risk MEDIUM. Content: `working-capital.js` engine; CCC; cash conversion requirements for UMKM; WC-001 example.
- cost-accounting: risk MEDIUM. Content: COGS (beginning inventory + purchases − ending); absorption vs variable costing; simple product costing; UMKM COGS example.
- break-even-analysis: risk LOW. Content: `break-even.js` engine; contribution margin; multi-product weighted average; BE-001 example; limitations (constant price assumption).
- unit-economics: risk LOW. Content: LTV (avg revenue per customer × retention horizon), CAC, contribution margin per unit; LTV:CAC ≥3 heuristic ratio (with the note "industry heuristic, not a binding rule"); local SaaS example.
- business-feasibility: risk MEDIUM. Content: 5-aspect framework (market, technical, financial, legal, risk); required data; mini feasibility example for a coffee shop UMKM (Rp 250 million investment, ~3.5-year payback — example figures consistent with the engines).
- financial-modeling: risk MEDIUM. Content: 3-statement linkage (sales → Income Statement → Balance Sheet → Cash Flow); sensitivity table (3-scenario template: pessimistic/base/optimistic); accounting consistency; example scenario of a 10% sales decline.
- capital-budgeting: risk MEDIUM. Content: accept when NPV>0, IRR>WACC, payback; simple WACC (ke = cost of equity, kd = interest × (1−tax)); npv/irr engine linkage; example: machine purchase of Rp 2 billion (5-year flows), IRR vs WACC 12%.

Every skill: body with at least Purpose/Hybrid Execution (when an engine exists), Scope & Safety (≥4 bullets, including legal/honesty), Worked Example (concrete input → output) sections, ≥1,200 bytes.

- [ ] **Step 1:** Create `finance-id/.claude-plugin/plugin.json`.
- [ ] **Step 2-13:** Write the 12 SKILL.md files (actual content per the table above, using the same standard MARKDOWN format as the other skills).
- [ ] **Step 14:** `node tests/schema/validator.test.js` → "Discovered 6 plugin(s) & 54 skills" green.
- [ ] **Step 15:** Commit `feat(finance): finance-id plugin with 12 business finance skills`

### Task 11: PROVENANCE.md — Finance & Accounting Standard Register

**Files:** Modify `PROVENANCE.md`

- [ ] **Step 1:** Add the `STANDARD_REFERENCE` Access Path to the legend (Section 1.1).
- [ ] **Step 2:** New `## 6. Finance & Accounting Standard Register (Non-Statutory)` section — table per rule `FIN-BASIS-01` (PSAK 1 financial statement presentation), `FIN-DEP-01` (PSAK 16 depreciation), `FIN-REV-01` (PSAK 23 revenue), `FIN-SAK-EMKM-01` (SAK EMKM) — columns Rule ID / Standard / Issuer | Access Path | Status | Verified At | Verification Link (IAI: https://web.iaiglobal.or.id/SAK-IAI — HTTP verify at execution time; if non-200, mark `OFFICIAL_PAGE` + note "verified manually").
- [ ] **Step 3:** Add to Non-Claims: "Accounting standards are not positive law; finance formulas are standard math; PSAK amendments are tracked via the note pipeline, not runtime rulesets".
- [ ] **Step 4:** Commit `docs: finance & accounting standard register`

### Task 12: README rebrand + package.json + CHANGELOG + ROADMAP + BENCHMARK

**Files:** Modify `README.md`, `package.json`, `CHANGELOG.md`, `ROADMAP.md`, `docs/BENCHMARK.md`

- [ ] **Step 1:** `package.json` name → `indonesia-business-agent-skills`, version `2.0.0`.
- [ ] **Step 2:** README: title + tagline *"Give AI agents a business brain for Indonesia."*; subheadline "Legal, tax, finance, HR, e-commerce, and content — grounded in Indonesian rules, workflows, and deterministic engines."; CORE (Legal/Tax/Finance/HR) / BUSINESS (Commerce) / CREATIVE (Content) architecture diagram; the "6 business domains · 54 agent skills · 16 deterministic engines" figures; replace all old repo URLs → `indonesia-business-agent-skills`; fix the absolute `/tmp/opencode/indonesian-agent-skills` path in the Cursor section → `$PWD`; add the Finance block to the plugin inventory.
- [ ] **Step 3:** CHANGELOG v2.0.0 (new, on top) — finance core, 12 skills, 8 engines, rename, rebrand, finance benchmark.
- [ ] **Step 4:** ROADMAP — "Shipped (v2.0.0)": Finance Core ✓, rename ✓; In Progress: Finance×Tax×HR integration, Operations (Phase 3), LLM baseline; Planned: SDK, Ecosystem.
- [ ] **Step 5:** BENCHMARK.md — add the finance table (figures from Task 9's actual run), update the date/Node header.
- [ ] **Step 6:** Commit `docs: v2.0.0 rebrand + finance documentation`

### Task 13: Rename GitHub repo + remote

**Files:** none repo-side; gh/git operations

- [ ] **Step 1:** `gh repo rename indonesia-business-agent-skills --repo adamriofc/indonesian-agent-skills --yes` (automatic redirect).
- [ ] **Step 2:** `git remote set-url origin https://github.com/adamriofc/indonesia-business-agent-skills.git`; re-verify with `git remote -v`.
- [ ] **Step 3:** `curl -I https://github.com/adamriofc/indonesia-business-agent-skills` → 200; `curl -sI https://github.com/adamriofc/indonesian-agent-skills` → 301 (redirect).

### Task 14: Full verify + commit + push

- [ ] **Step 1:** `npm test` full → all green (6 plugins 54 skills, old 425+225 matrix, 8 finance modules, security).
- [ ] **Step 2:** `./scripts/sha256sums.sh verify` → OK.
- [ ] **Step 3:** `node scripts/benchmark.js --json-report /tmp/bench-v2.json` → all domains 100%.
- [ ] **Step 4:** `git add -A && git commit` (v2.0.0 message) `&& git push origin master`.

### Task 15: Release v2.0.0 + CI verification

- [ ] **Step 1:** `gh release create v2.0.0` (title "Indonesian Business Agent Skills — Finance Core & Repositioning") + upload SHA256SUMS.
- [ ] **Step 2:** Verify the downloaded asset matches the manifest; `gh run list` after push → success.
- [ ] **Step 3:** Internal audit checklist (dimensions ≥9/10): engineering (tests green), breadth (6 domains), depth (all skills ≥1.2KB, same pattern), regulatory trust (honest register), documentation (README/BENCHMARK updated), commercialization (positioning), viral (branding + real demos).

## Self-Review Notes (run after the plan is written)

- Spec coverage: every spec section (components, provenance, rebrand, release, non-goals) is covered by tasks 1–15.
- Placeholder scan: BE/DEP/NPV/LOAN/RAT/WC golden values are already actual; EOQ and IRR are marked "verify at execution time" with explicit adjustment rules (±1; range) — not placeholders.
- Type consistency: the signatures in the Global Constraints table are used across all tasks; `annual` array vs object is consistent; IRR self-consistency uses the npv function from Task 3.