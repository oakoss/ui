# Implementation Specs

Detailed implementation plans written AFTER a decision is made (RFC accepted or ADR recorded). One spec per significant feature or component.

## When to write a spec

- Implementing a non-trivial component (Dialog, Combobox, DatePicker, etc.)
- Implementing a system-wide feature (theming, registry pipeline, MCP server)
- When the implementation will span multiple PRs

## When NOT to write a spec

- Simple components where the API is obvious
- Bug fixes
- Implementation details that fit in a PR description

## Format

- Filename: `short-kebab-title.md` (e.g. `combobox.md`, `mcp-server.md`)
- No numbering — specs are organized by topic, not chronology
- Use the template at [`_template.md`](_template.md)

## Lifecycle

Specs are living documents. Update them when the implementation diverges from the original plan, and mark them `Superseded` when replaced.
