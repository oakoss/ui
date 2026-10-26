import type { ColorRef, Family, Palette } from '#/family';

import { type Color, isUnitInterval, isValidColor } from '#/color';
import { parseColorPath } from '#/color-path';
import { resolveFlavor } from '#/resolve';
import { allRoles, intents, neutralRoles } from '#/roles';
import { hasScaleStep, isStep, type Scale } from '#/scale';
import {
  chartErrors,
  chartStepErrors,
  type ScaleError,
} from '#/validate-charts';
import { declaredIntent, hasScale } from '#/validate-lookup';
import { scaleErrors } from '#/validate-scale';

type AnyScale = Scale<string, string>;

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
  const replaced = replacedScales(family, flavorId);
  const references = referenceErrors(family, resolved.palette)
    .filter(([scale, error]) => replaced.has(scale) || !base.has(error))
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
  const errors = names.flatMap((name) => {
    if (name.includes('.')) return `name "${name}" contains a "."`;
    return reservedNames.has(name)
      ? `name "${name}" is reserved for a role or intent`
      : [];
  });
  // The credit goes into a CSS comment.
  return family.credit?.includes('*/') === true
    ? [...errors, 'credit contains "*/"']
    : errors;
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
  return [...errors, ...chartStepErrors(family, palette)];
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
  if (!hasScaleStep(scale, value)) {
    return `scale "${name}" has no step ${step}`;
  }
  return undefined;
}

// The scales a flavor or one it extends supplies; `resolveFlavor` has already
// rejected a cycle.
function replacedScales(family: Family, flavorId: string): Set<string> {
  const names = new Set<string>();
  let id: string | undefined = flavorId;
  while (id !== undefined) {
    const flavor: Family['flavors'][string] | undefined = family.flavors[id];
    const scales = Object.entries(flavor?.palette?.scales ?? {});
    for (const [name, scale] of scales) {
      if (scale !== undefined) names.add(name);
    }
    id = flavor?.extends;
  }
  return names;
}
