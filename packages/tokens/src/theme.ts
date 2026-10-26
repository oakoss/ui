import type { Color } from '#/color';
import type { ColorRef, Family, Polarity } from '#/family';

import { parseColorPath } from '#/color-path';
import { isOpaque } from '#/contrast';
import { type ResolvedFlavor, resolveFlavor } from '#/resolve';
import { pickIntentSteps } from '#/role-steps';
import {
  chartRoles,
  derivedRoles,
  type Intent,
  intentRole,
  type IntentRole,
  intentRoleKinds,
  intents,
  neutralRoles,
} from '#/roles';
import { type AuthoredScale, isStep, orderedSteps, type Step } from '#/scale';
import { validateFamily } from '#/validate';

export type Theme = {
  polarity: Polarity;
  sources: ThemeSources;
  tokens: ThemeTokens;
};

/**
What each token resolves from, keyed like `ThemeTokens`.
*/
export type ThemeSources = Readonly<Record<string, TokenSource>>;

/**
Every color token of one flavor, keyed by CSS variable name without `--`:
the roles, plus each intent's scale (`primary-50` … `primary-950`).
*/
export type ThemeTokens = Readonly<Record<string, Readonly<Color>>>;

/**
A palette color, at an alpha when the reference sets one, or the token a
derived role follows.
*/
export type TokenSource = DerivedSource | Readonly<ColorRef<string, string>>;

type AnyPalette = ResolvedFlavor['palette'];

type AnyScale = AuthoredScale<string, string>;

type Built = {
  sources: Record<string, TokenSource>;
  tokens: Record<string, Color>;
};

type ChartStep = { hue: string; scale: AnyScale; step: Step };

type DerivedSource = { readonly role: IntentRole };

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

  const built = neutralTokens(resolved);
  const { sources, tokens } = built;
  const page = tokens.background;
  if (page === undefined) return [at('has no background')];
  if (!isOpaque(page)) return [at('role "background" is translucent')];

  const errors = intents.flatMap((intent) => {
    const intentErrors = addIntent(built, intent, hueOf(intent), {
      page,
      palette: resolved.palette,
      polarity: resolved.polarity,
    });
    return intentErrors.map((error) => at(error));
  });
  if (errors.length > 0) return errors;

  for (const [role, target] of Object.entries(derivedRoles)) {
    tokens[role] = tokenOf(tokens, target);
    sources[role] = { role: target };
  }
  const charts = chartSteps(family, resolved.palette, resolved.polarity, hueOf);
  if (typeof charts === 'string') return [at(charts)];
  for (const [index, role] of chartRoles.entries()) {
    const chart = charts[index];
    if (chart !== undefined) addStep(built, role, chart, chart.step);
  }
  return { polarity: resolved.polarity, sources, tokens };
}

function addIntent(
  built: Built,
  intent: Intent,
  hue: string,
  context: { page: Color; palette: AnyPalette; polarity: Polarity },
): string[] {
  const scale = scaleOf(context.palette, hue);
  if (scale === undefined) return [`${intent} (${hue}): no scale`];
  if (scale.foreground !== undefined) {
    return [
      `${intent} (${hue}): hand-written foregrounds aren't generated yet`,
    ];
  }
  const steps = pickIntentSteps(scale, context.polarity, context.page);
  if (typeof steps === 'string') return [`${intent} (${hue}): ${steps}`];
  const source = { hue, scale };
  for (const step of orderedSteps) {
    if (scale.steps[step] !== undefined) {
      addStep(built, `${intent}-${step}`, source, step);
    }
  }
  for (const kind of intentRoleKinds) {
    addStep(built, intentRole(intent, kind), source, steps[kind]);
  }
  return [];
}

function addStep(
  { sources, tokens }: Built,
  name: string,
  { hue, scale }: { hue: string; scale: AnyScale },
  step: Step,
) {
  tokens[name] = copied(stepColor(scale, step));
  sources[name] = { ref: `color.${hue}.${step}` };
}

function chartSteps(
  family: Family,
  palette: AnyPalette,
  polarity: Polarity,
  hueOf: (intent: Intent) => string,
): ChartStep[] | string {
  const { charts } = family;
  const series =
    charts.kind === 'categorical'
      ? charts.series.map(({ hue, steps }) => ({ hue, step: steps[polarity] }))
      : charts.steps.map((step) => ({
          hue:
            charts.source.intent === undefined
              ? charts.source.hue
              : hueOf(charts.source.intent),
          step,
        }));
  const resolvedSteps: ChartStep[] = [];
  for (const { hue, step } of series) {
    const scale = scaleOf(palette, hue);
    if (scale === undefined) return `chart hue "${hue}" has no scale`;
    resolvedSteps.push({ hue, scale, step });
  }
  return resolvedSteps;
}

// A returned theme owns its colors, so writing to one can't reach the family.
function copied(color: Color): Color {
  return { ...color, components: [...color.components] };
}

function neutralTokens(resolved: ResolvedFlavor): Built {
  const built: Built = { sources: {}, tokens: {} };
  for (const role of neutralRoles) {
    const ref = resolved.roles[role];
    if (ref === undefined) continue;
    built.tokens[role] = copied(resolveRef(ref, resolved.palette));
    built.sources[role] = { ...ref };
  }
  return built;
}

// `validateFamily` has checked the path against the expanded scale.
function resolveRef(ref: ColorRef<string, string>, palette: AnyPalette): Color {
  const parsed = parseColorPath(ref.ref);
  if (parsed === undefined) throw new Error(`invalid reference ${ref.ref}`);
  const step = parsed.step === undefined ? undefined : Number(parsed.step);
  let color: Color | undefined;
  if (step === undefined) color = palette.neutrals[parsed.name];
  else if (isStep(step)) color = scaleOf(palette, parsed.name)?.steps[step];
  if (color === undefined) throw new Error(`unresolved reference ${ref.ref}`);
  if (ref.alpha === undefined) return color;
  return { ...color, alpha: (color.alpha ?? 1) * ref.alpha };
}

function scaleOf(palette: AnyPalette, hue: string): AnyScale | undefined {
  return Object.hasOwn(palette.scales, hue) ? palette.scales[hue] : undefined;
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
