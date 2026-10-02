// Emitted as plain variables: Tailwind v4 has no z-index namespace.
export const zIndex = {
  dropdown: 1000,
  modal: 1300,
  overlay: 1200,
  popover: 1400,
  sticky: 1100,
  toast: 1500,
} as const;

export type Layer = keyof typeof zIndex;
