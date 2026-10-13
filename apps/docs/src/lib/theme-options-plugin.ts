import type { Plugin } from 'vite';

import { themeOptions } from './theme-items.ts';

const id = 'virtual:theme-options';

/**
Serves the theme panel's choices as data, so the browser bundle doesn't
load the token package that computes them.
*/
export function themeOptionsPlugin(): Plugin {
  return {
    load(resolved) {
      if (resolved !== `\0${id}`) return null;
      return `export const themeOptions = ${JSON.stringify(themeOptions())};\n`;
    },
    name: 'oakoss:theme-options',
    resolveId(source) {
      return source === id ? `\0${id}` : undefined;
    },
  };
}
