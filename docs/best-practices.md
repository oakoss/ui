# Best practices

How to write components here. Each entry is a rule and its reason; the decision records in `docs/research/` hold the history. Add an entry when a review or discussion settles a convention, and keep rationale here rather than in component comments, since components ship into users' projects.

## React Aria

- **Read state from render props, not props.** Visuals that follow field or control state (a required asterisk, disabled or invalid styling) use React Aria's render-props values, which include values merged from context and slots. Props flow through `...props` untouched, so nothing needs forwarding.
- **Field parts wire through context.** `FieldLabel`, `FieldDescription` and `FieldError` wrap React Aria's `Label`, `Text slot="description"` and `FieldError`, so they link to the input inside any React Aria field with no ids. Don't wire `htmlFor`, `id` or `aria-describedby` by hand.
- **`FieldError` renders only while the field is invalid.** Derive `isInvalid` from the same state as the errors (`isInvalid={!field.state.meta.isValid}`), or the field stays red after the errors clear.
- **Hover, press and pending use the `tailwindcss-react-aria-components` variants** (`hover:`, `pressed:`, `pending:`). `hover:` and `pressed:` match React Aria's `data-hovered` and `data-pressed`, which React Aria leaves off while a control is pending or disabled; `pending:` matches `data-pending`. `hover:` falls back to `:hover` on plain elements but `pressed:` doesn't, so add a `not-data-rac:active:` fallback for plain elements such as an `<a>` styled with `buttonStyles`.
- **Apps own the locale.** Components never render `I18nProvider`.
- **Links are links.** A link that looks like a button is React Aria's `Link` with `buttonStyles`, which also serves TanStack Router's `createLink`.

## Component APIs

- **Props or children, not both.** A component with a default layout takes layout props or children, enforced by a union type with `Partial<Record<…, never>>`. Children that render nothing (`null`, booleans) are excluded from the type.
- **Values that render nothing mount nothing.** `label={show && 'Email'}` or `description=""` must not mount an empty part for `aria-labelledby` or `aria-describedby` to point at.
- **One component plus a `<name>Styles` helper only when needed.** Export a merged helper (`buttonStyles({ className })`) when another element needs the styles, such as a link styled as a button; never export a raw `tv` instance.
- **A prop that shadows an HTML attribute replaces it in the type.** `Input`'s `size` is the control height, so its props `Omit` the HTML `size`, and a type test pins it.
- **Icon-only controls require a name in the type.** Icon sizes require `aria-label` or `aria-labelledby`.

## Styling

- **Every `tv` result goes through `cn` or `cx`.** `tailwind-variants/lite` doesn't merge. `cn` takes `ClassInput`, which rejects an uncalled slot (`cn(styles.label)`).
- **`data-slot` on every part, with upstream shadcn names** (`field-label`, `field-description`, `field-error`, `input`), so consumers can target parts.
- **Tokens, not raw values.** Control heights use `h-control-sm`/`h-control`/`h-control-lg`, padding `px-control-x`, radius `rounded-control`. oxlint's `no-arbitrary-values` allows exceptions per file only.
- **Per-component color variables.** A component recolors through its own prefix (`--btn-*`), not a shared one, so each can be tuned alone.
- **Logical utilities only** (`ps`/`pe`, `ms`/`me`, `start`/`end`, `text-start`); the lint rule bans physical ones in component files.
- **Hover and press on non-solid looks are a state layer.** The `stateLayer` recipe tints the surface with its own text color at the tokens' strengths (8% hover, 12% press), which the tokens keep text AA under. Solid fills swap to their `-hover` color instead.
- **Arbitrary-value exceptions name each value.** A per-file oxlint allow list may wildcard the variable name but lists each color (`[--btn-*:var(--color-primary)]`); a `*` in the value would also admit a hardcoded fallback like `var(--color-primary,#f00)`.

## Registry

- **Every `registry:ui` item depends on `oakoss/ui/theme`,** which installs the tokens and the React Aria Tailwind plugin the variants need.
- **An item ships what it imports:** every local file in its `files` or through `registryDependencies`, and every package in `dependencies`. `registry.test.ts` checks both.

## Accessibility

- **Borders that identify a control need 3:1.** Use `border-input` at rest and `destructive-text` when invalid; the `-border` intent roles are decorative.
- **Focus is an outline, not a ring box-shadow,** because forced-colors mode removes box-shadows. Use the `focusRing` or `inputFocusRing` recipe.
- **Visual-only marks are `aria-hidden`.** A required asterisk would otherwise be read on top of React Aria's own required state.
- **Several messages in one described-by target need a separator in the text.** `aria-describedby` reads text flat, so layout alone doesn't separate them.
- **Pointer targets reach 44×44** with the `targetSize` recipe, which grows the hit area without changing the visible size. Turn it off only where controls sit closer than that (toolbars, button groups), or neighbors take each other's clicks.
- **Controls stay visible in forced colors.** Every control keeps a border or outline in Windows High Contrast; stories tagged `forced-colors` run under that emulation.

## Strings

- **No hardcoded user-facing English.** Text React Aria doesn't translate is a prop with an English default (`pendingLabel = 'Pending'`), so no fallback message is invented inside a component.

## Tests

- **Stories are the component tests.** Assert behavior (accessible name and description, computed styles) rather than class names, and check a guard by breaking the code under it: a test that passes either way isn't guarding anything.
- **Type rules get type tests.** `@ts-expect-error` cases in a `*.test.ts` fail the typecheck when a rule stops holding.
- **Stories run axe in the light and dark projects** (stories tagged `forced-colors` run only in their own project), and RTL stories set `globals: { locale: 'ar-EG' }`.
- **`CssCheck` stories assert values from utilities used only in `packages/ui`,** so they fail if Tailwind stops scanning the package. Keep those class names out of story files.
- **One press per element.** Storybook's `userEvent` releases a held press without React Aria seeing it, so a second reading on the same element sees a stale `data-pressed`.
