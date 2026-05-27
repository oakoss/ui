# Project Instructions for AI Agents

## Issue Tracking

This project uses **GitHub Issues** as the source of truth and **GitHub Projects v2** for the roadmap view.

### Quick reference

```bash
gh issue list                       # See open Issues
gh issue view <number>              # Read an Issue
gh issue create                     # File a new Issue (uses .github/ISSUE_TEMPLATE/)
gh issue comment <number> -b "..."  # Comment on an Issue
gh pr create --fill                 # Open a PR from the current branch
```

### Workflow

1. Triage: a maintainer moves new Issues from `status:needs-triage` to `status:ready` and applies `priority:*`, `complexity:*`, and `area:*` labels.
2. Pick up: claim an Issue labeled `status:ready` (prefer `complexity:simple` for agent runs) and self-label `status:in-progress`.
3. Branch: `issue/<number>-<short-slug>`.
4. Commit: Conventional Commits via `pnpm commit`; reference the Issue with `closes #N`.
5. Changeset: if the PR is consumer-visible (touches a published `@oakoss/*` package), run `pnpm changeset` and pick the appropriate bump magnitude. For docs-only / CI-only PRs, run `pnpm changeset --empty` to satisfy the `changeset-bot` reminder. Pre-1.0 semver: breaking changes bump minor, everything else bumps patch.
6. PR: `gh pr create --fill --label "status:needs-review"`.
7. Address review feedback: see [Handling PR reviews](#handling-pr-reviews) below.
8. Merge: the Issue closes automatically when the PR merges. Any changeset accumulates in the auto-maintained "Version Packages" PR; merging that PR triggers npm publish.

See [`docs/governance/labels.md`](docs/governance/labels.md) for the full label state machine. The `/fix-issue` skill at `.claude/skills/fix-issue/SKILL.md` runs the view, implement, test, and PR loop.

### Handling PR reviews

When review comments arrive (from Copilot, a human reviewer, or any other source), each thread needs explicit closure — reviewers track what's pending by which threads are still open.

For each comment:

1. **Read it** — `gh api repos/oakoss/ui/pulls/<N>/comments` or `gh pr view <N> --comments`.
2. **Address it** — fix in code, OR reply explaining why no change is needed, OR reply with reasoning if you disagree.
3. **Push the fix** (if any) on the same branch.
4. **Reply to the thread** with a one-liner pointing at the fix commit (e.g., `Fixed in abc1234 — <brief>`). For "no code change" comments, reply with the reasoning.
5. **Resolve the thread** so reviewers know it's closed.

Resolving threads via `gh` requires GraphQL (REST doesn't expose this). Pattern:

```bash
# List unresolved threads on PR N
gh api graphql -f query='
  query($owner:String!, $repo:String!, $pr:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:100) {
          nodes { id isResolved comments(first:1) { nodes { author { login } path line body } } }
        }
      }
    }
  }' -F owner=oakoss -F repo=ui -F pr=<N> --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)'

# Reply to a thread, then resolve it (use the thread's id from above)
gh api graphql -f query='
  mutation($id:ID!, $body:String!) {
    addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$id, body:$body}) { comment { id } }
  }' -F id="<thread-id>" -F body="Fixed in <sha>."

gh api graphql -f query='
  mutation($id:ID!) {
    resolveReviewThread(input:{threadId:$id}) { thread { isResolved } }
  }' -F id="<thread-id>"
```

Don't resolve a thread you haven't actually addressed — closing it without a reply or a fix signals "I don't care" to the reviewer.

### Rules

- Use `gh` CLI for all GitHub interactions. Reach for an MCP server only when you need Projects v2 mutations.
- GitHub Issues are the source of truth. Don't track work in TodoWrite, markdown TODOs, or local notes.
- Decisions live in `docs/decisions/`; investigations live in `docs/research/`. Don't create MEMORY.md files.

## Session Completion

When ending a work session:

1. **Update Issue status** — close completed Issues; move in-progress ones to `status:needs-review`.
2. **Pass quality gates** — `pnpm lint`, `pnpm lint:md`, and any component tests.
3. **Push PRs to remote** — `git push` must succeed before the session ends.
4. **Hand off** — drop context for the next session in a PR comment or a fresh Issue.

## Build & Test

```bash
pnpm install            # Installs deps; lefthook's postinstall wires up git hooks
pnpm lint               # oxlint
pnpm format             # oxfmt (writes in place)
pnpm format:check       # oxfmt --check (CI-friendly; no writes)
pnpm lint:md            # markdownlint-cli2 on all *.md
pnpm lint:md:fix        # markdownlint-cli2 --fix on all *.md
pnpm commit             # Conventional Commits prompt (cz-git)
pnpm commitlint --edit  # Validate the most recent commit message
```

### Git hooks (lefthook)

Lefthook's own `postinstall` script wires up hooks on `pnpm install` (allowed in `pnpm-workspace.yaml` via `allowBuilds`). The configured hooks:

- **pre-commit** (parallel): `oxlint`, `oxfmt` (auto-stages fixes), `markdownlint-cli2 --fix` (auto-stages fixes) — all scoped to staged files only
- **commit-msg**: `commitlint` validates Conventional Commits

If hooks ever drift out of sync (rare), reinstall with `pnpm exec lefthook install`. To skip hooks in an emergency: `LEFTHOOK=0 git commit ...`. Don't habitually use `--no-verify`.

### Releases (changesets)

We use [changesets](https://github.com/changesets/changesets) for versioning + publishing. Pre-1.0 semver: breaking changes bump minor (`0.1` → `0.2`), everything else bumps patch.

**Per-PR:**

- Consumer-visible change → `pnpm changeset` and pick the affected packages + bump magnitude
- Docs/CI/internal-only change → `pnpm changeset --empty` (satisfies the `changeset-bot` reminder without triggering a release)

**The release flow** is automated via `.github/workflows/release.yml`:

1. Push to `main` triggers the workflow
2. If pending changesets exist, the action opens/updates a "Version Packages" PR that bumps versions + writes `CHANGELOG.md`
3. When that PR merges, the same workflow runs `pnpm release` (which calls `changeset publish`) to publish to npm via OIDC (no `NPM_TOKEN` needed — provenance is enabled via `.npmrc`)

**Reviewing a changeset:** verify the declared bump magnitude matches the actual changes. A `patch` that's actually breaking will mis-version the release and confuse consumers.

## Architecture Overview

oakoss/ui is a layered React design system:

- **`@oakoss/tokens`** — DTCG 2025.10 source tokens compiled by [Terrazzo](https://terrazzo.app) into CSS variables, JS constants, and Tailwind theme output. Framework-agnostic; the only npm-published surface in foundation phase.
- **Primitives** — thin wrappers over [React Aria Components](https://react-aria.adobe.com/) that bind tokens and expose unstyled, accessible behavior.
- **Styled components** — opinionated compositions on top of primitives. Distributed as registry items (source files copied into the consumer's repo), not as a runtime npm dependency.
- **Recipes** — multi-component patterns (e.g. data tables with virtualization, modal flows).

Distribution is **registry-led hybrid**: components ship via a [shadcn-compatible registry](https://ui.shadcn.com/docs/registry) (`registry.json`), while tokens and shared utilities ship as small npm packages under `@oakoss/*`. See [decision 002](docs/decisions/002-registry-led-hybrid-distribution.md).

Multi-framework is **React-primary**. Tokens are framework-agnostic by construction; Lit/Web Components targets are deferred to post-v1.0. See [decision 003](docs/decisions/003-react-primary-defer-web-components.md).

AI integration uses the registry's `registry.json` as a discovery surface plus an `@oakoss/mcp-server` for richer tool-use clients. See [decision 008](docs/decisions/008-ai-integration-shadcn-registry-and-mcp.md).

## Conventions & Patterns

### File and naming

- Filenames are `kebab-case` (`button.tsx`, `use-controlled-state.ts`)
- React component exports are `PascalCase`; hooks are `useCamelCase`
- No relative parent imports (`../../`) — use tsconfig path aliases instead
- Prefer `type` over `interface` unless declaration-merging is genuinely needed
- Inline type imports: `import { type ComponentProps } from 'react'`

### Tokens

Never use raw values (hex colors, px sizes, ms durations) in component code. Pull from `@oakoss/tokens`. If a token is missing, add it to the source set first; don't hardcode.

### Accessibility

Every component targets [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/), [EN 301 549](https://www.etsi.org/standards-search#search=EN%20301%20549), and Section 508. Tests run via `eslint-plugin-jsx-a11y` and `@storybook/addon-a11y`. See [`docs/accessibility/README.md`](docs/accessibility/README.md).

### Decisions vs Proposals

- **Decision** ([`docs/decisions/`](docs/decisions/)) — captures an architectural decision after it's been made. Short, immutable once accepted.
- **Proposal** ([`docs/proposals/`](docs/proposals/)) — proposes a new component API or significant change before implementation. Discussion happens on the proposal PR.

Use decisions for build pipeline, dependency, and testing-strategy decisions. Use proposals for anything that adds public API surface.

### Comments and prose

See the [Comment policy](#comment-policy) below. Prose in docs (READMEs, decisions, proposals) should avoid the AI-flavored patterns called out in the `de-slopify` reference.

# Comment policy

Comments are useful when they add value. Keep them clean and minimal.

A good comment:

- Is accurate (matches the code; remove if stale)
- Earns its place (explains WHY or non-obvious context, not WHAT)
- Is concise (one or two lines unless documenting a complex invariant)

Avoid:

- Restating what the code does
- Section markers like `// ===== HELPERS =====`
- Hedge words, apologies, "obviously", "basically", "just"
- "Note:" / "Important:" prefixes when surrounding text already conveys importance
- TODOs without ticket references
- Cross-references that belong in the PR description ("added for X", "used by Y")
- Multi-line comments on trivial code
- AI-flavored phrasings ("Here we...", "Let's...", "This...")

When in doubt: keep the comment, but make it tighter.

# Fix-vs-defer policy

When addressing review findings (from the review-cycle skill, PR comments, or any other reviewer):

Default to fixing inline. Defer to a follow-up only if:

- The fix is substantially more work than writing the follow-up itself
- The fix requires architectural changes spanning files outside this PR scope
- The fix requires a new dependency or schema migration not in this PR
- The fix would invalidate unrelated tests

If you can describe the fix in one sentence, just do the fix.

When deferring, briefly state which criterion above applies.
