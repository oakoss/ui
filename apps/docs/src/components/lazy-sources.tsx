import type { MDXContent } from 'mdx/types';

import {
  Component,
  lazy,
  type LazyExoticComponent,
  type ReactNode,
  Suspense,
} from 'react';

import { CodePre } from '#/components/code-pre';

type SourceModule = { default: MDXContent };

type Sources = Map<
  string,
  {
    Component: LazyExoticComponent<MDXContent>;
    load: () => Promise<SourceModule>;
  }
>;

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
  const Source = sources.get(name)?.Component;
  if (Source === undefined) throw new Error(`no source for ${name}`);
  return <Source components={{ pre: CodePre }} />;
}

// One lazy component per source, made once so every page shares the module
// it loads. Nothing loads until a tab renders it or calls its load.
export function lazySources(
  modules: Record<string, () => Promise<SourceModule>>,
): Sources {
  return new Map(
    Object.entries(modules).map(([key, importSource]) => {
      let loading: Promise<SourceModule> | undefined;
      const load = () => {
        if (loading === undefined) {
          loading = importSource();
          void markHandled(loading);
        }
        return loading;
      };
      return [key, { Component: lazy(load), load }];
    }),
  );
}

async function markHandled(loading: Promise<SourceModule>) {
  try {
    await loading;
  } catch {
    // SourceBoundary reports the files React renders; one it never reaches
    // would otherwise surface as an uncaught rejection.
  }
}
