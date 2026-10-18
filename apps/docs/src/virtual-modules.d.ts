declare module 'virtual:theme-options' {
  import type { ThemeOptions } from '#/lib/theme-state';

  export const themeOptions: ThemeOptions;
}

declare module 'virtual:token-reference' {
  import type { TokenReference } from '#/lib/token-reference-types';

  export const tokenReference: TokenReference;
}

declare module 'virtual:manual-sources' {
  import type { MDXContent } from 'mdx/types';

  // Each registry file's highlighted source, keyed by its path in packages/ui.
  export const sourceModules: Record<
    string,
    () => Promise<{ default: MDXContent }>
  >;
}
