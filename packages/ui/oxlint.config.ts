import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import react from '@oakoss/oxlint-config/react';
import tailwind from '@oakoss/oxlint-config/tailwind';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

const intents = ['primary', 'destructive', 'success', 'warning', 'info'];
const roleSuffixes = [
  '',
  '-hover',
  '-subtle',
  '-border',
  '-text',
  '-foreground',
];
const buttonColors = [
  ...intents.flatMap((intent) => roleSuffixes.map((s) => `${intent}${s}`)),
  'background',
  'border',
  'foreground',
  'secondary',
];

// Button sets its --btn-* variables to named theme colors. Each color is
// listed because the plugin's `*` also matches `,#f00`, so a `var(--color-*)`
// entry would let a hardcoded fallback through. The label's gap-[inherit]
// lets size and className gaps reach the icon spacing.
const componentVariables = defineConfig({
  overrides: [
    {
      files: ['src/components/ui/inputs/button.tsx'],
      rules: {
        'shadcn/no-arbitrary-values': [
          'error',
          {
            allow: [
              ...buttonColors.map((color) => `[--btn-*:var(--color-${color})]`),
              'gap-[inherit]',
              // Neutral has no hover role: its fill fades instead.
              '[--btn-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)]',
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
  ],
});

export default defineConfig(
  compose(base, react, tailwind, vitest, componentVariables),
);
