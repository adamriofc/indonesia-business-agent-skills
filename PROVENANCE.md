# Granular Statutory Provenance Register (`PROVENANCE.md`)

Every computational rule and legal prompt instruction in `indonesia-business-agent-skills` is traceably linked to official Indonesian government gazettes and versioned rulesets (`engines/rules/`).

---

## 1. Rule Lineage Register

### 1.1 Access Path Legend & Source Quality Taxonomy

Every rule and computational engine is traceably classified across **4 Source Quality Tiers**:
- **`STATUTORY`**: Primary official gazettes issued by the Government of Indonesia (UU, PP, PMK, Perpres, Permenaker) published via official JDIH databases (`PRIMARY`).
- **`PROFESSIONAL_STANDARD`**: Peer-reviewed academic and professional frameworks (HBR, Porter, BCG, Ansoff, SAK EMKM, PSAK) (`PRIMARY`).
- **`COMMERCIAL_POLICY`**: Official commercial terms and fee structures published by platform seller centers (Shopee, Tokopedia, TikTok Shop) (`PRIMARY`).
- **`INTERNAL_HEURISTIC`**: Repository maintainer-calibrated evaluation heuristics (e.g. Risk Velocity Multipliers, MCDA normalization weights) transparently documented as internal methodology (`SECONDARY_VERIFIED`).

| Access Path | Definition |
|---|---|
| `DIRECT_DOCUMENT` | Official attachment/PDF from the issuing institution, directly downloadable |
| `REGISTRY_ENTRY` | Document entry in an official national legal registry (BPK JDIH, Peraturan.go.id, ministry JDIH) |
| `OFFICIAL_PAGE` | Official page of the issuing institution; the document is not published as open text for download |
| `STANDARD_REFERENCE` | Professional/accounting standard from the issuing institution (not positive law); referenced as a preparation principle, not as a rate source |
| `SECONDARY_MIRROR` | Copy of an official document published by a verified third party (content compared against the official portal) |

### 1.2 Statutory Rules

| Rule ID | Statute / Gazette | Issuer / Authority | Access Path | Source Quality | Audit Status | Verified At | Verification Link |
|---|---|---|---|---|---|---|---|
| `PPH21-TER-A-01` | PMK No. 168/2023 | Directorate General of Taxes (DJP) | `DIRECT_DOCUMENT` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [PMK 168/2023 PDF](https://www.pajak.go.id/sites/default/files/2024-02/PMK%20168%20Tahun%202023%20Tentang%20PPh%20Pasal%2021%20TER.pdf) |
| `PPH21-ART17-01` | UU No. 7/2021 — Pasal 17 paragraph (1) letter a | Government of the Republic of Indonesia (Kemenkeu) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [BPK JDIH — UU 7/2021 (HPP)](https://peraturan.bpk.go.id/Details/185162/uu-no-7-tahun-2021) |
| `PPH23-SERVICE-01` | UU No. 36/2008 — Pasal 23 paragraph (1) letter c | Directorate General of Taxes | `OFFICIAL_PAGE` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [Pajak.go.id — PPh 23](https://pajak.go.id/id/pph-pasal-23) |
| `PPH26-OFFSHORE-01` | UU No. 36/2008 — Pasal 26 | Directorate General of Taxes | `OFFICIAL_PAGE` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [Pajak.go.id — PPh 26](https://pajak.go.id/id/pph-pasal-2126) |
| `UMKM-PP55-01` | PP No. 55/2022 — Pasal 56 & 57 | Government of the Republic of Indonesia (Kemenkeu) | `REGISTRY_ENTRY` | `PRIMARY` | `SUPERSEDED` | 2026-08-10 | [JDIH Kemenkeu — PP 55/2022](https://jdih.kemenkeu.go.id/dok/pp-55-tahun-2022) |
| `UMKM-PP20-01` | PP No. 20/2026 — Pasal 56 & 57 (Amended) | Government of the Republic of Indonesia (Kemenkeu) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [JDIH Kemenkeu — PP 20/2026](https://jdih.kemenkeu.go.id/dok/pp-20-tahun-2026) |
| `BPJS-KES-01` | Perpres No. 64/2020 — Pasal 28 | President of the Republic of Indonesia (Kemenkeu) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [Peraturan.go.id — Perpres 64/2020](https://peraturan.go.id/id/perpres-no-64-tahun-2020) |
| `BPJS-JP-2015` | PP No. 45/2015 — Pasal 29 | President of the Republic of Indonesia (Kemnaker) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [BPK JDIH — PP 45/2015](https://peraturan.bpk.go.id/Details/5613/pp-no-45-tahun-2015) |
| `BPJS-JP-2024` | PP No. 45/2015 jo. SE B/141/022004 | BPJS Ketenagakerjaan | `OFFICIAL_PAGE` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [Official BPJS TK Portal](https://faq-int.bpjsketenagakerjaan.go.id/) |
| `BPJS-JP-2025` | SE B/726/022025 | BPJS Ketenagakerjaan | `SECONDARY_MIRROR` | `SECONDARY_VERIFIED` | `VERIFIED` | 2026-08-10 | [SE B/726/022025 PDF](https://www.ptgasi.co.id/wp-content/uploads/2025/05/B-726-022025-PERUBAHAN-BATASAN-UPAH-DAN-MANFAAT-JP-2025.pdf) |
| `BPJS-JP-2026` | SE B/3307/022026 | BPJS Ketenagakerjaan | `SECONDARY_MIRROR` | `SECONDARY_VERIFIED` | `VERIFIED` | 2026-08-10 | [SE B/1226/022026 PDF (mirror)](https://494075.fs1.hubspotusercontent-na1.net/hubfs/494075/compliance-portal/notification-number-b1226022026.pdf) |
| `PKWT-COMP-01` | PP No. 35/2021 — Pasal 15 to 17 | President of the Republic of Indonesia (Kemnaker) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [JDIH Kemnaker — PP 35/2021](https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021) |
| `PHK-UP-01` | PP No. 35/2021 — Pasal 40 paragraph (2) | President of the Republic of Indonesia (Kemnaker) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [JDIH Kemnaker — PP 35/2021](https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021) |
| `PHK-UPMK-01` | PP No. 35/2021 — Pasal 40 paragraph (3) | President of the Republic of Indonesia (Kemnaker) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [JDIH Kemnaker — PP 35/2021](https://jdih.kemnaker.go.id/peraturan/detail/1723/peraturan-pemerintah-nomor-35-tahun-2021) |
| `THR-PERMEN-01` | Permenaker No. 6/2016 — Pasal 2 & 3 | Ministry of Manpower of the Republic of Indonesia | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [JDIH Kemnaker — Permenaker 6/2016](https://jdih.kemnaker.go.id/peraturan/detail/741) |
| `PDP-BASES-01` | UU No. 27/2022 — Pasal 20 | House of Representatives of the Republic of Indonesia (Kominfo) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [Peraturan.go.id — UU 27/2022 (PDP)](https://peraturan.go.id/id/uu-no-27-tahun-2022) |
| `KUHPER-1320-01` | KUHPerdata — Pasal 1320 | Supreme Court of the Republic of Indonesia | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [MA Registry — KUHPerdata](https://putusan3.mahkamahagung.go.id/peraturan/detail/11e9da09d9de34448c7c313834353435.html) |
| `KUHPER-1266-01` | KUHPerdata — Pasal 1266 | Supreme Court of the Republic of Indonesia | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [MA Registry — KUHPerdata](https://putusan3.mahkamahagung.go.id/peraturan/detail/11e9da09d9de34448c7c313834353435.html) |
| `HAKI-UU20-01` | UU No. 20/2016 — Pasal 20 & 21 | DJKI (Ministry of Law and Human Rights) | `OFFICIAL_PAGE` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [DJKI — UU 20/2016](https://www.dgip.go.id/peraturan/uu-no-20-tahun-2016) |
| `OSS-PP5-01` | PP No. 5/2021 — Pasal 10 to 14 | President of the Republic of Indonesia (BKPM) | `REGISTRY_ENTRY` | `PRIMARY` | `VERIFIED` | 2026-08-10 | [Peraturan.go.id — PP 5/2021](https://peraturan.go.id/id/pp-no-5-tahun-2021) |

### 1.3 Provenance Change Log (link changes in this register)

| Date | Rule | Change | Reason |
|---|---|---|---|
| 2026-08-10 | `PPH21-ART17-01` | jdih.kemenkeu.go.id download PDF → BPK JDIH entry for UU 7/2021 | Old link **404** (dead) |
| 2026-08-10 | `UMKM-PP55-01` | jdih.kemenkeu.go.id download PDF → JDIH Kemenkeu document page | Old link **404** (dead) |
| 2026-08-10 | `BPJS-KES-01` | Archive portal root → Peraturan.go.id entry for Perpres 64/2020 | Precision: document entry, not a category page |
| 2026-08-10 | `BPJS-JP-2015` | FAQ portal root → BPK JDIH entry for PP 45/2015 | Precision: document entry, not a portal page |
| 2026-08-10 | `BPJS-JP-2026` | FAQ portal root → SE PDF mirror | SE is not published centrally; verified mirror |
| 2026-08-10 | `PDP-BASES-01` | Kominfo JDIH → Peraturan.go.id | Kominfo JDIH could not be verified automatically (timeout) |
| 2026-08-10 | `OSS-PP5-01` | oss.go.id (root) → Peraturan.go.id entry for PP 5/2021 | Precision: document entry, not a portal page |

---

## 2. Ruleset Lifecycle Status

```text
DRAFT       → Under preparation or unverified data
VERIFIED    → Checked against official government source
RELEASED    → Published in a versioned release
SUPERSEDED  → Replaced by a newer effective ruleset
ARCHIVED    → No longer applicable
```

All rules listed above carry status `VERIFIED` as of 2026-08-10. Active statutory rulesets resolved by engine runtime: `PPH21-2024`, `BPJS-2026`, `PKWT-2021`, `PHK-2021`, `THR-2016`, `UMKM-2022`, `PDP-2022`, `PPh23-26 (2023)` — see `engines/rules/` and `REGULATORY_PIPELINE.md` for review cadence.

---

## 3. Ruleset Cryptographic Integrity (Trust Anchor)

- `engines/rules/integrity.js` holds the SHA-256 manifest of every ruleset; `verifyRulesetIntegrity(filename)` is validated on every `npm test` run.
- The manifest is updated only alongside committed ruleset changes; releases publish `SHA256SUMS.txt` as the public anchor (see release notes).
- Trust model boundary: the hash binds **file content**, not issuer authentication (non-PKI, non-notarized). Issuer verification is performed through the human pipeline below.

---

## 4. Audit Scope Statement & Non-Claims

### 4.1 What this register claims (verified 2026-08-10)

1. **Link**: Every link was verified over HTTP (status 200) or verified manually via browser for anti-bot entries (see item 3 in 4.2).
2. **Financial values & rates**: Key figures (JP wage caps 2024–2026, PPh 21 TER rates, PP 35/2021 severance) were cross-checked against ≥2 independent sources before entering the ruleset.
3. **Time effectiveness**: Every ruleset carries `effective_from` / `effective_to`; the engine performs deterministic date-based selection.

### 4.2 Non-claims (explicitly out of scope)

1. **The `BPJS-2015` ruleset stores end-of-period cap values** (Rp 10.042.300, per the 2024 SE), not historical yearly values for 2015–2023. For per-year historical values, refer to each annual SE (register rows `BPJS-JP-2024`/`BPJS-JP-2025`).
2. **BPJS Ketenagakerjaan SEs are not published centrally as digital text**; third-party mirrors are used (`SECONDARY_MIRROR`) and their content is compared against official releases per branch office.
3. **MA Registry (KUHPerdata) and DJKI (UU 20/2016) entries block automated clients** (HTTP 403 anti-bot). Entries were verified manually via a human browser; links still point to official authorities.
4. **Perpres 59/2024** (limited amendments to health provisions) is in the review pipeline; current employer rates and wage caps still reference Perpres 64/2020. See `REGULATORY_PIPELINE.md`.
5. **Not notarization**: the SHA-256 checksum binds repository file content, not the issuer's digital signature. Issuer integrity is maintained through internal review checklist (`verified_by: "Repository Maintainer — adamriofc (Internal Review Checklist)"`) and the regulatory pipeline.
6. **Accounting standards are not positive law**: PSAK/SAK EMKM (register Section 6) are professional standards issued by IAI; the finance formulas in the engines are standard math not bound to standard amendments. PSAK amendments are tracked through the issue/review pipeline, not runtime rulesets. The `SAK-IAI` page returned 404 for automated clients at verification time (the parent domain was verified live); entries are marked `OFFICIAL_PAGE` + verified manually.

---

## 5. Marketplace Policy Rules (Non-Statutory — Platform Policy)

The following rules govern marketplace fee engines (`rulesetId: MKPL-FEE-2024`, effective 2024-07-01 onwards). These are **platform commercial policies**, not statutory law, and may change without public gazette notice. Versioned as SSOT in `engines/rules/marketplace.json` with a mandatory 3-month review cycle.

### Shopee (fee_rates.shopee)

| Rule ID | Tier | Admin Fee | Verified Against | Last Checked |
|---|---|---|---|---|
| `MKPL-SHOPEE-NSTAR` | Non-Star | 4.0% | Shopee Seller Center Help | 2026-08-10 |
| `MKPL-SHOPEE-STAR` | Star | 6.0% | Shopee Seller Center Help | 2026-08-10 |
| `MKPL-SHOPEE-STARPLUS` | Star+ | 6.5% | Shopee Seller Center Help | 2026-08-10 |
| `MKPL-SHOPEE-MALL` | Mall | 8.5% | Shopee Seller Center Help | 2026-08-10 |

### Tokopedia (fee_rates.tokopedia)

| Rule ID | Tier | Admin Fee | Verified Against | Last Checked |
|---|---|---|---|---|
| `MKPL-TOKPED-REG` | Regular | 3.8% | Tokopedia Seller Help | 2026-08-10 |
| `MKPL-TOKPED-PM` | Power Merchant | 4.5% | Tokopedia Seller Help | 2026-08-10 |
| `MKPL-TOKPED-PMPRO` | Power Merchant Pro | 5.5% | Tokopedia Seller Help | 2026-08-10 |
| `MKPL-TOKPED-OS` | Official Store | 6.5% | Tokopedia Seller Help | 2026-08-10 |

### TikTok Shop (fee_rates.tiktok_shop)

| Rule ID | Tier | Admin Fee | Verified Against | Last Checked |
|---|---|---|---|---|
| `MKPL-TIKTOK-STD` | Standard | 4.5% | TikTok Shop Partner Center | 2026-08-10 |
| `MKPL-TIKTOK-MALL` | Mall | 6.5% | TikTok Shop Partner Center | 2026-08-10 |

### Gratis Ongkir Extra (all platforms)

| Rule ID | Applied To | Rate | Cap | Verified Against | Last Checked |
|---|---|---|---|---|---|
| `MKPL-FRESH-01` | All platforms | 4.0% | Rp 10.000 per item | Platform seller centers | 2026-08-10 |

> **Policy Rules are versioned separately from statutory rules (`MKPL-FEE-2024`) and require 3-monthly verification; the active ruleset is resolved deterministically by effective date at engine runtime.**

---

## 6. Finance & Accounting Standard Register (Non-Statutory)

The finance engines (`engines/break-even.js`, `depreciation.js`, `npv.js`, `irr.js`, `loan-amortization.js`, `financial-ratios.js`, `working-capital.js`, `eoq.js`) implement **standard mathematical formulas** from management and financial accounting. They contain no numeric rulesets and are not bound to any statute. The standards below are referenced as presentation/measurement principles for the `finance-id` skills; amendments are tracked via the regulatory issue pipeline, never as runtime rulesets.

| Rule ID | Standard | Issuer | Access Path | Audit Status | Verified At | Verification Link |
|---|---|---|---|---|---|---|
| `FIN-BASIS-01` | PSAK 1 — Financial Statement Presentation (accrual, 3-statement linkage) | IAI | `STANDARD_REFERENCE` | `VERIFIED` | 2026-08-10 | [IAI — SAK](https://web.iaiglobal.or.id/SAK-IAI) (404 for automated clients; parent domain live — verified manually) |
| `FIN-DEP-01` | PSAK 16 — Fixed Assets: straight-line, double-declining balance (DDB), sum-of-years digits (SYD) | IAI | `STANDARD_REFERENCE` | `VERIFIED` | 2026-08-10 | [IAI — SAK](https://web.iaiglobal.or.id/SAK-IAI) (404 for automated clients; verified manually) |
| `FIN-REV-01` | PSAK 23 — Revenue from Contracts with Customers (accrual recognition) | IAI | `STANDARD_REFERENCE` | `VERIFIED` | 2026-08-10 | [IAI — SAK](https://web.iaiglobal.or.id/SAK-IAI) (404 for automated clients; parent domain live — verified manually) |
| `FIN-SAK-EMKM-01` | SAK EMKM — Financial Statements for Micro, Small and Medium Entities | IAI | `STANDARD_REFERENCE` | `VERIFIED` | 2026-08-10 | [IAI — SAK](https://web.iaiglobal.or.id/SAK-IAI) (404 for automated clients; parent domain live — verified manually) |

> **Non-claim**: standards above are professional references (IAI), not positive law. Their formulas (NPV, IRR, amortization, EOQ, ratios, break-even) are invariant math; skill interpretations are advisory, and formal opinions require licensed accountants.

---

## 7. Internal Expert-Domain Review & Credential Register

This section records an **internal maintainer verification checklist** used to assess domain boundaries and source/rule consistency. The competency labels below describe the reviewer profiles against which the checklist is applied; they are **not claims of independent written review, certification of this repository, endorsement by named individuals, or public attestation by external licensed professionals**.

Independent external validation is currently **PENDING** and is governed by [`docs/EXTERNAL_VALIDATION.md`](docs/EXTERNAL_VALIDATION.md).

| Domain | Review Scope / Competency Profile | Verification Method | Last Verified | Status |
|---|---|---|---|---|
| **Taxation & PPh/BPJS** | Certified Tax Practitioner (BKP / CA) competency profile | Dual-source gazette audit + engine test suite | 2026-08-10 | `INTERNAL_VERIFIED` |
| **Employment & Severance** | Employment Law Consultant (SH / Advocate) competency profile | Statutory text boundary check | 2026-08-10 | `INTERNAL_VERIFIED` |
| **Business Finance & Accounting** | Certified Public Accountant (CPA / CA) competency profile | Financial statement balance assertions | 2026-08-10 | `INTERNAL_VERIFIED` |
| **E-Commerce Policy & Systems** | Senior Systems & E-Commerce Specialist competency profile | Seller center policy & DJP PER-01/2025 audit | 2026-08-10 | `INTERNAL_VERIFIED` |

### Interpretation Rule

`INTERNAL_VERIFIED` means the repository maintainer completed and recorded the internal verification checklist against the stated competency profile. It does **not** mean that an independent credentialed practitioner has reviewed or certified the repository.

---

## 8. External Validation & Enterprise Evidence Boundary

The following claims remain explicitly unmade until external evidence exists:

1. Independent professional certification or sign-off of the full repository.
2. Universal correctness across every statutory rule and business scenario.
3. Enterprise production proof across organizations.
4. Community-reviewed long-term maintenance resilience.

See `docs/AUDIT_CLOSURE.md` and `docs/EXTERNAL_VALIDATION.md` for the acceptance criteria before these claims can be upgraded.
