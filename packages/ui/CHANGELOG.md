# Changelog

## 0.4.1 (2026-10-17)

### Fixed

Text Field, Search Field, Sheet and `cx` import their types with `import type`, so an installed copy no longer keeps a runtime import of a module it uses only for types.

## 0.4.0 (2026-10-16)

### Added

Add an installable theme item per family (`theme-<family>`), so `shadcn add oakoss/ui/theme-mauve` switches a project's colors.

Add Dropdown Menu and Context Menu, sharing menu parts with shortcuts, descriptions, checkbox and radio groups, destructive items, links and submenus. A Button that opens a menu or listbox stays full size while its popup is open, so the popup sits where it was placed.

Add Command, a searchable list of commands built on Autocomplete and the menu parts, inline or in a dialog, with groups, keywords, shortcuts and descriptions.

**Breaking:** `isEmptyNode` moves from Field to its own file. Import it from `@/lib/empty-node` instead of `@/components/ui/inputs/field`.

Alert: a callout with `AlertTitle`, `AlertDescription` and `AlertAction`, in neutral (the default), info, success, warning and destructive intents. Each colored intent shows an icon, hidden from screen readers, so the meaning isn't color alone; `icon` replaces it, and a value that renders nothing hides it. It has no role by default, where upstream's always announced itself with `role="alert"`; `role` takes `alert` for something urgent or `status` for a message that waits its turn. `AlertAction` sits after the text on a wide alert and below it on a narrow one, where upstream pinned it in the corner with a fixed space beside the text, and the layout follows the reading direction. Links in an alert are underlined, and the border keeps its edge in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/alert`.

Badge: a short label or count in neutral, primary (the default), success, warning, destructive and info intents, each `solid`, `soft` or `outline`, the same `intent` and `variant` names as Button. A badge that's a link or button is React Aria's `Link` or `Button` with `badgeStyles`, which adds hover, press, focus, a disabled look and a 44×44 pointer target, and a plain badge has no hover style, where upstream's `ghost` and `link` variants gave one to any badge. Upstream's `render` prop is gone. Digits are tabular and text stays on one line, and a solid badge keeps its edge in Windows High Contrast. The docs map upstream's variants to these and show a count read whole by screen readers. Install with `npx shadcn@latest add oakoss/ui/badge`.

Progress: a bar on React Aria's `ProgressBar`. `label` renders the label and the value, formatted for the locale, above the track; children replace that layout, built from `ProgressLabel`, `ProgressValue` and `ProgressTrack`, where upstream rendered its children above a track it always added, so a hand-placed track drew twice. Intents color the fill with a color that keeps 3:1 against the track in light and dark. An indeterminate bar slides a short fill across the track in the reading direction, where upstream's was a full, static bar that looked finished, and with reduced motion the fill rests mid-track. A value arriving after an indeterminate bar starts the fill at that value. The fill takes the system's highlight color in Windows High Contrast. The item adds its animation to your stylesheet's `@theme inline`. Install with `npx shadcn@latest add oakoss/ui/progress`.

Tag Group: a labeled set of tags on React Aria's `TagGroup`, which the user can remove or select. `label`, `description`, `errorMessage` and `emptyLabel` (default "No tags") sit around the tags, which are its children or built from `items`. `onRemove` adds a 24px remove button to each tag, named "Remove" with the tag's text in the user's language, and Delete or Backspace removes the focused tag. Tags come in neutral (the default), primary, success, warning, destructive and info intents, soft at rest and solid when selected, so selection isn't color alone. A tag whose content isn't plain text needs `textValue`, checked by the types; a link tag is underlined; a long tag truncates under a width you set while its name stays whole; and the empty list shows the focus outline after the last removal. In Windows High Contrast a selected tag takes the system's selection colors and a disabled one its disabled color. Install with `npx shadcn@latest add oakoss/ui/tag-group`.

Meter: a value within a known range, such as storage used, on React Aria's `Meter`. It takes Progress's layout: `label` renders the label and the value, formatted for the locale, above the track, and children replace that layout, built from `MeterLabel`, `MeterValue` and `MeterTrack`. Each intent's fill keeps 3:1 against the track in light and dark, the fill slides to a new value, and it takes the system's highlight color in Windows High Contrast. The docs show units and computing an intent from thresholds. Install with `npx shadcn@latest add oakoss/ui/meter`.

Radio Group: the group's description and error now sit above the options, between the label and the list, so they're read before it. Text fields keep theirs below the input.

Number Field: a number input on React Aria's `NumberField`, formatted for the locale through `formatOptions` (currency, percent, units). `label`, `description` and `errorMessage` lay it out like Text Field, or children replace the layout, with `NumberFieldStepper` for the steppers. `steppers` places the buttons: `split` (the default) puts − before the value and + after it, `start` and `end` put the pair on one side, and `none` leaves them out. React Aria names each stepper for the field, translated, and keeps it out of the tab order; a stepper at a bound fades, the steppers stay square at every size and widen to 44px on phones, and in Windows High Contrast a disabled one takes the system's disabled color. Install with `npx shadcn@latest add oakoss/ui/number-field`.

Search Field: a search input on React Aria's `SearchField`, with a leading search icon and a clear button that appears once there's text. React Aria names the button "Clear search", translated, and keeps it out of the tab order, since Escape clears; it's hidden while the field is empty or read-only. Without a label or a name of its own, the field is named "Search". The on-screen keyboard's Enter key reads Search (`enterKeyHint`, overridable). `label`, `description`, `errorMessage`, `start` and `end` lay it out like Text Field, or children replace the layout, with `SearchFieldClear` for the button. Install with `npx shadcn@latest add oakoss/ui/search-field`.

Checkbox Group: checkboxes on React Aria's `CheckboxGroup`, with `CheckboxGroupItem` for each option. The group's `label` names it, and its `description` and error sit between the label and the options. `orientation` lays the options out vertically (the default) or in a row that wraps; `variant="card"` makes each whole option the click target; `targetSize` gives each box a 44px hit area. A required group's error defaults to "Select at least one option." (`requiredLabel`). Checkbox exports `CheckboxIndicator`, the box both share. Install with `npx shadcn@latest add oakoss/ui/checkbox-group`.

Calendar and RangeCalendar: date pickers on React Aria's `Calendar` and `RangeCalendar`, showing one or more months (`visibleMonths`) and always six weeks, so the height holds between months. Days are 36px and grow to 44px wherever a touch pointer is present; today has a dot, never a fill, so it shows inside a range. A range fills its ends and runs a band through the days between, outside-month days included. Unavailable days are struck through, `errorMessage` shows while invalid, `isLoading` fades the months behind a spinner, and `heading` and `footer` take content of your own, such as presets. In Windows High Contrast the selected day takes the system's selection colors. Install with `npx shadcn@latest add oakoss/ui/calendar`; `calendar-month-year-select` adds month and year dropdowns for the heading, which keep the month and day when the year list stops at `minValue` or `maxValue`, and are disabled with the calendar.

Add Table: a plain HTML table with optional sticky header and first column, compact and striped rows, end-aligned numbers, a selected-row style, and a scroll area that becomes a named, focusable region only when it overflows.

Table rows tint on hover only with the `interactive` prop. A row or cell marked `aria-current` takes a warm linked tint, a focused cell draws the focus ring, and scrolling pads by the sticky header and first column so a linked row lands clear of them. `--table-bg` can be set on any ancestor, digits have equal width across the table, and a selected row's tint is stronger in dark mode.

### Fixed

Select and Combobox options with an interpolated label, such as `Delete {count} files`, now filter and typeahead as one string, and a blank `textValue` falls back to the text label; choosing such an option fills Combobox's input with that text. A blank `emptyLabel` on Combobox shows an empty list instead of an unnamed option.

Tag Group, Select, Combobox, Dropdown Menu, Context Menu and Command render their empty label through a shared `lib/empty-state.ts`, which installs with each of them. Tag Group's empty label is now a block like the others'.

Input hides WebKit's built-in search clear button and decoration, so Command's input and the new Search Field show only their own. A Text Field with `type="search"` no longer shows the browser's clear button; `className="[&_input::-webkit-search-cancel-button]:block"` on the Text Field brings it back.

Combobox: a button in `start` or `end` keeps its own name, tab stop and action. It had taken the trigger's, so it was named "Show suggestions" and opened the list.

Select warns in the console when a start or end decoration holds a focusable element, which can't be reached inside its trigger button.

Select's and Combobox's lists stay inside the viewport when the field spans nearly its full width. A list as wide as the field stuck out past the screen's edge, which let the page scroll sideways; in Combobox, pressing ArrowDown then closed the list and cleared what was typed.

In forced colors, a checked and disabled Checkbox, Radio or Switch now grays out like a native disabled control instead of drawing the enabled selection colors, and Calendar's invalid selected day uses MarkText on its Mark fill, so its number stays readable in the light High Contrast palette. TagGroup drops a forced-colors class that changed nothing.

## 0.3.0 (2026-10-11)

### Added

Accordion: built on React Aria's `DisclosureGroup`, `Disclosure` and `DisclosurePanel`. Each trigger sits in a heading, level 3 by default and set with `headingLevel`, and is a 44px target with the focus outline, where upstream's used a box-shadow ring that forced colors drop. The panel animates its height, and a closed one stays findable with find-in-page. The single chevron turns over when open and follows the trigger's text color in Windows High Contrast, and right to left the label and chevron sit at the right ends, where upstream's stayed left-aligned. `allowsMultipleExpanded` keeps several sections open, and a Collapsible inside a section opens on its own rather than closing the section around it. Install with `npx shadcn@latest add oakoss/ui/accordion`.

Tabs: built on React Aria's `Tabs`, `TabList`, `Tab` and `TabPanel`, in a filled `default` look or `variant="line"`, horizontal or vertical. `Tabs` sets the look for all its parts. In Windows High Contrast the selected tab takes the system's selection colors and the line is a border, where upstream's selected tab looked like the others, and a disabled tab takes the system's disabled color. A panel with nothing focusable inside shows the focus outline, where upstream's showed none, and the vertical line sits on the side facing the panel right to left. Install with `npx shadcn@latest add oakoss/ui/tabs`.

Breadcrumb: built on React Aria's `Breadcrumbs`, `Breadcrumb` and `Link`, current page included. The `nav` takes the name React Aria gives the list, in the user's language, where upstream's was a hardcoded English "breadcrumb"; an `aria-label` on `Breadcrumb` replaces it. The last item is marked as the current page, semibold as well as darker so the cue isn't color alone, and leaves the Tab order, links show the focus outline only on keyboard focus, so Windows High Contrast draws no box around each, and the separator points the other way right to left. The ellipsis is decorative, where upstream's hid its "More" label inside a hidden element. Install with `npx shadcn@latest add oakoss/ui/breadcrumb`.

Pagination: page links are React Aria `Link`s styled as buttons, named "Page 2" through `pageLabel`. The current page, set with `isActive`, is semibold with a border that meets 3:1, where upstream's differed by a faint border alone, and takes the system's selection colors in Windows High Contrast. The `nav` is named by `label`, Previous and Next take `rel` and `isDisabled` and keep their visible text as their name, hiding it visually on small screens, where upstream's named them with a separate English `aria-label`, and the ellipsis is announced as "More pages". Page links are 44px targets spaced 8px apart so their hit areas don't overlap. The strings are props. Install with `npx shadcn@latest add oakoss/ui/pagination`.

ButtonGroup: a React Aria `Group` that joins its direct children, Buttons, inputs and `ButtonGroupText`, horizontally or vertically. Only direct children join, so a `Kbd` inside a button keeps its corners, where upstream's rules reached inside and stripped them, and the corners follow the reading direction, where upstream's were reversed right to left. A named group has the `group` role and an unnamed one `presentation`. `size` and `variant` on the group reach its Buttons, nested groups included, but not those in a popover or dialog opened from it, and children drop their 44px hit areas and don't shrink when pressed. `ButtonGroupSeparator` is border-drawn, so it stays visible in Windows High Contrast, where upstream's disappeared. Install with `npx shadcn@latest add oakoss/ui/button-group`.

Item: a row of media, title, description and actions in `md`, `sm` and `xs` sizes. `href` makes the title a React Aria `Link` stretched over the row, where upstream made the whole row a link, so the link's name is the title alone and buttons in the row stay valid and pressable. The title link follows any router, through React Aria's `RouterProvider` or a router's own link passed as `render`. `ItemGroup` is a list whose Items are its list items and `ItemSeparator` is hidden from screen readers, where upstream's group failed axe. The title truncates to one line, where upstream's wrapped, and takes `level` to become a heading; `href={undefined}` makes no link, where upstream rendered a fake one; media is decorative unless named; focus is an outline around the row; and in Windows High Contrast the default look stays borderless, where upstream drew a box around every row. Install with `npx shadcn@latest add oakoss/ui/item`.

Collapsible: a React Aria `Disclosure` whose panel animates its height like Accordion's, where upstream's snapped open. The trigger shows the focus outline and takes any button style. Install with `npx shadcn@latest add oakoss/ui/collapsible`.

Select: single or multiple selection from a list, built on React Aria's `Select`. Its children are the options, with `label`, `description`, `errors`, `errorMessage`, `placeholder` and `size` around the trigger, where upstream had no field props, and its own field example named the select "Fruits" while the label read "Favorite Fruit". Invalid styling follows React Aria's state, in a custom layout too, where upstream's keyed on an `aria-invalid` React Aria never sets, so its error border never showed. The trigger's hit area reaches 44px. An option's `description` describes it in the list and is hidden in the trigger, where upstream read it as part of the trigger's name. The list is at least the trigger's width, so long options aren't cut off, the trigger shows focus as an outline, the focused option takes the system's selection colors in Windows High Contrast, and spacing follows the reading direction. Sections draw their own dividers, where upstream's separator was an invalid child of the listbox. `selectionMode="multiple"` lists the picks in the user's language, and `start` and `end` put text or an icon inside the trigger. Install with `npx shadcn@latest add oakoss/ui/select`.

Combobox: a text input that filters a list of options as you type, built on React Aria's `ComboBox`. Its children are the options, with `label`, `description`, `errors`, `errorMessage`, `placeholder`, `size`, `start` and `end` around the input, where upstream had no field props. A function child needs `items` or `defaultItems`, checked by the types. A clear button appears once there's text, stays out of the Tab order, leaves focus in the input, and isn't shown on a disabled or read-only field; `clearLabel` names it, where upstream's name was fixed in English. A list with nothing matching says so inside the listbox, with `emptyLabel`. `loadingState` takes `useAsyncList`'s, showing a spinner in the field after 500ms, and `onLoadMore` fetches the next page as the list scrolls, which upstream didn't have. Sections, headers and option descriptions work as on Select. The trigger doesn't hold a pressed look while the list is open, and the list is at least the field's width, where upstream's was exactly that width and cut long options off. Single selection only. Install with `npx shadcn@latest add oakoss/ui/combobox`.

Native Select: the browser's own select, styled like the other fields, with `label`, `description`, `errors`, `errorMessage` and `size` from the Field parts, which upstream didn't have. Its other props go to the `<select>`, so a form library's field props spread onto it, and a React Aria `Form`'s `validationErrors` reach it by `name`. `isInvalid` sets `aria-invalid`, describes the select with the error and turns the border destructive; `required` marks the label. Options take the theme's popover colors, so the open list stays readable in dark mode. The chevron sits at the end of the reading direction, and `multiple` drops it and lets the list grow. Install with `npx shadcn@latest add oakoss/ui/native-select`.

Fields no longer fade a disabled control further in Windows High Contrast, which already shows it in the system's disabled color.

Input's props type accepts `ref`, which React 19 already passed through.

Textarea: a React Aria `TextArea` that grows with its content through CSS `field-sizing: content`, from `minRows` (3 by default) up to `maxRows`, then scrolls, where upstream's grew without limit and ignored `rows`. One row is exactly an Input of the same `size`, with its text on the same line. Where the box grows on its own the resize handle is hidden, since a drag would fix the height; `autoGrow={false}` keeps a fixed height with a vertical handle, and older browsers without auto-grow keep the handle too. Focus is an outline, so it shows in Windows High Contrast, where upstream's box-shadow ring disappeared. `TextareaField` takes TextField's label, description and error props with a Textarea in place of the input. Install with `npx shadcn@latest add oakoss/ui/textarea`, or `text-field` for `TextareaField`.

InputGroup: text, icons and buttons inside an input's or textarea's border, built on React Aria's `Group`. Upstream wrapped Input and Textarea in parts of their own; ours go in as they are, dropping their border and focus outline for the group's. The outline wraps the group while the input has focus, where upstream's box-shadow ring vanished in Windows High Contrast, and a focused addon button shows only its own. Clicking an addon focuses the control, textarea included, but not when the click lands on something interactive, where upstream's found only an input and took focus from a select. Addons are plain elements rather than unnamed groups, and an unnamed group adds nothing for screen readers. Buttons in an addon are small and ghost with no 44px hit area, and the spacing follows the reading direction. `size` sets the height. Install with `npx shadcn@latest add oakoss/ui/input-group`.

TextField and TextareaField take `start` and `end`: text or an icon inside the border, in an InputGroup. Text is added to the input's description, so screen readers hear a unit such as "kg"; on a textarea they sit above and below it.

### Changed

Tooltip and HoverCard install `useOverlayOpen` into your project's hooks folder (the `hooks` alias in `components.json`) instead of `lib`. A project that already has `lib/use-overlay-open.ts` keeps it until it adds either component again, which writes the new file and imports it from hooks.

Input moves from `field.tsx` to its own `input.tsx` and registry item, as upstream has it. `add field` still installs it, but imports change from `@ui/inputs/field` to `@ui/inputs/input`.

### Fixed

A disabled Button, Toggle, ToggleGroupItem, or React Aria `Link` styled with `buttonStyles` paints like a native disabled button in Windows High Contrast: the system's disabled color, unfaded. A disabled link styled as a button showed black text at half opacity, and a disabled button showed the disabled color at half opacity. A disabled toggle that's on takes the disabled color too, rather than the selection colors, which made it look live.

A pressed item in a joined ToggleGroup keeps its size rather than shrinking away from its neighbors. An item's own corner classes, such as `rounded-full`, now set its outer corners in a joined group while its inner corners stay square; before, the group's corners won outside and the item's inside. Joining now comes from a shared `joined` recipe in `lib/recipes.ts`, which ButtonGroup uses too.

Toggle and ToggleGroupItem keep their label visible when on in Windows High Contrast. The page-colored backplate forced colors draw behind text covered the selection fill, so the light label disappeared; a selected toggle now opts out of it and paints its label on the system's selection color.

## 0.2.0 (2026-10-09)

### Added

Dialog: a modal built on React Aria's Modal and Dialog, with a title, description, footer and close buttons, sizes (`sm`, `md`, `lg`, `full`), and a `DialogBody` that scrolls between a fixed header and footer. Its height follows the visible viewport, and below the `sm` breakpoint every size but `full` sits on the bottom edge. `DialogContent` is the panel on its own, for a custom modal. Install with `npx shadcn@latest add oakoss/ui/dialog`.

AlertDialog: a dialog for a decision. Focus starts on Cancel, a click outside doesn't close it, and `AlertDialogAction` runs `onAction` before closing: a returned promise shows the button's pending state and blocks dismissal, and a failure keeps the dialog open and goes to `onError`. Install with `npx shadcn@latest add oakoss/ui/alert-dialog`.

Sheet: a panel that slides in from an edge, built on Dialog. `side` takes `start` and `end`, which follow the page's `dir`, plus `top` and `bottom`; `size` sets a side sheet's width, and a bottom sheet pads for a phone's home indicator. Install with `npx shadcn@latest add oakoss/ui/sheet`.

Popover: a panel anchored to a trigger, built on Dialog's parts, so `PopoverTitle` names it. `showArrow` adds an arrow that points at the trigger, `PopoverBody` scrolls tall content, and the panel sits on the `--z-popover` layer. `PopoverContent` is the panel without the dialog, for another React Aria popover to share its look. Install with `npx shadcn@latest add oakoss/ui/popover`.

Tooltip: a short label on hover or keyboard focus. Hover waits half a second to open and to close, the arrow points at the trigger from any placement, and it sits on the `--z-tooltip` layer above popovers and toasts. Any trigger React Aria can focus works without a wrapper, and open state lives on `TooltipTrigger`, so a disabled trigger's tooltip stays closed. Install with `npx shadcn@latest add oakoss/ui/tooltip`.

HoverCard: a preview of a link's content on hover, keyboard focus or long press, built on React Aria's `PreviewTrigger` (react-aria-components 1.20 or later) with Popover's styles. It requires a name, keeps React Aria's 600ms and 200ms delays, and stays reachable inside an open Dialog. Install with `npx shadcn@latest add oakoss/ui/hover-card`.

ContextualHelp: a help or info icon button that opens a Popover of explanation, for help a tooltip can't hold or touch can't reach. Its labels are props, and the popover lines up with the button's start edge. Install with `npx shadcn@latest add oakoss/ui/contextual-help`.

Checkbox: built on React Aria's `CheckboxField` and `CheckboxButton`, with its children as the label, so the label is the name and the click target. `description` and `errorMessage` or `errors` sit under the label, wired with no ids. Indeterminate shows a minus, an invalid box keeps its error border when checked, the box's hit area grows to 44px (`targetSize={false}` turns it off), and checked boxes stay visible in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/checkbox`.

Radio Group: `RadioGroup` takes a `label`, `description` and errors, and its `RadioGroupItem`s take their label as children and a `description` each, all wired with no ids. Built on React Aria's `RadioField` and `RadioButton`. `orientation="horizontal"` lays options out in a row, and `variant="card"` makes each option a card that selects from anywhere on it. A selected dot is a thick ring that stays visible in Windows High Contrast, and stacked options sit far enough apart for their 44px targets. Install with `npx shadcn@latest add oakoss/ui/radio-group`.

Switch: built on React Aria's `SwitchField` and `SwitchButton`, with its children as the label, so the label is the name and the click target. `size` takes `sm` and `md`, and `labelPlacement="start"` makes a settings row with the switch at the end. The thumb stays inside the track right to left, where upstream's overflowed, and stays visible on and off in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/switch`.

Slider: takes a `label`, shown with the value formatted for the locale, and a `description` that React Aria's Slider can't link, wired to every thumb. A range requires `thumbLabels`, so each thumb has its own name ("Minimum Price"), where upstream's thumbs shared one. The thumbs sit inside the track, so they stay on the fill's end with a label above, where upstream's drifted. The track takes presses in a 44px band, `orientation="vertical"` stands it upright, and the rail, fill and thumbs stay visible in Windows High Contrast. A disabled slider marks its whole group disabled, not just the inputs. `children` replace the layout with `FieldLabel`, `SliderOutput`, `SliderTrack` and `FieldDescription`. Install with `npx shadcn@latest add oakoss/ui/slider`.

Toggle: a React Aria `ToggleButton` on Button's sizes and 44px target, in `ghost` or `outline`. On is Button's solid neutral fill, where upstream's matched its hover at 1.1:1 and vanished in Windows High Contrast; there it now takes the system's selection colors. Icon sizes require an `aria-label`. Install with `npx shadcn@latest add oakoss/ui/toggle`.

Toggle Group: `ToggleGroup` and `ToggleGroupItem` select one option, as a radio group, or several with `selectionMode="multiple"`, as a toolbar. Items take the group's `size` and `variant` unless they set their own, where upstream's group overrode them, and show Toggle's solid on state, where upstream's matched its hover. Each item requires the `id` the group selects it by. Items sit 8px apart, or edge to edge with `joined`, whose corners follow right-to-left layouts and whose selected neighbors keep a line between them. Install with `npx shadcn@latest add oakoss/ui/toggle-group`.

Field: `Field` lays out a label and control, `vertical` by default; `horizontal` keeps them in a row, and `responsive` is a row once its `FieldGroup` is 28rem wide. `FieldContent` stacks a label and description beside a control, and `FieldSeparator` divides fields, with optional text between two lines. `Field` adds no role or context, so it leaves React Aria's own wiring alone. Installing Field now also installs Separator.

Avatar: a person's image with initials in `AvatarFallback` that show until it loads, and stay when it fails. The image reads its state when mounted, so a server-rendered image that loaded before hydration shows; it starts over when `src` changes, and a lazy image still loads. `size` takes `sm`, `md` and `lg`; `AvatarBadge` marks a status at the end edge, and `AvatarGroup` overlaps avatars as a `group`. The parts are spans, so an avatar fits in a link or button. Install with `npx shadcn@latest add oakoss/ui/avatar`.

Card: a surface for related content, with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`. `CardTitle` is a heading (`level`, 3 by default), `size="sm"` tightens every part, and the card keeps a border in Windows High Contrast. The docs show a clickable card built from a stretched link. Install with `npx shadcn@latest add oakoss/ui/card`.

Empty: an empty state, with `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription` and `EmptyContent`. `EmptyTitle` is a heading (`level`, 3 by default) and `EmptyDescription` a paragraph. `EmptyMedia` is hidden from screen readers unless named, and its `icon` variant keeps an outline in Windows High Contrast. Its `data-slot` is `empty-media`, where upstream renders `empty-icon`. Install with `npx shadcn@latest add oakoss/ui/empty`.

Kbd: a keyboard key, and `KbdGroup` for a combination. A `label` prop has screen readers say "Command" instead of reading ⌘. Inside a React Aria menu item, the group takes the shortcut's id, so the item's description reads the whole combination and no id repeats. Install with `npx shadcn@latest add oakoss/ui/kbd`.

Scroll Area: a region that scrolls its content with thin native scrollbars, whose thumb meets 3:1 contrast. It's focusable, so keyboard users can scroll it, with the focus ring inside its edge; `orientation` limits scrolling to `vertical` or `horizontal`. Install with `npx shadcn@latest add oakoss/ui/scroll-area`.

Skeleton: a placeholder shape with a pulse, shown while content loads. It's `aria-hidden` by default, and the docs show marking the loading region `aria-busy` instead. Install with `npx shadcn@latest add oakoss/ui/skeleton`.

Spinner: a spinning indicator announced as an indeterminate progress bar, so screen readers say its `label` ("Loading" by default) instead of reading an unnamed icon. It's a `span`, so it fits inside text and buttons. `size` takes `sm`, `md` and `lg`, and it takes the surrounding text color. Install with `npx shadcn@latest add oakoss/ui/spinner`.

Separator: a horizontal or vertical divider built on React Aria's Separator, drawn as a border so it stays visible in Windows High Contrast. A horizontal separator rendered as a `div` keeps its line, and `data-orientation` is set for both orientations. Install with `npx shadcn@latest add oakoss/ui/separator`.

### Changed

Button: a pending button renders the new Spinner, a `span`, instead of React Aria's ProgressBar `div`, which isn't allowed inside a `<button>`. Its name and announcement are unchanged ("Save Pending"). Installing Button now also installs Spinner.

The z-index scale gains `--z-tooltip` (1600) above everything, and `--z-toast` moves from 1500 to 1350, between modal and popover, so a menu opened from a toast renders above it. **Breaking:** `--z-dropdown` is removed. React Aria renders menus and lists as popovers, so replace it with `--z-popover`.

### Fixed

FieldDescription, DialogDescription and EmptyDescription underline links nested in other text, such as a link inside `<strong>`, not only links placed directly in the description, so no link relies on color alone.

TextField treats a `label` or `description` that renders nothing, such as an empty fragment or an array of `false` and `null`, as absent, so it mounts no empty part for the input to point at. FieldError treats such children as absent too, so it falls back to `errors` rather than showing nothing. Field exports the check as `isEmptyNode`.

FieldLabel: a label pointed at its own control with `htmlFor` names only that control. Inside a React Aria field it also took the field's label id, so a checkbox label in a TextField repeated the field's id.

## 0.1.0 (2026-10-06)

### Added

First release. Install with the shadcn CLI from this repository: the base item (theme, color-scheme and reduced-motion styles, Lucide icons), Button, Text Field and Field, built on React Aria Components and Tailwind CSS v4.

Generated by oakum 0.5.0.
