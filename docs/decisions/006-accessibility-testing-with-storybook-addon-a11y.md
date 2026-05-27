# Accessibility CI with eslint-plugin-jsx-a11y + @storybook/addon-a11y (axe-core/playwright post-v0.1)

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

The a11y target is WCAG 2.2 AA + EN 301 549 + Section 508 (see [`../accessibility/README.md`](../accessibility/README.md)). That target needs a CI net, not a manual one.

`eslint-plugin-react-aria` does not exist (verified npm 404). RAC consumers rely on `eslint-plugin-jsx-a11y` plus runtime axe checks. `eslint-plugin-jsx-a11y` is slow-moving (last publish 18+ months ago) and useful for native-element mistakes, but it cannot reason about RAC's render output. The real CI net is axe-core running against rendered Storybook stories.

See [`../research/tooling-evaluation.md`](../research/tooling-evaluation.md) for the full tooling comparison.

## Decision

Layered defense for v0.1:

1. **`eslint-plugin-jsx-a11y`** — static lint baseline on every PR.
2. **`@storybook/addon-a11y`** with test-runner `parameters.a11y.test: 'error'` — component-level runtime axe in CI, fails the build on violations.
3. **`@axe-core/playwright`** — added post-v0.1 once we have E2E coverage of the docs site.

## Consequences

Easier: per-story granularity catches violations at the component level, not the page level. Failures land on the PR that introduced them. The same Storybook we maintain for visual regression doubles as the a11y target.

Harder: every component needs at least one story covering each interactive state for axe to see it. Good discipline, but it raises the floor on what "done" means for a component.

New risks: `eslint-plugin-jsx-a11y` cadence is slow; if it goes unmaintained, we lose the static layer. The runtime axe layer is the load-bearing one; the lint layer is defense-in-depth.

## Alternatives considered

- **`@axe-core/react`.** Logs to dev console at render time. Dev-time only, not a CI gate. Useful complement, not a substitute.
- **Pa11y.** HTMLCS or axe-core wrapper. Niche; addon-a11y covers the same ground with better DX for a Storybook-first project.
- **Build our own React Aria lint rules.** Open-ended scope; the runtime axe layer already catches what matters.
