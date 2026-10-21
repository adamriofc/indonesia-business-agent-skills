# Production Readiness Model & Operational Governance (`PRODUCTION_READINESS.md`)

Operational governance, readiness levels, human-review boundaries, and deterministic fallback policies for `indonesia-business-agent-skills`.

---

## 1. Production Readiness Taxonomy (Levels L0–L4)

To prevent misapplication and set realistic operational expectations, this repository classifies agent execution readiness across 5 levels:

| Level | Classification | Definition | Repository Status |
|---|---|---|---|
| **L0** | Experimental | Unverified or raw prompt prototype | N/A |
| **L1** | Unit-Tested | Engine math verified with basic unit tests | Exceeded |
| **L2** | Controlled Deterministic | Rulesets cryptographic SHA256 hashed, input validation enforced, non-coercive error boundaries | **Fully Achieved** |
| **L3** | Production Decision-Support | Deterministic engine calculations, standardized result envelopes, human review matrix, fallback policy | **Fully Achieved (Current State)** |
| **L4** | High-Stakes Autonomous Filing | Direct auto-filing to DJP/OSS without human CPA/advocate review | **Unsupported** (Explicitly Out of Scope) |

> **Current Production Capability**: **Level L3 — Production Decision-Support Infrastructure**.
>
> **Independent external validation status: **PENDING**.** L3 is an internal engineering/readiness classification and must not be interpreted as evidence that every domain calculation has been independently validated in a live enterprise environment.

---

## 2. High-Risk Human-Review Matrix

High-risk business and compliance domains require explicit human-in-the-loop review policies:

| Domain / Engine Task | Risk Level | Human Review Requirement | Operational Guidance |
|---|---|---|---|
| **PPh 21 Monthly & December Reconciliation** | HIGH | **Recommended** | Verify employee PTKP status & NIK/NPWP validation status before payroll run. |
| **PPh Badan Corporate Income Tax (Art. 31E)** | HIGH | **Required** | Licensed CPA review required for final SPT 1771 tax filing. |
| **PKWT vs PKWTT Labor Auto-Conversion** | HIGH | **Required** | Legal counsel review required before issuing employee termination or contract conversion notices. |
| **Thin Capitalization DER 4:1 Limitation** | HIGH | **Required** | Tax advocate review required for cross-border affiliate loan interest deduction filings. |
| **PPN 12% & PPnBM Invoice Audit** | MEDIUM | **Recommended** | Reconcile Coretax DPP Nilai Lain codes against monthly e-Faktur registers. |
| **BPJS Health & Social Security Splits** | MEDIUM | **Recommended** | Audit wage cap boundaries (March transition window) prior to monthly SIPP upload. |
| **Marketplace Fee & Margin Calculation** | LOW | **Optional** | Automate pricing margin calculations for D2C e-commerce operations. |
| **Strategic Portfolio & Scenario Frameworks** | MEDIUM | **Recommended** | Executive review recommended for multi-year capital allocation decisions. |

---

## 3. Deterministic Fallback & Isolation Policy

To maintain system reliability and prevent unhandled agent crashes:

1. **LLM Unavailable / Timeout**:
   - If the downstream LLM API is unavailable, **deterministic pure Node.js engines continue to function independently**.
   - Calculations and rulesets have **zero network or API dependencies**.

2. **Malformed or Invalid Inputs**:
   - High-risk engines enforce strict type & range validation (`requireRupiah`).
   - Invalid or negative inputs throw an explicit `INVALID_INPUT` error rather than coercing to a fabricated zero balance ("no fabricated answer" principle).

3. **Context Conflicts or Ambiguities**:
   - If KBLI code conflicts with business activity description, `validateBusinessContext` returns `CONTEXT_WARNING` (`KBLI_ARCHETYPE_MISMATCH`).
   - If taxpayer entity structure contradicts business title (e.g. Individual with PT title), returns `CONTEXT_CONFLICT`.
   - If Product/BTKI classification is unresolved or ambiguous, the engine withholds landed-tax arithmetic and returns `REQUIRES_REVIEW`.

4. **Stale or Unresolved Statutory Rulesets**:
   - Ruleset versions carry explicit statutory effective dates (`effective_from` / `effective_to`).
   - An out-of-coverage date does **not** fall back to an arbitrary baseline ruleset; it returns a review-required state.
   - Outdated but applicable rulesets trigger `OUTDATED_RULESET` warnings in result envelopes.

---

## 4. Supported vs Unsupported Use Cases

### ✅ Supported Production Use Cases:
- Automated pre-audit & compliance health checks for AI agents.
- Real-time tax withholding, severance, and invoice calculation for ERP/payroll backends.
- Strategic business lifecycle classification and framework applicability routing.
- High-throughput batch processing of financial metrics and unit economics.

### ❌ Unsupported / Prohibited Use Cases:
- Submitting final corporate tax returns (SPT 1771) or legal dispute filings without advocate/CPA review.
- Automated termination of employees without statutory mediation or legal review.
- Treating Product/BTKI candidate classification as a binding customs ruling without review.
- Real-time high-frequency automated stock trading or unregulated financial advice.

---

## 5. Security & Runtime Assumptions

- **Local / On-Premise Execution**: Engines run locally inside the host agent runtime environment.
- **Zero External Data Leakage from Deterministic Engines**: No PII, corporate revenues, or payroll numbers are sent to third-party endpoints by deterministic engines.
- **Cryptographic Trust Anchor**: `engines/rules/integrity.js` validates SHA256 hashes of statutory rulesets on module load.

---

## 6. Evidence & External Validation Boundary

The repository separates three evidence levels:

1. **Maintainer-owned engineering evidence** — unit/integration/security tests, deterministic benchmark corpus, cross-engine invariants, provenance checks, and release gates.
2. **Independent domain validation** — external practitioner review of held-out cases using a frozen rubric. This is currently **PENDING** and is tracked in `docs/EXTERNAL_VALIDATION.md`.
3. **Enterprise production proof** — sustained use by external organizations with operational feedback, incident history, and documented case studies. This is currently **NOT CLAIMED**.

Accordingly, the repository may state that it is **L3 Production Decision-Support**, but it should not imply that the repository is independently certified, enterprise-proven, or universally production-safe for high-stakes filing.
