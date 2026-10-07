// Emitted as plain variables: Tailwind v4 has no z-index namespace. Toast sits
// below popover, so a menu opened from a toast's action renders above it.
export const zIndex = {
  modal: 1300,
  overlay: 1200,
  popover: 1400,
  sticky: 1100,
  toast: 1350,
  tooltip: 1600,
} as const;

export type Layer = keyof typeof zIndex;
