import registry from '@oakoss/ui/registry.json' with { type: 'json' };
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type LazySourceEntry,
  lazySourcesPlugin,
} from './lazy-sources-plugin.ts';
import { isShownAsSource, targetPath } from './registry-paths.ts';

const ui = path.dirname(
  fileURLToPath(import.meta.resolve('@oakoss/ui/registry.json')),
);

// Every registry source file once, keyed by its path in packages/ui.
const files = new Map<string, LazySourceEntry>(
  registry.items.flatMap((item) =>
    (item.files ?? [])
      .filter((file) => isShownAsSource(file))
      .map((file) => [
        file.path,
        {
          file: path.join(ui, file.path),
          listedBy: `registry item "${item.name}"`,
          title: targetPath(file.target),
        },
      ]),
  ),
);

// The Manual tab's file sources. Pages then share one copy of each file
// instead of inlining every file they install.
export function manualSourcesPlugin() {
  return lazySourcesPlugin({
    exportName: 'sourceModules',
    id: 'manual-sources',
    sources: () => files,
  });
}
