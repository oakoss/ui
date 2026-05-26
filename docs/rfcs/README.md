# Requests for Comment (RFCs)

Formal proposals that require community input before becoming specs. Modeled on the Carbon Design System and React RFC processes.

## When to open an RFC

- Adding a new component or pattern to the design system
- Changing a public API in a breaking way
- Introducing a new dependency or build step that affects consumers
- Any change where reasonable contributors might disagree

## Process

1. Create a new file: `NNNN-short-kebab-title.md` using [`_template.md`](_template.md)
2. Submit as a draft PR
3. Comment period: 7 days for minor proposals, 45 days for major proposals
4. Final Comment Period (FCP): the last 3 days of the comment period are the FCP — last call for objections before merge
5. Working group reviews and either accepts, requests changes, or rejects
6. Accepted RFCs are merged; rejected RFCs are merged with status `Rejected` so the reasoning is preserved

## Distinction from `../ideas/`

- Ideas: informal brainstorms, no process, no commitment to act
- RFCs: formal proposals with a comment period and a binary outcome
