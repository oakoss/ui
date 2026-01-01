## ADDED Requirements

### Requirement: Namespace Registration

The registry SHALL be registered in the shadcn open source registry index.

#### Scenario: Namespace is registered

- **GIVEN** the oakoss-ui registry is deployed and publicly accessible
- **WHEN** the registration is approved by shadcn team
- **THEN** an entry for `@oakoss` exists in `https://ui.shadcn.com/r/registries.json`
- **AND** the entry maps to `https://ui.oakoss.com/r/{name}.json`

### Requirement: Namespace Installation

Users SHALL be able to install components using the namespace syntax.

#### Scenario: Install component via namespace

- **GIVEN** a user with shadcn CLI installed
- **WHEN** they run `shadcn add @oakoss/react-aria-tailwind-button`
- **THEN** the button component is installed to their project

#### Scenario: Install all components via style

- **GIVEN** a user with shadcn CLI installed
- **WHEN** they run `shadcn add @oakoss/react-aria-tailwind`
- **THEN** all Tailwind-styled React Aria components are installed

### Requirement: Namespace Search

Users SHALL be able to search the registry via namespace.

#### Scenario: Search registry

- **GIVEN** a user with shadcn CLI installed
- **WHEN** they run `shadcn search @oakoss`
- **THEN** they see a list of available components in the oakoss registry
