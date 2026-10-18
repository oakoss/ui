import type { Plugin } from 'vite';

/**
Serves values computed at build time as a module of plain data, so the
browser bundle doesn't load the token package that computes them.
*/
export function dataModulePlugin(
  id: string,
  values: () => Record<string, unknown>,
): Plugin {
  return {
    load(resolved) {
      if (resolved !== `\0${id}`) return null;
      return Object.entries(values())
        .map(
          ([name, value]) =>
            `export const ${name} = ${JSON.stringify(value)};\n`,
        )
        .join('');
    },
    name: `oakoss:${id}`,
    resolveId(source) {
      return source === id ? `\0${id}` : undefined;
    },
  };
}
