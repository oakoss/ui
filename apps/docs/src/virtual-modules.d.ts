declare module 'virtual:manual-sources' {
  import type { MDXContent } from 'mdx/types';

  // Each registry file's highlighted source, keyed by its path in packages/ui.
  export const sourceModules: Record<
    string,
    () => Promise<{ default: MDXContent }>
  >;
}
