import type { MDXContent } from 'mdx/types';

import {
  Component,
  lazy,
  type LazyExoticComponent,
  type ReactNode,
  Suspense,
} from 'react';

import { CodePre } from '#/components/code-pre';

type Sources = Map<string, LazyExoticComponent<MDXContent>>;

// A source that fails, such as a chunk a later deploy replaced, stays inside
// the tab instead of taking down the page. React still logs the error.
export class SourceBoundary extends Component<
  { children: ReactNode; failedLabel: ReactNode; loadingLabel: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    const { children, failedLabel, loadingLabel } = this.props;
    if (this.state.failed) {
      return (
        <p className="text-fd-muted-foreground" role="alert">
          {failedLabel}
        </p>
      );
    }
    return (
      <Suspense
        fallback={<p className="text-fd-muted-foreground">{loadingLabel}</p>}
      >
        {children}
      </Suspense>
    );
  }
}

export function LazySource({
  name,
  sources,
}: {
  name: string;
  sources: Sources;
}) {
  const Source = sources.get(name);
  if (Source === undefined) throw new Error(`no source for ${name}`);
  // oxlint-disable-next-line react/static-components -- made once at module scope, so its identity never changes
  return <Source components={{ pre: CodePre }} />;
}

// One lazy component per source, made once so every page shares the module
// it loads. Nothing loads until a tab renders it.
export function lazySources(
  modules: Record<string, () => Promise<{ default: MDXContent }>>,
): Sources {
  return new Map(
    Object.entries(modules).map(([key, load]) => [key, lazy(load)]),
  );
}
