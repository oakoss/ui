import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import react from '@oakoss/oxlint-config/react';
import tailwind from '@oakoss/oxlint-config/tailwind';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig, type OxlintOverride } from 'oxlint';

const intents = ['primary', 'destructive', 'success', 'warning', 'info'];
const roleSuffixes = [
  '',
  '-hover',
  '-subtle',
  '-border',
  '-text',
  '-foreground',
];
const intentColors = intents.flatMap((intent) =>
  roleSuffixes.map((s) => `${intent}${s}`),
);

// Lists each color because the plugin's `*` also matches `,#f00`, which would
// let a hardcoded fallback through.
function colorVariables(prefix: string, neutralColors: string[] = []) {
  return [...intentColors, ...neutralColors].map(
    (color) => `[--${prefix}-*:var(--color-${color})]`,
  );
}

const selectionColors = [
  'ButtonText',
  'GrayText',
  'Highlight',
  'HighlightText',
];

// Forced colors repaint a selected control's fill as the page color, so each
// state takes a system color the mode keeps. A selected or current control
// opted out of forced colors sets its own focus outline color.
const selectionStates = selectionColors.flatMap((color) => [
  ...['bg', 'border', 'text'].flatMap((property) => [
    `forced-colors:${property}-[${color}]`,
    `forced-colors:current:${property}-[${color}]`,
    `forced-colors:disabled:${property}-[${color}]`,
    `forced-colors:selected:${property}-[${color}]`,
    `forced-colors:selected:not-disabled:${property}-[${color}]`,
  ]),
  `forced-colors:current:focus-visible:outline-[${color}]`,
  `forced-colors:selected:focus-visible:outline-[${color}]`,
  `forced-colors:selected:not-disabled:focus-visible:outline-[${color}]`,
]);

// Neutral has no hover role: its fill fades instead.
const neutralHover = (prefix: string) =>
  `[--${prefix}-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)]`;

// Forced colors gray a disabled control that isn't a native button (a link
// styled as a button or badge, a number field's stepper), like a native
// disabled button.
const disabledGray = ['forced-colors:disabled:text-[GrayText]'];

// The fill grows to the value, and no utility transitions width alone;
// forced colors repaint the fill as the page color.
const valueFill = ['transition-[width]', 'forced-colors:bg-[Highlight]'];

// A list scrolls within the height React Aria gives its popover.
const scrollsInPopover = ['max-h-[inherit]'];

// A disclosure panel animates the height React Aria sets, and no transition
// utility covers height alone.
const disclosurePanel = ['transition-[height]'];

// Forced colors repaint borders but not SVG fills, so an overlay's arrow
// takes the system colors itself.
const overlayArrow = [
  'forced-colors:fill-[Canvas]',
  'forced-colors:stroke-[CanvasText]',
];

// Each file gets one allow list: oxlint replaces a rule's options when a
// later override matches the same file, so lists combine here rather than
// across overrides.
const arbitraryValues: Record<string, string[]> = {
  'src/components/ui/data/badge.tsx': [
    ...colorVariables('badge', [
      'background',
      'border',
      'foreground',
      'secondary',
    ]),
    neutralHover('badge'),
    ...disabledGray,
  ],
  // Forced colors repaint a transparent border, so the default look takes
  // the page color to stay borderless.
  'src/components/ui/data/item.tsx': ['forced-colors:border-[Canvas]'],
  // Sticky cells paint --table-bg, which any ancestor can set, or the page
  // color. Forced colors repaint the tints, so a selected row takes
  // Highlight and a linked row or cell takes Mark.
  'src/components/ui/data/table.tsx': [
    'first:bg-[var(--table-bg,var(--color-background))]',
    '*:*:bg-[var(--table-bg,var(--color-background))]',
    'forced-colors:aria-selected:*:bg-[Highlight]',
    'forced-colors:aria-selected:*:text-[HighlightText]',
    'forced-colors:linked:bg-[Mark]!',
    'forced-colors:linked:text-[MarkText]!',
    'forced-colors:linked:*:bg-[Mark]!',
    'forced-colors:linked:*:text-[MarkText]!',
  ],
  'src/components/ui/data/tag-group.tsx': [
    ...colorVariables('tag', ['background', 'foreground', 'secondary']),
    neutralHover('tag'),
    // A selected tag's remove button sets its own focus outline.
    'forced-colors:focus-visible:outline-[Highlight]',
    'forced-colors:disabled:selected:text-[GrayText]',
    ...selectionStates,
  ],
  'src/components/ui/feedback/alert.tsx': [
    ...colorVariables('alert', [
      'border',
      'card',
      'card-foreground',
      'muted-foreground',
    ]),
    // The icon column, beside text that a long word can't widen.
    'grid-cols-[auto_minmax(0,1fr)]',
  ],
  'src/components/ui/feedback/meter.tsx': [
    ...colorVariables('meter'),
    ...valueFill,
  ],
  'src/components/ui/feedback/progress.tsx': [
    ...colorVariables('progress'),
    ...valueFill,
  ],
  'src/components/ui/inputs/button.tsx': [
    ...colorVariables('btn', [
      'background',
      'border',
      'foreground',
      'secondary',
    ]),
    // The label's gap-[inherit] lets size and className gaps reach the icon
    // spacing.
    'gap-[inherit]',
    neutralHover('btn'),
    ...disabledGray,
  ],
  // A selected day opts out of forced colors and sets its own outline, and an
  // invalid one takes Mark, as an invalid selection does elsewhere.
  'src/components/ui/inputs/calendar-cell.tsx': [
    ...selectionStates,
    'forced-colors:bg-[Mark]',
    'forced-colors:outline-[Highlight]',
    'forced-colors:text-[MarkText]',
  ],
  'src/components/ui/inputs/checkbox-group.tsx': selectionStates,
  'src/components/ui/inputs/checkbox.tsx': selectionStates,
  // A focused segment opts out of forced colors on a Highlight fill; a
  // disabled one is a span, so it grays itself. The segments of a long
  // locale scroll without a scrollbar.
  'src/components/ui/inputs/date-field.tsx': [
    'forced-colors:data-disabled:text-[GrayText]',
    'forced-colors:focus:bg-[Highlight]',
    'forced-colors:focus:text-[HighlightText]',
    '[scrollbar-width:none]',
  ],
  // A range's two inputs scroll together without a scrollbar.
  'src/components/ui/inputs/date-range-picker.tsx': ['[scrollbar-width:none]'],
  // A disabled field's addons gray like its native disabled input.
  'src/components/ui/inputs/input-group.tsx': [
    'forced-colors:has-[>:disabled,>[data-slot=date-range-input]>:disabled]:[&>[data-slot=input-group-addon]]:text-[GrayText]',
  ],
  // The list stays inside React Aria's 12px viewport padding on each side.
  'src/components/ui/inputs/list-box.tsx': [
    ...scrollsInPopover,
    'max-w-[calc(100%-24px)]',
    'min-w-[min(var(--trigger-width),calc(100%-24px))]',
  ],
  'src/components/ui/inputs/number-field.tsx': disabledGray,
  'src/components/ui/inputs/radio-group.tsx': selectionStates,
  'src/components/ui/inputs/slider.tsx': selectionStates,
  'src/components/ui/inputs/switch.tsx': selectionStates,
  // Heights and padding derive from the control height and line height, so
  // one row lines up with an Input of the same size.
  'src/components/ui/inputs/textarea.tsx': [
    '[--textarea-height:var(--spacing-control)]',
    '[--textarea-height:var(--spacing-control-lg)]',
    '[--textarea-height:var(--spacing-control-sm)]',
    'max-h-[calc(var(--textarea-height)+(var(--textarea-max-rows)-1)*1lh)]',
    'min-h-[calc(var(--textarea-height)+(var(--textarea-min-rows)-1)*1lh)]',
    'py-[calc((var(--textarea-height)-1lh-2px)/2)]',
  ],
  'src/components/ui/inputs/toggle-group.tsx': selectionStates,
  'src/components/ui/inputs/toggle.tsx': selectionStates,
  'src/components/ui/layout/accordion.tsx': disclosurePanel,
  'src/components/ui/layout/collapsible.tsx': disclosurePanel,
  'src/components/ui/navigation/pagination.tsx': selectionStates,
  // Icon mode fades a group label out, then takes it out of the tab order.
  'src/components/ui/navigation/sidebar-group.tsx': [
    'transition-[margin,opacity,visibility]',
  ],
  'src/components/ui/navigation/sidebar-menu.tsx': [
    'transition-[width,height,padding]',
    ...selectionStates,
  ],
  // Widths a consumer's style can override; the floating rail adds padding.
  'src/components/ui/navigation/sidebar-provider.tsx': [
    '[--sidebar-width-icon:3rem]',
    '[--sidebar-width:16rem]',
  ],
  'src/components/ui/navigation/sidebar.tsx': [
    '[--sidebar-width-mobile:18rem]',
    'transition-[inset-inline-start,inset-inline-end,width,visibility]',
    'transition-[width]',
    'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
    'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
  ],
  'src/components/ui/navigation/tabs.tsx': selectionStates,
  'src/components/ui/overlays/menu-item.tsx': colorVariables('menu'),
  'src/components/ui/overlays/menu.tsx': scrollsInPopover,
  'src/components/ui/overlays/popover.tsx': overlayArrow,
  // A bottom sheet clears the home indicator on notched phones.
  'src/components/ui/overlays/sheet.tsx': [
    'pb-[max(var(--spacing-panel),env(safe-area-inset-bottom))]',
  ],
  'src/components/ui/overlays/tooltip.tsx': overlayArrow,
  // Each size sets the variables its parts read, so a nested card's parts
  // follow their own card rather than an outer one.
  'src/components/ui/surfaces/card.tsx': [
    '[--card-spacing:var(--spacing-panel)]',
    '[--card-spacing:var(--spacing-popover)]',
    '[--card-title-size:var(--text-base)]',
    '[--card-title-size:var(--text-sm)]',
  ],
};

const componentVariables = defineConfig({
  overrides: [
    ...Object.entries(arbitraryValues).map(([file, allow]): OxlintOverride => ({
      files: [file],
      rules: { 'shadcn/no-arbitrary-values': ['error', { allow }] },
    })),
    {
      files: [
        // A fill's width is the value, which only a style can set.
        'src/components/ui/feedback/meter.tsx',
        'src/components/ui/feedback/progress.tsx',
        // The rule can't read composeRenderProps, which sets Textarea's row
        // counts and clears an overlay's inline z-index while keeping React
        // Aria's style type, and no option exempts an unreadable style.
        'src/components/ui/inputs/textarea.tsx',
        'src/components/ui/overlays/popover.tsx',
        'src/components/ui/overlays/tooltip.tsx',
      ],
      rules: { 'shadcn/no-inline-styles': 'off' },
    },
  ],
});

export default defineConfig(
  compose(base, react, tailwind, vitest, componentVariables),
);
