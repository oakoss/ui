import type { Plugin, Rollup } from 'vite';

import { existsSync, readFileSync } from 'node:fs';

import { highlightedModule } from './highlighted-module.ts';

export type LazySourceEntry = {
  // The absolute path of the file shown.
  file: string;
  // What lists the file, for the error when it's missing.
  listedBy: string;
  title?: string;
  transform?: (code: string) => string;
};

/**
Serves each source's highlighted code as its own module, and an index
module (`virtual:<id>`) exporting `exportName`: a lazy import per key. A tab
loads a source only when it opens, so pages share one copy of each instead
of inlining them.
*/
export function lazySourcesPlugin({
  exportName,
  id,
  sources,
}: {
  exportName: string;
  id: string;
  sources: () => Map<string, LazySourceEntry>;
}): Plugin {
  const indexId = `virtual:${id}`;
  const prefix = `${indexId}/`;
  return {
    load(this: Rollup.PluginContext, resolved: string) {
      if (resolved === `\0${indexId}`) {
        return index(exportName, prefix, sources().keys().toArray());
      }
      if (!resolved.startsWith(`\0${prefix}`)) return null;
      const key = resolved.slice(`\0${prefix}`.length);
      const entry = sources().get(key);
      if (entry === undefined) throw new Error(`no ${id} entry ${key}`);
      if (!existsSync(entry.file)) {
        throw new Error(`${entry.listedBy} lists ${key}, which doesn't exist`);
      }
      // Rebuilds the module, in dev and watch builds, when the file changes.
      this.addWatchFile(entry.file);
      const code = readFileSync(entry.file, 'utf-8');
      return highlightedModule(entry.transform?.(code) ?? code, entry.title);
    },
    name: `oakoss:${id}`,
    outputOptions: (options) => withSourceChunkNames(options, `\0${prefix}`),
    resolveId(source) {
      return source === indexId || source.startsWith(prefix)
        ? `\0${source}`
        : undefined;
    },
  };
}

function index(exportName: string, prefix: string, keys: string[]): string {
  const entries = keys.map(
    (key) =>
      `  ${JSON.stringify(key)}: () => import(${JSON.stringify(prefix + key)}),`,
  );
  return `export const ${exportName} = {\n${entries.join('\n')}\n};\n`;
}

// Names a source's chunk source-<file>-<hash>.js, so it can't be taken for
// the runtime chunk of a component file with the same name.
function withSourceChunkNames(
  options: Rollup.OutputOptions,
  sourceId: string,
): null | Rollup.OutputOptions {
  const { chunkFileNames } = options;
  if (chunkFileNames === undefined) return null;
  return {
    ...options,
    chunkFileNames: (chunk) => {
      const pattern =
        typeof chunkFileNames === 'function'
          ? chunkFileNames(chunk)
          : chunkFileNames;
      return chunk.facadeModuleId?.startsWith(sourceId) === true
        ? pattern.replace('[name]', 'source-[name]')
        : pattern;
    },
  };
}
