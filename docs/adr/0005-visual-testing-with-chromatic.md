# ADR-0005: Visual regression testing with Chromatic (Argos fallback)

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

oakoss/ui needs visual regression CI from v0.1 with a reviewer-friendly PR diff UI. The 2026 options are SaaS (Chromatic, Percy) or MIT-licensed (Argos, Playwright `toHaveScreenshot`, Vitest browser mode VRT). Lost Pixel — previously a credible MIT option — was archived 2026-04-22 after the Figma acquisition.

Chromatic's free OSS tier (35k Chrome snapshots/mo) is comfortable for a single-library Storybook. Eligibility under the company / government clause is 5+ contributors, which we expect to clear easily. If we don't qualify, Argos (MIT, 5k snapshots/mo free, healthy + active) is the safe fallback.

See [`../research/tooling-evaluation.md`](../research/tooling-evaluation.md) for the full options matrix.

## Decision

Visual regression CI runs on **Chromatic free OSS tier** as the primary. **Argos (MIT, OSS)** is the fallback if Chromatic eligibility is rejected. Both integrate first-class with Storybook 10.

## Consequences

Easier: first-class Storybook integration, a reviewer-friendly PR diff UI we don't have to build, and Chrome coverage out of the box.

Harder: Chrome-only is acceptable for v0.1 but constrains cross-browser regression detection. Reconsider at v1.0 (Argos Starter at $100/mo for 40k snapshots, or Chromatic Starter at $149/mo for 35k snapshots).

New risks: Chromatic is proprietary SaaS. Self-hostable visual testing requires switching to Argos, so we keep our Storybook stories vendor-neutral (no Chromatic-specific story decorators in component source).

## Alternatives considered

- **Playwright `toHaveScreenshot()`.** $0, mature, but no PR review UI; reviewers have to pull branches locally to inspect diffs. Acceptable only as a no-budget fallback.
- **Vitest browser-mode VRT (v5).** First-class in v5.0.0-beta.3 (2026-05-19). No PR review UI yet; revisit at v1.0.
- **Percy (BrowserStack).** Active but opaque pricing (pricing page 404 today). Vendor uncertainty.
