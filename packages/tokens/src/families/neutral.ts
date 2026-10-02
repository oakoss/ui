import { oklch } from '#/color';
import { tailwindScales } from '#/families/tailwind-scales';
import { defineFamily } from '#/family';

const accentHues = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const;

/**
 * shadcn's Neutral base color on Tailwind's palette. Neutral role values match
 * shadcn's `themes.ts` at d75a96a. Intent roles come from the intent scales,
 * and the derived roles follow primary rather than shadcn's grays.
 */
export const neutral = defineFamily({
  charts: {
    kind: 'ramp',
    source: { intent: 'primary' },
    steps: [300, 500, 600, 700, 800],
  },
  defaults: { dark: 'dark', light: 'light' },
  flavors: {
    dark: {
      name: 'Dark',
      polarity: 'dark',
      roles: {
        accent: { ref: 'color.neutral.800' },
        'accent-foreground': { ref: 'color.neutral.50' },
        background: { ref: 'color.neutral.950' },
        border: { alpha: 0.1, ref: 'color.white' },
        card: { ref: 'color.neutral.900' },
        'card-foreground': { ref: 'color.neutral.50' },
        foreground: { ref: 'color.neutral.50' },
        input: { alpha: 0.15, ref: 'color.white' },
        muted: { ref: 'color.neutral.800' },
        'muted-foreground': { ref: 'color.neutral.400' },
        popover: { ref: 'color.neutral.900' },
        'popover-foreground': { ref: 'color.neutral.50' },
        secondary: { ref: 'color.neutral.800' },
        'secondary-foreground': { ref: 'color.neutral.50' },
        sidebar: { ref: 'color.neutral.900' },
        'sidebar-accent': { ref: 'color.neutral.800' },
        'sidebar-accent-foreground': { ref: 'color.neutral.50' },
        'sidebar-border': { alpha: 0.1, ref: 'color.white' },
        'sidebar-foreground': { ref: 'color.neutral.50' },
      },
    },
    light: {
      name: 'Light',
      polarity: 'light',
      roles: {
        accent: { ref: 'color.neutral.100' },
        'accent-foreground': { ref: 'color.neutral.900' },
        background: { ref: 'color.white' },
        border: { ref: 'color.neutral.200' },
        card: { ref: 'color.white' },
        'card-foreground': { ref: 'color.neutral.950' },
        foreground: { ref: 'color.neutral.950' },
        input: { ref: 'color.neutral.200' },
        muted: { ref: 'color.neutral.100' },
        'muted-foreground': { ref: 'color.neutral.500' },
        popover: { ref: 'color.white' },
        'popover-foreground': { ref: 'color.neutral.950' },
        secondary: { ref: 'color.neutral.100' },
        'secondary-foreground': { ref: 'color.neutral.900' },
        sidebar: { ref: 'color.neutral.50' },
        'sidebar-accent': { ref: 'color.neutral.100' },
        'sidebar-accent-foreground': { ref: 'color.neutral.900' },
        'sidebar-border': { ref: 'color.neutral.200' },
        'sidebar-foreground': { ref: 'color.neutral.950' },
      },
    },
  },
  id: 'neutral',
  intents: {
    destructive: { choices: ['red'], default: 'red' },
    info: { choices: ['sky', 'blue'], default: 'sky' },
    primary: { choices: ['neutral', ...accentHues], default: 'neutral' },
    success: { choices: ['green', 'emerald'], default: 'green' },
    warning: { choices: ['amber', 'yellow'], default: 'amber' },
  },
  name: 'Neutral',
  palette: {
    neutrals: { black: oklch(0, 0, null), white: oklch(100, 0, null) },
    scales: tailwindScales,
  },
});
