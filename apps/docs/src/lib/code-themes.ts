// Shiki themes for code blocks and type tables. Every token color in these
// meets WCAG AA (4.5:1) on the theme's own background, which code blocks keep
// (mdx.tsx); Fumadocs' default github-light and github-dark don't.
export const codeThemes = {
  dark: 'github-dark-default',
  light: 'github-light-default',
} as const;
