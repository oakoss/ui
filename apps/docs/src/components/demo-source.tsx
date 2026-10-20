import { Component, lazy, type ReactNode, Suspense } from 'react';
import { demoModules } from 'virtual:demo-sources';

import { CodePre } from '#/components/code-pre';

// One lazy component per demo, made once so every page shares the module it
// loads. Nothing loads until a Code tab renders it.
const sources = new Map(
  Object.entries(demoModules).map(([name, load]) => [name, lazy(load)]),
);

// A source that fails, such as a chunk a later deploy replaced, stays inside
// the tab instead of taking down the page. React still logs the error.
class SourceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <p className="text-fd-muted-foreground" role="alert">
        The code couldn’t be shown. Reload the page to try again.
      </p>
    );
  }
}

export function DemoSource({ name }: { name: string }) {
  const Source = sources.get(name);
  if (Source === undefined) throw new Error(`no demo source for ${name}`);
  return (
    <SourceBoundary>
      <Suspense
        fallback={<p className="text-fd-muted-foreground">Loading the code…</p>}
      >
        {/* oxlint-disable-next-line react/static-components -- made once at module scope, so its identity never changes */}
        <Source components={{ pre: CodePre }} />
      </Suspense>
    </SourceBoundary>
  );
}
