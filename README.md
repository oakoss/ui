# oakoss/ui

Accessible React components built on [React Aria Components](https://react-aria.adobe.com/) and Tailwind CSS v4. You copy them into your project with the [shadcn CLI](https://ui.shadcn.com/docs/cli) and own the code from then on.

Documentation: [ui.oakoss.dev](https://ui.oakoss.dev), which also hosts the registry.

## Install

Set up the project once. In a new project, `init` creates `components.json` with the `@oakoss` registry, sets Lucide as the icon library, and installs the theme, `color-scheme` and the reduced-motion styles:

```sh
npx shadcn@latest init https://ui.oakoss.dev/r/base.json
```

In an existing project, add the registry to `components.json`, then the base item, which keeps the icon library your `components.json` already names:

```json
{ "registries": { "@oakoss": "https://ui.oakoss.dev/r/{name}.json" } }
```

```sh
npx shadcn@latest add @oakoss/base
```

Then add components:

```sh
npx shadcn@latest add @oakoss/button
```

Each component's page lists its command. Icons that render as empty squares mean `components.json` names no icon library; set `"iconLibrary"` and add the component again.

## Pinning a release

`/r/` serves the latest release. Point the registry at a release's folder to stay on it; every item and its dependencies then come from that release:

```json
{ "registries": { "@oakoss": "https://ui.oakoss.dev/v0.5.0/r/{name}.json" } }
```

`npx shadcn@latest add oakoss/ui/<name>` installs from this repository's `main` branch instead, dependencies included.

## Development

```sh
pnpm install
pnpm run setup      # task tracking (beads); see AGENTS.md
pnpm storybook      # component stories
pnpm --filter @oakoss/docs dev
pnpm check          # typecheck, lint, format, registry, generated files and workspace layout
pnpm test
```

Conventions for contributors and agents live in [AGENTS.md](AGENTS.md) and [docs/best-practices](docs/best-practices).

## License

[MIT](LICENSE)
