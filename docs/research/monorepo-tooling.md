# Monorepo build tooling

- **Status:** Recommendation — turbo + vitest + a shared `@oakoss/tsconfig` are implemented (PR #20); tsdown and the Tailwind lint-runner are deferred to their first consumer. Captures the rationale and the deferred decisions so they survive across sessions.
- **Date:** 2026-05-28
- **Scope:** The monorepo's build/test/typecheck/lint orchestration — what's chosen, why, and what's deliberately deferred. Per [`../decisions/README.md`](../decisions/README.md), internal tooling choices live here as recommendations, not in ADR space.
- **Related:** [decision 009](../decisions/009-tokens-and-themes-via-registry.md), [decision 011](../decisions/011-styling-layer-tailwind-v4.md), [`governance/README.md`](../governance/README.md) (the `CI Summary` gate), PR #20.

## The stack

| Concern                    | Choice                                                                                                 | Status                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Workspace                  | pnpm `workspace:*` (globs `packages/*`, `apps/*`)                                                      | in place                                                        |
| Build orchestration        | **turbo** `2.9.16` (`turbo.json` tasks: `build`/`test`/`typecheck`, `dependsOn: ["^build"]`)           | in place                                                        |
| Test runner                | **vitest** `4.1.7` — turbo-orchestrated (`turbo run test`); per-package configs land with each package | dep + root turbo hook in place; no package configs or tests yet |
| Shared TS config           | **`@oakoss/tsconfig`** (private, workspace-only): `base` + `react-library` + `node`                    | in place                                                        |
| Lint / format              | **oxlint + oxfmt** (oxc), root configs over the whole tree                                             | in place                                                        |
| Publishable-binary bundler | **tsdown**                                                                                             | **deferred** to `@oakoss/mcp-server`                            |
| Tailwind class lint        | **`eslint-plugin-better-tailwindcss`**                                                                 | **deferred** to the first component package                     |

## Why these

- **turbo over nx / lerna / plain scripts.** `pnpm -r` already gives topological build ordering, so turbo's value is _caching_ — which only pays off at multiple packages. It was added once the stack justified it; the `^build` dependency ordering is the dist-first model (a package's build/test/typecheck needs upstream `dist/` + `.d.ts` first).
- **vitest, per-package + turbo-orchestrated.** Root `test`/`test:watch` delegate to turbo (`turbo run test` / `turbo watch test`); each package owns its vitest config when it lands. Root `vitest.config.ts` was removed — it would be orphaned under this model (a shared base, if wanted, belongs in a config package, not a root file that needs `../../` imports).
- **`@oakoss/tsconfig` typecheck-only base.** `base.json` sets `noEmit: true` (strict ESM, bundler resolution) — tsdown owns emission, so TS only typechecks. `node.json` overrides **both** `module` and `moduleResolution` to `nodenext` (bundler resolution is only valid with `module: preserve`/`esnext`).
- **tsdown for publishable binaries.** Registry-led distribution means most packages ship source (no bundler); only npm binaries (`@oakoss/mcp-server`) need one. tsdown is Rolldown-based and in the same void-zero/oxc family as oxlint + oxfmt — toolchain coherence, not a generic pick. Verify provenance/maturity at adoption.
- **CI** runs `static-analysis` (oxlint + oxfmt + markdownlint + typecheck), `build`, `test`, and `commitlint` behind a single **`CI Summary`** aggregate gate; branch protection requires only that check (see [`governance/README.md`](../governance/README.md)).

## Deferred decisions (revisit triggers)

- **Tailwind lint-runner — benchmark at the first component package.** `eslint-plugin-better-tailwindcss` is dual ESLint/Oxlint, but the oxlint path rides oxlint's **alpha** JS-plugin support, which adds noticeable lint time. Lean: run **oxlint (native) + a scoped ESLint (only better-tailwindcss on `*.tsx`) side-by-side**, since ESLint is the mature runner and keeps oxlint fast. Decide on _measured numbers_ when there's a real Tailwind surface; revisit consolidating into oxlint once its JS-plugins exit alpha.
- **`typecheck` `dependsOn: ["^build"]` — revisit at the first inter-package dependency.** Correct for dist-first consumption (typecheck needs upstream `.d.ts`); the maintainability auditor noted it over-serializes if packages ever typecheck against source instead. No consumer yet, so it's unverified either way.
- **Root `tsconfig.json` to dogfood the base — optional.** There are no root `.ts` files today, so it would typecheck nothing; the first package extending `@oakoss/tsconfig` is the natural first consumer.
- **turbo remote/CI caching** (`actions/cache` for `.turbo` or remote cache) — add when builds are actually slow.
- **pnpm `catalog:`** for shared dep versions — add when the first dep is shared across packages (e.g. the React version).
- **Shared `@oakoss/vitest-config`** — extract when the first package's vitest config exists.
- **`publint` / `are-the-types-wrong`** — add when `@oakoss/mcp-server` first publishes.

## Verification

Versions verified against `registry.npmjs.org` on 2026-05-28: turbo `2.9.16`, vitest `4.1.7`, typescript `6.0.3` (installed). Iteration fields are creatable only via GraphQL (not `gh project field-create`); oxlint JS-plugin support confirmed alpha via oxc docs. tsdown and better-tailwindcss versions to be verified at adoption.
