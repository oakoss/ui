# Architecture Decision Records (ADRs)

Point-in-time records of architectural decisions. Each ADR captures the context, the decision, and the consequences as of the date it was written.

## When to write an ADR

- A choice between two or more meaningful technical options is being made
- The decision will be hard to reverse
- Future contributors will benefit from knowing why we picked X over Y

## When NOT to write an ADR

- Implementation details that can change without breaking consumers
- Decisions documented in an RFC (link the RFC instead)
- Temporary or experimental choices

## Format

- Filename: `NNNN-short-kebab-title.md` (e.g. `0001-react-aria-components-as-primitive-layer.md`)
- Number sequentially; do not reuse numbers
- Use the template at [`_template.md`](_template.md)

## Lifecycle

ADRs are immutable once accepted. To change a decision, write a new ADR that supersedes the old one and update the old ADR's status to `Superseded by ADR-NNNN`.
