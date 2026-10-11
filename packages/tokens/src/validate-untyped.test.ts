import { describe, expect, it } from 'vitest';

import type { Family } from '#/family';
import type { AuthoredScale, Scale } from '#/scale';

import { tailwindScales } from '#/families/tailwind-scales';
import { base, untyped, withScale } from '#/testing';
import { validateFamily } from '#/validate';

// Each case breaks a type on purpose, as untyped data (such as JSON) can.
const { red } = tailwindScales;

describe('validateFamily: untyped steps', () => {
  it('treats a step set to undefined as missing', () => {
    const steps = untyped<AuthoredScale['steps']>({
      ...red.steps,
      500: undefined,
    });
    // Orange is a primary choice, and the primary ramp chart reads step 500.
    expect(validateFamily(withScale('orange', { ...red, steps }))).toEqual([
      `scale "orange" is missing steps 500`,
      `chart step 500 is missing from scale "orange"`,
    ]);
  });

  it('treats inherited steps as missing', () => {
    const steps = untyped<AuthoredScale['steps']>(Object.create(red.steps));
    expect(validateFamily(withScale('teal', { ...red, steps }))).toContain(
      `scale "teal" is missing steps 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`,
    );
  });

  it('reports an anchor that is not a step', () => {
    const anchor = untyped<AuthoredScale['anchor']>({
      dark: 'constructor',
      light: 700,
    });
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
    const charts = untyped<Family['charts']>({
      kind: 'ramp',
      source: { hue: 'neutral' },
      steps: rampSteps,
    });
    expect(validateFamily({ ...base, charts })).toEqual([error]);
  });
});

describe('validateFamily: untyped intents, neutrals and scales', () => {
  it('reports a missing intent', () => {
    const { info: _missing, ...rest } = base.intents;
    const intents = untyped<Family['intents']>(rest);
    expect(validateFamily({ ...base, intents })).toEqual([
      `intent "info" is missing`,
    ]);
  });

  it('reports an intent set to undefined', () => {
    const intents = untyped<Family['intents']>({
      ...base.intents,
      primary: undefined,
    });
    expect(validateFamily({ ...base, intents })).toEqual([
      `intent "primary" is missing`,
      `chart intent "primary" doesn't exist`,
    ]);
  });

  it('reports a reference to a neutral set to undefined', () => {
    const neutrals = { ...base.palette.neutrals, white: undefined };
    const palette = untyped<Family['palette']>({ ...base.palette, neutrals });
    expect(validateFamily({ ...base, palette })).toContain(
      `flavor "light" role "background": unknown neutral "white"`,
    );
  });

  it('skips a scale set to undefined', () => {
    const scale = untyped<Scale<string, string>>(undefined);
    expect(validateFamily(withScale('ghost', scale))).toEqual([]);
  });
});
