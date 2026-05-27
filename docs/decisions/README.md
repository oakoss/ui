# Decisions

This directory contains the decisions we've made for oakoss/ui. Each decision captures the context, the choice, and the consequences at the time it was written — a record for whenever someone wonders why we picked X over Y.

Decisions are not commandments. Future evidence can override them. But the historical record stays.

## When to write a decision

- A choice between two or more meaningful technical options is being made
- The decision will be hard or expensive to reverse
- Future contributors will benefit from knowing the reasoning

## When NOT to write a decision

- Implementation details that can change without breaking consumers
- Choices that come out of a Proposal (link the Proposal instead)
- Temporary or experimental work
- Internal tooling and vendor choices (visual regression tool, test framework, docs site framework) where the choice doesn't bind component code or consumers — these belong in [`../research/`](../research/) as recommendations, not in ADR space

## Scope discipline

Two disciplines apply to every decision:

- **Scope tightly.** Decide what you are actually deciding. If a question depends on another decision that is still pending or TBD, defer that question to its own future decision and link to the pending source. Do not pre-commit to downstream choices implicitly. Example: a token-distribution decision should not also lock the styling layer.
- **Verify external-system claims.** Any claim about how an external library, tool, registry, or API behaves (e.g. "shadcn rewrites imports through `aliases`") must be verified against current docs or source before being asserted as fact. Reasoning from training data alone is not sufficient. If a claim cannot be verified, soften it ("if shadcn supports a `tokens` alias…") or defer it.

## Format

- Filename: `NNN-short-kebab-title.md` (e.g. `001-react-aria-components-as-primitive-layer.md`)
- Number sequentially; do not reuse numbers
- Use the template at [`000-template.md`](000-template.md)

## Lifecycle

Decisions are immutable once accepted. To change one, write a new decision that supersedes it and update the old one's status to `Superseded by NNN`.

During foundation phase (pre-v0.1), this lifecycle is softer: decisions are still forward commitments, but amending, relocating, or superseding them is cheap because no code yet depends on them. Tighten once the first components and packages exist.
