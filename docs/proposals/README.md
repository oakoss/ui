# Proposals

Written proposals for changes that need discussion before code lands. Modeled on the Carbon Design System and React proposal processes.

## When to open a proposal

- Adding a new component or pattern to the design system
- Changing a public API in a breaking way
- Introducing a new dependency or build step that affects consumers
- Any change where reasonable contributors might disagree

## Process

1. Create a new file: `NNN-short-kebab-title.md` using [`000-template.md`](000-template.md)
2. Submit as a draft PR
3. Comment period: 7 days for minor proposals, 45 days for major proposals
4. Final comment period: the last 3 days of the comment period are last call for objections before merge
5. Working group reviews and either accepts, requests changes, or rejects
6. Accepted proposals are merged; rejected proposals are merged with status `Rejected` so the reasoning is preserved

## Distinction from `../ideas/`

- Ideas: informal brainstorms, no process, no commitment to act
- Proposals: formal documents with a comment period and a binary outcome
