import { defineTypography } from '#/typography';

const sans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

/**
Tailwind's font stacks and its type scale up to `4xl` (`theme.css`).
*/
export const defaultTypography = defineTypography({
  fonts: {
    heading: sans,
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    sans,
  },
  id: 'default',
  name: 'Default',
  scale: {
    '2xl': { lineHeight: 'calc(2 / 1.5)', size: '1.5rem' },
    '3xl': { lineHeight: 'calc(2.25 / 1.875)', size: '1.875rem' },
    '4xl': { lineHeight: 'calc(2.5 / 2.25)', size: '2.25rem' },
    base: { lineHeight: 'calc(1.5 / 1)', size: '1rem' },
    lg: { lineHeight: 'calc(1.75 / 1.125)', size: '1.125rem' },
    sm: { lineHeight: 'calc(1.25 / 0.875)', size: '0.875rem' },
    xl: { lineHeight: 'calc(1.75 / 1.25)', size: '1.25rem' },
    xs: { lineHeight: 'calc(1 / 0.75)', size: '0.75rem' },
  },
});
