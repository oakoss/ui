import { describe, expect, it } from 'vitest';

import type { Polarity } from '#/family';
import type { CoreStep } from '#/scale';

import { contrastRatio } from '#/contrast';
import { resolved } from '#/css';
import { tailwindScales } from '#/families/tailwind-scales';
import { families } from '#/index';
import { pickIntentSteps } from '#/role-steps';
import { contrastMinimum } from '#/roles';

type Pick = { fill: CoreStep; foreground: CoreStep };

const brightHues = ['lime', 'yellow'] as const;
const standardHues = [
  'amber',
  'blue',
  'cyan',
  'emerald',
  'fuchsia',
  'green',
  'indigo',
  'orange',
  'pink',
  'purple',
  'red',
  'rose',
  'sky',
  'teal',
  'violet',
] as const;
const byName = (a: string, b: string) => a.localeCompare(b);
const hues = [...brightHues, ...standardHues].toSorted(byName);

type Hue = (typeof hues)[number];

// shadcn's accent themes (apps/v4/registry/themes.ts at d75a96a): the steps of
// each hue's own scale that primary and primary-foreground use.
const brightPicks = {
  dark: { fill: 500, foreground: 900 },
  light: { fill: 400, foreground: 900 },
} as const satisfies Record<Polarity, Pick>;
const standardPicks = {
  dark: { fill: 800, foreground: 50 },
  light: { fill: 700, foreground: 50 },
} as const satisfies Record<Polarity, Pick>;

// Our picks, the same in every base color. Text is always an end of the scale,
// where shadcn puts 900 on yellow and lime.
const darkFills: Readonly<Record<Hue, CoreStep>> = {
  amber: 700,
  blue: 600,
  cyan: 700,
  emerald: 700,
  fuchsia: 700,
  green: 700,
  indigo: 600,
  lime: 500,
  orange: 700,
  pink: 700,
  purple: 600,
  red: 700,
  rose: 700,
  sky: 700,
  teal: 700,
  violet: 600,
  yellow: 500,
};

function expectedPick(hue: Hue, polarity: Polarity): Pick {
  const fill = polarity === 'light' ? 700 : darkFills[hue];
  const foreground = fill === 500 ? 950 : 50;
  return { fill, foreground };
}

function shadcnPick(hue: Hue, polarity: Polarity): Pick {
  const isBright = (brightHues as readonly Hue[]).includes(hue);
  return (isBright ? brightPicks : standardPicks)[polarity];
}

const polarities = ['light', 'dark'] as const;

// The families built on Tailwind's palette, where shadcn's steps apply.
const baseColors = Object.values(families).filter(
  (family) => family.palette.scales.blue === tailwindScales.blue,
);

function agreeingHues(polarity: Polarity): Hue[] {
  return hues.filter((hue) => compare('zinc', polarity, hue).isAgreeing);
}

function compare(familyId: string, polarity: Polarity, hue: Hue) {
  const family = baseColors.find(({ id }) => id === familyId);
  if (family === undefined) throw new Error(`no family ${familyId}`);
  const page = resolved(family, polarity).background;
  if (page === undefined) throw new Error(`${familyId} has no background`);
  const scale = tailwindScales[hue];
  const ours = pickIntentSteps(scale, polarity, page);
  if (typeof ours === 'string') throw new Error(`${hue}: ${ours}`);
  const shadcn = shadcnPick(hue, polarity);
  const fill = scale.steps[shadcn.fill];
  const isShadcnFailing =
    contrastRatio(fill, page) < contrastMinimum['non-text'] ||
    contrastRatio(fill, scale.steps[shadcn.foreground]) < contrastMinimum.text;
  const label = `${familyId} ${polarity} ${hue}: ours ${ours.fill}, shadcn ${shadcn.fill}`;
  return {
    isAgreeing: ours.fill === shadcn.fill,
    isShadcnFailing,
    label,
    ours: { fill: ours.fill, foreground: ours.foreground },
  };
}

function expectedPicks(polarity: Polarity) {
  return Object.fromEntries(
    hues.map((hue) => [hue, expectedPick(hue, polarity)]),
  );
}

function picksOf(familyId: string, polarity: Polarity) {
  return Object.fromEntries(
    hues.map((hue) => [hue, compare(familyId, polarity, hue).ours]),
  );
}

// Where we pick another fill, shadcn's must fail our rules: 3:1 against the
// page, or 4.5:1 for its own text on it.
function unexplainedDifferences(): string[] {
  return baseColors
    .flatMap(({ id }) =>
      polarities.flatMap((polarity) =>
        hues.map((hue) => compare(id, polarity, hue)),
      ),
    )
    .filter(
      ({ isAgreeing, isShadcnFailing }) => !isAgreeing && !isShadcnFailing,
    )
    .map(({ label }) => label);
}

const familyPolarities = baseColors.flatMap(({ id }) =>
  polarities.map((polarity) => [id, polarity] as const),
);

describe('primary steps of the base colors', () => {
  it('covers every Tailwind accent the base colors offer', () => {
    expect(baseColors.map(({ id }) => id).toSorted(byName)).toEqual([
      'mauve',
      'mist',
      'neutral',
      'olive',
      'stone',
      'taupe',
      'zinc',
    ]);
    for (const family of baseColors) {
      expect(family.intents.primary.choices).toEqual(
        expect.arrayContaining(hues),
      );
    }
  });

  it.each(familyPolarities)(
    'picks the expected %s %s steps',
    (id, polarity) => {
      expect(picksOf(id, polarity)).toEqual(expectedPicks(polarity));
    },
  );
});

describe("shadcn's accent themes", () => {
  // The one difference that rests on shadcn's text, not its fill.
  it("finds shadcn's dark lime text short of 4.5:1", () => {
    const { lime } = tailwindScales;
    expect(contrastRatio(lime.steps[500], lime.steps[900])).toBeLessThan(
      contrastMinimum.text,
    );
  });

  it('differs from a primary fill only where shadcn fails our contrast rules', () => {
    expect(unexplainedDifferences()).toEqual([]);
  });

  // shadcn's light 400 for yellow and lime fails 3:1 against white.
  it('matches the light fill for every hue but yellow and lime', () => {
    expect(agreeingHues('light')).toEqual(standardHues.toSorted(byName));
  });

  // shadcn's dark 800 fails 3:1 against the dark page for the rest.
  it('matches the dark fill for yellow and lime', () => {
    expect(agreeingHues('dark')).toEqual([...brightHues]);
  });
});
