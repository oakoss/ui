import type { ColorRef, Family, Palette } from '#/family';

import { type Color, isUnitInterval, isValidColor } from '#/color';
import { parseColorPath } from '#/color-path';
import { resolveFlavor } from '#/resolve';
import {
  allRoles,
  chartRoles,
  type Intent,
  intents,
  neutralRoles,
} from '#/roles';
import { hasStep, isStep, type Scale } from '#/scale';
import { scaleErrors } from '#/validate-scale';

type AnyScale = Scale<string, string>;

type ScaleError = [scale: string, error: string];

// Intents are included, since each intent is also its fill role.
const reservedNames = new Set<string>(allRoles);

export function validateFamily(family: Family): string[] {
  return [
    ...nameErrors(family),
    ...defaultsErrors(family),
    ...paletteErrors(family.palette),
    ...referenceErrors(family, family.palette).map(([, error]) => error),
    ...Object.keys(family.flavors).flatMap((id) => flavorErrors(family, id)),
    ...intentErrors(family),
    ...chartErrors(family),
  ];
}

function chartErrors(family: Family): string[] {
  const { charts } = family;
  // The tuple type fixes the count; untyped data doesn't.
  const count: number =
    charts.kind === 'ramp' ? charts.steps.length : charts.hues.length;
  if (count !== chartRoles.length) {
    return [`charts need ${chartRoles.length} entries, not ${count}`];
  }
  if (charts.kind === 'ramp' && charts.source.intent !== undefined) {
    return declaredIntent(family, charts.source.intent) === undefined
      ? [`chart intent "${charts.source.intent}" doesn't exist`]
      : [];
  }
  const hues =
    charts.kind === 'categorical'
      ? charts.hues
      : charts.source.hue === undefined
        ? []
        : [charts.source.hue];
  return hues
    .filter((hue) => !hasScale(family.palette, hue))
    .map((hue) => `chart hue "${hue}" has no scale`);
}

// Untyped data can leave an intent out, set it to `undefined` or name an
// inherited key.
function declaredIntent(
  family: Family,
  intent: string,
): Family['intents'][Intent] | undefined {
  const declared: Partial<Record<string, Family['intents'][Intent]>> =
    family.intents;
  return Object.hasOwn(declared, intent) ? declared[intent] : undefined;
}

function defaultsErrors(family: Family): string[] {
  const errors: string[] = [];
  for (const polarity of ['dark', 'light'] as const) {
    const id = family.defaults[polarity];
    if (id === undefined) continue;
    const flavor = family.flavors[id];
    if (flavor === undefined) {
      errors.push(`default ${polarity} flavor "${id}" doesn't exist`);
    } else if (flavor.polarity !== polarity) {
      errors.push(`default ${polarity} flavor "${id}" is ${flavor.polarity}`);
    }
  }
  return errors;
}

// `validateFamily` reports base palette problems once. A flavor reports the
// problems in its own palette changes, plus reference problems in its resolved
// palette, skipping those an unchanged base scale already reports.
function flavorErrors(family: Family, flavorId: string): string[] {
  const resolved = resolveFlavor(family, flavorId);
  if (typeof resolved === 'string') return [resolved];

  const own = family.flavors[flavorId]?.palette;
  const delta = { neutrals: own?.neutrals ?? {}, scales: own?.scales ?? {} };
  const base = new Set(
    referenceErrors(family, family.palette).map(([, error]) => error),
  );
  const references = referenceErrors(family, resolved.palette)
    .filter(
      ([scale, error]) =>
        resolved.palette.scales[scale] !== family.palette.scales[scale] ||
        !base.has(error),
    )
    .map(([, error]) => error);
  const errors = [...paletteErrors(delta), ...references].map(
    (error) => `flavor "${flavorId}": ${error}`,
  );
  for (const role of neutralRoles) {
    const ref = resolved.roles[role];
    if (ref === undefined) {
      errors.push(`flavor "${flavorId}" doesn't map role "${role}"`);
      continue;
    }
    const error = refError(ref, resolved.palette);
    if (error !== undefined) {
      errors.push(`flavor "${flavorId}" role "${role}": ${error}`);
    }
  }
  return errors;
}

function foregroundErrorOf(
  scale: AnyScale,
  palette: Palette<string, string>,
): string | undefined {
  const { foreground } = scale;
  if (foreground === undefined) return undefined;
  if ('ref' in foreground) return refError(foreground, palette);
  return isValidColor(foreground) ? undefined : 'invalid color';
}

// Untyped data can set a scale to `undefined`.
function hasScale(palette: Palette<string, string>, name: string): boolean {
  const scales: Partial<Record<string, AnyScale>> = palette.scales;
  return Object.hasOwn(scales, name) && scales[name] !== undefined;
}

function intentErrors(family: Family): string[] {
  const errors: string[] = [];
  for (const intent of intents) {
    const choice = declaredIntent(family, intent);
    if (choice === undefined) {
      errors.push(`intent "${intent}" is missing`);
      continue;
    }
    const { choices, default: fallback } = choice;
    if (!choices.includes(fallback)) {
      errors.push(
        `intent "${intent}" default "${fallback}" isn't one of its choices`,
      );
    }
    for (const hue of choices) {
      if (!hasScale(family.palette, hue)) {
        errors.push(`intent "${intent}" choice "${hue}" has no scale`);
      }
    }
  }
  return errors;
}

// Names become CSS variable segments and reference path segments.
function nameErrors(family: Family): string[] {
  const names = [
    ...Object.keys(family.palette.scales),
    ...Object.keys(family.palette.neutrals),
  ];
  return names.flatMap((name) => {
    if (name.includes('.')) return [`name "${name}" contains a "."`];
    return reservedNames.has(name)
      ? [`name "${name}" is reserved for a role or intent`]
      : [];
  });
}

function paletteErrors(palette: {
  neutrals: Partial<Record<string, Color>>;
  scales: Partial<Record<string, AnyScale>>;
}): string[] {
  const errors = Object.entries(palette.scales).flatMap(([name, scale]) =>
    scale === undefined ? [] : scaleErrors(name, scale),
  );
  for (const [name, color] of Object.entries(palette.neutrals)) {
    if (color !== undefined && !isValidColor(color)) {
      errors.push(`neutral "${name}" is an invalid color`);
    }
  }
  return errors;
}

// Steps a ramp chart reads must exist in every scale it can come from.
function rampErrors(
  family: Family,
  palette: Palette<string, string>,
): ScaleError[] {
  const { charts } = family;
  if (charts.kind !== 'ramp') return [];
  const { source } = charts;
  const hues =
    source.intent === undefined
      ? [source.hue]
      : (declaredIntent(family, source.intent)?.choices ?? []);
  return hues.flatMap((hue) => {
    const scale = Object.hasOwn(palette.scales, hue)
      ? palette.scales[hue]
      : undefined;
    if (scale?.kind !== 'authored') return [];
    return charts.steps
      .filter((step) => !hasStep(scale.steps, step))
      .map((step): ScaleError => [
        hue,
        `chart step ${step} is missing from scale "${hue}"`,
      ]);
  });
}

// References can break when a flavor replaces the scale they point at, so
// they're checked against each resolved palette.
function referenceErrors(
  family: Family,
  palette: Palette<string, string>,
): ScaleError[] {
  const errors: ScaleError[] = [];
  // Untyped data can set a scale to `undefined`.
  const scales: Partial<Record<string, AnyScale>> = palette.scales;
  for (const [name, scale] of Object.entries(scales)) {
    if (scale === undefined) continue;
    const error = foregroundErrorOf(scale, palette);
    if (error !== undefined) {
      errors.push([name, `scale "${name}" foreground: ${error}`]);
    }
  }
  return [...errors, ...rampErrors(family, palette)];
}

function refError(
  ref: ColorRef<string, string>,
  palette: Palette<string, string>,
): string | undefined {
  if (ref.alpha !== undefined && !isUnitInterval(ref.alpha)) {
    return `alpha ${ref.alpha} is outside 0–1`;
  }
  const parsed = parseColorPath(ref.ref);
  if (parsed === undefined) return `"${ref.ref}" is not a color path`;
  const { name, step } = parsed;
  if (step === undefined) {
    const neutrals: Partial<Record<string, Color>> = palette.neutrals;
    return Object.hasOwn(neutrals, name) && neutrals[name] !== undefined
      ? undefined
      : `unknown neutral "${name}"`;
  }
  if (!Object.hasOwn(palette.scales, name)) return `unknown scale "${name}"`;
  const scale = palette.scales[name];
  if (scale === undefined) return `unknown scale "${name}"`;
  const value = Number(step);
  if (String(value) !== step || !isStep(value)) return `unknown step "${step}"`;
  if (scale.kind === 'authored' && !hasStep(scale.steps, value)) {
    return `scale "${name}" has no step ${step}`;
  }
  return undefined;
}
