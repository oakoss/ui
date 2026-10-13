export type ThemeOptions = {
  defaults: ThemeState;
  families: {
    id: string;
    name: string;
    primaries: { id: string; swatch: string }[];
    // The family's default primary.
    primary: string;
  }[];
  radii: { name: string; value: string }[];
};

export type ThemeState = { family: string; primary: string; radius: string };

export const themeStorageKey = 'oakoss-theme';

export function applyTheme(options: ThemeOptions, state: ThemeState): void {
  const root = document.documentElement;
  const radius = options.radii.find(({ name }) => name === state.radius);
  root.dataset.family = state.family;
  root.dataset.primary = state.primary;
  root.dataset.radius = state.radius;
  root.style.setProperty('--radius', radius?.value ?? null);
}

/**
The first source naming a known family, with a primary or radius it doesn't
offer replaced by the default, or the defaults when none does.
*/
export function pickTheme(
  options: ThemeOptions,
  sources: readonly unknown[],
): ThemeState {
  for (const source of sources) {
    if (typeof source !== 'object' || source === null) continue;
    const family = 'family' in source ? source.family : undefined;
    const primary = 'primary' in source ? source.primary : undefined;
    const radius = 'radius' in source ? source.radius : undefined;
    const match = options.families.find(({ id }) => id === family);
    if (match === undefined) continue;
    return {
      family: match.id,
      primary:
        match.primaries.find(({ id }) => id === primary)?.id ?? match.primary,
      radius:
        options.radii.find(({ name }) => name === radius)?.name ??
        options.defaults.radius,
    };
  }
  return options.defaults;
}

// URL parameters win over the stored choice, and replace it.
export function startTheme(
  options: ThemeOptions,
  key: string,
  pick: typeof pickTheme,
  apply: typeof applyTheme,
): void {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.has('family') ? Object.fromEntries(params) : null;
  let stored: unknown = null;
  try {
    stored = JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    // Storage can be blocked; the URL or the defaults still apply.
  }
  const state = pick(options, [fromUrl, stored]);
  apply(options, state);
  if (fromUrl === null) return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // The theme still applies to this page.
  }
}

// The prerendered item that installs this theme.
export function themeItemPath({ family, primary, radius }: ThemeState): string {
  return `/r/themes/${family}-${primary}-${radius}.json`;
}

/**
An inline script that applies the theme before paint. It serializes
`startTheme`, `pickTheme` and `applyTheme` with `toString()`, so each one
uses only its arguments and browser globals.
*/
export function themeScript(options: ThemeOptions): string {
  const args = [
    // Swatches are only for the panel.
    JSON.stringify(options, (key, value: unknown) =>
      key === 'swatch' ? undefined : value,
    ),
    JSON.stringify(themeStorageKey),
    pickTheme.toString(),
    applyTheme.toString(),
  ];
  return `(${startTheme.toString()})(${args.join(',')})`;
}
