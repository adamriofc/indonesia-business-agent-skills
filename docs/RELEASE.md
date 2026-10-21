# Release Engineering & Checklist Policy (`docs/RELEASE.md`)

Automated release pipeline, immutable boundaries, and release engineering checklist for `indonesia-business-agent-skills`.

---

## 1. Immutable Release Boundary Policy

Every official release (e.g. `v6.5.0`) represents an immutable release boundary locking:
- Source code state at tag creation.
- Machines-readable skill definitions (`SKILL.md` files across 6 canonical plugins).
- Pure Node.js calculation & regulatory diff engines (`engines/*.js`).
- Statutory ruleset JSON files & cryptographic SHA256 hashes (`SHA256SUMS.txt`).
- Automated benchmark artifacts (`docs/benchmark-results/latest.json`).
- Documentation & metadata SSOT (`canonical-metadata.json`).
- Suite bundle manifests (`bundles/*.json`) validated in lockstep.

Users and downstream AI agents consume explicit SemVer release tags (e.g. `v6.5.0`) rather than unpinned commit hashes.

---

## 2. Release Provenance Design — Non-Self-Referential (manifestVersion 1.2.0+)

### Provenance Architecture

```text
Authoritative Release Boundary
          │
          ▼
    Git Tag (e.g. v6.16.3)   ← immutable, cryptographically secured by Git
          │
          ▼
    Feature Commit (SHA)     ← what the tag points to
          │
          ▼
    release-manifest.json    ← documents lineage: version, source commit, metrics
    (releaseSourceCommitHash = feature commit SHA)
          │
          ▼
    SHA256SUMS.txt           ← ruleset integrity anchors
          │
          ▼
    canonical-metadata.json  ← SSOT metric counts
```

### Why `release-manifest.json` Does NOT Self-Reference Its Own Commit Hash

In Git, a commit SHA is the cryptographic hash of the commit object contents (tree, parent, author, message). It is therefore **cryptographically impossible** for a commit to contain its own SHA — the content depends on the SHA, and the SHA depends on the content: a circular dependency.

Attempting to store `releaseCommitHash = <SHA of the commit that stores this manifest>` always produces a mismatch — a new commit must be created to store the updated hash, which itself cannot contain its own new hash.

**The correct provenance model (v1.2.0+)**:
- `releaseTag` = the SemVer tag (e.g. `v6.16.3`) — **this is the authoritative release boundary**
- `releaseSourceCommitHash` = the SHA of the feature commit that the tag points to — **non-self-referential**
- The release gate verifies: (1) tag exists, (2) source commit is reachable, (3) **source commit is an ancestor of the release tag** (`git merge-base --is-ancestor`), (4) version alignment, (5) metric alignment
- Git tag immutability + SHA256SUMS + golden corpus = the full integrity proof

This design is consistent with industry practice (e.g. npm package registry, GitHub Release, Docker image digest — none require a file to contain its own content hash).

---

## 3. Automated Release Verification Checklist

Maintainers must execute the following checklist prior to creating a release tag:

```text
[1] Generate Metadata SSOT
    └─► npm run generate:metadata
        (Updates canonical-metadata.json, README STATS block, & docs/METRICS.md)

[2] Full Test Suite & Benchmark Matrix
    └─► npm test
        (Executes 526+ assertions across unit, matrix, integration, security, & benchmark suites)

[3] Deterministic Benchmark Execution & Artifact Update
    └─► node scripts/benchmark.js --json-report docs/benchmark-results/latest.json
        (Verifies 121 golden cases across 27 domains with 100% determinism)

[4] Documentation Consistency Validation
    └─► npm run validate:docs
        (Verifies 0-drift across README, BENCHMARK, METRICS, CHANGELOG, & SKILL_PROTOCOL)

[5] Ruleset SHA256 Cryptographic Trust Anchor Verification
    └─► bash scripts/sha256sums.sh verify
        (Verifies SHA256 hashes for bpjs.json, pph21.json, marketplace.json, umkm.json)

[6] Package Smoke Installation Test
    └─► npm run test:smoke
        (Packs package tarball, installs in isolated temp environment, verifies module require)

[7] Performance Regression Gate
    └─► node scripts/perf-gate.js
        (Verifies execution throughput against baseline without >30% degradation)

[8] Automated Release Gate
    └─► npm run validate:release
        (Executes 18-check automated release gate pipeline including blocking npm audit &
         non-self-referential manifest provenance validation)

[9] Git Tagging & GitHub Release
    └─► git tag vX.Y.Z && git push origin vX.Y.Z
    └─► gh release create vX.Y.Z --title "vX.Y.Z — Release Title" --notes-file release-notes.md
```

> **Why tags do not re-trigger the pipeline**: The release workflow triggers on
> `branches: [master, main]` only, not on tags. A tag points to a feature commit
> whose `release-manifest.json` cannot reference its own commit hash
> (self-referential hash is cryptographically impossible in Git). Release integrity
> is fully verified on every branch push, where the manifest records the source
> commit lineage. Tags are immutable pointers to commits that already passed the
> 18-check gate.

> **Tag boundary hygiene**: The tag must point to the **manifest-final commit**
> (the lock commit whose `release-manifest.json` records the feature source), so
> that checking out the tag yields the exact final manifest and GitHub compare
> shows tag == master. Do not tag the feature commit itself if the final manifest
> lives one commit later on master.

---

## 4. Published Release Artifacts

Each GitHub Release must include the following verifiable release artifacts:
1. `benchmark-results.json`: Complete JSON artifact of Tier 1 deterministic execution benchmark.
2. `SHA256SUMS.txt`: Cryptographic hashes of all active statutory rulesets.
3. `CHANGELOG.md`: Detailed changelog entry listing statutory updates, engine changes, and fixes.
4. Auto-generated release notes summarizing version metadata (skills count, engine count, golden cases count, Node matrix status).


Automated release pipeline, immutable boundaries, and release engineering checklist for \`indonesia-business-agent-skills\`.

---

## 1. Immutable Release Boundary Policy

Every official release (e.g. \`v6.5.0\`) represents an immutable release boundary locking:
- Source code state at tag creation.
- Machines-readable skill definitions (`SKILL.md` files across 6 canonical plugins).
- Pure Node.js calculation & regulatory diff engines (`engines/*.js`).
- Statutory ruleset JSON files & cryptographic SHA256 hashes (`SHA256SUMS.txt`).
- Automated benchmark artifacts (`docs/benchmark-results/latest.json`).
- Documentation & metadata SSOT (`canonical-metadata.json`).
- Suite bundle manifests (`bundles/*.json`) validated in lockstep.

Users and downstream AI agents consume explicit SemVer release tags (e.g. \`v6.5.0\`) rather than unpinned commit hashes.

---

## 2. Automated Release Verification Checklist

Maintainers must execute the following checklist prior to creating a release tag:

```text
[1] Generate Metadata SSOT
    └─► npm run generate:metadata
        (Updates canonical-metadata.json, README STATS block, & docs/METRICS.md)

[2] Full Test Suite & Benchmark Matrix
    └─► npm test
        (Executes 526+ assertions across unit, matrix, integration, security, & benchmark suites)

[3] Deterministic Benchmark Execution & Artifact Update
    └─► node scripts/benchmark.js --json-report docs/benchmark-results/latest.json
        (Verifies 121 golden cases across 27 domains with 100% determinism)

[4] Documentation Consistency Validation
    └─► npm run validate:docs
        (Verifies 0-drift across README, BENCHMARK, METRICS, CHANGELOG, & SKILL_PROTOCOL)

[5] Ruleset SHA256 Cryptographic Trust Anchor Verification
    └─► bash scripts/sha256sums.sh verify
        (Verifies SHA256 hashes for bpjs.json, pph21.json, marketplace.json, umkm.json)

[6] Package Smoke Installation Test
    └─► npm run test:smoke
        (Packs package tarball, installs in isolated temp environment, verifies module require)

[7] Performance Regression Gate
    └─► node scripts/perf-gate.js
        (Verifies execution throughput against baseline without >30% degradation)

[8] Automated Release Gate
    └─► npm run validate:release
        (Executes 18-check automated release gate pipeline including blocking npm audit & release manifest validation)

[9] Git Tagging & GitHub Release
    └─► git tag vX.Y.Z && git push origin vX.Y.Z
    └─► gh release create vX.Y.Z --title "vX.Y.Z — Release Title" --notes-file release-notes.md
```

> **Why tags do not re-trigger the pipeline**: The release workflow triggers on
> `branches: [master, main]` only, not on tags. GitHub Actions evaluates the
> workflow file from the pushed commit — a tag points to a feature commit whose
> `release-manifest.json` cannot reference its own commit hash (a
> self-referential hash is cryptographically impossible), so a strict
> provenance gate would always fail on tag pushes. Release integrity is fully
> verified on every branch push, where the manifest is locked to the
> (already-tagged) feature commit. Tags are immutable pointers to commits that
> already passed this 18-check gate.

---

## 3. Published Release Artifacts

Each GitHub Release must include the following verifiable release artifacts:
1. `benchmark-results.json`: Complete JSON artifact of Tier 1 deterministic execution benchmark.
2. `SHA256SUMS.txt`: Cryptographic hashes of all active statutory rulesets.
3. `CHANGELOG.md`: Detailed changelog entry listing statutory updates, engine changes, and fixes.
4. Auto-generated release notes summarizing version metadata (skills count, engine count, golden cases count, Node matrix status).
