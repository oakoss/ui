import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import react from '@oakoss/oxlint-config/react';
import tailwind from '@oakoss/oxlint-config/tailwind';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

import { colorVariables, selectionStates } from './oxlint.allow.ts';

// The label's gap-[inherit] lets size and className gaps reach the icon
// spacing.
const componentVariables = defineConfig({
  overrides: [
    {
      files: ['src/components/ui/inputs/button.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...colorVariables('btn', [
                'background',
                'border',
                'foreground',
                'secondary',
              ]),
              'gap-[inherit]',
              // Neutral has no hover role: its fill fades instead.
              '[--btn-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)]',
              // Forced colors gray a disabled link styled as a button too.
              'forced-colors:disabled:text-[GrayText]',
            ],
          },
        ],
      },
    },
    {
      files: ['src/components/ui/data/badge.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...colorVariables('badge', [
                'background',
                'border',
                'foreground',
                'secondary',
              ]),
              // Neutral has no hover role: its fill fades instead.
              '[--badge-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)]',
              // Forced colors gray a disabled badge link like a native one.
              'forced-colors:disabled:text-[GrayText]',
            ],
          },
        ],
      },
    },
    {
      files: ['src/components/ui/feedback/alert.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...colorVariables('alert', [
                'border',
                'card',
                'card-foreground',
                'muted-foreground',
              ]),
              // The icon column, beside text that a long word can't widen.
              'grid-cols-[auto_minmax(0,1fr)]',
            ],
          },
        ],
      },
    },
    {
      files: ['src/components/ui/feedback/meter.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...colorVariables('meter'),
              // The fill grows to the value; no utility transitions width
              // alone.
              'transition-[width]',
              // Forced colors repaint the fill as the page color.
              'forced-colors:bg-[Highlight]',
            ],
          },
        ],
        // The fill's width is the value, which only a style can set.
        'shadcn/no-inline-styles': 'off',
      },
    },
    {
      files: ['src/components/ui/feedback/progress.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...colorVariables('progress'),
              // The fill grows to the value; no utility transitions width
              // alone.
              'transition-[width]',
              // Forced colors repaint the fill as the page color.
              'forced-colors:bg-[Highlight]',
            ],
          },
        ],
        // The fill's width is the value, which only a style can set.
        'shadcn/no-inline-styles': 'off',
      },
    },
    {
      files: ['src/components/ui/surfaces/card.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // Each size sets the variables its parts read, so a nested card's
          // parts follow their own card rather than an outer one.
          {
            allow: [
              '[--card-spacing:var(--spacing-panel)]',
              '[--card-spacing:var(--spacing-popover)]',
              '[--card-title-size:var(--text-base)]',
              '[--card-title-size:var(--text-sm)]',
            ],
          },
        ],
      },
    },
    {
      files: ['src/components/ui/overlays/sheet.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // A bottom sheet clears the home indicator on notched phones.
          {
            allow: [
              'pb-[max(var(--spacing-panel),env(safe-area-inset-bottom))]',
            ],
          },
        ],
      },
    },
    {
      files: [
        'src/components/ui/layout/accordion.tsx',
        'src/components/ui/layout/collapsible.tsx',
      ],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // A disclosure panel animates the height React Aria sets, and no
          // transition utility covers height alone.
          { allow: ['transition-[height]'] },
        ],
      },
    },
    {
      files: ['src/components/ui/inputs/textarea.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // Heights and padding derive from the control height and line
          // height, so one row lines up with an Input of the same size.
          {
            allow: [
              '[--textarea-height:var(--spacing-control)]',
              '[--textarea-height:var(--spacing-control-lg)]',
              '[--textarea-height:var(--spacing-control-sm)]',
              'max-h-[calc(var(--textarea-height)+(var(--textarea-max-rows)-1)*1lh)]',
              'min-h-[calc(var(--textarea-height)+(var(--textarea-min-rows)-1)*1lh)]',
              'py-[calc((var(--textarea-height)-1lh-2px)/2)]',
            ],
          },
        ],
        // The rule can't read composeRenderProps, which sets the row counts
        // while keeping React Aria's style type.
        'shadcn/no-inline-styles': 'off',
      },
    },
    {
      files: ['src/components/ui/overlays/menu.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // The menu scrolls within the height React Aria gives the popover.
          { allow: ['max-h-[inherit]'] },
        ],
      },
    },
    {
      files: ['src/components/ui/overlays/menu-item.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          { allow: colorVariables('menu') },
        ],
      },
    },
    {
      files: ['src/components/ui/inputs/list-box.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // The list scrolls within the height React Aria gives the popover.
          { allow: ['max-h-[inherit]'] },
        ],
      },
    },
    {
      files: ['src/components/ui/data/item.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // Forced colors repaint a transparent border, so the default look
          // takes the page color to stay borderless.
          { allow: ['forced-colors:border-[Canvas]'] },
        ],
      },
    },
    {
      files: [
        'src/components/ui/overlays/popover.tsx',
        'src/components/ui/overlays/tooltip.tsx',
      ],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          // Forced colors repaint borders but not SVG fills, so the arrow
          // takes the system colors itself.
          {
            allow: [
              'forced-colors:fill-[Canvas]',
              'forced-colors:stroke-[CanvasText]',
            ],
          },
        ],
        // The rule can't read composeRenderProps, which clears React Aria's
        // inline z-index while keeping its style type, and no option exempts
        // an unreadable style object.
        'shadcn/no-inline-styles': 'off',
      },
    },
    {
      files: [
        'src/components/ui/inputs/checkbox.tsx',
        'src/components/ui/inputs/radio-group.tsx',
        'src/components/ui/inputs/slider.tsx',
        'src/components/ui/inputs/switch.tsx',
        'src/components/ui/inputs/toggle-group.tsx',
        'src/components/ui/inputs/toggle.tsx',
        'src/components/ui/navigation/pagination.tsx',
        'src/components/ui/navigation/tabs.tsx',
      ],
      rules: {
        'shadcn/no-arbitrary-values': ['error', { allow: selectionStates }],
      },
    },
    {
      files: ['src/components/ui/data/tag-group.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...colorVariables('tag', [
                'background',
                'foreground',
                'secondary',
              ]),
              // Neutral has no hover role: its fill fades instead.
              '[--tag-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)]',
              // A selected tag's remove button sets its own focus outline.
              'forced-colors:focus-visible:outline-[Highlight]',
              'forced-colors:disabled:selected:text-[GrayText]',
              ...selectionStates,
            ],
          },
        ],
      },
    },
  ],
});

export default defineConfig(
  compose(base, react, tailwind, vitest, componentVariables),
);
