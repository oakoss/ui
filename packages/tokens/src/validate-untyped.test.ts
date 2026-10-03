import { describe, expect, it } from 'vitest';

import type { Family } from '#/family';
import type { AuthoredScale, Scale } from '#/scale';

import { tailwindScales } from '#/families/tailwind-scales';
import { base, withScale } from '#/testing';
import { validateFamily } from '#/validate';

// Each case breaks a type on purpose, as untyped data (such as JSON) can.
const { red } = tailwindScales;

describe('validateFamily: untyped steps', () => {
  it('treats a step set to undefined as missing', () => {
    const steps = {
      ...red.steps,
      500: undefined,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    } as unknown as AuthoredScale['steps'];
    // Orange is a primary choice, and the primary ramp chart reads step 500.
    expect(validateFamily(withScale('orange', { ...red, steps }))).toEqual([
      `scale "orange" is missing steps 500`,
      `chart step 500 is missing from scale "orange"`,
    ]);
  });

  it('treats inherited steps as missing', () => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    const steps = Object.create(red.steps) as AuthoredScale['steps'];
    expect(validateFamily(withScale('teal', { ...red, steps }))).toContain(
      `scale "teal" is missing steps 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`,
    );
  });

  it('reports an anchor that is not a step', () => {
    const anchor = {
      dark: 'constructor',
      light: 700,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    } as unknown as AuthoredScale['anchor'];
    expect(validateFamily(withScale('teal', { ...red, anchor }))).toEqual([
      `scale "teal" dark anchor is missing step constructor`,
    ]);
  });

  it.each([
    [
      [300, 500, 600, 700, 'constructor'],
      'chart step constructor is missing from scale "neutral"',
    ],
    [[300], 'charts need 5 entries, not 1'],
  ])('reports untyped chart steps %j', (rampSteps, error) => {
    const charts = {
      kind: 'ramp',
      source: { hue: 'neutral' },
      steps: rampSteps,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    } as unknown as Family['charts'];
    expect(validateFamily({ ...base, charts })).toEqual([error]);
  });
});

describe('validateFamily: untyped intents, neutrals and scales', () => {
  it('reports a missing intent', () => {
    const { info: _missing, ...rest } = base.intents;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    const intents = rest as Family['intents'];
    expect(validateFamily({ ...base, intents })).toEqual([
      `intent "info" is missing`,
    ]);
  });

  it('reports an intent set to undefined', () => {
    const intents = {
      ...base.intents,
      primary: undefined,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    } as unknown as Family['intents'];
    expect(validateFamily({ ...base, intents })).toEqual([
      `intent "primary" is missing`,
      `chart intent "primary" doesn't exist`,
    ]);
  });

  it('reports a reference to a neutral set to undefined', () => {
    const neutrals = { ...base.palette.neutrals, white: undefined };
    const palette = {
      ...base.palette,
      neutrals,
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    } as unknown as Family['palette'];
    expect(validateFamily({ ...base, palette })).toContain(
      `flavor "light" role "background": unknown neutral "white"`,
    );
  });

  it('skips a scale set to undefined', () => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- deliberately untyped
    const scale = undefined as unknown as Scale<string, string>;
    expect(validateFamily(withScale('ghost', scale))).toEqual([]);
  });
});
