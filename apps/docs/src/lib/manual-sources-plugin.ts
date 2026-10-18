import type { Plugin, Rollup } from 'vite';

import { compile } from '@mdx-js/mdx';
import registry from '@oakoss/ui/registry.json' with { type: 'json' };
import { rehypeCode } from 'fumadocs-core/mdx-plugins';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { codeThemes } from './code-themes.ts';
import { isShownAsSource, targetPath } from './registry-paths.ts';

const ui = path.dirname(
  fileURLToPath(import.meta.resolve('@oakoss/ui/registry.json')),
);

const indexId = 'virtual:manual-sources';
const sourcePrefix = 'virtual:manual-source/';

// Every registry source file once, keyed by its path in packages/ui.
const files = new Map(
  registry.items.flatMap((item) =>
    (item.files ?? [])
      .filter((file) => isShownAsSource(file))
      .map((file) => [
        file.path,
        { item: item.name, title: targetPath(file.target) },
      ]),
  ),
);

/**
Serves each registry file's highlighted source as its own module, which the
Manual tab loads on open. Pages then share one copy of each file instead of
inlining every file they install.
*/
export function manualSourcesPlugin(): Plugin {
  return {
    async load(this: Rollup.PluginContext, id: string) {
      if (id === `\0${indexId}`) return index();
      if (!id.startsWith(`\0${sourcePrefix}`)) return null;
      const file = id.slice(`\0${sourcePrefix}`.length);
      const entry = files.get(file);
      if (entry === undefined) throw new Error(`no registry file ${file}`);
      const source = path.join(ui, file);
      if (!existsSync(source)) {
        throw new Error(
          `registry item "${entry.item}" lists ${file}, which doesn't exist`,
        );
      }
      // Rebuilds the module, in dev and watch builds, when the file changes.
      this.addWatchFile(source);
      const markdown = fence(readFileSync(source, 'utf-8'), entry.title);
      const compiled = await compile(markdown, {
        rehypePlugins: [[rehypeCode, { themes: codeThemes }]],
      });
      return String(compiled);
    },
    name: 'oakoss:manual-sources',
    resolveId(id) {
      return id === indexId || id.startsWith(sourcePrefix)
        ? `\0${id}`
        : undefined;
    },
  };
}

// A fenced block whose fence is longer than any backtick run in the code.
function fence(code: string, title: string): string {
  const longest = Math.max(
    2,
    ...(code.match(/`+/gu) ?? []).map((run) => run.length),
  );
  const ticks = '`'.repeat(longest + 1);
  return `${ticks}tsx title="${title}"\n${code}\n${ticks}\n`;
}

function index(): string {
  const entries = files
    .keys()
    .map(
      (file) =>
        `  ${JSON.stringify(file)}: () => import(${JSON.stringify(sourcePrefix + file)}),`,
    )
    .toArray();
  return `export const sourceModules = {\n${entries.join('\n')}\n};\n`;
}
