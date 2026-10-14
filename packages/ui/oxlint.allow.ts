// Allow lists for shadcn/no-arbitrary-values, shared by the per-file
// overrides in oxlint.config.ts.

const intents = ['primary', 'destructive', 'success', 'warning', 'info'];
const roleSuffixes = [
  '',
  '-hover',
  '-subtle',
  '-border',
  '-text',
  '-foreground',
];
const intentColors = intents.flatMap((intent) =>
  roleSuffixes.map((s) => `${intent}${s}`),
);

// Lists each color because the plugin's `*` also matches `,#f00`, which would
// let a hardcoded fallback through.
export function colorVariables(prefix: string, neutralColors: string[] = []) {
  return [...intentColors, ...neutralColors].map(
    (color) => `[--${prefix}-*:var(--color-${color})]`,
  );
}

const selectionColors = [
  'ButtonText',
  'GrayText',
  'Highlight',
  'HighlightText',
];

// Forced colors repaint a selected control's fill as the page color, so each
// state takes a system color the mode keeps. A selected or current control
// opted out of forced colors sets its own focus outline color.
export const selectionStates = selectionColors.flatMap((color) => [
  ...['bg', 'border', 'text'].flatMap((property) => [
    `forced-colors:${property}-[${color}]`,
    `forced-colors:current:${property}-[${color}]`,
    `forced-colors:disabled:${property}-[${color}]`,
    `forced-colors:selected:${property}-[${color}]`,
    `forced-colors:selected:not-disabled:${property}-[${color}]`,
  ]),
  `forced-colors:current:focus-visible:outline-[${color}]`,
  `forced-colors:selected:focus-visible:outline-[${color}]`,
  `forced-colors:selected:not-disabled:focus-visible:outline-[${color}]`,
]);
