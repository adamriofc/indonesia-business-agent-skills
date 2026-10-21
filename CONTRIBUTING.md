# Contributing to `indonesia-business-agent-skills`

Thank you for contributing to this project. Our purpose is **accurate, traceable, auditable Indonesian regulatory and business intelligence for AI agents** — every change must preserve the integrity guarantees of the repository.

## Ground Rules

1. **No unverifiable claims.** Every statutory figure must cite an official JDIH/gazette URL or a symmetric official source (see `REGULATORY_PIPELINE.md`).
2. **SSOT discipline.** Computation values live only in `engines/rules/*.json`. Skill markdown references ruleset Ids (`PPH21-2024`, `BPJS-2026`, ...) — it never hardcodes numbers that drift.
3. **Never mutate a released ruleset in place.** Append a new ruleset entry with a fresh `rulesetId`, `effective_from` and bumped `rulesetVersion`.
4. **Hash discipline.** Any edit to `engines/rules/*.json` requires recomputing `RULESET_CHECKSUMS` in `engines/rules/integrity.js` **in the same commit** (`sha256sum engines/rules/<file>.json`).

## Ways To Contribute

- **Fix a rate or limit** — open an issue tagged `regulatory-change` with the official source link, then submit the ruleset change as described below.
- **Add a skill** — create `<plugin>/skills/<skill-name>/SKILL.md` with YAML frontmatter (`name`, `description`, `argument-hint`, `risk_level`, `rule_type`) and follow the structure of existing skills (Security & Injection Isolation, Provenance & Governance, Hybrid Execution Model, Trust Envelope where applicable).
- **Improve engines/tests** — add golden corpus cases to `tests/golden/` and matrix cases to `tests/units/*-matrix.test.js`.

## Development Workflow

```bash
git clone git@github.com:adamriofc/indonesia-business-agent-skills.git
cd indonesia-business-agent-skills
npm ci
npm test          # MUST pass 100% before opening a PR
```

Commit style: conventional commits (`rules:`, `feat:`, `test:`, `docs:`, `fix:`). Example:

```
rules: extend BPJS JP cap for 2027 SE, update integrity hashes, add 2027 golden corpus
```

## Pull Request Checklist

- [ ] `npm test` green locally (all 8 test modules)
- [ ] Ruleset changes carry updated `RULESET_CHECKSUMS` in the same commit
- [ ] `PROVENANCE.md` and `REGULATORY_CHANGELOG.md` updated when rules change
- [ ] New skills pass the schema validator (frontmatter complete)
- [ ] No secrets, no personal data, no fabricated historical rates

## Review process

Maintainers review for factual accuracy, provenance quality, and test coverage. `regulatory-change` PRs are held until the Rule of Two Sources is satisfied; unverified rules stay `DRAFT` and are merged only as clearly-marked drafts.

## License

By contributing you agree your work is licensed under the same MIT license as this repository (`LICENSE`).