import {
  type AccentName,
  type CatppuccinFlavor,
  type ColorFormat,
  flavors,
  type MonochromaticName,
} from '@catppuccin/palette';

import type { Color } from '#/color';
import type { NeutralRole } from '#/roles';
import type { SeededScale } from '#/scale';

import { type ColorRef, defineFamily, type Palette } from '#/family';

type Ref = ColorRef<AccentName, MonochromaticName>;

const accents = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
] as const satisfies readonly AccentName[];

// The palette's oklch lightness is 0–1, as Color's is.
function color({ oklch }: ColorFormat): Color {
  return { components: [oklch.l, oklch.c, oklch.h], space: 'oklch' };
}

/**
A flavor's own colors. Each accent seeds a scale that keeps the published
color at the step nearest its lightness; flavors differ enough in lightness
(Latte's accents sit near 500, Mocha's near 200) that each needs its own.
*/
function palette({
  colors,
}: CatppuccinFlavor): Palette<AccentName, MonochromaticName> {
  const neutral = (name: MonochromaticName) => color(colors[name]);
  const seeded = (
    name: AccentName,
  ): SeededScale<AccentName, MonochromaticName> => ({
    kind: 'seeded',
    seed: color(colors[name]),
  });
  return {
    neutrals: {
      base: neutral('base'),
      crust: neutral('crust'),
      mantle: neutral('mantle'),
      overlay0: neutral('overlay0'),
      overlay1: neutral('overlay1'),
      overlay2: neutral('overlay2'),
      subtext0: neutral('subtext0'),
      subtext1: neutral('subtext1'),
      surface0: neutral('surface0'),
      surface1: neutral('surface1'),
      surface2: neutral('surface2'),
      text: neutral('text'),
    },
    scales: {
      blue: seeded('blue'),
      flamingo: seeded('flamingo'),
      green: seeded('green'),
      lavender: seeded('lavender'),
      maroon: seeded('maroon'),
      mauve: seeded('mauve'),
      peach: seeded('peach'),
      pink: seeded('pink'),
      red: seeded('red'),
      rosewater: seeded('rosewater'),
      sapphire: seeded('sapphire'),
      sky: seeded('sky'),
      teal: seeded('teal'),
      yellow: seeded('yellow'),
    },
  };
}

function ref(name: MonochromaticName): Ref {
  return { ref: `color.${name}` };
}

/**
The style guide's map: text on base, mantle for the sidebar, surfaces for
muted and hovered areas. Cards and popovers sit on base, since surface0 is
muted and hover in the dark flavors. The guide names no border or field outline:
borders take surface1, and a field's 3:1 outline overlay2 in Latte
(overlay1 reaches 2.83:1) or overlay1 in the dark flavors. Latte's surfaces
are mantle, since text on a pressed surface0 falls under 4.5:1; muted text
is subtext1, since subtext0 on surface0 is 4.26:1 in Frappé.
*/
function roles(polarity: 'dark' | 'light'): Record<NeutralRole, Ref> {
  const surface = ref(polarity === 'light' ? 'mantle' : 'surface0');
  return {
    accent: surface,
    'accent-foreground': ref('text'),
    background: ref('base'),
    border: ref('surface1'),
    card: ref('base'),
    'card-foreground': ref('text'),
    foreground: ref('text'),
    input: ref(polarity === 'light' ? 'overlay2' : 'overlay1'),
    muted: surface,
    'muted-foreground': ref('subtext1'),
    popover: ref('base'),
    'popover-foreground': ref('text'),
    secondary: surface,
    'secondary-foreground': ref('text'),
    sidebar: ref('mantle'),
    'sidebar-accent': surface,
    'sidebar-accent-foreground': ref('text'),
    'sidebar-border': ref('surface1'),
    'sidebar-foreground': ref('text'),
  };
}

export const catppuccin = defineFamily({
  charts: {
    kind: 'ramp',
    source: { intent: 'primary' },
    steps: [300, 500, 600, 700, 800],
  },
  credit: 'Copyright (c) 2021 Catppuccin, MIT License',
  defaults: { dark: 'mocha', light: 'latte' },
  flavors: {
    frappe: {
      name: 'Frappé',
      palette: palette(flavors.frappe),
      polarity: 'dark',
      roles: roles('dark'),
    },
    latte: { name: 'Latte', polarity: 'light', roles: roles('light') },
    macchiato: {
      name: 'Macchiato',
      palette: palette(flavors.macchiato),
      polarity: 'dark',
      roles: roles('dark'),
    },
    mocha: {
      name: 'Mocha',
      palette: palette(flavors.mocha),
      polarity: 'dark',
      roles: roles('dark'),
    },
  },
  id: 'catppuccin',
  intents: {
    destructive: { choices: ['red'], default: 'red' },
    // The style guide's editor section gives information teal.
    info: { choices: ['teal', 'blue'], default: 'teal' },
    primary: { choices: accents, default: 'mauve' },
    success: { choices: ['green'], default: 'green' },
    warning: { choices: ['yellow', 'peach'], default: 'yellow' },
  },
  name: 'Catppuccin',
  palette: palette(flavors.latte),
});
