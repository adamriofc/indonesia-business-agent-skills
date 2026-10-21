# Universal Agent Skill & Interoperability Protocol (`SKILL_PROTOCOL.md`)

This document defines the architectural specification and interoperability standards for `indonesia-business-agent-skills`.

---

## 1. Architectural Principles

All skills and computational engines adhere to **4 Core Architectural Principles**:

1. **Decoupled Reasoning & Calculation**: The Host Agent / LLM acts as the reasoning brain and orchestrator (intent parsing, context elicitation, tool selection, cross-domain plan, decision synthesis). Plugins, Skills, and Engines act as agent-native cognitive instruments / domain tools.
2. **Agent Capability Contract**: Skills declare explicit capability metadata (`requires`, `produces`, `deterministic`, `cross_domain_relevance`) and return structured result envelopes (`status`, `result`, `evidence`, `assumptions`, `warnings`, `safeToUse`) allowing seamless agent orchestration.
3. **Semantic Business Context Routing**: Business activities are mapped via KBLI codes (`engines/kbli-context-router.js`) into Business Archetypes (`PRODUCT_MANUFACTURING`, `PROFESSIONAL_SERVICE`, `CAPACITY_SERVICE`, `MARKETPLACE_PLATFORM`, `HYBRID`), while goods/products are anchored via the Product Context / BTKI layer (`engines/product-context.js`).
4. **Closed Security Boundary**: Ingestion skills wrap untrusted user content inside explicit, closed runtime delimiters: `[SYSTEM INSTRUCTION] ... [UNTRUSTED DATA PAYLOAD] ... [END PAYLOAD]`.

---

## 2. Universal Agent Compatibility & Installation Shorthands

### Universal Agent Skills CLI (`npx skills`)
Supported across OpenWork Desktop, OpenCode CLI, Claude Code, Cursor IDE, Codex, and custom frameworks:

```bash
# Install all 88 skills across 6 canonical plugins
npx skills add adamriofc/indonesia-business-agent-skills

# Install specific domain plugins
npx skills add adamriofc/indonesia-business-agent-skills --plugin tax-id
npx skills add adamriofc/indonesia-business-agent-skills --plugin strategic-id
```

### Claude Code Marketplace Manifest (`.claude-plugin/marketplace.json`)
Allows native one-click plugin discovery and installation within Claude Code:

```json
{
  "$schema": "https://json.schemastore.org/claude-plugin-marketplace.json",
  "owner": {
    "name": "adamriofc"
  },
  "plugins": [
    { "name": "tax-id", "source": "./tax-id" },
    { "name": "legal-id", "source": "./legal-id" },
    { "name": "hr-id", "source": "./hr-id" },
    { "name": "marketing-id", "source": "./marketing-id" },
    { "name": "finance-id", "source": "./finance-id" },
    { "name": "strategic-id", "source": "./strategic-id" }
  ]
}
```

---

## 3. Node.js SDK / Engine Integration

Computational engines require **zero third-party dependencies** and execute deterministically on Node.js 20+:

```javascript
const { calculatePPh21Monthly } = require('indonesia-business-agent-skills/engines/pph21-calculator');
const { calculatePhk } = require('indonesia-business-agent-skills/engines/phk-calculator');
const { analyzeRegulatoryImpact } = require('indonesia-business-agent-skills/engines/regulatory-impact-engine');

// PPh 21 TER Tax Calculation
const taxResult = calculatePPh21Monthly(10000000, 'TK/0', true, '2026-03-01');

// Regulatory Impact Analysis (PP 20/2026 Transition)
const impactResult = analyzeRegulatoryImpact({
  domain: 'umkm',
  fromRuleset: 'UMKM-2022',
  toRuleset: 'UMKM-2026',
  companyProfile: { entityType: 'corporate', annualRevenue: 5000000000 }
});
```
