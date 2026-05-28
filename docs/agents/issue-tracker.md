# Issue tracker: GitHub

Issues and PRDs for this repo (`oakoss/ui`) live as GitHub issues. Use the `gh` CLI for all operations; it infers the repo from `git remote -v` when run inside the clone.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with `--label` / `--state` filters as needed.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Related project conventions

- Full workflow (branch naming, Conventional Commits, changeset policy, merge behavior) lives in [`AGENTS.md`](../../AGENTS.md#issue-tracking).
- PR-review thread resolution (the GraphQL `resolveReviewThread` pattern) lives in [`AGENTS.md`](../../AGENTS.md#handling-pr-reviews). Don't resolve a thread you haven't addressed.
- Triage label vocabulary: [`triage-labels.md`](./triage-labels.md).
