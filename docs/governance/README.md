# Governance

How the project is run, decided, and maintained.

**Status:** Stub. Each item below ships as its own file before OSS launch (see [`../roadmap.md`](../roadmap.md)).

## Contents

- Working group charter (who decides what, how seats rotate)
- RFC process (see [`../rfcs/README.md`](../rfcs/README.md))
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

## Branch protection (main)

Configure via repo settings → Branches → Branch protection rules:

- Required status checks: `lint` (always), `commitlint` (PRs). These are defined in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). Without them marked as required, Renovate's `platformAutomerge` can merge unverified PRs.
- Required reviews: 1 (maintainer)
- Require signed commits: optional but recommended
- Restrict force-pushes and branch deletion
