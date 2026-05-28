# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`docs/glossary.md`** — this repo's domain glossary; it fills the role the skills call `CONTEXT.md`. Read it for the project's vocabulary before naming concepts.
- **`docs/decisions/`** — read the decisions (ADRs) that touch the area you're about to work in.

This repo keeps its ADRs in **`docs/decisions/`**, not the conventional `docs/adr/`. See [`docs/decisions/README.md`](../decisions/README.md) for the numbering and lifecycle conventions (sequential numbers, not reused; bodies immutable once accepted). Investigations live in `docs/research/`.

There is no root `CONTEXT.md`; `docs/glossary.md` is the equivalent. If a term you need isn't in it, that's a gap for `/grill-with-docs` to resolve — don't silently invent vocabulary.

## File structure

Single-context repo:

```text
/
├── docs/
│   ├── glossary.md       ← domain glossary (the skills' CONTEXT.md role)
│   ├── decisions/        ← ADRs (001-…, 002-…)
│   └── research/         ← investigations
└── packages/             ← workspace packages (none yet; foundation phase)
```

Revisit this layout if the monorepo grows packages with genuinely distinct domain languages — at that point a `CONTEXT-MAP.md` at the root pointing to per-package `CONTEXT.md` files may earn its keep.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/glossary.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing decision, surface it explicitly rather than silently overriding:

> _Contradicts [decision 011](../decisions/011-styling-layer-tailwind-v4.md) (Tailwind v4 styling layer) — but worth reopening because…_
