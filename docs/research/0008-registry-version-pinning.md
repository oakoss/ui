# Research: Pinning Registry Installs to a Release

Date: 2026-10-24
Related: [registry.md](../best-practices/registry.md) · [AGENTS.md](../../AGENTS.md) (Releasing) · oakum [ADR-0033](https://github.com/oakoss/oakum/blob/main/docs/decisions/0033-declarative-extra-files.md), [ADR-0014](https://github.com/oakoss/oakum/blob/main/docs/decisions/0014-tags-are-the-version-source-of-truth.md), [ADR-0013](https://github.com/oakoss/oakum/blob/main/docs/decisions/0013-no-plugin-runtime.md)

## Summary

oakum tags every release `v<version>`, and AGENTS.md calls that "the ref consumers pin", but a pinned install today pins only the item named: `shadcn add oakoss/ui/button#v0.5.0` installs v0.5.0's Button with Spinner and Theme from `main`, because shadcn resolves each dependency by its own address and ours carry no ref. Fixing that from GitHub means writing `#v<version>` into the tagged `registry.json`, which needs a new oakum feature, and pins left on `main` break the default install between releases. The goal behind the question is docs that match releases. A spike found a simpler route: build each release's registry with `shadcn build` and serve it from the docs site under `/v<version>/r/`, with dependencies written as full URLs into the same version. Installs of the three items compared matched the GitHub installs byte for byte, dependencies stayed on the requested version, and nothing in oakum changes. Recommendation: deploy the docs and the registry together from each release tag, install by URL or an optional `@oakoss` namespace, and keep GitHub addresses for `main`.

## Findings

### What shadcn does

Measured with shadcn 4.21.4 (`@shadcn/registry` 0.1.3) by `shadcn add --dry-run --view` in a scratch project, and read from its source:

- **A ref resolves to a commit, and files come from it.** `oakoss/ui/toast#v0.5.0` fails with `Registry item "toast" was not found` (toast is newer than v0.5.0); `oakoss/ui/button#v0.3.0` installs a Button shadcn reports as 156 lines against 161 for `main`'s.
- **No ref means the default branch.** The address falls back to `HEAD`, and `gh api repos/<owner>/<repo>/commits/HEAD` returns the default branch's commit: `main` here, `master` on octocat/Hello-World.
- **A pinned dependency is honored.** A local item whose `registryDependencies` is `["oakoss/ui/button#v0.3.0"]` installs v0.3.0's Button.
- **Refs aren't inherited.** Each dependency string is parsed as its own address; the shadcn docs say so too ("Refs are not inherited across dependencies").
- **Mixed refs of one item: the last one wins, silently.** `[button#v0.3.0, toast]` installs `main`'s Button (toast pulls the unpinned one); `[toast, button#v0.3.0]` installs v0.3.0's; `[button#v0.4.0, button#v0.3.0]` installs v0.3.0's. No warning in any case. On shadcn's current `main` source, the resolver deduplicates on the raw address and the file writer keeps the last copy per target path; the measured behavior is from 4.21.4.
- **`shadcn registry validate` accepts pinned dependencies.** A copy of our registry with all 177 same-repo dependencies rewritten to `#v0.6.0` validated: `✔ Registry is valid. Checked 2 registry files and 75 items.`
- **A branch shadows a tag of the same name.** The resolver tries `refs/heads/<ref>` before `refs/tags/<ref>`, so no branch may be named like a release tag.
- **Guidance.** [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json): "For published registries, prefer a tag or full commit SHA eg. `['acme/ui/button#v1.2.0']`" and "If a GitHub dependency should be reproducible, pin that dependency to its own tag or full commit SHA." The GitHub registry page states it conditionally ("If a dependency should be pinned, include its own ref"). No shadcn command writes refs.

### What other registries do

GitHub registries are new (June 2026), and pinning is uncommon. Two registries pin same-repo dependencies, both with a generator script run at version time:

- **pmndrs/design-system:** `scripts/build.mjs` writes `pmndrs/design-system/<item>#v${pkg.version}`, and the changesets `version` script reruns it, so the version PR moves the pins. Its CI notes that `registry.json` "is generated but committed, because GitHub-based resolution reads it from the repo."
- **joaodadas/lume:** `scripts/build-registry.ts` rewrites bare internal dependencies to `#v<version>`, with a `--check` mode in CI; `scripts/release.ts` regenerates, commits and tags.

Both leave the default branch carrying current items with last-release dependencies between releases.

### How release tools write versions into strings

| Tool                            | Shape                                                         | Arrays           | Zero matches             | Can add a first ref              |
| ------------------------------- | ------------------------------------------------------------- | ---------------- | ------------------------ | -------------------------------- |
| release-please                  | `extra-files` jsonpath, or `x-release-please-version` markers | jsonpath `[*]`   | Skips silently           | No: replaces an existing version |
| cargo-release                   | `pre-release-replacements` regex with `{{version}}`           | Whole-file regex | Fails (`min`, `exactly`) | Yes                              |
| knope                           | `versioned_files` regex with a `version` group                | Regex            | Fails                    | No                               |
| bump-my-version                 | `search`/`replace` per file                                   | Globs over files | Fails by default         | Yes                              |
| semantic-release-replace-plugin | `from`/`to` regex, lodash template                            | Regex            | Optional count check     | Yes                              |
| release-plz, changesets         | Nothing comparable                                            |                  |                          |                                  |

The first release must turn `oakoss/ui/spinner` into `oakoss/ui/spinner#v0.6.0`, and every later one must move an existing ref, so the write has to accept both a bare and a pinned address.

### oakum constraints

- `extra-files` (ADR-0033) replaces a whole JSON value at a dotted key; `{field=value}` selects one array element. It can't reach every string in `items[].registryDependencies[]` or rewrite part of one.
- oakum 0.5.0's config schema declares no hook key, and its guide documents none; ADR-0013 names a process-boundary hook as the escape hatch.
- `release` tags the untagged version commit on the default branch, and versions come from tags reachable from `HEAD` (ADR-0014). A tag on a release commit off `main` would be invisible to the next release, so the pinned commit has to be on `main`.
- `main`'s branch ruleset requires pull requests and signed commits, with a bypass for integrations, but a second ruleset requires status checks with only org admins exempt. A release-time commit from oakum's app would need passing checks on that commit or its own PR (read from `gh api repos/oakoss/ui/rulesets`, not run).

### Pins left on `main` break the default install

Every address shares this: an unpinned item, `#main` or a commit SHA takes the item from `main` (or that commit) and its dependencies from wherever they point. With pins on `main`, that's the last release. Concretely, `main`'s Carousel (after v0.5.0) passes `ref` to Button, which `main`'s Button declares (`ref?: Ref<HTMLButtonElement>`, added for Carousel in #103) and v0.5.0's doesn't, so `shadcn add oakoss/ui/carousel` with Button pinned to v0.5.0 would install code that shouldn't typecheck (read from the types, not compiled). That's the docs' own install command between releases.

### This repository

Code that reads same-repo addresses as bare `oakoss/ui/<name>` and would break on a `#ref` suffix:

- `packages/ui/tests/registry.test.ts` (address set, installed-paths closure)
- `apps/docs/src/lib/remark-component-docs.ts` (the install page's file list)
- `packages/tokens/src/registry-items.ts` (generates `theme-<family>` items with `oakoss/ui/theme`; `check-generated.sh` would flag the version PR's pins as drift)
- `packages/ui/tests/theme-items.test.ts`

### Spike: the docs site as the registry

Built v0.4.0 and v0.5.0 from `git archive` of each tag with `shadcn build` (about 1 s and 1 MB each; 61 and 69 files for 60 and 68 items), rewrote `oakoss/ui/<dep>` to `http://localhost/…/<tag>/r/<dep>.json`, served them locally, and ran `shadcn add --dry-run` in a scratch project:

- **URL install, no config:** `shadcn add http://…/v0.4.0/r/button.json` fetched only `/v0.4.0/r/button.json`, `spinner.json` and `theme.json` (server log), and wrote v0.4.0's `cx.ts` (its `import { type ClassNameValue }` form).
- **Namespace install:** with `"registries": { "@oakoss": "http://…/v0.4.0/r/{name}.json" }`, `shadcn add @oakoss/button` fetched only v0.4.0 files; changing the URL to v0.5.0 moved Button, Spinner and Theme together. This held whether the items' dependencies were `@oakoss/<dep>` or full URLs.
- **Same output as GitHub:** for `button`, `checkbox` and `themes`, every file `oakoss/ui/<item>#v0.5.0` writes (`button.tsx`, `spinner.tsx`, `recipes.ts`, `cx.ts`, `checkbox.tsx`, the lucide-swapped `icons.tsx`, `themes.css`) and the CSS it adds to `index.css` matched the hosted install exactly, as did each file list.
- **No shadcn listing needed:** shadcn fetches its own `registries.json` index only to resolve a namespace a project hasn't configured, so a URL install or a configured `@oakoss` works without a PR to shadcn.
- **Hosting every version fits:** Workers static assets allow 20,000 files per version on the free plan and 100,000 on paid ([limits](https://developers.cloudflare.com/workers/platform/limits/)); the docs build is 1,393 files and a version adds about 70.

Not tried: a real deploy, rebuilding older tags in CI, and an `https` host.

## Options

### Host the registry with the docs (recommended)

The spike above. Each release deploys its docs and its registry from the tag, and our build writes dependencies as full URLs into the same version, so no pin is ever written to `registry.json` and oakum is unchanged. Brings back a build step, which the GitHub source decision avoided; changes the install command; keeps past versions only if each build includes them.

### Keep installing releases from GitHub (fallback)

How the ref gets written:

1. **Structured ref write in oakum.** `extra-files` gains an array wildcard and a ref operation, for example `key = "items.*.registryDependencies.*"`, `ref = "oakoss/ui/"`, writing `#<tag>`. Reads JSON structure, so no prose is touched; errors on zero matches like the rest of ADR-0033; handles bare and pinned; writes the tag oakum actually creates.
2. **Regex replacements in oakum.** cargo-release's shape (`search`, `replace`, `min`, `{{version}}`/`{{tag}}`). General and familiar, but blind to structure; the match count is the only guard.
3. **A shadcn-registry adapter in oakum.** Derives the same-repo prefix from the repository, no config. Doesn't generalize past shadcn.
4. **A generator in this repo** (what pmndrs and lume do). Needs oakum's version run to call it, which oakum doesn't offer; a CI step editing the version PR breaks AGENTS.md's release rule.

Where the pins live:

- **A. Pin for the release, unpin after.** The version PR writes the refs, `release` tags that commit, then commits the bare addresses back. Tags pin exactly, `main` installs stay all-`main`, and the docs need no split. Costs a larger oakum feature and a bot commit per release, which needs passing checks or its own PR (see the CI-checks ruleset above).
- **B. Pins stay on `main`, docs move to the release.** Production docs deploy from the tag with `#v<version>` commands, so visitors only ever install a consistent release; `main` installs mix, as above, and are for development only. Pulls the docs split forward to the same time as pinning.
- **C. A `latest` default branch** fast-forwarded on release. Unpinned installs become whole releases with no `registry.json` change, but tag pins still mix (`#v0.5.0` gets the latest release's dependencies) and every PR needs `--base main`.

B with option 1 is the fallback: it serves the same goal, docs that match releases, with the smaller oakum change (write only) and no release-time commit. oakum tracks it as okm-vdx3, deferred until hosting falls through.

## Recommendation

- **Deploy from the release tag.** The tag push (made with the oakoss App token, so it starts workflows) builds the docs, runs `shadcn build` for that tag and every earlier one, and deploys them together: `/r/` is the latest release, `/v<version>/r/` each release. `main` deploys to a preview site.
- **Write dependencies as full URLs** into the same version (`https://ui.oakoss.dev/v0.6.0/r/spinner.json`), in our build, not in `registry.json`. Then a plain URL install needs no config, and a project that sets `"@oakoss": "https://ui.oakoss.dev/v0.6.0/r/{name}.json"` gets that version throughout.
- **Commands:** component pages show `shadcn add @oakoss/<name>` with a one-time namespace step on the installation page, or the full URL; a page for pinning shows the versioned namespace.
- **Keep GitHub addresses** for installing from `main` (`oakoss/ui/<name>`), unchanged and unpinned.
- **oakum needs nothing.** If hosting falls through, the fallback is B with option 1.

## Sources

- shadcn: [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json), [GitHub registries](https://ui.shadcn.com/docs/registry/github), [changelog 2026-06](https://ui.shadcn.com/docs/changelog/2026-06-github-registries), [registry source](https://github.com/shadcn-ui/ui/tree/main/packages/registry/src/registry)
- Registries: [pmndrs/design-system](https://github.com/pmndrs/design-system), [joaodadas/lume](https://github.com/joaodadas/lume)
- Release tools: [release-please](https://github.com/googleapis/release-please/blob/main/docs/customizing.md), [cargo-release](https://github.com/crate-ci/cargo-release/blob/master/docs/reference.md), [knope](https://knope.tech/reference/config-file/packages/), [bump-my-version](https://github.com/callowayproject/bump-my-version/blob/master/docs/reference/search-and-replace-config.md), [semantic-release-replace-plugin](https://github.com/jpoehnelt/semantic-release-replace-plugin), [release-plz](https://release-plz.dev/docs/config), [changesets](https://changesets.dev/guide/config)
