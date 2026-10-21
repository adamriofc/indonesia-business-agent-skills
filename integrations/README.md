# Optional External Integrations Architecture (`integrations/README.md`)

This directory defines the optional integration models for connecting `indonesia-business-agent-skills` to external live APIs, databases, and enterprise platforms.

---

## 1. Core Architectural Principle

> **Static knowledge ➔ Agent Skill (`SKILL.md`)**  
> **Deterministic calculation ➔ Local Engine (`engines/*.js`)**  
> **Live external state ➔ API / Tool Integration (`integrations/`)**

The core skill collection and calculation engines operate 100% locally with zero external npm or network dependencies. Live integrations are **optional capabilities** mounted by AI agents when live or user-specific data is required.

---

## 2. Integration Classification Matrix

| Category | Live Data Source | Integration Target | Use Case |
|---|---|---|---|
| **Live Foreign Exchange** | Bank Indonesia / OJK / Bank rates | Live FX API | Converting foreign currency invoices to IDR KMK rates |
| **Enterprise Payroll & ERP** | SAP / Oracle / Workday / Local HRIS | REST / GraphQL / Database | Pulling employee salary & tenure data for PPh 21 / PHK |
| **DJP Coretax & e-Faktur** | DJP Web Services / e-Faktur Gateway | Official DJP API | Validating NSFP numbers and fetching QR invoice details |
| **Marketplace Seller APIs** | Shopee / Tokopedia / TikTok Shop Seller APIs | Platform REST APIs | Syncing order fees, admin deductions, and live ad budgets |
| **Database & Analytics** | PostgreSQL / MySQL / BigQuery | SQL Query Tools | Generating cross-period tax equalisation and financial ratios |

---

## 3. Tool & Capability Mounting Pattern

In frameworks such as OpenWork, Claude Code, Cursor, and Codex, integrations are exposed as agent tools.

```text
                                  AI Agent
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
        Agent Skill Layer                       External Tool Layer
   (Instruction & Ruleset)                    (Live Data Integration)
                 │                                       │
                 ▼                                       ▼
      Deterministic Engine                    Live External API
     (Exact Computation)                    (Fetch Live Exchange Rate)
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     ▼
                        Auditable Structured Output
```

---

## 4. Security & Isolation Guarantee

- Core calculation engines (`engines/`) **never make network calls**.
- All external API interactions must declare network capabilities in skill frontmatter metadata (e.g. `metadata.capabilities: ["network:optional"]`).
- No secret keys or credentials are stored inside repository files; credentials must be injected via environment variables.
