# oakoss/ui

Accessible React components built on [React Aria Components](https://react-aria.adobe.com/) and Tailwind CSS v4. You copy them into your project with the [shadcn CLI](https://ui.shadcn.com/docs/cli), straight from this repository, and own the code from then on.

Documentation: [ui.oakoss.dev](https://ui.oakoss.dev)

## Install

Set up the project once. In a new project, `init` creates `components.json`, sets Lucide as the icon library, and installs the theme, `color-scheme` and the reduced-motion styles:

```sh
npx shadcn@latest init oakoss/ui/base
```

In an existing project, `add` installs the same styles and keeps the icon library your `components.json` already names:

```sh
npx shadcn@latest add oakoss/ui/base
```

Then add components:

```sh
npx shadcn@latest add oakoss/ui/button
```

Each component's page lists its command. Icons that render as empty squares mean `components.json` names no icon library; set `"iconLibrary"` and add the component again.

## Pinning a release

Without a ref, the CLI installs from `main`. Add a release tag to install that release instead:

```sh
npx shadcn@latest add oakoss/ui/button#v0.1.0
```

A ref applies only to the item you name. The items it depends on, such as `oakoss/ui/theme`, still come from `main`.

## Development

```sh
pnpm install
pnpm run setup      # task tracking (beads); see AGENTS.md
pnpm storybook      # component stories
pnpm --filter @oakoss/docs dev
pnpm test
```

Conventions for contributors and agents live in [AGENTS.md](AGENTS.md) and [docs/best-practices](docs/best-practices).

## License

[MIT](LICENSE)
