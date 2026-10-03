import type { NeutralRole } from '#/roles';
import type { Step } from '#/scale';

import { oklch } from '#/color';
import { type Gray } from '#/families/tailwind-grays';
import { tailwindScales } from '#/families/tailwind-scales';
import { type ColorRef, defineFamily } from '#/family';

// Typed returns keep the unknown-key and own-gray checks a fresh literal gets.
type GrayRoles<G extends Gray> = Readonly<
  Record<NeutralRole, ColorRef<G, 'white'>>
>;

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

const whiteAlpha = (alpha: number) => ({ alpha, ref: 'color.white' }) as const;

/**
 * A shadcn base color on Tailwind's palette. shadcn maps every base color's
 * neutral roles to the same steps of its gray (`themes.ts` at d75a96a); light
 * `muted-foreground` is the one change. Intent roles come from the intent
 * scales, and the derived roles follow primary rather than shadcn's grays.
 */
function baseColor(gray: Gray, name: string) {
  return defineFamily({
    charts: {
      kind: 'ramp',
      source: { intent: 'primary' },
      steps: [300, 500, 600, 700, 800],
    },
    defaults: { dark: 'dark', light: 'light' },
    flavors: {
      dark: { name: 'Dark', polarity: 'dark', roles: darkRoles(gray) },
      light: { name: 'Light', polarity: 'light', roles: lightRoles(gray) },
    },
    id: gray,
    intents: {
      destructive: { choices: ['red'], default: 'red' },
      info: { choices: ['sky', 'blue'], default: 'sky' },
      primary: { choices: [gray, ...accentHues], default: gray },
      success: { choices: ['green', 'emerald'], default: 'green' },
      warning: { choices: ['amber', 'yellow'], default: 'amber' },
    },
    name,
    palette: {
      neutrals: { black: oklch(0, 0, null), white: oklch(100, 0, null) },
      scales: tailwindScales,
    },
  });
}

function darkRoles<G extends Gray>(gray: G): GrayRoles<G> {
  const step = grayStep(gray);
  return {
    accent: step(800),
    'accent-foreground': step(50),
    background: step(950),
    border: whiteAlpha(0.1),
    card: step(900),
    'card-foreground': step(50),
    foreground: step(50),
    input: whiteAlpha(0.15),
    muted: step(800),
    'muted-foreground': step(400),
    popover: step(900),
    'popover-foreground': step(50),
    secondary: step(800),
    'secondary-foreground': step(50),
    sidebar: step(900),
    'sidebar-accent': step(800),
    'sidebar-accent-foreground': step(50),
    'sidebar-border': whiteAlpha(0.1),
    'sidebar-foreground': step(50),
  };
}

function grayStep<G extends Gray>(gray: G) {
  return (step: Step) => ({ ref: `color.${gray}.${step}` as const });
}

function lightRoles<G extends Gray>(gray: G): GrayRoles<G> {
  const step = grayStep(gray);
  const white = { ref: 'color.white' } as const;
  return {
    accent: step(100),
    'accent-foreground': step(900),
    background: white,
    border: step(200),
    card: white,
    'card-foreground': step(950),
    foreground: step(950),
    input: step(200),
    muted: step(100),
    // shadcn's 500 falls under 4.5:1 on `muted` (100) in six of the grays.
    'muted-foreground': step(600),
    popover: white,
    'popover-foreground': step(950),
    secondary: step(100),
    'secondary-foreground': step(900),
    sidebar: step(50),
    'sidebar-accent': step(100),
    'sidebar-accent-foreground': step(900),
    'sidebar-border': step(200),
    'sidebar-foreground': step(950),
  };
}

export const mauve = baseColor('mauve', 'Mauve');
export const mist = baseColor('mist', 'Mist');
export const neutral = baseColor('neutral', 'Neutral');
export const olive = baseColor('olive', 'Olive');
export const stone = baseColor('stone', 'Stone');
export const taupe = baseColor('taupe', 'Taupe');
export const zinc = baseColor('zinc', 'Zinc');
