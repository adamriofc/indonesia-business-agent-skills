# LLM vs. Deterministic Engine Evaluation Methodology (`LLM_BENCHMARK_METHODOLOGY.md`)

This document defines the evaluation framework for comparing raw LLMs against the **Indonesia Business Agent Skills** hybrid engine architecture.

---

## 1. Evaluation Dimensions

| Dimension | Raw LLM (Prompt Only) | Hybrid Engine (Skills + Engine) | Metric Target |
|---|---|---|---|
| **Numerical Accuracy** | Probabilistic token prediction (frequent rounding/arithmetic errors) | Exact Node.js calculation (`engines/*.js`) | 100.00% |
| **Temporal Correctness** | Fails to detect date-based transition boundaries (e.g. BPJS March 1st cap change) | Automated ruleset selection via `effective_from` window | 100.00% |
| **Statutory Lineage** | Hallucinates or omits regulation numbers and articles | Full provenance envelope with gazette URLs | 100.00% |
| **Determinism** | Varies across temperature/sampling runs | Identical outputs across 3× repeated invocations | 0 Violations |
| **Prompt Injection Safety** | Vulnerable to payload hijacking and instructions override | Enforced delimiter boundaries (`[SYSTEM INSTRUCTION]`) | 100.00% |

---

## 2. Benchmark Benchmark Runner Execution

Execute the evaluation benchmark suite via terminal:

```bash
# Run deterministic engine benchmark (golden corpus)
node scripts/benchmark.js

# Optional: Run LLM comparative evaluation against OpenAI-compatible endpoint
LLM_BENCH_KEY=sk-... \
LLM_BENCH_BASE=https://api.openai.com/v1 \
LLM_BENCH_MODEL=gpt-4o-mini \
node scripts/benchmark.js --llm --llm-sample 15
```

---

## 3. Results Policy

In accordance with our **No-Fiction Policy**, benchmark scores published in `docs/BENCHMARK.md` represent actual execution metrics recorded on Node.js runtimes. No synthetic or extrapolated numbers are accepted into the repository documentation.
