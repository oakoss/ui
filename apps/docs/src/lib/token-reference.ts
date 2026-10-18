import {
  axes,
  chartRoleMeta,
  derivedRoleMeta,
  families,
  fieldColor,
  formatColor,
  type Intent,
  intentRoleKinds,
  intentRoleMeta,
  intents,
  neutralRoleMeta,
  neutralRoles,
  resolveTheme,
  steps,
  styles,
  type Theme,
  type TokenSource,
} from '@oakoss/tokens';

import type {
  TokenEntry,
  TokenGroup,
  TokenReference,
  TokenRow,
} from './token-reference-types.ts';

type Meta = { description: string; usage?: string };

const style = styles[axes.style.default];

export const tokenGroups: TokenGroup[] = [
  {
    id: 'neutral',
    rows: [
      ...neutralRoles.map((name) => row(name, neutralRoleMeta[name])),
      {
        description: 'Background of form controls, set by the style.',
        name: 'field',
      },
    ],
    title: 'Neutral roles',
  },
  ...intents.map((intent) => ({
    id: intent,
    rows: intentRows(intent),
    title: `${intent.charAt(0).toUpperCase()}${intent.slice(1)}`,
  })),
  { id: 'derived', rows: rows(derivedRoleMeta), title: 'Derived roles' },
  { id: 'charts', rows: rows(chartRoleMeta), title: 'Charts' },
];

class Strings {
  readonly values: string[] = [];
  readonly #indexes = new Map<string, number>();

  index(value: string): number {
    const known = this.#indexes.get(value);
    if (known !== undefined) return known;
    this.values.push(value);
    this.#indexes.set(value, this.values.length - 1);
    return this.values.length - 1;
  }
}

const cache: { reference?: TokenReference } = {};

// Resolving every theme takes a while, and each page asks once per table.
export function tokenReference(): TokenReference {
  cache.reference ??= buildReference();
  return cache.reference;
}

function alphaLabel(name: string, alpha: number | undefined): string {
  return alpha === undefined
    ? name
    : `${name} / ${Number((alpha * 100).toFixed(2))}%`;
}

function buildReference(): TokenReference {
  const colors = new Strings();
  const sources = new Strings();
  const primaryRows =
    tokenGroups.find(({ id }) => id === 'primary')?.rows ?? [];
  const entries = (theme: Theme, rows: TokenRow[]) => {
    const byName = new Map(
      themeRows(theme).map(([name, source, value]) => [
        name,
        { source, value },
      ]),
    );
    return rows.map(({ name }): TokenEntry => {
      const row = byName.get(name);
      if (row === undefined) throw new Error(`no token ${name}`);
      return [sources.index(row.source), colors.index(row.value)];
    });
  };
  const themes: TokenReference['themes'] = {};
  const primaryThemes: TokenReference['primaryThemes'] = {};
  for (const family of Object.values(families)) {
    for (const flavor of Object.keys(family.flavors)) {
      const theme = resolved(family, flavor);
      themes[`${family.id}/${flavor}`] = Object.fromEntries(
        tokenGroups.map(({ id, rows }) => [id, entries(theme, rows)]),
      );
      for (const primary of family.intents.primary.choices) {
        primaryThemes[`${family.id}/${flavor}/${primary}`] = entries(
          resolved(family, flavor, primary),
          primaryRows,
        );
      }
    }
  }
  return {
    colors: colors.values,
    defaultFamily: axes.family.default,
    families: familyChoices(),
    groups: tokenGroups,
    primaryThemes,
    sources: sources.values,
    themes,
  };
}

function familyChoices(): TokenReference['families'] {
  return Object.values(families).map((family) => ({
    defaultFlavor: family.defaults.light ?? family.defaults.dark,
    // Light first, so the switcher reads Light, Dark.
    flavors: Object.entries(family.flavors)
      .map(([id, { name }]) => ({ id, name }))
      .toSorted(
        (a, b) =>
          Number(b.id === family.defaults.light) -
          Number(a.id === family.defaults.light),
      ),
    id: family.id,
    name: family.name,
    primaries: [...family.intents.primary.choices],
    primary: family.intents.primary.default,
  }));
}

function intentRows(intent: Intent): TokenRow[] {
  return [
    ...intentRoleKinds.map((kind) =>
      row(kind === 'fill' ? intent : `${intent}-${kind}`, intentRoleMeta[kind]),
    ),
    ...steps.map((step) => ({
      description: `Step ${step} of the ${intent} scale.`,
      name: `${intent}-${step}`,
    })),
  ];
}

function resolved(
  family: (typeof families)[keyof typeof families],
  flavor: string,
  primary?: string,
): Theme {
  const result = resolveTheme(family, flavor, primary);
  if (Array.isArray(result)) {
    throw new TypeError(`${family.id} ${flavor}:\n${result.join('\n')}`);
  }
  return result;
}

// The reference shows a token's description and usage as one sentence pair.
function row(name: string, meta: Meta): TokenRow {
  const { description, usage } = meta;
  return {
    description: usage === undefined ? description : `${description} ${usage}`,
    name,
  };
}

function rows(meta: Record<string, Meta>): TokenRow[] {
  return Object.entries(meta).map(([name, entry]) => row(name, entry));
}

/**
A token's source as the reference shows it: a palette color as Tailwind
names it (`zinc-950`, `white / 10%`), or the variable a derived role
follows (`--primary-text`).
*/
function sourceLabel(source: TokenSource): string {
  if ('role' in source) return `--${source.role}`;
  return alphaLabel(
    source.ref.replace(/^color\./u, '').replace('.', '-'),
    source.alpha,
  );
}

// Each token's name, source and CSS value, with the style's field color.
function themeRows(theme: Theme): [string, string, string][] {
  const tokens = Object.entries(theme.tokens).map(
    ([name, color]): [string, string, string] => {
      const source = theme.sources[name];
      if (source === undefined) throw new Error(`no source for ${name}`);
      return [name, sourceLabel(source), formatColor(color)];
    },
  );
  const field = style.colors.field[theme.polarity];
  const fieldSource =
    field === 'transparent'
      ? 'transparent'
      : alphaLabel(`--${field.role}`, field.alpha);
  return [
    ...tokens,
    ['field', fieldSource, fieldColor(style, theme.polarity, theme.tokens)],
  ];
}
