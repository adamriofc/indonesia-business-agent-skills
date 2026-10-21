# Domain Capability & Cross-Domain Validation Matrix

This document defines the intended capability boundary of `indonesia-business-agent-skills`.

The repository is **not a tax/legal toolkit with supporting domains**. It is a six-domain business reasoning substrate for AI agents. Tax and legal are only two lenses; the same Semantic Business Context can be consumed independently by HR, Finance, Marketing, and Strategic reasoning.

## 1. Canonical Domain Coverage

| Core domain | Primary purpose | Representative reasoning | Cross-domain inputs/outputs |
|---|---|---|---|
| `legal-id` | Indonesian legal/compliance reasoning | contract, PDP, OSS/KBLI, HAKI, legal memo/drafting | HR, Tax, Marketing, Strategy |
| `tax-id` | Indonesian tax reasoning | PPh/PPN/UMKM, transfer pricing, tax risk/planning | Finance, HR, Product, Legal |
| `hr-id` | Employment and workforce reasoning | payroll, BPJS, THR, PKWT/PKWTT, PHK, compensation | Tax, Finance, Legal, Strategy |
| `finance-id` | Business finance & accounting reasoning | unit economics, NPV/IRR, ratios, working capital, financing | Strategy, Marketing, HR, Tax |
| `marketing-id` | Market, selling, marketplace and customer-facing reasoning | market sizing, pricing/unit economics, marketplace fees, copy/SEO, competitor analysis | Finance, Product, Strategy |
| `strategic-id` | Strategic analysis and decision reasoning | Porter, BCG, scenario analysis, risk, MCDA, decision analysis | All business domains |

## 2. Domain-Independent Context Contract

Every domain should reason over the same business reality rather than creating isolated silos:

```text
Business Activity → KBLI
Product / Goods   → Product Context / BTKI when relevant
Business Archetype
Facts
Relations
Constraints
Objectives
Decision Options
```

The domain plugin then contributes a specialized lens. The LLM remains responsible for synthesis; deterministic engines provide calculations and invariant rule execution where applicable.

## 3. Cross-Domain Validation Families

The benchmark strategy should maintain at least one meaningful held-out scenario for each family below:

### Independent single-domain competence

- Legal-only scenario
- Tax-only scenario
- HR-only scenario
- Finance-only scenario
- Marketing-only scenario
- Strategic-only scenario

### Two-domain intersections

- Finance × Tax
- HR × Tax
- HR × Legal
- Marketing × Finance
- Marketing × Strategy
- Product × Tax
- Product × Marketing
- Legal × Strategy

### Multi-domain business decisions

- Expansion / branch opening
- Hiring plan and payroll impact
- Pricing / margin / marketplace economics
- Product import / landed-cost decision
- Compliance-risk decision with strategic trade-offs
- Investment or capacity decision constrained by finance, HR, legal, and tax

## 4. Validation Standard

A domain is considered **independently useful** only when:

1. It can solve representative single-domain cases without requiring another plugin merely to produce a valid answer.
2. Its deterministic engines, where applicable, pass domain-specific regression and invariant tests.
3. Its skills provide domain-specific procedures rather than generic advice.
4. Its output can be consumed by other domains through the shared context contract.
5. Its cross-domain contribution improves the final decision when the user actually needs that domain.

## 5. Anti-Bias Rule for Evaluation

Evaluation, README demos, external-validation cases, and public benchmarks must not be dominated by tax/legal examples merely because those domains are high-risk.

A balanced evaluation should demonstrate:

```text
Independent domain competence
        +
Cross-domain composition
        +
Decision quality improvement
```

Tax/legal accuracy remains critical, but it must not become the proxy for the utility of the whole repository.

## 6. Evidence Boundary

Current repository evidence establishes deterministic tests, benchmark infrastructure, provenance controls, release governance, and six-domain architecture. Independent external validation of every domain and real-world adoption are still separate evidence requirements.
