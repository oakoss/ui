import type {
  ChartRole,
  DerivedRole,
  IntentRoleKind,
  NeutralRole,
} from '#/roles';

export type TokenMeta = {
  deprecated?: string;
  description: string;
  // The token that replaces this one, so renames can be migrated.
  renamed?: string;
  usage?: string;
};

export const derivedRoleMeta = {
  ring: {
    description: 'Focus ring.',
    usage: 'Follows the primary fill, which passes 3:1 against the page.',
  },
  'sidebar-primary': { description: 'Primary fill inside the sidebar.' },
  'sidebar-primary-foreground': { description: 'Text on `sidebar-primary`.' },
  'sidebar-ring': { description: 'Focus ring inside the sidebar.' },
} as const satisfies Record<DerivedRole, TokenMeta>;

const chartUsage = 'Data series; a family chooses a ramp or categorical hues.';

export const chartRoleMeta = {
  'chart-1': { description: 'First chart series.', usage: chartUsage },
  'chart-2': { description: 'Second chart series.', usage: chartUsage },
  'chart-3': { description: 'Third chart series.', usage: chartUsage },
  'chart-4': { description: 'Fourth chart series.', usage: chartUsage },
  'chart-5': { description: 'Fifth chart series.', usage: chartUsage },
} as const satisfies Record<ChartRole, TokenMeta>;

export const neutralRoleMeta = {
  accent: {
    description: 'Subtle surface for hovered and highlighted items.',
    usage: 'Menu item hover, selected list row.',
  },
  'accent-foreground': { description: 'Text on `accent`.' },
  background: { description: 'The page background.' },
  border: {
    description: 'Dividers and decorative outlines.',
    usage: 'Not for the sole boundary of an interactive control.',
  },
  card: { description: 'Card surface.' },
  'card-foreground': { description: 'Text on `card`.' },
  foreground: { description: 'Default text on `background`.' },
  input: { description: 'Border of form controls.' },
  muted: { description: 'Muted surface for secondary content.' },
  'muted-foreground': {
    description: 'Secondary text, on `muted` or `background`.',
  },
  popover: { description: 'Popover, menu and dialog surface.' },
  'popover-foreground': { description: 'Text on `popover`.' },
  secondary: {
    description: 'Neutral fill for secondary actions.',
    usage: 'Stays neutral whichever primary is chosen.',
  },
  'secondary-foreground': { description: 'Text on `secondary`.' },
  sidebar: { description: 'Sidebar surface.' },
  'sidebar-accent': { description: 'Hovered item in the sidebar.' },
  'sidebar-accent-foreground': { description: 'Text on `sidebar-accent`.' },
  'sidebar-border': { description: 'Dividers inside the sidebar.' },
  'sidebar-foreground': { description: 'Text on `sidebar`.' },
} as const satisfies Record<NeutralRole, TokenMeta>;

export const intentRoleMeta = {
  border: {
    description: 'Tinted outline, for soft badges and alerts.',
    usage: 'Decorative; not a control boundary.',
  },
  fill: { description: 'Solid fill, such as a button background.' },
  foreground: { description: 'Text and icons on the solid fill.' },
  hover: { description: 'The solid fill when hovered or pressed.' },
  subtle: { description: 'Soft tinted background.' },
  text: {
    description: 'Intent-colored text on the page.',
    usage: 'Links, outline buttons, soft badges.',
  },
} as const satisfies Record<IntentRoleKind, TokenMeta>;
