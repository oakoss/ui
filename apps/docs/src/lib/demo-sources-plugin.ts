import { readdirSync } from 'node:fs';
import path from 'node:path';

import { demoCode, demos } from './demo-sources.ts';
import { lazySourcesPlugin } from './lazy-sources-plugin.ts';

// Each demo's Code tab source, so a page with several examples doesn't
// inline them all.
export function demoSourcesPlugin() {
  return lazySourcesPlugin({
    exportName: 'demoModules',
    id: 'demo-sources',
    sources: () =>
      new Map(
        readdirSync(demos)
          .filter((file) => file.endsWith('.tsx'))
          .map((file) => [
            file.slice(0, -'.tsx'.length),
            {
              file: path.join(demos, file),
              listedBy: 'the demos folder',
              transform: demoCode,
            },
          ]),
      ),
  });
}
