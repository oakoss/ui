import { demoModules } from 'virtual:demo-sources';

import {
  LazySource,
  lazySources,
  SourceBoundary,
} from '#/components/lazy-sources';

const sources = lazySources(demoModules);

export function DemoSource({ name }: { name: string }) {
  // An unknown name is an authoring mistake, so it fails the page rather than
  // the tab.
  if (!sources.has(name)) throw new Error(`no demo source for ${name}`);
  return (
    <SourceBoundary
      failedLabel="The code couldn’t be shown. Reload the page to try again."
      loadingLabel="Loading the code…"
    >
      <LazySource name={name} sources={sources} />
    </SourceBoundary>
  );
}
