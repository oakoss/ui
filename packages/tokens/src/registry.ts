import type { Family } from '#/family';
import type { Style } from '#/style';
import type { Typography } from '#/typography';

import {
  type Declarations,
  fieldColor,
  formatColor,
  resolved,
  styleDeclarations,
  typographyDeclarations,
  zIndexDeclarations,
} from '#/css';
import { type ThemeTokens } from '#/theme';

export type CssVars = {
  dark: Record<string, string>;
  light: Record<string, string>;
  theme: Record<string, string>;
};

/**
 * The default theme as a shadcn `registry:theme` item's `cssVars`. shadcn
 * writes `light` to `:root` and `dark` to `.dark`, bridging only literal
 * colors to `--color-*`, so values are resolved rather than `var()` aliases.
 * It would also bridge other `light` values to themselves, so only `radius`,
 * which it expands into the radius scale, joins the colors there.
 */
export function registryCssVars(
  family: Family,
  style: Style,
  typography: Typography,
): CssVars {
  const light = resolved(family, 'light');
  const dark = resolved(family, 'dark');
  const styleVars = styleDeclarations(style);
  return {
    dark: { field: fieldColor(style, 'dark', dark), ...colors(dark) },
    light: {
      ...unprefix(styleVars.root.filter((entry) => isRadius(entry))),
      field: fieldColor(style, 'light', light),
      ...colors(light),
    },
    theme: {
      'color-field': 'var(--field)',
      ...unprefix(styleVars.root.filter((entry) => !isRadius(entry))),
      ...unprefix(zIndexDeclarations()),
      ...unprefix(styleVars.theme),
      ...unprefix(typographyDeclarations(typography)),
    },
  };
}

function colors(tokens: ThemeTokens): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, color]) => [name, formatColor(color)]),
  );
}

function isRadius([name]: readonly [string, string]): boolean {
  return name === '--radius';
}

// Registry keys omit the leading `--`.
function unprefix(declarations: Declarations): Record<string, string> {
  return Object.fromEntries(
    declarations.map(([name, value]) => [name.slice(2), value]),
  );
}
