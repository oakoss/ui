import { describe, expect, it } from 'vitest';

import { type Color, oklch } from '#/color';
import { contrastRatio } from '#/contrast';
import { tailwindScales } from '#/families/tailwind-scales';
import { pickIntentSteps } from '#/role-steps';
import {
  authored,
  type AuthoredScale,
  type CoreStep,
  type Step,
  steps,
} from '#/scale';

const white = oklch(100, 0, null);
const darkPage = tailwindScales.zinc.steps[950];
const ramp = (step: CoreStep) => oklch(98 - step / 10, 0, null);

function grayScale(lightnessOf: (step: CoreStep) => Color, anchor: Step = 500) {
  const entries = steps.map((step) => [step, lightnessOf(step)] as const);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- fromEntries loses the step keys
  const scaleSteps = Object.fromEntries(entries) as AuthoredScale['steps'];
  return authored({ dark: anchor, light: anchor }, scaleSteps);
}

function tieScale(tied: number, anchor: number) {
  const lightness: Partial<Record<CoreStep, number>> = {
    400: tied,
    500: anchor,
    600: tied,
  };
  return grayScale((step) =>
    lightness[step] === undefined
      ? ramp(step)
      : oklch(lightness[step], 0, null),
  );
}

describe('contrastRatio', () => {
  it('measures WCAG contrast', () => {
    expect(contrastRatio(white, oklch(0, 0, null))).toBe(21);
  });

  it.each([
    [oklch(100, 0, null, 0.1), white],
    [white, oklch(100, 0, null, 0.1)],
  ])('refuses translucent colors', (a, b) => {
    expect(() => contrastRatio(a, b)).toThrow('contrast needs opaque colors');
  });

  it('refuses invalid colors', () => {
    expect(() => contrastRatio(oklch(Number('NaN'), 0, null), white)).toThrow(
      'contrast of an invalid color',
    );
  });
});

describe('pickIntentSteps', () => {
  it.each([
    ['zinc', 'light', white, [900, 50, 950, 50, 200, 600]],
    ['zinc', 'dark', darkPage, [200, 950, 100, 950, 800, 400]],
    ['blue', 'light', white, [700, 50, 800, 50, 200, 600]],
    ['blue', 'dark', darkPage, [600, 50, 700, 950, 800, 400]],
    ['amber', 'light', white, [700, 50, 800, 50, 200, 700]],
    ['amber', 'dark', darkPage, [700, 50, 800, 950, 800, 400]],
    // red-600 passes on the page but not on the subtle 50 step.
    ['red', 'light', white, [700, 50, 800, 50, 200, 700]],
  ] as const)('picks %s steps in %s mode', (hue, polarity, page, expected) => {
    const [fill, foreground, hover, subtle, border, text] = expected;
    expect(pickIntentSteps(tailwindScales[hue], polarity, page)).toEqual({
      border,
      fill,
      foreground,
      hover,
      subtle,
      text,
    });
  });

  it('falls back to the other neighbor for hover at the end of the scale', () => {
    expect(pickIntentSteps(grayScale(ramp, 950), 'light', white)).toMatchObject(
      { fill: 950, hover: 900 },
    );
  });
});

describe('pickIntentSteps: errors', () => {
  it.each([
    ['a fill', grayScale(() => oklch(60, 0, null)), white],
    ['text', tailwindScales.blue, white],
  ] as const)(
    'reports a scale with no step that passes as %s',
    (kind, scale, page) => {
      expect(pickIntentSteps(scale, 'dark', page)).toBe(
        `no step passes as ${kind}`,
      );
    },
  );

  it.each([
    [
      'the page',
      tailwindScales.blue,
      oklch(100, 0, null, 0.5),
      'the page color is translucent',
    ],
    [
      'a step',
      {
        ...tailwindScales.blue,
        steps: { ...tailwindScales.blue.steps, 300: oklch(80, 0.1, 250, 0.5) },
      },
      white,
      'step 300 is translucent',
    ],
  ] as const)('reports %s that is translucent', (_, scale, page, error) => {
    expect(pickIntentSteps(scale, 'light', page)).toBe(error);
  });

  it('reports a start step the scale lacks', () => {
    const anchor = { dark: 800, light: 25 } as const;
    expect(
      pickIntentSteps({ ...tailwindScales.blue, anchor }, 'light', white),
    ).toBe('scale has no step 25');
  });
});

describe('pickIntentSteps: ties', () => {
  // 400 and 600 both pass and sit one step from the anchor, 500, which fails.
  it.each([
    ['light', white, 25, 95, 600],
    ['dark', oklch(10, 0, null), 70, 12, 400],
  ] as const)(
    'breaks a %s-mode tie toward more page contrast',
    (polarity, page, tied, anchor, fill) => {
      const tie = tieScale(tied, anchor);
      expect(pickIntentSteps(tie, polarity, page)).toMatchObject({ fill });
    },
  );
});
