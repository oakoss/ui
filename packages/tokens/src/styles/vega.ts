import { defineStyle } from '#/style';

/**
 * shadcn's Vega style as tokens: `style-vega.css` at d75a96a, plus the base
 * `radius` from `themes.ts`.
 */
export const vega = defineStyle({
  colors: {
    field: { dark: { alpha: 0.3, role: 'input' }, light: 'transparent' },
  },
  id: 'vega',
  name: 'Vega',
  tokens: {
    badge: {
      description: 'Badge height (`cn-badge`: `h-5`).',
      namespace: 'spacing',
      value: '1.25rem',
    },
    'badge-radius': {
      description: 'Badge corner radius (`rounded-4xl`).',
      namespace: 'radius',
      value: 'var(--radius-4xl)',
    },
    control: {
      description: 'Default height of buttons, inputs and selects (`h-9`).',
      namespace: 'spacing',
      value: '2.25rem',
    },
    'control-lg': {
      description: 'Large control height (`h-10`).',
      namespace: 'spacing',
      value: '2.5rem',
    },
    'control-radius': {
      description: 'Corner radius of buttons and inputs (`rounded-md`).',
      namespace: 'radius',
      value: 'var(--radius-md)',
    },
    'control-sm': {
      description: 'Small control height (`h-8`).',
      namespace: 'spacing',
      value: '2rem',
    },
    'control-x': {
      description: 'Horizontal padding of buttons and inputs (`px-2.5`).',
      namespace: 'spacing',
      value: '0.625rem',
    },
    panel: {
      description: 'Padding of dialogs and cards (`p-6`).',
      namespace: 'spacing',
      value: '1.5rem',
    },
    'panel-radius': {
      description: 'Corner radius of dialogs and cards (`rounded-xl`).',
      namespace: 'radius',
      value: 'var(--radius-xl)',
    },
    popover: {
      description: 'Padding of popovers (`p-4`).',
      namespace: 'spacing',
      value: '1rem',
    },
    radius: {
      description: 'Base radius the `--radius-*` scale derives from.',
      namespace: null,
      value: '0.625rem',
    },
    'ring-width': {
      description: 'Width of the focus outline (shadcn `ring-3`).',
      namespace: null,
      value: '3px',
    },
    ui: {
      description: 'Text size of controls and menus (`text-sm`).',
      lineHeight: 'calc(1.25 / 0.875)',
      namespace: 'text',
      value: '0.875rem',
    },
  },
});
