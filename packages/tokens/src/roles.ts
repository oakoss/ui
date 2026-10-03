// Mapped by hand per flavor; intent roles are generated instead.
export const neutralRoles = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'border',
  'input',
  'sidebar',
  'sidebar-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
] as const;

export type NeutralRole = (typeof neutralRoles)[number];

export const intents = [
  'primary',
  'destructive',
  'success',
  'warning',
  'info',
] as const;

export type Intent = (typeof intents)[number];

// The generator picks each kind's step per flavor.
export const intentRoleKinds = [
  'fill',
  'hover',
  'subtle',
  'border',
  'text',
  'foreground',
] as const;

export type IntentRole =
  | `${Intent}-${Exclude<IntentRoleKind, 'fill'>}`
  | Intent;

export type IntentRoleKind = (typeof intentRoleKinds)[number];

export const derivedRoleNames = [
  'ring',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-ring',
] as const;

export type DerivedRole = (typeof derivedRoleNames)[number];

// shadcn roles that follow another role rather than mapping to a primitive.
// Rings follow primary-text: the primary fill only has to pass 3:1 against
// the page, and fails it on dark cards and popovers.
export const derivedRoles = {
  ring: 'primary-text',
  'sidebar-primary': 'primary',
  'sidebar-primary-foreground': 'primary-foreground',
  'sidebar-ring': 'primary-text',
} as const satisfies Record<DerivedRole, IntentRole>;

export const chartRoles = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const;

export type ChartRole = (typeof chartRoles)[number];

export type Role = ChartRole | DerivedRole | IntentRole | NeutralRole;

export function intentRole(intent: Intent, kind: IntentRoleKind): IntentRole {
  return kind === 'fill' ? intent : `${intent}-${kind}`;
}

export const allRoles: readonly Role[] = [
  ...neutralRoles,
  ...intents.flatMap((intent) =>
    intentRoleKinds.map((kind) => intentRole(intent, kind)),
  ),
  ...derivedRoleNames,
  ...chartRoles,
];

/**
 * - `text`: 4.5:1 (WCAG 2.2 SC 1.4.3)
 * - `non-text`: 3:1 for boundaries, fills and focus rings (SC 1.4.11)
 * - `decorative`: no requirement
 */
export type ContrastKind = 'decorative' | 'non-text' | 'text';

export type ContrastPair = {
  background: Role;
  foreground: Role;
  kind: ContrastKind;
};

export const contrastMinimum = {
  decorative: 0,
  'non-text': 3,
  text: 4.5,
} as const satisfies Record<ContrastKind, number>;

const neutralTextRoles: readonly (readonly [
  foreground: NeutralRole,
  background: NeutralRole,
])[] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'background'],
  ['accent-foreground', 'accent'],
  ['sidebar-foreground', 'sidebar'],
  ['sidebar-accent-foreground', 'sidebar-accent'],
];

const neutralTextPairs: readonly ContrastPair[] = neutralTextRoles.map(
  ([foreground, background]) => ({ background, foreground, kind: 'text' }),
);

const intentPairs: readonly ContrastPair[] = intents.flatMap((intent) => [
  {
    background: intent,
    foreground: intentRole(intent, 'foreground'),
    kind: 'text',
  },
  {
    background: intentRole(intent, 'hover'),
    foreground: intentRole(intent, 'foreground'),
    kind: 'text',
  },
  {
    background: 'background',
    foreground: intentRole(intent, 'text'),
    kind: 'text',
  },
  {
    background: intentRole(intent, 'subtle'),
    foreground: intentRole(intent, 'text'),
    kind: 'text',
  },
  { background: 'background', foreground: intent, kind: 'non-text' },
  {
    background: 'background',
    foreground: intentRole(intent, 'border'),
    kind: 'decorative',
  },
]);

const ringPairs: readonly ContrastPair[] = [
  ...(['background', 'card', 'popover'] as const).map(
    (background): ContrastPair => ({
      background,
      foreground: 'ring',
      kind: 'non-text',
    }),
  ),
  { background: 'sidebar', foreground: 'sidebar-ring', kind: 'non-text' },
];

export const contrastPairs: readonly ContrastPair[] = [
  ...neutralTextPairs,
  ...intentPairs,
  ...ringPairs,
  { background: 'background', foreground: 'border', kind: 'decorative' },
];

// Colors a component swaps on hover, which only help if people see the change:
// a solid fill darkens, and soft and ghost buttons gain their intent's border.
export const distinctMinimum = 2;

export type DistinctPair = readonly [from: Role, to: Role];

export const distinctPairs: readonly DistinctPair[] = intents.flatMap(
  (intent): DistinctPair[] => [
    [intent, intentRole(intent, 'hover')],
    [intentRole(intent, 'subtle'), intentRole(intent, 'border')],
    ['background', intentRole(intent, 'border')],
  ],
);
