# Components

How to write a component in `packages/ui`. Each entry is a rule and its reason; the decision records in `docs/research/` hold the history. Keep rationale here rather than in component comments, since components ship into users' projects. Stories and type tests follow [testing](testing.md), and registry items follow [registry](registry.md).

## Porting

- **Survey before porting.** Before writing a component, compare how 3–5 React Aria libraries (React Aria's starter kit, Intent UI, Jolly UI, HeroUI, Untitled UI) and the WAI-ARIA pattern handle it, and pick the features worth adding beyond upstream. Upstream is a starting point, not the spec: Dialog's port found an unnamed dialog, an unlinked description and unscrollable tall content.

## React Aria

- **Read state from render props, not props.** Visuals that follow field or control state (a required asterisk, disabled or invalid styling) use React Aria's render-props values, which include values merged from context and slots. Props flow through `...props` untouched, so nothing needs forwarding.
- **Field parts wire through context.** `FieldLabel`, `FieldDescription` and `FieldError` wrap React Aria's `Label`, `Text slot="description"` and `FieldError`, so they link to the input inside any React Aria field with no ids. Don't wire `htmlFor`, `id` or `aria-describedby` by hand.
- **`FieldError` renders only while the field is invalid.** Derive `isInvalid` from the same state as the errors (`isInvalid={!field.state.meta.isValid}`), or the field stays red after the errors clear.
- **Hover, press and pending use the `tailwindcss-react-aria-components` variants** (`hover:`, `pressed:`, `pending:`). `hover:` and `pressed:` match React Aria's `data-hovered` and `data-pressed`, which React Aria leaves off while a control is pending or disabled; `pending:` matches `data-pending`. `hover:` falls back to `:hover` on plain elements but `pressed:` doesn't, so add a `not-data-rac:active:` fallback for plain elements such as an `<a>` styled with `buttonStyles`.
- **Apps own the locale.** Components never render `I18nProvider`.
- **Direction comes from the locale.** There's no `DirectionProvider`: apps set direction with a locale through `I18nProvider`. `dir` on an element flips layout only; React Aria's keyboard and placement direction come from the locale. Forcing a locale's script to flip direction also changes formatting (`ar-EG` forced to Latin script renders Latin digits).
- **React Aria is the only headless library.** A maintained package is fine when it makes a component easier (`react-resizable-panels`, `embla-carousel-react`, `input-otp`, `sonner`), but not a different headless library such as Base UI.
- **Links are links.** A link that looks like a button is React Aria's `Link` with `buttonStyles`, which also serves TanStack Router's `createLink`.

## Component APIs

- **Props or children, not both.** A component with a default layout takes layout props or children, enforced by a union type with `Partial<Record<…, never>>`. Children that render nothing (`null`, booleans) are excluded from the type.
- **Values that render nothing mount nothing.** `label={show && 'Email'}` or `description=""` must not mount an empty part for `aria-labelledby` or `aria-describedby` to point at.
- **One component plus a `<name>Styles` helper only when needed.** Export a merged helper (`buttonStyles({ className })`, where `className` wins over conflicting base classes) when another element needs the styles, such as a link styled as a button; never export a raw `tv` instance.
- **A prop that shadows an HTML attribute replaces it in the type.** `Input`'s `size` is the control height, so its props `Omit` the HTML `size`, and a type test pins it.
- **Icon-only controls require a name in the type.** Icon sizes require `aria-label` or `aria-labelledby`.
- **Pending keeps the label in place.** A pending control fades its label (`opacity-0`) rather than hiding it, so the width and accessible name stay, and its spinner is a `ProgressBar` named by a label prop read after the control's name ("Save Pending").

## Icons

- **Components use `icons.tsx`, imported as a namespace** (`import * as Icon`), so icon and component names never clash.
- **Each icon names its counterpart in all five libraries shadcn can install;** `shadcn add` rewrites the element for the project's `iconLibrary`. Export names must differ from the library names, or the installed file imports that name and the icon renders itself; `icons.test.ts` checks every library.
- **`IconProps` fits every library:** no `children` (Remix Icon rejects them) and a numeric `strokeWidth` (HugeIcons needs one).
- **`IconResolverContext` exists so Storybook renders real icons;** installed components never reach it.

## Styling

- **In a `tv` with `slots`, every variant value names its slot** (`true: { content: 'h-full' }`). A plain string goes to the `base` slot, which `tv` adds even when `slots` doesn't list it, so no element renders the classes; that briefly left side sheets without their width.
- **Every `tv` result goes through `cn` or `cx`.** `tailwind-variants/lite` doesn't merge. `cn` takes `ClassInput` rather than the `cn` package's `ClassValue`, whose dictionary branch accepts an uncalled slot (`cn(styles.label)`, a function) and drops its classes.
- **`data-slot` on every part, with upstream shadcn names** (`field-label`, `field-description`, `field-error`, `input`), so consumers can target parts.
- **Tokens, not raw values.** Control heights use `h-control-sm`/`h-control`/`h-control-lg`, padding `px-control-x`, radius `rounded-control`. oxlint's `no-arbitrary-values` allows exceptions per file only.
- **Per-component color variables.** A component recolors through its own prefix (`--btn-*`), not a shared one, so each can be tuned alone. Each intent sets them in `tv` classes, not generated `@utility` classes: re-adding an item reverts a consumer's edits inside its CSS, `cn` keeps two intent utilities and lets alphabetical CSS order pick the winner, and a missing stylesheet leaves the component uncolored with no error.
- **Overlays size to the visible viewport.** An overlay's height is React Aria's `--visual-viewport-height`, not `inset-0`, so a phone's on-screen keyboard doesn't cover it. Layout that depends on the available height uses a container query on the overlay (`@container-size`), not a media query, since a media query reads the page's height and misses the keyboard.
- **Enter and exit are transitions on React Aria's `entering:` and `exiting:` states,** not `tw-animate-css` keyframes. React Aria waits for an element's CSS transitions before unmounting it, so no animation package ships, and the reduced-motion layer shortens them.
- **Logical utilities only** (`ps`/`pe`, `ms`/`me`, `start`/`end`, `text-start`); the lint rule bans physical ones in component files.
- **Hover and press on non-solid looks are a state layer.** The `stateLayer` recipe tints the surface with its own text color at the tokens' strengths (8% hover, 12% press), which the tokens keep text AA under. It's a gradient so it paints over the fill. Solid fills swap to their `-hover` color instead.
- **Arbitrary-value exceptions name each value.** A per-file oxlint allow list may wildcard the variable name but lists each color (`[--btn-*:var(--color-primary)]`); a `*` in the value would also admit a hardcoded fallback like `var(--color-primary,#f00)`.

## Accessibility

- **Borders that identify a control need 3:1.** Use `border-input` at rest and `destructive-text` when invalid; the `-border` intent roles are decorative.
- **Focus is an outline, not a ring box-shadow,** because forced-colors mode removes box-shadows but repaints outlines in a system color. `ring` passes 3:1 on every surface. Use `focusRing` (keyboard focus) for controls and `inputFocusRing` (any focus) for text inputs.
- **A scrolling region is focusable** (`tabIndex={0}`, axe's `scrollable-region-focusable`), so keyboard users can scroll it, with `focusRing` drawn inside its edge (`-outline-offset-3`) where a clipping parent can't hide it.
- **Visual-only marks are `aria-hidden`.** A required asterisk would otherwise be read on top of React Aria's own required state.
- **Several messages in one described-by target need a separator in the text.** `aria-describedby` reads text flat, so layout alone doesn't separate them.
- **Pointer targets reach 44×44** (WCAG 2.5.5, above AA's 24×24) with the `targetSize` recipe, which grows the hit area without changing the visible size. Turn it off only where controls sit closer than that (toolbars, button groups), or neighbors take each other's clicks.
- **Controls and panels stay visible in forced colors.** Every control keeps a border or outline in Windows High Contrast, and a panel drawn with a ring or shadow (a dialog, a popover) adds a transparent border, which forced colors repaints.

## Strings

- **No hardcoded user-facing English.** Text React Aria doesn't translate is a prop with an English default (`pendingLabel = 'Pending'`), so no fallback message is invented inside a component. A lint rule flags JSX text and literal text in children and in text attributes (`aria-label`, `placeholder`, `title`, `alt` and the like) in component files, including one ternary or fallback deep (`label ?? 'Close'`) and literal spread props. It checks only literals in those positions, so strings built by concatenation, returned from a render prop, nested deeper, or passed through a variable or array need review.
- **Every string a component renders can be overridden per use** through that prop, whether an app translates it or just prefers other wording. The default lives in the copied file, so changing it there changes it app-wide. A strings provider for app-wide translation can come later and slot in between: prop, then provider, then default. Strings React Aria renders itself follow its own translations; where a component wraps one that can't be overridden, its docs page says so.
