# Change: Register @oakoss Namespace in shadcn Registry Index

## Why

Enable users to install components using the short namespace syntax (`@oakoss/react-aria-tailwind-button`) instead of full URLs. This improves developer experience and aligns with how other registries (like `@react-aria`) work.

## What Changes

- Submit GitHub issue to shadcn-ui/ui repository to register `@oakoss` namespace
- Provide required assets: logo, description, verified working registry URL
- After approval, users can use `shadcn add @oakoss/[component]` syntax

## Prerequisites

- Component registry must be built and deployed (`add-component-registry` change)
- Registry must be publicly accessible at `https://ui.oakoss.com/r/`
- Must have a square SVG logo for the registry

## Impact

- Affected specs: namespace-registration (new)
- Affected code: None (external registration only)
- External dependencies: shadcn-ui team approval
