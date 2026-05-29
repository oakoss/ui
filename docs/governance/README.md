# Governance

How the project is run, decided, and maintained.

**Status:** Stub. Each item below ships as its own file before OSS launch (see [`../roadmap.md`](../roadmap.md)).

## In effect now

Operational tracking docs that already ship:

- [`labels.md`](labels.md) — label model (readiness, area, special, automation)
- [`issue-types.md`](issue-types.md) — Issue Type axis (Bug / Feature / Task / Epic / Proposal)
- [`projects.md`](projects.md) — the Projects v2 board (views, fields, work-status)

## Contents

- Working group charter (who decides what, how seats rotate)
- Proposal process (see [`../proposals/README.md`](../proposals/README.md))
- Release cadence and semver policy
- Maintainer roles and contributor ladder
- Conflict resolution
- Code of Conduct enforcement procedure

## Why this matters at OSS launch

Enterprise consumers need to know how decisions get made before they adopt. Government and regulated buyers require it in procurement.

## References to borrow from

- IBM Carbon: separate `carbon-design-system/rfcs` and `carbon-design-system/roadmap` repos with documented working group
- GOV.UK: three-stage proposal flow (propose → develop → review)
- USWDS: 45-day public comment window for new component proposals
- TDesign: contributor-ladder language ("personal projects → first issue → first MR → reviewer")

## Branch protection (rulesets)

`main` is protected by GitHub **rulesets** (not classic branch protection):

- **Required CI Checks** (repo ruleset) — requires the `CI Summary` and `Analyze (CodeQL)` status checks, strict (branches must be up to date before merge). `CI Summary` is an aggregate gate that `needs` every CI job (static-analysis, build, test, commitlint), so it transitively requires them and the required-checks list never changes as jobs are added. Defined in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
- **Main Branch - Org** (org ruleset) — required pull request before merge, required signatures, linear history, Copilot code review, and blocks deletion + non-fast-forward pushes.
