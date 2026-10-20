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

export function ManualSources({ children }: { children: ReactNode }) {
  return (
    <SourceBoundary
      failedLabel="The files couldn’t be shown. Open each one on GitHub from the list above, or reload the page to try again."
      loadingLabel="Loading the files…"
    >
      {children}
    </SourceBoundary>
  );
}
