# Visual regression testing with self-hosted Playwright

- **Status:** Adopted (2026-05-29)
- **Date:** 2026-05-26 (researched, Chromatic-primary), 2026-05-29 (adopted, flipped to self-hosted Playwright)
- **Scope:** Visual regression CI vendor / framework
- **Note:** This is a research recommendation, not an ADR — per [decisions/README](../decisions/README.md) (line 18), visual-regression-tool choices live here, not in `decisions/`.
- **Related:** [tooling evaluation](tooling-evaluation.md)

## Context

oakoss/ui needs visual regression CI from v0.1 with a reviewer-friendly PR diff, targeting **Storybook stories**. The 2026 options split into hosted SaaS (Chromatic, Percy, Argos cloud) and self-hosted/in-CI tools (Playwright `toHaveScreenshot`, Vitest browser-mode VRT, WebdriverIO `@wdio/visual-service`). Lost Pixel — previously a credible MIT option — was archived 2026-04-22 after the Figma acquisition.

The original (2026-05-26) recommendation was **Chromatic free OSS tier, Argos fallback**. That was reversed on two verified facts (2026-05-29):

1. **Chromatic OSS sponsorship is out of reach.** Per [Chromatic's docs](https://www.chromatic.com/docs/open-source/), the community-led eligibility bar is **100+ contributors, or 40k+ weekly npm downloads, or 10k+ GitHub stars** (the "5+ contributors" the original cited is the _company/government_ threshold, which doesn't apply to an independent OSS library), and it is **not self-serve** — projects apply via in-app chat. oakoss/ui has one human contributor today; it qualifies for none of these.
2. **Without sponsorship, hosted free tiers offer no advantage.** Chromatic's regular free tier is **5,000 snapshots/month** — identical to Argos's free tier ([pricing](https://www.chromatic.com/pricing)). The 35k allowance exists only _with_ the unreachable sponsorship. So a hosted vendor buys a proprietary-SaaS dependency and a per-month snapshot cap with no offsetting benefit at this stage.

The goal is to avoid OSS/hobby limits and vendor eligibility entirely: keep snapshots in the repo and diff in our own CI.

## Recommendation

Visual regression CI runs on **self-hosted Playwright Test, asserting `toHaveScreenshot()` against the static Storybook build's per-story iframe URLs**: $0, no snapshot limits, no vendor, no eligibility gate. Baselines live in the repo; Playwright Test owns snapshot paths and pixelmatch comparison in CI.

`toHaveScreenshot()` is a **Playwright Test** matcher, so the runner is Playwright Test pointed at the built-and-served Storybook story URLs — a separate pass from component / interaction / a11y tests, which run through the **Storybook Vitest addon** (Vitest browser mode). VRT stays separate only because Vitest's `toMatchScreenshot` can't yet snapshot Storybook stories ([storybook#32930](https://github.com/storybookjs/storybook/discussions/32930)); both runners are Playwright-backed, so the browser layer is shared, and VRT folds into the Vitest addon once story-level `toMatchScreenshot` lands. (The Jest `@storybook/test-runner` — now legacy, superseded by the Vitest addon — would instead pair `page.screenshot()` with `jest-image-snapshot`.)

A concrete reference implementation of this exact pattern — build Storybook, read `storybook-static/index.json`, navigate each `iframe.html?id=…`, assert `toHaveScreenshot()`, and run it in Docker for render consistency — is [Oberlehner's walkthrough](https://markus.oberlehner.net/blog/running-visual-regression-tests-with-storybook-and-playwright-for-free/).

## Consequences

Easier: zero cost, zero limits, zero vendor lock-in, available today with no application. Storybook stories are the snapshot source: build once, serve, navigate each story's iframe URL.

Harder — we own three things a hosted vendor would handle:

- **Baseline storage.** Binary PNG baselines committed to Git bloat the repo over time. Mitigation: Git LFS for the baseline directory.
- **Render consistency.** CI and local must render identically or comparisons false-positive. Mitigation: pin the official Playwright Docker image and generate/update baselines in CI, not locally.
- **Review UX.** "Good, not great" — diffs surface via Playwright's HTML report plus a CI step that posts diff images / a report link to the PR, rather than a polished hosted dashboard.

Keep stories **vendor-neutral** (no tool-specific decorators in component source) so a review-UX layer or a different tool can be swapped in cheaply.

## Escalation paths (recorded, not adopted)

- **Review-UX upgrade without a vendor:** [Visual Regression Tracker](https://github.com/Visual-Regression-Tracker/Visual-Regression-Tracker) — a self-hosted Docker server with a real approve/reject diff UI. Pairs with Playwright as the screenshot source. Adopt if/when the in-CI review UX becomes painful.
- **Cross-browser / real-device / mobile coverage:** **WebdriverIO `@wdio/visual-service`** ([webdriverio/visual-testing](https://github.com/webdriverio/visual-testing), MIT, self-hosted, no limits) covers Chrome/Firefox/Safari/Edge plus mobile/native via Appium — broader than Playwright's three engines. Its Storybook integration is currently beta and it adds a second automation stack, so it is not worth it while v0.1 is **Chrome-only by design**. Revisit at v1.0+ if cross-browser/real-device visual coverage becomes a requirement (e.g. mobile or the deferred Web-Components target).
- **Hosted dashboard, if ever eligible:** Chromatic (35k snapshots, polished UI) only becomes worthwhile if the project clears the 100-contributor / 40k-DL / 10k-star community bar; Argos cloud is the MIT-client hosted alternative. Vendor-neutral stories keep either a cheap swap.

## Alternatives considered

- **Chromatic free OSS tier (original primary).** Reversed — eligibility unreachable (100+ contributors / 40k DLs / 10k stars, not self-serve); ungated free tier is only 5k snapshots, same as Argos, with a proprietary dependency.
- **Argos cloud.** MIT client, healthy, first-class Storybook, but a hosted 5k-snapshot free tier — same limit profile as Chromatic-without-sponsorship, and no maintained self-hostable server was found, so it does not meet the no-limits goal.
- **Vitest browser-mode VRT.** Stable in **Vitest 4.0** (browser mode + `toMatchScreenshot`) — already our runner (`vitest ^4.1.7`) — $0 and self-hosted like Playwright. The gap is Storybook-story integration ([storybook#32930](https://github.com/storybookjs/storybook/discussions/32930)), not the matcher; review UX is thinner. The consolidation target once that lands.
- **WebdriverIO `@wdio/visual-service`.** Strong on cross-browser/real-device; see escalation paths. Beta Storybook path + second stack rule it out for v0.1.
- **Percy (BrowserStack).** Active but opaque pricing; vendor uncertainty.

## Sources

- Chromatic OSS sponsorship eligibility (community: 100+ contributors / 40k weekly DLs / 10k stars; company/gov: 5+ contributors; not self-serve, 35k snapshots) — [chromatic.com/docs/open-source](https://www.chromatic.com/docs/open-source/), verified 2026-05-29
- Chromatic Free tier = 5,000 snapshots/mo; Starter = $179/mo for 35,000 — [chromatic.com/pricing](https://www.chromatic.com/pricing), verified 2026-05-29
- Playwright `toHaveScreenshot()` (pixelmatch, baselines in Git, Docker for render consistency, PR diffs via Actions) — [Playwright VRT guide](https://bug0.com/knowledge-base/playwright-visual-regression-testing), verified 2026-05-29
- Reference implementation — Playwright + Storybook story-URL VRT, free, with Docker (`storybook-static/index.json` → `iframe.html?id=…` → `toHaveScreenshot` → Docker) — [Oberlehner, 2024](https://markus.oberlehner.net/blog/running-visual-regression-tests-with-storybook-and-playwright-for-free/)
- Reference implementation, corroborating (adds loader-state waits before capture, batch error reporting, Playwright `webServer` auto-start) — Boiko, "Visual Regression Testing with Playwright and Storybook" (Medium, 2025)
- Storybook Vitest addon supersedes the Jest `@storybook/test-runner` and is recommended for Vite frameworks; runs stories as Vitest browser-mode tests (Playwright-backed); a11y via `parameters.a11y.test` — [Storybook docs](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), verified 2026-05-30
- Vitest `toMatchScreenshot` not yet integrated with the Storybook Vitest addon — [storybook#32930](https://github.com/storybookjs/storybook/discussions/32930), verified 2026-05-30
- Vitest 4.0 shipped stable browser mode + visual regression (`toMatchScreenshot`); repo is on `vitest ^4.1.7` — [Vitest 4.0 release](https://vitest.dev/blog/vitest-4), verified 2026-05-30
- WebdriverIO visual service (MIT, self-hosted, ResembleJS, cross-browser + Appium mobile/native, beta Storybook runner) — [webdriverio/visual-testing](https://github.com/webdriverio/visual-testing) + [docs](https://webdriver.io/docs/visual-testing/), verified 2026-05-29
- Lost Pixel archived 2026-04-22 — from the original write-up; not re-verified
