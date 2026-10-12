import { Component, lazy, type ReactNode, Suspense } from 'react';
import { sourceModules } from 'virtual:manual-sources';

import { CodePre } from '#/components/code-pre';

// One lazy component per registry file, made once so every page shares the
// module it loads. Nothing loads until a Manual tab renders the file.
const sources = new Map(
  Object.entries(sourceModules).map(([file, load]) => [file, lazy(load)]),
);

// A source that fails, such as a chunk a later deploy replaced, stays inside
// the tab instead of taking down the page. React still logs the error.
class SourcesBoundary extends Component<
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
        The files couldn’t be shown. Open each one on GitHub from the list
        above, or reload the page to try again.
      </p>
    );
  }
}

export function ManualSource({ file }: { file: string }) {
  const Source = sources.get(file);
  if (Source === undefined) throw new Error(`no manual source for ${file}`);
  // oxlint-disable-next-line react/static-components -- made once at module scope, so its identity never changes
  return <Source components={{ pre: CodePre }} />;
}

export function ManualSources({ children }: { children: ReactNode }) {
  return (
    <SourcesBoundary>
      <Suspense
        fallback={
          <p className="text-fd-muted-foreground">Loading the files…</p>
        }
      >
        {children}
      </Suspense>
    </SourcesBoundary>
  );
}
