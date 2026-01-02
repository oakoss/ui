# React Aria UI

A component library built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html), distributed via [shadcn registry](https://ui.shadcn.com/docs/registry).

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (SSR/SSG React)
- **Components:** [React Aria Components](https://react-spectrum.adobe.com/react-aria/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Docs:** [Fumadocs](https://fumadocs.dev/) with MDX
- **Build:** [Vite](https://vite.dev/), [Turbo](https://turbo.build/)

## Project Structure

```text
apps/
  docs/                  # Documentation site (TanStack Start + Fumadocs)
packages/
  eslint-config/         # Shared ESLint configuration
  typescript-config/     # Shared TypeScript configuration
docs/
  react-aria-ui/         # Component architecture documentation
openspec/                # Spec-driven development
```

## Getting Started

### Prerequisites

- Node.js >= 25.1.0
- pnpm 10.x

### Installation

```sh
pnpm install
```

### Development

```sh
# Start all apps in dev mode
pnpm dev

# Start only docs
pnpm --filter docs dev
```

### Build

```sh
pnpm build
```

### Linting & Formatting

```sh
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with auto-fix
pnpm format        # Prettier
pnpm typecheck     # TypeScript
```

## Contributing

See [AGENTS.md](./AGENTS.md) for coding conventions and guidelines.

## License

MIT
