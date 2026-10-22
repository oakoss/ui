import type { ReactNode } from 'react';

import { sourceModules } from 'virtual:manual-sources';

import {
  LazySource,
  lazySources,
  SourceBoundary,
} from '#/components/lazy-sources';

const sources = lazySources(sourceModules);

export function ManualSource({ file }: { file: string }) {
  return <LazySource name={file} sources={sources} />;
}

// files: the paths its ManualSource children show, one per line.
export function ManualSources({
  children,
  files,
}: {
  children: ReactNode;
  files: string;
}) {
  // React renders the next lazy sibling only once the one before it loads,
  // so the files start loading together here instead of one by one.
  for (const file of files.split('\n')) void sources.get(file)?.load();
  return (
    <SourceBoundary
      failedLabel="The files couldn’t be shown. Open each one on GitHub from the list above, or reload the page to try again."
      loadingLabel="Loading the files…"
    >
      {children}
    </SourceBoundary>
  );
}
