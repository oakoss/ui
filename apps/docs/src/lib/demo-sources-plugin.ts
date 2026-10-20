import type { Plugin, Rollup } from 'vite';

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { demoCode, demos } from './demo-sources.ts';
import { highlightedModule } from './manual-sources-plugin.ts';

const indexId = 'virtual:demo-sources';
const sourcePrefix = 'virtual:demo-source/';

/**
Serves each demo's highlighted source as its own module, which a Code tab
loads on open, so a page with several examples doesn't inline them all.
*/
export function demoSourcesPlugin(): Plugin {
  return {
    load(this: Rollup.PluginContext, id: string) {
      if (id === `\0${indexId}`) return index();
      if (!id.startsWith(`\0${sourcePrefix}`)) return null;
      const source = path.join(
        demos,
        `${id.slice(`\0${sourcePrefix}`.length)}.tsx`,
      );
      this.addWatchFile(source);
      return highlightedModule(demoCode(readFileSync(source, 'utf-8')));
    },
    name: 'oakoss:demo-sources',
    resolveId(id) {
      return id === indexId || id.startsWith(sourcePrefix)
        ? `\0${id}`
        : undefined;
    },
  };
}

function index(): string {
  const entries = readdirSync(demos)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => {
      const name = file.slice(0, -'.tsx'.length);
      return `  ${JSON.stringify(name)}: () => import(${JSON.stringify(sourcePrefix + name)}),`;
    });
  return `export const demoModules = {\n${entries.join('\n')}\n};\n`;
}
