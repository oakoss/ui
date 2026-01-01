## ADDED Requirements

### Requirement: Registry Package Structure

The registry package SHALL organize source files following React Aria's starter pattern.

#### Scenario: Source directory structure

- **GIVEN** the `packages/ui/` directory
- **WHEN** a developer explores the source
- **THEN** components are organized as `starters/[style]/src/components/ui/[Component].tsx`

#### Scenario: Style names include headless library and styling approach

- **GIVEN** the registry structure
- **WHEN** listing available styles
- **THEN** style names follow the pattern `[headless]-[styling]` (e.g., `react-aria-tailwind`, `react-aria-css`)

### Requirement: Flat Registry Output

The registry SHALL generate a flat output structure following React Aria's pattern.

#### Scenario: Output uses prefixed names

- **GIVEN** the build output in `public/r/`
- **WHEN** listing generated files
- **THEN** files are named `[style]-[component].json` (e.g., `react-aria-tailwind-button.json`)

#### Scenario: No nested directories in output

- **GIVEN** the build output
- **WHEN** examining the directory structure
- **THEN** all JSON files are in the root of `public/r/` (flat structure)

### Requirement: Tailwind Styling Support

The registry SHALL provide Tailwind CSS-styled components using Tailwind Variants.

#### Scenario: Tailwind component installation

- **GIVEN** a user with a Tailwind CSS project
- **WHEN** they run `shadcn add https://ui.oakoss.com/r/react-aria-tailwind-button.json`
- **THEN** the Button component and its dependencies are added to their project

#### Scenario: Tailwind utils provide focus ring preset

- **GIVEN** the `react-aria-tailwind-utils` registry item
- **WHEN** installed
- **THEN** it provides a `focusRing` TV preset for consistent focus styling
- **AND** it provides a `composeTailwindRenderProps` helper function

#### Scenario: Tailwind components use tailwind-variants

- **GIVEN** the Tailwind Button component
- **WHEN** inspecting its implementation
- **THEN** it uses `tv()` from `tailwind-variants` for variant management

#### Scenario: Tailwind components specify CSS plugins

- **GIVEN** the Tailwind component JSON
- **WHEN** checking its `css` field
- **THEN** it includes `@plugin "tailwindcss-react-aria-components"`
- **AND** it includes `@plugin "tailwindcss-animate"`

### Requirement: Plain CSS Styling Support

The registry SHALL provide plain CSS-styled components following React Aria's CSS pattern.

#### Scenario: CSS component installation

- **GIVEN** a user with a plain CSS project
- **WHEN** they run `shadcn add https://ui.oakoss.com/r/react-aria-css-button.json`
- **THEN** the Button component and CSS files are added to their project

#### Scenario: CSS components use data attributes for variants

- **GIVEN** the CSS Button component
- **WHEN** inspecting its implementation
- **THEN** it uses `data-variant` attribute for variant selection
- **AND** it does NOT use `tailwind-variants`

#### Scenario: CSS components include shared theme

- **GIVEN** the CSS Button component files
- **WHEN** listing included files
- **THEN** it includes `theme.css` with CSS variable definitions
- **AND** it includes `Button.css` with component-specific styles

### Requirement: shadcn CSS Variable Compatibility

CSS components SHALL use shadcn-compatible CSS variable naming.

#### Scenario: Theme uses shadcn variable names

- **GIVEN** the `theme.css` file
- **WHEN** inspecting CSS variable names
- **THEN** it uses names like `--primary`, `--primary-foreground`, `--secondary`, etc.

#### Scenario: Theme supports light and dark modes

- **GIVEN** the `theme.css` file
- **WHEN** checking for color scheme support
- **THEN** it includes `@media (prefers-color-scheme: dark)` rules

### Requirement: React Aria Integration

Components SHALL wrap React Aria Components rather than rebuilding accessibility primitives.

#### Scenario: Button wraps RACButton

- **GIVEN** the Button component from any style
- **WHEN** inspecting its implementation
- **THEN** it imports `Button` from `react-aria-components`
- **AND** it renders the React Aria Button component

#### Scenario: React Aria state attributes used for styling

- **GIVEN** a rendered Button component
- **WHEN** interacting with it
- **THEN** React Aria data attributes are present (`data-pressed`, `data-disabled`, `data-focus-visible`, etc.)
- **AND** styles respond to these attributes

### Requirement: Consistent Variant Props

Components SHALL accept the same variant props across all styling approaches.

#### Scenario: Matching TypeScript interfaces

- **GIVEN** Button components from both `react-aria-tailwind` and `react-aria-css`
- **WHEN** comparing their TypeScript interfaces
- **THEN** they accept the same variant props (`variant`, `size`)

#### Scenario: Standard variant values

- **GIVEN** any Button component
- **WHEN** checking available variants
- **THEN** it supports `variant` values: `primary`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- **AND** it supports `size` values: `sm`, `md`, `lg`

### Requirement: Registry Manifest

The package SHALL have a `registry.json` manifest following shadcn schema.

#### Scenario: Valid registry manifest

- **GIVEN** `packages/ui/public/r/registry.json`
- **WHEN** validated against `https://ui.shadcn.com/schema/registry.json`
- **THEN** it passes validation

#### Scenario: Manifest includes style definitions

- **GIVEN** the registry manifest
- **WHEN** listing items of type `registry:style`
- **THEN** it includes `react-aria-tailwind` and `react-aria-css` styles

#### Scenario: Style definitions list all components

- **GIVEN** a style definition (e.g., `react-aria-tailwind`)
- **WHEN** checking its `registryDependencies`
- **THEN** it lists all components belonging to that style

### Requirement: Registry Dependencies

Components SHALL declare dependencies using full URLs.

#### Scenario: Tailwind button depends on utils

- **GIVEN** the `react-aria-tailwind-button` registry item
- **WHEN** checking its `registryDependencies`
- **THEN** it includes `https://ui.oakoss.com/r/react-aria-tailwind-utils.json`

#### Scenario: CSS button has no utils dependency

- **GIVEN** the `react-aria-css-button` registry item
- **WHEN** checking its `registryDependencies`
- **THEN** it does NOT include a utils dependency (CSS version has no utils)

#### Scenario: CLI resolves dependencies automatically

- **GIVEN** a user installing a component with dependencies
- **WHEN** the shadcn CLI processes the request
- **THEN** dependencies are automatically fetched and installed

### Requirement: Custom Build Script

The registry SHALL use a custom build script to generate output.

#### Scenario: Build script reads source files

- **GIVEN** the build script
- **WHEN** executed
- **THEN** it reads files from `starters/[style]/src/`

#### Scenario: Build script inlines file content

- **GIVEN** a generated component JSON
- **WHEN** inspecting its `files` array
- **THEN** each file has a `content` property with the full source code

#### Scenario: Build script rewrites imports

- **GIVEN** source files with relative imports (e.g., `./Button.css`)
- **WHEN** the build script processes them
- **THEN** imports are rewritten to work in the target project

### Requirement: Build Output

The registry SHALL generate individual component JSON files for shadcn CLI consumption.

#### Scenario: Build generates component files

- **GIVEN** the registry source files
- **WHEN** `pnpm build` is run in `packages/ui`
- **THEN** `public/r/[style]-[name].json` files are generated

#### Scenario: Generated JSON includes file content

- **GIVEN** a generated component JSON file
- **WHEN** inspecting its contents
- **THEN** it includes the `files` array with `content` property containing source code

#### Scenario: Source registry.json excludes content

- **GIVEN** the source `registry.json` in package root
- **WHEN** inspecting its items
- **THEN** the `files` array does NOT include `content` property (required for registry index)
