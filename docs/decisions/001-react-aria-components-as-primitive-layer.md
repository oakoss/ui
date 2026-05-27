# React Aria Components as the primitive layer

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

oakoss/ui targets enterprise and regulated consumers (US federal, EU EAA 2025, UK PSBAR), so the primitive layer must ship i18n, RTL, accessible drag-and-drop, and virtualization as first-party concerns rather than userland glue. The scope is React-first (~50 components at v1.0); multi-framework is deferred to post-v1.0. Distribution is shadcn-compatible registry, which forces composition-heavy primitives over opinionated styled output.

See [`../research/primitive-layer-evaluation.md`](../research/primitive-layer-evaluation.md) for the full evaluation matrix and maintainer-health data.

## Decision

React Aria Components (`react-aria-components`) is the primitive layer for oakoss/ui.

## Consequences

Easier: the a11y test corpus piggybacks on Adobe's 5-target SR/browser matrix. DnD and virtualization arrive as primitives, not seams. JollyUI proves the RAC + shadcn-CLI registry combination already works.

Harder: bundle size requires sub-path imports (v1.17+) to stay under budget. Composition is more verbose than Radix or Base UI. LLM training data skews to Radix patterns, so we ship more examples to compensate.

New risks: 600 open issues is real backlog, partly offset by a healthy closure rate. Adobe does not publish a WCAG conformance level for RAC, so any conformance claim oakoss/ui makes has to be backed by our own audit.

## Alternatives considered

- **Base UI (MUI):** strong engineering velocity, but RTL was broken until v1.5.0, DatePicker absent for 12+ months, no DnD. Fails the a11y bar.
- **Ark UI (Chakra):** Segun authors 75–80% of human commits across ark + zag. Bus-factor risk plus missing DnD.
- **Ariakit / Radix UI / Headless UI:** all disqualified on a11y scope, maintainer health, or both. See research note for evidence.
