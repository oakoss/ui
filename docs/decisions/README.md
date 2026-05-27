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

## Format

- Filename: `NNN-short-kebab-title.md` (e.g. `001-react-aria-components-as-primitive-layer.md`)
- Number sequentially; do not reuse numbers
- Use the template at [`000-template.md`](000-template.md)

## Lifecycle

Decisions are immutable once accepted. To change one, write a new decision that supersedes it and update the old one's status to `Superseded by NNN`.
