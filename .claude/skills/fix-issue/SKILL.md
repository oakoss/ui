---
name: fix-issue
description: Fix a GitHub Issue by viewing it, implementing the change, testing, and opening a PR.
---

# fix-issue

Take a GitHub Issue from read to PR.

## Usage

`/fix-issue <ISSUE_NUMBER>` or `/fix-issue <ISSUE_URL>`

## Workflow

1. **Read the Issue** — `gh issue view $ARG --comments` to pull the title, body, labels, and discussion.
2. **Triage** — if anything is unclear, ask in a comment (`gh issue comment $ARG --body "..."`) instead of guessing.
3. **Identify scope** — check the Issue body for explicit file or component references, then search the codebase to confirm.
4. **Implement** — branch as `issue/<number>-<short-slug>` and make the change. Follow `AGENTS.md` conventions, anything under `docs/governance/`, and relevant decisions in `docs/decisions/`.
5. **Test** — run `pnpm lint` and `pnpm lint:md`. A test runner and Storybook a11y addon are not yet wired up; verify a11y-affecting changes manually with browser tools.
6. **Commit** — use Conventional Commits via `pnpm commit` (cz-git). Reference the Issue in the body with `closes #123`.
7. **PR** — `gh pr create --fill --label "status:needs-review"` and include a short test plan in the body.
8. **Review feedback** — when Copilot or a human reviewer leaves comments, address each one and resolve the thread. See the "Handling PR reviews" section in [`AGENTS.md`](../../../AGENTS.md) for the `gh api graphql` pattern.
9. **Label transition** — leave `status:in-progress` in place; the maintainer flips it on merge.

## Conventions

- Never bypass commit hooks (`--no-verify`) without explicit user approval.
- Don't auto-merge PRs; the maintainer owns the merge decision.
- Breaking changes require a proposal (see `docs/proposals/`).
- A11y fixes should cite the WCAG criterion in the PR body.

## Policies in scope

The Comment policy and Fix-vs-defer policy at the end of `AGENTS.md` govern all work done through this skill.
