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

# Task tracking

Use `bd` (beads). Run `bd prime` for the command reference and session protocol.

Run `pnpm run setup` after cloning. It runs `bd bootstrap`, which clones the task graph from `BD_SYNC_REMOTE` in `.beads/.env`. That file is gitignored because it names a private host; without it, bootstrap creates a fresh local database. Until setup runs, the `.beads/hooks/*` shims skip themselves.

- **Prefer `bd bootstrap` to `bd init`.** `bd init` and `bd hooks install --beads` set `core.hooksPath`, which makes git bypass lefthook and commitlint silently. If one gets set, unset it.
- **`git push` does not sync tasks.** Run `bd dolt push` explicitly.
- **Don't commit the host.** On bd 1.3.1, `bd dolt remote add` writes `sync.remote` into `.beads/config.yaml` and commits it (`bd: update sync.remote`). Undo that commit before pushing, and strip the `sync:` block.
