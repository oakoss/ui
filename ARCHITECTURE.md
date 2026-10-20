# Architecture

oakoss/ui is a shadcn registry read straight from GitHub. Consumers copy each component's source into their project with the shadcn CLI and own it from then on, so nothing here is built or published as a JavaScript package. The source in `packages/ui` is the product; everything else exists to test, document or generate it.

## Layout

| Path                  | What it holds                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ui`         | Components (`src/components/ui/<category>/`), hooks, `lib` helpers, styles, and `registry.json`, which lists every item consumers can add.             |
| `packages/tokens`     | Theme data (families, styles, typographies) and the generator that writes the theme CSS, `cn-config.ts` and the theme items in `packages/ui`.          |
| `apps/storybook`      | Stories, which are also the component tests: Vitest runs them in a browser in light, dark and forced-colors projects.                                  |
| `apps/docs`           | [ui.oakoss.dev](https://ui.oakoss.dev): Fumadocs on TanStack Start, prerendered and deployed to Cloudflare. Demos import components from `@oakoss/ui`. |
| `tooling/*`           | Shared TypeScript, oxlint and ESLint configs.                                                                                                          |
| `docs/best-practices` | Conventions, read by task; [AGENTS.md](AGENTS.md) says which file applies.                                                                             |
| `docs/research`       | Dated research records behind the decisions below.                                                                                                     |

Inside `packages/ui`, code imports through the `#/components/*`, `#/hooks/*` and `#/lib/*` aliases. The apps import components, `registry.json` and the stylesheets through the package's `exports`.

## From source to a consumer's project

1. A component lives in `packages/ui/src`, with its stories in `apps/storybook` and its page in `apps/docs`.
2. Its item in `packages/ui/registry.json` names its files and their targets, its npm dependencies and the other items it needs (`registryDependencies`). The root `registry.json` includes that file.
3. `npx shadcn@latest add oakoss/ui/<item>` reads the registry from this repository's default branch; `#v<version>` pins a release for the named item only.
4. At install, shadcn replaces each `IconPlaceholder` element in `icons.tsx` with the project's icon library, which is why every icon is a literal element.
5. [oakum](https://github.com/oakoss/oakum) versions `@oakoss/ui` from the bump files in `.changeset` and tags `v<version>`, the ref consumers pin. Releasing is CI's job; see [AGENTS.md](AGENTS.md#releasing).

## Theming

Themes are data in `packages/tokens`, not hand-written CSS. `pnpm --filter @oakoss/tokens generate` writes `theme.css`, `themes.css`, `cn-config.ts` and the theme registry items into `packages/ui`, and `pnpm check` fails when those files are stale. The model (intent roles over Tailwind's 50–950 scales, theme families, swappable fonts and icons) is set out in [0001](docs/research/0001-design-system.md), [0002](docs/research/0002-shadcn-aria-fork.md) and [0004](docs/research/0004-token-model-research.md).

## Checks

- `pnpm check`: typecheck, lint, format, registry validation, generated-file freshness and the workspace layout (every package has lint configs and a test script).
- `pnpm test`: the packages' tests through turbo, which typechecks dependencies first and builds the docs site before its tests: unit tests for logic (`*.test.ts`), the Storybook stories, and the docs site's unit and end-to-end tests.
- CI (`.github/workflows/ci.yml`) runs those plus the Storybook build, commitlint, the bump-file check and workflow linting, and gates merges on one CI Summary job. `docs.yml` deploys the site from `main` and previews pull requests; `visual.yml` reports screenshot changes without blocking.

## Decisions

The stack is locked: React Aria Components, Tailwind CSS v4, `tailwind-variants` and the `cn` helper, forked from shadcn's React Aria base. The [research index](docs/research/README.md) lists each record; start with [0002](docs/research/0002-shadcn-aria-fork.md) for why the library is shaped the way it is.

Work is tracked in beads (`bd`); setup and its pitfalls are in [AGENTS.md](AGENTS.md#task-tracking).
