import type { Color } from '#/color';
import type { ColorRef, Family, Palette, Polarity } from '#/family';

import { parseColorPath } from '#/color-path';
import { isOpaque } from '#/contrast';
import { type ResolvedFlavor, resolveFlavor } from '#/resolve';
import { pickIntentSteps } from '#/role-steps';
import {
  chartRoles,
  derivedRoles,
  type Intent,
  intentRole,
  intentRoleKinds,
  intents,
  neutralRoles,
} from '#/roles';
import { type AuthoredScale, isStep, orderedSteps, type Step } from '#/scale';
import { validateFamily } from '#/validate';

export type Theme = { polarity: Polarity; tokens: ThemeTokens };

/**
Every color token of one flavor, keyed by CSS variable name without `--`:
the roles, plus each intent's scale (`primary-50` … `primary-950`).
*/
export type ThemeTokens = Readonly<Record<string, Color>>;

type AnyPalette = Palette<string, string>;

type AnyScale = AuthoredScale<string, string>;

/**
Resolves a flavor, with `primary` overriding the family's default primary
hue. Returns the problems instead: `validateFamily`'s errors for the whole
family, or errors that name the flavor.
*/
export function resolveTheme(
  family: Family,
  flavorId: string,
  primary?: string,
): string[] | Theme {
  const familyErrors = validateFamily(family);
  if (familyErrors.length > 0) return familyErrors;
  const resolved = resolveFlavor(family, flavorId);
  if (typeof resolved === 'string') return [resolved];
  const at = (error: string) => `flavor "${flavorId}": ${error}`;
  const choices: readonly string[] = family.intents.primary.choices;
  if (primary !== undefined && !choices.includes(primary)) {
    return [at(`primary "${primary}" isn't one of its choices`)];
  }
  const hueOf = (intent: Intent) =>
    intent === 'primary' && primary !== undefined
      ? primary
      : family.intents[intent].default;

  const tokens = neutralTokens(resolved);
  if (Array.isArray(tokens)) return tokens.map((error) => at(error));
  const page = tokens.background;
  if (page === undefined) return [at('has no background')];
  if (!isOpaque(page)) return [at('role "background" is translucent')];

  const errors = intents.flatMap((intent) => {
    const intentErrors = addIntent(tokens, intent, hueOf(intent), {
      page,
      palette: resolved.palette,
      polarity: resolved.polarity,
    });
    return intentErrors.map((error) => at(error));
  });
  if (errors.length > 0) return errors;

  for (const [role, target] of Object.entries(derivedRoles)) {
    tokens[role] = tokenOf(tokens, target);
  }
  const charts = chartColors(family, resolved.palette, hueOf);
  if (typeof charts === 'string') return [at(charts)];
  for (const [index, role] of chartRoles.entries()) {
    const color = charts[index];
    if (color !== undefined) tokens[role] = color;
  }
  return { polarity: resolved.polarity, tokens };
}

function addIntent(
  tokens: Record<string, Color>,
  intent: Intent,
  hue: string,
  context: { page: Color; palette: AnyPalette; polarity: Polarity },
): string[] {
  const scale = authoredScale(context.palette, hue);
  if (scale === undefined) {
    return [`${intent} (${hue}): no authored scale`];
  }
  if (scale.foreground !== undefined) {
    return [
      `${intent} (${hue}): hand-written foregrounds aren't generated yet`,
    ];
  }
  const steps = pickIntentSteps(scale, context.polarity, context.page);
  if (typeof steps === 'string') return [`${intent} (${hue}): ${steps}`];
  for (const step of orderedSteps) {
    const color = scale.steps[step];
    if (color !== undefined) tokens[`${intent}-${step}`] = color;
  }
  for (const kind of intentRoleKinds) {
    tokens[intentRole(intent, kind)] = stepColor(scale, steps[kind]);
  }
  return [];
}

function authoredScale(palette: AnyPalette, hue: string): AnyScale | undefined {
  const scale = Object.hasOwn(palette.scales, hue)
    ? palette.scales[hue]
    : undefined;
  return scale?.kind === 'authored' ? scale : undefined;
}

// A ramp reads fixed steps of one scale.
function chartColors(
  family: Family,
  palette: AnyPalette,
  hueOf: (intent: Intent) => string,
): Color[] | string {
  const { charts } = family;
  if (charts.kind === 'categorical') {
    return 'categorical charts are not generated yet';
  }
  const hue =
    charts.source.intent === undefined
      ? charts.source.hue
      : hueOf(charts.source.intent);
  const scale = authoredScale(palette, hue);
  if (scale === undefined) return `chart hue "${hue}" has no authored scale`;
  return charts.steps.map((step) => stepColor(scale, step));
}

function neutralTokens(
  resolved: ResolvedFlavor,
): Record<string, Color> | string[] {
  const tokens: Record<string, Color> = {};
  const errors: string[] = [];
  for (const role of neutralRoles) {
    const ref = resolved.roles[role];
    const color =
      ref === undefined ? undefined : resolveRef(ref, resolved.palette);
    if (typeof color === 'string') errors.push(`role "${role}": ${color}`);
    else if (color !== undefined) tokens[role] = color;
  }
  return errors.length > 0 ? errors : tokens;
}

// `validateFamily` has checked the path; it accepts any step of a seeded scale.
function resolveRef(
  ref: ColorRef<string, string>,
  palette: AnyPalette,
): Color | string {
  const parsed = parseColorPath(ref.ref);
  if (parsed === undefined) throw new Error(`invalid reference ${ref.ref}`);
  const step = parsed.step === undefined ? undefined : Number(parsed.step);
  let color: Color | undefined;
  if (step === undefined) color = palette.neutrals[parsed.name];
  else if (palette.scales[parsed.name]?.kind === 'seeded') {
    return `scale "${parsed.name}" is seeded, which isn't generated yet`;
  } else if (isStep(step)) {
    color = authoredScale(palette, parsed.name)?.steps[step];
  }
  if (color === undefined) throw new Error(`unresolved reference ${ref.ref}`);
  if (ref.alpha === undefined) return color;
  return { ...color, alpha: (color.alpha ?? 1) * ref.alpha };
}

function stepColor(scale: AnyScale, step: Step): Color {
  const color = scale.steps[step];
  if (color === undefined) throw new Error(`scale has no step ${step}`);
  return color;
}

function tokenOf(tokens: Record<string, Color>, name: string): Color {
  const color = tokens[name];
  if (color === undefined) throw new Error(`no token ${name}`);
  return color;
}
