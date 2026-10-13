export type ThemeOptions = {
  defaults: ThemeState;
  families: {
    id: string;
    name: string;
    primaries: { id: string; label: string; swatch: string }[];
    // The family's default primary.
    primary: string;
  }[];
  radii: { name: string; value: string }[];
};

export type ThemeState = { family: string; primary: string; radius: string };

export const themeStorageKey = 'oakoss-theme';

// app.css gives the preview radius to our components and the site radius
// to the rest of the page.
export function applyTheme(options: ThemeOptions, state: ThemeState): void {
  const root = document.documentElement;
  const value = (name: string) =>
    options.radii.find((radius) => radius.name === name)?.value ?? null;
  root.dataset.family = state.family;
  root.dataset.primary = state.primary;
  root.dataset.radius = state.radius;
  root.style.setProperty('--preview-radius', value(state.radius));
  root.style.setProperty('--site-radius', value(options.defaults.radius));
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

// URL parameters win over the stored choice and replace it. Once stored,
// they leave the address bar, so a reload keeps changes made in the panel.
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
  // The script runs again before hydration, so the parameters stay until the
  // theme is stored.
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    return;
  }
  for (const name of ['family', 'primary', 'radius']) params.delete(name);
  const query = params.toString();
  try {
    history.replaceState(
      history.state,
      '',
      `${location.pathname}${query === '' ? '' : `?${query}`}${location.hash}`,
    );
  } catch {
    // History can be blocked; the parameters stay in the URL.
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
    // Labels and swatches are only for the panel.
    JSON.stringify(options, (key, value: unknown) =>
      key === 'label' || key === 'swatch' ? undefined : value,
    ),
    JSON.stringify(themeStorageKey),
    pickTheme.toString(),
    applyTheme.toString(),
  ];
  return `(${startTheme.toString()})(${args.join(',')})`;
}
