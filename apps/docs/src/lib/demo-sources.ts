import path from 'node:path';

export const demos = path.join(import.meta.dirname, '../components/demos');

// The element a Code tab shows its demo's source in: pages load the source
// on open, and the .md and llms-full.txt output show it inline.
export const demoSource = 'DemoSource';

// A demo's source with the import paths an installed project uses.
export function demoCode(source: string) {
  return source.replaceAll("from '@oakoss/ui/", "from '#/");
}
