# React-primary, tokens-shared, defer Web Components

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

Web Components had a moment in 2026: Shopify deprecated Polaris React and went WC-only, Adobe ships Spectrum Web Components alongside RAC, and Carbon now ships React and WC as siblings under one monorepo. The question is whether oakoss/ui should follow Carbon's dual-implementation pattern from day one, compile cross-framework via Mitosis, or ship React-first and defer WC.

Adobe's published guidance splits the two: RAC is the substrate for building a React DS, and Spectrum Web Components targets framework-agnostic consumers. Mitosis is RAC-incompatible (hooks + render props don't compile) and is carried by two contributors.

See [`../research/web-components-ecosystem.md`](../research/web-components-ecosystem.md) for landscape detail and dismissed alternatives.

## Decision

oakoss/ui ships React-first on React Aria Components. `@oakoss/tokens` is framework-agnostic DTCG JSON from day one. A Lit-based Web Components implementation is deferred to post-v1.0 and is not committed to.

If a WC implementation is added later, it will be written natively in Lit (not compiled from React), and `@oakoss/tokens` will be the only contract between the two surfaces. The Carbon monorepo layout is the model to follow.

## Consequences

Easier: lowest near-term cost. The React-first audience gets idiomatic React. The multi-framework option stays open without paying for it now.

Harder: the a11y test corpus has to be written against rendered DOM behavior (not React-specific assertions) so the same tests can validate a future WC implementation. Component metadata (`react-docgen` JSON), `AGENTS.md`, and `llms.txt` need to be committed structurally from v0.1 to avoid retrofitting.

New risks: if enterprise consumers demand a non-React surface earlier than expected, the post-v1.0 deferral will need re-evaluation.

## Alternatives considered

- **Carbon-style dual implementation from v0.1.** ~2x maintenance forever; Carbon throws 40 unique committers / 90 days at this. Out of scope.
- **Mitosis compile-once.** Painful DX; RAC is fundamentally incompatible with the DSL.
- **Lit-primary + generated React wrappers (UI5 model).** Wrong fit for a React-first audience; WC becomes the canonical surface and React UX degrades.
