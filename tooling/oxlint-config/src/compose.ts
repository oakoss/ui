import type { OxlintConfig } from 'oxlint';

type Settings = NonNullable<OxlintConfig['settings']>;

// Merges pieces into one flat config instead of using `extends`, which
// eslint-plugin-oxlint only partly resolves when deduplicating ESLint rules.
// Maps merge with later pieces winning; lists are unioned. Keys no piece sets
// stay unset so oxlint keeps its own defaults.
export function compose(...configs: readonly OxlintConfig[]): OxlintConfig {
  const merged: OxlintConfig = {
    ...Object.assign({}, ...configs),
    categories: Object.assign(
      {},
      ...configs.map((config) => config.categories),
    ),
    env: Object.assign({}, ...configs.map((config) => config.env)),
    globals: Object.assign({}, ...configs.map((config) => config.globals)),
    ignorePatterns: union(configs.map((config) => config.ignorePatterns)),
    jsPlugins: union(configs.map((config) => config.jsPlugins)),
    overrides: configs.flatMap((config) => config.overrides ?? []),
    plugins: union(configs.map((config) => config.plugins)),
    rules: Object.assign({}, ...configs.map((config) => config.rules)),
    settings: mergeSettings(configs),
  };
  const present = new Set(configs.flatMap((config) => Object.keys(config)));
  return Object.fromEntries(
    Object.entries(merged).filter(([key]) => present.has(key)),
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function mergeSettings(configs: readonly OxlintConfig[]): Settings {
  const merged: Settings = {};
  for (const config of configs) {
    const entries = Object.entries(config.settings ?? {});
    for (const [key, value] of entries) {
      if (value === undefined) continue;
      const previous = merged[key];
      merged[key] =
        isRecord(previous) && isRecord(value)
          ? { ...previous, ...value }
          : value;
    }
  }
  return merged;
}

function union<T>(lists: readonly (null | readonly T[] | undefined)[]): T[] {
  return [...new Set(lists.flatMap((list) => list ?? []))];
}
